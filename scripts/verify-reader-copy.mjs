import { readFileSync } from "node:fs";

const files = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/parishes/page.tsx",
  "app/parishes/[slug]/page.tsx",
  "app/history/page.tsx",
  "app/by-diocese/page.tsx",
  "app/start-here/page.tsx",
  "app/what-canon-law-says/page.tsx",
  "app/protestant/page.tsx",
  "app/national-catholic/page.tsx",
  "app/canadian-comparators/page.tsx",
  "components/DioceseClosureRanking.tsx",
  "components/DioceseMap.tsx",
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
];

const errors = [];
for (const file of files) {
  const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8").toLowerCase();
  for (const phrase of processFirstPhrases) {
    if (text.includes(phrase)) errors.push(`${file}: process-first copy remains: “${phrase}”`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`OK: neutral reader copy guard passed across ${files.length} public source files.`);
