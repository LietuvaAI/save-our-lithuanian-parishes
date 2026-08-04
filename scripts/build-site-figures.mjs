// Build the public figure contract used by every aggregate site surface.
//
// CultureNet's publication projection defines the public U.S. institution
// population. The site registry and generated map layers may enrich those
// identities, but they may not change membership or totals.
import { readFileSync, writeFileSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));

const registry = read("registry-unified.json");
const projection = read("canonical-publication-projection.json");
const infographic = read("canonical-infographic-projection.json");
const revisions = read("registry-revisions.json");
const context = read("context-points.json");
const map = read("map.json");
const registryMap = read("registry-map.json");
const publicInstitutionLedger = read("public-institution-ledger.json");
const reversals = read("reversal-database.json");

const count = (records, predicate) => records.filter(predicate).length;
const tally = (records, keyOf) =>
  Object.fromEntries(
    [...records.reduce((result, record) => {
      const key = keyOf(record);
      result.set(key, (result.get(key) ?? 0) + 1);
      return result;
    }, new Map())].sort(([a], [b]) => a.localeCompare(b)),
  );

const errors = [];
const expect = (label, actual, expected) => {
  if (actual !== expected) errors.push(`${label}: ${actual} != ${expected}`);
};
const expectSum = (label, total, parts) =>
  expect(label, parts.reduce((sum, value) => sum + value, 0), total);

const records = registry.parishes;
const registryBySlug = new Map(records.map((record) => [record.slug, record]));
const usPublic = projection.public_institutions.map((institution) => {
  const record = registryBySlug.get(institution.registry_slug);
  if (!record) {
    throw new Error(`${institution.registry_slug}: missing site display record`);
  }
  return { ...institution, display: record };
});
const independentlySupported = usPublic.filter(
  (record) => record.identity_support !== "single_source_attested",
);
const singleSourceAttested = usPublic.filter(
  (record) => record.identity_support === "single_source_attested",
);
const usRomanCatholicParishes = usPublic.filter(
  (record) =>
    record.record_type === "parish" &&
    record.institution_class === "roman_catholic",
);
const usRomanCatholicMissions = usPublic.filter(
  (record) =>
    record.record_type === "misija" &&
    record.institution_class === "roman_catholic",
);
const usNationalIndependent = usPublic.filter(
  (record) =>
    record.institution_class === "national_catholic_pncc" ||
    record.institution_class === "independent_catholic",
);
const usProtestant = usPublic.filter(
  (record) => record.institution_class === "non_catholic_christian",
);

const contextPoints = context.points;
const usRomanCatholicParishPoints = contextPoints.filter(
  (point) =>
    point.recordType === "parish" &&
    point.congregationClass === "roman_catholic",
);
const publicStatus = tally(contextPoints, (point) => point.group);
const institutionHistory = infographic.institution_history;
const network = infographic.current_pastoral_network?.directory;
if (!network) {
  throw new Error(
    "Canonical infographic projection lacks current_pastoral_network.directory",
  );
}
const romanCatholicParishHistory = institutionHistory.filter(
  (row) =>
    row.record_type === "parish" &&
    row.institution_class === "roman_catholic",
);
const romanCatholicMissionHistory = institutionHistory.filter(
  (row) =>
    row.record_type === "misija" &&
    row.institution_class === "roman_catholic",
);
const romanCatholicInstitutionHistory = [
  ...romanCatholicParishHistory,
  ...romanCatholicMissionHistory,
];
const historyStatus = tally(
  romanCatholicParishHistory,
  (row) => row.status_group,
);
const romanCatholicInstitutionStatus = tally(
  romanCatholicInstitutionHistory,
  (row) => row.status_group,
);
const closedParishes = romanCatholicParishHistory.filter(
  (row) => row.status_group === "closed",
);
const topClosureDioceses = Object.entries(
  tally(closedParishes, (row) => row.diocese ?? "Unassigned"),
)
  .sort(([nameA, countA], [nameB, countB]) =>
    countB - countA || nameA.localeCompare(nameB),
  )
  .slice(0, 2)
  .map(([diocese, closed]) => ({ diocese, closed }));

const canadianComparators = infographic.comparators.canada;
const coalRegion = infographic.regional_views.pennsylvania_coal_region;

const currentWorshipClasses = new Set([
  "active_parish",
  "active_mission",
  "mass_continues",
]);
const currentWorship = network.entries.filter((entry) =>
  currentWorshipClasses.has(entry.networkClass),
);
const latestRevision = revisions.revisions.at(-1);
const registryMapUS = registryMap.points.filter(
  (point) => point.country === "US",
).length;

expect("registry counts.records", registry.counts.records, records.length);
expect(
  "canonical publication count",
  projection.public_institutions.length,
  projection.counts.public_us_institutions,
);
expect(
  "public institution ledger authority",
  publicInstitutionLedger.authority.contentHash,
  projection.content_hash,
);
expect(
  "public institution ledger count",
  publicInstitutionLedger.counts.publicUSInstitutions,
  usPublic.length,
);
expect(
  "latest revision registry count",
  latestRevision.registryRecords,
  records.length,
);
expect("public U.S. context points", contextPoints.length, usPublic.length);
expect(
  "Roman Catholic parish context points",
  usRomanCatholicParishPoints.length,
  usRomanCatholicParishes.length,
);
expect(
  "canonical infographic institution count",
  institutionHistory.length,
  usPublic.length,
);
expect(
  "canonical infographic publication authority",
  infographic.authority.publication_projection_hash,
  projection.content_hash,
);
expect(
  "canonical Roman Catholic parish history",
  romanCatholicParishHistory.length,
  usRomanCatholicParishes.length,
);
expect(
  "canonical Roman Catholic mission history",
  romanCatholicMissionHistory.length,
  usRomanCatholicMissions.length,
);
expect(
  "canonical Roman Catholic parish and mission history",
  romanCatholicInstitutionHistory.length,
  usRomanCatholicParishes.length + usRomanCatholicMissions.length,
);
expectSum("public U.S. class/type partition", usPublic.length, [
  usRomanCatholicParishes.length,
  usRomanCatholicMissions.length,
  usNationalIndependent.length,
  usProtestant.length,
]);
expectSum(
  "public U.S. status partition",
  usPublic.length,
  Object.values(publicStatus),
);
expectSum(
  "Roman Catholic parish status partition",
  usRomanCatholicParishes.length,
  Object.values(historyStatus),
);
expect(
  "public U.S. map partition",
  map.points.length + registryMapUS,
  usPublic.length,
);
expect(
  "current worship composition",
  currentWorship.length,
  network.counts.activeParishes +
    network.counts.activeMissions +
    network.counts.massContinues,
);
expect("Sielovada listing count", network.entries.length, network.counts.listed);
expect(
  "reversal database count",
  reversals.database.length,
  reversals.stats.reversals,
);

if (errors.length) {
  console.error(`PUBLIC FIGURE CONTRACT VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

const figures = {
  generatedFrom: {
    registryRevision: registry.registryRevision.version,
    registryDate: registry.registryRevision.date,
    canonicalPublicationRevision: projection.revision_id,
    canonicalPublicationHash: projection.content_hash,
    canonicalInfographicRevision: infographic.revision_id,
    canonicalInfographicHash: infographic.content_hash,
    networkChecked: network.source.checked,
  },
  publicUS: {
    records: usPublic.length,
    independentlySupported: independentlySupported.length,
    singleSourceAttested: singleSourceAttested.length,
    profilesPendingDeepCase: projection.counts.profiles_pending_deep_case,
    byRecordType: projection.counts.by_record_type,
    byInstitutionClass: projection.counts.by_institution_class,
    romanCatholicParishes: usRomanCatholicParishes.length,
    romanCatholicMissions: usRomanCatholicMissions.length,
    romanCatholicInstitutions:
      usRomanCatholicParishes.length + usRomanCatholicMissions.length,
    nationalIndependentCatholicCommunities: usNationalIndependent.length,
    nationalIndependentCatholicParishes: count(
      usNationalIndependent,
      (record) => record.record_type === "parish",
    ),
    nationalIndependentCatholicCongregations: count(
      usNationalIndependent,
      (record) => record.record_type === "congregation",
    ),
    protestantCommunities: usProtestant.length,
    protestantParishes: count(
      usProtestant,
      (record) => record.record_type === "parish",
    ),
    protestantCongregations: count(
      usProtestant,
      (record) => record.record_type === "congregation",
    ),
    status: publicStatus,
  },
  history: {
    parishes: usRomanCatholicParishes.length,
    status: historyStatus,
    closed: closedParishes.length,
    closedWithDatedYear: count(closedParishes, (row) => row.closed.year != null),
    closedSince1990: count(
      closedParishes,
      (row) => row.closed.year != null && row.closed.year >= 1990,
    ),
    closedSince2020: count(
      closedParishes,
      (row) => row.closed.year != null && row.closed.year >= 2020,
    ),
    topClosureDioceses,
  },
  catholicInstitutionFlow: {
    institutions: romanCatholicInstitutionHistory.length,
    parishes: romanCatholicParishHistory.length,
    missions: romanCatholicMissionHistory.length,
    status: romanCatholicInstitutionStatus,
    closed: count(
      romanCatholicInstitutionHistory,
      (row) => row.status_group === "closed",
    ),
    retainingLithuanianWorship: count(
      romanCatholicInstitutionHistory,
      (row) =>
        row.status_group === "active_parish" ||
        row.status_group === "mass_continues",
    ),
  },
  physicalSites: {
    worshipSites: infographic.counts.physical_worship_sites,
    allBuildingSiteEntities: infographic.counts.building_site_entities,
  },
  continuity: {
    relationships: infographic.counts.institution_continuity_edges,
  },
  comparators: {
    canadianParishes: canadianComparators.population,
  },
  coalRegion: {
    parishes: coalRegion.population,
    dioceseOwned: coalRegion.counts.diocese_owned,
    dioceseEnded: coalRegion.counts.diocese_ended,
    dioceseStanding: coalRegion.counts.diocese_standing,
    dioceseUnresolved: coalRegion.counts.diocese_unresolved,
    communityOwned: coalRegion.counts.community_owned,
  },
  reversals: {
    documented: reversals.stats.reversals,
    excluded: reversals.stats.excluded_non_reversals,
    pending: reversals.stats.case_filed_pending,
    verified: reversals.stats.verified_unanimous,
  },
};

writeFileSync(
  new URL("../data/site-figures.json", import.meta.url),
  `${JSON.stringify(figures, null, 2)}\n`,
);

console.log(
  `OK: public figure contract — ${figures.publicUS.records} U.S. records, ` +
    `${figures.publicUS.independentlySupported} independently supported, ` +
    `${figures.history.parishes} Roman Catholic parishes, ` +
    `${currentWorship.length} current worship places.`,
);
