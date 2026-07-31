import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const pageSource = fs.readFileSync(
  path.join(ROOT, "app", "parishes", "[slug]", "page.tsx"),
  "utf8",
);
const historySource = fs.readFileSync(
  path.join(ROOT, "components", "ParishResearchRecord.tsx"),
  "utf8",
);
const chronologySource = fs.readFileSync(
  path.join(ROOT, "components", "ParishProfileChronology.tsx"),
  "utf8",
);
const ledgerSource = fs.readFileSync(
  path.join(ROOT, "components", "ProfileSourceLedger.tsx"),
  "utf8",
);
const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "registry-unified.json"), "utf8"),
).parishes;

const errors = [];
const orderedMarkers = [
  {
    id: "profile-overview",
    marker: 'id="profile-overview"',
    source: pageSource,
  },
  {
    id: "profile-history",
    marker: "<ParishPublishedRecord",
    source: pageSource,
  },
  {
    id: "profile-facts",
    marker: 'id="profile-facts"',
    source: pageSource,
  },
  {
    id: "parish-chronology",
    marker: "<ParishProfileChronology",
    source: pageSource,
  },
  {
    id: "present-condition",
    marker: 'id="present-condition"',
    source: pageSource,
  },
  {
    id: "place-and-jurisdiction",
    marker: 'id="place-and-jurisdiction"',
    source: pageSource,
  },
  {
    id: "profile-corrections",
    marker: 'id="profile-corrections"',
    source: pageSource,
  },
  {
    id: "evidence-sources",
    marker: "<ProfileSourceLedger",
    source: pageSource,
  },
];

let previousIndex = -1;
for (const section of orderedMarkers) {
  const index = section.source.indexOf(section.marker);
  if (index === -1) {
    errors.push(`missing canonical profile section: ${section.id}`);
    continue;
  }
  if (index <= previousIndex) {
    errors.push(`canonical profile section is out of order: ${section.id}`);
  }
  previousIndex = index;
}

const requiredFragments = [
  [pageSource, 'data-profile-layout="canonical-v1"', "layout version"],
  [
    pageSource,
    "fallbackNarrative={profileView.historyFallback}",
    "history fallback",
  ],
  [
    pageSource,
    "items={profileView.chronology}",
    "normalized chronology",
  ],
  [historySource, 'id="profile-history"', "history section id"],
  [chronologySource, 'id="parish-chronology"', "chronology section id"],
  [ledgerSource, 'id="evidence-sources"', "evidence section id"],
];

for (const [source, fragment, label] of requiredFragments) {
  if (!source.includes(fragment)) errors.push(`missing ${label}`);
}

for (const forbidden of [
  "caseRecord.gaps",
  "What we could not yet establish",
  "The trail of events",
  "The verified record",
]) {
  if (pageSource.includes(forbidden)) {
    errors.push(`internal or superseded profile language is public: ${forbidden}`);
  }
}

if (errors.length > 0) {
  console.error("Profile layout validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const caseRecordCount = fs
  .readdirSync(path.join(ROOT, "data", "case-records"))
  .filter((file) => file.endsWith(".json")).length;

console.log(
  `OK: canonical profile layout — ${orderedMarkers.length} ordered sections, ${registry.length} registry profiles, ${caseRecordCount} case records.`,
);
