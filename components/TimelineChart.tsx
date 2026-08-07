"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type EndState,
  END_STATE_COLOR,
  END_STATE_LABEL,
  END_STATE_TEXT,
  GROUP_ORDER,
  GROUP_LABEL,
  toGroup,
  isAlive,
} from "@/lib/end-state";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TimelineRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  founded: number;
  closed: number | null;
  endState: EndState;
  detail: string;
  profileHref: string | null;
}

export interface UndatedRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  closed: number | null;
  endState: EndState;
  profileHref: string | null;
}

// ---------------------------------------------------------------------------
// Shared year scale — the decade pulse and the timeline read as one exhibit
// because they share the same x axis.
// ---------------------------------------------------------------------------

const YEAR_MIN = 1870;
const YEAR_MAX = 2026;
const NAME_W = 238;
const CHART_W = 700;
const M = { top: 26, right: 10, bottom: 8 };
const TOTAL_W = NAME_W + CHART_W + M.right;

const BAR_H = 11;
const BAR_GAP = 2.5;
const STEP = BAR_H + BAR_GAP;

function xScale(year: number) {
  return NAME_W + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * CHART_W;
}

function truncName(name: string, max = 32): string {
  return name.length > max ? name.slice(0, max - 1) + "…" : name;
}

// ---------------------------------------------------------------------------
// Decade pulse — founded per decade rise above the line; closures sink below.
// The two waves of the story in one glance, on the same axis as the timeline.
// ---------------------------------------------------------------------------

function DecadePulse({
  rows,
  undated,
  onNote,
}: {
  rows: TimelineRow[];
  undated: UndatedRow[];
  onNote?: (note: string | null) => void;
}) {
  const decades = useMemo(() => {
    const map = new Map<number, { founded: number; closed: number }>();
    for (let d = 1870; d <= 2020; d += 10) map.set(d, { founded: 0, closed: 0 });
    for (const r of rows) {
      const fd = Math.floor(r.founded / 10) * 10;
      if (map.has(fd)) map.get(fd)!.founded++;
      if (r.closed && toGroup(r.endState) === "closed") {
        const cd = Math.floor(r.closed / 10) * 10;
        if (map.has(cd)) map.get(cd)!.closed++;
      }
    }
    for (const u of undated) {
      if (u.closed && toGroup(u.endState) === "closed") {
        const cd = Math.floor(u.closed / 10) * 10;
        if (map.has(cd)) map.get(cd)!.closed++;
      }
    }
    return [...map.entries()].map(([decade, c]) => ({ decade, ...c }));
  }, [rows, undated]);

  const maxV = Math.max(
    ...decades.map((d) => Math.max(d.founded, d.closed)),
    1,
  );
  const peakF = decades.reduce((a, b) => (b.founded > a.founded ? b : a));
  const peakC = decades.reduce((a, b) => (b.closed > a.closed ? b : a));

  const H_HALF = 72;
  const H = H_HALF * 2 + 34;
  const zero = 17 + H_HALF;
  const vh = (n: number) => (n / maxV) * (H_HALF - 14);
  const colW = (CHART_W / ((YEAR_MAX - YEAR_MIN) / 10)) - 4;

  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${H}`}
      className="w-full h-auto"
      style={{ minWidth: "700px" }}
      role="img"
      aria-label="Parishes founded and closed per decade"
    >
      {/* Direction captions in the left gutter */}
      <text
        x={NAME_W - 10}
        y={zero - 26}
        textAnchor="end"
        fontSize={9.5}
        fill="var(--muted)"
      >
        founded ↑
      </text>
      <text
        x={NAME_W - 10}
        y={zero + 32}
        textAnchor="end"
        fontSize={9.5}
        fill="var(--muted)"
      >
        closed ↓
      </text>

      {/* Zero line */}
      <line
        x1={NAME_W}
        y1={zero}
        x2={NAME_W + CHART_W}
        y2={zero}
        stroke="var(--rule)"
        strokeWidth={1}
      />

      {decades.map(({ decade, founded, closed }) => {
        const cx = (xScale(decade) + xScale(decade + 10)) / 2;
        const x0 = cx - colW / 2;
        return (
          <g
            key={decade}
            onMouseEnter={() =>
              onNote?.(
                `${decade}s — ${founded} ${founded === 1 ? "parish" : "parishes"} founded · ${closed} closed`,
              )
            }
            onMouseLeave={() => onNote?.(null)}
          >
            <title>{`${decade}s — ${founded} founded · ${closed} closed`}</title>
            {/* Invisible hover strip so the whole decade column responds */}
            <rect
              x={x0 - 2}
              y={0}
              width={colW + 4}
              height={H}
              fill="transparent"
            />
            {founded > 0 && (
              <rect
                x={x0}
                y={zero - 1 - vh(founded)}
                width={colW}
                height={vh(founded)}
                rx={2}
                fill="var(--es-unverified)"
                opacity={0.75}
              />
            )}
            {closed > 0 && (
              <rect
                x={x0}
                y={zero + 1}
                width={colW}
                height={vh(closed)}
                rx={2}
                fill="var(--es-closed)"
                opacity={0.92}
              />
            )}
            {/* Peak annotations — the two waves, directly labeled */}
            {decade === peakF.decade && founded > 0 && (
              <text
                x={cx}
                y={zero - vh(founded) - 6}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill="var(--foreground)"
              >
                {`${founded} founded in the ${decade}s`}
              </text>
            )}
            {decade === peakC.decade && closed > 0 && (
              <text
                x={cx}
                y={zero + vh(closed) + 13}
                textAnchor="middle"
                fontSize={10}
                fontWeight={600}
                fill="var(--es-closed)"
              >
                {`${closed} closed in the ${decade}s`}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
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
  const [hovered, setHovered] = useState<(TimelineRow | UndatedRow) | null>(
    null,
  );
  const [note, setNote] = useState<string | null>(null);
  const [legendHover, setLegendHover] = useState<string | null>(null);
  const [legendPinned, setLegendPinned] = useState<string | null>(null);
  const legendHot = legendHover ?? legendPinned;

  const rowDimmed = (row: TimelineRow | UndatedRow) => {
    if (!legendHot) return false;
    if (legendHot === "demolished-glyph")
      return row.endState !== "demolished";
    return toGroup(row.endState) !== legendHot;
  };

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
  const totalH = chartH + M.top + M.bottom;

  const decades: number[] = [];
  for (let yr = 1880; yr <= 2010; yr += 10) decades.push(yr);

  const hoverText = (h: TimelineRow | UndatedRow) => {
    const bits: string[] = [];
    if ("founded" in h) bits.push(`Est. ${h.founded}`);
    if (h.closed) bits.push(`Closed ${h.closed}`);
    bits.push(END_STATE_LABEL[h.endState]);
    if ("detail" in h && h.detail) bits.push(h.detail);
    return bits.join(" · ");
  };

  return (
    <div>
      {/* ── Sticky detail panel ── */}
      <div
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-rule min-h-10 px-3 py-2 text-body-copy"
        aria-live="polite"
      >
        {hovered ? (
          <span>
            <span className="font-serif font-semibold">{hovered.name}</span>
            <span className="text-muted">
              {" "}
              &mdash; {hovered.city}, {hovered.state} · {hoverText(hovered)}
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
        ) : note ? (
          <span className="font-medium">{note}</span>
        ) : (
          <span className="text-muted">
            Select a parish bar for its full record. On desktop, hover to
            preview. Select an end state to isolate it.
          </span>
        )}
      </div>

      <div className="overflow-x-auto mt-3">
        <div style={{ minWidth: 700 }}>
          {/* ── Decade pulse ── */}
          <DecadePulse rows={rows} undated={undated} onNote={setNote} />

          {/* ── Timeline ── */}
          <svg
            viewBox={`0 0 ${TOTAL_W} ${totalH}`}
            className="w-full h-auto"
            role="img"
            aria-label={`Timeline of ${sorted.length} Lithuanian parishes, ${YEAR_MIN}–${YEAR_MAX}`}
          >
            <defs>
              {/* The record goes quiet: unverified bars fade out */}
              <linearGradient id="fadeOut" x1="0" y1="0" x2="1" y2="0">
                <stop
                  offset="0%"
                  stopColor="var(--es-unverified)"
                  stopOpacity="0.9"
                />
                <stop
                  offset="100%"
                  stopColor="var(--es-unverified)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Decade gridlines */}
            {decades.map((yr) => (
              <g key={yr}>
                <line
                  x1={xScale(yr)}
                  y1={M.top - 2}
                  x2={xScale(yr)}
                  y2={M.top + chartH}
                  stroke="var(--rule)"
                  strokeWidth={0.5}
                  opacity={0.4}
                />
                <text
                  x={xScale(yr)}
                  y={M.top - 8}
                  textAnchor="middle"
                  fontSize={8}
                  fill="var(--muted)"
                >
                  {yr}
                </text>
              </g>
            ))}

            {/* Today marker */}
            <line
              x1={xScale(YEAR_MAX)}
              y1={M.top - 2}
              x2={xScale(YEAR_MAX)}
              y2={M.top + chartH}
              stroke="var(--foreground)"
              strokeWidth={0.75}
              opacity={0.25}
            />
            <text
              x={xScale(YEAR_MAX) - 3}
              y={M.top - 8}
              textAnchor="end"
              fontSize={8}
              fill="var(--foreground)"
              opacity={0.6}
            >
              Today
            </text>

            {/* Parish rows */}
            {sorted.map((row, i) => {
              const ry = M.top + i * STEP;
              const x1 = xScale(row.founded);
              const group = toGroup(row.endState);
              const alive = isAlive(row.endState);
              const unverified = row.endState === "unverified";

              // Honest geometry: a bar only reaches Today if the parish is
              // verified alive (or transferred-but-standing). An unverified
              // parish with no closure date fades out — the record goes
              // quiet, it does not survive by default.
              const xEnd = row.closed
                ? xScale(row.closed)
                : unverified
                  ? Math.min(x1 + 42, xScale(YEAR_MAX))
                  : xScale(YEAR_MAX);

              const isHov = hovered?.slug === row.slug;
              const h = isHov ? BAR_H + 3 : BAR_H;
              const yOff = isHov ? ry - 1.5 : ry;

              return (
                <g
                  key={row.slug}
                  onMouseEnter={() => setHovered(row)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() =>
                    row.profileHref && router.push(row.profileHref)
                  }
                  className={row.profileHref ? "cursor-pointer" : ""}
                >
                  <text
                    x={NAME_W - 6}
                    y={yOff + h / 2}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize={8.5}
                    fill={isHov ? "var(--foreground)" : "var(--muted)"}
                    fontWeight={isHov ? 600 : 400}
                  >
                    {truncName(`${row.name} · ${row.city}`)}
                  </text>
                  <rect
                    x={x1}
                    y={yOff}
                    width={Math.max(3, xEnd - x1)}
                    height={h}
                    fill={
                      unverified && !row.closed
                        ? "url(#fadeOut)"
                        : END_STATE_COLOR[group]
                    }
                    opacity={
                      rowDimmed(row)
                        ? 0.06
                        : isHov
                          ? 1
                          : alive
                            ? 0.95
                            : 0.85
                    }
                    rx={1.5}
                  />
                  {/* Demolished buildings end in an ×: the parish closed AND
                      the building was erased */}
                  {row.endState === "demolished" && (
                    <g
                      stroke="var(--foreground)"
                      strokeWidth={1.1}
                      opacity={rowDimmed(row) ? 0.06 : isHov ? 1 : 0.75}
                    >
                      <line x1={xEnd - 1} y1={yOff + 1.5} x2={xEnd + 4} y2={yOff + h - 1.5} />
                      <line x1={xEnd - 1} y1={yOff + h - 1.5} x2={xEnd + 4} y2={yOff + 1.5} />
                    </g>
                  )}
                  {/* Survivors carry their city at the right edge — who is
                      left reads straight off the chart */}
                  {alive && !row.closed && (
                    <text
                      x={xScale(YEAR_MAX) - 5}
                      y={yOff + h / 2}
                      textAnchor="end"
                      dominantBaseline="central"
                      fontSize={7.5}
                      fontWeight={600}
                      fill={END_STATE_TEXT[group]}
                      opacity={rowDimmed(row) ? 0.06 : 1}
                    >
                      {`${row.city}, ${row.state}`}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── Legend — hover or pin an entry to isolate that end state ── */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-rule py-3 text-body-copy">
        <span className="text-small-copy font-semibold uppercase text-muted">
          End state
        </span>
        {GROUP_ORDER.map((g) => (
          <button
            type="button"
            key={g}
            className={`inline-flex items-center gap-1.5 rounded px-1 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
              legendHot && legendHot !== g ? "opacity-40" : ""
            }`}
            onMouseEnter={() => setLegendHover(g)}
            onMouseLeave={() => setLegendHover(null)}
            onFocus={() => setLegendHover(g)}
            onBlur={() => setLegendHover(null)}
            onClick={() =>
              setLegendPinned((current) => (current === g ? null : g))
            }
            aria-pressed={legendPinned === g}
          >
            <span
              className="inline-block w-3.5 h-3.5 rounded-sm"
              style={
                g === "unverified"
                  ? {
                      background:
                        "linear-gradient(90deg, var(--es-unverified), transparent)",
                    }
                  : { background: END_STATE_COLOR[g] }
              }
            />
            {GROUP_LABEL[g]}
          </button>
        ))}
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded px-1 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            legendHot && legendHot !== "demolished-glyph" ? "opacity-40" : ""
          }`}
          onMouseEnter={() => setLegendHover("demolished-glyph")}
          onMouseLeave={() => setLegendHover(null)}
          onFocus={() => setLegendHover("demolished-glyph")}
          onBlur={() => setLegendHover(null)}
          onClick={() =>
            setLegendPinned((current) =>
              current === "demolished-glyph" ? null : "demolished-glyph",
            )
          }
          aria-pressed={legendPinned === "demolished-glyph"}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <rect x="0" y="2" width="9" height="10" rx="1.5" fill="var(--es-closed)" opacity="0.85" />
            <g stroke="var(--foreground)" strokeWidth="1.3" opacity="0.8">
              <line x1="7" y1="3" x2="13" y2="11" />
              <line x1="7" y1="11" x2="13" y2="3" />
            </g>
          </svg>
          Building demolished
        </button>
      </div>

    </div>
  );
}
