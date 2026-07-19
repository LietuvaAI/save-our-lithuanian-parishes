"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import mapData from "@/data/map.json";
import regData from "@/data/registry-map.json";
import { MarkShape, MarkIcon } from "@/components/marks";
import {
  usParishes,
  type Parish,
  ENDING_MODE_ORDER,
  ENDING_MODE_LABEL,
  OWNERSHIP_LABEL,
  STATUS_LABEL,
} from "@/lib/parishes";

const bySlug = new Map(usParishes.map((p) => [p.slug, p]));
const pointBySlug = new Map(mapData.points.map((pt) => [pt.slug, pt]));

const FULL = { x: 0, y: 0, w: 975, h: 610 };
const MAX_ZOOM = 10;
const END_YEAR = 2026;

const NE_STATES = new Set(["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA", "MD"]);

type View = { x: number; y: number; w: number; h: number };
type Phase = "future" | "active" | "lost";
type RegPoint = (typeof regData.points)[number];

function clampView(v: View): View {
  const w = Math.min(Math.max(v.w, FULL.w / MAX_ZOOM), FULL.w);
  const h = (w / FULL.w) * FULL.h;
  return {
    w,
    h,
    x: Math.min(Math.max(v.x, FULL.x - w * 0.15), FULL.x + FULL.w - w * 0.85),
    y: Math.min(Math.max(v.y, FULL.y - h * 0.15), FULL.y + FULL.h - h * 0.85),
  };
}

/** A parish's state in a given year, for the timeline. Undated foundings are
 * treated as "future" (never placed) and counted separately; closures with an
 * unknown year keep the parish "active" (we do not invent a closing date). */
function phaseAt(p: Parish, year: number): Phase {
  if (!p.yearFounded || p.yearFounded > year) return "future";
  if (p.yearClosed && p.yearClosed <= year) return "lost";
  return "active";
}

function regPhaseAt(c: RegPoint, year: number): Phase {
  if (!c.foundedYear || c.foundedYear > year) return "future";
  if (c.closedYear && c.closedYear <= year) return "lost";
  return "active";
}

export default function ParishMap() {
  const router = useRouter();
  const [hovered, setHovered] = useState<Parish | null>(null);
  const [hoveredReg, setHoveredReg] = useState<RegPoint | null>(null);
  const [showRecord, setShowRecord] = useState(true);
  const [view, setView] = useState<View>(FULL);
  const [year, setYear] = useState<number | null>(null); // null = show all
  const [playing, setPlaying] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ px: number; py: number; moved: boolean } | null>(null);

  const zoom = FULL.w / view.w;
  const timelineMode = year !== null;

  const { dated, undatedCount, minYear } = useMemo(() => {
    const d = usParishes.filter((p) => p.yearFounded);
    const years = d.map((p) => p.yearFounded as number);
    return {
      dated: d,
      undatedCount: usParishes.length - d.length,
      minYear: Math.min(...years),
    };
  }, []);

  const counts = useMemo(() => {
    if (year === null) return { active: 0, lost: 0 };
    let active = 0;
    let lost = 0;
    for (const p of dated) {
      const ph = phaseAt(p, year);
      if (ph === "active") active++;
      else if (ph === "lost") lost++;
    }
    return { active, lost };
  }, [year, dated]);

  // Animation: step one year at a time until the end, then stop.
  useEffect(() => {
    if (!playing || year === null) return;
    const id = setInterval(() => {
      setYear((y) => {
        if (y === null || y >= END_YEAR) {
          setPlaying(false);
          return y;
        }
        return y + 1;
      });
    }, 170);
    return () => clearInterval(id);
  }, [playing, year === null]);

  const neView = useMemo(() => {
    const pts = mapData.points.filter((pt) => {
      const p = bySlug.get(pt.slug);
      return p && NE_STATES.has(p.state);
    });
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const pad = 28;
    const x = Math.min(...xs) - pad;
    const y = Math.min(...ys) - pad;
    const w = Math.max(...xs) + pad - x;
    const h = Math.max(...ys) + pad - y;
    const fw = Math.max(w, (h * FULL.w) / FULL.h);
    return clampView({ x: x - (fw - w) / 2, y, w: fw, h: (fw / FULL.w) * FULL.h });
  }, []);

  function zoomBy(factor: number) {
    setView((v) => {
      const w = v.w / factor;
      return clampView({
        x: v.x + (v.w - w) / 2,
        y: v.y + (v.h - (w / FULL.w) * FULL.h) / 2,
        w,
        h: (w / FULL.w) * FULL.h,
      });
    });
  }

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    drag.current = { px: e.clientX, py: e.clientY, moved: false };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = view.w / rect.width;
    const dx = (e.clientX - drag.current.px) * scale;
    const dy = (e.clientY - drag.current.py) * scale;
    if (Math.abs(e.clientX - drag.current.px) + Math.abs(e.clientY - drag.current.py) > 3) {
      drag.current.moved = true;
    }
    drag.current = { px: e.clientX, py: e.clientY, moved: drag.current.moved };
    setView((v) => clampView({ ...v, x: v.x - dx, y: v.y - dy }));
  }

  function onPointerUp() {
    drag.current = null;
  }

  function openParish(p: Parish) {
    if (drag.current?.moved) return;
    router.push(`/parishes/${p.slug}`);
  }

  function startTimeline() {
    setYear(minYear);
    setPlaying(true);
  }

  function exitTimeline() {
    setPlaying(false);
    setYear(null);
  }

  const markR = 6 / Math.sqrt(zoom);
  const btn =
    "rounded-md border border-rule bg-background px-2.5 py-1 text-sm font-medium hover:border-foreground transition-colors";

  return (
    <div>
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          role="img"
          aria-label="Map of the United States showing every documented Lithuanian parish"
          className={`w-full h-auto select-none ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {mapData.statePaths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="var(--band)"
              stroke="var(--foreground)"
              strokeOpacity={0.25}
              strokeWidth={0.7 / zoom}
            />
          ))}
          <path
            d={mapData.stateBorders}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.15}
            strokeWidth={0.7 / zoom}
          />
          {showRecord &&
            regData.points.map((c) => {
              if (timelineMode && year !== null) {
                if (regPhaseAt(c, year) === "future") return null;
              }
              const active = hoveredReg?.slug === c.slug;
              const deep = c.depth === "multi-source";
              const rr = active ? markR * 1.1 : markR * 0.72;
              const common = {
                tabIndex: 0,
                "aria-label": `${c.name}, ${c.city} ${c.state} — in the research record (${c.depth}).`,
                onMouseEnter: () => setHoveredReg(c),
                onMouseLeave: () => setHoveredReg(null),
                onFocus: () => setHoveredReg(c),
                onBlur: () => setHoveredReg(null),
                className: "focus:outline-none",
              };
              if (c.kind === "congregation") {
                const s = rr * 1.5;
                return (
                  <rect
                    key={c.slug}
                    x={c.x - s / 2}
                    y={c.y - s / 2}
                    width={s}
                    height={s}
                    fill="none"
                    stroke="var(--foreground)"
                    strokeOpacity={active ? 0.85 : 0.55}
                    strokeWidth={markR * 0.24}
                    {...common}
                  />
                );
              }
              return (
                <circle
                  key={c.slug}
                  cx={c.x}
                  cy={c.y}
                  r={rr}
                  fill="var(--foreground)"
                  fillOpacity={active ? 0.9 : deep ? 0.62 : 0.32}
                  stroke="none"
                  {...common}
                />
              );
            })}
          {mapData.points.map((pt) => {
            const parish = bySlug.get(pt.slug);
            if (!parish) return null;
            const active = hovered?.slug === parish.slug;

            if (timelineMode) {
              const ph = phaseAt(parish, year);
              if (ph === "future") return null;
              const isActive = ph === "active";
              return (
                <circle
                  key={pt.slug}
                  cx={pt.x}
                  cy={pt.y}
                  r={active ? markR * 1.4 : isActive ? markR : markR * 0.9}
                  fill={isActive ? "var(--foreground)" : "none"}
                  fillOpacity={isActive ? 0.92 : 0}
                  stroke={isActive ? "var(--background)" : "var(--mark-closed)"}
                  strokeOpacity={isActive ? 1 : 0.5}
                  strokeWidth={isActive ? markR * 0.22 : markR * 0.34}
                  tabIndex={0}
                  role="button"
                  aria-label={`${parish.nameLt}, ${parish.city} ${parish.state} — ${isActive ? "active" : "lost"} in ${year}. Open the parish record.`}
                  onMouseEnter={() => setHovered(parish)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(parish)}
                  onBlur={() => setHovered(null)}
                  onClick={() => openParish(parish)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") router.push(`/parishes/${parish.slug}`);
                  }}
                  className="cursor-pointer focus:outline-none"
                />
              );
            }

            return (
              <MarkShape
                key={pt.slug}
                mode={parish.endingMode}
                x={pt.x}
                y={pt.y}
                r={active ? markR * 1.4 : markR}
                tabIndex={0}
                role="button"
                aria-label={`${parish.nameLt}, ${parish.city} ${parish.state} — ${ENDING_MODE_LABEL[parish.endingMode]}. Open the parish record.`}
                onMouseEnter={() => setHovered(parish)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(parish)}
                onBlur={() => setHovered(null)}
                onClick={() => openParish(parish)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter") router.push(`/parishes/${parish.slug}`);
                }}
                className="cursor-pointer focus:outline-none"
              />
            );
          })}
        </svg>

        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button type="button" className={btn} aria-label="Zoom in" onClick={() => zoomBy(1.6)}>
            +
          </button>
          <button type="button" className={btn} aria-label="Zoom out" onClick={() => zoomBy(1 / 1.6)}>
            −
          </button>
        </div>
        <div className="absolute left-2 top-2 flex gap-1.5">
          <button type="button" className={btn} onClick={() => setView(neView)}>
            Northeast
          </button>
          {zoom > 1.01 && (
            <button type="button" className={btn} onClick={() => setView(FULL)}>
              Reset
            </button>
          )}
        </div>

        {hovered &&
          (() => {
            const pt = pointBySlug.get(hovered.slug);
            if (!pt) return null;
            const lx = ((pt.x - view.x) / view.w) * 100;
            const ly = ((pt.y - view.y) / view.h) * 100;
            if (lx < -2 || lx > 102 || ly < -2 || ly > 102) return null;
            const below = ly < 32;
            return (
              <div
                className="pointer-events-none absolute z-10 w-64 rounded-lg border border-rule bg-background/95 px-3.5 py-2.5 text-sm shadow-lg"
                style={{
                  left: `${Math.min(Math.max(lx, 15), 85)}%`,
                  top: `${ly}%`,
                  transform: below
                    ? "translate(-50%, 16px)"
                    : "translate(-50%, calc(-100% - 16px))",
                }}
                aria-live="polite"
              >
                <div className="font-serif font-semibold">{hovered.nameLt}</div>
                <div className="text-muted">
                  {hovered.city}, {hovered.state}
                </div>
                <div className="text-muted mt-1">
                  {OWNERSHIP_LABEL[hovered.ownership]}
                  <br />
                  {ENDING_MODE_LABEL[hovered.endingMode]}
                  {hovered.endingMode === "diocese_closed" &&
                    hovered.status !== "closed" &&
                    ` (${STATUS_LABEL[hovered.status].toLowerCase()})`}
                  {hovered.yearFounded ? ` · founded ${hovered.yearFounded}` : ""}
                  {hovered.yearClosed ? `, lost ${hovered.yearClosed}` : ""}
                </div>
                <div className="mt-1.5 font-medium underline">
                  Open the parish profile →
                </div>
              </div>
            );
          })()}

        {hoveredReg &&
          !hovered &&
          (() => {
            const lx = ((hoveredReg.x - view.x) / view.w) * 100;
            const ly = ((hoveredReg.y - view.y) / view.h) * 100;
            if (lx < -2 || lx > 102 || ly < -2 || ly > 102) return null;
            const below = ly < 32;
            return (
              <div
                className="pointer-events-none absolute z-10 w-72 rounded-lg border border-rule bg-background/95 px-3.5 py-2.5 text-sm shadow-lg"
                style={{
                  left: `${Math.min(Math.max(lx, 15), 85)}%`,
                  top: `${ly}%`,
                  transform: below
                    ? "translate(-50%, 16px)"
                    : "translate(-50%, calc(-100% - 16px))",
                }}
                aria-live="polite"
              >
                <div className="font-serif font-semibold">{hoveredReg.name}</div>
                <div className="text-muted">
                  {hoveredReg.city}, {hoveredReg.state}
                  {hoveredReg.foundedYear
                    ? ` · founded ${hoveredReg.foundedYear}`
                    : ""}
                  {hoveredReg.closedYear ? `, closed ${hoveredReg.closedYear}` : ""}
                </div>
                <div className="text-muted mt-1">
                  {hoveredReg.kind === "congregation"
                    ? "Non-Catholic Lithuanian congregation — historical witness."
                    : hoveredReg.depth === "multi-source"
                      ? "Documented in multiple sources."
                      : "Documented in a single source so far — research continues."}
                </div>
                <div className="text-muted mt-1 text-xs">
                  Documented in: {hoveredReg.documentedIn.join(" · ")}
                  {hoveredReg.hasConflicts ? " · source variants recorded" : ""}
                </div>
                <div className="text-muted mt-1 italic text-xs">
                  Part of the record — a profile page arrives as this
                  parish&rsquo;s documentation deepens.
                </div>
              </div>
            );
          })()}

        {timelineMode && (
          <div className="absolute left-2 bottom-2 rounded-lg bg-background/90 border border-rule px-3 py-2">
            <div className="font-serif text-2xl font-semibold tabular-nums">{year}</div>
            <div className="text-sm">
              <span className="font-medium">{counts.active}</span> standing
              {counts.lost > 0 && (
                <>
                  {" · "}
                  <span style={{ color: "var(--mark-closed)" }}>
                    {counts.lost} lost
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timeline control */}
      <div className="mt-3 rounded-lg border border-rule px-4 py-3">
        {!timelineMode ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              Watch the parishes rise and fall — {minYear} to {END_YEAR}.
            </p>
            <button
              type="button"
              onClick={startTimeline}
              className="rounded-md px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "var(--mark-closed)" }}
            >
              ▶ Play the timeline
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className={btn}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? "❚❚" : "▶"}
              </button>
              <input
                type="range"
                min={minYear}
                max={END_YEAR}
                value={year}
                onChange={(e) => {
                  setPlaying(false);
                  setYear(Number(e.target.value));
                }}
                aria-label="Year"
                className="flex-1 accent-[var(--mark-closed)]"
              />
              <button type="button" onClick={exitTimeline} className={btn}>
                Show all
              </button>
            </div>
            <div className="flex justify-between text-xs text-muted tabular-nums px-9">
              <span>{minYear}</span>
              <span>1950</span>
              <span>1980</span>
              <span>{END_YEAR}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 min-h-14 rounded-lg border border-rule px-4 py-2.5 text-sm">
        {timelineMode ? (
          <span className="text-muted">
            The timeline places the {dated.length} parishes with a documented
            founding year. {undatedCount} more are in the record without a firm
            founding date and are being dated from parish histories — the true
            arc is larger than what shows here. Click any mark for its record.
          </span>
        ) : (
          <span className="text-muted">
            One record — drawn from the full run of <em>Draugas</em> since
            1909, published parish histories, and contemporary sources.
            Shape-coded marks are the {usParishes.length} most deeply
            documented parishes, with full case files — hover to see a parish,
            click to open its profile. Solid dots are{" "}
            {regData.counts.parishes} more documented parishes (squares:{" "}
            {regData.counts.congregations} non-Catholic congregations, shown
            as historical witness), each labeled by how deeply it is
            documented so far; this layer never alters the locked figures,
            which derive from the {usParishes.length}.{" "}
            {regData.counts.skippedCanada} Canadian parishes and{" "}
            {regData.counts.skippedNoGeo} not-yet-mapped places are documented
            but not on this U.S. map. See a parish missing?{" "}
            <Link href="/report" className="underline hover:text-foreground">
              Report it
            </Link>
            .
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <label className="inline-flex items-center gap-1.5 cursor-pointer text-muted hover:text-foreground transition-colors">
          <input
            type="checkbox"
            checked={showRecord}
            onChange={(e) => {
              setShowRecord(e.target.checked);
              if (!e.target.checked) setHoveredReg(null);
            }}
            className="accent-[var(--mark-closed)]"
          />
          <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden>
            <circle cx={7} cy={7} r={4.2} fill="var(--foreground)" fillOpacity={0.5} />
          </svg>
          Research record ({regData.counts.parishes} more parishes) — beyond the
          83
        </label>
        {showRecord && !timelineMode && (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden>
              <rect
                x={3.2}
                y={3.2}
                width={7.6}
                height={7.6}
                fill="none"
                stroke="var(--foreground)"
                strokeOpacity={0.6}
                strokeWidth={1.4}
              />
            </svg>
            Non-Catholic congregation ({regData.counts.congregations})
          </span>
        )}
        {timelineMode ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden>
                <circle cx={7} cy={7} r={5} fill="var(--foreground)" />
              </svg>
              Standing that year
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden>
                <circle cx={7} cy={7} r={5} fill="none" stroke="var(--mark-closed)" strokeWidth={1.6} />
              </svg>
              Lost by then
            </span>
          </>
        ) : (
          ENDING_MODE_ORDER.map((mode) => (
            <span key={mode} className="inline-flex items-center gap-1.5">
              <MarkIcon mode={mode} />
              {ENDING_MODE_LABEL[mode]}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
