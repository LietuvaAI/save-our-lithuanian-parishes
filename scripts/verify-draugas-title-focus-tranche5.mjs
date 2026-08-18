import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const readJson = (relativePath) =>
  JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const projection = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche5.json",
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
const existingTwentyFour = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche4.json",
);
const publication = readJson("data/canonical-publication-projection.json");
const errors = [];

const EXPECTED_BRAIN_MERGE_COMMIT =
  "92566d649be154f64e8ca9c0d67bf724535769c0";
const EXPECTED_CONTENT_HASH =
  "ef45a541d7a31f02d19ca48e506ae499235695c393c1a44d47a361f8fb6d14a7";
const EXPECTED_SOURCE_PACKET_HASH =
  "115175a886f228b5b652830ec25d3a0d92ed3c5dd5f041315e845f5954a5d2bd";
const EXPECTED_SOURCE_OVERLAY_HASH =
  "65eced30eed413fb1306c27ae5b128a6c52a8012ea24f00040bd41493778552a";
const EXPECTED_EXISTING_NINE_HASH =
  "143118db45388cb94c1421623e0139428751b6606626d5b51d5ea7b4a3b4e742";
const EXPECTED_EXISTING_ELEVEN_HASH =
  "b424efefe2131d8c940a9dfb4b795c1d203d0decb9aaf233e404fbd664e8e577";
const EXPECTED_EXISTING_TWENTY_THREE_HASH =
  "b48298625bb12af955687661a8bf5f4af8556cf84d5fa1747bd6b772b77e69cf";
const EXPECTED_EXISTING_SIXTEEN_HASH =
  "a6439fd0f25bff4c24b07896c592db37e190ca629d1282c4adb33b3395da1ae8";
const EXPECTED_EXISTING_TWENTY_FOUR_HASH =
  "47f1cce4d627f02fbead779ddbfa5d58dc4fe1615160f75a8d8a686cd4d50cc8";
const expectedProfileCounts = {
  "/parishes/all-saints-chicago-il": 1,
  "/parishes/st-peter-kenosha-wi": 1,
  "/parishes/sv-andriejaus-new-britain-ct": 1,
  "/parishes/sv-kazimiero-amsterdam-ny": 1,
  "/parishes/sv-kazimiero-gary-in": 1,
  "/parishes/sv-kazimiero-kansas-city-mo": 1,
  "/parishes/sv-kazimiero-providence-ri": 1,
  "/parishes/sv-kazimiero-worcester-ma": 1,
  "/parishes/sv-marijos-apreiskimo-kingston-pa": 1,
  "/parishes/sv-petro-cambridge-ma": 2,
  "/parishes/sv-petro-detroit-mi": 1,
  "/parishes/sv-pranciskaus-east-chicago-in": 1,
  "/parishes/sv-pranciskaus-lawrence-ma": 1,
  "/parishes/svc-m-marijos-apreiskimo-brooklyn-ny": 1,
  "/parishes/svc-trejybes-wilkes-barre-pa": 1,
};
const expectedSourceIds = new Set([
  "solp:draugas-newspaper-record:draugas-1943-12-10-p4-holy-trinity-wilkes-barre-pa",
  "solp:draugas-newspaper-record:draugas-1917-12-04-p3-st-peter-kenosha-wi",
  "solp:draugas-newspaper-record:draugas-1994-05-19-p6-st-casimir-amsterdam-ny",
  "solp:draugas-newspaper-record:draugas-1994-05-19-p6-st-andrew-new-britain-ct",
  "solp:draugas-newspaper-record:draugas-1994-05-19-p6-st-casimir-worcester-ma",
  "solp:draugas-newspaper-record:draugas-1994-05-19-p6-st-casimir-providence-ri",
  "solp:draugas-newspaper-record:draugas-1994-05-19-p6-annunciation-bvm-williamsburg-ny",
  "solp:draugas-newspaper-record:draugas-1994-05-19-p6-immaculate-conception-cambridge-ma",
  "solp:draugas-newspaper-record:draugas-1910-04-21-p6-immaculate-conception-cambridge-ma",
  "solp:draugas-newspaper-record:draugas-1942-11-24-p4-st-mary-annunciation-kingston-pa",
  "solp:draugas-newspaper-record:draugas-1995-07-06-p2-st-peter-detroit-mi",
  "solp:draugas-newspaper-record:draugas-2003-09-09-p2-st-francis-lawrence-ma",
  "solp:draugas-newspaper-record:draugas-1998-06-10-p6-st-casimir-gary-in",
  "solp:draugas-newspaper-record:draugas-1947-12-31-p4-st-casimir-kansas-city-ks",
  "solp:draugas-newspaper-record:draugas-1987-09-19-p6-st-francis-east-chicago-in",
  "solp:draugas-newspaper-record:draugas-1910-07-07-p5-all-saints-chicago-il",
]);
const expectedSupplementalIds = new Set([
  "solp:draugas-newspaper-record:draugas-2003-09-09-p2-st-francis-lawrence-ma",
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
  errors.push("tranche 5 record-set hash does not match the pinned Brain projection");
}
if (
  projection.schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche5-v1" ||
  projection.controlling_record_schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche5-v1" ||
  projection.projection_state !==
    "held_draft_brain_reviewed_public_metadata_projection"
) {
  errors.push("unexpected tranche 5 projection contract");
}
if (
  projection.source_selection_packet_content_hash_sha256 !==
    EXPECTED_SOURCE_PACKET_HASH ||
  projection.source_overlay_content_hash_sha256 !== EXPECTED_SOURCE_OVERLAY_HASH
) {
  errors.push("tranche 5 source packet or title/focus overlay hash drifted");
}
if (
  existingNine.content_hash_sha256 !== EXPECTED_EXISTING_NINE_HASH ||
  existingEleven.content_hash_sha256 !== EXPECTED_EXISTING_ELEVEN_HASH ||
  existingTwentyThree.content_hash_sha256 !== EXPECTED_EXISTING_TWENTY_THREE_HASH ||
  existingSixteen.content_hash_sha256 !== EXPECTED_EXISTING_SIXTEEN_HASH ||
  existingTwentyFour.content_hash_sha256 !== EXPECTED_EXISTING_TWENTY_FOUR_HASH ||
  existingNine.records.length +
    existingEleven.records.length +
    existingTwentyThree.records.length +
    existingSixteen.records.length +
    existingTwentyFour.records.length !==
    83
) {
  errors.push("existing 83 governed Draugas records are not the expected live base");
}
if (projection.records?.length !== 16) {
  errors.push(`expected exactly 16 tranche 5 records; got ${projection.records?.length}`);
}
if (
  projection.record_counts?.public_record_count !== 16 ||
  projection.record_counts?.core_parish_reference !== 15 ||
  projection.record_counts?.supplemental_reference !== 1 ||
  JSON.stringify(projection.record_counts?.by_public_profile) !==
    JSON.stringify(expectedProfileCounts)
) {
  errors.push("tranche 5 profile/class counts drifted");
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
    EXPECTED_EXISTING_SIXTEEN_HASH ||
  duplicateGuards.get("prior_parish_centered_title_focus_tranche4_duplicate_guard") !==
    EXPECTED_EXISTING_TWENTY_FOUR_HASH
) {
  errors.push("tranche 5 duplicate guards do not pin the existing 83 records");
}

const publicationByEntity = new Map(
  publication.public_institutions.map((row) => [row.culturenet_entity_id, row]),
);
const previousRows = [
  ...existingNine.records,
  ...existingEleven.records,
  ...existingTwentyThree.records,
  ...existingSixteen.records,
  ...existingTwentyFour.records,
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
    errors.push(`${stableId}: unexpected tranche 5 source record ID`);
  }
  if (trancheIds.has(stableId)) {
    errors.push(`duplicate tranche 5 source record ID: ${stableId}`);
  }
  trancheIds.add(stableId);
  if (previousIds.has(stableId)) {
    errors.push(`${stableId}: duplicates an existing governed Draugas row`);
  }
  if (trancheCandidateIds.has(row.candidate_page_id)) {
    errors.push(`${row.candidate_page_id}: duplicate tranche 5 candidate page`);
  }
  trancheCandidateIds.add(row.candidate_page_id);
  const normalizedLocator = locatorKey(row);
  if (trancheLocators.has(normalizedLocator)) {
    errors.push(`${stableId}: duplicate tranche 5 canonical/profile/date/page locator`);
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
    errors.push(`${stableId}: tranche 5 reintroduced an earlier St. George pilot profile`);
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
  errors.push("tranche 5 source record ID set is incomplete");
}
if (trancheProfiles.size !== Object.keys(expectedProfileCounts).length) {
  errors.push("tranche 5 does not cover the exact expected 15 parish profiles");
}
if (previousIds.size + trancheIds.size !== 99) {
  errors.push("existing 83 + tranche 5 16 governed Draugas IDs do not total 99 unique rows");
}

const genericTitlePattern =
  /^Draugas(?: issue)?(?:\s*[·—-]\s*|,\s*)\d{4}-\d{2}-\d{2}(?:\s*[,·—-]\s*p(?:p)?\.\s*\d+(?:\s*[-–]\s*\d+)?)?$/i;
for (const row of projection.records ?? []) {
  if (genericTitlePattern.test(row.display_title)) {
    errors.push(`${sourceRecordId(row)}: generic issue/date title entered tranche 5`);
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
    "draugas-parish-centered-title-focus-tranche5-2026-08-17/record-set.json",
    "Brain import",
  ],
  [loader, "titleFocusTranche5Data", "loader import"],
  [loader, "titleFocusTranche5.records.map", "loader record inclusion"],
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
  [packageJson, "verify-draugas-title-focus-tranche5.mjs", "data verification chain"],
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
    "canonical-draugas-parish-centered-title-focus-tranche5",
    "titleFocusTranche5Data",
  ]) {
    if (source.includes(forbidden)) {
      errors.push(`${relativePath}: tranche 5 records escaped the parish profile ledger`);
    }
  }
}

if (errors.length) {
  console.error(`DRAUGAS TITLE-FOCUS TRANCHE 5 VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(
  "OK: 16 Brain-governed Draugas title-focus tranche 5 records join only to 15 parish newspaper ledgers; total governed Draugas profile records is 99.",
);
