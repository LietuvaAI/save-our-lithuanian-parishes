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
    | "unresolved";
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
  status_group: EndStateGroup;
  status_authority: string;
  status_observed_at: string | null;
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
};

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
    coal_region_parish_institutions: number;
    canadian_comparator_parishes: number;
    site_r10_founding_fallbacks: number;
    unresolved_founding_years: number;
  };
  unit_contracts: Array<Record<string, unknown>>;
  institution_history: InstitutionHistoryRow[];
  building_site_history: BuildingSiteHistoryRow[];
  continuity_edges: ContinuityEdge[];
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
export const infographicCounts = canonicalInfographics.counts;
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

export function getInfographicInstitutionByEntityId(entityId: string) {
  return institutionByEntityId.get(entityId) ?? null;
}

export function getInfographicInstitutionByProfile(profile: string) {
  return institutionByProfile.get(profile) ?? null;
}
