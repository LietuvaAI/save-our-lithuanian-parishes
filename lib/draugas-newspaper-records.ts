import projectionData from "@/data/canonical-draugas-newspaper-records.json";
import titleFocusData from "@/data/canonical-draugas-parish-centered-title-focus-tranche1.json";
import titleFocusHeldData from "@/data/canonical-draugas-parish-centered-title-focus-tranche1-held.json";
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

type TitleFocusRecord = {
  record_id: string;
  candidate_page_id: string;
  canonical_entity_id: string;
  public_profile: string;
  issue_date: string;
  pdf_page: number;
  page_url: string;
  display_title: string;
  title_state: "exact_printed_headline" | "reviewed_section_heading";
  citation_label: string;
  public_display_class: "core_parish_reference" | "supplemental_reference";
  badge_label: "Supplemental" | null;
  rights: DraugasNewspaperRights;
  provenance_hashes: Record<string, string>;
  historical_claim_adjudication_state: "not_adjudicated";
};

type TitleFocusProjection = {
  schema_version: "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-v1";
  record_set_id: string;
  controls: Record<string, boolean>;
  held_candidate_page_ids: string[];
  record_counts: {
    public_record_count: 11;
    held_disposition_count: 3;
    core_parish_reference: 6;
    supplemental_reference: 5;
    by_public_profile: Record<string, number>;
  };
  records: TitleFocusRecord[];
  content_hash_sha256: string;
};

type TitleFocusHeldProjection = {
  schema_version: "culturenet-draugas-parish-centered-title-focus-held-dispositions-v1";
  held_candidate_page_ids: string[];
  held_dispositions: Array<{
    candidate_page_id: string;
    public_record_created: false;
    disposition_state: "held_collision_or_focus_uncertain";
  }>;
  content_hash_sha256: string;
};

type GovernedDraugasRecord = {
  sourceRecordId: string;
  candidatePageId?: string;
  canonicalEntityId: string;
  publicProfile: string;
  issueDate: string;
  pdfPage: number;
  pageUrl: string;
  displayTitle: string;
  citationLabel: string;
  rights: DraugasNewspaperRights;
  referenceClass?: "core_parish_reference" | "supplemental_reference";
  badgeLabel?: string;
};

const projection = projectionData as DraugasNewspaperProjection;
const titleFocus = titleFocusData as TitleFocusProjection;
const titleFocusHeld = titleFocusHeldData as TitleFocusHeldProjection;
const EXPECTED_CONTENT_HASH =
  "143118db45388cb94c1421623e0139428751b6606626d5b51d5ea7b4a3b4e742";
const EXPECTED_TITLE_FOCUS_HASH =
  "b424efefe2131d8c940a9dfb4b795c1d203d0decb9aaf233e404fbd664e8e577";
const EXPECTED_TITLE_FOCUS_HELD_HASH =
  "b44a20a754ba8dee8266557d74d76efed81324c39d7651840476d13c241f9101";
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

const expectedTitleFocusProfileCounts = {
  "/parishes/sv-jurgio-norwood-ma": 4,
  "/parishes/sv-jurgio-chicago-il": 3,
  "/parishes/sv-jurgio-rochester-ny": 3,
  "/parishes/sv-jurgio-shenandoah-pa": 1,
};
const titleFocusCoreCount = titleFocus.records.filter(
  (record) => record.public_display_class === "core_parish_reference",
).length;
const titleFocusSupplementalCount = titleFocus.records.filter(
  (record) => record.public_display_class === "supplemental_reference",
).length;
if (
  titleFocus.schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-v1" ||
  titleFocus.content_hash_sha256 !== EXPECTED_TITLE_FOCUS_HASH ||
  titleFocus.records.length !== 11 ||
  titleFocus.record_counts.public_record_count !== 11 ||
  titleFocus.record_counts.held_disposition_count !== 3 ||
  titleFocus.record_counts.core_parish_reference !== 6 ||
  titleFocus.record_counts.supplemental_reference !== 5 ||
  titleFocusCoreCount !== 6 ||
  titleFocusSupplementalCount !== 5 ||
  JSON.stringify(titleFocus.record_counts.by_public_profile) !==
    JSON.stringify(expectedTitleFocusProfileCounts) ||
  titleFocus.controls.solp_profile_display_allowed !== true ||
  titleFocus.controls.homepage_update_allowed !== false ||
  titleFocus.controls.directory_cards_update_allowed !== false ||
  titleFocus.controls.books_grouping_allowed !== false ||
  titleFocus.controls.standalone_press_section_allowed !== false ||
  titleFocus.controls.comprehensive_spauda_page_allowed !== false ||
  titleFocus.controls.contains_excerpts !== false ||
  titleFocus.controls.contains_quotes !== false ||
  titleFocus.controls.contains_source_prose !== false
) {
  throw new Error(
    "Draugas title-focus records are not the pinned eleven-row reviewed metadata projection.",
  );
}

const heldCandidateIds = new Set(titleFocus.held_candidate_page_ids);
if (
  titleFocusHeld.schema_version !==
    "culturenet-draugas-parish-centered-title-focus-held-dispositions-v1" ||
  titleFocusHeld.content_hash_sha256 !== EXPECTED_TITLE_FOCUS_HELD_HASH ||
  titleFocusHeld.held_dispositions.length !== 3 ||
  titleFocusHeld.held_candidate_page_ids.length !== 3 ||
  titleFocusHeld.held_dispositions.some(
    (record) =>
      record.public_record_created !== false ||
      record.disposition_state !== "held_collision_or_focus_uncertain" ||
      !heldCandidateIds.has(record.candidate_page_id),
  ) ||
  titleFocus.records.some((record) => heldCandidateIds.has(record.candidate_page_id))
) {
  throw new Error("Held Draugas title-focus candidates entered the public record set.");
}

const publicationByEntity = new Map(
  publicInstitutions.map((institution) => [
    institution.culturenet_entity_id,
    institution,
  ]),
);
const recordsByIdentity = new Map<string, GovernedDraugasRecord[]>();
const seenRecordIds = new Set<string>();

function identityKey(canonicalEntityId: string, publicProfile: string) {
  return `${canonicalEntityId}\u0000${publicProfile}`;
}

const governedRecords: GovernedDraugasRecord[] = [
  ...projection.records.map((record) => ({
    sourceRecordId: record.source_record_id,
    canonicalEntityId: record.canonical_entity_id,
    publicProfile: record.public_profile,
    issueDate: record.issue_date,
    pdfPage: record.pdf_page,
    pageUrl: record.page_url,
    displayTitle: record.display_title,
    citationLabel: record.citation_label,
    rights: record.rights,
  })),
  ...titleFocus.records.map((record) => ({
    sourceRecordId: record.record_id,
    candidatePageId: record.candidate_page_id,
    canonicalEntityId: record.canonical_entity_id,
    publicProfile: record.public_profile,
    issueDate: record.issue_date,
    pdfPage: record.pdf_page,
    pageUrl: record.page_url,
    displayTitle: record.display_title,
    citationLabel: record.citation_label,
    rights: record.rights,
    referenceClass: record.public_display_class,
    badgeLabel: record.badge_label ?? undefined,
  })),
];

for (const record of governedRecords) {
  if (seenRecordIds.has(record.sourceRecordId)) {
    throw new Error(`Duplicate Draugas newspaper record: ${record.sourceRecordId}`);
  }
  seenRecordIds.add(record.sourceRecordId);

  const institution = publicationByEntity.get(record.canonicalEntityId);
  if (!institution || institution.public_profile !== record.publicProfile) {
    throw new Error(
      `${record.sourceRecordId}: canonical entity and public profile do not match the Brain publication projection.`,
    );
  }

  const pageUrl = new URL(record.pageUrl);
  if (
    pageUrl.protocol !== "https:" ||
    pageUrl.hostname.replace(/^www\./, "") !== "draugas.org" ||
    pageUrl.hash !== `#page=${record.pdfPage}` ||
    record.rights.public_release_allowed !== true ||
    record.rights.quote_policy !== "citation_metadata_only" ||
    record.rights.raw_text_allowed_in_git !== false ||
    !record.displayTitle.trim() ||
    !record.citationLabel.trim() ||
    (record.referenceClass === "supplemental_reference" &&
      record.badgeLabel !== "Supplemental") ||
    (record.referenceClass === "core_parish_reference" && record.badgeLabel)
  ) {
    throw new Error(`${record.sourceRecordId}: public newspaper metadata is invalid.`);
  }

  const key = identityKey(record.canonicalEntityId, record.publicProfile);
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
      id: record.sourceRecordId,
      group: "newspaper" as const,
      title: record.displayTitle,
      publisher: "Draugas",
      date: record.issueDate,
      citation: record.citationLabel,
      url: record.pageUrl,
      contexts: [],
      additionalCitations: [],
      reviewedPublicReference: true,
      referenceClass: record.referenceClass,
      badgeLabel: record.badgeLabel,
    })),
  );
}
