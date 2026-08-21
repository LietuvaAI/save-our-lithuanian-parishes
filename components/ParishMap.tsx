"use client";

// The homepage map: ONE mark system across the whole record (Vilija
// 2026-07-21), colored by the canonical CultureNet infographic projection
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
// profile — the map itself reads at a glance. Mission is a record type and a
// hollow-mark treatment, never a seventh status. Current campaigns remain a
// separate ring annotation.
import { useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { geoAlbersUsa } from "d3-geo";
import mapData from "@/data/map.json";
import regData from "@/data/registry-map.json";
import alertsData from "@/data/canonical-current-events-projection.json";
import {
  usParishes,
  ENDING_MODE_LABEL,
  OWNERSHIP_LABEL,
} from "@/lib/parishes";
import {
  GROUP_DESCRIPTION,
  GROUP_LABEL,
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
import siteFigures from "@/data/site-figures.json";
import { widerCatholicLifeRecords } from "@/lib/wider-catholic-life";

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
  | "mass"
  | "unresolved"
  | "lost"
  | "transferred"
  | "unknown";
type StatusFilter = Exclude<Mode, "all">;
type CommunityFilter =
  | "roman_catholic"
  | "national_catholic_pncc"
  | "non_catholic_christian";
type MapKey = EndStateGroup;

const STATUS_FILTERS: StatusFilter[] = [
  "open",
  "mass",
  "unresolved",
  "transferred",
  "lost",
  "unknown",
];
const COMMUNITY_FILTERS: CommunityFilter[] = [
  "roman_catholic",
  "national_catholic_pncc",
  "non_catholic_christian",
];

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
  // Canonical terminal-site summary for closed institutions. This is an
  // institution-level projection, not a count of every historical building.
  fate:
    | "demolished"
    | "repurposed"
    | "standing"
    | "listed_for_sale"
    | "not_established"
    | null;
  widerClassification?: string;
}

function communityFilterForPoint(point: Point): CommunityFilter {
  if (
    point.congregationClass === "national_catholic_pncc" ||
    point.congregationClass === "independent_catholic"
  ) {
    return "national_catholic_pncc";
  }
  if (point.congregationClass === "non_catholic_christian") {
    return "non_catholic_christian";
  }
  return "roman_catholic";
}

function statusFilterForPoint(point: Point): StatusFilter {
  if (point.group === "active_parish") return "open";
  if (point.group === "mass_continues") return "mass";
  if (point.group === "unresolved") return "unresolved";
  if (point.group === "closed") return "lost";
  if (point.group === "transferred") return "transferred";
  return "unknown";
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
  if (point.widerClassification) return point.widerClassification;
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
const contextFoundedBySlug = new Map(
  (contextPoints.points as { slug: string; founded: number | null }[]).map(
    (c) => [c.slug, c.founded],
  ),
);
const contextClosedBySlug = new Map(
  (contextPoints.points as { slug: string; closed: number | null }[]).map(
    (c) => [c.slug, c.closed],
  ),
);
const contextBuildingFateBySlug = new Map(
  (contextPoints.points as {
    slug: string;
    buildingFate:
      | "demolished"
      | "repurposed"
      | "standing"
      | "listed_for_sale"
      | null;
  }[]).map((c) => [c.slug, c.buildingFate]),
);

function canonicalClosedFate(slug: string, group: EndStateGroup): Point["fate"] {
  if (group !== "closed") return null;
  return contextBuildingFateBySlug.get(slug) ?? "not_established";
}

// Build alert lookup: slug → {kind, whatChanged}
type AlertKind = RecordSignal;
const alertBySlug = new Map<string, { kind: AlertKind; whatChanged: string }>(
  (alertsData.alerts as { parishLink?: string; kind?: string; whatChanged: string }[])
    .filter((a): a is { parishLink: string; kind?: string; whatChanged: string } =>
      Boolean(a.parishLink),
    )
    .map((a) => [
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

    const group = contextGroupBySlug.get(p.slug) as EndStateGroup;
    if (!group) {
      throw new Error(`${p.slug}: map point is missing canonical context`);
    }
    const status: Status = GROUP_STATUS[group];
    const fate = canonicalClosedFate(p.slug, group);

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
      founded: contextFoundedBySlug.get(p.slug) ?? null,
      closed: contextClosedBySlug.get(p.slug) ?? null,
      profile: contextHrefBySlug.get(p.slug) ?? `/parishes/${p.slug}`,
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
    const fate = canonicalClosedFate(c.slug, group);

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
      founded: contextFoundedBySlug.get(c.slug) ?? c.foundedYear ?? null,
      closed: contextClosedBySlug.get(c.slug) ?? c.closedYear ?? null,
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

const widerProjection = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const WIDER_CATHOLIC_LIFE_POINTS: Point[] = widerCatholicLifeRecords.flatMap(
  (record) => {
    const projected = widerProjection([record.geo.lon, record.geo.lat]);
    if (!projected) return [];
    return [
      {
        id: record.slug,
        name: record.nameLt,
        city: record.city,
        state: record.state,
        x: projected[0],
        y: projected[1],
        status: "unknown",
        group: "unverified",
        alerted: false,
        signalKind: null,
        alertText: null,
        founded: null,
        closed: null,
        profile: record.href,
        deep: true,
        detail: "Separate wider Catholic-life record",
        kindLabel:
          "Outside the 155-institution census and the regular 14-place worship network",
        congregationClass: null,
        recordType: null,
        fate: null,
        widerClassification: record.classificationLabel,
      },
    ];
  },
);

const mapCommunityCounts = {
  romanCatholic: POINTS.filter(
    (point) => communityFilterForPoint(point) === "roman_catholic",
  ).length,
  nationalIndependent: POINTS.filter(
    (point) => communityFilterForPoint(point) === "national_catholic_pncc",
  ).length,
  protestant: POINTS.filter(
    (point) => communityFilterForPoint(point) === "non_catholic_christian",
  ).length,
};
const mapStatusCounts = {
  active_parish: POINTS.filter((point) => point.group === "active_parish")
    .length,
  mass_continues: POINTS.filter((point) => point.group === "mass_continues")
    .length,
  unresolved: POINTS.filter((point) => point.group === "unresolved").length,
  transferred: POINTS.filter((point) => point.group === "transferred").length,
  closed: POINTS.filter((point) => point.group === "closed").length,
  unverified: POINTS.filter((point) => point.group === "unverified").length,
};
const publishedUnresolvedCount =
  "unresolved" in siteFigures.publicUS.institutionStatus
    ? siteFigures.publicUS.institutionStatus.unresolved
    : 0;

if (
  POINTS.length !== siteFigures.publicUS.records ||
  mapCommunityCounts.romanCatholic !==
    siteFigures.publicUS.romanCatholicInstitutions ||
  mapCommunityCounts.nationalIndependent !==
    siteFigures.publicUS.nationalIndependentCatholicCommunities ||
  mapCommunityCounts.protestant !== siteFigures.publicUS.protestantCommunities ||
  mapStatusCounts.active_parish !==
    siteFigures.publicUS.institutionStatus.active_parish ||
  mapStatusCounts.mass_continues !==
    siteFigures.publicUS.institutionStatus.mass_continues ||
  mapStatusCounts.unresolved !== publishedUnresolvedCount ||
  mapStatusCounts.transferred !==
    siteFigures.publicUS.institutionStatus.transferred ||
  mapStatusCounts.closed !== siteFigures.publicUS.institutionStatus.closed ||
  mapStatusCounts.unverified !==
    siteFigures.publicUS.institutionStatus.unverified
) {
  throw new Error(
    "Homepage institution-map populations do not match site-figures.json",
  );
}
if (WIDER_CATHOLIC_LIFE_POINTS.length !== 3) {
  throw new Error("Homepage wider Catholic-life map layer must contain three records");
}

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
    leaveTimer.current = setTimeout(() => setHovered(null), 140);
  }
  const [selectedStatuses, setSelectedStatuses] = useState<Set<StatusFilter>>(
    () => new Set(STATUS_FILTERS),
  );
  // Sub-filter inside the Closed view — same sub-fates as the flow chart.
  const [lostFate, setLostFate] = useState<
    | "all"
    | "demolished"
    | "repurposed"
    | "standing"
    | "listed_for_sale"
    | "not_established"
  >("all");
  // The homepage opens on the complete public census. Visitors can narrow to
  // Roman Catholic, National/Independent Catholic, or Protestant records from
  // the key, but the first view must match the 155-institution route contract.
  const [selectedCommunities, setSelectedCommunities] = useState<
    Set<CommunityFilter>
  >(() => new Set(COMMUNITY_FILTERS));
  const [view, setView] = useState<View>(FULL);
  const [showDioceses, setShowDioceses] = useState(false);
  const [showWiderCatholicLife, setShowWiderCatholicLife] = useState(true);
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
      POINTS.filter((point) =>
        selectedCommunities.has(communityFilterForPoint(point)),
      ),
    [selectedCommunities],
  );
  const communityCounts = useMemo(
    () => ({
      all: POINTS.length,
      roman_catholic: POINTS.filter(
        (point) =>
          (point.congregationClass ?? "roman_catholic") === "roman_catholic",
      ).length,
      roman_catholic_parishes: POINTS.filter(
        (point) =>
          (point.congregationClass ?? "roman_catholic") ===
            "roman_catholic" && point.recordType === "parish",
      ).length,
      roman_catholic_missions: POINTS.filter(
        (point) =>
          (point.congregationClass ?? "roman_catholic") ===
            "roman_catholic" && point.recordType === "misija",
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
      mass: 0,
      unresolved: 0,
      lost: 0,
      unknown: 0,
      transferred: 0,
    };
    for (const p of classPoints) {
      if (p.group === "active_parish") c.open++;
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
    }),
    [classPoints],
  );
  const selectedScope =
    selectedCommunities.size === 1 &&
    selectedCommunities.has("roman_catholic")
      ? `${recordTypeCounts.parish} Roman Catholic parishes + ${recordTypeCounts.mission} missions`
      : selectedCommunities.size === 1 &&
          selectedCommunities.has("national_catholic_pncc")
        ? `${statusCounts.all} National or independent Catholic parish records`
        : selectedCommunities.size === 1 &&
            selectedCommunities.has("non_catholic_christian")
          ? `${statusCounts.all} Protestant parish and congregation records`
          : `${statusCounts.all} selected parish, mission, and congregation records`;
  const activeStatusLabel =
    selectedCommunities.size === 1 &&
    selectedCommunities.has("roman_catholic")
      ? "Active Lithuanian parish or mission"
      : selectedCommunities.size === 1 &&
          selectedCommunities.has("non_catholic_christian")
        ? "Active Lithuanian congregation"
        : selectedCommunities.size === 1 &&
            selectedCommunities.has("national_catholic_pncc")
          ? "Active Lithuanian parish"
          : "Active Lithuanian community";

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

  function selectCommunity(filter: CommunityFilter | "all") {
    setSelectedCommunities(
      filter === "all" ? new Set(COMMUNITY_FILTERS) : new Set([filter]),
    );
  }

  function selectStatus(filter: StatusFilter) {
    setSelectedStatuses((current) =>
      current.size === 1 && current.has(filter)
        ? new Set(STATUS_FILTERS)
        : new Set([filter]),
    );
    if (filter === "lost") setLostFate("all");
  }

  function selectAllStatuses() {
    setSelectedStatuses(new Set(STATUS_FILTERS));
    setLostFate("all");
  }

  function resetFilters() {
    setSelectedCommunities(new Set(COMMUNITY_FILTERS));
    setSelectedStatuses(new Set(STATUS_FILTERS));
    setLostFate("all");
    setShowWiderCatholicLife(true);
  }

  const markR = 6 / Math.sqrt(zoom);
  const btn = "rounded-md border border-rule bg-background px-2.5 py-1 text-body-copy font-medium hover:border-foreground transition-colors";

  const statusFiltered = classPoints.filter((point) => {
    const status = statusFilterForPoint(point);
    if (!selectedStatuses.has(status)) return false;
    return !(
      status === "lost" &&
      lostFate !== "all" &&
      point.fate !== lostFate
    );
  });

  const visible = statusFiltered;
  const allStatusesSelected = selectedStatuses.size === STATUS_FILTERS.length;
  const allCommunitiesSelected =
    selectedCommunities.size === COMMUNITY_FILTERS.length;
  const closedOnly =
    selectedStatuses.size === 1 && selectedStatuses.has("lost");
  const filtersActive =
    !allCommunitiesSelected ||
    !allStatusesSelected ||
    lostFate !== "all" ||
    !showWiderCatholicLife;

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-rule">
        {/* How each closure ended — sub-fates, same vocabulary as the flow chart */}
        {closedOnly && (() => {
          const lostPts = classPoints.filter((p) => p.group === "closed");
          const n = (f: Exclude<Point["fate"], null>) =>
            lostPts.filter((p) => p.fate === f).length;
          const sub = (
            key:
              | "all"
              | "demolished"
              | "repurposed"
              | "standing"
              | "listed_for_sale"
              | "not_established",
            label: string,
          ) => (
            <button
              key={key}
              type="button"
              className={`rounded-md px-2.5 py-1 text-small-copy font-medium transition-colors ${
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
            <div className="flex flex-wrap items-center gap-1.5 border-b border-rule px-3 py-2 text-small-copy sm:px-4">
              <span className="text-muted uppercase tracking-wide">How each closure ended:</span>
              {sub("all", `All · ${lostPts.length}`)}
              {sub("demolished", `Church demolished × · ${n("demolished")}`)}
              {sub("repurposed", `Church repurposed · ${n("repurposed")}`)}
              {sub("standing", `Church standing · ${n("standing")}`)}
              {n("listed_for_sale") > 0 &&
                sub("listed_for_sale", `Listed for sale · ${n("listed_for_sale")}`)}
              {sub(
                "not_established",
                `Condition not established · ${n("not_established")}`,
              )}
            </div>
          );
        })()}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
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
            const r =
              p.signalKind || p.status === "unresolved"
                ? markR * 1.15
                : markR;
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
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: active ? "scale(1.35)" : "scale(1)",
                  transition: "transform 140ms ease-out",
                }}
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

          {showWiderCatholicLife &&
            WIDER_CATHOLIC_LIFE_POINTS.map((p) => {
              const active = hovered?.id === p.id;
              const record = widerCatholicLifeRecords.find(
                (candidate) => candidate.slug === p.id,
              );
              const hollow =
                record?.classification === "occasional_worship_community";
              const fill = hollow
                ? "var(--background)"
                : "var(--foreground)";
              const stroke = hollow
                ? "var(--mark-community)"
                : "var(--background)";
              const r = markR * 1.25;
              return (
                <g
                  key={p.id}
                  onMouseEnter={() => dotEnter(p)}
                  onMouseLeave={dotLeave}
                  onFocus={() => dotEnter(p)}
                  onBlur={dotLeave}
                  onClick={() => openPoint(p)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") openPoint(p);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.name}, ${p.city} ${p.state} — ${pointStatusLabel(p)}. Open its record.`}
                  className="cursor-pointer focus:outline-none"
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    transform: active ? "scale(1.35)" : "scale(1)",
                    transition: "transform 140ms ease-out",
                  }}
                >
                  <path
                    d={`M ${p.x} ${p.y - r * 1.2} L ${p.x + r} ${p.y + r * 0.8} L ${p.x - r} ${p.y + r * 0.8} Z`}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={hollow ? markR * 0.34 : markR * 0.18}
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
            const opensRight = lx < 50;
            return (
              <div
                className="map-hover-card pointer-events-none absolute z-10 rounded-lg border border-rule bg-background/95 px-3.5 py-2.5 text-body-copy shadow-lg sm:w-72"
                style={{
                  "--map-hover-x": `${lx}%`,
                  "--map-hover-y": `${Math.min(Math.max(ly, 25), 75)}%`,
                  "--map-hover-shift": opensRight
                    ? "20px"
                    : "calc(-100% - 20px)",
                } as CSSProperties}
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
                    {hovered.fate === "repurposed" && " — church repurposed"}
                    {hovered.fate === "standing" && " — church standing"}
                    {hovered.fate === "listed_for_sale" && " — listed for sale"}
                    {hovered.fate === "not_established" &&
                      " — terminal-site condition not established"}
                  </span>
                  {hovered.alerted && <span className="text-muted text-small-copy">— active campaign</span>}
                  <span className="text-muted">
                    {hovered.founded ? ` · founded ${hovered.founded}` : ""}
                    {hovered.closed ? `, lost ${hovered.closed}` : ""}
                  </span>
                </div>
                {hovered.alertText && (
                  <p className="mt-1.5 text-small-copy leading-relaxed text-muted border-t border-rule pt-1.5">
                    {hovered.alertText}
                  </p>
                )}
                {hovered.detail && (
                  <div className="text-muted text-small-copy mt-0.5">{hovered.detail}</div>
                )}
                {hovered.kindLabel && (
                  <div className="text-muted text-small-copy mt-0.5">{hovered.kindLabel}</div>
                )}
                <div className="text-muted text-small-copy mt-0.5">
                  {hovered.deep
                    ? "Detailed profile and sources available"
                    : "Basic profile — sources are still limited"}
                </div>
                {hovered.profile && (
                  <div className="mt-1.5 font-medium">Click the marker to open its profile →</div>
                )}
              </div>
            );
          })()}
          </div>

          <aside
            className="order-1 border-b border-rule px-3 py-3 sm:px-4 lg:order-2 lg:border-b-0 lg:border-l"
            aria-label="Map key and filters"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-ui-label font-medium uppercase tracking-widest text-muted">
                Map key
              </p>
              <div className="text-right">
                {filtersActive && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mb-1 rounded-md border border-rule px-2 py-1 text-ui-label font-medium text-foreground transition-colors hover:border-foreground hover:bg-band"
                  >
                    Reset filters
                  </button>
                )}
                <span className="block text-ui-label text-muted" aria-live="polite">
                  {visible.length} census records shown
                  {showWiderCatholicLife
                    ? ` + ${WIDER_CATHOLIC_LIFE_POINTS.length} wider records`
                    : ""}
                </span>
              </div>
            </div>

            <div className="mt-2.5 border-t border-rule pt-2.5 text-small-copy">
              <button
                type="button"
                aria-pressed={showWiderCatholicLife}
                onClick={() => setShowWiderCatholicLife((shown) => !shown)}
                className={`flex w-full items-center justify-between gap-3 rounded-md border px-2.5 py-2 text-left transition-colors ${
                  showWiderCatholicLife
                    ? "border-foreground bg-band text-foreground"
                    : "border-rule text-muted hover:border-foreground hover:text-foreground"
                }`}
              >
                <span>
                  <span className="font-medium">Wider Catholic life · 3</span>
                  <span className="mt-0.5 block text-ui-label font-normal text-muted">
                    2 religious houses + 1 occasional community
                  </span>
                </span>
                <span className="flex items-center gap-1.5" aria-hidden>
                  <span className="h-3 w-3 [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-foreground" />
                  <span className="relative h-3 w-3">
                    <span className="absolute inset-0 [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-[#b08b33]" />
                    <span className="absolute inset-[2px] [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-background" />
                  </span>
                </span>
              </button>
              <p className="mt-1.5 text-ui-label leading-relaxed text-muted">
                Separate from the 155-institution census and regular 14-place
                worship network.
              </p>
            </div>

            <div
              className="mt-2.5 text-small-copy"
              role="group"
              aria-label="Filter by community"
            >
              <p className="text-ui-label font-semibold uppercase tracking-wide text-muted">
                Community
              </p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  aria-pressed={allCommunitiesSelected}
                  onClick={() => selectCommunity("all")}
                  className={`flex min-h-8 items-center gap-2 rounded-md border px-2 py-1.5 text-left text-ui-label font-medium transition-colors ${
                    allCommunitiesSelected
                      ? "border-foreground bg-band text-foreground"
                      : "border-rule text-muted hover:border-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex h-3.5 w-3.5 items-center justify-center" aria-hidden>
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground" />
                  </span>
                  <span>All · {communityCounts.all}</span>
                </button>
                {(
                  [
                    {
                      key: "roman_catholic",
                      label: "Roman Catholic",
                      shape: "circle",
                    },
                    {
                      key: "national_catholic_pncc",
                      label: "National & independent",
                      shape: "diamond",
                    },
                    {
                      key: "non_catholic_christian",
                      label: "Protestant",
                      shape: "square",
                    },
                  ] as {
                    key: CommunityFilter;
                    label: string;
                    shape: "circle" | "diamond" | "square";
                  }[]
                ).map(({ key, label, shape }) => {
                  const active =
                    !allCommunitiesSelected && selectedCommunities.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectCommunity(key)}
                      className={`flex min-h-8 items-center gap-2 rounded-md border px-2 py-1.5 text-left text-ui-label leading-tight transition-colors ${
                        active
                          ? "border-foreground bg-band font-medium text-foreground"
                          : "border-rule text-muted hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center" aria-hidden>
                        <span
                          className={`h-2.5 w-2.5 bg-foreground ${
                            shape === "circle"
                              ? "rounded-full"
                              : shape === "diamond"
                                ? "rotate-45"
                                : "rounded-[1px]"
                          }`}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        {key === "roman_catholic" ? (
                          <>
                            {label}
                            <span className="block text-ui-label font-normal text-muted">
                              {communityCounts.roman_catholic_parishes} parishes
                              {" + "}
                              {communityCounts.roman_catholic_missions} missions
                            </span>
                          </>
                        ) : (
                          <>
                            {label} · {communityCounts[key]}
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="mt-2.5 border-t border-rule pt-2.5 text-small-copy"
              role="group"
              aria-label="Filter by status"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-ui-label font-semibold uppercase tracking-wide text-muted">
                  Status
                </p>
                <button
                  type="button"
                  aria-pressed={allStatusesSelected}
                  onClick={selectAllStatuses}
                  className={`rounded-md px-2 py-1 text-ui-label font-medium transition-colors ${
                    allStatusesSelected
                      ? "bg-foreground text-background"
                      : "text-muted hover:bg-band hover:text-foreground"
                  }`}
                >
                  All statuses
                </button>
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {(
                [
                  {
                    key: "active_parish",
                    mode: "open",
                    label: activeStatusLabel,
                    description:
                      "Regular Lithuanian worship continues in an active Lithuanian-led parish, mission, or congregation. Mission records use a hollow map mark; record type never becomes a separate status.",
                    fill: "var(--es-active)",
                    count: statusCounts.open,
                  },
                  {
                    key: "mass_continues",
                    mode: "mass",
                    label: "Institution histories with Lithuanian Mass",
                    description:
                      "Five of the 137 Lithuanian Catholic institutions now hold Lithuanian Mass within a merged or host parish. The current network also includes Washington Epiphany, which was never a Lithuanian parish or mission.",
                    fill: "var(--es-mass)",
                    count: statusCounts.mass,
                  },
                  {
                    key: "unresolved",
                    mode: "unresolved",
                    label: GROUP_LABEL.unresolved,
                    description: GROUP_DESCRIPTION.unresolved,
                    fill: "var(--mark-ink)",
                    count: statusCounts.unresolved,
                  },
                  {
                    key: "transferred",
                    mode: "transferred",
                    label: GROUP_LABEL.transferred,
                    description: GROUP_DESCRIPTION.transferred,
                    fill: "var(--es-transferred)",
                    count: statusCounts.transferred,
                  },
                  {
                    key: "closed",
                    mode: "lost",
                    label: GROUP_LABEL.closed,
                    description:
                      selectedCommunities.size === 1 &&
                      selectedCommunities.has("roman_catholic")
                        ? `${recordTypeCounts.closedParish} parishes and ${recordTypeCounts.closedMission} missions are closed. Filter to Closed to see whether each terminal church was demolished, repurposed, listed, standing, or not yet established.`
                        : GROUP_DESCRIPTION.closed,
                    fill: "var(--es-closed)",
                    count: statusCounts.lost,
                  },
                  {
                    key: "unverified",
                    mode: "unknown",
                    label: GROUP_LABEL.unverified,
                    description: GROUP_DESCRIPTION.unverified,
                    fill: "var(--muted)",
                    count: statusCounts.unknown,
                  },
                ] satisfies {
                  key: MapKey;
                  mode: Exclude<Mode, "all">;
                  label: string;
                  description: string;
                  fill: string;
                  count: number;
                }[]
              )
                .filter(({ count }) => count > 0)
                .map(({ key, mode: itemMode, label, description, fill, count }) => {
                  const expanded = expandedKey === key;
                  const active =
                    selectedStatuses.size === 1 &&
                    selectedStatuses.has(itemMode);
                  const detailId = `map-key-detail-${key}`;
                  return (
                    <div
                      key={key}
                      className={`relative min-w-0 rounded-md text-ui-label ${
                        expanded ? "col-span-2" : ""
                      }`}
                    >
                      <div className="relative">
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => selectStatus(itemMode)}
                          className={`flex min-h-8 w-full min-w-0 items-center gap-2 rounded-md border py-1.5 pl-2 pr-7 text-left leading-tight transition-colors ${
                            active
                              ? "border-foreground bg-band text-foreground"
                              : "border-rule text-foreground hover:border-foreground"
                          }`}
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              background: fill,
                              opacity: key === "unverified" ? 0.55 : 1,
                            }}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1 font-medium">
                            {label} · {count}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-body-copy leading-none text-muted hover:bg-background hover:text-foreground"
                          aria-expanded={expanded}
                          aria-controls={detailId}
                          aria-label={`${expanded ? "Hide" : "Explain"} ${label}`}
                          title={`${expanded ? "Hide" : "Explain"} ${label}`}
                          onClick={() => setExpandedKey(expanded ? null : key)}
                        >
                          <span aria-hidden>{expanded ? "−" : "+"}</span>
                        </button>
                      </div>
                      <div
                        id={detailId}
                        className={`${expanded ? "block" : "hidden"} mt-1.5 rounded-md bg-band px-2.5 py-2 leading-relaxed text-muted`}
                      >
                        {description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2.5 border-t border-rule pt-2.5 text-small-copy">
              <div className="flex items-center justify-between gap-2">
                <p className="text-ui-label font-semibold uppercase tracking-wide text-muted">
                  Other marks
                </p>
                <button
                  type="button"
                  aria-pressed={showDioceses}
                  onClick={() => void toggleDioceses()}
                  className={`rounded-md border px-2 py-1 text-ui-label font-medium transition-colors ${
                    showDioceses
                      ? "border-foreground bg-band text-foreground"
                      : "border-rule text-muted hover:border-foreground hover:text-foreground"
                  }`}
                  title="Catholic diocese boundaries"
                >
                  Diocese lines
                </button>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-2 text-ui-label leading-tight text-muted">
                <span className="flex items-start gap-1">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-[var(--foreground)] bg-background" aria-hidden />
                  Mission or hosted Mass
                </span>
                <span className="flex items-start gap-1">
                  <span className="flex h-3 w-3 items-center justify-center rounded-full border border-[var(--mark-community)]" aria-hidden>
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--es-active)]" />
                  </span>
                  Current signal
                </span>
                <span className="flex items-start gap-1">
                  <span className="font-semibold text-foreground" aria-hidden>×</span>
                  Church demolished
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <p className="mt-2 text-small-copy leading-relaxed text-muted">
        Shown: {selectedScope}. Religious-house, cemetery, shrine, club, and
        school chapels remain outside the institutional count.{" "}
        <a href="/about-the-data" className="underline hover:text-foreground">
          What is included →
        </a>
      </p>

      {/* Caption */}
      <div className="mt-2 min-h-9 border-t border-rule pt-2.5 text-body-copy">
        {selectedStatuses.size === 1 &&
        selectedStatuses.has("mass") ? (
          <span className="text-muted">
            {statusCounts.mass} of the institutions shown on this map now hold
            Lithuanian Mass within a merged or host parish. Immaculate
            Conception in Chicago, for example, was founded as a Lithuanian
            parish in 1914 and merged into a multiethnic parish in 2019; its
            church still hosts weekly Lithuanian Mass. The current network has
            a sixth hosted-Mass community at Washington Epiphany, which was
            never a Lithuanian parish or mission and is therefore not one of
            the 155 institution marks. {" "}
            <Link
              href="/lithuanian-catholic-life-today"
              className="font-medium text-foreground underline underline-offset-2"
            >
              See the full living network →
            </Link>
          </span>
        ) : selectedStatuses.size === 1 &&
          selectedStatuses.has("unresolved") ? (
          <span className="text-muted">
            {statusCounts.unresolved} institutions whose outcome remains contested
            or canonically undecided. Open a mark for details and sources.
          </span>
        ) : closedOnly ? (
          <span className="text-muted">
            {statusCounts.lost} institutions in the Closed category. Hover any
            mark; click to open its profile.{" "}
            <Link href="/parishes" className="underline hover:text-foreground font-medium">
              Browse all parish profiles →
            </Link>
          </span>
        ) : selectedStatuses.size === 1 &&
          selectedStatuses.has("unknown") ? (
          <span className="text-muted">
            The present status of {statusCounts.unknown} institutions has not yet
            been established. Open a mark for the available details and sources.
          </span>
        ) : !allStatusesSelected ? (
          <span className="text-muted">
            {visible.length} institutions match the selected community and status
            filters. Hover any mark; click to open its profile.
          </span>
        ) : (
          <span className="text-muted">
            One map — every published parish, mission, and congregation. Hover
            any mark; click to open its profile.
          </span>
        )}
      </div>

    </div>
  );
}
