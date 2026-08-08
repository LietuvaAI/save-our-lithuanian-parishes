import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_ROOTS = ["app", "components"];
const FORBIDDEN_FRAMEWORK_STEPS =
  /\b(?:(?:sm|md|lg|xl):)?text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\b/g;
const FORBIDDEN_ARBITRARY_PIXEL_STEPS =
  /\btext-\[(?:\d+(?:\.\d+)?px|clamp\([^\]]+\))\]/g;
const REQUIRED_THEME_TOKENS = [
  "--text-masthead-title: 26px",
  "--text-outcomes-title: clamp(26px, 3vw, 34px)",
  "--text-lead-copy: 15px",
  "--text-compact-heading: 16px",
  "--text-page-title: 28px",
  "--text-section-title: 22px",
  "--text-subsection-title: 17px",
  "--text-card-title: 15.5px",
  "--text-body-copy: 13.5px",
  "--text-support-copy: 12.5px",
  "--text-small-copy: 11.5px",
  "--text-ui-label: 11px",
  '--font-mono: var(--font-timeline-mono), "IBM Plex Mono"',
  ':where(h1, h2, h3, h4, h5, h6)',
];

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(resolved);
    return entry.isFile() && resolved.endsWith(".tsx") ? [resolved] : [];
  });
}

const errors = [];
const globals = fs.readFileSync(path.join(ROOT, "app", "globals.css"), "utf8");
for (const token of REQUIRED_THEME_TOKENS) {
  if (!globals.includes(token)) errors.push(`app/globals.css: missing ${token}`);
}

for (const relativeRoot of SOURCE_ROOTS) {
  for (const file of sourceFiles(path.join(ROOT, relativeRoot))) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(FORBIDDEN_FRAMEWORK_STEPS)) {
      const line = source.slice(0, match.index).split("\n").length;
      errors.push(
        `${path.relative(ROOT, file)}:${line}: uses framework size ${match[0]}; use the shared editorial ramp`,
      );
    }
    for (const match of source.matchAll(FORBIDDEN_ARBITRARY_PIXEL_STEPS)) {
      const line = source.slice(0, match.index).split("\n").length;
      errors.push(
        `${path.relative(ROOT, file)}:${line}: uses one-off size ${match[0]}; use a named editorial token`,
      );
    }
  }
}

const typographySurfaces = [
  ["components/ParishThreads.tsx", [
    "font-mono text-ui-label",
    "font-sans text-body-copy",
    "font-serif text-card-title",
  ]],
  ["components/PhysicalSiteFlow.tsx", [
    "font-mono text-ui-label",
    "font-sans text-body-copy",
    "font-serif text-card-title",
  ]],
  ["components/HistoryAliveCurve.tsx", [
    "font-mono text-ui-label",
    "font-sans text-ui-label",
  ]],
  ["components/HistoryTwoWaves.tsx", [
    "font-mono text-ui-label",
    "font-sans text-ui-label",
  ]],
  ["components/HistoryDioceseLoss.tsx", [
    "font-mono text-ui-label",
    "font-sans text-ui-label",
    "font-serif text-card-title",
  ]],
];
for (const [file, requiredFragments] of typographySurfaces) {
  const source = fs.readFileSync(path.join(ROOT, file), "utf8");
  if (/fontSize=/.test(source)) {
    errors.push(`${file}: bypasses the shared ramp with an inline SVG font size`);
  }
  for (const fragment of requiredFragments) {
    if (!source.includes(fragment)) {
      errors.push(`${file}: missing shared typography role ${fragment}`);
    }
  }
}

for (const file of [
  "components/NationalRecordGraphic.tsx",
  "components/HistoryDioceseLoss.tsx",
  "components/CurrentLifeFactSheet.tsx",
]) {
  const source = fs.readFileSync(path.join(ROOT, file), "utf8");
  if (/fontFamily="(?:Arial|Georgia)/.test(source)) {
    errors.push(`${file}: uses a raw font family instead of the site font variables`);
  }
}

const profilesPage = fs.readFileSync(
  path.join(ROOT, "app", "parishes", "page.tsx"),
  "utf8",
);
const profilesTimeline = fs.readFileSync(
  path.join(ROOT, "components", "AllProfilesTimeline.tsx"),
  "utf8",
);
const allProfilesContract = [
  [profilesPage, "pb-10 pt-[22px]", "compact 22px page header"],
  [profilesPage, "text-page-title", "28px shared page title"],
  [profilesPage, "text-body-copy", "13.5px one-line description"],
  [profilesTimeline, "py-[9px]", "compact sticky toolbar"],
  [profilesTimeline, "text-small-copy text-muted", "11.5px status key"],
  [profilesTimeline, "font-mono text-small-copy", "IBM Plex Mono A–Z index"],
  [profilesTimeline, "index * 20", "uncluttered 20-year timeline ticks"],
  [profilesTimeline, "min-h-11", "compact profile lanes"],
  [profilesTimeline, "font-serif text-body-copy", "13.5px profile lane names"],
  [profilesTimeline, "h-1 -translate-y-1/2", "compact four-pixel lifespan bars"],
  [profilesTimeline, "block truncate", "single-line profile lane titles"],
];
for (const [source, fragment, label] of allProfilesContract) {
  if (!source.includes(fragment)) errors.push(`All Profiles: missing ${label}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("OK: shared typography ramp and All Profiles presentation contract passed.");
