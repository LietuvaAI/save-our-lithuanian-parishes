"use client";

// ============================================================================
// DioceseGrid — every diocese as a card: a single end-state bar (counts in
// segments, 2px seams) over compact parish rows. Replaces the old HistoryGrid
// full-color row fills with a readable, consistent list treatment.
// ============================================================================

import Link from "next/link";
import type { ScopedParish } from "@/lib/registry-scope";
import {
  GROUP_ORDER,
  GROUP_LABEL,
  END_STATE_COLOR,
  END_STATE_TEXT,
  isAlive,
  type EndStateGroup,
} from "@/lib/end-state";
import { EndStatePill } from "@/components/EndStatePill";

export interface DioceseCard {
  name: string;
  shortName: string;
  parishes: ScopedParish[];
  counts: Record<EndStateGroup, number>;
  closedCount: number;
  aliveCount: number;
}

function DioceseBar({
  counts,
  total,
}: {
  counts: Record<EndStateGroup, number>;
  total: number;
}) {
  return (
    <div
      className="mt-2 flex rounded-md overflow-hidden h-5"
      style={{ gap: 2 }}
      role="img"
      aria-label={GROUP_ORDER.filter((g) => counts[g] > 0)
        .map((g) => `${GROUP_LABEL[g]}: ${counts[g]}`)
        .join(", ")}
    >
      {GROUP_ORDER.map((g) => {
        const n = counts[g] ?? 0;
        if (n === 0) return null;
        const pct = (n / total) * 100;
        return (
          <div
            key={g}
            className="flex items-center justify-center text-[10px] font-medium leading-none"
            style={{
              width: `${pct}%`,
              minWidth: 10,
              background: END_STATE_COLOR[g],
              color: END_STATE_TEXT[g],
            }}
            title={`${GROUP_LABEL[g]}: ${n}`}
          >
            {pct >= 12 ? n : ""}
          </div>
        );
      })}
    </div>
  );
}

export default function DioceseGrid({
  dioceses,
}: {
  dioceses: DioceseCard[];
}) {
  return (
    <div className="space-y-5">
      {dioceses.map((d) => (
        <section
          key={d.name}
          id={`diocese-${d.shortName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          className="rounded-lg border border-rule overflow-hidden scroll-mt-4"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-rule bg-foreground/[0.02]">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h2 className="font-serif text-lg font-semibold">
                {d.shortName}
              </h2>
              <span className="text-sm text-muted">
                {d.parishes.length}{" "}
                {d.parishes.length === 1 ? "parish" : "parishes"}
                {d.closedCount > 0 && ` · ${d.closedCount} closed`}
                {d.aliveCount === 0 && " · none remain active"}
              </span>
            </div>
            <DioceseBar counts={d.counts} total={d.parishes.length} />
          </div>

          {/* Parish rows */}
          <div className="divide-y divide-rule">
            {d.parishes.map((p) => (
              <div
                key={p.slug}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-sm"
              >
                <div className="flex-1 min-w-0">
                  {p.profileHref ? (
                    <Link
                      href={p.profileHref}
                      className="font-medium underline decoration-rule underline-offset-2 hover:decoration-inherit"
                    >
                      {p.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{p.name}</span>
                  )}
                  <span className="ml-2 text-xs text-muted">
                    {p.city}, {p.state}
                  </span>
                </div>
                <span className="text-xs text-muted tabular-nums whitespace-nowrap hidden sm:inline">
                  {p.founded == null && p.closed == null
                    ? "—"
                    : `${p.founded ?? "?"}–${
                        p.closed ?? (isAlive(p.endState) ? "present" : "?")
                      }`}
                </span>
                <EndStatePill value={p.endState} />
                {p.hasAlert && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: "var(--es-closed)" }}
                  >
                    Alert
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
