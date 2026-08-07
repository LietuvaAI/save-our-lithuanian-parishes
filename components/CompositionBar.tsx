// ============================================================================
// CompositionBar — one 100% bar showing the end-state composition of a parish
// population. The "what happened to all of them" exhibit, shared by /history
// and /history. Five groups, 2px seams, direct labels beneath the big
// segments; small segments carry their number when it fits, tooltip always.
// Server-safe: no client hooks.
// ============================================================================

import {
  GROUP_ORDER,
  GROUP_LABEL,
  END_STATE_COLOR,
  END_STATE_TEXT,
  type EndStateGroup,
} from "@/lib/end-state";

export default function CompositionBar({
  counts,
  height = 44,
}: {
  counts: Record<EndStateGroup, number>;
  height?: number;
}) {
  const total = GROUP_ORDER.reduce((s, g) => s + (counts[g] ?? 0), 0);
  if (total === 0) return null;
  const present = GROUP_ORDER.filter((g) => (counts[g] ?? 0) > 0);

  return (
    <div>
      <div
        className="flex w-full rounded-md overflow-hidden"
        style={{ gap: 2, height }}
        role="img"
        aria-label={present
          .map((g) => `${GROUP_LABEL[g]}: ${counts[g]}`)
          .join(", ")}
      >
        {present.map((g) => {
          const n = counts[g];
          const pct = (n / total) * 100;
          return (
            <div
              key={g}
              className="flex items-center justify-center font-serif font-semibold"
              style={{
                width: `${pct}%`,
                minWidth: 12,
                background: END_STATE_COLOR[g],
                color: END_STATE_TEXT[g],
                fontSize: pct >= 5 ? 16 : 11,
              }}
              title={`${GROUP_LABEL[g]}: ${n} (${Math.round(pct)}%)`}
            >
              {pct >= 3.5 ? n : ""}
            </div>
          );
        })}
      </div>
      {/* Labels beneath — big segments direct-labeled, the rest in the row */}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-body-copy">
        {present.map((g) => (
          <span key={g} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: END_STATE_COLOR[g] }}
            />
            {GROUP_LABEL[g]}
            <span className="text-muted text-small-copy">
              {counts[g]} · {Math.round((counts[g] / total) * 100)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
