import projectionData from "@/data/canonical-publication-projection.json";

export type PublicationRecordType = "parish" | "misija" | "congregation";
export type PublicationInstitutionClass =
  | "roman_catholic"
  | "national_catholic_pncc"
  | "independent_catholic"
  | "non_catholic_christian";
export type PublicationIdentitySupport =
  | "two_pass_case_file"
  | "multi_source_corroborated"
  | "single_source_attested";

export type PublicationInstitution = {
  projection_record_id: string;
  registry_slug: string;
  canonical_slug: string;
  culturenet_entity_id: string;
  public_profile: string;
  registry_projection_profile?: string;
  canonical_name: string;
  name: string;
  aliases: string[];
  city: string;
  state: string;
  record_type: PublicationRecordType;
  institution_class: PublicationInstitutionClass;
  identity_support: PublicationIdentitySupport;
  canonical_detail_status: string;
  protected_campaign: boolean;
  migration_state: string;
  evidence_assertion_ids: string[];
  source_artifact_ids: string[];
};

export type PublicationSourceArtifact = {
  artifact_type: string;
  id: string;
  locator?: {
    exact_label?: string;
    page?: string;
    section?: string;
  };
  rights?: {
    access?: string;
    public_url?: string;
    quote_policy?: string;
    status?: string;
  };
  title: string;
};

type PublicationProjection = {
  schema: string;
  revision_id: string;
  content_hash: string;
  authority: Record<string, unknown>;
  provenance: Record<string, unknown>;
  publication_rules: string[];
  counts: {
    public_us_institutions: number;
    profiles_pending_deep_case: number;
    protected_campaign_assignments: number;
    by_record_type: Record<PublicationRecordType, number>;
    by_institution_class: Record<PublicationInstitutionClass, number>;
  };
  public_institutions: PublicationInstitution[];
  linked_context: Record<string, unknown>[];
  canonical_entities: Record<string, unknown>[];
  relationships: Record<string, unknown>[];
  assertions: Record<string, unknown>[];
  source_artifacts: PublicationSourceArtifact[];
  campaign_identity_locks: Record<string, unknown>[];
};

export const canonicalPublication = projectionData as PublicationProjection;
export const publicInstitutions = canonicalPublication.public_institutions;
export const publicationCounts = canonicalPublication.counts;
export const publicationRelationships = canonicalPublication.relationships;
export const publicationAssertions = canonicalPublication.assertions;
export const publicationSources = canonicalPublication.source_artifacts;
export const publicationLinkedContext = canonicalPublication.linked_context;

const byRegistrySlug = new Map(
  publicInstitutions.map((institution) => [institution.registry_slug, institution]),
);
const byProfilePath = new Map(
  publicInstitutions.map((institution) => [institution.public_profile, institution]),
);
const sourceById = new Map(
  publicationSources.map((source) => [source.id, source]),
);

if (byRegistrySlug.size !== publicationCounts.public_us_institutions) {
  throw new Error(
    `Canonical publication projection contains ${byRegistrySlug.size} unique registry slugs; expected ${publicationCounts.public_us_institutions}.`,
  );
}
if (byProfilePath.size !== publicationCounts.public_us_institutions) {
  throw new Error(
    `Canonical publication projection contains ${byProfilePath.size} unique profile routes; expected ${publicationCounts.public_us_institutions}.`,
  );
}

export function getPublicationInstitution(
  registrySlug: string,
): PublicationInstitution | null {
  return byRegistrySlug.get(registrySlug) ?? null;
}

export function isPublishedInstitution(registrySlug: string): boolean {
  return byRegistrySlug.has(registrySlug);
}

export function getPublicationInstitutionByProfile(
  profilePath: string,
): PublicationInstitution | null {
  return byProfilePath.get(profilePath) ?? null;
}

export function getPublicationSourceArtifacts(
  registrySlug: string,
): PublicationSourceArtifact[] {
  const institution = byRegistrySlug.get(registrySlug);
  if (!institution) return [];
  return institution.source_artifact_ids.flatMap((sourceId) => {
    const source = sourceById.get(sourceId);
    return source ? [source] : [];
  });
}
