"use client";

// ============================================================================
// EndStateFlow — the record as one flow: every documented parish fans out to
// its present end state, and the closed branch alone splits into building
// fates. Asymmetric three-column alluvial per the 2026-07-26 research brief,
// with every branch terminating on ONE aligned right edge (living branches
// pass through; the closed branch splits). Clicking a node or ribbon opens
// the parishes inside that flow. Plain-language caption lives on the page;
// an sr-only table carries the data for assistive tech.
// ============================================================================

import { useState } from "react";
import Link from "next/link";
import {
  GROUP_ORDER,
  GROUP_LABEL,
  END_STATE_COLOR,
  type EndStateGroup,
} from "@/lib/end-state";

export type FateKey =
  | "demolished"
  | "religious"
  | "secular"
  | "derelict"
  | "standing"
  | "unrecorded";

export interface FlowMember {
  name: string;
  city: string;
  state: string;
  founded: number | null;
  closed: number | null;
  href: string | null;
}

export interface FlowCounts {
  groups: Record<EndStateGroup, number>;
  closedFates: Record<FateKey, number>;
  /** Parishes inside each flow, keyed "g:<group>" or "fate:<fate>". */
  members: Record<string, FlowMember[]>;
}

const FATE_LABEL: Record<FateKey, string> = {
  demolished: "Building demolished",
  religious: "Sold to another congregation",
  secular: "Sold — secular use now",
  derelict: "Standing derelict",
  standing: "Building still standing",
  unrecorded: "Building fate unrecorded",
};

/** One plain-word line under each end-state label. */
const GROUP_SUBLABEL: Record<EndStateGroup, string> = {
  active_parish: "a functioning Lithuanian parish",
  mass_continues: "Lithuanian Mass survives inside a merged or host parish",
  transferred: "the church lives on — serving another community now",
  unresolved: "canonically undecided — under threat",
  closed: "the parish is gone; the buildings' fates →",
  unverified: "the record has not yet established the fate",
};

const FATE_OPACITY: Record<FateKey, number> = {
  demolished: 0.95,
  religious: 0.6,
  secular: 0.5,
  derelict: 0.42,
  standing: 0.32,
  unrecorded: 0.18,
};

const U = 2.3; // px per parish
const GAP2 = 34; // between mid-column nodes (room for two-line labels)
const GAP3 = 15; // between building-fate terminals
const NODE_W = 12;
const X_ROOT = 168;
const X_MID = 452;
const X_END = 724;
const W = 985;
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
  const [open, setOpen] = useState<string | null>(null);

  const total = GROUP_ORDER.reduce((s, g) => s + (counts.groups[g] ?? 0), 0);
  const groups = GROUP_ORDER.filter((g) => (counts.groups[g] ?? 0) > 0);
  const fates = (Object.keys(FATE_LABEL) as FateKey[]).filter(
    (k) => (counts.closedFates[k] ?? 0) > 0,
  );

  // ── Mid column (six end states) ──
  let y = TOP;
  const mid: Record<string, { y0: number; y1: number }> = {};
  for (const g of groups) {
    const h = counts.groups[g] * U;
    mid[g] = { y0: y, y1: y + h };
    y += h + GAP2;
  }

  // ── Terminal column: every branch ends here, aligned ──
  const term: Record<string, { y0: number; y1: number }> = {};
  let ty = TOP;
  for (const g of groups) {
    if (g === "closed") {
      for (const k of fates) {
        const h = counts.closedFates[k] * U;
        term[`fate:${k}`] = { y0: ty, y1: ty + h };
        ty += h + GAP3;
      }
      ty += GAP2 - GAP3;
    } else {
      const h = counts.groups[g] * U;
      term[`g:${g}`] = { y0: ty, y1: ty + h };
      ty += h + GAP2;
    }
  }
  const H = Math.max(y, ty) - GAP2 + 34;

  // ── Root column ──
  const rootH = total * U;
  const rootY0 = Math.max(TOP, (H - rootH) / 2 - 10);
  let acc = rootY0;
  const rootSeg: Record<string, { y0: number; y1: number }> = {};
  for (const g of groups) {
    const h = counts.groups[g] * U;
    rootSeg[g] = { y0: acc, y1: acc + h };
    acc += h;
  }

  // Fate ribbons leave the closed mid-node stacked in order
  const closedSeg: Record<string, { y0: number; y1: number }> = {};
  let closedAcc = mid["closed"]?.y0 ?? 0;
  for (const k of fates) {
    const h = counts.closedFates[k] * U;
    closedSeg[k] = { y0: closedAcc, y1: closedAcc + h };
    closedAcc += h;
  }

  const keyOfGroup = (g: EndStateGroup) => `g:${g}`;
  const isHotKey = (key: string) =>
    hot === key || (key === "g:closed" && hot?.startsWith("fate:"));
  const ribbonOpacity = (key: string, base: number) =>
    hot === null ? base : isHotKey(key) ? Math.min(base + 0.2, 1) : 0.12;
  const nodeDim = (key: string) => (hot === null || isHotKey(key) ? 1 : 0.3);

  const toggle = (key: string) => setOpen((o) => (o === key ? null : key));

  const openLabel =
    open?.startsWith("fate:")
      ? FATE_LABEL[open.slice(5) as FateKey]
      : open
        ? GROUP_LABEL[open.slice(2) as EndStateGroup]
        : null;
  const openMembers = open ? (counts.members[open] ?? []) : [];

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          style={{ minWidth: 780 }}
          role="img"
          aria-label={`Flow of ${total} documented parishes to their end states; the closed branch splits into building fates. Click a flow to list its parishes.`}
        >
          {/* Root node + label */}
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

          {/* Root → mid ribbons */}
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
              opacity={ribbonOpacity(keyOfGroup(g), 0.6)}
              className="cursor-pointer"
              onMouseEnter={() => setHot(keyOfGroup(g))}
              onMouseLeave={() => setHot(null)}
              onClick={() => toggle(keyOfGroup(g))}
            >
              <title>{`${GROUP_LABEL[g]}: ${counts.groups[g]} of ${total} — click to list`}</title>
            </path>
          ))}

          {/* Mid nodes (unlabeled except closed, which explains the split) */}
          {groups.map((g) => (
            <g key={`n-${g}`} opacity={nodeDim(keyOfGroup(g))}>
              <rect
                x={X_MID}
                y={mid[g].y0}
                width={NODE_W}
                height={Math.max(mid[g].y1 - mid[g].y0, 3)}
                fill={END_STATE_COLOR[g]}
                rx={2}
                className="cursor-pointer"
                onClick={() => toggle(keyOfGroup(g))}
              />
              {g === "closed" && (
                <text
                  x={X_MID - 2}
                  y={mid[g].y0 - 22}
                  fontSize={13}
                  fontWeight={600}
                  fill="var(--foreground)"
                >
                  {GROUP_LABEL[g]}
                  <tspan fontWeight={400} fill="var(--muted)">
                    {` · ${counts.groups[g]}`}
                  </tspan>
                  <tspan
                    x={X_MID - 2}
                    dy={14}
                    fontSize={10.5}
                    fontWeight={400}
                    fill="var(--muted)"
                  >
                    {GROUP_SUBLABEL[g]}
                  </tspan>
                </text>
              )}
            </g>
          ))}

          {/* Pass-through ribbons: living branches run to the aligned edge */}
          {groups
            .filter((g) => g !== "closed")
            .map((g) => (
              <path
                key={`p-${g}`}
                d={band(
                  X_MID + NODE_W,
                  mid[g].y0,
                  mid[g].y1,
                  X_END,
                  term[`g:${g}`].y0,
                  term[`g:${g}`].y1,
                )}
                fill={END_STATE_COLOR[g]}
                opacity={ribbonOpacity(keyOfGroup(g), 0.42)}
                className="cursor-pointer"
                onMouseEnter={() => setHot(keyOfGroup(g))}
                onMouseLeave={() => setHot(null)}
                onClick={() => toggle(keyOfGroup(g))}
              >
                <title>{`${GROUP_LABEL[g]}: ${counts.groups[g]} of ${total} — click to list`}</title>
              </path>
            ))}

          {/* Closed → building-fate ribbons */}
          {fates.map((k) => (
            <path
              key={`f-${k}`}
              d={band(
                X_MID + NODE_W,
                closedSeg[k].y0,
                closedSeg[k].y1,
                X_END,
                term[`fate:${k}`].y0,
                term[`fate:${k}`].y1,
              )}
              fill="var(--es-closed)"
              opacity={ribbonOpacity(`fate:${k}`, FATE_OPACITY[k] * 0.75)}
              className="cursor-pointer"
              onMouseEnter={() => setHot(`fate:${k}`)}
              onMouseLeave={() => setHot(null)}
              onClick={() => toggle(`fate:${k}`)}
            >
              <title>{`${FATE_LABEL[k]}: ${counts.closedFates[k]} of ${counts.groups.closed} closed — click to list`}</title>
            </path>
          ))}

          {/* Terminal nodes + all labels, on one aligned edge */}
          {groups
            .filter((g) => g !== "closed")
            .map((g) => {
              const t = term[`g:${g}`];
              const cy = (t.y0 + t.y1) / 2;
              return (
                <g key={`t-${g}`} opacity={nodeDim(keyOfGroup(g))}>
                  <rect
                    x={X_END}
                    y={t.y0}
                    width={NODE_W}
                    height={Math.max(t.y1 - t.y0, 3)}
                    fill={END_STATE_COLOR[g]}
                    rx={2}
                    className="cursor-pointer"
                    onClick={() => toggle(keyOfGroup(g))}
                  />
                  <text
                    x={X_END + NODE_W + 8}
                    y={cy - 7}
                    fontSize={13}
                    fontWeight={600}
                    fill="var(--foreground)"
                  >
                    {GROUP_LABEL[g]}
                    <tspan fontWeight={400} fill="var(--muted)">
                      {` · ${counts.groups[g]}`}
                    </tspan>
                    <tspan
                      x={X_END + NODE_W + 8}
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
          {fates.map((k) => {
            const t = term[`fate:${k}`];
            return (
              <g
                key={`e-${k}`}
                opacity={hot === null || hot === `fate:${k}` ? 1 : 0.3}
              >
                <rect
                  x={X_END}
                  y={t.y0}
                  width={NODE_W}
                  height={Math.max(t.y1 - t.y0, 3)}
                  fill="var(--es-closed)"
                  opacity={FATE_OPACITY[k]}
                  rx={2}
                  className="cursor-pointer"
                  onClick={() => toggle(`fate:${k}`)}
                />
                {k === "demolished" && (
                  <g stroke="var(--foreground)" strokeWidth={1.4} opacity={0.85}>
                    <line
                      x1={X_END + 2}
                      y1={t.y0 + 3}
                      x2={X_END + NODE_W - 2}
                      y2={t.y1 - 3}
                    />
                    <line
                      x1={X_END + 2}
                      y1={t.y1 - 3}
                      x2={X_END + NODE_W - 2}
                      y2={t.y0 + 3}
                    />
                  </g>
                )}
                <text
                  x={X_END + NODE_W + 8}
                  y={(t.y0 + t.y1) / 2}
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
            );
          })}
        </svg>
      </div>

      <p className="mt-2 text-xs text-muted">
        Click any flow to see the parishes inside it.
      </p>

      {/* ── The parishes inside the clicked flow ── */}
      {open && (
        <div className="mt-4 rounded-lg border border-rule overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-rule bg-foreground/[0.02]">
            <p className="font-serif font-semibold">
              {openLabel}
              <span className="ml-2 text-sm font-sans font-normal text-muted">
                {openMembers.length}{" "}
                {openMembers.length === 1 ? "parish" : "parishes"}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="text-sm text-muted hover:text-foreground"
              aria-label="Close list"
            >
              ✕
            </button>
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-6 divide-y divide-rule sm:divide-y-0 px-4 py-2 text-sm">
            {openMembers.map((m) => (
              <li key={`${m.name}-${m.city}`} className="py-1.5 flex items-baseline gap-2">
                {m.href ? (
                  <Link
                    href={m.href}
                    className="font-medium underline decoration-rule underline-offset-2 hover:decoration-inherit min-w-0 truncate"
                  >
                    {m.name}
                  </Link>
                ) : (
                  <span className="font-medium min-w-0 truncate">{m.name}</span>
                )}
                <span className="text-xs text-muted whitespace-nowrap">
                  {m.city}, {m.state}
                  {m.founded || m.closed
                    ? ` · ${m.founded ?? "?"}–${m.closed ?? "present"}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
