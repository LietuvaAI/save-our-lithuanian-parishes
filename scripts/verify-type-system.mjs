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
  "--text-directory-section: 19px",
  "--text-directory-empty: 20px",
  "--text-directory-control: 14px",
  "--text-directory-description: 13px",
  "--text-directory-footnote: 12px",
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
const profilesDirectory = fs.readFileSync(
  path.join(ROOT, "components", "AllProfilesDirectory.tsx"),
  "utf8",
);
const allProfilesContract = [
  [profilesPage, "pb-10 pt-[22px]", "compact 22px page header"],
  [profilesPage, "max-w-[1180px]", "approved directory width"],
  [profilesPage, "text-page-title", "28px shared page title"],
  [profilesPage, "text-body-copy", "13.5px one-line description"],
  [profilesDirectory, "mt-[14px]", "approved toolbar offset"],
  [profilesDirectory, "pb-[9px] pt-[10px]", "compact sticky toolbar"],
  [profilesDirectory, "size-[23px]", "compact A–Z index"],
  [profilesDirectory, "pb-1.5 pt-[22px]", "compact section rhythm"],
  [profilesDirectory, "text-directory-section", "19px category headings"],
  [profilesDirectory, "gap-x-7 pt-1.5", "28px directory grid and six-pixel inset"],
  [profilesDirectory, "gap-[9px]", "nine-pixel entry gap"],
  [profilesDirectory, "px-2 py-2", "eight-pixel entry padding"],
  [profilesDirectory, "text-body-copy font-semibold", "13.5px sans profile names"],
  [profilesDirectory, "text-small-copy", "11.5px place line"],
  [profilesDirectory, "font-mono text-ui-label", "11px mono year labels"],
];
for (const [source, fragment, label] of allProfilesContract) {
  if (!source.includes(fragment)) errors.push(`All Profiles: missing ${label}`);
}

const historyPage = fs.readFileSync(
  path.join(ROOT, "app", "history", "page.tsx"),
  "utf8",
);
const historyTwoWavesPage = fs.readFileSync(
  path.join(
    ROOT,
    "app",
    "history",
    "two-waves-across-a-century",
    "page.tsx",
  ),
  "utf8",
);
const historyAlivePage = fs.readFileSync(
  path.join(
    ROOT,
    "app",
    "history",
    "parishes-alive-year-by-year",
    "page.tsx",
  ),
  "utf8",
);
const historyDiocesePage = fs.readFileSync(
  path.join(ROOT, "app", "history", "loss-by-diocese", "page.tsx"),
  "utf8",
);
const historyCoalPage = fs.readFileSync(
  path.join(ROOT, "app", "pennsylvania-coal-region", "page.tsx"),
  "utf8",
);
const historyChart = fs.readFileSync(
  path.join(ROOT, "components", "HistoryTwoWaves.tsx"),
  "utf8",
);
const historyCurve = fs.readFileSync(
  path.join(ROOT, "components", "HistoryAliveCurve.tsx"),
  "utf8",
);
const historyDioceseMap = fs.readFileSync(
  path.join(ROOT, "components", "HistoryDioceseLoss.tsx"),
  "utf8",
);
const historyDesignContract = [
  [historyPage, "px-4 pb-0 pt-8", "single bottom-spacing rhythm before the global footer"],
  [historyPage, "History · 1880s to today", "History overview description"],
  [historyPage, "Pennsylvania Coal Country", "Coal Country history page"],
  [historyPage, "Two Waves Across a Century", "Two Waves history page"],
  [historyPage, "Lithuanian Parishes Alive, Year by Year", "year-by-year history page"],
  [historyPage, "The Loss, Diocese by Diocese", "diocese history page"],
  [historyCoalPage, "Origins in Pennsylvania", "Coal Country subject marker"],
  [historyTwoWavesPage, "Foundations and closures", "Two Waves subject marker"],
  [historyAlivePage, "Institutional life over time", "year-by-year subject marker"],
  [historyDiocesePage, "Geography of loss", "diocese subject marker"],
  [historyAlivePage, "leading-[1.7]", "15px/1.7 narrative rhythm"],
  [historyDiocesePage, "dioceses have", "approved diocese-loss heading"],
  [historyDiocesePage, "Each diocese below is shaded", "approved diocese-map instruction"],
  [historyDiocesePage, "text-[var(--es-closed)]", "loss-color diocese heading"],
  [historyChart, "size-2 rounded-[1px]", "compact eight-pixel unit marks"],
  [historyChart, "gap-x-[3px]", "compact decade spacing"],
  [historyChart, "min-h-[118px]", "approved founding-wave height"],
  [historyChart, "min-h-[74px]", "approved closure-wave height"],
  [historyAlivePage, "parishes={historyProjection.parishes}", "canonical parish roster supplied to the curve"],
  [historyCurve, "View the full parish list", "year-roster affordance"],
  [historyCurve, 'role="dialog"', "accessible year-roster dialog"],
  [historyCurve, "aliveRoster.map", "complete selected-year roster"],
  [historyDioceseMap, "When each diocese lost its parishes", "approved diocese-timeline heading"],
  [historyDioceseMap, "color-mix(in srgb, var(--es-active)", "proportional green-to-yellow loss ramp"],
  [historyDioceseMap, "color-mix(in srgb, var(--mark-community)", "proportional yellow-to-red loss ramp"],
  [historyDioceseMap, "parish.endedYear == null", "undated endings assigned to Today"],
  [historyDioceseMap, "linear-gradient(to right, var(--es-active), var(--mark-community), var(--es-closed))", "loss-ramp legend"],
];
for (const [source, fragment, label] of historyDesignContract) {
  if (!source.includes(fragment)) errors.push(`History: missing ${label}`);
}
for (const source of [
  historyPage,
  historyCoalPage,
  historyTwoWavesPage,
  historyAlivePage,
  historyDiocesePage,
]) {
  if (/\bchapter\b/i.test(source)) {
    errors.push("History: chapter framing returned to a public History page");
    break;
  }
}
for (const source of [
  historyPage,
  historyCoalPage,
  historyTwoWavesPage,
  historyAlivePage,
  historyDiocesePage,
]) {
  if (source.includes("HistoryNav")) {
    errors.push("History: chapter-style navigation returned to a standalone page");
    break;
  }
}
for (const forbiddenHeading of [
  "From expansion to long contraction",
  "The national contraction was administered locally",
]) {
  if (
    [
      historyPage,
      historyTwoWavesPage,
      historyAlivePage,
      historyDiocesePage,
      historyCoalPage,
    ].some((page) => page.includes(forbiddenHeading))
  ) {
    errors.push(`History: unapproved replacement heading remains: ${forbiddenHeading}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("OK: shared typography ramp, All Profiles, and History presentation contracts passed.");
