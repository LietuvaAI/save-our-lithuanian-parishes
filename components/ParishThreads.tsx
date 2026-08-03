"use client";

// ============================================================================
// ParishThreads — every church community as its own thread: documented
// building or parish baseline → present
// end state → (for the closed) the building's fate, on one aligned right
// edge. Per the 2026-07-26 thread-chart research brief (NYT "How Every
// Member Got to Congress" is the verified precedent): thin base strokes so
// the field reads as woven texture; hover pops one thread with a halo and
// dims the rest to near-invisibility; a name search is a first-class,
// non-hover entry point; categories (not entities) carry permanent labels;
// clicking a thread opens the parish record, clicking a band lists its
// parishes. Compact fixed-height field, not a row-per-parish list.
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

export type FateKey =
  | "demolished"
  | "repurposed"
  | "religious"
  | "secular"
  | "derelict"
  | "standing"
  | "unrecorded";

export interface ThreadParish {
  slug: string;
  name: string;
  city: string;
  state: string;
  anchorYear: number | null;
  anchorLabel: string;
  recordType: "parish" | "misija";
  endState: EndState;
  /** Building fate for the closed family; null for living branches. */
  fateKey: FateKey | null;
  href: string | null;
}

const FATE_LABEL: Record<FateKey, string> = {
  demolished: "Building demolished",
  repurposed: "Building repurposed",
  religious: "Sold to another congregation",
  secular: "Sold — secular use now",
  derelict: "Standing derelict",
  standing: "Building still standing",
  unrecorded: "Building fate unrecorded",
};

const FATE_ORDER: FateKey[] = [
  "demolished",
  "repurposed",
  "religious",
  "secular",
  "derelict",
  "standing",
  "unrecorded",
];

const GROUP_SUBLABEL: Record<EndStateGroup, string> = {
  active_parish: "active parish or mission with Lithuanian worship",
  mass_continues: "inside a parish no longer Lithuanian-led",
  transferred: "the church serves another community today",
  unresolved: "contested or canonically undecided",
  closed: "institution closed; building fate follows →",
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
  repurposed: 0.68,
  religious: 0.6,
  secular: 0.5,
  derelict: 0.42,
  standing: 0.32,
  unrecorded: 0.18,
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

function decadeOf(anchorYear: number | null): string {
  if (!anchorYear) return "Undated";
  const d = Math.floor(anchorYear / 10) * 10;
  return `${d}s`;
}

const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function ParishThreads({
  parishes,
}: {
  parishes: ThreadParish[];
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
    const U =
      (560 - GAP_DEC * (decadeKeys.length - 1)) / Math.max(total, 1);

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
    // Within a node, order by decade then name so left-side order carries over.
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

    const bandMembers = new Map<string, ThreadParish[]>(termMembers);
    for (const g of groups) bandMembers.set(`g:${g}`, byGroup.get(g)!);
    for (const k of decadeKeys) bandMembers.set(`dec:${k}`, decades.get(k)!);

    return {
      decadeLayout,
      groups,
      mid,
      termKeys,
      term,
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
  const matchSlugs = useMemo(() => new Set(matches.map((m) => m.slug)), [matches]);

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
      if (activeKey === "g:closed")
        return toGroup(p.endState) === "closed";
      return (
        bandKeyOf(p) === activeKey ||
        `g:${toGroup(p.endState)}` === activeKey
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
    if (x <= x1) {
      return cubicYAtX(x, x0, (x0 + x1) / 2, x1, y0, y1);
    }
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

  const openLabel = open?.startsWith("fate:")
    ? FATE_LABEL[open.slice(5) as FateKey]
    : open?.startsWith("dec:")
      ? open.slice(4) === "Undated"
        ? "Baseline year not established"
        : `Baseline in the ${open.slice(4)}`
      : open
        ? FLOW_GROUP_LABEL[open.slice(2) as EndStateGroup]
        : null;
  const openMembers = open ? (model.bandMembers.get(open) ?? []) : [];

  return (
    <div>
      {/* ── Search is the reliable non-hover entry point ── */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a parish by name or city…"
          className="rounded-md border border-rule bg-background px-2 py-1.5 text-sm w-64"
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
              · {hovered.city}, {hovered.state} · {hovered.anchorLabel}{" "}
              {hovered.anchorYear ?? "not established"} ·{" "}
              {institutionType(hovered.recordType)} · {toGroup(hovered.endState) === "closed" && hovered.fateKey
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
            className="block w-full max-w-none h-auto"
            style={{ minWidth: 740 }}
            role="img"
            aria-label={`Each of the ${model.total} documented Roman Catholic Lithuanian parishes and missions as one line, from its institutional beginning to its present condition; closed institutions continue to the last documented church building's fate.`}
          >
          {/* Church baseline first, building fate only where documented. */}
          <text
            x={X_DEC}
            y={16}
            textAnchor="end"
            fontSize={10}
            fontWeight={700}
            fill="var(--foreground)"
          >
            BUILDING / BASELINE
          </text>
          <text
            x={X_MID + NODE_W / 2}
            y={16}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill="var(--foreground)"
          >
            INSTITUTION STATUS
          </text>
          <text
            x={X_END}
            y={16}
            fontSize={10}
            fontWeight={700}
            fill="var(--foreground)"
          >
            PRESENT CONDITION
          </text>
          <text
            x={X_END}
            y={31}
            fontSize={9}
            fill="var(--muted)"
          >
            closed institutions split by church fate
          </text>
          {/* Decade bands + labels */}
          {model.decadeLayout.map((d) => (
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
                <title>{`${d.key === "Undated" ? "Baseline year not established" : `Baseline in the ${d.key}`}: ${d.count} — click to list`}</title>
              </rect>
              <text
                x={X_DEC - 8}
                y={(d.y0 + d.y1) / 2}
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
          ))}

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

          {/* Mid nodes (Closed labeled; the rest carry labels at the edge) */}
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
                    setOpen((o) =>
                      o === `g:${g}` ? null : `g:${g}`,
                    );
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

          {/* Terminal nodes + labels on the aligned edge */}
          {model.termKeys.map((key) => {
            const t = model.term.get(key)!;
            const isFate = key.startsWith("fate:");
            const fate = isFate ? (key.slice(5) as FateKey) : null;
            const g = isFate
              ? ("closed" as EndStateGroup)
              : (key.slice(2) as EndStateGroup);
            const n = model.bandMembers.get(key)!.length;
            const cy = (t.y0 + t.y1) / 2;
            return (
              <g
                key={key}
                opacity={anyFocus && hot !== key && hot !== `g:${g}` ? 0.4 : 1}
              >
                <rect
                  x={X_END}
                  y={t.y0}
                  width={NODE_W}
                  height={Math.max(t.y1 - t.y0, 3)}
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
                {fate === "demolished" && (
                  <g stroke="var(--foreground)" strokeWidth={1.4} opacity={0.85}>
                    <line x1={X_END + 2} y1={t.y0 + 3} x2={X_END + NODE_W - 2} y2={t.y1 - 3} />
                    <line x1={X_END + 2} y1={t.y1 - 3} x2={X_END + NODE_W - 2} y2={t.y0 + 3} />
                  </g>
                )}
                {isFate ? (
                  <text
                    x={X_END + NODE_W + 8}
                    y={cy}
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={fate === "demolished" ? 700 : 600}
                    fill="var(--foreground)"
                  >
                    {FATE_LABEL[fate!]}
                    <tspan fontWeight={400} fill="var(--muted)">{` · ${n}`}</tspan>
                  </text>
                ) : (
                  <text
                    x={X_END + NODE_W + 8}
                    y={cy - 7}
                    fontSize={13}
                    fontWeight={600}
                    fill="var(--foreground)"
                  >
                    {FLOW_GROUP_LABEL[g]}
                    <tspan fontWeight={400} fill="var(--muted)">{` · ${n}`}</tspan>
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
                )}
              </g>
            );
          })}
          </svg>
        </div>

        {open ? (
          <section className="mt-5 border-y border-rule py-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-serif text-lg font-semibold">
                {openLabel}
                <span className="ml-2 font-sans text-sm font-normal text-muted">
                  {openMembers.length}{" "}
                  {openMembers.length === 1 ? "institution" : "institutions"}
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
            <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
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
                    {institutionType(m.recordType)} · {m.city}, {m.state} · {m.anchorLabel}{" "}
                    {m.anchorYear ?? "not established"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {/* Accessible data table (visually hidden) */}
      <div className="sr-only">
        <table>
          <caption>
            Documented Roman Catholic Lithuanian parishes and missions by end
            state, and building fates of the closed
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
