// Blocking contract for aggregate visuals. Institution, physical-site, and
// continuity units must remain distinct and match CultureNet's projection.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));
const infographic = read("canonical-infographic-projection.json");
const publication = read("canonical-publication-projection.json");
const alerts = read("canonical-current-events-projection.json");
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
const romanMissionHistory = institutions.filter(
  (row) => row.record_type === "misija" && row.institution_class === "roman_catholic",
);
const romanInstitutionHistory = [...romanHistory, ...romanMissionHistory];
const closed = romanHistory.filter((row) => row.status_group === "closed");
const transferredRomanInstitutions = romanInstitutionHistory.filter(
  (row) => row.status_group === "transferred",
);
const retainingLithuanianWorship = romanInstitutionHistory.filter(
  (row) =>
    row.status_group === "active_parish" ||
    row.status_group === "mass_continues",
);
const unique = (values) => new Set(values).size;
const publicationRomanInstitutions = publication.public_institutions.filter(
  (row) => row.institution_class === "roman_catholic",
);
const publicationRomanMissions = publicationRomanInstitutions.filter(
  (row) => row.record_type === "misija",
);
const linkedCurrentPastoralInstitutions =
  infographic.current_pastoral_network.directory.entries.filter(
    (entry) =>
      entry.registrySlug &&
      ["active_parish", "active_mission", "mass_continues"].includes(
        entry.networkClass,
      ),
  );

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
for (const [label, actual, expected] of [
  [
    "Roman Catholic parish and mission institutions",
    romanInstitutionHistory.length,
    publicationRomanInstitutions.length,
  ],
  [
    "Roman Catholic mission institutions in combined scope",
    romanMissionHistory.length,
    publicationRomanMissions.length,
  ],
  [
    "Roman Catholic institutions retaining Lithuanian worship",
    retainingLithuanianWorship.length,
    linkedCurrentPastoralInstitutions.length,
  ],
]) {
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
const currentWorshipSiteIds = new Set(
  retainingLithuanianWorship.flatMap(
    (institution) => institution.terminal_worship_site_ids ?? [],
  ),
);
for (const institution of retainingLithuanianWorship) {
  if (!(institution.terminal_worship_site_ids?.length > 0)) {
    errors.push(`${institution.registry_slug}: living line lacks a terminal worship site`);
  }
  if (
    institution.building_fate !== "standing" ||
    institution.building_fate_authority !== "terminal_site_condition" ||
    !(institution.building_fate_relationship_ids?.length > 0)
  ) {
    errors.push(`${institution.registry_slug}: living building summary lacks canonical terminal-site standing evidence`);
  }
}
for (const siteId of currentWorshipSiteIds) {
  const site = sites.find((row) => row.culturenet_entity_id === siteId);
  const conditions = new Set(
    site?.condition_relationships.map((row) => row.relationship_type) ?? [],
  );
  if (!site || conditions.size !== 1 || !conditions.has("building-standing")) {
    errors.push(`${siteId}: current worship site lacks an explicit standing-only condition`);
  }
}

const currentConditionTypes = (site) =>
  site.condition_relationships
    .filter(
      (row) =>
        row.relationship_type === "building-demolished" || row.date?.end == null,
    )
    .map((row) => row.relationship_type);
const resolveSiteCondition = (site) => {
  const current = new Set(currentConditionTypes(site));
  return infographic.condition_resolution_contract.precedence.find((condition) =>
    current.has(condition),
  ) ?? null;
};
const actualConditionCounts = new Map();
for (const site of worshipSites) {
  const condition = resolveSiteCondition(site);
  actualConditionCounts.set(condition, (actualConditionCounts.get(condition) ?? 0) + 1);
}
const conditionCountTotal = [...actualConditionCounts.values()].reduce(
  (sum, count) => sum + count,
  0,
);
if (conditionCountTotal !== worshipSites.length) {
  errors.push(
    `physical-site condition partition: ${conditionCountTotal} != ${worshipSites.length}`,
  );
}
const terminalAuthority = institutions.filter(
  (row) => row.building_fate_authority === "terminal_site_condition",
);
if (terminalAuthority.some((row) => !(row.terminal_worship_site_ids?.length > 0))) {
  errors.push("terminal-site building-fate authority appears without a terminal site");
}
for (const institution of institutions) {
  if (institution.status_authority !== "brain_canonical_assertion") {
    errors.push(`${institution.registry_slug}: status is not controlled by a Brain assertion`);
  }
  if (
    institution.founded.authority !== "brain_canonical_assertion" ||
    institution.closed.authority !== "brain_canonical_assertion"
  ) {
    errors.push(`${institution.registry_slug}: lifecycle display fields are not controlled by Brain assertions`);
  }
  if (institution.diocese === null) {
    if (institution.jurisdiction !== null) {
      errors.push(`${institution.registry_slug}: null jurisdiction key has a structured jurisdiction`);
    }
  } else {
    const jurisdiction = institution.jurisdiction;
    if (
      !jurisdiction ||
      jurisdiction.key !== institution.diocese ||
      jurisdiction.authority !== "brain_canonical_assertion" ||
      !["diocese", "archdiocese"].includes(jurisdiction.jurisdiction_type)
    ) {
      errors.push(`${institution.registry_slug}: jurisdiction is not a typed Brain assertion`);
    } else {
      const prefix =
        jurisdiction.jurisdiction_type === "archdiocese"
          ? "Archdiocese of "
          : "Diocese of ";
      if (!jurisdiction.canonical_name.startsWith(prefix)) {
        errors.push(`${institution.registry_slug}: jurisdiction label/type mismatch`);
      }
    }
  }
  if (
    institution.building_fate_authority === "unresolved" &&
    institution.building_fate !== null
  ) {
    errors.push(`${institution.registry_slug}: unresolved fate leaks a rendered value`);
  }
  if (institution.building_fate_authority === "site_r10_baseline") {
    errors.push(`${institution.registry_slug}: legacy baseline is rendered as canonical fate`);
  }
}
for (const institution of transferredRomanInstitutions) {
  const summary = institution.continuation_summary;
  if (
    institution.status_source_authority !==
    "canonical_continuation_status_adjudication"
  ) {
    errors.push(
      `${institution.registry_slug}: transferred status is not explicitly adjudicated in Brain`,
    );
  }
  if (
    !summary?.continuation_mode ||
    !summary.destination_name ||
    !summary.status_basis ||
    !summary.display_summary ||
    !(summary.source_urls?.length > 0) ||
    !summary.source_assertion_id
  ) {
    errors.push(
      `${institution.registry_slug}: transferred status lacks a canonical card explanation`,
    );
  }
}
for (const institution of romanInstitutionHistory) {
  if (
    institution.status_group !== "transferred" &&
    institution.continuation_summary != null
  ) {
    errors.push(
      `${institution.registry_slug}: continuation summary appears outside the transferred band`,
    );
  }
}
const grandRapids = transferredRomanInstitutions.find(
  (row) => row.registry_slug === "paul-grand-rapids-mi",
);
if (
  grandRapids?.continuation_summary?.continuation_mode !==
    "same_institution_new_community" ||
  grandRapids?.continuation_summary?.effective_date !== null ||
  !grandRapids?.continuation_summary?.display_summary.includes(
    "has not taken effect",
  ) ||
  !grandRapids?.continuation_summary?.future_plan?.includes("not yet effective")
) {
  errors.push(
    "Grand Rapids must remain an open non-Lithuanian parish with only a future merger plan",
  );
}
const expectedPrecedence = [
  "building-demolished",
  "building-repurposed",
  "building-listed-for-sale",
  "building-standing",
];
if (
  JSON.stringify(infographic.condition_resolution_contract.precedence) !==
  JSON.stringify(expectedPrecedence)
) {
  errors.push("building-condition precedence contract drifted");
}
const darien = sites.find(
  (site) => site.slug === "st-john-lutheran-cass-avenue-darien-il",
);
if (!darien || resolveSiteCondition(darien) !== "building-standing") {
  errors.push("Darien living-worship site lacks canonical standing evidence");
}
for (const slug of [
  "our-lady-vilna-cleared-lot-eynon-pa",
  "st-mary-annunciation-former-lot-kingston-pa",
  "st-mary-national-vacant-lot-reed-philadelphia-pa",
  "st-vincent-replacement-structure-esplen-pa",
]) {
  const site = sites.find((row) => row.slug === slug);
  if (site?.site_class !== "redeveloped_site") {
    errors.push(`${slug}: post-demolition entity must be a redeveloped site`);
  }
  if (!(site?.related_public_profiles?.length > 0)) {
    errors.push(`${slug}: redeveloped site lacks a lineage-backed public profile`);
  }
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
if (southfieldSite?.demolished_year !== null) {
  errors.push("Divine Providence Southfield current worship site is marked demolished");
}

for (const slug of ["casimir-freeland-pa", "gateofdawn-manhattan-ny"]) {
  const institution = institutions.find((row) => row.registry_slug === slug);
  if (
    institution?.founded.year !== null ||
    institution?.founded.authority !== "brain_canonical_assertion" ||
    institution?.founded.source_authority !== "unresolved"
  ) {
    errors.push(`${slug}: non-founding historical date must remain off the founding timeline`);
  }
}
const shenandoah = institutions.find(
  (row) => row.registry_slug === "george-shenandoah-pa",
);
if (shenandoah?.founded.year !== 1891) {
  errors.push("Saint George Shenandoah must begin in 1891, after the distinct 1872 joint predecessor");
}

const institutionByProfile = new Map(
  institutions.map((institution) => [institution.public_profile, institution]),
);
const campaignAdjudications = [
  [
    "/parishes/dievo-apvaizdos-southfield-mi",
    "active_parish",
    null,
    "site_r10_baseline",
  ],
  [
    "/parishes/svc-trejybes-hartford-ct",
    "unresolved",
    null,
    "brain_current_status_adjudication",
  ],
  [
    "/parishes/sv-juozapo-waterbury-ct",
    "closed",
    2024,
    "site_r10_baseline",
  ],
  [
    "/parishes/kristaus-atsimainymo-maspeth-ny",
    "transferred",
    2019,
    "canonical_continuation_status_adjudication",
  ],
];
for (const [profile, status, endedYear, authority] of campaignAdjudications) {
  const institution = institutionByProfile.get(profile);
  if (
    institution?.status_group !== status ||
    institution?.closed?.year !== endedYear ||
    institution?.status_authority !== "brain_canonical_assertion" ||
    institution?.status_source_authority !== authority
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
  ["/parishes/sv-juozapo-waterbury-ct", "No regular Mass schedule"],
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
  brooklynAnnunciation?.founded.authority !== "brain_canonical_assertion" ||
  brooklynAnnunciation?.founded.source_authority !==
    "canonical_infographic_adjudication" ||
  brooklynAnnunciation?.closed.year !== 2019 ||
  brooklynAnnunciation?.status_group !== "mass_continues" ||
  brooklynAnnunciation?.status_authority !== "brain_canonical_assertion" ||
  brooklynAnnunciation?.status_source_authority !==
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
  "app/church-buildings-through-time/page.tsx",
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
const institutionFlowPage = readFileSync(
  new URL("../app/where-every-parish-ended-up/page.tsx", import.meta.url),
  "utf8",
);
const parishThreadsComponent = readFileSync(
  new URL("../components/ParishThreads.tsx", import.meta.url),
  "utf8",
);
const outcomeModeExplorer = readFileSync(
  new URL("../components/OutcomeModeExplorer.tsx", import.meta.url),
  "utf8",
);
if (
  !institutionFlowPage.includes("additionalCurrentHostedCommunities") ||
  !institutionFlowPage.includes("additionalHostedCommunities=")
) {
  errors.push(
    "institution flow does not project additional current hosted communities from Brain",
  );
}
if (
  !parishThreadsComponent.includes('open === "g:mass_continues"') ||
  !parishThreadsComponent.includes("not one of the {model.total} historical")
) {
  errors.push(
    "Mass-continues drawer does not separate the additional current hosted community",
  );
}
if (!/romanCatholicInstitutionHistory/.test(institutionFlowPage)) {
  errors.push("institution-outcome view does not use the canonical parish-and-mission population");
}
if (/physicalWorshipSiteHistory/.test(institutionFlowPage)) {
  errors.push("institution-outcome view reads raw physical-site relationships");
}
if (!/physicalSiteOutcomeProjection/.test(institutionFlowPage)) {
  errors.push(
    "institution-outcome view does not consume the canonical building-view adapter",
  );
}
if (
  !/Parishes &amp; missions/.test(outcomeModeExplorer) ||
  !/Church buildings/.test(outcomeModeExplorer)
) {
  errors.push("institution-outcome view does not expose both approved modes");
}

const homepage = readFileSync(
  new URL("../app/page.tsx", import.meta.url),
  "utf8",
);
const homepageMap = readFileSync(
  new URL("../components/ParishMap.tsx", import.meta.url),
  "utf8",
);
if (/NationalRecordGraphic/.test(homepage)) {
  errors.push("homepage still renders the retired national-record figure strip");
}
if (
  !/infographicCounts/.test(homepage) ||
  !/romanCatholicInstitutionHistory/.test(homepage) ||
  !/currentPastoralNetwork/.test(homepage)
) {
  errors.push("homepage population index does not read the canonical projections");
}
if (
  !/activeNetwork\s*=\s*currentPastoralNetwork\.directory\.entries/.test(
    homepage,
  ) ||
  !/institutionHistory\.find/.test(homepage) ||
  !/activeNetwork\.map/.test(homepage)
) {
  errors.push(
    "homepage living-network cards do not project the Brain pastoral network and institution history",
  );
}
if (
  !/getClearedPhoto/.test(homepage) ||
  !/active pastoral-network entry has no cleared line drawing/.test(homepage)
) {
  errors.push(
    "homepage living-network artwork does not fail closed through the photo-rights gate",
  );
}
if (
  !/activeCampaigns\.length !== alertsData\.counts\.campaigns/.test(homepage) ||
  /activeCampaigns[\s\S]{0,600}\.slice\(0,\s*4\)/.test(homepage)
) {
  errors.push(
    "homepage campaign rail is truncated or not checked against the Brain current-events projection",
  );
}
if (!/new Set\(COMMUNITY_FILTERS\)/.test(homepageMap)) {
  errors.push("homepage map does not open on all canonical institution classes");
}

const allProfilesPage = readFileSync(
  new URL("../app/parishes/page.tsx", import.meta.url),
  "utf8",
);
if (
  !/institutionHistory/.test(allProfilesPage) ||
  !/AllProfilesTimeline/.test(allProfilesPage)
) {
  errors.push("All Profiles does not render the canonical institution timeline");
}
if (
  /RegistryTable/.test(allProfilesPage) ||
  /registry-scope/.test(allProfilesPage) ||
  /data\/parishes\.json/.test(allProfilesPage)
) {
  errors.push("All Profiles reads a legacy directory source instead of Brain canon");
}

const physicalSitePage = readFileSync(
  new URL("../app/church-buildings-through-time/page.tsx", import.meta.url),
  "utf8",
);
const physicalSiteAdapter = readFileSync(
  new URL("../lib/physical-site-outcome-projection.ts", import.meta.url),
  "utf8",
);
if (!/physicalSiteOutcomeProjection/.test(physicalSitePage)) {
  errors.push("physical-site view does not use the canonical building-view adapter");
}
if (!/physicalWorshipSiteHistory/.test(physicalSiteAdapter)) {
  errors.push("building-view adapter does not use the canonical worship-site population");
}
if (!/resolvePhysicalSiteCondition/.test(physicalSiteAdapter)) {
  errors.push("building-view adapter does not use the canonical condition resolver");
}
if (/state:\s*[^,\n]*demolished_year/.test(physicalSiteAdapter)) {
  errors.push("physical-site view resolves condition from demolished_year outside the canonical contract");
}
if (/romanCatholicInstitutionHistory/.test(physicalSiteAdapter)) {
  errors.push("physical-site view reads the institution population");
}
if (/DIVINE_PROVIDENCE|dievo-apvaizdos-southfield/.test(physicalSiteAdapter)) {
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
