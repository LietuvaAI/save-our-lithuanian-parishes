/**
 * verify-dispatch-mirror.mjs
 *
 * `content/dispatches/` is a MIRROR of the live Hearth blog, not an independent
 * copy. This guard is what makes that claim checkable.
 *
 * Default (offline) — safe for `npm run data` and CI, no network:
 *   - every archive has well-formed frontmatter (title, date, substackUrl, archivedAt)
 *   - filename `YYYY-MM-DD-<slug>.md` agrees with the frontmatter date and substackUrl slug
 *   - no archive exists for a post listed in retired.json
 *   - no archive links to a retired post's /p/ URL
 *   - no duplicate slugs
 *
 * `--live` — the real mirror comparison, hits the Substack API:
 *   - the set of archived slugs equals the set of published slugs
 *   - title and subtitle match
 *   - normalized body text matches, so a silently-reverted or hand-edited
 *     archive is caught instead of discovered by accident
 *
 * Why this exists: on 2026-08-08 a day of archive edits was reported as merged
 * but only a fraction reached `main` (PR #162 carried 4 of its branch's 16
 * commits). The archives sat wrong for a day and were found by chance. Drift is
 * cheap to detect and should never again depend on someone noticing.
 *
 * Repair is always the same: regenerate from the live blog. Never hand-merge.
 */
import { readFileSync, readdirSync } from "node:fs";

const DIR = new URL("../content/dispatches/", import.meta.url);
const BLOG = "https://blog.saveourlithuanianparishes.org";
const live = process.argv.includes("--live");

const errors = [];
const notes = [];

const retiredDoc = JSON.parse(readFileSync(new URL("retired.json", DIR), "utf8"));
const retired = new Map(retiredDoc.retired.map((r) => [r.slug, r]));

const files = readdirSync(DIR).filter((f) => f.endsWith(".md") && f !== "README.md");

function parseFrontmatter(text, file) {
  if (!text.startsWith("---\n")) {
    errors.push(`${file}: missing frontmatter block`);
    return null;
  }
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) {
    errors.push(`${file}: unterminated frontmatter block`);
    return null;
  }
  const fm = {};
  for (const line of text.slice(4, end).split("\n")) {
    const m = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"') && v.length > 1) {
      v = v.slice(1, -1).replace(/\\"/g, '"');
    }
    fm[m[1]] = v;
  }
  return { fm, body: text.slice(end + 5) };
}

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  mdash: "\u2014", ndash: "\u2013", hellip: "\u2026", middot: "\u00b7",
  rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"',
};

/**
 * Collapse markdown or HTML down to comparable plain text.
 *
 * Both sides must land on the same string, so this decodes entities before
 * stripping tags (otherwise `&amp;` disappears where markdown keeps a literal
 * `&`), and closes the gap tag-stripping opens in front of punctuation
 * (`<a>x</a>.` becomes `x .`, while markdown `[x](u).` becomes `x.`).
 */
function normalize(s) {
  return s
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? " ")
    .replace(/&#(\d+);/g, (m, code) => String.fromCodePoint(Number(code)))
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    // URLs may contain parens (Wikipedia titles), so match one nesting level.
    .replace(/\[([^\]]*)\]\((?:[^()]|\([^()]*\))*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, " ")
    .replace(/[*_`>#-]/g, " ")
    .replace(/[\u00a0\u2009\u202f]/g, " ")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?)\]])/g, "$1")
    .replace(/([([])\s+/g, "$1")
    .trim()
    .toLowerCase()
    // Substack injects a subscribe CTA into body_html; the archiver drops it.
    .replace(/thanks for reading [^!]{0,80}! subscribe for free[^.]{0,120}\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const archives = new Map();

for (const file of files) {
  const raw = readFileSync(new URL(file, DIR), "utf8");
  const parsed = parseFrontmatter(raw, file);
  if (!parsed) continue;
  const { fm, body } = parsed;

  for (const key of ["title", "date", "substackUrl", "archivedAt"]) {
    if (!fm[key]) errors.push(`${file}: frontmatter missing \`${key}\``);
  }

  const urlSlug = (fm.substackUrl || "").split("/p/")[1]?.replace(/\/$/, "");
  const nameMatch = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  if (!nameMatch) {
    errors.push(`${file}: filename must be YYYY-MM-DD-<slug>.md`);
  } else {
    const [, fileDate, fileSlug] = nameMatch;
    if (fm.date && fm.date !== fileDate) {
      errors.push(`${file}: filename date ${fileDate} ≠ frontmatter date ${fm.date}`);
    }
    if (urlSlug && urlSlug !== fileSlug) {
      errors.push(`${file}: filename slug "${fileSlug}" ≠ substackUrl slug "${urlSlug}"`);
    }
  }

  if (urlSlug) {
    if (retired.has(urlSlug)) {
      errors.push(
        `${file}: archive exists for RETIRED post "${urlSlug}" (unpublished ${retired.get(urlSlug).unpublished}) — delete it`,
      );
    }
    if (archives.has(urlSlug)) errors.push(`duplicate archive for slug "${urlSlug}"`);
    archives.set(urlSlug, { file, fm, body });
  }

  for (const [slug, r] of retired) {
    if (body.includes(`/p/${slug}`)) {
      errors.push(`${file}: links to retired post "${slug}" (${r.title})`);
    }
  }
}

if (!live) {
  notes.push(`checked ${archives.size} archives offline; run with --live to compare against the blog`);
} else {
  // The archive API rejects limit > 50, so page through it.
  const PAGE = 50;
  const posts = [];
  let offset = 0;
  let apiFailed = false;
  for (;;) {
    const res = await fetch(`${BLOG}/api/v1/archive?sort=new&limit=${PAGE}&offset=${offset}`);
    if (!res.ok) {
      errors.push(`live: archive API returned HTTP ${res.status} at offset ${offset}`);
      apiFailed = true;
      break;
    }
    const page = await res.json();
    posts.push(...page);
    if (page.length < PAGE) break;
    offset += PAGE;
  }
  if (!apiFailed) {
    const liveSlugs = new Set(posts.map((p) => p.slug));

    for (const slug of liveSlugs) {
      if (!archives.has(slug)) errors.push(`live: published post "${slug}" has no archive — regenerate`);
      if (retired.has(slug)) {
        errors.push(`live: "${slug}" is listed as retired but is published — retired.json is stale`);
      }
    }
    for (const slug of archives.keys()) {
      if (!liveSlugs.has(slug)) {
        errors.push(`live: archive "${slug}" is not published — delete it, or add it to retired.json`);
      }
    }

    for (const slug of liveSlugs) {
      const a = archives.get(slug);
      if (!a) continue;
      const r = await fetch(`${BLOG}/api/v1/posts/${slug}`);
      if (!r.ok) {
        errors.push(`live: post API for "${slug}" returned HTTP ${r.status}`);
        continue;
      }
      const post = await r.json();
      if ((post.title || "") !== (a.fm.title || "")) {
        errors.push(`live: "${slug}" title drift\n    live:    ${post.title}\n    archive: ${a.fm.title}`);
      }
      if ((post.subtitle || "") !== (a.fm.subtitle || "")) {
        errors.push(`live: "${slug}" subtitle drift\n    live:    ${post.subtitle}\n    archive: ${a.fm.subtitle}`);
      }
      const liveText = normalize(post.body_html || "");
      const archText = normalize(a.body);
      if (liveText !== archText) {
        let i = 0;
        while (i < liveText.length && i < archText.length && liveText[i] === archText[i]) i += 1;
        errors.push(
          `live: "${slug}" body drift at char ${i}\n` +
            `    live:    …${liveText.slice(Math.max(0, i - 40), i + 60)}\n` +
            `    archive: …${archText.slice(Math.max(0, i - 40), i + 60)}`,
        );
      }
    }
    notes.push(`compared ${archives.size} archives against ${liveSlugs.size} published posts`);
  }
}

for (const n of notes) console.log(`verify-dispatch-mirror: ${n}`);

if (errors.length) {
  console.error(`\nverify-dispatch-mirror: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    `\nRepair by regenerating the affected archives from the live blog ` +
      `(/api/v1/archive + /api/v1/posts/<slug>); content/dispatches is a mirror, not a source.\n`,
  );
  process.exit(1);
}

console.log("verify-dispatch-mirror: OK");
