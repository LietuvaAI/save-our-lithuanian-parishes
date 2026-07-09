"use client";

import { useState } from "react";
import mapData from "@/data/map.json";
import {
  usParishes,
  type Parish,
  type EndingMode,
  ENDING_MODE_LABEL,
  ENDING_MODE_COLOR,
  OWNERSHIP_LABEL,
  STATUS_LABEL,
} from "@/lib/parishes";

const MODE_ORDER: EndingMode[] = [
  "diocese_closed",
  "undecided",
  "community_decided",
  "standing",
];

const bySlug = new Map(usParishes.map((p) => [p.slug, p]));

export default function ParishMap() {
  const [hovered, setHovered] = useState<Parish | null>(null);

  return (
    <div>
      <svg
        viewBox={mapData.viewBox}
        role="img"
        aria-label="Map of the United States showing every documented Lithuanian parish, colored by who decided its ending"
        className="w-full h-auto"
      >
        <path
          d={mapData.nationPath}
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity={0.35}
          strokeWidth={1}
        />
        <path
          d={mapData.stateBorders}
          fill="none"
          stroke="var(--rule)"
          strokeWidth={0.8}
        />
        {mapData.points.map((pt) => {
          const parish = bySlug.get(pt.slug);
          if (!parish) return null;
          const active = hovered?.slug === parish.slug;
          return (
            <circle
              key={pt.slug}
              cx={pt.x}
              cy={pt.y}
              r={active ? 8 : 5.5}
              fill={ENDING_MODE_COLOR[parish.endingMode]}
              fillOpacity={0.9}
              stroke="var(--background)"
              strokeWidth={1}
              tabIndex={0}
              role="button"
              aria-label={`${parish.nameLt}, ${parish.city} ${parish.state} — ${ENDING_MODE_LABEL[parish.endingMode]}`}
              onMouseEnter={() => setHovered(parish)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(parish)}
              onBlur={() => setHovered(null)}
              className="cursor-pointer focus:outline-none"
            />
          );
        })}
      </svg>

      <div
        className="mt-3 min-h-14 rounded-lg border border-rule px-4 py-2.5 text-sm"
        aria-live="polite"
      >
        {hovered ? (
          <div>
            <span className="font-medium">{hovered.nameLt}</span>{" "}
            <span className="text-muted">
              — {hovered.city}, {hovered.state}
            </span>
            <div className="text-muted mt-0.5">
              {OWNERSHIP_LABEL[hovered.ownership]} ·{" "}
              {ENDING_MODE_LABEL[hovered.endingMode]}
              {hovered.endingMode === "diocese_closed" &&
                hovered.status !== "closed" &&
                ` (${STATUS_LABEL[hovered.status].toLowerCase()})`}
              {hovered.yearClosed ? ` · ${hovered.yearClosed}` : ""}
            </div>
          </div>
        ) : (
          <span className="text-muted">
            Each mark is one of the {usParishes.length} U.S. Lithuanian
            parishes in the record. Hover or tap a parish. Clustered marks
            share a city.
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {MODE_ORDER.map((mode) => (
          <span key={mode} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block size-3 rounded-full"
              style={{ background: ENDING_MODE_COLOR[mode] }}
            />
            {ENDING_MODE_LABEL[mode]}
          </span>
        ))}
      </div>
    </div>
  );
}
