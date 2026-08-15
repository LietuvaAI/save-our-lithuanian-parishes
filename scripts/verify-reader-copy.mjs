import { existsSync, readFileSync } from "node:fs";

const files = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/parishes/page.tsx",
  "app/parishes/[slug]/page.tsx",
  "app/history/page.tsx",
  "app/history/two-waves-across-a-century/page.tsx",
  "app/history/parishes-alive-year-by-year/page.tsx",
  "app/history/loss-by-diocese/page.tsx",
  "app/pennsylvania-coal-region/page.tsx",
  "app/by-diocese/page.tsx",
  "app/start-here/page.tsx",
  "app/what-canon-law-says/page.tsx",
  "app/protestant/page.tsx",
  "app/national-catholic/page.tsx",
  "components/HistoryDioceseLoss.tsx",
  "components/ParishMap.tsx",
  "components/ParishProfileChronology.tsx",
  "components/ParishThreads.tsx",
  "lib/parish-profile-view.ts",
  "lib/profile-sources.ts",
  "lib/status-copy.ts",
  "data/canonical-current-events-projection.json",
];

const processFirstPhrases = [
  "the research record holds",
  "attested in the research record",
  "the record does not yet establish",
  "full research record",
  "accepted present-condition assertion",
  "open research task",
  "registry revision",
  "situations the project is tracking",
  "this project documents their situations",
  "canonical projection {revision}",
  "every line and figure derives from the canonical culturenet projection",
  "every figure below is derived from projection",
  "compiled {db.generated} from the parish-preservation research record",
  "basic profile — evidence remains limited",
  "source image: jonas žilius",
];

const errors = [];
for (const file of files) {
  const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8").toLowerCase();
  for (const phrase of processFirstPhrases) {
    if (text.includes(phrase)) errors.push(`${file}: process-first copy remains: “${phrase}”`);
  }
}

const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");

const homepage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const parishMap = readFileSync(
  new URL("../components/ParishMap.tsx", import.meta.url),
  "utf8",
);
if (homepage.includes("Still standing")) {
  errors.push(
    "app/page.tsx: living institutions must not use the physical-building label Still standing",
  );
}
if (!homepage.includes("Parishes at a crossroads")) {
  errors.push("app/page.tsx: approved current-situations heading drifted");
}
if (!homepage.includes('id="happening-now"')) {
  errors.push("app/page.tsx: current-situations anchor is missing");
}
if (parishMap.includes("See current campaigns and developments")) {
  errors.push("components/ParishMap.tsx: map instructions still contain a campaign link");
}
if (
  !parishMap.includes("function resetFilters()") ||
  !parishMap.includes("Reset filters")
) {
  errors.push("components/ParishMap.tsx: map key is missing its filter reset");
}
const expectedNavOrder = [
  'href: "/parishes", label: "All Profiles"',
  'label: "Explore"',
  'section: "The record"',
  'href: "/where-every-parish-ended-up"',
  'label: "Where Every Parish Stands"',
  'href: "/lithuanian-catholic-life-today"',
  'label: "The Living Network"',
  'href: "/where-parish-life-continued"',
  'label: "Where Parish Life Continued"',
  'section: "History"',
  'href: "/history", label: "The Rise and the Loss"',
  'href: "/pennsylvania-coal-region"',
  'label: "Pennsylvania Coal Region"',
  'href: "/history/loss-by-diocese", label: "By Diocese"',
  'section: "Other traditions"',
  'href: "/national-catholic"',
  'label: "National & Independent Catholic"',
  'href: "/protestant", label: "Protestant"',
  'label: "Guidance"',
  'label: "About"',
  'href: "https://blog.saveourlithuanianparishes.org", label: "Židinys ↗"',
];
let previousNavPosition = -1;
for (const navFragment of expectedNavOrder) {
  const position = layout.indexOf(navFragment, previousNavPosition + 1);
  if (position === -1) {
    errors.push(`app/layout.tsx: missing or misordered navigation item ${navFragment}`);
    break;
  }
  previousNavPosition = position;
}
if (layout.includes("/canadian-comparators")) {
  errors.push("app/layout.tsx: Canadian comparators returned to public navigation");
}
if (existsSync(new URL("../app/canadian-comparators/page.tsx", import.meta.url))) {
  errors.push("app/canadian-comparators/page.tsx: retired public route returned");
}
const nextConfig = readFileSync(
  new URL("../next.config.ts", import.meta.url),
  "utf8",
);
if (
  !nextConfig.includes('source: "/canadian-comparators"') ||
  !nextConfig.includes('destination: "/parishes"')
) {
  errors.push("next.config.ts: retired Canadian route must redirect to U.S. profiles");
}

const directory = readFileSync(
  new URL("../components/AllProfilesDirectory.tsx", import.meta.url),
  "utf8",
);
for (const institutionClass of [
  "roman_catholic",
  "national_catholic_pncc",
  "independent_catholic",
  "non_catholic_christian",
]) {
  if (!directory.includes(`value: "${institutionClass}"`)) {
    errors.push(
      `components/AllProfilesDirectory.tsx: missing public tradition section ${institutionClass}`,
    );
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`OK: neutral reader copy guard passed across ${files.length} public source files.`);
