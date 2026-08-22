import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const readJson = (relativePath) =>
  JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const projection = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche2.json",
);
const existingNine = readJson("data/canonical-draugas-newspaper-records.json");
const existingEleven = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche1.json",
);
const publication = readJson("data/canonical-publication-projection.json");
const errors = [];

const EXPECTED_BRAIN_MERGE_COMMIT =
  "98bdaec4adc4a2d3aa3d86611ecf52ccaf5947c5";
const EXPECTED_CONTENT_HASH =
  "b48298625bb12af955687661a8bf5f4af8556cf84d5fa1747bd6b772b77e69cf";
const EXPECTED_SOURCE_PACKET_HASH =
  "f88510e06ca955703501d45db7ef5c707b351ccdf4d6856d0866adaf100a6624";
const EXPECTED_SOURCE_OVERLAY_HASH =
  "38c3b91c2665c185ef8f574c27490354a1ee3db86f42c5f8e0dc8c29deae8c62";
const EXPECTED_EXISTING_NINE_HASH =
  "143118db45388cb94c1421623e0139428751b6606626d5b51d5ea7b4a3b4e742";
const EXPECTED_EXISTING_ELEVEN_HASH =
  "b424efefe2131d8c940a9dfb4b795c1d203d0decb9aaf233e404fbd664e8e577";
const expectedProfileCounts = {
  "/parishes/all-saints-wilkes-barre-pa": 3,
  "/parishes/allsaints-worcester-ma": 3,
  "/parishes/ausros-vartu-manhattan-ny": 4,
  "/parishes/dievo-apvaizdos-southfield-mi": 1,
  "/parishes/joseph-dubois-pa": 2,
  "/parishes/kristaus-atsimainymo-maspeth-ny": 1,
  "/parishes/pal-jurgio-matulaicio-misija-lemont-il": 1,
  "/parishes/sv-andriejaus-philadelphia-pa": 1,
  "/parishes/sv-mykolo-scranton-pa": 1,
  "/parishes/sv-petro-boston-ma": 4,
  "/parishes/svc-m-marijos-apreiskimo-brooklyn-ny": 1,
  "/parishes/svc-trejybes-hartford-ct": 1,
};
const expectedSupplementalIds = new Set([
  "solp:draugas-newspaper-record:draugas-1912-05-02-p8-st-joseph-dubois-pa",
  "solp:draugas-newspaper-record:draugas-2018-01-11-p4-st-joseph-dubois-pa",
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
  errors.push("tranche 2 record-set hash does not match merged Brain #542");
}
if (
  projection.schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche2-v1" ||
  projection.controlling_record_schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche2-v1" ||
  projection.projection_state !==
    "held_draft_brain_reviewed_public_metadata_projection"
) {
  errors.push("unexpected tranche 2 projection contract");
}
if (
  projection.source_selection_packet_content_hash_sha256 !==
    EXPECTED_SOURCE_PACKET_HASH ||
  projection.source_overlay_content_hash_sha256 !== EXPECTED_SOURCE_OVERLAY_HASH
) {
  errors.push("tranche 2 source packet or title/focus overlay hash drifted");
}
if (
  existingNine.content_hash_sha256 !== EXPECTED_EXISTING_NINE_HASH ||
  existingEleven.content_hash_sha256 !== EXPECTED_EXISTING_ELEVEN_HASH ||
  existingNine.records.length + existingEleven.records.length !== 20
) {
  errors.push("existing 20 governed Draugas records are not the expected live base");
}
if (projection.records?.length !== 23) {
  errors.push(`expected exactly 23 tranche 2 records; got ${projection.records?.length}`);
}
if (
  projection.record_counts?.public_record_count !== 23 ||
  projection.record_counts?.core_parish_reference !== 21 ||
  projection.record_counts?.supplemental_reference !== 2 ||
  JSON.stringify(projection.record_counts?.by_public_profile) !==
    JSON.stringify(expectedProfileCounts)
) {
  errors.push("tranche 2 profile/class counts drifted");
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
    EXPECTED_EXISTING_ELEVEN_HASH
) {
  errors.push("tranche 2 duplicate guards do not pin the existing 20 records");
}

const publicationByEntity = new Map(
  publication.public_institutions.map((row) => [row.culturenet_entity_id, row]),
);
const previousIds = new Set([
  ...existingNine.records.map((row) => row.source_record_id),
  ...existingEleven.records.map((row) => row.source_record_id ?? row.record_id),
]);
const trancheIds = new Set();
const trancheCandidateIds = new Set();

for (const row of projection.records ?? []) {
  if (!row.source_record_id) errors.push(`${row.candidate_page_id}: missing source_record_id`);
  if (trancheIds.has(row.source_record_id)) {
    errors.push(`duplicate tranche 2 source record ID: ${row.source_record_id}`);
  }
  trancheIds.add(row.source_record_id);
  if (previousIds.has(row.source_record_id)) {
    errors.push(`${row.source_record_id}: duplicates an existing governed Draugas row`);
  }
  if (trancheCandidateIds.has(row.candidate_page_id)) {
    errors.push(`${row.candidate_page_id}: duplicate tranche 2 candidate page`);
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
    errors.push(`${row.source_record_id}: tranche 2 reintroduced St. George rows`);
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

if (previousIds.size + trancheIds.size !== 43) {
  errors.push("existing 20 + tranche 2 23 governed Draugas IDs do not total 43 unique rows");
}

const genericTitlePattern =
  /^Draugas(?: issue)?(?:\s*[·—-]\s*|,\s*)\d{4}-\d{2}-\d{2}(?:\s*[,·—-]\s*p(?:p)?\.\s*\d+(?:\s*[-–]\s*\d+)?)?$/i;
for (const row of projection.records ?? []) {
  if (genericTitlePattern.test(row.display_title)) {
    errors.push(`${row.source_record_id}: generic issue/date title entered tranche 2`);
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
    "draugas-parish-centered-title-focus-tranche2-2026-08-16/record-set.json",
    "Brain import",
  ],
  [loader, "titleFocusTranche2Data", "loader import"],
  [loader, "titleFocusTranche2.records.map", "loader record inclusion"],
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
  [packageJson, "verify-draugas-title-focus-tranche2.mjs", "data verification chain"],
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
    "canonical-draugas-parish-centered-title-focus-tranche2",
    "titleFocusTranche2Data",
  ]) {
    if (source.includes(forbidden)) {
      errors.push(`${relativePath}: tranche 2 records escaped the parish profile ledger`);
    }
  }
}

if (errors.length) {
  console.error(`DRAUGAS TITLE-FOCUS TRANCHE 2 VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(
  "OK: 23 Brain-governed Draugas title-focus tranche 2 records join only to 12 parish newspaper ledgers; total governed Draugas profile records is 43.",
);
