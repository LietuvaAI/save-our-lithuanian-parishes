"use client";

import { useState } from "react";
import mapData from "@/data/map.json";
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

export default function ParishMap() {
  const [hovered, setHovered] = useState<Parish | null>(null);

  return (
    <div>
      <svg
        viewBox={mapData.viewBox}
        role="img"
        aria-label="Map of the United States showing every documented Lithuanian parish, marked by who decided its ending"
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
            <MarkShape
              key={pt.slug}
              mode={parish.endingMode}
              x={pt.x}
              y={pt.y}
              r={active ? 8.5 : 6}
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
            <span className="font-serif font-semibold text-base">
              {hovered.nameLt}
            </span>{" "}
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
        {ENDING_MODE_ORDER.map((mode) => (
          <span key={mode} className="inline-flex items-center gap-1.5">
            <MarkIcon mode={mode} />
            {ENDING_MODE_LABEL[mode]}
          </span>
        ))}
      </div>
    </div>
  );
}
