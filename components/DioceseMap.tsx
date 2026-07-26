"use client";

// ============================================================================
// DioceseMap — the geography of the record: every US Catholic diocese, shaded
// by how much of its documented Lithuanian parish network is now closed.
// Boundaries: US Census counties (public domain) merged per diocese via the
// public-domain crosswalk (github.com/kburchfiel/us_diocese_mapper), pre-
// projected to the same 975x610 frame as the homepage map.
// Sequential single-hue shading (loss maroon), per the dataviz color rules.
// ============================================================================

import { useState } from "react";
import overlay from "@/data/diocese-overlay.json";

export interface DioceseMapCounts {
  /** Keyed by short diocese name ("Chicago", "Scranton"…). */
  [shortName: string]: { total: number; closed: number; alive: number };
}

interface OverlayDiocese {
  name: string;
  path: string;
  cx: number;
  cy: number;
  counties: number;
}

const LABEL_MIN_PARISHES = 8;

/** Hand-placed label nudges for the dense Northeast corridor (map-label
 *  craft: collisions are resolved by eye, not formula). [dx, dy] in frame px. */
const LABEL_OFFSET: Record<string, [number, number]> = {
  Scranton: [-30, -14],
  Newark: [26, 14],
  Allentown: [-34, 16],
  Boston: [24, -12],
  Pittsburgh: [-6, 12],
};

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function DioceseMap({ counts }: { counts: DioceseMapCounts }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const dioceses = (overlay.dioceses as OverlayDiocese[]).map((d) => ({
    ...d,
    stats: counts[d.name] ?? null,
  }));
  const inRecord = dioceses.filter((d) => d.stats);

  const hov = hovered
    ? dioceses.find((d) => d.name === hovered) ?? null
    : null;

  return (
    <div>
      {/* Hover readout — fixed height so the map doesn't jump */}
      <div className="min-h-6 mb-1.5 text-sm" aria-live="polite">
        {hov ? (
          <span>
            <span className="font-serif font-semibold">
              {hov.stats ? hov.name : hov.name}
            </span>
            <span className="text-muted">
              {hov.stats
                ? ` — ${hov.stats.total} Lithuanian ${
                    hov.stats.total === 1 ? "parish" : "parishes"
                  } documented · ${hov.stats.closed} closed${
                    hov.stats.alive === 0 ? " · none remain active" : ` · ${hov.stats.alive} active`
                  }`
                : " — no Lithuanian parish in the record"}
            </span>
          </span>
        ) : (
          <span className="text-muted">
            Darker red = a larger share of the diocese&rsquo;s Lithuanian
            parishes closed. Hover for detail; click a diocese to jump to its
            parishes.
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${overlay.frame.w} ${overlay.frame.h}`}
        className="w-full h-auto"
        role="img"
        aria-label="US map of Catholic dioceses shaded by the share of their documented Lithuanian parishes now closed"
      >
        {/* Diocese fills */}
        {dioceses.map((d) => {
          const share = d.stats && d.stats.total > 0 ? d.stats.closed / d.stats.total : 0;
          const isHov = hovered === d.name;
          return (
            <path
              key={d.name}
              d={d.path}
              fill={d.stats ? "var(--es-closed)" : "var(--muted)"}
              fillOpacity={d.stats ? 0.1 + 0.72 * share : 0.04}
              stroke={isHov ? "var(--foreground)" : "none"}
              strokeWidth={isHov ? 1.2 : 0}
              className={d.stats ? "cursor-pointer" : undefined}
              onMouseEnter={() => setHovered(d.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => {
                if (!d.stats) return;
                document
                  .getElementById(`diocese-${slugify(d.name)}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <title>
                {d.stats
                  ? `${d.name}: ${d.stats.closed} of ${d.stats.total} closed${d.stats.alive === 0 ? " — none remain" : ""}`
                  : d.name}
              </title>
            </path>
          );
        })}

        {/* Interior diocese borders */}
        <path
          d={overlay.borders}
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity={0.18}
          strokeWidth={0.5}
        />

        {/* Direct labels for the dioceses that carry the record */}
        {inRecord
          .filter((d) => (d.stats?.total ?? 0) >= LABEL_MIN_PARISHES)
          .map((d) => {
            const [dx, dy] = LABEL_OFFSET[d.name] ?? [0, 0];
            const lx = d.cx + dx;
            const ly = d.cy + dy;
            return (
              <text
                key={d.name}
                x={lx}
                y={ly}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fill="var(--foreground)"
                stroke="var(--background)"
                strokeWidth={2.5}
                paintOrder="stroke"
                pointerEvents="none"
              >
                {d.name}
                <tspan
                  x={lx}
                  dy={10}
                  fontSize={8}
                  fontWeight={400}
                  fill="var(--muted)"
                >
                  {`${d.stats!.closed}/${d.stats!.total} closed`}
                </tspan>
              </text>
            );
          })}
      </svg>

      {/* Legend: sequential ramp */}
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-3 w-28 rounded-sm overflow-hidden" aria-hidden>
            {[0, 0.25, 0.5, 0.75, 1].map((s) => (
              <span
                key={s}
                className="flex-1"
                style={{ background: "var(--es-closed)", opacity: 0.1 + 0.72 * s }}
              />
            ))}
          </span>
          share of the diocese&rsquo;s Lithuanian parishes closed — none &rarr; all
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ background: "var(--muted)", opacity: 0.12 }}
            aria-hidden
          />
          no Lithuanian parish in the record
        </span>
      </div>
    </div>
  );
}
