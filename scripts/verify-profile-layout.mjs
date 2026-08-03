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
const nationalLocatorSource = fs.readFileSync(
  path.join(ROOT, "components", "ParishNationalLocator.tsx"),
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
const profileViewSource = fs.readFileSync(
  path.join(ROOT, "lib", "parish-profile-view.ts"),
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
const registry = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "registry-unified.json"), "utf8"),
);
const stMichaelScrantonCase = JSON.parse(
  fs.readFileSync(
    path.join(
      ROOT,
      "data",
      "case-records",
      "sv-mykolo-scranton-pa.json",
    ),
    "utf8",
  ),
);
const photos = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "photos.json"), "utf8"),
);
const comparatorCount = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "parishes.json"), "utf8"),
).filter((parish) => parish.comparator && !parish.mergedInto).length;

const errors = [];

// Canonical profile order, v2. Identity carries status, facts, and the full
// About/history narrative and present condition orient the reader first.
// Compact chronology, buildings, relationships, evidence, and corrections follow.
const orderedMarkers = [
  { id: "profile-identity", marker: 'id="profile-identity"', source: pageSource },
  { id: "profile-history", marker: "<ParishPublishedRecord", source: pageSource },
  {
    id: "present-condition",
    marker: 'id="present-condition"',
    source: pageSource,
  },
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
  [pageSource, "embedded", "history embedded in the top About area"],
  [historySource, "About this parish", "top About heading"],
  [
    pageSource,
    "caseRecord?.summary ? [] : profileView.historyFallback",
    "case summary precedence over generated history fallback",
  ],
  [pageSource, "items={profileView.chronology}", "normalized chronology"],
  [
    pageSource,
    "data-profile-institutional-reading",
    "top institutional reading",
  ],
  [historySource, 'id="profile-history"', "history section id"],
  [chronologySource, 'id="parish-chronology"', "chronology section id"],
  [chronologySource, "<details", "expandable chronology events"],
  [chronologySource, "href={source.url}", "linked chronology evidence"],
  [worshipSitesSource, 'id="worship-sites"', "worship sites section id"],
  [
    worshipSitesSource,
    "grid min-w-0",
    "worship-site mobile width containment",
  ],
  [worshipSitesSource, "site.milestones.map", "worship-site milestone list"],
  [
    worshipSitesSource,
    "if (sites.length === 0) return null;",
    "empty worship-site section omission",
  ],
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
    "institutionDates?.foundedUnresolved",
    "unresolved founding excluded from narrative dates",
  ],
  [
    profileViewSource,
    'input.endState === "mass_continues"',
    "continuing-Mass worship-site treatment",
  ],
  [profileViewSource, 'label: "Church building"', "shared church-building fact"],
  [profileViewSource, "Building status", "explicit building outcome"],
  [pageSource, "survivedReviewThenClosed", "survived-review warning"],
  [pageSource, "currentChurchDetail", "worship-site status detail"],
  [pageSource, "data-profile-building-status", "headline building status"],
  [pageSource, "campaignLiturgy?.detail", "campaign liturgy qualification"],
  [pageSource, "campaignLiturgy?.href", "campaign liturgy destination link"],
  [pageSource, "campaignSources", "campaign evidence ledger sources"],
  [pageSource, "fact.detail", "fact-level status detail rendering"],
  [pageSource, "What happened", "plain institutional outcome label"],
  [
    pageSource,
    'data-profile-scope="outside-us-projection"',
    "non-U.S. projection scope band",
  ],
  [
    pageSource,
    'recordType !== "misija" && institutionDates',
    "mission founding-strip omission",
  ],
  [
    pageSource,
    'recordType === "misija" || !isUsProjection ? [] : worshipSites',
    "mission and comparator worship-site omission",
  ],
  [
    profileViewSource,
    'label: "Worships in"',
    "mission worship-place vocabulary",
  ],
  [profileViewSource, 'label: "Active"', "mission active vocabulary"],
  [pageSource, '"Lithuanian worship"', "non-Catholic worship vocabulary"],
  [
    profileViewSource,
    'label: "Institutional life"',
    "institutional lifecycle vocabulary",
  ],
  [
    graphSource,
    "getInstitutionTransition",
    "canonical institutional-transition selector",
  ],
  [
    profileViewSource,
    'input.institutionTransition === "merged"',
    "merger-specific institutional wording",
  ],
  [
    graphSource,
    'return "Repurposed, standing"',
    "standing repurposed-site outcome",
  ],
  [
    graphSource,
    "getIdentityNoticesForInstitution",
    "adjudicated institution-overlap notice",
  ],
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
  [graphSource, "row.closed.display", "qualified ending-date display"],
  [graphSource, "end date unresolved", "unresolved ending-date treatment"],
  [pageSource, "data-profile-image-state", "profile image-state contract"],
  [pageSource, "Image file held", "pending-permission image wording"],
  [pageSource, "Image not yet gathered", "ungathered image wording"],
  [
    contextMapSource,
    'className="min-w-0 max-w-full overflow-hidden"',
    "compact-map overflow containment",
  ],
  [pageSource, "<ParishNationalLocator", "profile national locator"],
  [
    nationalLocatorSource,
    "data-profile-national-locator",
    "national locator contract",
  ],
  [
    nationalLocatorSource,
    "Where in the {region}",
    "national locator purpose label",
  ],
  [
    nationalLocatorSource,
    "contextPoints.points",
    "canonical shared map coordinates",
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
  "Projected for U.S. institutions only",
  "conflict_preserved",
  "Adjudicated situation record",
  "canonical record",
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
if ((pageSource.match(/<ParishPublishedRecord/g) ?? []).length !== 1) {
  errors.push("profile history must render exactly once");
}

const profileOutputSources = [
  pageSource,
  historySource,
  chronologySource,
  worshipSitesSource,
  relatedRecordsSource,
  profileViewSource,
].join("\n");
if (/#b3aca2/i.test(profileOutputSources)) {
  errors.push("map-marker color #b3aca2 is used in profile text output");
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

const institutionByProfile = new Map(
  infographic.institution_history.map((institution) => [
    institution.public_profile,
    institution,
  ]),
);

const brooklynAnnunciation = institutionByProfile.get(
  "/parishes/svc-m-marijos-apreiskimo-brooklyn-ny",
);
if (
  brooklynAnnunciation?.closed?.year !== 2019 ||
  brooklynAnnunciation?.status_group !== "mass_continues" ||
  brooklynAnnunciation?.status_authority !==
    "canonical_status_adjudication"
) {
  errors.push(
    "Brooklyn Annunciation must render as a 2019 merged institution where Lithuanian Mass continues",
  );
}
const massContinuesInstitutions = infographic.institution_history.filter(
  (institution) => institution.status_group === "mass_continues",
);
const mergedMassProfiles = massContinuesInstitutions
  .filter((institution) =>
    infographic.continuity_edges.some(
      (edge) =>
        edge.publication_state === "publishable" &&
        edge.relationship_type === "institution-merged-into-institution" &&
        edge.source.entity_id === institution.culturenet_entity_id,
    ),
  )
  .map((institution) => institution.public_profile)
  .sort();
const expectedMergedMassProfiles = [
  "/parishes/svc-m-marijos-apreiskimo-brooklyn-ny",
  "/parishes/svc-m-marijos-nekalto-prasidejimo-chicago-il",
].sort();
if (
  JSON.stringify(mergedMassProfiles) !==
  JSON.stringify(expectedMergedMassProfiles)
) {
  errors.push(
    "continuing-Mass merger vocabulary no longer matches the canonical transition edges",
  );
}
if (massContinuesInstitutions.length - mergedMassProfiles.length !== 4) {
  errors.push(
    "continuing-Mass profiles with unresolved institutional transitions drifted",
  );
}
const institutionByEntityId = new Map(
  infographic.institution_history.map((institution) => [
    institution.culturenet_entity_id,
    institution,
  ]),
);
const siteByEntityId = new Map(
  infographic.building_site_history.map((site) => [
    site.culturenet_entity_id,
    site,
  ]),
);

// The visual cases are also semantic regression cases. These assertions protect
// the current canon where the design reference still reflects an older packet.
const stAnthonyDetroit = institutionByProfile.get(
  "/parishes/sv-antano-detroit-mi",
);
const stAnthonySite = siteByEntityId.get(
  "cn:building_site:st-anthony-detroit-25th-street-site",
);
const stAnthonyConditions = new Set(
  (stAnthonySite?.condition_relationships ?? []).map(
    (condition) => condition.relationship_type,
  ),
);
if (
  stAnthonyDetroit?.closed?.year !== 2013 ||
  !stAnthonyConditions.has("building-repurposed") ||
  !stAnthonyConditions.has("building-standing")
) {
  errors.push("Detroit St. Anthony closed-standing case drifted");
}
if (
  !infographic.continuity_edges.some(
    (edge) =>
      edge.id === "rel:detroit:st-anthony-merged-into-divine-providence" &&
      edge.relationship_type === "institution-merged-into-institution",
  )
) {
  errors.push("Detroit St. Anthony merge relationship drifted");
}

const ourLadyVilniusManhattan = institutionByProfile.get(
  "/parishes/ausros-vartu-manhattan-ny",
);
const ourLadyVilniusManhattanSite = siteByEntityId.get(
  "cn:building_site:our-lady-of-vilnius-broome-street-ny",
);
if (
  ourLadyVilniusManhattan?.status_group !== "closed" ||
  ourLadyVilniusManhattan?.closed?.year !== 2007 ||
  ourLadyVilniusManhattan?.building_fate !== "demolished" ||
  ourLadyVilniusManhattanSite?.demolished_year !== 2015 ||
  !ourLadyVilniusManhattanSite?.condition_relationships.some(
    (condition) => condition.relationship_type === "building-demolished",
  )
) {
  errors.push(
    "Manhattan Our Lady of Vilnius must keep parish closure and 2015 church demolition as separate canonical facts",
  );
}

const ascensionPittsburgh = institutionByProfile.get(
  "/parishes/ascension-pittsburgh-pa",
);
const ascensionSites = infographic.building_site_history.filter((site) =>
  site.related_public_institution_ids.includes(
    ascensionPittsburgh?.culturenet_entity_id,
  ),
);
const ascensionEdges = infographic.continuity_edges.filter(
  (edge) =>
    edge.source.entity_id === ascensionPittsburgh?.culturenet_entity_id ||
    edge.target.entity_id === ascensionPittsburgh?.culturenet_entity_id,
);
if (
  ascensionPittsburgh?.founded?.year !== 1906 ||
  ascensionPittsburgh?.founded?.authority !== "site_r10_baseline" ||
  ascensionPittsburgh?.closed?.year !== 1962 ||
  ascensionSites.length !== 0 ||
  ascensionEdges.length !== 0
) {
  errors.push("Pittsburgh Ascension thin-record case drifted");
}

const stPeterDetroit = institutionByProfile.get(
  "/parishes/sv-petro-detroit-mi",
);
const stPeterSite = siteByEntityId.get(
  "cn:building_site:st-peter-detroit-site",
);
const stPeterUse = stPeterSite?.institution_use_periods.find(
  (period) => period.institution_entity_id === stPeterDetroit?.culturenet_entity_id,
);
if (
  stPeterDetroit?.founded?.year !== 1920 ||
  stPeterUse?.date?.start !== "1921" ||
  stPeterUse?.date?.end !== "1995"
) {
  errors.push(
    "Detroit St. Peter must retain its 1920 institution and 1921-1995 worship site",
  );
}

const stGeorgeDetroit = institutionByProfile.get(
  "/parishes/st-george-detroit-mi",
);
const stGeorgeOrigin = infographic.continuity_edges.find(
  (edge) => edge.id === "rel:detroit:divine-providence-originated-from-st-george",
);
if (
  stGeorgeDetroit?.founded?.year !== 1908 ||
  stGeorgeDetroit?.closed?.year !== 1965 ||
  stGeorgeOrigin?.adjudication_state !== "accepted" ||
  stGeorgeOrigin?.identity_effect !== "distinct_institutions_lineage"
) {
  errors.push(
    "Detroit St. George must remain a distinct 1908-1965 institution overlapping Divine Providence from 1949",
  );
}
if (profileOutputSources.includes("Transferred, date disputed")) {
  errors.push("stale St. George transfer-date treatment returned");
}

const newark = institutionByProfile.get(
  "/parishes/lietuviu-baznycia-unnamed-newark-nj",
);
const newarkEdge = infographic.continuity_edges.find(
  (edge) => edge.id === "rel:identity-1:newark-merged",
);
const newarkSites = infographic.building_site_history.filter((site) =>
  site.related_public_institution_ids.includes(newark?.culturenet_entity_id),
);
if (
  newark?.founded?.year !== 1902 ||
  newark?.closed?.display !== "2002 selected" ||
  newarkEdge?.adjudication_state !== "conflict_preserved" ||
  newarkEdge?.date?.start !== "2002 selected" ||
  institutionByEntityId.has(newarkEdge?.target?.entity_id) ||
  newarkSites.filter((site) => site.site_class === "worship_site").length !== 2
) {
  errors.push("Newark selected-date conflict case drifted");
}

const lemontMission = institutionByProfile.get(
  "/parishes/pal-jurgio-matulaicio-misija-lemont-il",
);
if (
  lemontMission?.record_type !== "misija" ||
  infographic.counts.roman_catholic_parish_institutions !== 132 ||
  publication.counts.by_record_type.misija !== 5
) {
  errors.push("mission vocabulary or Roman Catholic parish count drifted");
}
if (
  photos.parishes["pal-jurgio-matulaicio-misija-lemont-il"]?.rights !==
    "permission_granted" ||
  photos.parishes["pal-jurgio-matulaicio-misija-lemont-il-line-drawing"]
    ?.rights !== "permission_granted"
) {
  errors.push("Lemont must render its cleared line-art portrait");
}

const frackville = institutionByProfile.get(
  "/parishes/sv-m-marijos-apsireiskimo-frackville-pa",
);
const frackvilleContinuation = infographic.continuity_edges.find(
  (edge) => edge.id === "rel:ef-5:frackville-continued-st-joseph",
);
if (
  frackville?.founded?.year !== 1914 ||
  frackville?.closed?.year !== null ||
  frackville?.status_group !== "transferred" ||
  !frackvilleContinuation ||
  institutionByEntityId.has(frackvilleContinuation.target?.entity_id)
) {
  errors.push(
    "Frackville must retain its canonical 1914 founding and unlinked continuation endpoint",
  );
}
const frackvilleSiteClasses = infographic.building_site_history
  .filter((site) =>
    site.related_public_institution_ids.includes(
      frackville?.culturenet_entity_id,
    ),
  )
  .map((site) => site.site_class)
  .sort();
if (
  JSON.stringify(frackvilleSiteClasses) !==
  JSON.stringify([
    "cemetery",
    "parish_ancillary_site",
    "parish_ancillary_site",
    "worship_site",
    "worship_site",
  ])
) {
  errors.push("Frackville five-site class inventory drifted");
}
if (
  photos.parishes["sv-m-marijos-apsireiskimo-frackville-pa"]?.rights !==
  "pending_permission"
) {
  errors.push("Frackville pending-permission image state drifted");
}

if (
  infographic.comparators.canada.counted_in_public_us_institution_total !==
    false ||
  infographic.comparators.canada.population !== 3
) {
  errors.push("Canadian comparator scope drifted");
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

const stMichaelScranton = registry.parishes.find(
  (parish) => parish.slug === "michael-scranton-pa",
);
const stLucyScranton = infographic.building_site_history.find(
  (site) => site.slug === "st-lucy-church-scranton-pa",
);
const stMichaelJackson = infographic.building_site_history.find(
  (site) => site.slug === "st-michael-jackson-street-scranton-pa",
);
const stMichaelOriginal = infographic.building_site_history.find(
  (site) => site.slug === "st-michael-original-wooden-church-scranton-pa",
);
if (
  stMichaelScranton?.names?.en !== "St. Michael the Archangel" ||
  stMichaelScranton?.lifecycle?.selected_founded_year !== 1914 ||
  stMichaelScrantonCase.profile?.institutionalLife !==
    "1914-present · parish survives at a new church" ||
  stMichaelScrantonCase.profile?.currentSite?.value !==
    "Saint Lucy Church, Scranton" ||
  stMichaelScrantonCase.profile?.formerSite?.value !==
    "Saint Michael Church, 1703 Jackson Street" ||
  stMichaelScrantonCase.profile?.liturgy?.value !==
    "No regular Lithuanian Mass documented"
) {
  errors.push(
    "Saint Michael Scranton must distinguish its surviving parish, current Saint Lucy home, former Jackson Street church, and current non-Lithuanian liturgy",
  );
}
if (
  stLucyScranton?.lifecycle_text?.end !==
    "active Saint Michael FSSP worship site" ||
  stMichaelJackson?.lifecycle_text?.end !==
    "vacant and listed after 2025-09-28" ||
  stMichaelOriginal?.lifecycle_text?.start !== "1914" ||
  stMichaelOriginal?.lifecycle_text?.end !==
    "replaced by 1942 brick church; later physical disposition unresolved"
) {
  errors.push("Saint Michael Scranton worship-site lifecycle readings drifted");
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
