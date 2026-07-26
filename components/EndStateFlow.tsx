"use client";

// ============================================================================
// EndStateFlow — the record as one flow: every documented parish fans out to
// its present end state, and the closed branch alone splits again into what
// happened to the buildings. Asymmetric three-stage alluvial (aligned node
// columns, no arrowheads), per the 2026-07-26 flow-chart research brief:
// nodes ordered continuity→loss, direct labels with counts on every node,
// color by destination in two families, sigmoid ribbons, plain-language
// caption carried by the page, sr-only data table for accessibility.
// ============================================================================

import { useState } from "react";
import {
  GROUP_ORDER,
  GROUP_LABEL,
  END_STATE_COLOR,
  type EndStateGroup,
} from "@/lib/end-state";

export interface FlowCounts {
  groups: Record<EndStateGroup, number>;
  /** Building fates within the closed family — the full taxonomy. */
  closedFates: {
    demolished: number;
    religious: number;
    secular: number;
    derelict: number;
    standing: number;
    unrecorded: number;
  };
}

const FATE_LABEL: Record<keyof FlowCounts["closedFates"], string> = {
  demolished: "Building demolished",
  religious: "Sold to another congregation",
  secular: "Sold — secular use now",
  derelict: "Standing derelict",
  standing: "Building still standing",
  unrecorded: "Building fate unrecorded",
};

/** One plain-word line under each end-state node — the full story of what
 *  each category means, so the chart needs no glossary. */
const GROUP_SUBLABEL: Record<EndStateGroup, string> = {
  active_parish: "a functioning Lithuanian parish",
  mass_continues: "Lithuanian Mass survives inside a merged or host parish",
  transferred: "the church lives on — serving another community now",
  unresolved: "canonically undecided — under threat",
  closed: "the parish is gone; what happened to the buildings →",
  unverified: "the record has not yet established the fate",
};

// Loss-family shading: the strongest treatment goes to the branch the story
// is about (demolished); the rest step down.
const FATE_OPACITY: Record<keyof FlowCounts["closedFates"], number> = {
  demolished: 0.95,
  religious: 0.6,
  secular: 0.5,
  derelict: 0.42,
  standing: 0.32,
  unrecorded: 0.18,
};

const U = 2.3; // px per parish
const GAP2 = 34; // gap between stage-2 nodes (room for two-line labels)
const GAP3 = 14; // gap between stage-3 nodes
const NODE_W = 12;
const X_ROOT = 168;
const X_MID = 452;
const X_END = 724;
const W = 950;
const TOP = 26;

function band(
  x0: number,
  y0a: number,
  y0b: number,
  x1: number,
  y1a: number,
  y1b: number,
) {
  const m = (x0 + x1) / 2;
  return `M ${x0} ${y0a} C ${m} ${y0a}, ${m} ${y1a}, ${x1} ${y1a} L ${x1} ${y1b} C ${m} ${y1b}, ${m} ${y0b}, ${x0} ${y0b} Z`;
}

export default function EndStateFlow({ counts }: { counts: FlowCounts }) {
  const [hot, setHot] = useState<string | null>(null);

  const total = GROUP_ORDER.reduce((s, g) => s + (counts.groups[g] ?? 0), 0);
  const groups = GROUP_ORDER.filter((g) => (counts.groups[g] ?? 0) > 0);

  // Stage-2 vertical layout
  let y = TOP;
  const mid: Record<string, { y0: number; y1: number }> = {};
  for (const g of groups) {
    const h = counts.groups[g] * U;
    mid[g] = { y0: y, y1: y + h };
    y += h + GAP2;
  }
  const H = y - GAP2 + 30;

  // Root column: centered against the stage-2 span
  const rootH = total * U;
  const rootY0 = TOP + (y - GAP2 - TOP - rootH) / 2;

  // Root offsets per group (stacked in the same order)
  let acc = rootY0;
  const rootSeg: Record<string, { y0: number; y1: number }> = {};
  for (const g of groups) {
    const h = counts.groups[g] * U;
    rootSeg[g] = { y0: acc, y1: acc + h };
    acc += h;
  }

  // Stage-3: only off "closed", centered on the closed node's span
  const fates = (
    Object.keys(counts.closedFates) as (keyof FlowCounts["closedFates"])[]
  ).filter((k) => counts.closedFates[k] > 0);
  const closedTotal = fates.reduce((s, k) => s + counts.closedFates[k], 0);
  const endH = closedTotal * U + (fates.length - 1) * GAP3;
  const closedSpan = mid["closed"];
  let ey = closedSpan
    ? Math.min(
        Math.max(TOP, (closedSpan.y0 + closedSpan.y1) / 2 - endH / 2),
        H - endH - 4,
      )
    : TOP;
  const end: Record<string, { y0: number; y1: number }> = {};
  let closedAcc = closedSpan?.y0 ?? 0;
  const closedSeg: Record<string, { y0: number; y1: number }> = {};
  for (const k of fates) {
    const h = counts.closedFates[k] * U;
    end[k] = { y0: ey, y1: ey + h };
    ey += h + GAP3;
    closedSeg[k] = { y0: closedAcc, y1: closedAcc + h };
    closedAcc += h;
  }

  const dim = (key: string) =>
    hot === null ? 1 : hot === key || (hot.startsWith("fate:") && key === "closed-base" ) ? 1 : 0.25;

  const ribbonOpacity = (key: string, base: number) =>
    hot === null ? base : hot === key ? Math.min(base + 0.2, 1) : 0.12;

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ minWidth: 760 }}
          role="img"
          aria-label={`Flow of ${total} documented parishes to their end states; the closed branch splits into building fates`}
        >
          {/* Root node */}
          <rect
            x={X_ROOT}
            y={rootY0}
            width={NODE_W}
            height={rootH}
            fill="var(--mark-ink)"
            opacity={0.85}
            rx={2}
          />
          <text
            x={X_ROOT - 10}
            y={rootY0 + rootH / 2 - 8}
            textAnchor="end"
            fontSize={15}
            fontWeight={700}
            fill="var(--foreground)"
            className="font-serif"
          >
            {total} parishes
          </text>
          <text
            x={X_ROOT - 10}
            y={rootY0 + rootH / 2 + 10}
            textAnchor="end"
            fontSize={11}
            fill="var(--muted)"
          >
            documented in the record
          </text>

          {/* Root → end-state ribbons */}
          {groups.map((g) => (
            <path
              key={`r-${g}`}
              d={band(
                X_ROOT + NODE_W,
                rootSeg[g].y0,
                rootSeg[g].y1,
                X_MID,
                mid[g].y0,
                mid[g].y1,
              )}
              fill={END_STATE_COLOR[g]}
              opacity={ribbonOpacity(`g:${g}`, 0.6)}
              onMouseEnter={() => setHot(`g:${g}`)}
              onMouseLeave={() => setHot(null)}
            >
              <title>{`${GROUP_LABEL[g]}: ${counts.groups[g]} of ${total}`}</title>
            </path>
          ))}

          {/* Stage-2 nodes + two-line labels (name · count / plain-word story) */}
          {groups.map((g) => {
            const isClosed = g === "closed";
            const cy = (mid[g].y0 + mid[g].y1) / 2;
            const labelX = isClosed ? X_MID - 2 : X_MID + NODE_W + 8;
            const labelY = isClosed ? mid[g].y0 - 22 : cy - 7;
            return (
              <g key={`n-${g}`} opacity={dim(`g:${g}`)}>
                <rect
                  x={X_MID}
                  y={mid[g].y0}
                  width={NODE_W}
                  height={Math.max(mid[g].y1 - mid[g].y0, 3)}
                  fill={END_STATE_COLOR[g]}
                  rx={2}
                />
                <text
                  x={labelX}
                  y={labelY}
                  fontSize={13}
                  fontWeight={600}
                  fill="var(--foreground)"
                >
                  {GROUP_LABEL[g]}
                  <tspan fontWeight={400} fill="var(--muted)">
                    {` · ${counts.groups[g]}`}
                  </tspan>
                  <tspan
                    x={labelX}
                    dy={14}
                    fontSize={10.5}
                    fontWeight={400}
                    fill="var(--muted)"
                  >
                    {GROUP_SUBLABEL[g]}
                  </tspan>
                </text>
              </g>
            );
          })}

          {/* Closed → building-fate ribbons */}
          {closedSpan &&
            fates.map((k) => (
              <path
                key={`f-${k}`}
                d={band(
                  X_MID + NODE_W,
                  closedSeg[k].y0,
                  closedSeg[k].y1,
                  X_END,
                  end[k].y0,
                  end[k].y1,
                )}
                fill="var(--es-closed)"
                opacity={ribbonOpacity(`fate:${k}`, FATE_OPACITY[k] * 0.75)}
                onMouseEnter={() => setHot(`fate:${k}`)}
                onMouseLeave={() => setHot(null)}
              >
                <title>{`${FATE_LABEL[k]}: ${counts.closedFates[k]} of ${closedTotal} closed`}</title>
              </path>
            ))}

          {/* Stage-3 nodes + labels */}
          {fates.map((k) => (
            <g key={`e-${k}`} opacity={hot === null || hot === `fate:${k}` ? 1 : 0.3}>
              <rect
                x={X_END}
                y={end[k].y0}
                width={NODE_W}
                height={Math.max(end[k].y1 - end[k].y0, 3)}
                fill="var(--es-closed)"
                opacity={FATE_OPACITY[k]}
                rx={2}
              />
              {k === "demolished" && (
                <g stroke="var(--foreground)" strokeWidth={1.4} opacity={0.85}>
                  <line
                    x1={X_END + 2}
                    y1={end[k].y0 + 3}
                    x2={X_END + NODE_W - 2}
                    y2={end[k].y1 - 3}
                  />
                  <line
                    x1={X_END + 2}
                    y1={end[k].y1 - 3}
                    x2={X_END + NODE_W - 2}
                    y2={end[k].y0 + 3}
                  />
                </g>
              )}
              <text
                x={X_END + NODE_W + 8}
                y={(end[k].y0 + end[k].y1) / 2}
                dominantBaseline="central"
                fontSize={12}
                fontWeight={k === "demolished" ? 700 : 600}
                fill="var(--foreground)"
              >
                {FATE_LABEL[k]}
                <tspan fontWeight={400} fill="var(--muted)">
                  {` · ${counts.closedFates[k]}`}
                </tspan>
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Accessible data table (visually hidden) */}
      <table className="sr-only">
        <caption>
          Documented parishes by end state, and building fates of the closed
        </caption>
        <tbody>
          {groups.map((g) => (
            <tr key={g}>
              <td>{GROUP_LABEL[g]}</td>
              <td>{counts.groups[g]}</td>
            </tr>
          ))}
          {fates.map((k) => (
            <tr key={k}>
              <td>Closed — {FATE_LABEL[k]}</td>
              <td>{counts.closedFates[k]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
