import {
  END_STATE_COLOR,
  type EndState,
  type EndStateGroup,
} from "@/lib/end-state";

export type RecordMarkShape = "circle" | "diamond" | "square";
export type RecordSignal = "active" | "watch" | "building";

export function recordMarkShape(
  congregationClass?: string | null,
): RecordMarkShape {
  if (
    congregationClass === "national_catholic_pncc" ||
    congregationClass === "independent_catholic"
  ) {
    return "diamond";
  }
  if (congregationClass === "non_catholic_christian") return "square";
  return "circle";
}

export function recordMarkColor(status: EndState | EndStateGroup): string {
  return END_STATE_COLOR[status];
}

export function isHollowRecordMark({
  group,
  recordType,
  networkClass,
}: {
  group?: EndStateGroup | null;
  recordType?: string | null;
  networkClass?: string | null;
}): boolean {
  return (
    group === "mass_continues" ||
    recordType === "misija" ||
    networkClass === "active_mission" ||
    networkClass === "mass_continues"
  );
}

export const SIGNAL_RING_COLOR: Record<RecordSignal, string> = {
  active: "var(--mark-community)",
  watch: "var(--foreground)",
  building: "var(--mark-building)",
};
