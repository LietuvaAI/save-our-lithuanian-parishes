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

import type {
  LithuanianIdentity,
  BuildingFate,
  Parish,
} from "@/lib/parishes";
import {
  PARISH_STATUS_DESCRIPTION,
  PARISH_STATUS_LABEL,
  PARISH_STATUS_ORDER,
  type ParishStatusGroup,
} from "@/lib/status-copy";

export type EndState =
  | "active_parish"
  | "mass_continues"
  | "transferred"
  | "unresolved"
  | "closed"
  | "demolished"
  | "repurposed"
  | "unverified";

/** Canonical display order — life first, then uncertainty, transfer, and loss. */
export const END_STATE_ORDER: EndState[] = [
  "active_parish",
  "mass_continues",
  "unresolved",
  "transferred",
  "closed",
  "demolished",
  "repurposed",
  "unverified",
];

export const END_STATE_LABEL: Record<EndState, string> = {
  active_parish: PARISH_STATUS_LABEL.active_parish,
  mass_continues: PARISH_STATUS_LABEL.mass_continues,
  transferred: PARISH_STATUS_LABEL.transferred,
  unresolved: PARISH_STATUS_LABEL.unresolved,
  closed: PARISH_STATUS_LABEL.closed,
  demolished: "Closed — church demolished",
  repurposed: "Closed — building sold on",
  unverified: PARISH_STATUS_LABEL.unverified,
};

export const END_STATE_SHORT: Record<EndState, string> = {
  active_parish: PARISH_STATUS_LABEL.active_parish,
  mass_continues: PARISH_STATUS_LABEL.mass_continues,
  transferred: PARISH_STATUS_LABEL.transferred,
  unresolved: PARISH_STATUS_LABEL.unresolved,
  closed: PARISH_STATUS_LABEL.closed,
  demolished: "Church demolished",
  repurposed: "Building sold on",
  unverified: PARISH_STATUS_LABEL.unverified,
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
export type EndStateGroup = ParishStatusGroup;

export const GROUP_ORDER: EndStateGroup[] = [...PARISH_STATUS_ORDER];

export const GROUP_LABEL: Record<EndStateGroup, string> = PARISH_STATUS_LABEL;

export const GROUP_DESCRIPTION: Record<EndStateGroup, string> =
  PARISH_STATUS_DESCRIPTION;

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
  // A predecessor institution may have ended while Lithuanian Mass continues
  // at its church under a successor. The liturgical status therefore outranks
  // the predecessor's closed year (Brooklyn Annunciation, 2019).
  if (identity === "mass_continues") return "mass_continues";
  if (isStanding && identity === "ethnically_transferred") return "transferred";
  // A parish whose lifecycle layer is frozen "standing" by the locked
  // snapshot but whose identity research has established the end shows the
  // truth (Hartford Holy Trinity: Masses ended 2026-05-30, after the lock).
  if (isStanding && identity === "lost") return "closed";
  // "Standing" alone is a lifecycle fact, not evidence of Lithuanian life:
  // without a verified identity the honest state is unverified, never
  // "Active Lithuanian parish" (2026-07-26 audit rule).
  if (isStanding && !identity) return "unverified";
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

/** Resolve a case-filed parish through the same canonical end-state rules. */
export function resolveParishEndState(parish: Parish): EndState {
  const identity = parish.lithuanianIdentity;
  const isStanding =
    (parish.endingMode === "standing" && !parish.yearClosed) ||
    (!parish.yearClosed &&
      (identity === "active_parish" || identity === "mass_continues"));

  return resolveEndState(
    identity,
    parish.buildingFate,
    !!parish.yearClosed,
    isStanding,
    parish.endingMode,
  );
}
