import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const readJson = (relativePath) =>
  JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const projection = readJson("data/canonical-draugas-references.json");
const publication = readJson("data/canonical-publication-projection.json");
const errors = [];

const expected = [
  {
    candidate_id: "st-george-tranche2:1932-04-09-p2-chicago-bridgeport-ct-01",
    canonical_entity_id: "cn:institution:st-george-bridgeport-chicago-il",
    canonical_slug: "st-george-bridgeport-chicago-il",
    public_profile: "/parishes/sv-jurgio-chicago-il",
    issue_date: "1932-04-09",
    pdf_page: 2,
  },
  {
    candidate_id: "st-george-tranche2:1987-04-24-p4-norwood-milestone-01",
    canonical_entity_id: "cn:institution:st-george-norwood-ma",
    canonical_slug: "st-george-norwood-ma",
    public_profile: "/parishes/sv-jurgio-norwood-ma",
    issue_date: "1987-04-24",
    pdf_page: 4,
  },
  {
    candidate_id: "st-george-tranche2:1941-10-28-p2-rochester-milestone-01",
    canonical_entity_id: "cn:institution:st-george-lithuanian-rochester-ny",
    canonical_slug: "st-george-lithuanian-rochester-ny",
    public_profile: "/parishes/sv-jurgio-rochester-ny",
    issue_date: "1941-10-28",
    pdf_page: 2,
  },
  {
    candidate_id: "st-george-tranche2:2007-10-25-p5-shenandoah-correction-01",
    canonical_entity_id: "cn:institution:st-george-shenandoah-pa",
    canonical_slug: "st-george-shenandoah-pa",
    public_profile: "/parishes/sv-jurgio-shenandoah-pa",
    issue_date: "2007-10-25",
    pdf_page: 5,
  },
];
const expectedControls = {
  publication_allowed: true,
  public_projection_allowed: true,
  canonical_evidence: false,
  assertion_admission_allowed: false,
  relationship_promotion_allowed: false,
  sacred_core_write_allowed: false,
  solp_reference_display_allowed: true,
  contains_ocr_text: false,
  contains_page_text: false,
  contains_source_prose: false,
  contains_contextual_excerpts: false,
  contains_model_output: false,
  contains_raw_extraction_rows: false,
};
const forbiddenKeys = new Set([
  "contextual_excerpt",
  "excerpt",
  "ocr_text",
  "page_text",
  "source_prose",
  "raw_ocr",
  "raw_extraction_rows",
  "model_output",
  "assertions",
  "relationships",
  "canonical_entities",
  "profile_evidence",
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
const hashInput = structuredClone(projection);
delete hashInput.content_hash_sha256;
const contentHash = createHash("sha256")
  .update(`${JSON.stringify(sortValue(hashInput))}\n`)
  .digest("hex");
if (projection.content_hash_sha256 !== contentHash) {
  errors.push(
    `Draugas projection hash mismatch: ${projection.content_hash_sha256} != ${contentHash}`,
  );
}

if (
  projection.schema_version !==
    "culturenet-solp-draugas-reference-projection-v1" ||
  projection.publication_state !== "reviewed_public_reference_metadata"
) {
  errors.push("Draugas projection is not the reviewed-public metadata contract.");
}
if (JSON.stringify(projection.controls) !== JSON.stringify(expectedControls)) {
  errors.push("Draugas projection controls do not match the approved metadata-only gate.");
}
if (!Array.isArray(projection.records) || projection.records.length !== 4) {
  errors.push(`Draugas projection must contain exactly four rows; got ${projection.records?.length}.`);
}

const publicationByEntity = new Map(
  publication.public_institutions.map((row) => [row.culturenet_entity_id, row]),
);
for (const [index, expectedRow] of expected.entries()) {
  const row = projection.records?.[index];
  if (!row) continue;
  for (const field of [
    "candidate_id",
    "canonical_entity_id",
    "canonical_slug",
    "public_profile",
    "issue_date",
    "pdf_page",
  ]) {
    if (row[field] !== expectedRow[field]) {
      errors.push(`record ${index} ${field}=${row[field]} expected ${expectedRow[field]}`);
    }
  }
  const institution = publicationByEntity.get(row.canonical_entity_id);
  if (
    !institution ||
    institution.public_profile !== row.public_profile ||
    institution.canonical_slug !== row.canonical_slug
  ) {
    errors.push(`${row.reference_id}: canonical entity/profile join does not match Brain.`);
  }
  if (
    row.publication_state !== "reviewed_public_reference_metadata" ||
    row.source_review_state !== "source_checked" ||
    row.identity_decision_state !== "verified_same_as_canonical"
  ) {
    errors.push(`${row.reference_id}: source/identity/publication review state is not eligible.`);
  }
  if (
    row.rights?.public_release_allowed !== true ||
    row.rights?.quote_policy !== "citation_metadata_only" ||
    row.rights?.raw_text_allowed_in_git !== false
  ) {
    errors.push(`${row.reference_id}: rights are not citation-metadata-only.`);
  }
  try {
    const issue = new URL(row.issue_url);
    const page = new URL(row.page_url);
    if (
      issue.protocol !== "https:" ||
      issue.hostname !== "www.draugas.org" ||
      page.origin !== issue.origin ||
      page.pathname !== issue.pathname ||
      page.search !== issue.search ||
      page.hash !== `#page=${row.pdf_page}`
    ) {
      errors.push(`${row.reference_id}: issue/page URL binding is invalid.`);
    }
  } catch {
    errors.push(`${row.reference_id}: issue/page URL is invalid.`);
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
      errors.push(`${path}.${key}: forbidden research/source payload in public projection.`);
    }
    if (
      typeof child === "string" &&
      ["/Volumes/", "/Users/", "file://"].some((marker) => child.includes(marker))
    ) {
      errors.push(`${path}.${key}: local filesystem path leaked into public projection.`);
    }
    walk(child, `${path}.${key}`);
  }
};
walk(projection);

const importer = readFileSync(join(root, "scripts/import-brain-projections.mjs"), "utf8");
const loader = readFileSync(join(root, "lib/draugas-references.ts"), "utf8");
const profile = readFileSync(join(root, "app/parishes/[slug]/page.tsx"), "utf8");
const sourceLedger = readFileSync(join(root, "components/ProfileSourceLedger.tsx"), "utf8");
const profileSources = readFileSync(join(root, "lib/profile-sources.ts"), "utf8");
for (const [source, token, label] of [
  [importer, "docs/research/parish-canon/public-display/draugas-references.json", "Brain import"],
  [loader, "getDraugasReferencesForProfile", "canonical loader"],
  [loader, "draugasReferenceProfileSources", "source-ledger adapter"],
  [loader, 'group: "newspaper"', "newspaper source group"],
  [loader, "title: reference.display_label", "reviewed source title"],
  [loader, "citation: reference.citation_label", "reviewed citation"],
  [loader, "url: reference.page_url", "reviewed page link"],
  [loader, "reviewedPublicReference: true", "reviewed-reference marker"],
  [profile, "draugasReferenceProfileSources(draugasReferences)", "source-ledger render"],
  [sourceLedger, "source.reviewedPublicReference", "reviewed newspaper auto-open"],
  [profileSources, "draugas\\.org", "Draugas artifact classification"],
]) {
  if (!source.includes(token)) errors.push(`${label} is missing ${token}`);
}
for (const forbidden of ["getDraugasProfileLedger", "canonical-draugas-mention-projection"] ) {
  if (loader.includes(forbidden)) {
    errors.push(`retired/unreviewed Draugas surface token returned: ${forbidden}`);
  }
}
if (profile.includes("ProfileDraugasReferences")) {
  errors.push("reviewed Draugas references must render in the existing source ledger, not a standalone section.");
}

if (errors.length) {
  console.error(`REVIEWED DRAUGAS REFERENCE VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(
  "OK: 4 reviewed Draugas citation references join to the correct canonical parish profiles.",
);
