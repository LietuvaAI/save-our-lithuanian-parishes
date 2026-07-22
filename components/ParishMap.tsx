"use client";

// The homepage map: ONE mark system across the whole record (Vilija
// 2026-07-21). Every point is a circle, one size; color = present status:
//   red filled          = lost (closed / demolished / merged / suppressed)
//   red + gold ring     = lost but community is actively fighting (kind=active)
//   ink filled          = open today, no alert
//   ink + gold ring     = open today but under active threat (kind=active)
//   gold filled         = genuinely unresolved / undecided fate
//   purple filled       = building at physical risk (kind=building)
//   grey hollow         = in the record; fate not yet established
// Who-decided (ending mode) and ownership stay in each parish's popup and
// profile — the map itself reads at a glance. Views: All · Open today ·
// Under threat · Across time (the timeline).
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import mapData from "@/data/map.json";
import regData from "@/data/registry-map.json";
import alertsData from "@/data/alerts.json";
import {
  usParishes,
  ENDING_MODE_LABEL,
  OWNERSHIP_LABEL,
} from "@/lib/parishes";

const FULL = (regData as { frame?: { x: number; y: number; w: number; h: number } })
  .frame ?? { x: 0, y: 0, w: 975, h: 610 };
const MAX_ZOOM = 20;
const END_YEAR = 2026;
const NE_STATES = new Set(["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA", "MD"]);

type View = { x: number; y: number; w: number; h: number };
// Status drives fill color. alerted (gold ring) is a separate boolean.
type Status = "lost" | "open" | "threat" | "building" | "unknown";
type Mode = "all" | "open" | "threat";

interface Point {
  id: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
  status: Status;
  // alerted = true → draw a gold ring around the dot (kind=active alerts)
  alerted: boolean;
  // inAlerts = true → appears in "Under threat" filter even if status isn't threat/building
  inAlerts: boolean;
  alertText: string | null;
  founded: number | null;
  closed: number | null;
  profile: string | null;
  deep: boolean;
  detail: string | null;
  kindLabel: string | null;
}

const STATUS_LABEL: Record<Status, string> = {
  lost: "Lost",
  open: "Open today",
  threat: "Status unresolved",
  building: "Building at risk",
  unknown: "Fate not yet established",
};

const FILL: Record<Status, string> = {
  lost: "var(--mark-closed)",
  open: "var(--mark-ink)",
  threat: "var(--mark-community)",
  building: "var(--mark-building)",
  unknown: "none",
};

// Build alert lookup: slug → {kind, whatChanged}
type AlertKind = "active" | "building" | "watch";
const alertBySlug = new Map<string, { kind: AlertKind; whatChanged: string }>(
  (alertsData.alerts as { parishLink: string; kind?: string; whatChanged: string }[]).map((a) => [
    a.parishLink.replace(/^\/(parishes|registry)\//, ""),
    { kind: (a.kind ?? "watch") as AlertKind, whatChanged: a.whatChanged },
  ])
);

function buildPoints(): Point[] {
  const bySlug = new Map(usParishes.map((p) => [p.slug, p]));
  const pts: Point[] = [];

  for (const pt of mapData.points) {
    const p = bySlug.get(pt.slug);
    if (!p) continue;
    const alert = alertBySlug.get(p.slug);
    const inAlerts = !!alert;
    const alerted = !!alert && alert.kind === "active";

    let status: Status;
    if (alert?.kind === "building") {
      status = "building";
    } else if (p.status === "standing") {
      status = "open";
    } else if (p.status === "undecided") {
      status = "threat";
    } else {
      status = "lost";
    }

    pts.push({
      id: p.slug,
      name: p.nameLt,
      city: p.city,
      state: p.state,
      x: pt.x,
      y: pt.y,
      status,
      alerted,
      inAlerts,
      alertText: alert?.whatChanged ?? null,
      founded: p.yearFounded,
      closed: p.yearClosed,
      profile: `/parishes/${p.slug}`,
      deep: true,
      detail: `${OWNERSHIP_LABEL[p.ownership]} · ${ENDING_MODE_LABEL[p.endingMode]}`,
      kindLabel: null,
    });
  }

  for (const c of regData.points) {
    // Canada is the comparator exception in the research record but is not
    // shown on the US-focused map — it would appear near the US border and
    // confuse readers. Canadian parishes stay in all data counts.
    if ((c as { country?: string }).country === "CA") continue;
    const alert = alertBySlug.get(c.slug);
    const inAlerts = !!alert;
    const alerted = !!alert && alert.kind === "active";

    let status: Status;
    if (alert?.kind === "building") {
      status = "building";
    } else if (inAlerts) {
      status = c.closedYear ? "lost" : "threat";
    } else if (c.closedYear) {
      status = "lost";
    } else if ((c as { lockedStanding?: boolean }).lockedStanding) {
      status = "open";
    } else {
      status = "unknown";
    }

    pts.push({
      id: c.slug,
      name: c.name,
      city: c.city,
      state: c.state,
      x: c.x,
      y: c.y,
      status,
      alerted,
      inAlerts,
      alertText: alert?.whatChanged ?? null,
      founded: c.foundedYear ?? null,
      closed: c.closedYear ?? null,
      profile: c.kind === "parish" ? `/registry/${c.slug}` : null,
      deep: false,
      detail: null,
      kindLabel:
        c.kind === "congregation" ? "Non-Catholic Lithuanian congregation" : null,
    });
  }
  return pts;
}

const POINTS = buildPoints();

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

function phaseAt(p: Point, year: number): "future" | "alive" | "lost" {
  if (!p.founded || p.founded > year) return "future";
  if (p.closed && p.closed <= year) return "lost";
  return "alive";
}

export default function ParishMap() {
  const router = useRouter();
  const [hovered, setHovered] = useState<Point | null>(null);
  const [mode, setMode] = useState<Mode>("all");
  const [view, setView] = useState<View>(FULL);
  const [year, setYear] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ px: number; py: number; moved: boolean } | null>(null);

  const zoom = FULL.w / view.w;
  const timelineMode = year !== null;

  const statusCounts = useMemo(() => {
    const c = { all: POINTS.length, open: 0, threat: 0, lost: 0, unknown: 0, building: 0 };
    for (const p of POINTS) {
      if (p.status === "open") c.open++;
      else if (p.status === "lost") c.lost++;
      else if (p.status === "building") c.building++;
      else if (p.status === "unknown") c.unknown++;
    }
    // "threat" filter = all that are alerted, genuinely unresolved, or building at risk
    c.threat = POINTS.filter(
      (p) => p.inAlerts || p.status === "threat" || p.status === "building"
    ).length;
    return c;
  }, []);

  const { datedCount, undatedCount, minYear } = useMemo(() => {
    const d = POINTS.filter((p) => p.founded);
    return {
      datedCount: d.length,
      undatedCount: POINTS.length - d.length,
      minYear: Math.min(...d.map((p) => p.founded as number)),
    };
  }, []);

  const counts = useMemo(() => {
    if (year === null) return { alive: 0, lost: 0 };
    let alive = 0, lost = 0;
    for (const p of POINTS) {
      const ph = phaseAt(p, year);
      if (ph === "alive") alive++;
      else if (ph === "lost") lost++;
    }
    return { alive, lost };
  }, [year]);

  useEffect(() => {
    if (!playing || year === null) return;
    const id = setInterval(() => {
      setYear((y) => {
        if (y === null || y >= END_YEAR) { setPlaying(false); return y; }
        return y + 1;
      });
    }, 170);
    return () => clearInterval(id);
  }, [playing, year === null]);

  const MW_STATES = new Set(["IL", "IN", "OH", "MI", "WI", "MN", "IA", "MO"]);

  function regionView(states: Set<string>) {
    const pts = POINTS.filter((p) => states.has(p.state));
    if (!pts.length) return FULL;
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const pad = 32;
    const x = Math.min(...xs) - pad;
    const y = Math.min(...ys) - pad;
    const w = Math.max(...xs) + pad - x;
    const h = Math.max(...ys) + pad - y;
    const fw = Math.max(w, (h * FULL.w) / FULL.h);
    return clampView({ x: x - (fw - w) / 2, y, w: fw, h: (fw / FULL.w) * FULL.h });
  }

  const neView = useMemo(() => regionView(NE_STATES), []);
  const mwView = useMemo(() => regionView(MW_STATES), []);

  function zoomBy(factor: number) {
    setView((v) => {
      const w = v.w / factor;
      return clampView({ x: v.x + (v.w - w) / 2, y: v.y + (v.h - (w / FULL.w) * FULL.h) / 2, w, h: (w / FULL.w) * FULL.h });
    });
  }

  function onWheel(e: React.WheelEvent<SVGSVGElement>) {
    e.preventDefault();
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = view.x + ((e.clientX - rect.left) / rect.width) * view.w;
    const my = view.y + ((e.clientY - rect.top) / rect.height) * view.h;
    const factor = e.deltaY < 0 ? 1.3 : 1 / 1.3;
    const newW = Math.min(Math.max(view.w / factor, FULL.w / MAX_ZOOM), FULL.w);
    const newH = (newW / FULL.w) * FULL.h;
    setView(clampView({
      x: mx - (mx - view.x) * (newW / view.w),
      y: my - (my - view.y) * (newH / view.h),
      w: newW,
      h: newH,
    }));
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
    if (Math.abs(e.clientX - drag.current.px) + Math.abs(e.clientY - drag.current.py) > 3)
      drag.current.moved = true;
    drag.current = { px: e.clientX, py: e.clientY, moved: drag.current.moved };
    setView((v) => clampView({ ...v, x: v.x - dx, y: v.y - dy }));
  }
  function onPointerUp() { drag.current = null; }

  function openPoint(p: Point) {
    if (drag.current?.moved || !p.profile) return;
    router.push(p.profile);
  }

  function startTimeline() { setMode("all"); setYear(minYear); setPlaying(true); }
  function exitTimeline() { setPlaying(false); setYear(null); }

  const markR = 6 / Math.sqrt(zoom);
  const btn = "rounded-md border border-rule bg-background px-2.5 py-1 text-sm font-medium hover:border-foreground transition-colors";
  const seg = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-foreground text-background" : "border border-rule hover:border-foreground"
    }`;

  const knownPoints = POINTS.filter((p) => p.status !== "unknown");
  const archivePoints = POINTS.filter((p) => p.status === "unknown");

  const visible = timelineMode
    ? knownPoints
    : mode === "all"
      ? knownPoints
      : mode === "open"
        ? knownPoints.filter((p) => p.status === "open")
        : knownPoints.filter((p) => p.inAlerts || p.status === "threat" || p.status === "building");

  return (
    <div>
      {/* Views */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" className={seg(!timelineMode && mode === "all")} onClick={() => { exitTimeline(); setMode("all"); }}>
          All US parishes
        </button>
        <button type="button" className={seg(!timelineMode && mode === "open")} onClick={() => { exitTimeline(); setMode("open"); }}>
          Open today ({statusCounts.open})
        </button>
        <button type="button" className={seg(!timelineMode && mode === "threat")} onClick={() => { exitTimeline(); setMode("threat"); }}>
          Under threat ({statusCounts.threat})
        </button>
        <button
          type="button"
          className={seg(timelineMode)}
          onClick={() => (timelineMode ? exitTimeline() : startTimeline())}
        >
          ▶ Across time ({minYear}–{END_YEAR})
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors border ${
            showArchived
              ? "border-muted bg-muted/10 text-foreground"
              : "border-rule text-muted hover:border-foreground"
          }`}
          onClick={() => setShowArchived((v) => !v)}
          title="Parishes attested in the research record but with unestablished fate — from sources including the Wolkovich book"
        >
          + Unestablished fate ({archivePoints.length})
        </button>
      </div>

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
          onWheel={onWheel}
        >
          {mapData.statePaths.map((d, i) => (
            <path key={i} d={d} fill="var(--band)" stroke="var(--foreground)" strokeOpacity={0.25} strokeWidth={0.7 / zoom} />
          ))}
          <path d={mapData.stateBorders} fill="none" stroke="var(--foreground)" strokeOpacity={0.15} strokeWidth={0.7 / zoom} />

          {/* Archive crosses — parishes with unestablished fate, shown when toggled */}
          {!timelineMode && showArchived && archivePoints.map((p) => {
            const isHov = hovered?.id === p.id;
            const r = isHov ? markR * 1.2 : markR * 0.9;
            return (
              <g key={p.id}
                onMouseEnter={() => setHovered(p)} onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(p)} onBlur={() => setHovered(null)}
                onClick={() => openPoint(p)}
                onKeyDown={(e) => { if (e.key === "Enter") openPoint(p); }}
                tabIndex={p.profile ? 0 : 0}
                role="img"
                aria-label={`${p.name}, ${p.city} ${p.state} — fate not yet established`}
                className="cursor-default focus:outline-none"
              >
                <line x1={p.x - r} y1={p.y} x2={p.x + r} y2={p.y}
                  stroke="var(--muted)" strokeOpacity={0.7} strokeWidth={markR * 0.35} strokeLinecap="round" />
                <line x1={p.x} y1={p.y - r} x2={p.x} y2={p.y + r}
                  stroke="var(--muted)" strokeOpacity={0.7} strokeWidth={markR * 0.35} strokeLinecap="round" />
              </g>
            );
          })}

          {visible.map((p) => {
            const active = hovered?.id === p.id;
            if (timelineMode && year !== null) {
              const ph = phaseAt(p, year);
              if (ph === "future") return null;
              const alive = ph === "alive";
              return (
                <circle
                  key={p.id}
                  cx={p.x} cy={p.y}
                  r={active ? markR * 1.4 : alive ? markR : markR * 0.85}
                  fill={alive ? "var(--mark-ink)" : "var(--mark-closed)"}
                  fillOpacity={alive ? 0.92 : 0.75}
                  stroke="var(--background)" strokeWidth={markR * 0.18}
                  tabIndex={0} role={p.profile ? "button" : undefined}
                  aria-label={`${p.name}, ${p.city} ${p.state} — ${alive ? "alive" : "lost"} in ${year}.`}
                  onMouseEnter={() => setHovered(p)} onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(p)} onBlur={() => setHovered(null)}
                  onClick={() => openPoint(p)}
                  onKeyDown={(e) => { if (e.key === "Enter") openPoint(p); }}
                  className={p.profile ? "cursor-pointer focus:outline-none" : "focus:outline-none"}
                />
              );
            }

            // Base radius: threat-alerted dots slightly larger
            const r = active ? markR * 1.35 : (p.alerted || p.status === "threat" || p.status === "building") ? markR * 1.15 : markR;

            return (
              <g key={p.id}
                onMouseEnter={() => setHovered(p)} onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(p)} onBlur={() => setHovered(null)}
                onClick={() => openPoint(p)}
                onKeyDown={(e) => { if (e.key === "Enter") openPoint(p); }}
                tabIndex={p.profile ? 0 : -1}
                role={p.profile ? "button" : undefined}
                aria-label={`${p.name}, ${p.city} ${p.state} — ${STATUS_LABEL[p.status]}${p.alerted ? " — active fight" : ""}.${p.profile ? " Open its record." : ""}`}
                className={p.profile ? "cursor-pointer focus:outline-none" : "focus:outline-none"}
              >
                {/* Outer glow ring for genuinely unresolved/threat status (no fight ring) */}
                {p.status === "threat" && !p.alerted && (
                  <circle cx={p.x} cy={p.y} r={r * 1.7} fill="none"
                    stroke="var(--mark-community)" strokeOpacity={0.55} strokeWidth={markR * 0.3} />
                )}
                {/* Gold ring for parishes with an active fight (kind=active) */}
                {p.alerted && (
                  <circle cx={p.x} cy={p.y} r={r * 1.85} fill="none"
                    stroke="var(--mark-community)" strokeOpacity={0.8} strokeWidth={markR * 0.45} />
                )}
                <circle
                  cx={p.x} cy={p.y} r={r}
                  fill={FILL[p.status]}
                  fillOpacity={p.status === "unknown" ? 0 : 0.92}
                  stroke={p.status === "unknown" ? "var(--foreground)" : "var(--background)"}
                  strokeOpacity={p.status === "unknown" ? 0.45 : 1}
                  strokeWidth={p.status === "unknown" ? markR * 0.28 : markR * 0.18}
                />
              </g>
            );
          })}
        </svg>

        {/* Region shortcuts */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <button type="button" className={btn} onClick={() => setView(neView)}>Northeast</button>
          <button type="button" className={btn} onClick={() => setView(mwView)}>Midwest</button>
          {zoom > 1.01 && (
            <button type="button" className={btn} onClick={() => setView(FULL)}>Reset</button>
          )}
        </div>
        <div className="absolute right-2 bottom-2 flex flex-col gap-1.5">
          <button type="button" className={btn} aria-label="Zoom in" onClick={() => zoomBy(1.6)}>+</button>
          <button type="button" className={btn} aria-label="Zoom out" onClick={() => zoomBy(1 / 1.6)}>−</button>
        </div>

        {/* Hover card */}
        {hovered &&
          (() => {
            const lx = ((hovered.x - view.x) / view.w) * 100;
            const ly = ((hovered.y - view.y) / view.h) * 100;
            if (lx < -2 || lx > 102 || ly < -2 || ly > 102) return null;
            const below = ly < 32;
            return (
              <div
                className="pointer-events-none absolute z-10 w-72 rounded-lg border border-rule bg-background/95 px-3.5 py-2.5 text-sm shadow-lg"
                style={{
                  left: `${Math.min(Math.max(lx, 15), 85)}%`,
                  top: `${ly}%`,
                  transform: below ? "translate(-50%, 16px)" : "translate(-50%, calc(-100% - 16px))",
                }}
                aria-live="polite"
              >
                <div className="font-serif font-semibold">{hovered.name}</div>
                <div className="text-muted">{hovered.city}, {hovered.state}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  {hovered.alerted && (
                    <span className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: "var(--mark-community)" }} aria-hidden />
                  )}
                  {hovered.status === "building" && (
                    <span className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: "var(--mark-building)" }} aria-hidden />
                  )}
                  <span className="font-medium">{STATUS_LABEL[hovered.status]}</span>
                  {hovered.alerted && <span className="text-muted text-xs">— active fight</span>}
                  <span className="text-muted">
                    {hovered.founded ? ` · founded ${hovered.founded}` : ""}
                    {hovered.closed ? `, lost ${hovered.closed}` : ""}
                  </span>
                </div>
                {hovered.alertText && (
                  <p className="mt-1.5 text-xs leading-relaxed text-muted border-t border-rule pt-1.5">
                    {hovered.alertText}
                  </p>
                )}
                {hovered.detail && (
                  <div className="text-muted text-xs mt-0.5">{hovered.detail}</div>
                )}
                {hovered.kindLabel && (
                  <div className="text-muted text-xs mt-0.5">{hovered.kindLabel}</div>
                )}
                <div className="text-muted text-xs mt-0.5">
                  {hovered.deep ? "Documented in depth — full case file" : "Attested by the research record"}
                </div>
                {hovered.profile && (
                  <div className="mt-1.5 font-medium underline">Open the parish record →</div>
                )}
              </div>
            );
          })()}

        {timelineMode && (
          <div className="absolute left-2 bottom-2 rounded-lg bg-background/90 border border-rule px-3 py-2">
            <div className="font-serif text-2xl font-semibold tabular-nums">{year}</div>
            <div className="text-sm">
              <span className="font-medium">{counts.alive}</span> alive
              {counts.lost > 0 && (
                <> {" · "}<span style={{ color: "var(--mark-closed)" }}>{counts.lost} lost</span></>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timeline scrubber */}
      {timelineMode && (
        <div className="mt-3 rounded-lg border border-rule px-4 py-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setPlaying((p) => !p)} className={btn} aria-label={playing ? "Pause" : "Play"}>
              {playing ? "❚❚" : "▶"}
            </button>
            <input
              type="range" min={minYear} max={END_YEAR} value={year ?? minYear}
              onChange={(e) => { setPlaying(false); setYear(Number(e.target.value)); }}
              aria-label="Year" className="flex-1 accent-[var(--mark-closed)]"
            />
          </div>
          <div className="flex justify-between text-xs text-muted tabular-nums px-9 mt-1">
            <span>{minYear}</span><span>1950</span><span>1980</span><span>{END_YEAR}</span>
          </div>
        </div>
      )}

      {/* Caption */}
      <div className="mt-3 min-h-14 rounded-lg border border-rule px-4 py-2.5 text-sm">
        {timelineMode ? (
          <span className="text-muted">
            The timeline places the {datedCount} parishes on this map with a
            documented founding year. {undatedCount} more are in the record
            without a firm date yet — the true arc is larger than what shows
            here. Click any mark for its record.
          </span>
        ) : mode === "threat" ? (
          <span className="text-muted">
            {statusCounts.threat} parishes and buildings currently watched.{" "}
            <a href="/under-threat" className="underline hover:text-foreground font-medium">
              Full situation for each →
            </a>
          </span>
        ) : (
          <span className="text-muted">
            One record — every documented parish on one map. Hover any mark; click to open
            its record — the United States and Canada together. See a parish missing?{" "}
            <a href="/report" className="underline hover:text-foreground">Report it</a>.
          </span>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 rounded-lg border border-rule px-4 py-3">
        <p className="text-xs uppercase tracking-widest text-muted mb-2">Key</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
        {timelineMode ? (
          <>
            <Swatch fill="var(--mark-ink)" label="Alive that year" />
            <Swatch fill="var(--mark-closed)" label="Lost by then" />
          </>
        ) : mode === "threat" ? (
          <>
            <Swatch fill="var(--mark-ink)" ring label="Open, active fight" />
            <Swatch fill="var(--mark-closed)" ring label="Closed, fight ongoing" />
            <Swatch fill="var(--mark-community)" label="Status unresolved" />
            <Swatch fill="var(--mark-building)" label="Building at risk" />
            <Swatch fill="var(--mark-closed)" label={`Recently closed (${statusCounts.lost})`} />
          </>
        ) : (
          <>
            <Swatch fill="var(--mark-ink)" label={`Open today (${statusCounts.open})`} />
            <Swatch fill="var(--mark-ink)" ring label="Open, under active threat" />
            <Swatch fill="var(--mark-community)" ring label="Status unresolved" />
            <Swatch fill="var(--mark-closed)" label={`Lost (${statusCounts.lost})`} />
            <Swatch fill="var(--mark-building)" label="Building at risk" />
            {showArchived && <SwatchCross label={`Fate not yet established (${archivePoints.length})`} />}
          </>
        )}
        </div>
      </div>
    </div>
  );
}

function SwatchCross({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden>
        <line x1={4} y1={8} x2={12} y2={8} stroke="var(--muted)" strokeOpacity={0.7} strokeWidth={1.4} strokeLinecap="round" />
        <line x1={8} y1={4} x2={8} y2={12} stroke="var(--muted)" strokeOpacity={0.7} strokeWidth={1.4} strokeLinecap="round" />
      </svg>
      {label}
    </span>
  );
}

function Swatch({ fill, label, hollow, ring }: { fill?: string; label: string; hollow?: boolean; ring?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden>
        {ring && (
          <circle cx={8} cy={8} r={7} fill="none"
            stroke="var(--mark-community)" strokeOpacity={0.8} strokeWidth={1.5} />
        )}
        <circle
          cx={8} cy={8} r={4.6}
          fill={hollow ? "none" : fill}
          stroke={hollow ? "var(--foreground)" : "var(--background)"}
          strokeOpacity={hollow ? 0.45 : 1}
          strokeWidth={hollow ? 1.4 : 0.8}
        />
      </svg>
      {label}
    </span>
  );
}
