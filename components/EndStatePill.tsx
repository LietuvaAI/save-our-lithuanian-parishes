// ============================================================================
// EndStatePill — shared status primitives for the unified end-state system.
// Pill (profiles, popups), Dot (list rows), LegendSwatch (chart legends).
// Server-safe: no client hooks.
// ============================================================================

import {
  type EndState,
  type EndStateGroup,
  END_STATE_LABEL,
  END_STATE_COLOR,
  END_STATE_TEXT,
  END_STATE_SHORT,
  GROUP_LABEL,
} from "@/lib/end-state";

export function EndStatePill({
  value,
  size = "md",
  label,
}: {
  value: EndState;
  size?: "md" | "lg";
  label?: string;
}) {
  return (
    <span
      className={
        size === "lg"
          ? "rounded-full px-3.5 py-1 text-body-copy font-semibold whitespace-nowrap"
          : "inline-block rounded-full px-2 py-0.5 text-ui-label font-medium leading-tight whitespace-nowrap"
      }
      style={{
        background: END_STATE_COLOR[value],
        color: END_STATE_TEXT[value],
      }}
    >
      {label ?? END_STATE_LABEL[value]}
    </span>
  );
}

export function EndStateDot({
  value,
  title,
}: {
  value: EndState;
  title?: string;
}) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: END_STATE_COLOR[value] }}
      title={title ?? END_STATE_LABEL[value]}
      aria-hidden={title ? undefined : true}
    />
  );
}

export function EndStateShort({ value }: { value: EndState }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-small-copy text-muted whitespace-nowrap">
      <EndStateDot value={value} />
      {END_STATE_SHORT[value]}
    </span>
  );
}

/** One legend entry: swatch + label (+ optional count). */
export function LegendSwatch({
  group,
  count,
  detail,
}: {
  group: EndStateGroup;
  count?: number;
  detail?: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 text-body-copy whitespace-nowrap">
      <span
        className="inline-block w-3 h-3 rounded-sm self-center"
        style={{ background: END_STATE_COLOR[group] }}
      />
      {GROUP_LABEL[group]}
      {typeof count === "number" && (
        <span className="text-muted text-small-copy">
          {count}
          {detail ? ` (${detail})` : ""}
        </span>
      )}
    </span>
  );
}
