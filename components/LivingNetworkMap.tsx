"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapData from "@/data/map.json";
import type { LivingNetworkMapPoint } from "@/lib/living-network-view";

const CHICAGO = { x: 606, y: 200, width: 52, height: 44 };
const INSET = { x: 712, y: 266, width: 140, height: 118 };
const INSET_SCALE = INSET.height / CHICAGO.height;

function pointTitle(point: LivingNetworkMapPoint) {
  return `${point.nameEn} (${point.nameLt}) — ${point.city}, ${point.state}. ${point.detail}`;
}

function MapMark({
  point,
  inset = false,
  active,
  onActivate,
}: {
  point: LivingNetworkMapPoint;
  inset?: boolean;
  active: boolean;
  onActivate: () => void;
}) {
  const x = inset
    ? INSET.x + (point.x - CHICAGO.x) * INSET_SCALE
    : point.x;
  const y = inset
    ? INSET.y + (point.y - CHICAGO.y) * INSET_SCALE
    : point.y;
  const isMission = point.kind === "active_mission";
  const isHosted = point.kind === "mass_continues";
  const isReligiousHouse = point.kind === "religious_house";
  const isWider =
    isReligiousHouse || point.kind === "occasional_worship_community";
  const radius = (inset ? 8 : 7) + (active ? 1.5 : 0);
  const fill = isMission
    ? "#fffdf9"
    : isHosted
      ? "#d5c28b"
      : isReligiousHouse
        ? "#1c1917"
        : point.kind === "occasional_worship_community"
          ? "#fffdf9"
          : "#2d6a4f";
  const stroke = isMission
    ? "#2d6a4f"
    : isHosted
      ? "#8a7a4e"
      : point.kind === "occasional_worship_community"
        ? "#8a7a4e"
        : "#fffdf9";

  const activate = () => {
    onActivate();
    document.getElementById(point.anchor)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={pointTitle(point)}
      className="cursor-pointer focus:outline-none"
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={activate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      }}
    >
      {active ? (
        <circle
          cx={x}
          cy={y}
          r={radius + 2.5}
          fill="none"
          stroke="#1c1917"
          strokeWidth="1.6"
        />
      ) : null}
      {isWider ? (
        <path
          d={`M ${x} ${y - radius} L ${x + radius} ${y + radius * 0.78} L ${x - radius} ${y + radius * 0.78} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={point.kind === "occasional_worship_community" ? 2 : 1}
        />
      ) : (
        <circle
          cx={x}
          cy={y}
          r={radius}
          fill={fill}
          stroke={stroke}
          strokeWidth={isMission ? 2 : 1}
        />
      )}
      <title>{pointTitle(point)}</title>
    </g>
  );
}

export default function LivingNetworkMap({
  regularPoints,
  widerPoints,
  placeCount,
  stateCount,
}: {
  regularPoints: LivingNetworkMapPoint[];
  widerPoints: LivingNetworkMapPoint[];
  placeCount: number;
  stateCount: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<Array<SVGPathElement | null>>([]);
  const [highlightedPaths, setHighlightedPaths] = useState<Set<number>>(
    new Set(),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const allPoints = useMemo(
    () => [...regularPoints, ...widerPoints],
    [regularPoints, widerPoints],
  );
  const activePoint = allPoints.find((point) => point.id === activeId) ?? null;
  const chicagoPoints = regularPoints.filter(
    (point) =>
      point.x >= CHICAGO.x &&
      point.x <= CHICAGO.x + CHICAGO.width &&
      point.y >= CHICAGO.y &&
      point.y <= CHICAGO.y + CHICAGO.height,
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const next = new Set<number>();
    const testPoint = svg.createSVGPoint();
    pathRefs.current.forEach((path, index) => {
      if (!path || typeof path.isPointInFill !== "function") return;
      for (const point of regularPoints) {
        testPoint.x = point.x;
        testPoint.y = point.y;
        if (path.isPointInFill(testPoint)) {
          next.add(index);
          break;
        }
      }
    });
    setHighlightedPaths(next);
  }, [regularPoints]);

  return (
    <figure>
      <h2 className="font-serif text-subsection-title font-semibold leading-tight">
        The {placeCount} worship places on the map
      </h2>
      <p className="mt-1 max-w-[60ch] text-support-copy leading-relaxed text-[#57534e]">
        Green and gold dots are the {placeCount} places with current Lithuanian
        worship; the shaded states are the {stateCount} they stand in. Triangle
        marks show the separately documented wider Catholic-life records.
      </p>
      <svg
        ref={svgRef}
        viewBox="40 120 900 270"
        role="img"
        aria-label={`${placeCount} regular Lithuanian worship places and ${widerPoints.length} wider Catholic-life records`}
        className="mt-3 h-auto w-full"
        onMouseLeave={() => setActiveId(null)}
      >
        {mapData.statePaths.map((path, index) => (
          <path
            key={index}
            ref={(node) => {
              pathRefs.current[index] = node;
            }}
            d={path}
            fill={highlightedPaths.has(index) ? "#f1e8d3" : "#faf7f1"}
            stroke={highlightedPaths.has(index) ? "#dccfae" : "#e7e2d9"}
            strokeWidth="0.7"
          />
        ))}
        <path
          d={mapData.stateBorders}
          fill="none"
          stroke="#a8a29e"
          strokeOpacity="0.45"
          strokeWidth="0.65"
        />
        {[...regularPoints, ...widerPoints].map((point) => (
          <MapMark
            key={point.id}
            point={point}
            active={point.id === activeId}
            onActivate={() => setActiveId(point.id)}
          />
        ))}
        <rect
          x={CHICAGO.x}
          y={CHICAGO.y}
          width={CHICAGO.width}
          height={CHICAGO.height}
          fill="none"
          stroke="#78716c"
          strokeWidth="0.8"
          strokeDasharray="3 2"
        />
        <line
          x1={CHICAGO.x + CHICAGO.width}
          y1={CHICAGO.y + CHICAGO.height}
          x2={INSET.x}
          y2={INSET.y + 20}
          stroke="#78716c"
          strokeWidth="0.8"
          strokeDasharray="3 2"
        />
        <rect
          x={INSET.x}
          y={INSET.y}
          width={INSET.width}
          height={INSET.height}
          fill="#fffdf9"
          stroke="#78716c"
          strokeWidth="0.8"
        />
        {chicagoPoints.map((point) => (
          <MapMark
            key={`${point.id}-inset`}
            point={point}
            inset
            active={point.id === activeId}
            onActivate={() => setActiveId(point.id)}
          />
        ))}
      </svg>
      <p className="mt-0 text-right text-ui-label text-muted">
        Inset: the Chicago area, enlarged
      </p>
      <p
        aria-live="polite"
        className="mt-1 min-h-10 text-support-copy leading-relaxed text-[#57534e]"
      >
        {activePoint
          ? pointTitle(activePoint)
          : "Hover or focus a map mark to name the place; select it to jump to its card."}
      </p>
    </figure>
  );
}
