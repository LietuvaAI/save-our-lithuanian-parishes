import projectionData from "@/data/canonical-draugas-newspaper-records.json";
import titleFocusData from "@/data/canonical-draugas-parish-centered-title-focus-tranche1.json";
import titleFocusHeldData from "@/data/canonical-draugas-parish-centered-title-focus-tranche1-held.json";
import titleFocusTranche2Data from "@/data/canonical-draugas-parish-centered-title-focus-tranche2.json";
import titleFocusTranche3Data from "@/data/canonical-draugas-parish-centered-title-focus-tranche3.json";
import titleFocusTranche4Data from "@/data/canonical-draugas-parish-centered-title-focus-tranche4.json";
import titleFocusTranche5Data from "@/data/canonical-draugas-parish-centered-title-focus-tranche5.json";
import pageRecoveryProjection72Data from "@/data/canonical-draugas-page-recovery-projection72.json";
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
  record_id?: string;
  source_record_id?: string;
  candidate_page_id: string;
  canonical_entity_id: string;
  public_profile: string;
  issue_date: string;
  pdf_page: number;
  page_url: string;
  display_title: string;
  title_state:
    | "exact_printed_headline"
    | "reviewed_section_heading"
    | "untitled_item";
  citation_label: string;
  public_display_class: "core_parish_reference" | "supplemental_reference";
  badge_label: "Supplemental" | null;
  supplemental_reason?: string | null;
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
    public_record_count: number;
    held_disposition_count?: number;
    core_parish_reference: number;
    supplemental_reference: number;
    by_public_profile: Record<string, number>;
  };
  records: TitleFocusRecord[];
  content_hash_sha256: string;
};

type TitleFocusTranche2Projection = Omit<
  TitleFocusProjection,
  "schema_version" | "held_candidate_page_ids"
> & {
  schema_version: "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche2-v1";
  controlling_record_schema_version: "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche2-v1";
  duplicate_guard_refs: Array<{
    artifact_role: string;
    ref: string;
    hash_kind: string;
    sha256: string;
  }>;
  source_overlay_content_hash_sha256: string;
  source_selection_packet_content_hash_sha256: string;
  scope_candidate_page_ids: string[];
};

type TitleFocusTranche3Projection = Omit<
  TitleFocusProjection,
  "schema_version" | "held_candidate_page_ids"
> & {
  schema_version: "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche3-v1";
  controlling_record_schema_version: "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche3-v1";
  duplicate_guard_refs: Array<{
    artifact_role: string;
    ref: string;
    hash_kind: string;
    sha256: string;
  }>;
  source_overlay_content_hash_sha256: string;
  source_selection_packet_content_hash_sha256: string;
  scope_candidate_page_ids: string[];
};

type TitleFocusTranche4Projection = Omit<
  TitleFocusProjection,
  "schema_version" | "held_candidate_page_ids"
> & {
  schema_version: "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche4-v1";
  controlling_record_schema_version: "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche4-v1";
  duplicate_guard_refs: Array<{
    artifact_role: string;
    ref: string;
    hash_kind: string;
    sha256: string;
  }>;
  source_overlay_content_hash_sha256: string;
  source_selection_packet_content_hash_sha256: string;
  scope_candidate_page_ids: string[];
};

type TitleFocusTranche5Projection = Omit<
  TitleFocusProjection,
  "schema_version" | "held_candidate_page_ids"
> & {
  schema_version: "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche5-v1";
  controlling_record_schema_version: "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche5-v1";
  duplicate_guard_refs: Array<{
    artifact_role: string;
    ref: string;
    hash_kind: string;
    sha256: string;
  }>;
  source_overlay_content_hash_sha256: string;
  source_selection_packet_content_hash_sha256: string;
  scope_candidate_page_ids: string[];
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

type PageRecoveryProjection72 = {
  schema_version: "culturenet-draugas-page-recovery-public-record-set-72-v1";
  record_set_id: string;
  projection_state: "held_draft_brain_reviewed_public_metadata_checkpoint";
  source_main_commit: string;
  reviewed_at: string;
  controls: {
    held_draft_brain_pr: true;
    reviewed_public_metadata_allowed: true;
    solp_profile_display_allowed_after_projection_merge_and_consumer_review: true;
    public_release_performed: false;
    solp_mutation_performed: false;
    site_deploy_performed: false;
    historical_claim_admission_allowed: false;
    canonical_evidence: false;
    canonical_write_allowed: false;
    assertion_write_allowed: false;
    relationship_write_allowed: false;
    sacred_core_write_allowed: false;
    ocr_or_model_extraction_allowed: false;
    source_text_or_excerpt_capture_allowed: false;
  };
  record_counts: {
    total: 72;
    core: 62;
    supplemental: 10;
    title_states: {
      exact_printed_headline: 60;
      reviewed_section_heading: 10;
      untitled_item: 2;
    };
  };
  records: Array<
    TitleFocusRecord & {
      schema_version: "culturenet-draugas-page-recovery-public-record-v1";
      source_record_id: string;
      source_publication: "Draugas";
      supplemental_reason: string | null;
      historical_claim_adjudication_state: "not_adjudicated";
    }
  >;
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
  titleState?: TitleFocusRecord["title_state"];
  referenceClass?: "core_parish_reference" | "supplemental_reference";
  badgeLabel?: string;
  supplementalReason?: string;
};

const projection = projectionData as DraugasNewspaperProjection;
const titleFocus = titleFocusData as TitleFocusProjection;
const titleFocusHeld = titleFocusHeldData as TitleFocusHeldProjection;
const titleFocusTranche2 = titleFocusTranche2Data as TitleFocusTranche2Projection;
const titleFocusTranche3 = titleFocusTranche3Data as TitleFocusTranche3Projection;
const titleFocusTranche4 = titleFocusTranche4Data as TitleFocusTranche4Projection;
const titleFocusTranche5 = titleFocusTranche5Data as TitleFocusTranche5Projection;
const pageRecoveryProjection72 =
  pageRecoveryProjection72Data as PageRecoveryProjection72;
const EXPECTED_CONTENT_HASH =
  "143118db45388cb94c1421623e0139428751b6606626d5b51d5ea7b4a3b4e742";
const EXPECTED_TITLE_FOCUS_HASH =
  "b424efefe2131d8c940a9dfb4b795c1d203d0decb9aaf233e404fbd664e8e577";
const EXPECTED_TITLE_FOCUS_HELD_HASH =
  "b44a20a754ba8dee8266557d74d76efed81324c39d7651840476d13c241f9101";
const EXPECTED_TITLE_FOCUS_TRANCHE2_HASH =
  "b48298625bb12af955687661a8bf5f4af8556cf84d5fa1747bd6b772b77e69cf";
const EXPECTED_TITLE_FOCUS_TRANCHE2_PACKET_HASH =
  "f88510e06ca955703501d45db7ef5c707b351ccdf4d6856d0866adaf100a6624";
const EXPECTED_TITLE_FOCUS_TRANCHE2_OVERLAY_HASH =
  "38c3b91c2665c185ef8f574c27490354a1ee3db86f42c5f8e0dc8c29deae8c62";
const EXPECTED_TITLE_FOCUS_TRANCHE3_HASH =
  "a6439fd0f25bff4c24b07896c592db37e190ca629d1282c4adb33b3395da1ae8";
const EXPECTED_TITLE_FOCUS_TRANCHE3_PACKET_HASH =
  "36b82172cc95f97de0588e33bfccb934e696b3a7dd4b607c6b38ec5811c49fd1";
const EXPECTED_TITLE_FOCUS_TRANCHE3_OVERLAY_HASH =
  "2751bd7385ff82d145a8517df14d5ffc40800bb641f00de12e6b9c6f12131b8a";
const EXPECTED_TITLE_FOCUS_TRANCHE4_HASH =
  "47f1cce4d627f02fbead779ddbfa5d58dc4fe1615160f75a8d8a686cd4d50cc8";
const EXPECTED_TITLE_FOCUS_TRANCHE4_PACKET_HASH =
  "f5665457f7a455ba097ea20eb57d1293d0a3d078c0a6fae4cd06eea86a9b8d7f";
const EXPECTED_TITLE_FOCUS_TRANCHE4_OVERLAY_HASH =
  "5986cfc4a931be1fce66ca776db2b9f2bda895f65dbd356b465a8a1595b6ae85";
const EXPECTED_TITLE_FOCUS_TRANCHE5_HASH =
  "ef45a541d7a31f02d19ca48e506ae499235695c393c1a44d47a361f8fb6d14a7";
const EXPECTED_TITLE_FOCUS_TRANCHE5_PACKET_HASH =
  "115175a886f228b5b652830ec25d3a0d92ed3c5dd5f041315e845f5954a5d2bd";
const EXPECTED_TITLE_FOCUS_TRANCHE5_OVERLAY_HASH =
  "65eced30eed413fb1306c27ae5b128a6c52a8012ea24f00040bd41493778552a";
const EXPECTED_PAGE_RECOVERY_72_HASH =
  "6494d98ca4352dc521afa3ec6e06ddb116357f160a171eb9c335334584df1a69";
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

const expectedTitleFocusTranche2ProfileCounts = {
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
const titleFocusTranche2CoreCount = titleFocusTranche2.records.filter(
  (record) => record.public_display_class === "core_parish_reference",
).length;
const titleFocusTranche2SupplementalCount = titleFocusTranche2.records.filter(
  (record) => record.public_display_class === "supplemental_reference",
).length;
if (
  titleFocusTranche2.schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche2-v1" ||
  titleFocusTranche2.controlling_record_schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche2-v1" ||
  titleFocusTranche2.content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE2_HASH ||
  titleFocusTranche2.source_selection_packet_content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE2_PACKET_HASH ||
  titleFocusTranche2.source_overlay_content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE2_OVERLAY_HASH ||
  titleFocusTranche2.records.length !== 23 ||
  titleFocusTranche2.record_counts.public_record_count !== 23 ||
  titleFocusTranche2.record_counts.core_parish_reference !== 21 ||
  titleFocusTranche2.record_counts.supplemental_reference !== 2 ||
  titleFocusTranche2CoreCount !== 21 ||
  titleFocusTranche2SupplementalCount !== 2 ||
  JSON.stringify(titleFocusTranche2.record_counts.by_public_profile) !==
    JSON.stringify(expectedTitleFocusTranche2ProfileCounts) ||
  titleFocusTranche2.controls.solp_profile_display_allowed !== true ||
  titleFocusTranche2.controls.homepage_update_allowed !== false ||
  titleFocusTranche2.controls.directory_cards_update_allowed !== false ||
  titleFocusTranche2.controls.books_grouping_allowed !== false ||
  titleFocusTranche2.controls.standalone_press_section_allowed !== false ||
  titleFocusTranche2.controls.comprehensive_spauda_page_allowed !== false ||
  titleFocusTranche2.controls.historical_claim_admission_allowed !== false ||
  titleFocusTranche2.controls.canonical_write_allowed !== false ||
  titleFocusTranche2.controls.sacred_core_write_allowed !== false ||
  titleFocusTranche2.controls.solp_ingestion_allowed !== false ||
  titleFocusTranche2.controls.contains_ocr_text !== false ||
  titleFocusTranche2.controls.contains_page_text !== false ||
  titleFocusTranche2.controls.contains_source_text !== false ||
  titleFocusTranche2.controls.contains_source_prose !== false ||
  titleFocusTranche2.controls.contains_excerpts !== false ||
  titleFocusTranche2.controls.contains_quotes !== false
) {
  throw new Error(
    "Draugas title-focus tranche 2 records are not the pinned twenty-three-row reviewed metadata projection.",
  );
}

const expectedTitleFocusTranche3ProfileCounts = {
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
const titleFocusTranche3CoreCount = titleFocusTranche3.records.filter(
  (record) => record.public_display_class === "core_parish_reference",
).length;
const titleFocusTranche3SupplementalCount = titleFocusTranche3.records.filter(
  (record) => record.public_display_class === "supplemental_reference",
).length;
if (
  titleFocusTranche3.schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche3-v1" ||
  titleFocusTranche3.controlling_record_schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche3-v1" ||
  titleFocusTranche3.content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE3_HASH ||
  titleFocusTranche3.source_selection_packet_content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE3_PACKET_HASH ||
  titleFocusTranche3.source_overlay_content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE3_OVERLAY_HASH ||
  titleFocusTranche3.records.length !== 16 ||
  titleFocusTranche3.record_counts.public_record_count !== 16 ||
  titleFocusTranche3.record_counts.core_parish_reference !== 10 ||
  titleFocusTranche3.record_counts.supplemental_reference !== 6 ||
  titleFocusTranche3CoreCount !== 10 ||
  titleFocusTranche3SupplementalCount !== 6 ||
  JSON.stringify(titleFocusTranche3.record_counts.by_public_profile) !==
    JSON.stringify(expectedTitleFocusTranche3ProfileCounts) ||
  titleFocusTranche3.scope_candidate_page_ids.some((id) =>
    id.includes("allsaints-worcester-ma"),
  ) ||
  titleFocusTranche3.records.some((record) =>
    record.candidate_page_id.includes("allsaints-worcester-ma"),
  ) ||
  titleFocusTranche3.controls.solp_profile_display_allowed !== true ||
  titleFocusTranche3.controls.homepage_update_allowed !== false ||
  titleFocusTranche3.controls.directory_cards_update_allowed !== false ||
  titleFocusTranche3.controls.books_grouping_allowed !== false ||
  titleFocusTranche3.controls.standalone_press_section_allowed !== false ||
  titleFocusTranche3.controls.comprehensive_spauda_page_allowed !== false ||
  titleFocusTranche3.controls.historical_claim_admission_allowed !== false ||
  titleFocusTranche3.controls.canonical_write_allowed !== false ||
  titleFocusTranche3.controls.sacred_core_write_allowed !== false ||
  titleFocusTranche3.controls.solp_ingestion_allowed !== false ||
  titleFocusTranche3.controls.contains_ocr_text !== false ||
  titleFocusTranche3.controls.contains_page_text !== false ||
  titleFocusTranche3.controls.contains_source_text !== false ||
  titleFocusTranche3.controls.contains_source_prose !== false ||
  titleFocusTranche3.controls.contains_excerpts !== false ||
  titleFocusTranche3.controls.contains_quotes !== false
) {
  throw new Error(
    "Draugas title-focus tranche 3 records are not the pinned sixteen-row reviewed metadata projection.",
  );
}

const expectedTitleFocusTranche4ProfileCounts = {
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
const titleFocusTranche4CoreCount = titleFocusTranche4.records.filter(
  (record) => record.public_display_class === "core_parish_reference",
).length;
const titleFocusTranche4SupplementalCount = titleFocusTranche4.records.filter(
  (record) => record.public_display_class === "supplemental_reference",
).length;
const titleFocusTranche4SupplementalIds = new Set(
  titleFocusTranche4.records
    .filter((record) => record.public_display_class === "supplemental_reference")
    .map((record) => record.source_record_id ?? record.record_id ?? ""),
);
if (
  titleFocusTranche4.schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche4-v1" ||
  titleFocusTranche4.controlling_record_schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche4-v1" ||
  titleFocusTranche4.content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE4_HASH ||
  titleFocusTranche4.source_selection_packet_content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE4_PACKET_HASH ||
  titleFocusTranche4.source_overlay_content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE4_OVERLAY_HASH ||
  titleFocusTranche4.records.length !== 24 ||
  titleFocusTranche4.record_counts.public_record_count !== 24 ||
  titleFocusTranche4.record_counts.core_parish_reference !== 23 ||
  titleFocusTranche4.record_counts.supplemental_reference !== 1 ||
  titleFocusTranche4CoreCount !== 23 ||
  titleFocusTranche4SupplementalCount !== 1 ||
  JSON.stringify(titleFocusTranche4.record_counts.by_public_profile) !==
    JSON.stringify(expectedTitleFocusTranche4ProfileCounts) ||
  titleFocusTranche4SupplementalIds.size !== 1 ||
  !titleFocusTranche4SupplementalIds.has(
    "solp:draugas-newspaper-record:draugas-2007-12-01-p14-st-francis-minersville-pa",
  ) ||
  titleFocusTranche4.controls.solp_profile_display_allowed !== true ||
  titleFocusTranche4.controls.homepage_update_allowed !== false ||
  titleFocusTranche4.controls.directory_cards_update_allowed !== false ||
  titleFocusTranche4.controls.books_grouping_allowed !== false ||
  titleFocusTranche4.controls.standalone_press_section_allowed !== false ||
  titleFocusTranche4.controls.comprehensive_spauda_page_allowed !== false ||
  titleFocusTranche4.controls.historical_claim_admission_allowed !== false ||
  titleFocusTranche4.controls.canonical_write_allowed !== false ||
  titleFocusTranche4.controls.sacred_core_write_allowed !== false ||
  titleFocusTranche4.controls.solp_ingestion_allowed !== false ||
  titleFocusTranche4.controls.contains_ocr_text !== false ||
  titleFocusTranche4.controls.contains_page_text !== false ||
  titleFocusTranche4.controls.contains_source_text !== false ||
  titleFocusTranche4.controls.contains_source_prose !== false ||
  titleFocusTranche4.controls.contains_excerpts !== false ||
  titleFocusTranche4.controls.contains_quotes !== false
) {
  throw new Error(
    "Draugas title-focus tranche 4 records are not the pinned twenty-four-row reviewed metadata projection.",
  );
}

const expectedTitleFocusTranche5ProfileCounts = {
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
const titleFocusTranche5CoreCount = titleFocusTranche5.records.filter(
  (record) => record.public_display_class === "core_parish_reference",
).length;
const titleFocusTranche5SupplementalCount = titleFocusTranche5.records.filter(
  (record) => record.public_display_class === "supplemental_reference",
).length;
const titleFocusTranche5SupplementalIds = new Set(
  titleFocusTranche5.records
    .filter((record) => record.public_display_class === "supplemental_reference")
    .map((record) => record.source_record_id ?? record.record_id ?? ""),
);
if (
  titleFocusTranche5.schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-tranche5-v1" ||
  titleFocusTranche5.controlling_record_schema_version !==
    "culturenet-solp-draugas-parish-centered-title-focus-public-record-tranche5-v1" ||
  titleFocusTranche5.content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE5_HASH ||
  titleFocusTranche5.source_selection_packet_content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE5_PACKET_HASH ||
  titleFocusTranche5.source_overlay_content_hash_sha256 !==
    EXPECTED_TITLE_FOCUS_TRANCHE5_OVERLAY_HASH ||
  titleFocusTranche5.records.length !== 16 ||
  titleFocusTranche5.record_counts.public_record_count !== 16 ||
  titleFocusTranche5.record_counts.core_parish_reference !== 15 ||
  titleFocusTranche5.record_counts.supplemental_reference !== 1 ||
  titleFocusTranche5CoreCount !== 15 ||
  titleFocusTranche5SupplementalCount !== 1 ||
  JSON.stringify(titleFocusTranche5.record_counts.by_public_profile) !==
    JSON.stringify(expectedTitleFocusTranche5ProfileCounts) ||
  titleFocusTranche5SupplementalIds.size !== 1 ||
  !titleFocusTranche5SupplementalIds.has(
    "solp:draugas-newspaper-record:draugas-2003-09-09-p2-st-francis-lawrence-ma",
  ) ||
  titleFocusTranche5.controls.solp_profile_display_allowed !== true ||
  titleFocusTranche5.controls.homepage_update_allowed !== false ||
  titleFocusTranche5.controls.directory_cards_update_allowed !== false ||
  titleFocusTranche5.controls.books_grouping_allowed !== false ||
  titleFocusTranche5.controls.standalone_press_section_allowed !== false ||
  titleFocusTranche5.controls.comprehensive_spauda_page_allowed !== false ||
  titleFocusTranche5.controls.historical_claim_admission_allowed !== false ||
  titleFocusTranche5.controls.canonical_write_allowed !== false ||
  titleFocusTranche5.controls.sacred_core_write_allowed !== false ||
  titleFocusTranche5.controls.solp_ingestion_allowed !== false ||
  titleFocusTranche5.controls.contains_ocr_text !== false ||
  titleFocusTranche5.controls.contains_page_text !== false ||
  titleFocusTranche5.controls.contains_source_text !== false ||
  titleFocusTranche5.controls.contains_source_prose !== false ||
  titleFocusTranche5.controls.contains_excerpts !== false ||
  titleFocusTranche5.controls.contains_quotes !== false
) {
  throw new Error(
    "Draugas title-focus tranche 5 records are not the pinned sixteen-row reviewed metadata projection.",
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

const pageRecovery72CoreCount = pageRecoveryProjection72.records.filter(
  (record) => record.public_display_class === "core_parish_reference",
).length;
const pageRecovery72SupplementalCount = pageRecoveryProjection72.records.filter(
  (record) => record.public_display_class === "supplemental_reference",
).length;
const pageRecovery72TitleStates = pageRecoveryProjection72.records.reduce(
  (counts, record) => {
    counts[record.title_state] += 1;
    return counts;
  },
  {
    exact_printed_headline: 0,
    reviewed_section_heading: 0,
    untitled_item: 0,
  },
);
if (
  pageRecoveryProjection72.schema_version !==
    "culturenet-draugas-page-recovery-public-record-set-72-v1" ||
  pageRecoveryProjection72.projection_state !==
    "held_draft_brain_reviewed_public_metadata_checkpoint" ||
  pageRecoveryProjection72.content_hash_sha256 !== EXPECTED_PAGE_RECOVERY_72_HASH ||
  pageRecoveryProjection72.records.length !== 72 ||
  pageRecoveryProjection72.record_counts.total !== 72 ||
  pageRecoveryProjection72.record_counts.core !== 62 ||
  pageRecoveryProjection72.record_counts.supplemental !== 10 ||
  pageRecovery72CoreCount !== 62 ||
  pageRecovery72SupplementalCount !== 10 ||
  JSON.stringify(pageRecovery72TitleStates) !==
    JSON.stringify(pageRecoveryProjection72.record_counts.title_states) ||
  pageRecoveryProjection72.controls.reviewed_public_metadata_allowed !== true ||
  pageRecoveryProjection72.controls
    .solp_profile_display_allowed_after_projection_merge_and_consumer_review !== true ||
  pageRecoveryProjection72.controls.public_release_performed !== false ||
  pageRecoveryProjection72.controls.historical_claim_admission_allowed !== false ||
  pageRecoveryProjection72.controls.canonical_evidence !== false ||
  pageRecoveryProjection72.controls.canonical_write_allowed !== false ||
  pageRecoveryProjection72.controls.assertion_write_allowed !== false ||
  pageRecoveryProjection72.controls.relationship_write_allowed !== false ||
  pageRecoveryProjection72.controls.sacred_core_write_allowed !== false ||
  pageRecoveryProjection72.controls.ocr_or_model_extraction_allowed !== false ||
  pageRecoveryProjection72.controls.source_text_or_excerpt_capture_allowed !== false
) {
  throw new Error(
    "Draugas page-recovery records are not the pinned 72-row reviewed metadata projection.",
  );
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

function titleFocusRecordId(record: TitleFocusRecord) {
  const sourceRecordId = record.source_record_id ?? record.record_id;
  if (!sourceRecordId) {
    throw new Error(`${record.candidate_page_id}: missing stable source record ID.`);
  }
  return sourceRecordId;
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
    sourceRecordId: titleFocusRecordId(record),
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
    supplementalReason: record.supplemental_reason ?? undefined,
  })),
  ...titleFocusTranche2.records.map((record) => ({
    sourceRecordId: titleFocusRecordId(record),
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
    supplementalReason: record.supplemental_reason ?? undefined,
  })),
  ...titleFocusTranche3.records.map((record) => ({
    sourceRecordId: titleFocusRecordId(record),
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
    supplementalReason: record.supplemental_reason ?? undefined,
  })),
  ...titleFocusTranche4.records.map((record) => ({
    sourceRecordId: titleFocusRecordId(record),
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
    supplementalReason: record.supplemental_reason ?? undefined,
  })),
  ...titleFocusTranche5.records.map((record) => ({
    sourceRecordId: titleFocusRecordId(record),
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
    supplementalReason: record.supplemental_reason ?? undefined,
  })),
  ...pageRecoveryProjection72.records.map((record) => ({
    sourceRecordId: record.source_record_id,
    candidatePageId: record.candidate_page_id,
    canonicalEntityId: record.canonical_entity_id,
    publicProfile: record.public_profile,
    issueDate: record.issue_date,
    pdfPage: record.pdf_page,
    pageUrl: record.page_url,
    displayTitle: record.display_title,
    citationLabel: record.citation_label,
    rights: record.rights,
    titleState: record.title_state,
    referenceClass: record.public_display_class,
    badgeLabel: record.badge_label ?? undefined,
    supplementalReason: record.supplemental_reason ?? undefined,
  })),
];

if (governedRecords.length !== 171) {
  throw new Error(
    `Expected 171 governed Draugas newspaper records; got ${governedRecords.length}.`,
  );
}

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
      (record.badgeLabel !== "Supplemental" || !record.supplementalReason)) ||
    (record.referenceClass === "core_parish_reference" &&
      (record.badgeLabel || record.supplementalReason))
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
      supplementalReason: record.supplementalReason,
      sourceTitleState: record.titleState,
    })),
  );
}
