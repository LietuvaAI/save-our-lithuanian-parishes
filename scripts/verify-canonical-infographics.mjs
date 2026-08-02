// Blocking contract for aggregate visuals. Institution, physical-site, and
// continuity units must remain distinct and match CultureNet's projection.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));
const infographic = read("canonical-infographic-projection.json");
const publication = read("canonical-publication-projection.json");
const alerts = read("alerts.json");
const errors = [];

const sortValue = (value) => {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, child]) => [key, sortValue(child)]),
    );
  }
  return value;
};
const hashInput = structuredClone(infographic);
delete hashInput.content_hash;
const actualHash = `sha256:${createHash("sha256")
  .update(JSON.stringify(sortValue(hashInput)))
  .digest("hex")}`;
if (infographic.content_hash !== actualHash) {
  errors.push(
    `projection hash mismatch: embedded=${infographic.content_hash}, actual=${actualHash}`,
  );
}

if (infographic.schema !== "culturenet-parish-infographic-projection.v1") {
  errors.push(`unsupported schema ${infographic.schema}`);
}
if (
  infographic.authority.publication_projection_hash !== publication.content_hash
) {
  errors.push("infographic and publication projection authority hashes differ");
}

const institutions = infographic.institution_history;
const sites = infographic.building_site_history;
const worshipSites = sites.filter((row) => row.site_class === "worship_site");
const coalRegion = infographic.regional_views.pennsylvania_coal_region;
const canada = infographic.comparators.canada;
const romanHistory = institutions.filter(
  (row) => row.record_type === "parish" && row.institution_class === "roman_catholic",
);
const closed = romanHistory.filter((row) => row.status_group === "closed");
const unique = (values) => new Set(values).size;

const checks = [
  ["institutions", institutions.length, infographic.counts.public_us_institutions],
  [
    "Roman Catholic parish institutions",
    romanHistory.length,
    infographic.counts.roman_catholic_parish_institutions,
  ],
  ["building/site entities", sites.length, infographic.counts.building_site_entities],
  ["physical worship sites", worshipSites.length, infographic.counts.physical_worship_sites],
  [
    "continuity edges",
    infographic.continuity_edges.length,
    infographic.counts.institution_continuity_edges,
  ],
  ["coal-region parish institutions", coalRegion.population, infographic.counts.coal_region_parish_institutions],
  ["Canadian comparator parishes", canada.population, infographic.counts.canadian_comparator_parishes],
  ["closed Roman Catholic parishes", closed.length, infographic.counts.closed_roman_catholic_parishes],
];
for (const [label, actual, expected] of checks) {
  if (actual !== expected) errors.push(`${label}: ${actual} != ${expected}`);
}
if (institutions.length !== publication.counts.public_us_institutions) {
  errors.push("institution history and publication census counts differ");
}
if (unique(institutions.map((row) => row.culturenet_entity_id)) !== institutions.length) {
  errors.push("institution entity IDs are not unique");
}
if (unique(institutions.map((row) => row.public_profile)) !== institutions.length) {
  errors.push("institution profile routes are not unique");
}
if (sites.some((row) => row.counted_in_public_institution_total !== false)) {
  errors.push("a physical site is marked for inclusion in the institution census");
}
if (sites.some((row) => row.site_class === "unclassified")) {
  errors.push("an unclassified physical site remains in the projection");
}
for (const institution of institutions) {
  if (
    institution.status_group === "active_parish" &&
    institution.closed.year !== null
  ) {
    errors.push(
      `${institution.registry_slug}: ended institution is labeled active_parish`,
    );
  }
}
if (
  coalRegion.institutions.some(
    (row) => !institutions.some(
      (institution) => institution.culturenet_entity_id === row.culturenet_entity_id,
    ),
  )
) {
  errors.push("coal-region view contains a non-canonical public institution");
}
if (canada.counted_in_public_us_institution_total !== false) {
  errors.push("Canadian comparators are included in the U.S. institution count");
}

const closedWithYear = closed.filter((row) => row.closed.year != null);
const since1990 = closedWithYear.filter((row) => row.closed.year >= 1990);
const since2020 = closedWithYear.filter((row) => row.closed.year >= 2020);
for (const [label, actual, expected] of [
  ["dated closed parishes", closedWithYear.length, infographic.counts.closed_roman_catholic_parishes_with_dated_year],
  ["closures since 1990", since1990.length, infographic.counts.closed_roman_catholic_parishes_since_1990],
  ["closures since 2020", since2020.length, infographic.counts.closed_roman_catholic_parishes_since_2020],
]) {
  if (actual !== expected) errors.push(`${label}: ${actual} != ${expected}`);
}

const detroitExpected = new Map([
  ["st-george-detroit-mi", [1908, 1965]],
  ["anthony-detroit-mi", [1920, 2013]],
  ["providence-southfield-mi", [1949, null]],
]);
for (const [slug, [founded, ended]] of detroitExpected) {
  const row = institutions.find((institution) => institution.registry_slug === slug);
  if (!row) errors.push(`${slug}: missing Detroit institution`);
  else if (row.founded.year !== founded || row.closed.year !== ended) {
    errors.push(`${slug}: expected institution lifecycle ${founded}-${ended ?? "present"}`);
  }
}
const southfieldSite = sites.find(
  (site) => site.culturenet_entity_id === "cn:building_site:divine-providence-southfield-site",
);
if (!southfieldSite || southfieldSite.first_documented_year !== 1973) {
  errors.push("Divine Providence Southfield worship site must begin in 1973");
}
if (
  !southfieldSite?.condition_relationships.some(
    (condition) => condition.relationship_type === "building-standing",
  )
) {
  errors.push("Divine Providence Southfield site lacks an explicit standing assertion");
}

const institutionByProfile = new Map(
  institutions.map((institution) => [institution.public_profile, institution]),
);
const campaignAdjudications = [
  [
    "/parishes/dievo-apvaizdos-southfield-mi",
    "active_parish",
    null,
  ],
  ["/parishes/svc-trejybes-hartford-ct", "unresolved", null],
  ["/parishes/sv-juozapo-waterbury-ct", "closed", 2024],
  ["/parishes/kristaus-atsimainymo-maspeth-ny", "transferred", 2019],
];
for (const [profile, status, endedYear] of campaignAdjudications) {
  const institution = institutionByProfile.get(profile);
  if (
    institution?.status_group !== status ||
    institution?.closed?.year !== endedYear ||
    institution?.status_authority !== "current_campaign_adjudication"
  ) {
    errors.push(`${profile}: current campaign adjudication drifted`);
  }
}

const campaignByProfile = new Map(
  alerts.campaigns.map((campaign) => [campaign.parishLink, campaign]),
);
const campaignLiturgy = [
  ["/parishes/dievo-apvaizdos-southfield-mi", "Weekly"],
  ["/parishes/svc-trejybes-hartford-ct", "Regular Mass ended 30 May 2026"],
  ["/parishes/sv-juozapo-waterbury-ct", "Special Mass documented 2 Aug 2026"],
  ["/parishes/kristaus-atsimainymo-maspeth-ny", "Moved to Annunciation, Brooklyn"],
];
for (const [profile, value] of campaignLiturgy) {
  if (campaignByProfile.get(profile)?.profile?.liturgy?.value !== value) {
    errors.push(`${profile}: campaign liturgy wording drifted`);
  }
}

const brooklynAnnunciation = institutions.find(
  (institution) =>
    institution.public_profile ===
    "/parishes/svc-m-marijos-apreiskimo-brooklyn-ny",
);
if (
  brooklynAnnunciation?.founded.year !== 1914 ||
  brooklynAnnunciation?.founded.authority !==
    "canonical_infographic_adjudication" ||
  brooklynAnnunciation?.closed.year !== 2019 ||
  brooklynAnnunciation?.status_group !== "mass_continues" ||
  brooklynAnnunciation?.status_authority !==
    "canonical_status_adjudication"
) {
  errors.push(
    "Brooklyn Annunciation must remain Lithuanian from 1914 and a 2019 merged institution where Lithuanian Mass continues",
  );
}

const aggregatePages = [
  "app/page.tsx",
  "app/history/page.tsx",
  "app/by-diocese/page.tsx",
  "app/where-every-parish-ended-up/page.tsx",
  "app/where-parish-life-continued/page.tsx",
  "app/pennsylvania-coal-region/page.tsx",
  "app/canadian-comparators/page.tsx",
];
for (const relativePath of aggregatePages) {
  const source = readFileSync(
    new URL("../" + relativePath, import.meta.url),
    "utf8",
  );
  if (/from ["']@\/lib\/registry-scope["']/.test(source)) {
    errors.push(relativePath + ": aggregate view imports the legacy scope join");
  }
  if (/from ["']@\/lib\/parishes["']/.test(source)) {
    errors.push(relativePath + ": aggregate view imports the legacy case-row library");
  }
  if (/data\/context-points\.json/.test(source)) {
    errors.push(relativePath + ": aggregate view reads generated map points as canon");
  }
}
const physicalSitePage = readFileSync(
  new URL("../app/where-every-parish-ended-up/page.tsx", import.meta.url),
  "utf8",
);
if (/DIVINE_PROVIDENCE|dievo-apvaizdos-southfield/.test(physicalSitePage)) {
  errors.push("physical-site view contains a Divine Providence one-off");
}

if (errors.length) {
  console.error(`CANONICAL INFOGRAPHIC VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(
  `OK: canonical infographics — ${institutions.length} institutions, ` +
    `${romanHistory.length} Roman Catholic parish histories, ` +
    `${worshipSites.length} physical worship sites, ` +
    `${infographic.continuity_edges.length} continuity edges.`,
);
