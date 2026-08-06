"use client";

// ============================================================================
// ParishThreads — every Lithuanian Roman Catholic institution as its own line,
// from the decade it began to where it stands today. Closed institutions gather
// and then fan out by what became of the church they last used.
//
// Two rules govern this component:
//
//   1. It is an INSTITUTION view. An institution and its church building are
//      separate units with separate populations. Building condition belongs to
//      /church-buildings-through-time and is never counted here.
//   2. Every label, count and explanation comes from the canonical projection.
//      The component holds no parish list, description map, or per-parish
//      exception.
//
// Presentation notes (2026-08-04, approved design):
//   · one headed column at each edge — a second "end state" heading over the
//     Closed bracket read as the same question asked twice;
//   · label positions are decluttered and carry a leader back to their band,
//     because a two-member band is only a few units tall and proximity alone
//     attaches its label to the wrong mark;
//   · "not yet established" is stated as a research gap, never as an outcome;
//   · a future plan is labelled as a plan, never as a completed merger.
// ============================================================================

import { useMemo, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GROUP_ORDER,
  GROUP_LABEL,
  END_STATE_COLOR,
  toGroup,
  type EndState,
  type EndStateGroup,
} from "@/lib/end-state";

/** Canonical terminal-site conditions, plus the coverage gap. */
export type FateKey =
  | "demolished"
  | "repurposed"
  | "listed_for_sale"
  | "standing"
  | "unrecorded";

export interface ThreadContinuation {
  mode: string;
  summary: string;
  destination: string | null;
  effective: string | null;
  futurePlan: string | null;
}

export interface ThreadParish {
  slug: string;
  name: string;
  city: string;
  state: string;
  /** Full canonical jurisdiction name; never built by prefixing a short field. */
  jurisdiction: string | null;
  anchorYear: number | null;
  anchorLabel: string;
  anchorDisplay: string | null;
  endedDisplay: string | null;
  recordType: "parish" | "misija";
  endState: EndState;
  /** Terminal-site condition for the closed family; null for living branches. */
  fateKey: FateKey | null;
  /** Brain's adjudicated continuation, on transferred institutions only. */
  continuation: ThreadContinuation | null;
  href: string | null;
}

export interface AdditionalHostedCommunity {
  id: string;
  name: string;
  city: string;
  state: string;
  ministry: string;
  officialSite?: string;
}

const FATE_LABEL: Record<FateKey, string> = {
  demolished: "Demolished",
  repurposed: "Repurposed",
  listed_for_sale: "Listed for sale",
  standing: "Closed parish — church standing",
  unrecorded: "Terminal church outcome not yet established",
};

const FATE_SUB: Record<FateKey, string> = {
  demolished: "their last church was demolished",
  repurposed: "no longer a Lithuanian place of worship",
  listed_for_sale: "on the market",
  standing: "the institution ended; its church did not",
  unrecorded: "a research gap, not an outcome",
};

// Long drawer explanations. Each says what the category counts and, just as
// importantly, what it does not claim.
const FATE_NOTE: Partial<Record<FateKey, string>> = {
  demolished:
    "These historical Roman Catholic institutions are closed, and their final documented worship sites were later demolished. This view counts parishes and missions, not every building they used: each institution appears once, according to the condition of its terminal worship site. Earlier churches belonging to the same parish are recorded separately among the church buildings. Parish closure and building demolition are also separate events and may have happened in different years.",
  repurposed:
    "These closed Roman Catholic institutions have terminal worship sites that survive in another use. Repurposed may mean worship by another Christian community, conversion into housing, or use as a cultural or community facility. This view counts each historical institution once and assigns a building outcome only when its terminal worship site — or all of its terminal sites — resolves canonically to the same condition. It therefore does not include every repurposed building associated with the Lithuanian parish story.",
  standing:
    "The historical Lithuanian parish has ended, but its terminal church building remains standing. This category covers only closed parish institutions; standing churches belonging to active, hosted-Mass, or transferred communities appear in their respective parish-status groups.",
  unrecorded:
    "The present condition of these closed institutions' final worship sites has not yet been established. This does not mean that a church is gone: it may still stand, have another use, have been demolished, or have reached another outcome that has not yet been confirmed.",
};

const GROUP_NOTE: Partial<Record<EndStateGroup, string>> = {
  transferred:
    "The historical Lithuanian parish no longer operates as a current Lithuanian pastoral institution, but its life continues in another form: the same parish may now serve a different community, a successor parish may carry Catholic life forward, or the former church may serve another religious community. This category does not mean that every institution closed or merged. Each card identifies the confirmed form of continuity.",
};

const FATE_ORDER: FateKey[] = [
  "demolished",
  "repurposed",
  "listed_for_sale",
  "standing",
  "unrecorded",
];

const GROUP_SUBLABEL: Record<EndStateGroup, string> = {
  active_parish: "regular Lithuanian worship today",
  mass_continues: "inside a parish no longer Lithuanian-led",
  transferred: "no longer a Lithuanian pastoral institution",
  unresolved: "contested or canonically undecided",
  closed: "institution closed; the church follows →",
  unverified: "present status still being researched",
};

const FLOW_GROUP_LABEL: Record<EndStateGroup, string> = {
  ...GROUP_LABEL,
  active_parish: "Active Lithuanian parish or mission",
};

const institutionType = (recordType: ThreadParish["recordType"]) =>
  recordType === "misija" ? "Mission" : "Parish";

const FATE_OPACITY: Record<FateKey, number> = {
  demolished: 0.95,
  repurposed: 0.7,
  listed_for_sale: 0.68,
  standing: 0.68,
  unrecorded: 0.22,
};

// Geometry — a compact field with room for labels at both edges.
const W = 872;
const TOP = 58;
const X_DEC = 148; // right edge of the decade bands
const DEC_W = 10;
const X_MID = 404;
const X_END = 622;
const NODE_W = 12;
const GAP_DEC = 9;
const GAP_MID = 26;
const GAP_FATE = 13;
// A decade label is one line; a terminal label is a title plus a sub-line.
const DEC_LABEL_GAP = 16;
const TERM_LABEL_GAP = 32;

function decadeOf(anchorYear: number | null): string {
  if (!anchorYear) return "Undated";
  const d = Math.floor(anchorYear / 10) * 10;
  return `${d}s`;
}

const fold = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/**
 * Lay label centres out in order, pushing each at least `minGap` below the one
 * above, then settle back up from the last if that overruns the field. The bands
 * themselves never move — only their labels, which carry a leader line home.
 */
function declutterLabels(
  bands: { y0: number; y1: number }[],
  minGap: number,
  floor: number,
): number[] {
  const out: number[] = [];
  let previous = Number.NEGATIVE_INFINITY;
  for (const band of bands) {
    const centre = Math.max((band.y0 + band.y1) / 2, previous + minGap);
    out.push(centre);
    previous = centre;
  }
  if (out.length && out[out.length - 1] > floor) {
    let ceiling = floor;
    for (let i = out.length - 1; i >= 0; i -= 1) {
      if (out[i] > ceiling) out[i] = ceiling;
      ceiling = out[i] - minGap;
    }
  }
  return out;
}

export default function ParishThreads({
  parishes,
  additionalHostedCommunities = [],
}: {
  parishes: ThreadParish[];
  additionalHostedCommunities?: AdditionalHostedCommunity[];
}) {
  const router = useRouter();
  const [hot, setHot] = useState<string | null>(null); // slug | band key
  const [open, setOpen] = useState<string | null>(null); // band key
  const [query, setQuery] = useState("");

  const model = useMemo(() => {
    const groupIdx = (p: ThreadParish) =>
      GROUP_ORDER.indexOf(toGroup(p.endState));
    const fateIdx = (p: ThreadParish) =>
      p.fateKey ? FATE_ORDER.indexOf(p.fateKey) : -1;

    // ── Decade bands (left) ──
    const decades = new Map<string, ThreadParish[]>();
    for (const p of parishes) {
      const k = decadeOf(p.anchorYear);
      if (!decades.has(k)) decades.set(k, []);
      decades.get(k)!.push(p);
    }
    const decadeKeys = [...decades.keys()].sort((a, b) => {
      if (a === "Undated") return 1;
      if (b === "Undated") return -1;
      return parseInt(a) - parseInt(b);
    });
    // Within a decade, sort by destination so same-fate threads bundle.
    for (const k of decadeKeys)
      decades
        .get(k)!
        .sort(
          (a, b) =>
            groupIdx(a) - groupIdx(b) ||
            fateIdx(a) - fateIdx(b) ||
            a.name.localeCompare(b.name),
        );

    const total = parishes.length;
    const U = (560 - GAP_DEC * (decadeKeys.length - 1)) / Math.max(total, 1);

    const decadeLayout: {
      key: string;
      y0: number;
      y1: number;
      count: number;
    }[] = [];
    const yOfParishDecade = new Map<string, number>();
    let y = TOP;
    for (const k of decadeKeys) {
      const list = decades.get(k)!;
      const y0 = y;
      list.forEach((p, i) => yOfParishDecade.set(p.slug, y0 + (i + 0.5) * U));
      y += list.length * U;
      decadeLayout.push({ key: k, y0, y1: y, count: list.length });
      y += GAP_DEC;
    }
    const fieldBottom = y - GAP_DEC;

    // ── Mid column (outcome groups) ──
    const groups = GROUP_ORDER.filter((g) =>
      parishes.some((p) => toGroup(p.endState) === g),
    );
    const byGroup = new Map<EndStateGroup, ThreadParish[]>();
    for (const g of groups) byGroup.set(g, []);
    for (const p of parishes) byGroup.get(toGroup(p.endState))!.push(p);
    const decadeIdx = (p: ThreadParish) =>
      decadeKeys.indexOf(decadeOf(p.anchorYear));
    for (const g of groups)
      byGroup
        .get(g)!
        .sort(
          (a, b) =>
            fateIdx(a) - fateIdx(b) ||
            decadeIdx(a) - decadeIdx(b) ||
            a.name.localeCompare(b.name),
        );

    const midSpanH = fieldBottom - TOP;
    const midU =
      (midSpanH - GAP_MID * (groups.length - 1)) / Math.max(total, 1);
    const mid = new Map<EndStateGroup, { y0: number; y1: number }>();
    const yOfParishMid = new Map<string, number>();
    let my = TOP;
    for (const g of groups) {
      const list = byGroup.get(g)!;
      const y0 = my;
      list.forEach((p, i) => yOfParishMid.set(p.slug, y0 + (i + 0.5) * midU));
      my += list.length * midU;
      mid.set(g, { y0, y1: my });
      my += GAP_MID;
    }

    // ── Terminal column: living groups pass through; closed splits ──
    const fatesPresent = FATE_ORDER.filter((k) =>
      parishes.some((p) => p.fateKey === k),
    );
    const termKeys: string[] = [];
    for (const g of groups) {
      if (g === "closed")
        for (const k of fatesPresent) termKeys.push(`fate:${k}`);
      else termKeys.push(`g:${g}`);
    }
    const termMembers = new Map<string, ThreadParish[]>();
    for (const key of termKeys) termMembers.set(key, []);
    for (const p of parishes) {
      const g = toGroup(p.endState);
      const key = g === "closed" ? `fate:${p.fateKey}` : `g:${g}`;
      termMembers.get(key)?.push(p);
    }
    for (const key of termKeys)
      termMembers
        .get(key)!
        .sort(
          (a, b) => decadeIdx(a) - decadeIdx(b) || a.name.localeCompare(b.name),
        );

    const gapFor = (i: number) => {
      const a = termKeys[i];
      const b = termKeys[i + 1];
      if (!b) return 0;
      return a.startsWith("fate:") && b.startsWith("fate:")
        ? GAP_FATE
        : GAP_MID;
    };
    let gapsTotal = 0;
    for (let i = 0; i < termKeys.length - 1; i++) gapsTotal += gapFor(i);
    const termU = (midSpanH - gapsTotal) / Math.max(total, 1);
    const term = new Map<string, { y0: number; y1: number }>();
    const yOfParishTerm = new Map<string, number>();
    let tyy = TOP;
    termKeys.forEach((key, i) => {
      const list = termMembers.get(key)!;
      const y0 = tyy;
      list.forEach((p, j) => yOfParishTerm.set(p.slug, y0 + (j + 0.5) * termU));
      tyy += list.length * termU;
      term.set(key, { y0, y1: tyy });
      tyy += gapFor(i);
    });

    const H = Math.max(fieldBottom, tyy - GAP_MID) + 36;

    // Label positions are decluttered independently of the bands.
    const labelFloor = H - 30;
    const decadeLabelY = declutterLabels(
      decadeLayout,
      DEC_LABEL_GAP,
      labelFloor,
    );
    const termLabelY = declutterLabels(
      termKeys.map((key) => term.get(key)!),
      TERM_LABEL_GAP,
      labelFloor,
    );

    const bandMembers = new Map<string, ThreadParish[]>(termMembers);
    for (const g of groups) bandMembers.set(`g:${g}`, byGroup.get(g)!);
    for (const k of decadeKeys) bandMembers.set(`dec:${k}`, decades.get(k)!);

    return {
      decadeLayout,
      decadeLabelY,
      groups,
      mid,
      termKeys,
      term,
      termLabelY,
      bandMembers,
      yOfParishDecade,
      yOfParishMid,
      yOfParishTerm,
      total,
      H,
      counts: Object.fromEntries(
        groups.map((g) => [g, byGroup.get(g)!.length]),
      ) as Record<EndStateGroup, number>,
      fateCounts: Object.fromEntries(
        fatesPresent.map((k) => [k, termMembers.get(`fate:${k}`)!.length]),
      ) as Record<FateKey, number>,
    };
  }, [parishes]);

  const matches = useMemo(() => {
    const q = fold(query.trim());
    if (q.length < 2) return [];
    return parishes
      .filter((p) =>
        fold([p.name, p.city, p.state].filter(Boolean).join(" ")).includes(q),
      )
      .slice(0, 8);
  }, [query, parishes]);
  const matchSlugs = useMemo(
    () => new Set(matches.map((m) => m.slug)),
    [matches],
  );

  const bandKeyOf = (p: ThreadParish) => {
    const g = toGroup(p.endState);
    return g === "closed" ? `fate:${p.fateKey}` : `g:${g}`;
  };

  const isThreadActive = (p: ThreadParish) => {
    if (matchSlugs.size > 0) return matchSlugs.has(p.slug);
    const activeKey = hot;
    if (!activeKey) return true;
    if (
      activeKey.startsWith("g:") ||
      activeKey.startsWith("fate:") ||
      activeKey.startsWith("dec:")
    ) {
      if (activeKey.startsWith("dec:"))
        return decadeOf(p.anchorYear) === activeKey.slice(4);
      if (activeKey === "g:closed") return toGroup(p.endState) === "closed";
      return (
        bandKeyOf(p) === activeKey || `g:${toGroup(p.endState)}` === activeKey
      );
    }
    return activeKey === p.slug;
  };
  const anyFocus = hot !== null || matchSlugs.size > 0;

  const hovered =
    hot && !hot.includes(":") ? parishes.find((p) => p.slug === hot) : null;

  const threadPath = (p: ThreadParish) => {
    const y0 = model.yOfParishDecade.get(p.slug)!;
    const y1 = model.yOfParishMid.get(p.slug)!;
    const y2 = model.yOfParishTerm.get(p.slug)!;
    const m1 = (X_DEC + DEC_W + X_MID) / 2;
    const m2 = (X_MID + NODE_W + X_END) / 2;
    return (
      `M ${X_DEC + DEC_W} ${y0.toFixed(1)} ` +
      `C ${m1} ${y0.toFixed(1)}, ${m1} ${y1.toFixed(1)}, ${X_MID} ${y1.toFixed(1)} ` +
      `L ${X_MID + NODE_W} ${y1.toFixed(1)} ` +
      `C ${m2} ${y1.toFixed(1)}, ${m2} ${y2.toFixed(1)}, ${X_END} ${y2.toFixed(1)}`
    );
  };

  const threadYAtX = (p: ThreadParish, x: number) => {
    const y0 = model.yOfParishDecade.get(p.slug)!;
    const y1 = model.yOfParishMid.get(p.slug)!;
    const y2 = model.yOfParishTerm.get(p.slug)!;
    const x0 = X_DEC + DEC_W;
    const x1 = X_MID;
    const x2 = X_MID + NODE_W;
    const x3 = X_END;

    const cubicYAtX = (
      targetX: number,
      startX: number,
      controlX: number,
      endX: number,
      startY: number,
      endY: number,
    ) => {
      let low = 0;
      let high = 1;
      for (let i = 0; i < 12; i += 1) {
        const t = (low + high) / 2;
        const u = 1 - t;
        const curveX =
          u * u * u * startX +
          3 * u * u * t * controlX +
          3 * u * t * t * controlX +
          t * t * t * endX;
        if (curveX < targetX) low = t;
        else high = t;
      }
      const t = (low + high) / 2;
      const u = 1 - t;
      return (
        u * u * u * startY +
        3 * u * u * t * startY +
        3 * u * t * t * endY +
        t * t * t * endY
      );
    };

    if (x < x0 || x > x3) return null;
    if (x <= x1) return cubicYAtX(x, x0, (x0 + x1) / 2, x1, y0, y1);
    if (x <= x2) return y1;
    return cubicYAtX(x, x2, (x2 + x3) / 2, x3, y1, y2);
  };

  const nearestThreadAtPointer = (event: MouseEvent<SVGGElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    const screenMatrix = svg?.getScreenCTM();
    if (!svg || !screenMatrix) return null;

    const pointer = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      screenMatrix.inverse(),
    );
    let nearest: ThreadParish | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const parish of parishes) {
      const threadY = threadYAtX(parish, pointer.x);
      if (threadY === null) continue;
      const distance = Math.abs(pointer.y - threadY);
      if (distance < nearestDistance) {
        nearest = parish;
        nearestDistance = distance;
      }
    }

    return nearest && nearestDistance <= 14 ? nearest : null;
  };

  const previewNearestThread = (event: MouseEvent<SVGGElement>) => {
    const nearest = nearestThreadAtPointer(event);
    const nextHot = nearest?.slug ?? null;
    setHot((current) => (current === nextHot ? current : nextHot));
  };

  const selectNearestThread = (event: MouseEvent<SVGGElement>) => {
    const nearest = nearestThreadAtPointer(event);
    if (nearest?.href) router.push(nearest.href);
  };

  const openFate: FateKey | null = open?.startsWith("fate:")
    ? (open.slice(5) as FateKey)
    : null;
  const openGroup: EndStateGroup | null = open?.startsWith("g:")
    ? (open.slice(2) as EndStateGroup)
    : null;
  const openLabel = openFate
    ? FATE_LABEL[openFate]
    : open?.startsWith("dec:")
      ? open.slice(4) === "Undated"
        ? "No established beginning"
        : `Began in the ${open.slice(4)}`
      : openGroup
        ? FLOW_GROUP_LABEL[openGroup]
        : null;
  const openNote = openFate
    ? FATE_NOTE[openFate]
    : openGroup
      ? (GROUP_NOTE[openGroup] ?? null)
      : open?.startsWith("dec:") && open.slice(4) === "Undated"
        ? "No founding year is established for these records; none is inferred."
        : null;
  const openMembers = open ? (model.bandMembers.get(open) ?? []) : [];

  // A leader from the band's true centre to its displaced label.
  const leaderPath = (bandCy: number, labelCy: number) => {
    const x0 = X_END + NODE_W;
    if (Math.abs(labelCy - bandCy) <= 2) return `M ${x0} ${bandCy} H ${x0 + 7}`;
    return `M ${x0} ${bandCy} H ${x0 + 3} L ${x0 + 6} ${labelCy} H ${x0 + 7}`;
  };

  return (
    <div>
      {/* ── Search is the reliable non-hover entry point ── */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a parish by name or city…"
          className="w-64 rounded-md border border-rule bg-background px-2 py-1.5 text-sm"
          aria-label="Find a parish by name or city"
        />
      </div>
      {matches.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2 text-sm">
          {matches.map((m) => (
            <li key={m.slug}>
              {m.href ? (
                <Link
                  href={m.href}
                  className="block rounded-md border border-rule px-2 py-1 hover:border-foreground"
                >
                  {m.name} <span className="text-muted">· {m.city}</span>
                </Link>
              ) : (
                <span className="block rounded-md border border-rule px-2 py-1">
                  {m.name} <span className="text-muted">· {m.city}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* A stable readout makes dense line hover usable without moving layout. */}
      <div
        className="mb-3 flex min-h-10 items-center border-y border-rule px-3 py-2 text-sm"
        aria-live="polite"
      >
        {hovered ? (
          <span>
            <span className="font-serif font-semibold">{hovered.name}</span>
            <span className="text-muted">
              {" "}
              · {hovered.city}, {hovered.state}
              {hovered.jurisdiction ? ` · ${hovered.jurisdiction}` : ""} ·{" "}
              {hovered.anchorLabel}{" "}
              {hovered.anchorDisplay ?? "not yet established"} ·{" "}
              {institutionType(hovered.recordType)} ·{" "}
              {toGroup(hovered.endState) === "closed" && hovered.fateKey
                ? `closed; ${FATE_LABEL[hovered.fateKey].toLowerCase()}`
                : FLOW_GROUP_LABEL[toGroup(hovered.endState)]}
              {" · click to open profile"}
            </span>
          </span>
        ) : (
          <span className="text-muted">
            Hover a line to identify it. Click or tap a line to open its
            institution profile.
          </span>
        )}
      </div>

      <div className="min-w-0 max-w-full">
        <div className="w-full min-w-0 max-w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${model.H}`}
            className="block h-auto w-full max-w-none"
            style={{ minWidth: 740 }}
            role="img"
            aria-label={`Each of the ${model.total} documented Roman Catholic Lithuanian parishes and missions as one line, from the decade it began to where it stands today; the closed fan out by what became of the church they last used.`}
          >
            {/* One heading at each edge. A second "end state" heading over the
                Closed bracket read as the same question asked twice. */}
            <text
              x={X_DEC}
              y={16}
              textAnchor="end"
              fontSize={10}
              fontWeight={700}
              fill="var(--foreground)"
            >
              BEGAN
            </text>
            <text
              x={X_END}
              y={16}
              fontSize={10}
              fontWeight={700}
              fill="var(--foreground)"
            >
              WHERE IT STANDS TODAY
            </text>
            <text x={X_END} y={31} fontSize={9} fill="var(--muted)">
              closed parishes fan out by what became of the church
            </text>

            {/* Decade bands + decluttered labels */}
            {model.decadeLayout.map((d, i) => {
              const labelY = model.decadeLabelY[i];
              return (
                <g key={d.key}>
                  <rect
                    x={X_DEC}
                    y={d.y0}
                    width={DEC_W}
                    height={Math.max(d.y1 - d.y0, 2.5)}
                    fill="var(--mark-ink)"
                    opacity={
                      hot === `dec:${d.key}` ? 0.9 : anyFocus ? 0.25 : 0.55
                    }
                    rx={2}
                    className="cursor-pointer"
                    onMouseEnter={() => setHot(`dec:${d.key}`)}
                    onMouseLeave={() => setHot(null)}
                    onClick={() => {
                      setOpen((o) =>
                        o === `dec:${d.key}` ? null : `dec:${d.key}`,
                      );
                    }}
                  >
                    <title>{`${d.key === "Undated" ? "No established beginning" : `Began in the ${d.key}`}: ${d.count} — click to list`}</title>
                  </rect>
                  <text
                    x={X_DEC - 8}
                    y={labelY}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize={d.count >= 8 ? 12 : 10}
                    fontWeight={600}
                    fill="var(--foreground)"
                    opacity={anyFocus && hot !== `dec:${d.key}` ? 0.35 : 1}
                  >
                    {d.key}
                    <tspan fontWeight={400} fill="var(--muted)">
                      {` · ${d.count}`}
                    </tspan>
                  </text>
                </g>
              );
            })}

            {/* Threads — nearest-line detection keeps dense crossings usable. */}
            <g
              onMouseMove={previewNearestThread}
              onMouseLeave={() => setHot(null)}
              onClick={selectNearestThread}
            >
              <rect
                x={X_DEC + DEC_W}
                y={TOP}
                width={X_END - X_DEC - DEC_W}
                height={Math.max(model.H - TOP - 36, 1)}
                fill="transparent"
              />
              {parishes.map((p) => {
                const g = toGroup(p.endState);
                const active = isThreadActive(p);
                const spotlight =
                  (hot === p.slug ||
                    (matchSlugs.size > 0 && matchSlugs.has(p.slug))) &&
                  active;
                return (
                  <g key={p.slug}>
                    {spotlight && (
                      <path
                        d={threadPath(p)}
                        fill="none"
                        stroke="var(--background)"
                        strokeWidth={5}
                        opacity={0.9}
                      />
                    )}
                    <path
                      d={threadPath(p)}
                      fill="none"
                      stroke={END_STATE_COLOR[g]}
                      strokeWidth={spotlight ? 2.4 : 0.7}
                      opacity={
                        active ? (spotlight ? 1 : anyFocus ? 0.75 : 0.55) : 0.04
                      }
                    />
                    {/* Wide transparent corridor improves pointer and keyboard use. */}
                    <path
                      d={threadPath(p)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={18}
                      className="cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${p.name}, ${p.city}, ${p.state} profile`}
                      onFocus={() => setHot(p.slug)}
                      onBlur={() => setHot(null)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          if (p.href) router.push(p.href);
                        }
                      }}
                    >
                      <title>{`${p.name}, ${p.city}, ${p.state} — click to open profile`}</title>
                    </path>
                  </g>
                );
              })}
            </g>

            {/* Mid column — the Closed bracket, where the closed gather */}
            {model.groups.map((g) => {
              const b = model.mid.get(g)!;
              return (
                <g key={`m-${g}`}>
                  <rect
                    x={X_MID}
                    y={b.y0}
                    width={NODE_W}
                    height={Math.max(b.y1 - b.y0, 3)}
                    fill={END_STATE_COLOR[g]}
                    opacity={anyFocus && hot !== `g:${g}` ? 0.35 : 0.95}
                    rx={2}
                    className="cursor-pointer"
                    onMouseEnter={() => setHot(`g:${g}`)}
                    onMouseLeave={() => setHot(null)}
                    onClick={() => {
                      setOpen((o) => (o === `g:${g}` ? null : `g:${g}`));
                    }}
                  >
                    <title>{`${FLOW_GROUP_LABEL[g]}: ${model.counts[g]} — click to list`}</title>
                  </rect>
                  {g === "closed" && (
                    <text
                      x={X_MID - 2}
                      y={b.y0 - 8}
                      fontSize={13}
                      fontWeight={600}
                      fill="var(--foreground)"
                    >
                      {FLOW_GROUP_LABEL[g]}
                      <tspan fontWeight={400} fill="var(--muted)">
                        {` · ${model.counts[g]}`}
                      </tspan>
                    </text>
                  )}
                </g>
              );
            })}

            {/* Terminal nodes + decluttered labels with leaders */}
            {model.termKeys.map((key, i) => {
              const t = model.term.get(key)!;
              const isFate = key.startsWith("fate:");
              const fate = isFate ? (key.slice(5) as FateKey) : null;
              const g = isFate
                ? ("closed" as EndStateGroup)
                : (key.slice(2) as EndStateGroup);
              const n = model.bandMembers.get(key)!.length;
              const bandCy = (t.y0 + t.y1) / 2;
              const cy = model.termLabelY[i];
              return (
                <g
                  key={key}
                  opacity={anyFocus && hot !== key && hot !== `g:${g}` ? 0.4 : 1}
                >
                  <rect
                    x={X_END}
                    y={t.y0}
                    width={NODE_W}
                    height={Math.max(t.y1 - t.y0, 7)}
                    fill={END_STATE_COLOR[g]}
                    opacity={fate ? FATE_OPACITY[fate] : 0.95}
                    rx={2}
                    className="cursor-pointer"
                    onMouseEnter={() => setHot(key)}
                    onMouseLeave={() => setHot(null)}
                    onClick={() => {
                      setOpen((o) => (o === key ? null : key));
                    }}
                  >
                    <title>{`${isFate ? FATE_LABEL[fate!] : FLOW_GROUP_LABEL[g]}: ${n} — click to list`}</title>
                  </rect>
                  <path
                    d={leaderPath(bandCy, cy)}
                    fill="none"
                    stroke={END_STATE_COLOR[g]}
                    strokeWidth={0.8}
                    opacity={0.55}
                  />
                  <text
                    x={X_END + NODE_W + 10}
                    y={cy - 7}
                    fontSize={isFate ? 12 : 13}
                    fontWeight={fate === "demolished" ? 700 : 600}
                    fill="var(--foreground)"
                  >
                    {isFate ? FATE_LABEL[fate!] : FLOW_GROUP_LABEL[g]}
                    <tspan fontWeight={400} fill="var(--muted)">{` · ${n}`}</tspan>
                    <tspan
                      x={X_END + NODE_W + 10}
                      dy={14}
                      fontSize={10.5}
                      fontWeight={400}
                      fill="var(--muted)"
                    >
                      {isFate ? FATE_SUB[fate!] : GROUP_SUBLABEL[g]}
                    </tspan>
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {open ? (
          <section className="mt-5 border-y border-rule py-4">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-serif text-lg font-semibold">
                {openLabel}
                <span className="ml-2 font-sans text-sm font-normal text-muted">
                  {openMembers.length} of {model.total}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="text-sm font-medium underline underline-offset-2 hover:text-accent"
              >
                Close
              </button>
            </div>
            {openNote ? (
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted">
                {openNote}
              </p>
            ) : null}
            <ul className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {openMembers.map((m) => (
                <li key={m.slug} className="border-t border-rule/60 pt-2">
                  {m.href ? (
                    <Link
                      href={m.href}
                      className="font-medium underline decoration-rule underline-offset-2 hover:decoration-inherit"
                    >
                      {m.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{m.name}</span>
                  )}
                  <span className="block text-xs text-muted">
                    {institutionType(m.recordType)} · {m.city}, {m.state}
                    {m.jurisdiction ? ` · ${m.jurisdiction}` : ""}
                  </span>
                  <span className="block text-xs">
                    {m.anchorLabel}{" "}
                    {m.anchorDisplay ?? "year not yet established"}
                    {m.endedDisplay ? ` · ended ${m.endedDisplay}` : ""}
                  </span>
                  {m.continuation ? (
                    <span className="mt-1 block text-xs leading-relaxed text-muted">
                      {m.continuation.summary}
                    </span>
                  ) : null}
                  {m.continuation?.futurePlan ? (
                    <span className="mt-1 block text-xs leading-relaxed text-muted">
                      <strong className="font-semibold text-foreground">
                        Planned, not yet effective:
                      </strong>{" "}
                      {m.continuation.futurePlan}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
            {open === "g:mass_continues" &&
            additionalHostedCommunities.length > 0 ? (
              <div className="mt-5 border-t border-rule pt-4">
                <h4 className="font-serif text-base font-semibold">
                  Additional current hosted community
                  <span className="ml-2 font-sans text-sm font-normal text-muted">
                    · {additionalHostedCommunities.length}
                  </span>
                </h4>
                <p className="mt-1 max-w-4xl text-sm leading-relaxed text-muted">
                  Lithuanian worship continues in six hosted communities within
                  a merged or host parish, diocesan church, or mission community
                  rather than an active Lithuanian-led parish. Five correspond to
                  institutions in this {model.total}-member historical record.
                  The sixth is a current place of Lithuanian worship but not one
                  of those historical institutions, so the historical band holds
                  five while the current hosted-Mass list holds all six.
                </p>
                <ul className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  {additionalHostedCommunities.map((community) => (
                    <li
                      key={community.id}
                      className="border border-rule bg-background p-3"
                    >
                      {community.officialSite ? (
                        <a
                          href={community.officialSite}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline decoration-rule underline-offset-2 hover:decoration-inherit"
                        >
                          {community.name}
                        </a>
                      ) : (
                        <span className="font-medium">{community.name}</span>
                      )}
                      <span className="mt-1 block text-xs text-muted">
                        {community.city}, {community.state} ·{" "}
                        {community.ministry}
                      </span>
                      <span className="mt-2 block text-xs font-semibold">
                        Current hosted community — not one of the 137 historical
                        institutions
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      {/* Accessible data table (visually hidden) */}
      <div className="sr-only">
        <table>
          <caption>
            Documented Roman Catholic Lithuanian parishes and missions by
            present status, and the terminal church outcomes of the closed
          </caption>
          <tbody>
            {model.groups.map((g) => (
              <tr key={g}>
                <td>{FLOW_GROUP_LABEL[g]}</td>
                <td>{model.counts[g]}</td>
              </tr>
            ))}
            {Object.entries(model.fateCounts).map(([k, n]) => (
              <tr key={k}>
                <td>Closed — {FATE_LABEL[k as FateKey]}</td>
                <td>{n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
