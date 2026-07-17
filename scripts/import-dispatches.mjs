// Archives the Substack dispatches into content/dispatches/ — one markdown
// file per post, so the campaign's writing is version-controlled here and
// not only on Substack. Idempotent: existing files are skipped (pass --force
// to re-import everything). Substack remains the publishing surface; this
// is the copy-of-record.
//
// Usage: node scripts/import-dispatches.mjs [--force]
import { writeFileSync, existsSync, mkdirSync } from "node:fs";

const BLOG = "https://blog.saveourlithuanianparishes.org";
const OUT_DIR = new URL("../content/dispatches/", import.meta.url);
const FORCE = process.argv.includes("--force");

mkdirSync(OUT_DIR, { recursive: true });

/** Minimal Substack-HTML → markdown. Substack body_html is regular enough
 * that a tag-by-tag pass covers the content types we publish. */
function htmlToMd(html) {
  let s = html;
  // Strip Substack chrome that doesn't belong in an archive.
  s = s.replace(/<div class="subscription-widget[\s\S]*?<\/div><\/form><\/div>/g, "");
  s = s.replace(/<div class="captioned-image-container[\s\S]*?(<img[^>]*>)[\s\S]*?<\/div>/g, "$1");
  // Blocks.
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g, (_, n, t) => `\n${"#".repeat(+n + 1)} ${t.trim()}\n`);
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, (_, t) =>
    "\n" + t.trim().split(/\n+/).map((l) => `> ${l}`).join("\n") + "\n");
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_, t) => `- ${t.trim()}\n`);
  s = s.replace(/<\/?[uo]l[^>]*>/g, "\n");
  s = s.replace(/<hr[^>]*>/g, "\n---\n");
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/g, (_, t) => `\n${t.trim()}\n`);
  // Inline.
  s = s.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, t) => `[${t.trim()}](${href})`);
  s = s.replace(/<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>/g, "**$1**");
  s = s.replace(/<(?:em|i)>([\s\S]*?)<\/(?:em|i)>/g, "*$1*");
  s = s.replace(/<img[^>]*src="([^"]*)"[^>]*>/g, "![]($1)");
  s = s.replace(/<br[^>]*>/g, "\n");
  // Leftover tags + entities.
  s = s.replace(/<[^>]+>/g, "");
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&quot;|&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…");
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

const res = await fetch(`${BLOG}/api/v1/archive?sort=new&limit=50`, {
  headers: { "User-Agent": "SaveOurLithuanianParishes archive sync" },
});
if (!res.ok) throw new Error(`archive fetch failed: ${res.status}`);
const posts = await res.json();
console.log(`${posts.length} posts on the blog`);

let imported = 0;
for (const meta of posts) {
  const date = meta.post_date.slice(0, 10);
  const file = new URL(`${date}-${meta.slug}.md`, OUT_DIR);
  if (existsSync(file) && !FORCE) {
    console.log(`  skip (exists): ${date}-${meta.slug}.md`);
    continue;
  }
  const pr = await fetch(`${BLOG}/api/v1/posts/${meta.slug}`, {
    headers: { "User-Agent": "SaveOurLithuanianParishes archive sync" },
  });
  if (!pr.ok) throw new Error(`post fetch failed for ${meta.slug}: ${pr.status}`);
  const post = await pr.json();

  const fm = [
    "---",
    `title: ${JSON.stringify(post.title)}`,
    ...(post.subtitle ? [`subtitle: ${JSON.stringify(post.subtitle)}`] : []),
    `date: ${date}`,
    `substackUrl: ${BLOG}/p/${post.slug}`,
    `archivedAt: ${new Date().toISOString().slice(0, 10)}`,
    "---",
    "",
  ].join("\n");

  writeFileSync(file, fm + htmlToMd(post.body_html) + "\n");
  console.log(`  wrote: ${date}-${meta.slug}.md`);
  imported++;
  await new Promise((r) => setTimeout(r, 400));
}
console.log(`OK: ${imported} imported, ${posts.length - imported} already archived.`);
