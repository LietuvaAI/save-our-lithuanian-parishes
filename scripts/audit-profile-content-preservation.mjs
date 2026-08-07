import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};

const baselineRoot = option("--baseline");
const currentRoot = option("--current");
const outputPath = option("--output");

if (!baselineRoot || !currentRoot) {
  throw new Error(
    "Usage: node scripts/audit-profile-content-preservation.mjs " +
      "--baseline <app/parishes build directory> --current <directory> " +
      "[--output <json path>]",
  );
}

const SECTION_IDS = [
  "profile-history",
  "present-condition",
  "parish-chronology",
  "worship-sites",
  "evidence-sources",
];

const decodeEntities = (value) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#([0-9]+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'");

function visibleText(html) {
  return decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function sectionHtml(html, id) {
  const start = html.indexOf(`<section id="${id}"`);
  if (start < 0) return "";
  const end = html.indexOf("</section>", start);
  return end < 0 ? html.slice(start) : html.slice(start, end + 10);
}

function words(text) {
  return text.match(/[\p{L}\p{N}][\p{L}\p{N}’'’-]*/gu)?.length ?? 0;
}

function metrics(html) {
  return Object.fromEntries(
    SECTION_IDS.map((id) => {
      const section = sectionHtml(html, id);
      const text = visibleText(section);
      return [
        id,
        {
          text,
          words: words(text),
          paragraphs: section.match(/<p\b/gi)?.length ?? 0,
          links: section.match(/<a\b/gi)?.length ?? 0,
        },
      ];
    }),
  );
}

function loadProfiles(root) {
  const directory = resolve(root);
  return new Map(
    readdirSync(directory)
      .filter((name) => name.endsWith(".html"))
      .map((name) => {
        const slug = basename(name, ".html");
        return [slug, metrics(readFileSync(resolve(directory, name), "utf8"))];
      }),
  );
}

function comparison(baseline, current) {
  const deltaWords = current.words - baseline.words;
  const ratio = baseline.words === 0 ? null : current.words / baseline.words;
  const state =
    current.words === 0 && baseline.words > 0
      ? "missing"
      : ratio !== null && ratio < 0.8 && deltaWords <= -20
        ? "regressed"
        : current.text === baseline.text
          ? "unchanged"
          : deltaWords >= 0
            ? "changed_or_expanded"
            : "changed";
  return { baseline, current, deltaWords, ratio, state };
}

const baseline = loadProfiles(baselineRoot);
const current = loadProfiles(currentRoot);
const slugs = [...new Set([...baseline.keys(), ...current.keys()])].sort();
const profiles = slugs.map((slug) => {
  const baselineProfile = baseline.get(slug) ?? {};
  const currentProfile = current.get(slug) ?? {};
  return {
    slug,
    routeState: baseline.has(slug)
      ? current.has(slug)
        ? "shared"
        : "removed"
      : "added",
    sections: Object.fromEntries(
      SECTION_IDS.map((id) => [
        id,
        comparison(
          baselineProfile[id] ?? { text: "", words: 0, paragraphs: 0, links: 0 },
          currentProfile[id] ?? { text: "", words: 0, paragraphs: 0, links: 0 },
        ),
      ]),
    ),
  };
});

const countState = (id, state) =>
  profiles.filter((profile) => profile.sections[id].state === state).length;

const report = {
  schema: "solp-profile-content-preservation-audit.v1",
  baselineRoot: resolve(baselineRoot),
  currentRoot: resolve(currentRoot),
  counts: {
    baselineProfiles: baseline.size,
    currentProfiles: current.size,
    sharedProfiles: profiles.filter((profile) => profile.routeState === "shared").length,
    removedProfiles: profiles.filter((profile) => profile.routeState === "removed").length,
    addedProfiles: profiles.filter((profile) => profile.routeState === "added").length,
    historyRegressed: countState("profile-history", "regressed"),
    historyMissing: countState("profile-history", "missing"),
    presentConditionRegressed: countState("present-condition", "regressed"),
    presentConditionMissing: countState("present-condition", "missing"),
  },
  profiles,
};

if (outputPath) {
  writeFileSync(resolve(outputPath), `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report.counts, null, 2));
for (const profile of profiles) {
  const history = profile.sections["profile-history"];
  const present = profile.sections["present-condition"];
  if (
    profile.routeState !== "shared" ||
    ["missing", "regressed"].includes(history.state) ||
    ["missing", "regressed"].includes(present.state)
  ) {
    console.log(
      [
        profile.slug,
        `route=${profile.routeState}`,
        `history=${history.baseline.words}->${history.current.words} (${history.state})`,
        `present=${present.baseline.words}->${present.current.words} (${present.state})`,
      ].join("\t"),
    );
  }
}
