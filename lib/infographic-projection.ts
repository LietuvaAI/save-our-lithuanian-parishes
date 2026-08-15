import projectionData from "@/data/canonical-infographic-projection.json";
import type { EndStateGroup } from "@/lib/end-state";
import type { PublicationInstitutionClass, PublicationRecordType } from "@/lib/publication-projection";

export type InfographicDateFact = {
  year: number | null;
  display: string | null;
  authority:
    | "canonical_graph"
    | "canonical_infographic_adjudication"
    | "reviewed_case_snapshot"
    | "site_r10_baseline"
    | "brain_canonical_assertion"
    | "unresolved";
  source_authority?: string;
};

export type CanonicalJurisdiction = {
  key: string;
  canonical_name: string;
  jurisdiction_type: "diocese" | "archdiocese";
  authority: "brain_canonical_assertion";
  source_assertion_id: string;
};

export type InstitutionContinuationSummary = {
  continuation_mode:
    | "designated_chapel"
    | "former_site_new_community"
    | "merged_successor"
    | "same_institution_new_community"
    | "successor_and_site_new_community"
    | "successor_community_relocated";
  destination_name: string;
  effective_date: string | null;
  status_basis: string;
  display_summary: string;
  future_plan: string | null;
  continuity_relationship_ids: string[];
  canonical_evidence_assertion_ids: string[];
  source_record: string;
  source_urls: string[];
  observed_at: string;
  source_assertion_id: string;
};

export type ReviewedDraugasEvidence = {
  title: string;
  publisher: "Draugas";
  date: string;
  page?: string;
  citation?: string;
  access?: "subscriber";
  excerpt?: string;
  supports: string;
  url: string;
};

export type CurrentPastoralDirectoryEntry = {
  id: string;
  nameLt: string;
  nameEn: string;
  city: string;
  state: string;
  address: string;
  directoryType:
    | "parish"
    | "mission"
    | "mission_community"
    | "church"
    | "religious_house";
  networkClass:
    | "active_parish"
    | "active_mission"
    | "mass_continues"
    | "unresolved"
    | "no_lithuanian_liturgy"
    | "directory_conflict"
    | "religious_house";
  ministry: string;
  clergy?: string;
  note?: string;
  registrySlug?: string | null;
  canonicalEntityId?: string | null;
  officialSite?: string | null;
  sourceRefs: string[];
  draugasEvidence: ReviewedDraugasEvidence;
  draugasReviewStatus:
    | "page_context_verified"
    | "public_web_article_verified";
};

export type CanonicalGeo = {
  lat: number;
  lon: number;
  precision: "address_geocode";
  source_artifact_id: string;
};

export type DocumentedReligiousHouse = {
  entity_id: string;
  name_lt: string;
  name_en: string;
  city: string;
  state: string;
  address: string;
  community_type: "men_religious_house" | "women_religious_house";
  current_status: "current";
  official_site: string;
  source_artifact_ids: string[];
  geo: CanonicalGeo;
};

export type AdditionalPastoralCommunity = {
  entity_id: string;
  name_lt: string;
  name_en: string;
  city: string;
  state: string;
  classification: "occasional_hosted_worship_community";
  host_name: string;
  host_address: string;
  host_site: string;
  official_community_site: string;
  latest_documented_lithuanian_mass: string;
  explanation: string;
  formal_mission_status_established: false;
  regular_schedule_established: false;
  current_sielovada_directory_member: false;
  counted_in_current_14_place_network: false;
  counted_in_public_institution_total: false;
  counted_in_roman_catholic_parish_mission_history: false;
  geo: CanonicalGeo;
};

export type InstitutionHistoryRow = {
  culturenet_entity_id: string;
  registry_slug: string;
  public_profile: string;
  name: string;
  canonical_name: string;
  city: string;
  state: string;
  record_type: PublicationRecordType;
  institution_class: PublicationInstitutionClass;
  identity_support: string;
  diocese: string | null;
  jurisdiction: CanonicalJurisdiction | null;
  status_group: EndStateGroup;
  status_authority: string;
  status_source_authority: string;
  status_observed_at: string | null;
  continuation_summary?: InstitutionContinuationSummary;
  founded: InfographicDateFact;
  closed: InfographicDateFact;
  building_fate: string | null;
  building_fate_authority: "terminal_site_condition" | "unresolved";
  terminal_worship_site_ids: string[];
  building_fate_relationship_ids: string[];
  legacy_building_fate?: string;
  relationship_ids: string[];
};

export type InstitutionUsePeriod = {
  relationship_id: string;
  institution_entity_id: string;
  institution_profile: string | null;
  relationship_type: string;
  date?: {
    start?: string | null;
    end?: string | null;
    label?: string;
    certainty?: string;
  } | null;
};

export type BuildingSiteHistoryRow = {
  culturenet_entity_id: string;
  slug: string;
  name: string;
  site_class:
    | "worship_site"
    | "parish_ancillary_site"
    | "cemetery"
    | "redeveloped_site";
  first_documented_year: number | null;
  lifecycle_text: Record<string, unknown> | null;
  demolished_year: number | null;
  milestones: Array<{
    assertion_id: string;
    event: string;
    label: string;
    date: string;
    source_artifact_id: string;
    source_locator?: string | null;
  }>;
  institution_use_periods: InstitutionUsePeriod[];
  condition_relationships: Array<{
    relationship_id: string;
    relationship_type: string;
    date?: Record<string, unknown> | null;
    confidence?: string | null;
  }>;
  related_public_institution_ids: string[];
  related_public_profiles: string[];
  public_profile_link_status:
    | "direct_institution_use"
    | "institution_lineage"
    | "site_lineage"
    | "institution_and_site_lineage"
    | "context_only_no_public_profile";
  counted_in_public_institution_total: false;
};

export type PhysicalSiteCondition =
  | "demolished"
  | "repurposed"
  | "listed_for_sale"
  | "standing"
  | "not_established";

export type ContinuityEndpoint = {
  entity_id: string;
  entity_type: string;
  display_name: string;
  slug: string;
  lifecycle?: Record<string, unknown>;
};

export type ContinuityEdge = {
  id: string;
  relationship_type: string;
  projection_group: string;
  identity_effect: string;
  counting_effect: string;
  publication_state: string;
  adjudication_state: string;
  confidence: string;
  source: ContinuityEndpoint;
  target: ContinuityEndpoint;
  date?: Record<string, unknown> | null;
  evidence_assertion_ids: string[];
  source_artifact_ids: string[];
  taxonomy: {
    dimension:
      | "institutional_transition"
      | "community_continuity"
      | "worship_site_continuity"
      | "identity_history"
      | "future_plan";
    form: string;
    public_label: string;
    temporal_state: "completed" | "historical" | "planned";
    certainty: "established" | "canonical_form_unresolved";
  };
};

export type RecordsCustodyEdge = Omit<ContinuityEdge, "taxonomy">;

type InfographicProjection = {
  schema: string;
  revision_id: string;
  generated: string;
  content_hash: string;
  authority: Record<string, unknown>;
  condition_resolution_contract: {
    current_relationship_rule: string;
    precedence: string[];
    legal_pairs: string[][];
    institution_summary_rule: string;
    legacy_rule: string;
  };
  counts: {
    public_us_institutions: number;
    roman_catholic_parish_institutions: number;
    roman_catholic_parishes_with_founding_year: number;
    roman_catholic_parishes_with_closure_year: number;
    closed_roman_catholic_parishes: number;
    closed_roman_catholic_parishes_with_dated_year: number;
    closed_roman_catholic_parishes_since_1990: number;
    closed_roman_catholic_parishes_since_2020: number;
    building_site_entities: number;
    physical_worship_sites: number;
    institution_continuity_edges: number;
    records_custody_edges: number;
    coal_region_parish_institutions: number;
    canadian_comparator_parishes: number;
    site_r10_founding_fallbacks: number;
    unresolved_founding_years: number;
  };
  unit_contracts: Array<Record<string, unknown>>;
  institution_history: InstitutionHistoryRow[];
  building_site_history: BuildingSiteHistoryRow[];
  continuity_edges: ContinuityEdge[];
  records_custody_edges: RecordsCustodyEdge[];
  current_pastoral_network: {
    unit: string;
    counted_in_public_institution_total: false;
    source_assertion_id: string;
    observed_at: string;
    counts: {
      active_parish: number;
      active_mission: number;
      mass_continues: number;
    };
    members: Array<{
      network_class: "active_parish" | "active_mission" | "mass_continues";
      entity_id: string;
      registry_slug: string | null;
      site_id?: string;
      entity_type: string;
      canonical_name: string;
    }>;
    excluded_pending_current_verification: Array<{
      entity_id: string;
      reason: string;
    }>;
    directory_source_assertion_id: string;
    directory: {
      entries: CurrentPastoralDirectoryEntry[];
      counts: Record<string, number>;
      networkRevision: Record<string, unknown>;
      source: Record<string, unknown>;
      draugasEvidenceRevision: string;
    };
  };
  wider_catholic_life: {
    documented_religious_houses: {
      unit: string;
      population: number;
      population_claim: string;
      observed_at: string;
      source_assertion_id: string;
      counted_in_public_institution_total: false;
      counted_in_roman_catholic_parish_mission_history: false;
      houses: DocumentedReligiousHouse[];
    };
    additional_pastoral_communities: {
      unit: string;
      population: number;
      observed_at: string;
      source_assertion_id: string;
      counted_in_current_pastoral_network: false;
      counted_in_public_institution_total: false;
      counted_in_roman_catholic_parish_mission_history: false;
      communities: AdditionalPastoralCommunity[];
    };
  };
  regional_views: {
    pennsylvania_coal_region: {
      unit: string;
      population: number;
      counts: {
        diocese_owned: number;
        diocese_ended: number;
        diocese_standing: number;
        diocese_unresolved: number;
        community_owned: number;
      };
      institutions: Array<{
        culturenet_entity_id: string;
        registry_slug: string;
        public_profile: string;
        name: string;
        city: string;
        state: string;
        status_group: EndStateGroup;
        ownership: string | null;
        ending_mode: string | null;
        building_fate: string | null;
      }>;
    };
  };
  comparators: {
    canada: {
      unit: string;
      counted_in_public_us_institution_total: false;
      population: number;
      parishes: Array<{
        profile: string;
        slug: string;
        name: string;
        city: string;
        province: string;
        country: string;
        status_group: EndStateGroup;
        ownership: string | null;
        ending_mode: string | null;
        building_fate: string | null;
        founded_year: number | null;
        closed_year: number | null;
      }>;
    };
  };
  publication_rules: string[];
};

export const canonicalInfographics = projectionData as InfographicProjection;
export const institutionHistory = canonicalInfographics.institution_history;
export const buildingSiteHistory = canonicalInfographics.building_site_history;
export const continuityEdges = canonicalInfographics.continuity_edges;
export const recordsCustodyEdges =
  canonicalInfographics.records_custody_edges;
export const currentPastoralNetwork =
  canonicalInfographics.current_pastoral_network;
export const widerCatholicLife = canonicalInfographics.wider_catholic_life;
export const documentedReligiousHouses =
  widerCatholicLife.documented_religious_houses.houses;
export const additionalPastoralCommunities =
  widerCatholicLife.additional_pastoral_communities.communities;
export const infographicCounts = canonicalInfographics.counts;
export const conditionResolutionContract =
  canonicalInfographics.condition_resolution_contract;
export const pennsylvaniaCoalRegion =
  canonicalInfographics.regional_views.pennsylvania_coal_region;
export const canadianComparators = canonicalInfographics.comparators.canada;

export const romanCatholicParishHistory = institutionHistory.filter(
  (row) => row.record_type === "parish" && row.institution_class === "roman_catholic",
);
export const romanCatholicMissionHistory = institutionHistory.filter(
  (row) => row.record_type === "misija" && row.institution_class === "roman_catholic",
);
export const romanCatholicInstitutionHistory = institutionHistory.filter(
  (row) =>
    (row.record_type === "parish" || row.record_type === "misija") &&
    row.institution_class === "roman_catholic",
);
export const physicalWorshipSiteHistory = buildingSiteHistory.filter(
  (row) => row.site_class === "worship_site",
);

const PHYSICAL_SITE_STATE_BY_RELATIONSHIP = {
  "building-demolished": "demolished",
  "building-repurposed": "repurposed",
  "building-listed-for-sale": "listed_for_sale",
  "building-standing": "standing",
} as const satisfies Record<string, Exclude<PhysicalSiteCondition, "not_established">>;

/**
 * Resolve a site's present condition exactly as Brain's projection contract
 * specifies: demolition is irreversible; other conditions are current only
 * while their relationship is open-ended; conflicts follow canonical
 * precedence. Historical helpers such as `demolished_year` never decide the
 * current category independently.
 */
export function resolvePhysicalSiteCondition(
  relationships: BuildingSiteHistoryRow["condition_relationships"],
): PhysicalSiteCondition {
  const currentRelationships = new Set(
    relationships
      .filter(
        (relationship) =>
          relationship.relationship_type === "building-demolished" ||
          relationship.date?.end == null,
      )
      .map((relationship) => relationship.relationship_type),
  );
  const resolvedRelationship = conditionResolutionContract.precedence.find(
    (relationship) => currentRelationships.has(relationship),
  );

  return resolvedRelationship &&
    resolvedRelationship in PHYSICAL_SITE_STATE_BY_RELATIONSHIP
    ? PHYSICAL_SITE_STATE_BY_RELATIONSHIP[
        resolvedRelationship as keyof typeof PHYSICAL_SITE_STATE_BY_RELATIONSHIP
      ]
    : "not_established";
}
export const additionalCurrentHostedCommunities =
  currentPastoralNetwork.directory.entries.filter(
    (entry) =>
      entry.networkClass === "mass_continues" && !entry.registrySlug,
  );

const currentPastoralDirectoryByRegistrySlug = new Map(
  currentPastoralNetwork.directory.entries.flatMap((entry) =>
    entry.registrySlug ? [[entry.registrySlug, entry] as const] : [],
  ),
);

export function getCurrentPastoralDirectoryEntry(
  registrySlug: string,
): CurrentPastoralDirectoryEntry | null {
  return currentPastoralDirectoryByRegistrySlug.get(registrySlug) ?? null;
}

const institutionByEntityId = new Map(
  institutionHistory.map((row) => [row.culturenet_entity_id, row]),
);
const institutionByProfile = new Map(
  institutionHistory.map((row) => [row.public_profile, row]),
);

if (institutionHistory.length !== infographicCounts.public_us_institutions) {
  throw new Error("Canonical infographic institution count drifted.");
}
if (
  romanCatholicParishHistory.length !==
  infographicCounts.roman_catholic_parish_institutions
) {
  throw new Error("Canonical Roman Catholic parish-history count drifted.");
}
if (
  romanCatholicInstitutionHistory.length !==
  romanCatholicParishHistory.length + romanCatholicMissionHistory.length
) {
  throw new Error("Canonical Roman Catholic parish-and-mission count drifted.");
}
if (physicalWorshipSiteHistory.length !== infographicCounts.physical_worship_sites) {
  throw new Error("Canonical physical worship-site count drifted.");
}
if (
  additionalCurrentHostedCommunities.length !== 1 ||
  additionalCurrentHostedCommunities[0]?.canonicalEntityId !==
    "cn:organization:washington-epiphany-lithuanian-community"
) {
  throw new Error(
    "Canonical additional hosted-community set must contain Washington Epiphany only.",
  );
}
if (
  widerCatholicLife.documented_religious_houses.population !== 2 ||
  documentedReligiousHouses.length !== 2 ||
  widerCatholicLife.additional_pastoral_communities.population !== 1 ||
  additionalPastoralCommunities.length !== 1
) {
  throw new Error("Canonical wider Catholic-life population drifted.");
}
if (
  [...documentedReligiousHouses, ...additionalPastoralCommunities].some(
    (record) =>
      record.geo.lat == null ||
      record.geo.lon == null ||
      institutionByEntityId.has(record.entity_id) ||
      currentPastoralNetwork.members.some(
        (member) => member.entity_id === record.entity_id,
      ),
  )
) {
  throw new Error(
    "Wider Catholic-life records must be geocoded and remain outside institution and regular-worship populations.",
  );
}

export function getInfographicInstitutionByEntityId(entityId: string) {
  return institutionByEntityId.get(entityId) ?? null;
}

export function getInfographicInstitutionByProfile(profile: string) {
  return institutionByProfile.get(profile) ?? null;
}
