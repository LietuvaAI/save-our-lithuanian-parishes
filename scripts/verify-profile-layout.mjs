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
const worshipSitesSource = fs.readFileSync(
  path.join(ROOT, "components", "ProfileWorshipSites.tsx"),
  "utf8",
);
const relatedRecordsSource = fs.readFileSync(
  path.join(ROOT, "components", "ProfileRelatedRecords.tsx"),
  "utf8",
);
const contextMapSource = fs.readFileSync(
  path.join(ROOT, "components", "ParishContextMap.tsx"),
  "utf8",
);
const ledgerSource = fs.readFileSync(
  path.join(ROOT, "components", "ProfileSourceLedger.tsx"),
  "utf8",
);
const graphSource = fs.readFileSync(
  path.join(ROOT, "lib", "parish-record-graph.ts"),
  "utf8",
);
const profileSourcesSource = fs.readFileSync(
  path.join(ROOT, "lib", "profile-sources.ts"),
  "utf8",
);
const publication = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "data", "canonical-publication-projection.json"),
    "utf8",
  ),
);
const infographic = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "data", "canonical-infographic-projection.json"),
    "utf8",
  ),
);
const comparatorCount = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "parishes.json"), "utf8"),
).filter((parish) => parish.comparator && !parish.mergedInto).length;

const errors = [];

// Canonical profile order, v2. Identity carries status, facts, and the dek;
// history, chronology, buildings, relationships, present condition, evidence,
// corrections follow. docs/design-system-profile.md §5.
const orderedMarkers = [
  { id: "profile-identity", marker: 'id="profile-identity"', source: pageSource },
  { id: "profile-history", marker: "<ParishPublishedRecord", source: pageSource },
  {
    id: "parish-chronology",
    marker: "<ParishProfileChronology",
    source: pageSource,
  },
  { id: "worship-sites", marker: "<ProfileWorshipSites", source: pageSource },
  {
    id: "related-records",
    marker: "<ProfileRelatedRecords",
    source: pageSource,
  },
  {
    id: "present-condition",
    marker: 'id="present-condition"',
    source: pageSource,
  },
  { id: "evidence-sources", marker: "<ProfileSourceLedger", source: pageSource },
  {
    id: "profile-corrections",
    marker: 'id="profile-corrections"',
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
  [pageSource, 'data-profile-layout="canonical-v2"', "layout version"],
  [
    pageSource,
    "fallbackNarrative={profileView.historyFallback}",
    "history fallback",
  ],
  [pageSource, "items={profileView.chronology}", "normalized chronology"],
  [historySource, 'id="profile-history"', "history section id"],
  [chronologySource, 'id="parish-chronology"', "chronology section id"],
  [worshipSitesSource, 'id="worship-sites"', "worship sites section id"],
  [
    worshipSitesSource,
    "grid min-w-0",
    "worship-site mobile width containment",
  ],
  [worshipSitesSource, "site.milestones.map", "worship-site milestone list"],
  [relatedRecordsSource, 'id="related-records"', "related records section id"],
  [ledgerSource, 'id="evidence-sources"', "evidence section id"],
  [
    pageSource,
    "canonicalArtifactProfileSources(",
    "canonical source-artifact ledger adapter",
  ],
  [
    profileSourcesSource,
    "artifact.rights?.public_url",
    "canonical public-source URL resolution",
  ],
  // A building event must be distinguishable from an institutional one.
  [chronologySource, "Worship site", "building-event tag"],
  // Unresolved founding years are shown as unresolved, never estimated.
  [pageSource, "foundedUnresolved", "unresolved founding treatment"],
  [
    pageSource,
    "const foundedYear = institutionDates",
    "canonical institutional founding date",
  ],
  [
    pageSource,
    '"No current parish church"',
    "closed-institution current-church treatment",
  ],
  [pageSource, "survivedReviewThenClosed", "survived-review warning"],
  [pageSource, 'href="/report"', "profile correction route"],
  [
    graphSource,
    'edge.publication_state === "publishable"',
    "publishable continuity-edge filter",
  ],
  [
    graphSource,
    "getInfographicInstitutionByEntityId",
    "entity-id profile resolution",
  ],
  [graphSource, "CONDITION_PRECEDENCE", "worship-site outcome precedence"],
  [
    contextMapSource,
    'className="min-w-0 max-w-full overflow-hidden"',
    "compact-map overflow containment",
  ],
];

for (const [source, fragment, label] of requiredFragments) {
  if (!source.includes(fragment)) errors.push(`missing ${label}`);
}

// Research narration stays in the research record and About the Data.
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

// Status is stated once. The identity strip owns it; nothing else repeats it.
if (pageSource.includes("<EndStatePill")) {
  errors.push("status is stated twice: EndStatePill alongside the identity strip");
}
if (pageSource.includes('id="profile-facts"')) {
  errors.push('superseded section present: "At a glance" (profile-facts)');
}
if (pageSource.includes('href="/contribute"')) {
  errors.push("profile correction CTA points to nonexistent /contribute route");
}
if (pageSource.includes("const foundedYear = scoped.founded")) {
  errors.push("profile narrative bypasses canonical institutional dates");
}

const divineProvidence = publication.public_institutions.find(
  (institution) => institution.registry_slug === "providence-southfield-mi",
);
const divineProvidenceHistoryId =
  "src:divine-providence:parish-history-book:1973";
const divineProvidenceHistory = publication.source_artifacts.find(
  (source) => source.id === divineProvidenceHistoryId,
);
if (!divineProvidence?.source_artifact_ids.includes(divineProvidenceHistoryId)) {
  errors.push("Divine Providence profile is missing its 1973 parish-history source");
}
if (
  divineProvidenceHistory?.rights?.public_url !==
  "https://archyvas.ziburioltmokykla.org/item/20260331_1774920079895"
) {
  errors.push("Divine Providence parish history lacks its public archive URL");
}

const stGeorgeSite = infographic.building_site_history.find(
  (site) =>
    site.culturenet_entity_id ===
    "cn:building_site:st-george-detroit-westminster-cardoni-site",
);
const stGeorgeMilestones = new Map(
  (stGeorgeSite?.milestones ?? []).map((milestone) => [
    milestone.event,
    milestone.date,
  ]),
);
for (const [event, date] of [
  ["wooden_church_built", "1908"],
  ["wooden_church_blessed", "1909"],
  ["brick_church_construction_began", "1916"],
  ["brick_church_blessed", "1917"],
  ["brick_church_demolished", "1966-02-04"],
]) {
  if (stGeorgeMilestones.get(event) !== date) {
    errors.push(`St. George Detroit site milestone drifted: ${event}`);
  }
}

const relationshipTypes = [
  ...new Set(
    infographic.continuity_edges.map((edge) => edge.relationship_type),
  ),
].sort();
const mappedRelationshipTypes = [
  "congregation/canonical-life-continued-in",
  "institution-merged-into-institution",
  "institution-originated-from-institution",
  "institution-renamed-as-same-entity",
  "institution-succeeded-by-institution",
];
if (JSON.stringify(relationshipTypes) !== JSON.stringify(mappedRelationshipTypes)) {
  errors.push(
    `continuity relationship vocabulary changed: ${relationshipTypes.join(", ")}`,
  );
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
  `OK: canonical profile layout v2 \u2014 ${orderedMarkers.length} ordered sections across ${publication.counts.public_us_institutions} U.S. institution profiles and ${comparatorCount} Canadian comparators; ${caseRecordCount} public case-record overlays.`,
);
