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
import alertsData from "@/data/alerts.json";
import {
  parishes as libParishes,
  getSituationByRegistrySlug,
  type EndingMode,
  type LithuanianIdentity,
  type BuildingFate,
} from "@/lib/parishes";
import { resolveEndState, type EndState } from "@/lib/end-state";

export interface RegParish {
  slug: string;
  names: { lt: string | null; en: string | null };
  city: string;
  state: string;
  country: "US" | "CA";
  comparator: boolean;
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
  sources?: { ethnic_status?: string }[];
  congregation_class?: string;
  diocese?: string | null;
  record_depth?: string;
}

/** One row of the shared registry-wide view. */
export interface ScopedParish {
  slug: string;
  name: string;
  city: string;
  state: string;
  diocese: string | null;
  founded: number | null;
  closed: number | null;
  endState: EndState;
  endingMode: EndingMode | null;
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
  return (
    p.country !== "CA" && !/buenos aires|argentin|rosario/i.test(p.city ?? "")
  );
}

/** The registry-wide U.S. Roman Catholic parish population. */
export function usRomanCatholic(): RegParish[] {
  return (registry as { parishes: RegParish[] }).parishes.filter(
    (p) =>
      isUS(p) && p.congregation_class === "roman_catholic" && !isSettlement(p),
  );
}

// Alert + sustainability-watch lookups by slug
const alertBySlug = new Map<string, string>();
for (const a of alertsData.alerts as { parishLink: string; kind: string }[]) {
  alertBySlug.set(a.parishLink.replace(/^\/(parishes|registry)\//, ""), a.kind);
}
const sustainBySlug = new Set<string>();
for (const sw of ((alertsData as Record<string, unknown>)
  .sustainabilityWatch as { parishLink: string }[] | undefined) ?? []) {
  sustainBySlug.add(sw.parishLink.replace(/^\/(parishes|registry)\//, ""));
}

/** Build the shared row for one registry entry. */
export function toScopedParish(p: RegParish): ScopedParish {
  const lib = p.c83_row != null ? libParishes[p.c83_row - 1] : undefined;
  const libOk = !!(lib && lib.city === p.city);

  const founded = yearOf(p.locked?.year_founded, p.years?.founded);
  const closed = yearOf(p.locked?.year_closed, p.years?.closed);

  const slug = libOk ? lib!.slug : p.slug;
  const endingMode = libOk ? (lib!.endingMode as EndingMode) : null;

  // Classifiers: canonical parishes carry them in parishes.json; the rest of
  // the registry reads the parish-situation overlay (researched entries).
  const overlay = libOk ? null : getSituationByRegistrySlug(p.slug);
  const asIdentity = (v: string | null | undefined) =>
    v && v !== "unknown" ? (v as LithuanianIdentity) : null;
  const asFate = (v: string | null | undefined) =>
    v && v !== "unknown" ? (v as BuildingFate) : null;

  const identity = libOk
    ? (lib!.lithuanianIdentity as LithuanianIdentity | null)
    : asIdentity(overlay?.lithuanian_identity);
  const buildingFate = libOk
    ? (lib!.buildingFate as BuildingFate | null)
    : asFate(overlay?.building_fate);

  const isStanding = !!(
    (endingMode === "standing" && !closed) ||
    (!closed &&
      (identity === "active_parish" || identity === "mass_continues")) ||
    (!closed && !libOk && overlay?.canonical_status === "standing")
  );

  return {
    slug,
    name: p.names.lt || p.names.en || p.slug,
    city: p.city.replace(/\s*[(;].*$/, ""),
    state: p.state,
    diocese: normalizeDiocese(p.diocese),
    founded,
    closed,
    endState: resolveEndState(
      identity,
      buildingFate,
      !!closed,
      isStanding,
      endingMode,
    ),
    endingMode,
    hasAlert: alertBySlug.has(slug),
    onWatch: sustainBySlug.has(slug),
    profileHref: libOk
      ? `/parishes/${lib!.slug}`
      : p.c83_row == null
        ? `/registry/${p.slug}`
        : null,
  };
}

/** The full scoped population as shared rows. */
export function scopedParishes(): ScopedParish[] {
  return usRomanCatholic().map(toScopedParish);
}
