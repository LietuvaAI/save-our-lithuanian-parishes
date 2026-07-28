import parishesJson from "@/data/parishes.json";
import figuresJson from "@/data/figures.json";
import draugasLinksJson from "@/data/draugas-links.json";
import situationJson from "@/data/parish-situation.json";
import { PARISH_STATUS_LABEL } from "@/lib/status-copy";

export type Ownership = "diocese_rc" | "national_catholic" | "other_self_owned";
export type ParishStatus =
  | "closed"
  | "demolished"
  | "merged"
  | "suppressed"
  | "standing"
  | "undecided";
export type EndingMode =
  | "diocese_closed"
  | "community_decided"
  | "standing"
  | "undecided";
export type InstitutionType = "parapija" | "misija";

export type BuildingFate =
  | "demolished"
  | "standing"
  | "repurposed_religious"
  | "repurposed_secular"
  | "derelict"
  | "unknown";
export type LithuanianIdentity =
  | "active_parish"
  | "mass_continues"
  | "ethnically_transferred"
  | "lost";
export type PastoralStatus =
  | "own_priest"
  | "shared_priest"
  | "visiting_priest"
  | "not_applicable"
  | "unknown";

export interface ParishSituationSource {
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
}

export interface ParishSituation {
  registry_slug: string;
  canonical_status: string;
  building_fate: BuildingFate;
  current_use: string;
  lithuanian_identity: LithuanianIdentity;
  pastoral_status: PastoralStatus;
  situation: string;
  sources?: ParishSituationSource[];
}

export interface Citation {
  type: "draugas_issue";
  date: string;
}

export interface Parish {
  slug: string;
  nameLt: string;
  city: string;
  state: string;
  country: "US" | "CA";
  comparator: boolean;
  ownership: Ownership;
  status: ParishStatus;
  endingMode: EndingMode;
  institutionType: InstitutionType;
  // Classifier fields — merged from parish-situation.json at build time.
  lithuanianIdentity: LithuanianIdentity | null;
  buildingFate: BuildingFate | null;
  currentUse: string | null;
  pastoralStatus: PastoralStatus | null;
  situation: string | null;
  registrySlug: string | null;
  c83Rows: number[];
  mergedInto: string | null;
  yearFounded: number | null;
  yearClosed: number | null;
  coalRegion: boolean;
  survivedReviewThenClosed: boolean;
  citations: Citation[];
  notes: string;
  corpusScope: string;
  recordKind: string;
}

export const allParishes = parishesJson as Parish[];
export const parishes = allParishes.filter((p) => !p.mergedInto);
export function getParishByC83Row(row: number): Parish | undefined {
  return parishes.find((p) => p.c83Rows?.includes(row));
}
export const usParishes = parishes.filter((p) => !p.comparator);
export const comparatorParishes = parishes.filter((p) => p.comparator);
export const figures = figuresJson;

export const OWNERSHIP_LABEL: Record<Ownership, string> = {
  diocese_rc: "Diocese-owned Roman Catholic",
  national_catholic: "Lithuanian National Catholic (community-owned)",
  other_self_owned: "Lithuanian Lutheran (self-owned)",
};

export const OWNERSHIP_SHORT: Record<Ownership, string> = {
  diocese_rc: "Diocese-owned",
  national_catholic: "National Catholic",
  other_self_owned: "Lutheran, self-owned",
};

export const ENDING_MODE_LABEL: Record<EndingMode, string> = {
  diocese_closed: "Closed by the diocese",
  community_decided: "Ended on the community's own terms",
  standing: "Still standing",
  undecided: "Unresolved",
};

export const STATUS_LABEL: Record<ParishStatus, string> = {
  closed: "Closed",
  demolished: "Demolished",
  merged: "Merged",
  suppressed: "Suppressed to a worship site",
  standing: "Standing",
  undecided: "Unresolved",
};

/**
 * Public Draugas archive page for the year of an issue date. Direct PDF
 * filenames vary by year and recent issues sit behind a subscription, so
 * citations link to the public per-year archive page; the dated label
 * identifies the exact issue there.
 */
export function draugasArchiveUrl(isoDate: string): string {
  return `https://www.draugas.org/archyvas-pdf-${isoDate.slice(0, 4)}/`;
}

interface DraugasLinkEntry {
  status: "verified" | "gated" | "unresolved";
  url?: string;
}

const draugasLinks = draugasLinksJson.results as Record<string, DraugasLinkEntry>;

/**
 * Best citation link for a Draugas issue: the direct PDF when
 * scripts/verify-draugas-links.mjs confirmed one exists publicly, otherwise
 * the per-year archive page. Gated (subscriber-only, 401) issues also fall
 * back to the archive page so readers land somewhere navigable.
 */
export function draugasCitationUrl(isoDate: string): string {
  const entry = draugasLinks[isoDate];
  return entry?.status === "verified" && entry.url
    ? entry.url
    : draugasArchiveUrl(isoDate);
}

export const INSTITUTION_TYPE_LABEL: Record<InstitutionType, string> = {
  parapija: "Lithuanian parish (parapija)",
  misija: "Lithuanian mission (misija)",
};

/** Canonical legend order: losses first, per the infographic. */
export const ENDING_MODE_ORDER: EndingMode[] = [
  "diocese_closed",
  "undecided",
  "community_decided",
  "standing",
];

// ---------------------------------------------------------------------------
// Situation classifiers — merged into parishes.json at build time from
// parish-situation.json. The overlay is the source of truth; the build
// script merges it; the app reads only parishes.json.
// ---------------------------------------------------------------------------

/** Build a ParishSituation view from a Parish's merged classifier fields. */
export function getParishSituation(slug: string): ParishSituation | null {
  const p = parishes.find((x) => x.slug === slug);
  if (!p || !p.buildingFate) return null;
  return {
    registry_slug: p.registrySlug ?? "",
    canonical_status: p.status,
    building_fate: p.buildingFate,
    current_use: p.currentUse ?? "Unknown",
    lithuanian_identity: p.lithuanianIdentity ?? "lost",
    pastoral_status: p.pastoralStatus ?? "unknown",
    situation: p.situation ?? "",
    sources: situationOverlay[slug]?.sources,
  };
}

export const BUILDING_FATE_LABEL: Record<BuildingFate, string> = {
  demolished: "Demolished",
  standing: "Building standing",
  repurposed_religious: "Repurposed (religious use)",
  repurposed_secular: "Repurposed (secular use)",
  derelict: "Derelict",
  unknown: "Building fate unknown",
};

export const LITHUANIAN_IDENTITY_LABEL: Record<LithuanianIdentity, string> = {
  active_parish: PARISH_STATUS_LABEL.active_parish,
  mass_continues: PARISH_STATUS_LABEL.mass_continues,
  ethnically_transferred: PARISH_STATUS_LABEL.transferred,
  lost: "Lithuanian identity lost",
};

export const PASTORAL_STATUS_LABEL: Record<PastoralStatus, string> = {
  own_priest: "Own Lithuanian priest",
  shared_priest: "Shared priest",
  visiting_priest: "Visiting priest",
  not_applicable: "—",
  unknown: "Pastoral status unknown",
};

// Reverse index: registry slug → situation (for registry profile pages)
const registrySlugIndex = new Map<string, Parish>();
for (const p of parishes) {
  if (p.registrySlug) registrySlugIndex.set(p.registrySlug, p);
}

// The full classifier overlay — the case-filed entries also flow into
// parishes.json at build time; the rest are reachable only through this index.
const situationOverlay = (
  situationJson as unknown as {
    parishes: Record<string, ParishSituation & { registry_slug: string }>;
  }
).parishes;
const overlayByRegistrySlug = new Map<string, ParishSituation>();
for (const entry of Object.values(situationOverlay)) {
  if (entry.registry_slug)
    overlayByRegistrySlug.set(entry.registry_slug, entry);
}

/** Look up the situation overlay by registry slug — canonical parishes first,
 * then the registry-wide overlay (researched non-canonical entries). */
export function getSituationByRegistrySlug(registrySlug: string): ParishSituation | null {
  const p = registrySlugIndex.get(registrySlug);
  if (p && p.buildingFate) {
    return {
      registry_slug: p.registrySlug ?? "",
      canonical_status: p.status,
      building_fate: p.buildingFate,
      current_use: p.currentUse ?? "Unknown",
      lithuanian_identity: p.lithuanianIdentity ?? "lost",
      pastoral_status: p.pastoralStatus ?? "unknown",
      situation: p.situation ?? "",
      sources: overlayByRegistrySlug.get(registrySlug)?.sources,
    };
  }
  return overlayByRegistrySlug.get(registrySlug) ?? null;
}

// ---------------------------------------------------------------------------
// About page link targets — each classifier value → anchor on /about
// ---------------------------------------------------------------------------

export const BUILDING_FATE_LINK: Record<BuildingFate, string> = {
  demolished: "/record",
  standing: "/record",
  repurposed_religious: "/record",
  repurposed_secular: "/record",
  derelict: "/record",
  unknown: "/record",
};

export const LITHUANIAN_IDENTITY_LINK: Record<LithuanianIdentity, string> = {
  active_parish: "/record",
  mass_continues: "/record",
  ethnically_transferred: "/record",
  lost: "/record",
};

export const OWNERSHIP_LINK = "/about#ownership";
