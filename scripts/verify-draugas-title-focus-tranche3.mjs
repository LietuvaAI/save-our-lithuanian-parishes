import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const readJson = (relativePath) =>
  JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const projection = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche3.json",
);
const existingNine = readJson("data/canonical-draugas-newspaper-records.json");
const existingEleven = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche1.json",
);
const existingTwentyThree = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche2.json",
);
const publication = readJson("data/canonical-publication-projection.json");
const errors = [];

const EXPECTED_BRAIN_MERGE_COMMIT =
  "94c3088a1c6f5cb5f1b2935b59d6bcf9f89116c5";
const EXPECTED_CONTENT_HASH =
  "a6439fd0f25bff4c24b07896c592db37e190ca629d1282c4adb33b3395da1ae8";
const EXPECTED_SOURCE_PACKET_HASH =
  "36b82172cc95f97de0588e33bfccb934e696b3a7dd4b607c6b38ec5811c49fd1";
const EXPECTED_SOURCE_OVERLAY_HASH =
  "2751bd7385ff82d145a8517df14d5ffc40800bb641f00de12e6b9c6f12131b8a";
const EXPECTED_EXISTING_NINE_HASH =
  "143118db45388cb94c1421623e0139428751b6606626d5b51d5ea7b4a3b4e742";
const EXPECTED_EXISTING_ELEVEN_HASH =
  "b424efefe2131d8c940a9dfb4b795c1d203d0decb9aaf233e404fbd664e8e577";
const EXPECTED_EXISTING_TWENTY_THREE_HASH =
  "b48298625bb12af955687661a8bf5f4af8556cf84d5fa1747bd6b772b77e69cf";
const expectedProfileCounts = {
  "/parishes/ausros-vartu-manhattan-ny": 5,
  "/parishes/joseph-dubois-pa": 1,
  "/parishes/lithuanian-national-catholic-parish-waterbury-ct": 1,
  "/parishes/our-lady-of-siluva-mission-mundelein-il": 1,
  "/parishes/st-ann-beverly-shores-in": 1,
  "/parishes/sv-antano-cicero-il": 1,
  "/parishes/sv-kazimiero-cleveland-oh": 1,
  "/parishes/sv-kazimiero-los-angeles-ca": 1,
  "/parishes/sv-petro-boston-ma": 2,
  "/parishes/svc-m-marijos-nekalto-prasidejimo-chicago-il": 1,
  "/parishes/svc-mergeles-marijos-gimimo-chicago-il": 1,
};
const expectedSupplementalIds = new Set([
  "solp:draugas-newspaper-record:draugas-2008-04-22-p4-st-peter-south-boston-ma",
  "solp:draugas-newspaper-record:draugas-2019-03-30-p5-st-ann-beverly-shores-in",
  "solp:draugas-newspaper-record:draugas-2009-03-25-p12-st-anthony-cicero-il",
  "solp:draugas-newspaper-record:draugas-2010-06-05-p14-st-casimir-cleveland-lithuanian-oh",
  "solp:draugas-newspaper-record:draugas-2009-03-25-p12-immaculate-conception-brighton-park-chicago-il",
  "solp:draugas-newspaper-record:draugas-2008-09-06-p14-nativity-bvm-chicago-il",
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

if (EXPECTED_BRAIN_MERGE_COMMIT.length !== 40) {
  errors.push("Brain merge commit pin is malformed");
}
if (
  projection.content_hash_sha256 !== EXPECTED_CONTENT_HASH ||
  projection.content_hash_sha256 !== contentHash(projection)
) {
  errors.push("tranche 3 record-set hash does not match merged Brain #546");
}
if (
  projection.schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche3-v1" ||
  projection.controlling_record_schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche3-v1" ||
  projection.projection_state !==
    "held_draft_brain_reviewed_public_metadata_projection"
) {
  errors.push("unexpected tranche 3 projection contract");
}
if (
  projection.source_selection_packet_content_hash_sha256 !==
    EXPECTED_SOURCE_PACKET_HASH ||
  projection.source_overlay_content_hash_sha256 !== EXPECTED_SOURCE_OVERLAY_HASH
) {
  errors.push("tranche 3 source packet or title/focus overlay hash drifted");
}
if (
  existingNine.content_hash_sha256 !== EXPECTED_EXISTING_NINE_HASH ||
  existingEleven.content_hash_sha256 !== EXPECTED_EXISTING_ELEVEN_HASH ||
  existingTwentyThree.content_hash_sha256 !== EXPECTED_EXISTING_TWENTY_THREE_HASH ||
  existingNine.records.length + existingEleven.records.length + existingTwentyThree.records.length !==
    43
) {
  errors.push("existing 43 governed Draugas records are not the expected live base");
}
if (projection.records?.length !== 16) {
  errors.push(`expected exactly 16 tranche 3 records; got ${projection.records?.length}`);
}
if (
  projection.record_counts?.public_record_count !== 16 ||
  projection.record_counts?.core_parish_reference !== 10 ||
  projection.record_counts?.supplemental_reference !== 6 ||
  JSON.stringify(projection.record_counts?.by_public_profile) !==
    JSON.stringify(expectedProfileCounts)
) {
  errors.push("tranche 3 profile/class counts drifted");
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
    EXPECTED_EXISTING_TWENTY_THREE_HASH
) {
  errors.push("tranche 3 duplicate guards do not pin the existing 43 records");
}

const publicationByEntity = new Map(
  publication.public_institutions.map((row) => [row.culturenet_entity_id, row]),
);
const previousIds = new Set([
  ...existingNine.records.map((row) => row.source_record_id),
  ...existingEleven.records.map((row) => row.source_record_id ?? row.record_id),
  ...existingTwentyThree.records.map((row) => row.source_record_id),
]);
const trancheIds = new Set();
const trancheCandidateIds = new Set();

for (const row of projection.records ?? []) {
  if (!row.source_record_id) errors.push(`${row.candidate_page_id}: missing source_record_id`);
  if (trancheIds.has(row.source_record_id)) {
    errors.push(`duplicate tranche 3 source record ID: ${row.source_record_id}`);
  }
  trancheIds.add(row.source_record_id);
  if (previousIds.has(row.source_record_id)) {
    errors.push(`${row.source_record_id}: duplicates an existing governed Draugas row`);
  }
  if (trancheCandidateIds.has(row.candidate_page_id)) {
    errors.push(`${row.candidate_page_id}: duplicate tranche 3 candidate page`);
  }
  trancheCandidateIds.add(row.candidate_page_id);
  const institution = publicationByEntity.get(row.canonical_entity_id);
  if (!institution || institution.public_profile !== row.public_profile) {
    errors.push(`${row.source_record_id}: canonical entity/public profile join drifted`);
  }
  if (
    row.public_profile.includes("sv-jurgio-") ||
    row.canonical_entity_id.includes("st-george")
  ) {
    errors.push(`${row.source_record_id}: tranche 3 reintroduced St. George rows`);
  }
  if (row.candidate_page_id.includes("allsaints-worcester-ma")) {
    errors.push(`${row.source_record_id}: held Worcester row entered tranche 3`);
  }
  if (!allowedTitleStates.has(row.title_state)) {
    errors.push(`${row.source_record_id}: invalid title_state ${row.title_state}`);
  }
  if (
    row.public_display_class === "supplemental_reference" &&
    row.badge_label !== "Supplemental"
  ) {
    errors.push(`${row.source_record_id}: supplemental row is missing Brain badge`);
  }
  if (
    row.public_display_class === "core_parish_reference" &&
    row.badge_label !== null
  ) {
    errors.push(`${row.source_record_id}: core row has a supplemental badge`);
  }
  if (
    expectedSupplementalIds.has(row.source_record_id) !==
    (row.public_display_class === "supplemental_reference")
  ) {
    errors.push(`${row.source_record_id}: supplemental/core ID set drifted`);
  }
  if (
    row.rights?.quote_policy !== "citation_metadata_only" ||
    row.rights?.public_release_allowed !== true ||
    row.rights?.raw_text_allowed_in_git !== false ||
    row.historical_claim_adjudication_state !== "not_adjudicated"
  ) {
    errors.push(`${row.source_record_id}: rights or historical claim gate drifted`);
  }
  try {
    const page = new URL(row.page_url);
    if (
      page.protocol !== "https:" ||
      page.hostname.replace(/^www\./, "") !== "draugas.org" ||
      !page.pathname.endsWith(".pdf") ||
      page.hash !== `#page=${row.pdf_page}`
    ) {
      errors.push(`${row.source_record_id}: exact PDF page URL is invalid`);
    }
  } catch {
    errors.push(`${row.source_record_id}: exact PDF page URL is invalid`);
  }
}

if (previousIds.size + trancheIds.size !== 59) {
  errors.push("existing 43 + tranche 3 16 governed Draugas IDs do not total 59 unique rows");
}

const genericTitlePattern =
  /^Draugas(?: issue)?(?:\s*[·—-]\s*|,\s*)\d{4}-\d{2}-\d{2}(?:\s*[,·—-]\s*p(?:p)?\.\s*\d+(?:\s*[-–]\s*\d+)?)?$/i;
for (const row of projection.records ?? []) {
  if (genericTitlePattern.test(row.display_title)) {
    errors.push(`${row.source_record_id}: generic issue/date title entered tranche 3`);
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
    "draugas-parish-centered-title-focus-tranche3-2026-08-17/record-set.json",
    "Brain import",
  ],
  [loader, "titleFocusTranche3Data", "loader import"],
  [loader, "titleFocusTranche3.records.map", "loader record inclusion"],
  [loader, "titleFocusRecordId(record)", "stable ID normalization"],
  [loader, "referenceClass: record.public_display_class", "Brain display class"],
  [loader, "badgeLabel: record.badge_label ?? undefined", "Brain badge label"],
  [loader, "supplementalReason: record.supplemental_reason ?? undefined", "Brain supplemental reason"],
  [loader, "identityKey(record.canonicalEntityId, record.publicProfile)", "strict join"],
  [loader, "contexts: []", "claim-free source rows"],
  [profile, "draugasNewspaperProfileSources", "profile-only source join"],
  [profile, "<ProfileSourceLedger", "profile source ledger"],
  [ledger, 'label: "Newspapers and periodicals"', "newspaper source group"],
  [ledger, 'referenceClass === "supplemental_reference"', "core-before-supplemental sort"],
  [ledger, "{source.badgeLabel}", "Supplemental badge rendering"],
  [ledger, "source.supplementalReason", "Supplemental reason rendering"],
  [ledger, "!isDraugasProfileSource(source)", "Draugas excerpt suppression"],
  [profileSources, 'isDraugas ? "newspaper" : options.group', "Draugas newspaper grouping"],
  [packageJson, "verify-draugas-title-focus-tranche3.mjs", "data verification chain"],
]) {
  if (!source.includes(token)) errors.push(`${label} is missing ${token}`);
}

for (const forbidden of ["reviewed_topic_targets"]) {
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
    "canonical-draugas-parish-centered-title-focus-tranche3",
    "titleFocusTranche3Data",
  ]) {
    if (source.includes(forbidden)) {
      errors.push(`${relativePath}: tranche 3 records escaped the parish profile ledger`);
    }
  }
}

if (errors.length) {
  console.error(`DRAUGAS TITLE-FOCUS TRANCHE 3 VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(
  "OK: 16 Brain-governed Draugas title-focus tranche 3 records join only to 11 parish newspaper ledgers; total governed Draugas profile records is 59.",
);
