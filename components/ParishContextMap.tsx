"use client";

// ============================================================================
// ParishContextMap — the parish among its neighbors: a diocese-level zoom
// showing which diocese the parish sits in and what happened to every
// recorded Lithuanian parish around it. The site's thesis in one graphic —
// no parish in isolation.
//
// Shares its data layer with the Hearth dispatch renderer
// (data/context-points.json + data/diocese-overlay.json) and follows the
// dispatch map's Vilija-approved v6 construction spec (2026-07-26):
// 1.5:1 landscape frame padded from the diocese bbox; cell-based same-city
// fanning at zoom scale (subject never displaced); living parishes as open
// rings, other outcomes as filled dots; and the subject enlarged with a
// dashed halo. The profile version deliberately labels only the subject so
// the parish, diocese, and status pattern remain readable at phone widths.
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import overlay from "@/data/diocese-overlay.json";
import contextPoints from "@/data/context-points.json";
import {
  GROUP_LABEL,
  END_STATE_COLOR,
  type EndStateGroup,
} from "@/lib/end-state";

interface CtxPoint {
  slug: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
  group: EndStateGroup;
  closed: number | null;
  congregationClass: string | null;
  diocese: string | null;
  href: string | null;
}

interface OverlayDiocese {
  name: string;
  path: string;
  cx: number;
  cy: number;
  bbox: [number, number, number, number];
  counties: number;
}

const ASPECT = 1.5;
const ALIVE = new Set(["active_parish", "mass_continues"]);
type MapFilter = "all" | "diocese" | "living" | "closed" | "other";

const MAP_FILTERS: { value: MapFilter; label: string }[] = [
  { value: "all", label: "All nearby" },
  { value: "diocese", label: "This diocese" },
  { value: "living", label: "Living worship" },
  { value: "closed", label: "Closed" },
  { value: "other", label: "Other outcomes" },
];

const STATE_WORD: Record<EndStateGroup, string> = {
  active_parish: GROUP_LABEL.active_parish,
  mass_continues: GROUP_LABEL.mass_continues,
  transferred: GROUP_LABEL.transferred,
  unresolved: GROUP_LABEL.unresolved,
  closed: GROUP_LABEL.closed,
  unverified: GROUP_LABEL.unverified,
};

interface Placed extends CtxPoint {
  px: number;
  py: number;
}

export default function ParishContextMap({
  slug,
  dioceseLabel,
  compact = false,
}: {
  slug: string;
  dioceseLabel?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [hot, setHot] = useState<CtxPoint | null>(null);
  const [filter, setFilter] = useState<MapFilter>("all");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [expanded]);

  const model = useMemo(() => {
    const points = (contextPoints.points as CtxPoint[]).filter(
      (p) => p.congregationClass === "roman_catholic",
    );
    const subject = points.find((p) => p.slug === slug);
    if (!subject?.diocese) return null;
    const dio = (overlay.dioceses as OverlayDiocese[]).find(
      (d) => d.name === subject.diocese,
    );
    if (!dio) return null;

    // ── Frame: bbox pad = max(0.35 × max(bw,bh), 8), settled to 1.5:1 ──
    const aspect = compact ? 2.8 : ASPECT;
    let [x0, y0, x1, y1] = dio.bbox;
    const pad = Math.max(0.35 * Math.max(x1 - x0, y1 - y0), 8);
    x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
    let w = x1 - x0;
    let h = y1 - y0;
    if (w / h < aspect) {
      const grow = h * aspect - w;
      x0 -= grow / 2; w = h * aspect;
    } else {
      const grow = w / aspect - h;
      y0 -= grow / 2; h = w / aspect;
    }
    const S = w / 45; // the spec's scale unit

    // ── Points in view; cell-based fanning (0.6-unit cells) ──
    const inView = points.filter(
      (p) => p.x >= x0 && p.x <= x0 + w && p.y >= y0 && p.y <= y0 + h,
    );
    const cells = new Map<string, CtxPoint[]>();
    for (const p of inView) {
      const k = `${Math.floor(p.x / 0.6)}|${Math.floor(p.y / 0.6)}`;
      if (!cells.has(k)) cells.set(k, []);
      cells.get(k)!.push(p);
    }
    const placed: Placed[] = [];
    for (const group of cells.values()) {
      if (group.length === 1) {
        placed.push({ ...group[0], px: group[0].x, py: group[0].y });
        continue;
      }
      const ring = group.filter((p) => p.slug !== slug);
      const subj = group.find((p) => p.slug === slug);
      if (subj) placed.push({ ...subj, px: subj.x, py: subj.y });
      const fanR = 1.35 * S;
      ring.forEach((p, i) => {
        const a = (2 * Math.PI * i) / ring.length - Math.PI / 2.5;
        placed.push({
          ...p,
          px: p.x + fanR * Math.cos(a),
          py: p.y + fanR * Math.sin(a),
        });
      });
    }

    const subjPlaced =
      placed.find((p) => p.slug === slug) ?? { ...subject, px: subject.x, py: subject.y };

    const inDiocese = points.filter((p) => p.diocese === subject.diocese);
    return {
      subject,
      subjPlaced,
      dio,
      vb: { x0, y0, w, h },
      S,
      placed,
      inDioceseN: inDiocese.length,
      closedN: inDiocese.filter((p) => p.group === "closed").length,
    };
  }, [compact, slug]);

  if (!model) return null;
  const { subject, subjPlaced, dio, vb, S, placed } = model;
  const visibleNeighbors = placed
    .filter((p) => p.slug !== slug)
    .filter((p) => {
      if (filter === "diocese") return p.diocese === subject.diocese;
      if (filter === "living") return ALIVE.has(p.group);
      if (filter === "closed") return p.group === "closed";
      if (filter === "other") {
        return !ALIVE.has(p.group) && p.group !== "closed";
      }
      return true;
    });
  const subjWord =
    subject.group === "closed" && subject.closed
      ? `closed ${subject.closed}`
      : STATE_WORD[subject.group];

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className={compact ? "relative overflow-hidden" : "overflow-hidden rounded-lg border border-rule"}>
        <div className={`flex flex-wrap items-end justify-between gap-2 ${compact ? "pb-2" : "border-b border-rule px-3 py-2.5"}`}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
              Diocese
            </p>
            <p className="mt-0.5 font-serif text-base font-semibold">
              {dioceseLabel ?? dio.name}
            </p>
          </div>
          <p className="text-xs text-muted">
            <span className="font-semibold text-foreground">
              {model.inDioceseN}
            </span>{" "}
            recorded
            <span className="mx-1.5 text-rule">·</span>
            <span className="font-semibold text-foreground">
              {model.closedN}
            </span>{" "}
            closed
          </p>
        </div>
        {!compact && (
          <div
            className="flex flex-wrap gap-1 border-b border-rule px-3 py-2"
            role="group"
            aria-label="Filter parish markers"
          >
            {MAP_FILTERS.map((option) => {
              const selected = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setFilter(option.value);
                    setHot(null);
                  }}
                  className={`rounded px-2 py-1 text-[10px] font-medium transition-colors ${
                    selected
                      ? "bg-foreground text-background"
                      : "border border-rule text-muted hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
        <svg
          viewBox={`${vb.x0} ${vb.y0} ${vb.w} ${vb.h}`}
          className={`h-auto w-full ${compact ? "bg-band/40" : ""}`}
          role="img"
          aria-label={`${subject.name} in ${dioceseLabel ?? dio.name}, with nearby recorded Lithuanian parishes`}
        >
          {/* Diocese layer */}
          {(overlay.dioceses as OverlayDiocese[]).map((d) => (
            <path
              key={d.name}
              d={d.path}
              fill={d.name === dio.name ? "var(--band)" : "var(--background)"}
              stroke="none"
            />
          ))}
          <path
            d={overlay.borders}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.22}
            strokeWidth={0.12 * S}
          />
          <path
            d={dio.path}
            fill="none"
            stroke="var(--mark-ink)"
            strokeOpacity={0.8}
            strokeWidth={0.3 * S}
          />

          {/* Neighbor dots — living as open rings, the rest filled */}
          {visibleNeighbors.map((p) => {
              const alive = ALIVE.has(p.group);
              const inSubjectDiocese = p.diocese === subject.diocese;
              const baseRadius = inSubjectDiocese ? 0.68 : 0.48;
              const r = (hot?.slug === p.slug ? 0.88 : baseRadius) * S;
              return (
                <circle
                  key={p.slug}
                  cx={p.px}
                  cy={p.py}
                  r={r}
                  fill={alive ? "var(--background)" : END_STATE_COLOR[p.group]}
                  stroke={alive ? END_STATE_COLOR[p.group] : "var(--background)"}
                  strokeWidth={(alive ? 0.28 : 0.12) * S}
                  opacity={inSubjectDiocese ? 1 : 0.42}
                  className={!compact && p.href ? "cursor-pointer" : undefined}
                  onMouseEnter={compact ? undefined : () => setHot(p)}
                  onMouseLeave={compact ? undefined : () => setHot(null)}
                  onClick={compact ? undefined : () => p.href && router.push(p.href)}
                >
                  <title>{`${p.name} — ${p.city}, ${p.state} · ${GROUP_LABEL[p.group]}${p.closed ? ` (${p.closed})` : ""}`}</title>
                </circle>
              );
            })}

          {/* The subject — filled, dashed halo, named with sub-line */}
          <g>
            <circle
              cx={subjPlaced.px}
              cy={subjPlaced.py}
              r={2.0 * S}
              fill="none"
              stroke={END_STATE_COLOR[subject.group]}
              strokeWidth={0.28 * S}
              strokeDasharray={`${0.5 * S} ${0.35 * S}`}
            />
            <circle
              cx={subjPlaced.px}
              cy={subjPlaced.py}
              r={1.25 * S}
              fill={END_STATE_COLOR[subject.group]}
              stroke="var(--background)"
              strokeWidth={0.2 * S}
            />
            {!compact && (
              <>
                <text
                  x={subjPlaced.px}
                  y={subjPlaced.py - 2.0 * S - 1.12 * S * 1.5 - 0.7 * S}
                  textAnchor="middle"
                  fontSize={1.55 * S}
                  fontWeight={700}
                  fill="var(--foreground)"
                  stroke="var(--background)"
                  strokeWidth={0.34 * S}
                  paintOrder="stroke"
                  className="font-serif"
                  pointerEvents="none"
                >
                  {subject.name}
                </text>
                <text
                  x={subjPlaced.px}
                  y={subjPlaced.py - 2.0 * S - 0.7 * S}
                  textAnchor="middle"
                  fontSize={1.12 * S}
                  fontStyle="italic"
                  fill="var(--muted)"
                  stroke="var(--background)"
                  strokeWidth={0.25 * S}
                  paintOrder="stroke"
                  pointerEvents="none"
                >
                  {`${subject.city} · ${subjWord}`}
                </text>
              </>
            )}
          </g>
        </svg>
        {!compact && (
          <div
            className="min-h-11 border-t border-rule px-3 py-2 text-xs"
            aria-live="polite"
          >
            {hot ? (
              <p>
                <span className="font-semibold">{hot.name}</span>
                <span className="text-muted">
                  {" "}
                  — {hot.city}, {hot.state} · {GROUP_LABEL[hot.group]}
                  {hot.closed ? ` (${hot.closed})` : ""}
                  {hot.href ? " · select to open" : ""}
                </span>
              </p>
            ) : (
              <p className="text-muted">
                {filter === "all" &&
                  `Showing ${visibleNeighbors.length} nearby records. The outlined area is ${
                    dioceseLabel ?? dio.name
                  }; lighter markers are in neighboring dioceses.`}
                {filter === "diocese" &&
                  `Showing ${visibleNeighbors.length} other recorded parishes inside ${
                    dioceseLabel ?? dio.name
                  }.`}
                {filter === "living" &&
                  `Showing ${visibleNeighbors.length} nearby places with active Lithuanian worship.`}
                {filter === "closed" &&
                  `Showing ${visibleNeighbors.length} nearby closed parishes.`}
                {filter === "other" &&
                  `Showing ${visibleNeighbors.length} transferred, unresolved, or still-being-verified records.`}{" "}
                Select any marker to open its record.
              </p>
            )}
          </div>
        )}
        {!compact && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-rule px-3 py-2 text-[10px] leading-tight text-muted sm:grid-cols-3">
            {(Object.keys(STATE_WORD) as EndStateGroup[]).map((group) => {
              const alive = ALIVE.has(group);
              return (
                <span key={group} className="flex items-center gap-1.5">
                  <span
                    className="inline-block size-2.5 shrink-0 rounded-full"
                    style={{
                      background: alive
                        ? "var(--background)"
                        : END_STATE_COLOR[group],
                      border: `2px solid ${END_STATE_COLOR[group]}`,
                    }}
                    aria-hidden
                  />
                  {GROUP_LABEL[group]}
                </span>
              );
            })}
          </div>
        )}
        {compact && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="group absolute inset-0 rounded border border-transparent text-left focus-visible:border-foreground focus-visible:outline-none"
            aria-label={`Open the interactive parish map for ${subject.name}`}
          >
            <span className="absolute bottom-2 right-2 rounded bg-background/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm ring-1 ring-rule transition-colors group-hover:bg-foreground group-hover:text-background">
              Open map
            </span>
          </button>
        )}
      </div>
      {compact && expanded && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Interactive parish map for ${subject.name}`}
          onClick={() => setExpanded(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-rule bg-background px-4 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                  Community and place
                </p>
                <p className="font-serif text-lg font-semibold">
                  {subject.name} · {dioceseLabel ?? dio.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex size-9 items-center justify-center rounded border border-rule text-2xl leading-none hover:border-foreground"
                aria-label="Close parish map"
                title="Close map"
              >
                ×
              </button>
            </div>
            <div className="p-3 sm:p-5">
              <ParishContextMap slug={slug} dioceseLabel={dioceseLabel} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
