// ============================================================================
// Registry scope — the one shared builder for registry-wide views.
//
// /history, /by-diocese, and the homepage all describe the same population:
// U.S. Roman Catholic Lithuanian parishes from the unified registry. Before
// this module each page re-implemented the filter and year parsing with
// subtle divergences (e.g. /by-diocese excluded "no parish" settlement
// entries while /history did not, so the two pages disagreed on counts).
// One filter, one year parser, one standing test, one row shape — here.
// ============================================================================

import registry from "@/data/registry-unified.json";
import alertsData from "@/data/canonical-current-events-projection.json";
import {
  getParishByC83Row,
  getSituationByRegistrySlug,
  type EndingMode,
  type LithuanianIdentity,
  type BuildingFate,
  type Ownership,
} from "@/lib/parishes";
import { resolveEndState, type EndState } from "@/lib/end-state";
import { canonicalProfileHrefForRegistrySlug } from "@/lib/parish-profile";
import {
  getPublicationInstitution,
  isPublishedInstitution,
} from "@/lib/publication-projection";
import { getInfographicInstitutionByProfile } from "@/lib/infographic-projection";

export type CongregationClass =
  | "roman_catholic"
  | "national_catholic_pncc"
  | "non_catholic_christian"
  | "independent_catholic";

export type RecordDepth = "case-filed" | "multi-source" | "single-source";
export type PublicRecordType = "parish" | "misija" | "congregation";

export interface RegParish {
  slug: string;
  names: { lt: string | null; en: string | null };
  city: string;
  state: string;
  country: "US" | "CA" | "AR";
  record_type?: string;
  comparator: boolean | null;
  in_locked_scope: boolean;
  c83_row: number | null;
  locked?: {
    ending_mode?: string;
    year_founded?: string;
    year_closed?: string;
  };
  years?: {
    founded?: { value: string }[];
    closed?: { value: string }[];
  };
  lifecycle?: {
    canonical_status?: string;
    selected_closed_year?: number | null;
  };
  sources?: { ethnic_status?: string }[];
  congregation_class?: CongregationClass;
  diocese?: string | null;
  record_depth?: RecordDepth;
  public_census?: {
    included: boolean;
    scope: string;
    reason: string;
    identity_support:
      | "two_pass_case_file"
      | "multi_source_corroborated"
      | "single_source_attested"
      | null;
  };
}

/** One row of the shared registry-wide view. */
export interface ScopedParish {
  slug: string;
  name: string;
  city: string;
  state: string;
  country: "US" | "CA" | "AR";
  recordType: string;
  comparator: boolean;
  diocese: string | null;
  founded: number | null;
  closed: number | null;
  endState: EndState;
  endingMode: EndingMode | null;
  identity: LithuanianIdentity | null;
  buildingFate: BuildingFate | null;
  ownership: Ownership | null;
  congregationClass: CongregationClass | null;
  recordDepth: RecordDepth;
  alertKind: "active" | "watch" | "building" | null;
  hasAlert: boolean;
  onWatch: boolean;
  profileHref: string | null;
}

export function asYear(v: string | undefined | null): number | null {
  const m = (v ?? "").match(/\b(1[89]\d{2}|20[0-2]\d)\b/);
  return m ? parseInt(m[1]) : null;
}

export function yearOf(
  lockedVal: string | undefined,
  arr: { value: string }[] | undefined,
): number | null {
  return asYear(lockedVal) ?? asYear(arr?.[0]?.value) ?? null;
}

export function normalizeDiocese(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/\s*\(.*\)$/, "").replace(/\s*\/.*$/, "").trim();
  if (/bellevue/i.test(d)) d = "Diocese of Belleville";
  if (/unspecified/i.test(raw)) return null;
  return d || null;
}

/** A community whose own sources say it was never a distinct parish. */
export function isSettlement(p: RegParish): boolean {
  return (p.sources ?? []).some((s) => /no parish/i.test(s.ethnic_status ?? ""));
}

/** Scope: U.S. only; mis-coded Argentina entries out; Canada is a comparator. */
export function isUS(p: RegParish): boolean {
  return p.country === "US";
}

/** Institutional records published in the profile directory and registry map. */
export function isPublicRecord(p: RegParish): boolean {
  return isPublishedInstitution(p.slug);
}

/** The registry-wide U.S. Roman Catholic parish population. */
export function usRomanCatholic(): RegParish[] {
  return usRegistryParishes().filter(
    (p) => {
      const publication = getPublicationInstitution(p.slug);
      return (
        publication?.record_type === "parish" &&
        publication.institution_class === "roman_catholic"
      );
    },
  );
}

/** The full U.S. /parishes population: parishes and congregations, no comparators. */
export function usRegistryParishes(): RegParish[] {
  return (registry as { parishes: RegParish[] }).parishes.filter(
    (p) =>
      isUS(p) &&
      !isSettlement(p) &&
      isPublicRecord(p),
  );
}

// Current-alert and sustainability-profile lookups by slug
const alertBySlug = new Map<string, "active" | "watch" | "building">();
for (const a of alertsData.alerts as { parishLink?: string; kind: string }[]) {
  if (!a.parishLink) continue;
  alertBySlug.set(
    a.parishLink.replace(/^\/(parishes|registry)\//, ""),
    a.kind as "active" | "watch" | "building",
  );
}
const sustainBySlug = new Set<string>();
for (const sw of ((alertsData as Record<string, unknown>)
  .sustainabilityWatch as { parishLink: string }[] | undefined) ?? []) {
  sustainBySlug.add(sw.parishLink.replace(/^\/(parishes|registry)\//, ""));
}

/** Build the shared row for one registry entry. */
export function toScopedParish(p: RegParish): ScopedParish {
  const publication = getPublicationInstitution(p.slug);
  if (!publication && p.country === "US") {
    throw new Error(`${p.slug}: scoped record is absent from the canonical publication projection.`);
  }
  const lib = p.c83_row != null ? getParishByC83Row(p.c83_row) : undefined;
  const libOk = !!(lib && lib.city === p.city);
  const profileHref = publication?.public_profile ?? null;
  const canonical = profileHref
    ? getInfographicInstitutionByProfile(profileHref)
    : null;
  if (publication && !canonical) {
    throw new Error(
      `${p.slug}: published institution is absent from the canonical infographic projection.`,
    );
  }

  // Public dates and status come from the same CultureNet infographic
  // projection used by the history views and site-wide figures. The frozen
  // source-row library remains available as evidence, but never overrides the
  // adjudicated public institution lifecycle.
  const founded = canonical?.founded.year ?? null;
  const closed = canonical?.closed.year ?? null;

  const slug = libOk ? lib!.slug : p.slug;
  const endingMode = libOk
    ? (lib!.endingMode as EndingMode)
    : p.lifecycle?.canonical_status === "unresolved"
      ? "undecided"
      : p.lifecycle?.canonical_status === "standing"
        ? "standing"
        : null;

  // Classifiers: canonical parishes carry them in parishes.json; the rest of
  // the registry reads the parish-situation overlay (researched entries).
  const overlay = libOk ? null : getSituationByRegistrySlug(p.slug);
  const asIdentity = (v: string | null | undefined) =>
    v && v !== "unknown" ? (v as LithuanianIdentity) : null;
  const asFate = (v: string | null | undefined) =>
    v && v !== "unknown" ? (v as BuildingFate) : null;

  const identityFromCanonicalStatus = (): LithuanianIdentity | null => {
    switch (canonical?.status_group) {
      case "active_parish":
      case "mass_continues":
        return canonical.status_group;
      case "transferred":
        return "ethnically_transferred";
      case "closed":
        return "lost";
      case "unresolved":
      case "unverified":
        return null;
      default:
        return null;
    }
  };
  const identity = canonical
    ? identityFromCanonicalStatus()
    : libOk
      ? (lib!.lithuanianIdentity as LithuanianIdentity | null)
      : asIdentity(overlay?.lithuanian_identity);
  const buildingFate = canonical
    ? asFate(canonical.building_fate)
    : libOk
      ? (lib!.buildingFate as BuildingFate | null)
      : asFate(overlay?.building_fate);
  const alertKind = alertBySlug.get(slug) ?? null;

  return {
    slug,
    name: p.names.lt || p.names.en || p.slug,
    city: p.city.replace(/\s*[(;].*$/, ""),
    state: p.state,
    country: p.country,
    recordType: publication?.record_type ?? p.record_type ?? "parish",
    comparator: p.comparator === true,
    diocese: normalizeDiocese(p.diocese),
    founded,
    closed,
    endState: canonical
      ? canonical.status_group
      : resolveEndState(
          identity,
          buildingFate,
          !!closed,
          false,
          endingMode,
        ),
    endingMode,
    identity,
    buildingFate,
    ownership: libOk ? (lib!.ownership as Ownership) : null,
    congregationClass: publication?.institution_class ?? p.congregation_class ?? null,
    recordDepth: p.record_depth ?? "single-source",
    alertKind,
    hasAlert: alertKind != null,
    onWatch: sustainBySlug.has(slug),
    profileHref:
      canonicalProfileHrefForRegistrySlug(p.slug) ?? profileHref,
  };
}

/** The full scoped population as shared rows. */
export function scopedParishes(): ScopedParish[] {
  return usRomanCatholic().map(toScopedParish);
}
