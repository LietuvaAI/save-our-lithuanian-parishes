// ============================================================================
// End-state — THE single parish-status system for every surface.
//
// One question, answered the same way everywhere: "what happened to this
// parish?" Seven semantic states, five visual slots — the three loss
// sub-fates (closed / demolished / repurposed) share the loss color and are
// distinguished by their label text. Colors come from the --es-* CSS
// variables in globals.css (validated light + dark).
//
// Used by: /history (timeline + grid), /by-diocese, parish profiles,
// homepage stats. The who-decided encoding (ending_mode, marks.tsx) remains
// a separate, sanctioned lens for the Draugas-article graphics and profile
// ownership context — it is not a status system.
// ============================================================================

import type { LithuanianIdentity, BuildingFate } from "@/lib/parishes";

export type EndState =
  | "active_parish"
  | "mass_continues"
  | "transferred"
  | "unresolved"
  | "closed"
  | "demolished"
  | "repurposed"
  | "unverified";

/** Canonical display order — life first, then transfer, then loss. */
export const END_STATE_ORDER: EndState[] = [
  "active_parish",
  "mass_continues",
  "transferred",
  "unresolved",
  "closed",
  "demolished",
  "repurposed",
  "unverified",
];

export const END_STATE_LABEL: Record<EndState, string> = {
  active_parish: "Active Lithuanian parish",
  mass_continues: "Lithuanian Mass continues",
  transferred: "Ethnically transferred",
  unresolved: "Unresolved",
  closed: "Closed",
  demolished: "Closed — demolished",
  repurposed: "Closed — repurposed",
  unverified: "Not yet verified",
};

export const END_STATE_SHORT: Record<EndState, string> = {
  active_parish: "Active",
  mass_continues: "Mass continues",
  transferred: "Transferred",
  unresolved: "Unresolved",
  closed: "Closed",
  demolished: "Demolished",
  repurposed: "Repurposed",
  unverified: "Unverified",
};

export const END_STATE_COLOR: Record<EndState, string> = {
  active_parish: "var(--es-active)",
  mass_continues: "var(--es-mass)",
  transferred: "var(--es-transferred)",
  unresolved: "var(--mark-ink)",
  closed: "var(--es-closed)",
  demolished: "var(--es-closed)",
  repurposed: "var(--es-closed)",
  unverified: "var(--es-unverified)",
};

/** Readable text color on top of the state color. */
export const END_STATE_TEXT: Record<EndState, string> = {
  active_parish: "#fff",
  mass_continues: "#10261b",
  transferred: "#1c1917",
  unresolved: "var(--background)",
  closed: "#fff",
  demolished: "#fff",
  repurposed: "#fff",
  unverified: "#1c1917",
};

/** The six visual groups (loss sub-fates collapsed) for bars and legends. */
export type EndStateGroup =
  | "active_parish"
  | "mass_continues"
  | "transferred"
  | "unresolved"
  | "closed"
  | "unverified";

export const GROUP_ORDER: EndStateGroup[] = [
  "active_parish",
  "mass_continues",
  "transferred",
  "unresolved",
  "closed",
  "unverified",
];

export const GROUP_LABEL: Record<EndStateGroup, string> = {
  active_parish: "Active Lithuanian parish",
  mass_continues: "Lithuanian Mass continues",
  transferred: "Ethnically transferred",
  unresolved: "Unresolved",
  closed: "Closed",
  unverified: "Not yet verified",
};

export function toGroup(s: EndState): EndStateGroup {
  if (s === "demolished" || s === "repurposed") return "closed";
  return s;
}

/** True when the parish, as a Lithuanian institution, is gone. */
export function isLoss(s: EndState): boolean {
  return s === "closed" || s === "demolished" || s === "repurposed";
}

/** True when Lithuanian liturgical life continues (parish or remnant). */
export function isAlive(s: EndState): boolean {
  return s === "active_parish" || s === "mass_continues";
}

/**
 * Resolve a parish's end state from the classifier fields. The one shared
 * resolver — /history, /by-diocese, and profiles must all call this.
 *
 * Editorial guardrail: an `undecided` ending mode (Maspeth, Elizabeth NJ)
 * resolves to "unresolved" — never to "closed" — no matter what the other
 * fields say. Unresolved cases stay unresolved until the record says
 * otherwise.
 */
export function resolveEndState(
  identity: LithuanianIdentity | null,
  buildingFate: BuildingFate | null,
  hasClosed: boolean,
  isStanding: boolean,
  endingMode?: string | null,
): EndState {
  if (endingMode === "undecided") return "unresolved";
  if (isStanding && identity === "mass_continues") return "mass_continues";
  if (isStanding && identity === "ethnically_transferred") return "transferred";
  if (isStanding) return "active_parish";
  if (identity === "ethnically_transferred") return "transferred";
  if (buildingFate === "demolished") return "demolished";
  if (
    buildingFate === "repurposed_secular" ||
    buildingFate === "repurposed_religious"
  )
    return "repurposed";
  if (identity === "lost") return "closed";
  if (hasClosed) return "closed";
  return "unverified";
}
