import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const projectionPath =
  "data/canonical-draugas-page-recovery-projection72.json";
const projectionBytes = readFileSync(join(root, projectionPath));
const projection = JSON.parse(projectionBytes.toString("utf8"));
const publication = JSON.parse(
  readFileSync(join(root, "data/canonical-publication-projection.json"), "utf8"),
);
const previousSets = [
  "data/canonical-draugas-newspaper-records.json",
  "data/canonical-draugas-parish-centered-title-focus-tranche1.json",
  "data/canonical-draugas-parish-centered-title-focus-tranche2.json",
  "data/canonical-draugas-parish-centered-title-focus-tranche3.json",
  "data/canonical-draugas-parish-centered-title-focus-tranche4.json",
  "data/canonical-draugas-parish-centered-title-focus-tranche5.json",
].map((path) => JSON.parse(readFileSync(join(root, path), "utf8")));
const errors = [];

const EXPECTED_BRAIN_MERGE_COMMIT =
  "ea85c531066f77d9d13ccab02957cb51183fd2a1";
const EXPECTED_CONTENT_HASH =
  "6494d98ca4352dc521afa3ec6e06ddb116357f160a171eb9c335334584df1a69";
const EXPECTED_FILE_HASH =
  "e9e8092206b2e6bdec553d4861fbfc3d9f094f1e1d73fd2f05277760327203cc";

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
    .update(JSON.stringify(sortValue(input)))
    .digest("hex");
};
const fileHash = createHash("sha256").update(projectionBytes).digest("hex");

if (!/^[0-9a-f]{40}$/.test(EXPECTED_BRAIN_MERGE_COMMIT)) {
  errors.push("Brain merge commit pin is malformed");
}
if (
  projection.schema_version !==
    "culturenet-draugas-page-recovery-public-record-set-72-v1" ||
  projection.content_hash_sha256 !== EXPECTED_CONTENT_HASH ||
  projection.content_hash_sha256 !== contentHash(projection) ||
  fileHash !== EXPECTED_FILE_HASH
) {
  errors.push("projection schema, content hash, or file hash is not the pinned Brain release");
}

const records = projection.records ?? [];
const recordIds = records.map((record) => record.source_record_id);
const uniqueRecordIds = new Set(recordIds);
const core = records.filter(
  (record) => record.public_display_class === "core_parish_reference",
);
const supplemental = records.filter(
  (record) => record.public_display_class === "supplemental_reference",
);
const titleStateCounts = Object.fromEntries(
  ["exact_printed_headline", "reviewed_section_heading", "untitled_item"].map(
    (state) => [state, records.filter((record) => record.title_state === state).length],
  ),
);
if (
  records.length !== 72 ||
  uniqueRecordIds.size !== 72 ||
  core.length !== 62 ||
  supplemental.length !== 10 ||
  JSON.stringify(titleStateCounts) !==
    JSON.stringify({
      exact_printed_headline: 60,
      reviewed_section_heading: 10,
      untitled_item: 2,
    }) ||
  projection.record_counts?.total !== 72 ||
  projection.record_counts?.core !== 62 ||
  projection.record_counts?.supplemental !== 10
) {
  errors.push("projection counts, title states, or unique record IDs drifted");
}

const priorIds = new Set(
  previousSets.flatMap((recordSet) =>
    recordSet.records.map((record) => record.source_record_id ?? record.record_id),
  ),
);
if (priorIds.size !== 99) {
  errors.push(`expected 99 previously governed IDs; found ${priorIds.size}`);
}
for (const id of uniqueRecordIds) {
  if (priorIds.has(id)) errors.push(`${id}: collides with a previously governed record`);
}

const institutions = new Map(
  publication.public_institutions.map((institution) => [
    institution.culturenet_entity_id,
    institution.public_profile,
  ]),
);
const forbiddenRawKeys = new Set([
  "contextual_excerpt",
  "excerpt",
  "ocr_text",
  "page_text",
  "quote",
  "quoted_text",
  "raw_ocr",
  "raw_text",
  "source_prose",
  "source_text",
]);
const walk = (value, path = "projection") => {
  if (Array.isArray(value)) {
    value.forEach((child, index) => walk(child, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenRawKeys.has(key)) errors.push(`${path}.${key}: raw text is forbidden`);
    walk(child, `${path}.${key}`);
  }
};
walk(projection);

for (const record of records) {
  if (institutions.get(record.canonical_entity_id) !== record.public_profile) {
    errors.push(`${record.source_record_id}: canonical entity/profile join mismatch`);
  }
  if (
    record.source_publication !== "Draugas" ||
    record.historical_claim_adjudication_state !== "not_adjudicated" ||
    !record.display_title?.trim() ||
    !record.citation_label?.trim() ||
    record.page_url !== `${record.issue_url}#page=${record.pdf_page}` ||
    record.rights?.quote_policy !== "citation_metadata_only" ||
    record.rights?.raw_text_allowed_in_git !== false ||
    record.rights?.public_release_allowed !== true
  ) {
    errors.push(`${record.source_record_id}: invalid public citation metadata`);
  }
  if (
    record.public_display_class === "supplemental_reference" &&
    (record.badge_label !== "Supplemental" || !record.supplemental_reason)
  ) {
    errors.push(`${record.source_record_id}: supplemental governance metadata missing`);
  }
  if (
    record.public_display_class === "core_parish_reference" &&
    (record.badge_label !== null || record.supplemental_reason !== null)
  ) {
    errors.push(`${record.source_record_id}: core record carries supplemental metadata`);
  }
}

if (
  records.some(
    (record) =>
      record.issue_date === "2026-08-08" ||
      record.source_record_id?.includes("2026-08-08"),
  )
) {
  errors.push("held Waterbury 2026-08-08 row entered the public projection");
}

const importer = readFileSync(
  join(root, "scripts/import-brain-projections.mjs"),
  "utf8",
);
const loader = readFileSync(join(root, "lib/draugas-newspaper-records.ts"), "utf8");
const ledger = readFileSync(join(root, "components/ProfileSourceLedger.tsx"), "utf8");
const profile = readFileSync(join(root, "app/parishes/[slug]/page.tsx"), "utf8");
const publicEligibility = readFileSync(
  join(root, "lib/public-source-eligibility.ts"),
  "utf8",
);
for (const [source, token, label] of [
  [
    importer,
    "draugas-page-recovery-projection72-2026-08-22/projection.json",
    "Brain import path",
  ],
  [loader, "pageRecoveryProjection72Data", "governed loader import"],
  [loader, "pageRecoveryProjection72.records.map", "72-row record inclusion"],
  [loader, "sourceRecordId: record.source_record_id", "stable source ID"],
  [loader, "canonicalEntityId: record.canonical_entity_id", "canonical entity join"],
  [loader, "publicProfile: record.public_profile", "canonical route join"],
  [loader, "displayTitle: record.display_title", "governed title"],
  [loader, "titleState: record.title_state", "governed title state"],
  [loader, "citationLabel: record.citation_label", "governed citation"],
  [loader, "pageUrl: record.page_url", "governed page URL"],
  [loader, "referenceClass: record.public_display_class", "governed display class"],
  [loader, "badgeLabel: record.badge_label ?? undefined", "governed badge"],
  [loader, "supplementalReason: record.supplemental_reason ?? undefined", "governed supplemental reason"],
  [profile, "draugasNewspaperProfileSources", "profile-only source join"],
  [profile, "<ProfileSourceLedger", "profile source ledger"],
  [ledger, 'label: "Newspapers and periodicals"', "newspaper ledger group"],
  [ledger, 'referenceClass === "supplemental_reference"', "core-first ordering"],
  [ledger, "source.supplementalReason", "supplemental reason display"],
  [ledger, "source.sourceTitleState", "governed title-state display"],
  [ledger, "!isDraugasProfileSource(source)", "Draugas excerpt suppression"],
  [
    publicEligibility,
    "isDraugasProfileSource(source) && !source.url",
    "unlinked held Draugas suppression",
  ],
]) {
  if (!source.includes(token)) errors.push(`${label} is missing ${token}`);
}
if (importer.includes("draugas-page-recovery-projection72-2026-08-22/held")) {
  errors.push("held dispositions were added to the Brain import workflow");
}
for (const forbidden of [
  "record.reviewed_topic_targets",
  "record.exact_printed_headline",
  "record.section_heading",
  "record.untitled_item_label",
]) {
  if (loader.includes(forbidden)) {
    errors.push(`consumer exposes non-display projection field ${forbidden}`);
  }
}
for (const relativePath of [
  "app/page.tsx",
  "app/parishes/page.tsx",
  "app/lithuanian-catholic-life-today/page.tsx",
  "components/AllProfilesDirectory.tsx",
  "components/AllProfilesTimeline.tsx",
]) {
  const source = readFileSync(join(root, relativePath), "utf8");
  if (
    source.includes("canonical-draugas-page-recovery-projection72") ||
    source.includes("pageRecoveryProjection72Data")
  ) {
    errors.push(`${relativePath}: projection72 escaped the parish profile ledger`);
  }
}

if (errors.length) {
  console.error(`DRAUGAS PAGE-RECOVERY PROJECTION72 VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(
  "OK: 72 Brain-governed Draugas page-recovery records join to 60 exact parish newspaper ledgers; 62 core + 10 supplemental; total governed profile inventory is 171.",
);
