import parishesJson from "@/data/parishes.json";
import figuresJson from "@/data/figures.json";

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

/** CSS custom property per ending mode — defined in globals.css, light/dark aware. */
export const ENDING_MODE_COLOR: Record<EndingMode, string> = {
  diocese_closed: "var(--mode-closed)",
  community_decided: "var(--mode-community)",
  standing: "var(--mode-standing)",
  undecided: "var(--mode-undecided)",
};
