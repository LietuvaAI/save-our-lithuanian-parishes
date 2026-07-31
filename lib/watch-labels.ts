// ============================================================================
// Sustainability display labels shared by current-life and parish profile
// surfaces so their language can never drift apart.
// ============================================================================

export const CLERGY_LABEL: Record<string, string> = {
  lithuanian_klebonas: "Lithuanian-speaking klebonas",
  collaborative_pastor: "Shared pastor (not Lithuanian-speaking)",
  visiting_priest: "Visiting priest only",
  no_lithuanian_clergy: "No Lithuanian-speaking clergy",
  unknown: "Not yet established",
};

export const FREQUENCY_LABEL: Record<string, string> = {
  weekly: "Weekly Lithuanian Mass",
  monthly: "Monthly Lithuanian Mass",
  occasional: "Occasional Lithuanian Mass",
  none: "No Lithuanian Mass",
  unknown: "Not yet established",
};

export const FREQUENCY_SHORT: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  occasional: "Occasional",
  none: "None",
  unknown: "—",
};

export const GOVERNANCE_LABEL: Record<string, string> = {
  standalone: "Standalone parish",
  collaborative: "In a diocesan collaborative",
  merged: "Post-merger entity",
  chapel: "Chapel",
  mission: "Mission status",
  unknown: "Not yet established",
};
