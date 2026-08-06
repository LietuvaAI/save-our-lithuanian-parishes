// Canonical public language for the six parish-status groups. Internal enum
// names stay stable; every reader-facing surface should import these words.

export type ParishStatusGroup =
  | "active_parish"
  | "mass_continues"
  | "unresolved"
  | "transferred"
  | "closed"
  | "unverified";

export const PARISH_STATUS_ORDER: ParishStatusGroup[] = [
  "active_parish",
  "mass_continues",
  "unresolved",
  "transferred",
  "closed",
  "unverified",
];

export const PARISH_STATUS_LABEL: Record<ParishStatusGroup, string> = {
  active_parish: "Active Lithuanian parish",
  mass_continues: "Lithuanian Mass continues",
  unresolved: "Unresolved",
  transferred: "Lives on, another community",
  closed: "Closed",
  unverified: "Being verified",
};

export const PARISH_STATUS_DESCRIPTION: Record<ParishStatusGroup, string> = {
  active_parish: "A Lithuanian parish with regular Lithuanian worship.",
  mass_continues:
    "A Lithuanian Mass is still celebrated inside a parish that is no longer Lithuanian-led — never counted as an active Lithuanian parish.",
  unresolved:
    "The church stands and the parish's fate is contested or canonically undecided — the decision is not final.",
  transferred:
    "The church serves another community today; its life as a Lithuanian parish has ended.",
  closed:
    "The parish was closed — click the Closed filter to see how each ended: parish closed, building sold on, or church demolished (marked ×).",
  unverified:
    "Documented in historical sources; its present status has not yet been established.",
};
