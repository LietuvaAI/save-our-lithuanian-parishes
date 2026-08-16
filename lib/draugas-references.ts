import projectionData from "@/data/canonical-draugas-references.json";
import { publicInstitutions } from "@/lib/publication-projection";

export type DraugasReferenceRights = {
  rights_class: "public_periodical_archive_link";
  source_access: "public_web_archive";
  public_release_allowed: true;
  quote_policy: "citation_metadata_only";
  raw_text_allowed_in_git: false;
  model_processing_allowed: false;
  publication_notes: string;
};

export type DraugasReference = {
  reference_id: string;
  reference_page_id: string;
  candidate_id: string;
  occurrence_id: string;
  canonical_entity_id: string;
  canonical_slug: string;
  public_profile: string;
  source_label: "Draugas";
  citation_label: string;
  issue_date: string;
  pdf_page: number;
  issue_page_locator: string;
  section_label: string;
  display_label: string;
  description: "Reviewed Draugas archive reference for this parish profile.";
  issue_url: string;
  page_url: string;
  stable_issue_id: string;
  source_publication: "Draugas";
  source_review_state: "source_checked";
  identity_decision_state: "verified_same_as_canonical";
  publication_state: "reviewed_public_reference_metadata";
  rights: DraugasReferenceRights;
  provenance_hashes: Record<string, string>;
};

type DraugasReferenceProjection = {
  schema_version: "culturenet-solp-draugas-reference-projection-v1";
  projection_id: string;
  publication_state: "reviewed_public_reference_metadata";
  controls: {
    publication_allowed: true;
    public_projection_allowed: true;
    canonical_evidence: false;
    assertion_admission_allowed: false;
    relationship_promotion_allowed: false;
    sacred_core_write_allowed: false;
    solp_reference_display_allowed: true;
    contains_ocr_text: false;
    contains_page_text: false;
    contains_source_prose: false;
    contains_contextual_excerpts: false;
    contains_model_output: false;
    contains_raw_extraction_rows: false;
  };
  records: DraugasReference[];
};

const projection = projectionData as DraugasReferenceProjection;
const expectedControls: DraugasReferenceProjection["controls"] = {
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

if (
  projection.schema_version !==
    "culturenet-solp-draugas-reference-projection-v1" ||
  projection.publication_state !== "reviewed_public_reference_metadata" ||
  JSON.stringify(projection.controls) !== JSON.stringify(expectedControls)
) {
  throw new Error("Draugas references are not an approved reviewed-public metadata projection.");
}

const publicationByEntity = new Map(
  publicInstitutions.map((institution) => [
    institution.culturenet_entity_id,
    institution,
  ]),
);
const referencesByProfile = new Map<string, DraugasReference[]>();
const seenReferenceIds = new Set<string>();

for (const reference of projection.records) {
  if (seenReferenceIds.has(reference.reference_id)) {
    throw new Error(`Duplicate Draugas reference ID: ${reference.reference_id}`);
  }
  seenReferenceIds.add(reference.reference_id);
  const institution = publicationByEntity.get(reference.canonical_entity_id);
  if (!institution) {
    throw new Error(
      `${reference.reference_id}: canonical institution is not in the public Brain projection.`,
    );
  }
  if (
    institution.public_profile !== reference.public_profile ||
    institution.canonical_slug !== reference.canonical_slug
  ) {
    throw new Error(
      `${reference.reference_id}: canonical identity and public profile route do not match.`,
    );
  }
  if (
    reference.publication_state !== "reviewed_public_reference_metadata" ||
    reference.source_review_state !== "source_checked" ||
    reference.identity_decision_state !== "verified_same_as_canonical" ||
    reference.rights.public_release_allowed !== true ||
    reference.rights.quote_policy !== "citation_metadata_only"
  ) {
    throw new Error(`${reference.reference_id}: reference is not eligible for public display.`);
  }
  const existing = referencesByProfile.get(reference.public_profile) ?? [];
  existing.push(reference);
  referencesByProfile.set(reference.public_profile, existing);
}

export function getDraugasReferencesForProfile(
  publicProfile: string,
  canonicalEntityId: string | null | undefined,
): DraugasReference[] {
  if (!canonicalEntityId) return [];
  return (referencesByProfile.get(publicProfile) ?? []).filter(
    (reference) => reference.canonical_entity_id === canonicalEntityId,
  );
}
