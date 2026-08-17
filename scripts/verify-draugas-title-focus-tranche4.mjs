import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const readJson = (relativePath) =>
  JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const projection = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche4.json",
);
const existingNine = readJson("data/canonical-draugas-newspaper-records.json");
const existingEleven = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche1.json",
);
const existingTwentyThree = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche2.json",
);
const existingSixteen = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche3.json",
);
const publication = readJson("data/canonical-publication-projection.json");
const errors = [];

const EXPECTED_BRAIN_MERGE_COMMIT =
  "6ce4285761463eadf2eaba5538f15e3b9d91188a";
const EXPECTED_CONTENT_HASH =
  "47f1cce4d627f02fbead779ddbfa5d58dc4fe1615160f75a8d8a686cd4d50cc8";
const EXPECTED_SOURCE_PACKET_HASH =
  "f5665457f7a455ba097ea20eb57d1293d0a3d078c0a6fae4cd06eea86a9b8d7f";
const EXPECTED_SOURCE_OVERLAY_HASH =
  "5986cfc4a931be1fce66ca776db2b9f2bda895f65dbd356b465a8a1595b6ae85";
const EXPECTED_EXISTING_NINE_HASH =
  "143118db45388cb94c1421623e0139428751b6606626d5b51d5ea7b4a3b4e742";
const EXPECTED_EXISTING_ELEVEN_HASH =
  "b424efefe2131d8c940a9dfb4b795c1d203d0decb9aaf233e404fbd664e8e577";
const EXPECTED_EXISTING_TWENTY_THREE_HASH =
  "b48298625bb12af955687661a8bf5f4af8556cf84d5fa1747bd6b772b77e69cf";
const EXPECTED_EXISTING_SIXTEEN_HASH =
  "a6439fd0f25bff4c24b07896c592db37e190ca629d1282c4adb33b3395da1ae8";
const expectedProfileCounts = {
  "/parishes/ausros-vartu-chicago-il": 1,
  "/parishes/dievo-motinos-nuolatines-pagalbos-cleveland-oh": 3,
  "/parishes/ss-peter-and-paul-chicago-il": 1,
  "/parishes/st-francis-minersville-pa": 1,
  "/parishes/sv-juozapo-nanticoke-pa": 1,
  "/parishes/sv-jurgio-cleveland-oh": 3,
  "/parishes/sv-kazimiero-chicago-il": 1,
  "/parishes/sv-kazimiero-cleveland-oh": 4,
  "/parishes/sv-kazimiero-gary-in": 1,
  "/parishes/sv-kazimiero-kansas-city-mo": 1,
  "/parishes/sv-kazimiero-new-haven-ct": 1,
  "/parishes/sv-kazimiero-pittsburgh-pa": 1,
  "/parishes/sv-petro-boston-ma": 4,
  "/parishes/sv-petro-detroit-mi": 1,
};
const expectedSourceIds = new Set([
  "solp:draugas-newspaper-record:draugas-2004-11-02-p4-st-peter-south-boston-ma",
  "solp:draugas-newspaper-record:draugas-2014-11-13-p4-st-peter-south-boston-ma",
  "solp:draugas-newspaper-record:draugas-2015-06-25-p4-st-peter-south-boston-ma",
  "solp:draugas-newspaper-record:draugas-2019-01-05-p5-st-peter-south-boston-ma",
  "solp:draugas-newspaper-record:draugas-2008-12-03-p5-our-lady-perpetual-help-cleveland-oh",
  "solp:draugas-newspaper-record:draugas-2009-05-02-p10-st-casimir-cleveland-lithuanian-oh",
  "solp:draugas-newspaper-record:draugas-2009-09-29-p5-st-george-cleveland-oh",
  "solp:draugas-newspaper-record:draugas-2009-09-30-p4-our-lady-perpetual-help-cleveland-oh",
  "solp:draugas-newspaper-record:draugas-2009-10-01-p5-st-casimir-cleveland-lithuanian-oh",
  "solp:draugas-newspaper-record:draugas-2009-10-27-p6-st-george-cleveland-oh",
  "solp:draugas-newspaper-record:draugas-2010-01-02-p5-st-casimir-cleveland-lithuanian-oh",
  "solp:draugas-newspaper-record:draugas-2010-04-21-p5-our-lady-perpetual-help-cleveland-oh",
  "solp:draugas-newspaper-record:draugas-2010-05-22-p10-st-george-cleveland-oh",
  "solp:draugas-newspaper-record:draugas-2014-07-10-p10-st-casimir-cleveland-lithuanian-oh",
  "solp:draugas-newspaper-record:draugas-1991-09-26-p4-st-casimir-gary-in",
  "solp:draugas-newspaper-record:draugas-1936-08-15-p6-st-casimir-chicago-heights-il",
  "solp:draugas-newspaper-record:draugas-1987-09-11-p6-our-lady-of-vilna-pilsen-chicago-il",
  "solp:draugas-newspaper-record:draugas-1965-11-03-p4-st-joseph-nanticoke-hanover-pa",
  "solp:draugas-newspaper-record:draugas-1943-03-03-p2-st-casimir-pittsburgh-pa",
  "solp:draugas-newspaper-record:draugas-1995-05-11-p2-st-peter-detroit-mi",
  "solp:draugas-newspaper-record:draugas-1914-07-30-p1-ss-peter-and-paul-chicago-il",
  "solp:draugas-newspaper-record:draugas-1915-09-23-p3-st-casimir-kansas-city-ks",
  "solp:draugas-newspaper-record:draugas-1959-10-30-p7-st-casimir-new-haven-ct",
  "solp:draugas-newspaper-record:draugas-2007-12-01-p14-st-francis-minersville-pa",
]);
const expectedSupplementalIds = new Set([
  "solp:draugas-newspaper-record:draugas-2007-12-01-p14-st-francis-minersville-pa",
]);
const allowedTitleStates = new Set([
  "exact_printed_headline",
  "reviewed_section_heading",
  "untitled_item",
]);
const forbiddenKeys = new Set([
  "contextual_excerpt",
  "contexts",
  "excerpt",
  "ocr_text",
  "page_text",
  "source_prose",
  "source_text",
  "raw_ocr",
  "raw_extraction_rows",
  "model_output",
  "assertions",
  "relationships",
  "canonical_entities",
  "profile_evidence",
  "supports",
  "used_for",
  "claims",
  "solp_payload",
  "sacred_core_payload",
]);

const sortValue = (value) => {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortValue(child)]),
    );
  }
  return value;
};
const contentHash = (value) => {
  const input = structuredClone(value);
  delete input.content_hash_sha256;
  return createHash("sha256")
    .update(`${JSON.stringify(sortValue(input))}\n`)
    .digest("hex");
};
const sourceRecordId = (row) => row.source_record_id ?? row.record_id;
const locatorKey = (row) =>
  `${row.canonical_entity_id}\u0000${row.public_profile}\u0000${row.issue_date}\u0000${row.pdf_page}`;

if (EXPECTED_BRAIN_MERGE_COMMIT.length !== 40) {
  errors.push("Brain merge commit pin is malformed");
}
if (
  projection.content_hash_sha256 !== EXPECTED_CONTENT_HASH ||
  projection.content_hash_sha256 !== contentHash(projection)
) {
  errors.push("tranche 4 record-set hash does not match merged Brain #549");
}
if (
  projection.schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche4-v1" ||
  projection.controlling_record_schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche4-v1" ||
  projection.projection_state !==
    "held_draft_brain_reviewed_public_metadata_projection"
) {
  errors.push("unexpected tranche 4 projection contract");
}
if (
  projection.source_selection_packet_content_hash_sha256 !==
    EXPECTED_SOURCE_PACKET_HASH ||
  projection.source_overlay_content_hash_sha256 !== EXPECTED_SOURCE_OVERLAY_HASH
) {
  errors.push("tranche 4 source packet or title/focus overlay hash drifted");
}
if (
  existingNine.content_hash_sha256 !== EXPECTED_EXISTING_NINE_HASH ||
  existingEleven.content_hash_sha256 !== EXPECTED_EXISTING_ELEVEN_HASH ||
  existingTwentyThree.content_hash_sha256 !== EXPECTED_EXISTING_TWENTY_THREE_HASH ||
  existingSixteen.content_hash_sha256 !== EXPECTED_EXISTING_SIXTEEN_HASH ||
  existingNine.records.length +
    existingEleven.records.length +
    existingTwentyThree.records.length +
    existingSixteen.records.length !==
    59
) {
  errors.push("existing 59 governed Draugas records are not the expected live base");
}
if (projection.records?.length !== 24) {
  errors.push(`expected exactly 24 tranche 4 records; got ${projection.records?.length}`);
}
if (
  projection.record_counts?.public_record_count !== 24 ||
  projection.record_counts?.core_parish_reference !== 23 ||
  projection.record_counts?.supplemental_reference !== 1 ||
  JSON.stringify(projection.record_counts?.by_public_profile) !==
    JSON.stringify(expectedProfileCounts)
) {
  errors.push("tranche 4 profile/class counts drifted");
}

const duplicateGuards = new Map(
  (projection.duplicate_guard_refs ?? []).map((guard) => [
    guard.artifact_role,
    guard.sha256,
  ]),
);
if (
  duplicateGuards.get("existing_nine_record_live_projection_duplicate_guard") !==
    EXPECTED_EXISTING_NINE_HASH ||
  duplicateGuards.get("prior_parish_centered_title_focus_tranche1_duplicate_guard") !==
    EXPECTED_EXISTING_ELEVEN_HASH ||
  duplicateGuards.get("prior_parish_centered_title_focus_tranche2_duplicate_guard") !==
    EXPECTED_EXISTING_TWENTY_THREE_HASH ||
  duplicateGuards.get("prior_parish_centered_title_focus_tranche3_duplicate_guard") !==
    EXPECTED_EXISTING_SIXTEEN_HASH
) {
  errors.push("tranche 4 duplicate guards do not pin the existing 59 records");
}

const publicationByEntity = new Map(
  publication.public_institutions.map((row) => [row.culturenet_entity_id, row]),
);
const previousRows = [
  ...existingNine.records,
  ...existingEleven.records,
  ...existingTwentyThree.records,
  ...existingSixteen.records,
];
const previousIds = new Set(previousRows.map(sourceRecordId));
const previousLocators = new Set(previousRows.map(locatorKey));
const trancheIds = new Set();
const trancheCandidateIds = new Set();
const trancheLocators = new Set();
const trancheProfiles = new Set();

for (const row of projection.records ?? []) {
  const stableId = sourceRecordId(row);
  if (!stableId) errors.push(`${row.candidate_page_id}: missing source_record_id`);
  if (!expectedSourceIds.has(stableId)) {
    errors.push(`${stableId}: unexpected tranche 4 source record ID`);
  }
  if (trancheIds.has(stableId)) {
    errors.push(`duplicate tranche 4 source record ID: ${stableId}`);
  }
  trancheIds.add(stableId);
  if (previousIds.has(stableId)) {
    errors.push(`${stableId}: duplicates an existing governed Draugas row`);
  }
  if (trancheCandidateIds.has(row.candidate_page_id)) {
    errors.push(`${row.candidate_page_id}: duplicate tranche 4 candidate page`);
  }
  trancheCandidateIds.add(row.candidate_page_id);
  const normalizedLocator = locatorKey(row);
  if (trancheLocators.has(normalizedLocator)) {
    errors.push(`${stableId}: duplicate tranche 4 canonical/profile/date/page locator`);
  }
  trancheLocators.add(normalizedLocator);
  if (previousLocators.has(normalizedLocator)) {
    errors.push(`${stableId}: duplicates an existing governed canonical/profile/date/page locator`);
  }
  trancheProfiles.add(row.public_profile);
  const institution = publicationByEntity.get(row.canonical_entity_id);
  if (!institution || institution.public_profile !== row.public_profile) {
    errors.push(`${stableId}: canonical entity/public profile join drifted`);
  }
  if (
    [
      "/parishes/sv-jurgio-chicago-il",
      "/parishes/sv-jurgio-norwood-ma",
      "/parishes/sv-jurgio-rochester-ny",
      "/parishes/sv-jurgio-shenandoah-pa",
    ].includes(row.public_profile)
  ) {
    errors.push(`${stableId}: tranche 4 reintroduced an earlier St. George pilot profile`);
  }
  if (!allowedTitleStates.has(row.title_state)) {
    errors.push(`${stableId}: invalid title_state ${row.title_state}`);
  }
  if (
    row.public_display_class === "supplemental_reference" &&
    row.badge_label !== "Supplemental"
  ) {
    errors.push(`${stableId}: supplemental row is missing Brain badge`);
  }
  if (
    row.public_display_class === "core_parish_reference" &&
    row.badge_label !== null
  ) {
    errors.push(`${stableId}: core row has a supplemental badge`);
  }
  if (
    expectedSupplementalIds.has(stableId) !==
    (row.public_display_class === "supplemental_reference")
  ) {
    errors.push(`${stableId}: supplemental/core ID set drifted`);
  }
  if (
    row.rights?.quote_policy !== "citation_metadata_only" ||
    row.rights?.public_release_allowed !== true ||
    row.rights?.raw_text_allowed_in_git !== false ||
    row.historical_claim_adjudication_state !== "not_adjudicated"
  ) {
    errors.push(`${stableId}: rights or historical claim gate drifted`);
  }
  try {
    const page = new URL(row.page_url);
    if (
      page.protocol !== "https:" ||
      page.hostname.replace(/^www\./, "") !== "draugas.org" ||
      !page.pathname.endsWith(".pdf") ||
      page.hash !== `#page=${row.pdf_page}`
    ) {
      errors.push(`${stableId}: exact PDF page URL is invalid`);
    }
  } catch {
    errors.push(`${stableId}: exact PDF page URL is invalid`);
  }
}

if (trancheIds.size !== expectedSourceIds.size) {
  errors.push("tranche 4 source record ID set is incomplete");
}
if (trancheProfiles.size !== Object.keys(expectedProfileCounts).length) {
  errors.push("tranche 4 does not cover the exact expected 14 parish profiles");
}
if (previousIds.size + trancheIds.size !== 83) {
  errors.push("existing 59 + tranche 4 24 governed Draugas IDs do not total 83 unique rows");
}

const genericTitlePattern =
  /^Draugas(?: issue)?(?:\s*[·—-]\s*|,\s*)\d{4}-\d{2}-\d{2}(?:\s*[,·—-]\s*p(?:p)?\.\s*\d+(?:\s*[-–]\s*\d+)?)?$/i;
for (const row of projection.records ?? []) {
  if (genericTitlePattern.test(row.display_title)) {
    errors.push(`${sourceRecordId(row)}: generic issue/date title entered tranche 4`);
  }
}

const walk = (value, path = "projection") => {
  if (Array.isArray(value)) {
    value.forEach((child, index) => walk(child, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) {
      errors.push(`${path}.${key}: forbidden source or claim payload`);
    }
    if (
      typeof child === "string" &&
      ["/Volumes/", "/Users/", "file://"].some((marker) => child.includes(marker))
    ) {
      errors.push(`${path}.${key}: local filesystem path leaked`);
    }
    walk(child, `${path}.${key}`);
  }
};
walk(projection);

const importer = readFileSync(
  join(root, "scripts/import-brain-projections.mjs"),
  "utf8",
);
const loader = readFileSync(join(root, "lib/draugas-newspaper-records.ts"), "utf8");
const ledger = readFileSync(join(root, "components/ProfileSourceLedger.tsx"), "utf8");
const profile = readFileSync(join(root, "app/parishes/[slug]/page.tsx"), "utf8");
const profileSources = readFileSync(join(root, "lib/profile-sources.ts"), "utf8");
const packageJson = readFileSync(join(root, "package.json"), "utf8");

for (const [source, token, label] of [
  [
    importer,
    "draugas-parish-centered-title-focus-tranche4-2026-08-17/record-set.json",
    "Brain import",
  ],
  [loader, "titleFocusTranche4Data", "loader import"],
  [loader, "titleFocusTranche4.records.map", "loader record inclusion"],
  [loader, "titleFocusRecordId(record)", "stable ID normalization"],
  [loader, "referenceClass: record.public_display_class", "Brain display class"],
  [loader, "badgeLabel: record.badge_label ?? undefined", "Brain badge label"],
  [loader, "identityKey(record.canonicalEntityId, record.publicProfile)", "strict join"],
  [loader, "contexts: []", "claim-free source rows"],
  [profile, "draugasNewspaperProfileSources", "profile-only source join"],
  [profile, "<ProfileSourceLedger", "profile source ledger"],
  [ledger, 'label: "Newspapers and periodicals"', "newspaper source group"],
  [ledger, 'referenceClass === "supplemental_reference"', "core-before-supplemental sort"],
  [ledger, "{source.badgeLabel}", "Supplemental badge rendering"],
  [ledger, "!isDraugasProfileSource(source)", "Draugas excerpt suppression"],
  [profileSources, 'isDraugas ? "newspaper" : options.group', "Draugas newspaper grouping"],
  [packageJson, "verify-draugas-title-focus-tranche4.mjs", "data verification chain"],
]) {
  if (!source.includes(token)) errors.push(`${label} is missing ${token}`);
}

for (const forbidden of ["reviewed_topic_targets", "supplemental_reason"]) {
  if (loader.includes(forbidden)) {
    errors.push(`consumer must not infer public display from ${forbidden}`);
  }
}

for (const relativePath of [
  "app/page.tsx",
  "app/parishes/page.tsx",
  "app/lithuanian-catholic-life-today/page.tsx",
  "components/AllProfilesDirectory.tsx",
  "components/AllProfilesTimeline.tsx",
  "lib/living-network-view.ts",
]) {
  const source = readFileSync(join(root, relativePath), "utf8");
  for (const forbidden of [
    "canonical-draugas-parish-centered-title-focus-tranche4",
    "titleFocusTranche4Data",
  ]) {
    if (source.includes(forbidden)) {
      errors.push(`${relativePath}: tranche 4 records escaped the parish profile ledger`);
    }
  }
}

if (errors.length) {
  console.error(`DRAUGAS TITLE-FOCUS TRANCHE 4 VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(
  "OK: 24 Brain-governed Draugas title-focus tranche 4 records join only to 14 parish newspaper ledgers; total governed Draugas profile records is 83.",
);
