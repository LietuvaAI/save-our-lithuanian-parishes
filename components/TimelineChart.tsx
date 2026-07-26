"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TimelineOutcome =
  | "lost"
  | "community"
  | "standing"
  | "undecided"
  | "unknown";

export interface TimelineRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  founded: number;
  closed: number | null;
  outcome: TimelineOutcome;
  detail: string;
  profileHref: string | null;
}

export interface UndatedRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  closed: number | null;
  outcome: TimelineOutcome;
  profileHref: string | null;
}

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const YEAR_MIN = 1870;
const YEAR_MAX = 2026;
const BAR_H = 10;
const BAR_GAP = 2;
const STEP = BAR_H + BAR_GAP;
const NAME_W = 180;
const CHART_W = 720;
const M = { top: 24, right: 8, bottom: 8 };

const OUTCOME_COLOR: Record<TimelineOutcome, string> = {
  lost: "var(--mark-closed)",
  community: "var(--mark-community)",
  standing: "var(--mark-standing)",
  undecided: "var(--muted)",
  unknown: "var(--muted)",
};

const OUTCOME_LABEL: Record<TimelineOutcome, string> = {
  lost: "Closed",
  community: "Community-decided ending",
  standing: "Still standing",
  undecided: "Unresolved",
  unknown: "Outcome unknown",
};

function truncName(name: string, max = 28): string {
  return name.length > max ? name.slice(0, max - 1) + "\u2026" : name;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TimelineChart({
  rows,
  undated,
}: {
  rows: TimelineRow[];
  undated: UndatedRow[];
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState<
    (TimelineRow | UndatedRow) | null
  >(null);

  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          a.founded - b.founded ||
          (a.closed ?? 9999) - (b.closed ?? 9999) ||
          a.state.localeCompare(b.state),
      ),
    [rows],
  );

  const chartH = sorted.length * STEP;
  const totalW = NAME_W + CHART_W + M.right;
  const totalH = chartH + M.top + M.bottom;

  const x = (year: number) =>
    NAME_W + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * CHART_W;

  const decades: number[] = [];
  for (let yr = 1880; yr <= 2010; yr += 10) decades.push(yr);

  return (
    <div>
      {/* ── Sticky detail panel (hover info at the top) ── */}
      <div
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-rule min-h-10 px-3 py-2 text-sm"
        aria-live="polite"
      >
        {hovered ? (
          <span>
            <span className="font-serif font-semibold">
              {hovered.name}
            </span>
            <span className="text-muted">
              {" "}&mdash; {hovered.city}, {hovered.state}
              {"founded" in hovered && ` · Est. ${hovered.founded}`}
              {hovered.closed && ` · Closed ${hovered.closed}`}
              {!hovered.closed &&
                hovered.outcome === "standing" &&
                " · Still standing"}
              {hovered.outcome === "community" &&
                " · Community-decided"}
              {"detail" in hovered &&
                hovered.detail !== "" &&
                ` · ${hovered.detail}`}
            </span>
            {hovered.profileHref && (
              <span className="text-muted">
                {" · "}
                <Link
                  href={hovered.profileHref}
                  className="underline hover:text-foreground"
                >
                  full record &rarr;
                </Link>
              </span>
            )}
          </span>
        ) : (
          <span className="text-muted">
            Hover over a parish to see its story. Click to open its
            full record.
          </span>
        )}
      </div>

      {/* ── Timeline SVG ── */}
      <div className="overflow-x-auto mt-1">
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          className="w-full h-auto"
          style={{ minWidth: "700px" }}
          role="img"
          aria-label={`Timeline of ${sorted.length} Lithuanian parishes, 1870\u20132026`}
        >
          {/* ── Decade gridlines ── */}
          {decades.map((yr) => (
            <g key={yr}>
              <line
                x1={x(yr)}
                y1={M.top - 2}
                x2={x(yr)}
                y2={M.top + chartH}
                stroke="var(--rule)"
                strokeWidth={0.5}
                opacity={0.4}
              />
              <text
                x={x(yr)}
                y={M.top - 7}
                textAnchor="middle"
                fontSize={7.5}
                fill="var(--muted)"
              >
                {yr}
              </text>
            </g>
          ))}

          {/* ── "Today" marker ── */}
          <line
            x1={x(YEAR_MAX)}
            y1={M.top - 2}
            x2={x(YEAR_MAX)}
            y2={M.top + chartH}
            stroke="var(--foreground)"
            strokeWidth={0.75}
            opacity={0.2}
          />
          <text
            x={x(YEAR_MAX) - 2}
            y={M.top - 7}
            textAnchor="end"
            fontSize={7.5}
            fill="var(--foreground)"
            opacity={0.5}
          >
            Today
          </text>

          {/* ── Parish rows ── */}
          {sorted.map((row, i) => {
            const ry = M.top + i * STEP;
            const x1 = x(row.founded);
            const xEnd = row.closed
              ? x(row.closed)
              : x(YEAR_MAX);
            const isHov = hovered?.slug === row.slug;
            const h = isHov ? BAR_H + 3 : BAR_H;
            const yOff = isHov ? ry - 1.5 : ry;

            const muted =
              row.outcome === "unknown" ||
              row.outcome === "undecided";

            return (
              <g
                key={row.slug}
                onMouseEnter={() => setHovered(row)}
                onMouseLeave={() => setHovered(null)}
                onClick={() =>
                  row.profileHref && router.push(row.profileHref)
                }
                className={
                  row.profileHref ? "cursor-pointer" : ""
                }
              >
                {/* Name label */}
                <text
                  x={NAME_W - 4}
                  y={yOff + h / 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={7}
                  fill={
                    isHov
                      ? "var(--foreground)"
                      : "var(--muted)"
                  }
                  fontWeight={isHov ? 600 : 400}
                >
                  {truncName(row.name)}
                </text>
                {/* Colored bar */}
                <rect
                  x={x1}
                  y={yOff}
                  width={Math.max(3, xEnd - x1)}
                  height={h}
                  fill={OUTCOME_COLOR[row.outcome]}
                  opacity={muted ? (isHov ? 0.5 : 0.3) : (isHov ? 1 : 0.8)}
                  rx={1}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Undated parishes ── */}
      {undated.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-muted mb-2">
            {undated.length}{" "}parishes without a known founding
            date &mdash; each square is one parish, colored by
            outcome:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {undated.map((u) => (
              <span
                key={u.slug}
                className="inline-block w-3.5 h-3.5 rounded-sm cursor-pointer border border-rule/30"
                style={{
                  background: u.closed
                    ? OUTCOME_COLOR[u.outcome]
                    : "var(--mark-ink)",
                }}
                title={`${u.name} — ${u.city}, ${u.state}${u.closed ? ` (closed ${u.closed})` : ""}`}
                onMouseEnter={() => setHovered(u)}
                onMouseLeave={() => setHovered(null)}
                onClick={() =>
                  u.profileHref && router.push(u.profileHref)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Legend ── */}
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-5 h-3 rounded-sm"
            style={{ background: "var(--mark-closed)" }}
          />
          Closed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-5 h-3 rounded-sm"
            style={{ background: "var(--mark-standing)" }}
          />
          Still standing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-5 h-3 rounded-sm"
            style={{ background: "var(--mark-community)" }}
          />
          Community-decided
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-5 h-3 rounded-sm border border-rule"
            style={{ background: "var(--muted)" }}
          />
          Outcome unknown
        </span>
      </div>
    </div>
  );
}
