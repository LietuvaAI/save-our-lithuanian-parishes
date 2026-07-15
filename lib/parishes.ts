import parishesJson from "@/data/parishes.json";
import figuresJson from "@/data/figures.json";
import draugasLinksJson from "@/data/draugas-links.json";

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
  yearFounded: number | null;
  yearClosed: number | null;
  coalRegion: boolean;
  survivedReviewThenClosed: boolean;
  citations: Citation[];
  notes: string;
  corpusScope: string;
  recordKind: string;
}

export const parishes = parishesJson as Parish[];
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

/** Canonical legend order: losses first, per the infographic. */
export const ENDING_MODE_ORDER: EndingMode[] = [
  "diocese_closed",
  "undecided",
  "community_decided",
  "standing",
];
