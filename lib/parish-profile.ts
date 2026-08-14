import registryData from "@/data/registry-unified.json";
import { parishes, type Parish } from "@/lib/parishes";
import type {
  CongregationClass,
  RecordDepth,
  RegParish,
} from "@/lib/registry-scope";
import type { RegistryProfileSource } from "@/lib/profile-sources";
import {
  publicInstitutions,
  type PublicationInstitution,
} from "@/lib/publication-projection";

export type YearReading = {
  value: string;
  source: string;
  cite?: string;
};

export type RegistrySource = RegistryProfileSource & {
  axis: string;
  ethnic_status?: string;
  first_mention?: string;
  last_mention?: string;
  total_mentions?: number;
  pages?: string;
  diocese?: string;
  school?: string;
  convent?: string;
  cemetery?: string;
  lens?: string;
  description?: string;
  architect?: string;
  address?: string;
  currentStatus?: string;
  ownership?: string;
  sourceUrl?: string;
  confidence?: string;
  yearsMentioned?: number[];
};

export type ConflictVariant = {
  value: string;
  source: string;
  cite?: string;
};

export type SourceConflict = {
  field: string;
  variants?: ConflictVariant[];
  note?: string;
};

export type RegistryEntry = Omit<
  RegParish,
  "comparator" | "names" | "sources" | "years"
> & {
  comparator: boolean | null;
  names: RegParish["names"] & { variants?: string[] };
  sources?: RegistrySource[];
  years?: {
    founded?: YearReading[];
    closed?: YearReading[];
  };
  record_type?: string;
  needs_human_source_review?: boolean;
  aliases?: string[];
  caveat?: string;
  conflicts?: SourceConflict[];
  description?: string;
  architect?: string;
  locked?: RegParish["locked"] & {
    ownership?: string;
    status?: string;
    notes?: string;
  };
};

export type CanonicalParishProfile = {
  slug: string;
  href: string;
  registrySlug: string;
  registry: RegistryEntry;
  core: Parish | null;
  publication: PublicationInstitution | null;
  congregationClass: CongregationClass | null;
  recordDepth: RecordDepth;
};

const registryEntries = (registryData as { parishes: RegistryEntry[] }).parishes;
const registryBySlug = new Map(registryEntries.map((entry) => [entry.slug, entry]));

const coreByC83Row = new Map<number, Parish>();
for (const parish of parishes) {
  for (const row of parish.c83Rows ?? []) {
    const existing = coreByC83Row.get(row);
    if (existing && existing.slug !== parish.slug) {
      throw new Error(
        `Canonical profile collision: c83 row ${row} maps to ${existing.slug} and ${parish.slug}.`,
      );
    }
    coreByC83Row.set(row, parish);
  }
}

function coreForRegistryEntry(entry: RegistryEntry): Parish | null {
  if (entry.c83_row == null) return null;
  const core = coreByC83Row.get(entry.c83_row);
  return core?.city === entry.city ? core : null;
}

const usPublicationProfiles: CanonicalParishProfile[] =
  publicInstitutions.map((publication) => {
    const entry = registryBySlug.get(publication.registry_slug);
    if (!entry) {
      throw new Error(
        `${publication.registry_slug}: canonical publication row has no site display record.`,
      );
    }
    const core = coreForRegistryEntry(entry);
    const slug = publication.public_profile.replace(/^\/parishes\//, "");
    if (!slug || slug === publication.public_profile) {
      throw new Error(
        `${publication.registry_slug}: invalid canonical profile route ${publication.public_profile}.`,
      );
    }
    return {
      slug,
      href: publication.public_profile,
      registrySlug: entry.slug,
      registry: entry,
      core,
      publication,
      congregationClass: publication.institution_class,
      recordDepth: entry.record_depth ?? "single-source",
    };
  });

export const canonicalParishProfiles: CanonicalParishProfile[] =
  usPublicationProfiles;

const profileBySlug = new Map<string, CanonicalParishProfile>();
const profileByRegistrySlug = new Map<string, CanonicalParishProfile>();

for (const profile of canonicalParishProfiles) {
  const routeCollision = profileBySlug.get(profile.slug);
  if (routeCollision) {
    throw new Error(
      `Canonical profile route collision: ${profile.slug} represents both ${routeCollision.registrySlug} and ${profile.registrySlug}.`,
    );
  }
  profileBySlug.set(profile.slug, profile);
  if (profile.core?.slug && profile.core.slug !== profile.slug) {
    const legacyCollision = profileBySlug.get(profile.core.slug);
    if (legacyCollision && legacyCollision.registrySlug !== profile.registrySlug) {
      throw new Error(
        `Legacy profile route collision: ${profile.core.slug} represents both ${legacyCollision.registrySlug} and ${profile.registrySlug}.`,
      );
    }
    profileBySlug.set(profile.core.slug, profile);
  }
  for (const registrySlug of [
    profile.registrySlug,
    ...(profile.registry.aliases ?? []),
  ]) {
    const aliasCollision = profileByRegistrySlug.get(registrySlug);
    if (aliasCollision && aliasCollision.registrySlug !== profile.registrySlug) {
      throw new Error(
        `Registry profile alias collision: ${registrySlug} represents both ${aliasCollision.registrySlug} and ${profile.registrySlug}.`,
      );
    }
    profileByRegistrySlug.set(registrySlug, profile);
  }
}

for (const core of parishes.filter((candidate) => !candidate.comparator)) {
  if (!profileBySlug.has(core.slug)) {
    throw new Error(
      `Canonical profile missing: ${core.slug} has no registry-backed route.`,
    );
  }
}

export function getCanonicalParishProfile(
  slug: string,
): CanonicalParishProfile | null {
  return profileBySlug.get(slug) ?? null;
}

export function getCanonicalParishProfileByRegistrySlug(
  registrySlug: string,
): CanonicalParishProfile | null {
  return profileByRegistrySlug.get(registrySlug) ?? null;
}

export const legacyRegistryProfileSlugs = [...profileByRegistrySlug.keys()];

export function canonicalProfileHrefForRegistrySlug(
  registrySlug: string,
): string | null {
  return profileByRegistrySlug.get(registrySlug)?.href ?? null;
}
