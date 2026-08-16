import projectionData from "@/data/canonical-draugas-newspaper-records.json";
import { publicInstitutions } from "@/lib/publication-projection";
import {
  finalizeProfileSources,
  type ProfileSource,
} from "@/lib/profile-sources";

type DraugasNewspaperRights = {
  rights_class: "public_periodical_archive_link";
  source_access: "public_web_archive";
  public_release_allowed: true;
  quote_policy: "citation_metadata_only";
  raw_text_allowed_in_git: false;
  model_processing_allowed: false;
  publication_notes: string;
};

export type DraugasNewspaperRecord = {
  source_record_id: string;
  canonical_entity_id: string;
  public_profile: string;
  issue_date: string;
  pdf_page: number;
  page_url: string;
  display_title: string;
  title_state: "exact_printed_headline" | "reviewed_section_heading";
  citation_label: string;
  rights: DraugasNewspaperRights;
  provenance_hashes: Record<string, string>;
  historical_claim_adjudication_state: string;
};

type DraugasNewspaperProjection = {
  schema_version: "culturenet-solp-draugas-newspaper-projection-v1";
  projection_id: string;
  publication_state: "reviewed_public_newspaper_metadata_projection";
  review_authority: string;
  reviewed_at: string;
  controls: {
    publication_allowed: true;
    solp_consumer_projection: true;
    solp_newspaper_display_allowed: true;
    solp_mutation_performed: false;
    canonical_evidence: false;
    assertion_admission_allowed: false;
    relationship_promotion_allowed: false;
    historical_claim_admission_allowed: false;
    sacred_core_write_allowed: false;
    contains_ocr_text: false;
    contains_page_text: false;
    contains_source_prose: false;
    contains_contextual_excerpts: false;
    contains_model_output: false;
    contains_raw_extraction_rows: false;
  };
  records: DraugasNewspaperRecord[];
  content_hash_sha256: string;
};

const projection = projectionData as DraugasNewspaperProjection;
const EXPECTED_CONTENT_HASH =
  "143118db45388cb94c1421623e0139428751b6606626d5b51d5ea7b4a3b4e742";
const EXPECTED_CONTROLS: DraugasNewspaperProjection["controls"] = {
  publication_allowed: true,
  solp_consumer_projection: true,
  solp_newspaper_display_allowed: true,
  solp_mutation_performed: false,
  canonical_evidence: false,
  assertion_admission_allowed: false,
  relationship_promotion_allowed: false,
  historical_claim_admission_allowed: false,
  sacred_core_write_allowed: false,
  contains_ocr_text: false,
  contains_page_text: false,
  contains_source_prose: false,
  contains_contextual_excerpts: false,
  contains_model_output: false,
  contains_raw_extraction_rows: false,
};

if (
  projection.schema_version !==
    "culturenet-solp-draugas-newspaper-projection-v1" ||
  projection.publication_state !==
    "reviewed_public_newspaper_metadata_projection" ||
  projection.content_hash_sha256 !== EXPECTED_CONTENT_HASH ||
  JSON.stringify(projection.controls) !== JSON.stringify(EXPECTED_CONTROLS) ||
  projection.records.length !== 9
) {
  throw new Error(
    "Draugas newspaper records are not the pinned nine-row reviewed metadata projection.",
  );
}

const publicationByEntity = new Map(
  publicInstitutions.map((institution) => [
    institution.culturenet_entity_id,
    institution,
  ]),
);
const recordsByIdentity = new Map<string, DraugasNewspaperRecord[]>();
const seenRecordIds = new Set<string>();

function identityKey(canonicalEntityId: string, publicProfile: string) {
  return `${canonicalEntityId}\u0000${publicProfile}`;
}

for (const record of projection.records) {
  if (seenRecordIds.has(record.source_record_id)) {
    throw new Error(`Duplicate Draugas newspaper record: ${record.source_record_id}`);
  }
  seenRecordIds.add(record.source_record_id);

  const institution = publicationByEntity.get(record.canonical_entity_id);
  if (!institution || institution.public_profile !== record.public_profile) {
    throw new Error(
      `${record.source_record_id}: canonical entity and public profile do not match the Brain publication projection.`,
    );
  }

  const pageUrl = new URL(record.page_url);
  if (
    pageUrl.protocol !== "https:" ||
    pageUrl.hostname.replace(/^www\./, "") !== "draugas.org" ||
    pageUrl.hash !== `#page=${record.pdf_page}` ||
    record.rights.public_release_allowed !== true ||
    record.rights.quote_policy !== "citation_metadata_only" ||
    record.rights.raw_text_allowed_in_git !== false ||
    !record.display_title.trim() ||
    !record.citation_label.trim()
  ) {
    throw new Error(`${record.source_record_id}: public newspaper metadata is invalid.`);
  }

  const key = identityKey(record.canonical_entity_id, record.public_profile);
  const existing = recordsByIdentity.get(key) ?? [];
  existing.push(record);
  recordsByIdentity.set(key, existing);
}

export function draugasNewspaperProfileSources(
  publicProfile: string,
  canonicalEntityId: string | null | undefined,
): ProfileSource[] {
  if (!canonicalEntityId) return [];
  const records =
    recordsByIdentity.get(identityKey(canonicalEntityId, publicProfile)) ?? [];
  return finalizeProfileSources(
    records.map((record) => ({
      id: record.source_record_id,
      group: "newspaper" as const,
      title: record.display_title,
      publisher: "Draugas",
      date: record.issue_date,
      citation: record.citation_label,
      url: record.page_url,
      contexts: [],
      additionalCitations: [],
      reviewedPublicReference: true,
    })),
  );
}
