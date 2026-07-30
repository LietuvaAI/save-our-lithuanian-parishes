"use client";

// The homepage map: ONE mark system across the whole record (Vilija
// 2026-07-21), colored by the SHARED end-state resolver (lib/end-state.ts)
// so the map always agrees with the profiles and The History (Vilija
// 2026-07-27: the map must match the history flow). Shape = congregation
// class:
//   circle              = Roman Catholic parish (default)
//   diamond             = National Catholic / Independent Catholic parish
//   square              = Protestant congregation
//   fill color          = canonical status
//   hollow mark         = mission or hosted Lithuanian worship
//   outer ring          = current campaign, watch, or building-risk signal
//   ×                   = church demolished
// Who-decided (ending mode) and ownership stay in each parish's popup and
// profile — the map itself reads at a glance. Views: All · Open today ·
// Unresolved · Lost. Current campaigns remain a separate ring annotation.
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import mapData from "@/data/map.json";
import regData from "@/data/registry-map.json";
import alertsData from "@/data/alerts.json";
import {
  usParishes,
  ENDING_MODE_LABEL,
  OWNERSHIP_LABEL,
} from "@/lib/parishes";
import {
  GROUP_DESCRIPTION,
  GROUP_LABEL,
  resolveEndState,
  toGroup,
  type EndStateGroup,
} from "@/lib/end-state";
import {
  isHollowRecordMark,
  recordMarkColor,
  recordMarkShape,
  SIGNAL_RING_COLOR,
  type RecordSignal,
} from "@/lib/record-mark";
import contextPoints from "@/data/context-points.json";

const FULL = (regData as { frame?: { x: number; y: number; w: number; h: number } })
  .frame ?? { x: 0, y: 0, w: 975, h: 610 };
const MAX_ZOOM = 20;
const NE_STATES = new Set(["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA", "MD"]);
const MW_STATES = new Set(["IL", "IN", "OH", "MI", "WI", "MN", "IA", "MO"]);

type View = { x: number; y: number; w: number; h: number };
// Status drives the filter vocabulary; canonical group drives fill color.
type Status = "lost" | "open" | "mass" | "unresolved" | "building" | "unknown" | "transferred";
type Mode =
  | "all"
  | "open"
  | "mission"
  | "mass"
  | "unresolved"
  | "lost"
  | "transferred"
  | "unknown";
type ClassFilter = "all" | "roman_catholic" | "national_catholic_pncc" | "non_catholic_christian";
type MapKey = EndStateGroup | "active_mission";

interface Point {
  id: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
  status: Status;
  group: EndStateGroup;
  // alerted = true → draw a gold ring around the dot (kind=active alerts)
  alerted: boolean;
  signalKind: RecordSignal | null;
  alertText: string | null;
  founded: number | null;
  closed: number | null;
  profile: string | null;
  deep: boolean;
  detail: string | null;
  kindLabel: string | null;
  // congregation_class from registry — drives shape (diamond for PNCC / independent)
  congregationClass: string | null;
  recordType: string | null;
  // Loss sub-fate for closed dots — same vocabulary as the flow chart.
  fate: "closed" | "demolished" | "repurposed" | null;
}

const STATUS_LABEL: Record<Status, string> = {
  lost: GROUP_LABEL.closed,
  open: GROUP_LABEL.active_parish,
  mass: GROUP_LABEL.mass_continues,
  unresolved: GROUP_LABEL.unresolved,
  building: "Building at risk",
  unknown: GROUP_LABEL.unverified,
  transferred: GROUP_LABEL.transferred,
};

function pointStatusLabel(point: Point) {
  if (point.group === "active_parish" && point.recordType === "misija") {
    return "Active Lithuanian mission";
  }
  return STATUS_LABEL[point.status];
}

// End-state group -> map status. THE one mapping; both point sources use it.
const GROUP_STATUS: Record<string, Status> = {
  active_parish: "open",
  mass_continues: "mass",
  transferred: "transferred",
  unresolved: "unresolved",
  closed: "lost",
  unverified: "unknown",
};
const contextGroupBySlug = new Map(
  (contextPoints.points as { slug: string; group: string }[]).map((c) => [c.slug, c.group]),
);
const contextClassBySlug = new Map(
  (contextPoints.points as { slug: string; congregationClass: string | null }[]).map((c) => [
    c.slug,
    c.congregationClass,
  ]),
);
const contextHrefBySlug = new Map(
  (contextPoints.points as { slug: string; href: string | null }[]).map((c) => [
    c.slug,
    c.href,
  ]),
);
const contextRecordTypeBySlug = new Map(
  (contextPoints.points as { slug: string; recordType: string | null }[]).map(
    (c) => [c.slug, c.recordType],
  ),
);

// Build alert lookup: slug → {kind, whatChanged}
type AlertKind = RecordSignal;
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
    const alerted = !!alert && alert.kind === "active";

    const isStanding = p.status === "standing";
    const endState = resolveEndState(
      (p.lithuanianIdentity as never) ?? null,
      (p.buildingFate as never) ?? null,
      p.yearClosed != null || !isStanding,
      isStanding,
      p.endingMode,
    );
    const group = toGroup(endState);
    const status: Status = GROUP_STATUS[group];
    const fate: Point["fate"] =
      group !== "closed"
        ? null
        : endState === "demolished"
          ? "demolished"
          : endState === "repurposed"
            ? "repurposed"
            : "closed";

    pts.push({
      id: p.slug,
      name: p.nameLt,
      city: p.city,
      state: p.state,
      x: pt.x,
      y: pt.y,
      status,
      group,
      alerted,
      signalKind: alert?.kind ?? null,
      alertText: alert?.whatChanged ?? null,
      founded: p.yearFounded,
      closed: p.yearClosed,
      profile: `/parishes/${p.slug}`,
      deep: true,
      detail: `${OWNERSHIP_LABEL[p.ownership]} · ${ENDING_MODE_LABEL[p.endingMode]}`,
      kindLabel:
        contextClassBySlug.get(p.slug) === "national_catholic_pncc"
          ? "National Catholic (independent from Rome)"
          : contextClassBySlug.get(p.slug) === "non_catholic_christian"
            ? "Protestant Lithuanian congregation"
            : null,
      congregationClass: contextClassBySlug.get(p.slug) ?? null,
      recordType: contextRecordTypeBySlug.get(p.slug) ?? null,
      fate,
    });
  }

  for (const c of regData.points) {
    // Canada is the comparator exception in the research record but is not
    // shown on the US-focused map — it would appear near the US border and
    // confuse readers. Canadian parishes stay in all data counts.
    if ((c as { country?: string }).country === "CA") continue;
    const alert = alertBySlug.get(c.slug);
    const alerted = !!alert && alert.kind === "active";

    // Same layer the profile context maps and dispatch renderer use —
    // zero drift with the shared resolver.
    const group =
      (contextGroupBySlug.get(c.slug) as EndStateGroup | undefined) ??
      (c.closedYear ? "closed" : "unverified");
    const status: Status = GROUP_STATUS[group];
    const bf = (c as { buildingFate?: string | null }).buildingFate;
    const fate: Point["fate"] =
      group !== "closed"
        ? null
        : bf === "demolished"
          ? "demolished"
          : bf === "repurposed_secular" || bf === "repurposed_religious"
            ? "repurposed"
            : "closed";

    pts.push({
      id: c.slug,
      name: c.name,
      city: c.city,
      state: c.state,
      x: c.x,
      y: c.y,
      status,
      group,
      alerted,
      signalKind: alert?.kind ?? null,
      alertText: alert?.whatChanged ?? null,
      founded: c.foundedYear ?? null,
      closed: c.closedYear ?? null,
      profile:
        c.kind === "parish"
          ? (contextHrefBySlug.get(c.slug) ?? `/parishes/${c.slug}`)
          : null,
      deep: false,
      detail: null,
      congregationClass: (c as { congregationClass?: string }).congregationClass ?? null,
      recordType: contextRecordTypeBySlug.get(c.slug) ?? null,
      fate,
      kindLabel:
        c.kind === "congregation"
          ? "Non-Catholic Lithuanian congregation"
          : (c as { congregationClass?: string }).congregationClass === "national_catholic_pncc"
            ? "National Catholic (independent from Rome)"
            : (c as { congregationClass?: string }).congregationClass === "independent_catholic"
              ? "Independent Catholic"
              : null,
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


export default function ParishMap() {
  const router = useRouter();
  const [hovered, setHovered] = useState<Point | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function dotEnter(p: Point) {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered(p);
  }
  function dotLeave() {
    leaveTimer.current = setTimeout(() => setHovered(null), 90);
  }
  function cardEnter() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }
  function cardLeave() {
    setHovered(null);
  }
  const [mode, setMode] = useState<Mode>("all");
  // Sub-filter inside the Closed view — same sub-fates as the flow chart.
  const [lostFate, setLostFate] = useState<"all" | "closed" | "demolished" | "repurposed">("all");
  // Default to Roman Catholic institutions. The map includes missions, while
  // The History is explicitly parish-only, so the visible scope always names
  // both record types.
  const [classFilter, setClassFilter] = useState<ClassFilter>("roman_catholic");
  const [view, setView] = useState<View>(FULL);
  const [showDioceses, setShowDioceses] = useState(false);
  const [expandedKey, setExpandedKey] = useState<MapKey | null>(null);
  const [dioceseBorders, setDioceseBorders] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  async function toggleDioceses() {
    if (!dioceseBorders) {
      const mod = await import("@/data/diocese-overlay.json");
      setDioceseBorders((mod.default ?? mod).borders as string);
    }
    setShowDioceses((v) => !v);
  }
  const drag = useRef<{ px: number; py: number; moved: boolean } | null>(null);

  const zoom = FULL.w / view.w;

  const classPoints = useMemo(
    () =>
      classFilter === "all"
        ? POINTS
        : POINTS.filter((p) =>
            classFilter === "national_catholic_pncc"
              ? p.congregationClass === "national_catholic_pncc" ||
                p.congregationClass === "independent_catholic"
              : (p.congregationClass ?? "roman_catholic") === classFilter,
          ),
    [classFilter],
  );
  const communityCounts = useMemo(
    () => ({
      all: POINTS.length,
      roman_catholic: POINTS.filter(
        (point) =>
          (point.congregationClass ?? "roman_catholic") === "roman_catholic",
      ).length,
      national_catholic_pncc: POINTS.filter(
        (point) =>
          point.congregationClass === "national_catholic_pncc" ||
          point.congregationClass === "independent_catholic",
      ).length,
      non_catholic_christian: POINTS.filter(
        (point) => point.congregationClass === "non_catholic_christian",
      ).length,
    }),
    [],
  );

  const statusCounts = useMemo(() => {
    const c = {
      all: classPoints.length,
      open: 0,
      mission: 0,
      mass: 0,
      unresolved: 0,
      lost: 0,
      unknown: 0,
      transferred: 0,
    };
    for (const p of classPoints) {
      if (p.recordType === "misija") c.mission++;
      else if (p.group === "active_parish") c.open++;
      else if (p.group === "mass_continues") c.mass++;
      else if (p.group === "unresolved") c.unresolved++;
      else if (p.group === "closed") c.lost++;
      else if (p.group === "unverified") c.unknown++;
      else if (p.group === "transferred") c.transferred++;
    }
    return c;
  }, [classPoints]);
  const recordTypeCounts = useMemo(
    () => ({
      parish: classPoints.filter((point) => point.recordType === "parish")
        .length,
      mission: classPoints.filter((point) => point.recordType === "misija")
        .length,
      congregation: classPoints.filter(
        (point) => point.recordType === "congregation",
      ).length,
      closedParish: classPoints.filter(
        (point) =>
          point.group === "closed" && point.recordType === "parish",
      ).length,
      closedMission: classPoints.filter(
        (point) =>
          point.group === "closed" && point.recordType === "misija",
      ).length,
      activeMission: classPoints.filter(
        (point) =>
          point.group === "active_parish" && point.recordType === "misija",
      ).length,
    }),
    [classPoints],
  );
  const selectedScope =
    classFilter === "roman_catholic"
      ? `${recordTypeCounts.parish} Roman Catholic parishes + ${recordTypeCounts.mission} missions`
      : classFilter === "national_catholic_pncc"
        ? `${statusCounts.all} National or independent Catholic parish records`
        : classFilter === "non_catholic_christian"
          ? `${statusCounts.all} Protestant parish and congregation records`
          : `${statusCounts.all} parish, mission, and congregation records`;

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

  const markR = 6 / Math.sqrt(zoom);
  const btn = "rounded-md border border-rule bg-background px-2.5 py-1 text-sm font-medium hover:border-foreground transition-colors";
  const classTab = (active: boolean) =>
    `rounded-[4px] whitespace-nowrap px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
      active
        ? "bg-background text-foreground shadow-sm"
        : "text-muted hover:text-foreground"
    }`;
  const statusTab = (active: boolean) =>
    `inline-flex min-h-9 shrink-0 items-center border-b-2 px-1.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-2 ${
      active
        ? "border-foreground text-foreground"
        : "border-transparent text-muted hover:border-rule hover:text-foreground"
    }`;

  const statusFiltered =
    mode === "all"
      ? classPoints
      : mode === "open"
        ? classPoints.filter(
            (p) => p.group === "active_parish" && p.recordType !== "misija",
          )
        : mode === "mission"
          ? classPoints.filter((p) => p.recordType === "misija")
          : mode === "mass"
            ? classPoints.filter((p) => p.group === "mass_continues")
            : mode === "unresolved"
              ? classPoints.filter((p) => p.group === "unresolved")
              : mode === "lost"
                ? classPoints.filter(
                    (p) =>
                      p.group === "closed" &&
                      p.recordType !== "misija" &&
                      (lostFate === "all" || p.fate === lostFate),
                  )
                : mode === "transferred"
                  ? classPoints.filter((p) => p.group === "transferred")
                  : classPoints.filter((p) => p.group === "unverified");

  const visible = statusFiltered;

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-rule">
        <div className="border-b border-rule px-3 pt-2.5 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 pb-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-[11px] font-medium uppercase tracking-widest text-muted">
                Community
              </span>
              <div
                className="flex min-w-0 items-center overflow-x-auto rounded-md bg-band p-0.5"
                role="group"
                aria-label="Filter by congregation type"
              >
                {(
                  [
                    { key: "all", label: "All communities" },
                    { key: "roman_catholic", label: "Roman Catholic" },
                    { key: "national_catholic_pncc", label: "National & independent" },
                    { key: "non_catholic_christian", label: "Protestant" },
                  ] as { key: ClassFilter; label: string }[]
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    className={classTab(classFilter === key)}
                    aria-pressed={classFilter === key}
                    onClick={() => {
                      setClassFilter(key);
                      setMode("all");
                      setLostFate("all");
                    }}
                  >
                    {label} · {communityCounts[key]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center text-xs text-muted">
              <label
                className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap hover:text-foreground"
                title="Catholic diocese boundaries"
              >
                <input
                  type="checkbox"
                  checked={showDioceses}
                  onChange={() => void toggleDioceses()}
                  className="h-3.5 w-3.5 accent-foreground"
                />
                Diocese lines
              </label>
            </div>
          </div>

          <div
            className="-mx-1 flex items-end gap-0.5 overflow-x-auto md:mx-0 md:flex-wrap md:overflow-visible"
            role="group"
            aria-label="Filter by parish status"
          >
            <button
              type="button"
              className={statusTab(mode === "all")}
              aria-pressed={mode === "all"}
              onClick={() => setMode("all")}
            >
              All statuses · {statusCounts.all}
            </button>
            <SwatchBtn
              fill="var(--es-active)"
              label={`${GROUP_LABEL.active_parish} · ${statusCounts.open}`}
              active={mode === "open"}
              onClick={() => setMode("open")}
            />
            <SwatchBtn
              fill="var(--es-active)"
              label={`Mission records · ${statusCounts.mission}`}
              active={mode === "mission"}
              onClick={() => setMode("mission")}
            />
            <SwatchBtn
              fill="var(--es-mass)"
              label={`${GROUP_LABEL.mass_continues} · ${statusCounts.mass}`}
              active={mode === "mass"}
              onClick={() => setMode("mass")}
            />
            <SwatchBtn
              fill="var(--mark-ink)"
              label={`${GROUP_LABEL.unresolved} · ${statusCounts.unresolved}`}
              active={mode === "unresolved"}
              onClick={() => setMode("unresolved")}
            />
            <SwatchBtn
              fill="var(--es-transferred)"
              label={`${GROUP_LABEL.transferred} · ${statusCounts.transferred}`}
              active={mode === "transferred"}
              onClick={() => setMode("transferred")}
            />
            <SwatchBtn
              fill="var(--es-closed)"
              label={`${GROUP_LABEL.closed} · ${statusCounts.lost}`}
              active={mode === "lost"}
              onClick={() => { setMode("lost"); setLostFate("all"); }}
            />
            <SwatchBtn
              fill="var(--muted)"
              label={`${GROUP_LABEL.unverified} · ${statusCounts.unknown}`}
              active={mode === "unknown"}
              onClick={() => setMode("unknown")}
            />
          </div>
        </div>

        {/* How each closure ended — sub-fates, same vocabulary as the flow chart */}
        {mode === "lost" && (() => {
          const lostPts = classPoints.filter(
            (p) => p.group === "closed" && p.recordType !== "misija",
          );
          const n = (f: "closed" | "demolished" | "repurposed") =>
            lostPts.filter((p) => p.fate === f).length;
          const sub = (key: "all" | "closed" | "demolished" | "repurposed", label: string) => (
            <button
              key={key}
              type="button"
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                lostFate === key
                  ? "bg-foreground text-background"
                  : "border border-rule hover:border-foreground"
              }`}
              onClick={() => setLostFate(key)}
            >
              {label}
            </button>
          );
          return (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-rule px-3 py-2 text-xs sm:px-4">
              <span className="text-muted uppercase tracking-wide">How each closure ended:</span>
              {sub("all", `All · ${lostPts.length}`)}
              {sub("closed", `Parish closed · ${n("closed")}`)}
              {sub("demolished", `Church demolished × · ${n("demolished")}`)}
              {sub("repurposed", `Building sold on · ${n("repurposed")}`)}
            </div>
          );
        })()}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="relative order-2 min-w-0 lg:order-1">
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          role="img"
          aria-label="Map of the United States showing documented Lithuanian parishes, missions, and congregations"
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

          {/* Diocese boundaries — lazy-loaded, drawn under the parish marks */}
          {showDioceses && dioceseBorders && (
            <path
              d={dioceseBorders}
              fill="none"
              stroke="var(--accent)"
              strokeOpacity={0.4}
              strokeWidth={0.8 / zoom}
              pointerEvents="none"
            />
          )}

          {visible.map((p) => {
            const active = hovered?.id === p.id;

            // Current signals and unresolved records are slightly larger.
            const r = active ? markR * 1.35 : (p.signalKind || p.status === "unresolved") ? markR * 1.15 : markR;
            const shape = recordMarkShape(p.congregationClass);
            const hollow = isHollowRecordMark({
              group: p.group,
              recordType: p.recordType,
            });
            const fill = hollow ? "var(--background)" : recordMarkColor(p.group);
            const stroke = hollow ? recordMarkColor(p.group) : "var(--background)";
            const dr = r * 1.2; // diamond half-span

            return (
              <g key={p.id}
                onMouseEnter={() => dotEnter(p)} onMouseLeave={dotLeave}
                onFocus={() => dotEnter(p)} onBlur={dotLeave}
                onClick={() => openPoint(p)}
                onKeyDown={(e) => { if (e.key === "Enter") openPoint(p); }}
                tabIndex={p.profile ? 0 : -1}
                role={p.profile ? "button" : undefined}
                aria-label={`${p.name}, ${p.city} ${p.state} — ${pointStatusLabel(p)}${p.alerted ? " — active campaign" : ""}.${p.profile ? " Open its record." : ""}`}
                className={p.profile ? "cursor-pointer focus:outline-none" : "focus:outline-none"}
              >
                {/* Outer rings are reserved for current signals. */}
                {p.signalKind && (
                  <circle cx={p.x} cy={p.y} r={r * 1.85} fill="none"
                    stroke={SIGNAL_RING_COLOR[p.signalKind]} strokeOpacity={0.8} strokeWidth={markR * 0.45} />
                )}
                {shape === "diamond" ? (
                  /* Diamond shape for National Catholic / Independent Catholic parishes */
                  <polygon
                    points={`${p.x},${p.y - dr} ${p.x + dr},${p.y} ${p.x},${p.y + dr} ${p.x - dr},${p.y}`}
                    fill={fill}
                    fillOpacity={hollow ? 1 : 0.9}
                    stroke={stroke}
                    strokeWidth={hollow ? markR * 0.34 : markR * 0.18}
                  />
                ) : shape === "square" ? (
                  <rect
                    x={p.x - r}
                    y={p.y - r}
                    width={r * 2}
                    height={r * 2}
                    rx={markR * 0.12}
                    fill={fill}
                    fillOpacity={hollow ? 1 : p.status === "unknown" ? 0.45 : 0.92}
                    stroke={stroke}
                    strokeWidth={hollow ? markR * 0.34 : markR * 0.18}
                  />
                ) : (
                  <circle
                    cx={p.x} cy={p.y} r={r}
                    fill={fill}
                    fillOpacity={hollow ? 1 : p.status === "unknown" ? 0.45 : 0.92}
                    stroke={stroke}
                    strokeOpacity={1}
                    strokeWidth={hollow ? markR * 0.34 : markR * 0.18}
                  />
                )}
                {/* Demolished churches carry the same × the timeline uses */}
                {p.fate === "demolished" && (
                  <g stroke="var(--background)" strokeWidth={markR * 0.28} strokeLinecap="round" pointerEvents="none">
                    <line x1={p.x - r * 0.45} y1={p.y - r * 0.45} x2={p.x + r * 0.45} y2={p.y + r * 0.45} />
                    <line x1={p.x - r * 0.45} y1={p.y + r * 0.45} x2={p.x + r * 0.45} y2={p.y - r * 0.45} />
                  </g>
                )}
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
        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
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
                onMouseEnter={cardEnter}
                onMouseLeave={cardLeave}
                className="absolute z-10 w-72 rounded-lg border border-rule bg-background/95 px-3.5 py-2.5 text-sm shadow-lg"
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
                  <span className="font-medium">
                    {pointStatusLabel(hovered)}
                    {hovered.fate === "demolished" && " — church demolished"}
                    {hovered.fate === "repurposed" && " — building sold on"}
                  </span>
                  {hovered.alerted && <span className="text-muted text-xs">— active campaign</span>}
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
                  <a
                    href={hovered.profile}
                    className="mt-1.5 block font-medium underline hover:opacity-75"
                  >
                    Open the parish record →
                  </a>
                )}
              </div>
            );
          })()}
          </div>

          <aside
            className="order-1 border-b border-rule px-3 py-3 sm:px-4 lg:order-2 lg:border-b-0 lg:border-l"
            aria-label="Map key"
          >
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted">
              Map key
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {selectedScope}
              {classFilter === "roman_catholic"
                ? ". Missions remain separate from parish headline figures."
                : "."}
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs lg:grid-cols-1 lg:gap-y-2.5">
              {(
                [
                  {
                    key: "active_parish",
                    label: GROUP_LABEL.active_parish,
                    description: GROUP_DESCRIPTION.active_parish,
                    fill: "var(--es-active)",
                    count: statusCounts.open,
                  },
                  {
                    key: "active_mission",
                    label: "Mission records",
                    description:
                      `${recordTypeCounts.activeMission} active and ${recordTypeCounts.closedMission} closed. Missions keep their own status on the map and are counted separately from parishes.`,
                    fill: "var(--es-active)",
                    count: statusCounts.mission,
                  },
                  {
                    key: "mass_continues",
                    label: GROUP_LABEL.mass_continues,
                    description: GROUP_DESCRIPTION.mass_continues,
                    fill: "var(--es-mass)",
                    count: statusCounts.mass,
                  },
                  {
                    key: "unresolved",
                    label: GROUP_LABEL.unresolved,
                    description: GROUP_DESCRIPTION.unresolved,
                    fill: "var(--mark-ink)",
                    count: statusCounts.unresolved,
                  },
                  {
                    key: "transferred",
                    label: GROUP_LABEL.transferred,
                    description: GROUP_DESCRIPTION.transferred,
                    fill: "var(--es-transferred)",
                    count: statusCounts.transferred,
                  },
                  {
                    key: "closed",
                    label: GROUP_LABEL.closed,
                    description:
                      classFilter === "roman_catholic"
                        ? `${recordTypeCounts.closedParish} parishes are closed. Select the Closed filter to see whether each church was demolished, sold on, or remains standing. Closed missions remain in the separate Mission records category.`
                        : GROUP_DESCRIPTION.closed,
                    fill: "var(--es-closed)",
                    count: statusCounts.lost,
                  },
                  {
                    key: "unverified",
                    label: GROUP_LABEL.unverified,
                    description: GROUP_DESCRIPTION.unverified,
                    fill: "var(--muted)",
                    count: statusCounts.unknown,
                  },
                ] satisfies {
                  key: MapKey;
                  label: string;
                  description: string;
                  fill: string;
                  count: number;
                }[]
              ).map(({ key, label, description, fill, count }) => {
                const expanded = expandedKey === key;
                const detailId = `map-key-detail-${key}`;
                return (
                  <div
                    key={key}
                    className={`min-w-0 ${expanded ? "col-span-2 lg:col-span-1" : ""}`}
                  >
                    <dt>
                      <button
                        type="button"
                        className="flex w-full min-w-0 items-start gap-2 text-left leading-snug hover:text-foreground"
                        aria-expanded={expanded}
                        aria-controls={detailId}
                        onClick={() => setExpandedKey(expanded ? null : key)}
                      >
                        <span
                          className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: fill }}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 font-medium">
                          {label} · {count}
                        </span>
                        <span
                          className="shrink-0 text-sm leading-none text-muted"
                          aria-hidden
                        >
                          {expanded ? "−" : "+"}
                        </span>
                      </button>
                    </dt>
                    <dd
                      id={detailId}
                      className={`${expanded ? "block" : "hidden"} mt-1 pl-[18px] leading-relaxed text-muted`}
                    >
                      {description}
                    </dd>
                  </div>
                );
              })}
            </dl>
            <div className="mt-3 border-t border-rule pt-2.5 text-xs">
              <p className="font-medium">Marks</p>
              <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-muted lg:grid-cols-1">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-foreground" aria-hidden />
                  Roman Catholic
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rotate-45 bg-foreground" aria-hidden />
                  National Catholic
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-[1px] bg-foreground" aria-hidden />
                  Protestant
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-[var(--foreground)] bg-background" aria-hidden />
                  Mission or hosted Mass
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex h-3 w-3 items-center justify-center rounded-full border border-[var(--mark-community)]" aria-hidden>
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--es-active)]" />
                  </span>
                  Current signal
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-foreground" aria-hidden>×</span>
                  Church demolished
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-muted">
        Shown: {selectedScope}. Roman Catholic records appear by default;
        National Catholic and Protestant records are available through the
        community filters. Religious-house, cemetery, shrine, club, and school
        chapels remain part of the heritage record but not the institutional
        count.{" "}
        <a href="/about-the-data" className="underline hover:text-foreground">
          How the record is scoped →
        </a>
      </p>

      {/* Caption */}
      <div className="mt-2 min-h-9 border-t border-rule pt-2.5 text-sm">
        {mode === "unresolved" ? (
          <span className="text-muted">
            {statusCounts.unresolved} records whose outcome remains contested or
            canonically undecided. Open a mark for its evidence.
          </span>
        ) : mode === "mission" ? (
          <span className="text-muted">
            {statusCounts.mission} active mission in this historical record.{" "}
            <a
              href="/lithuanian-catholic-life-today"
              className="font-medium underline hover:text-foreground"
            >
              See the complete current Catholic network →
            </a>
          </span>
        ) : mode === "lost" ? (
          <span className="text-muted">
            {statusCounts.lost} records in the Closed category. Hover any mark;
            click to open its record.{" "}
            <a href="/record" className="underline hover:text-foreground font-medium">
              Full list in The Record →
            </a>
          </span>
        ) : mode === "unknown" ? (
          <span className="text-muted">
            {statusCounts.unknown} records whose present status is still being
            verified. Open a mark to inspect what is currently documented.
          </span>
        ) : (
          <span className="text-muted">
            One map — every documented parish, mission, and congregation.
            Hover any mark; click to open its record.{" "}
            <a href="/under-threat" className="font-medium underline hover:text-foreground">
              See what&rsquo;s happening now →
            </a>
          </span>
        )}
      </div>

    </div>
  );
}


function SwatchBtn({
  fill,
  label,
  active,
  onClick,
  disabled,
}: {
  fill: string;
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-9 shrink-0 items-center gap-1 border-b-2 px-1.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:px-2 ${
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted hover:border-rule hover:text-foreground"
      }`}
    >
      <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden>
        <circle
          cx={6} cy={6} r={3.5}
          fill={active ? "currentColor" : fill}
          strokeWidth={0}
        />
      </svg>
      {label}
    </button>
  );
}
