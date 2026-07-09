"use client";

import { useMemo, useRef, useState } from "react";
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

const FULL = { x: 0, y: 0, w: 975, h: 610 };
const MAX_ZOOM = 10;

const NE_STATES = new Set(["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA", "MD"]);

type View = { x: number; y: number; w: number; h: number };

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
  const [hovered, setHovered] = useState<Parish | null>(null);
  const [view, setView] = useState<View>(FULL);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ px: number; py: number } | null>(null);

  const zoom = FULL.w / view.w;

  // Northeast preset framed from the actual points.
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
    // Preserve aspect ratio of the full frame.
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
    drag.current = { px: e.clientX, py: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = view.w / rect.width;
    const dx = (e.clientX - drag.current.px) * scale;
    const dy = (e.clientY - drag.current.py) * scale;
    drag.current = { px: e.clientX, py: e.clientY };
    setView((v) => clampView({ ...v, x: v.x - dx, y: v.y - dy }));
  }

  function onPointerUp() {
    drag.current = null;
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
          aria-label="Map of the United States showing every documented Lithuanian parish, marked by who decided its ending"
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
                r={active ? markR * 1.4 : markR}
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
      </div>

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
            parishes in the record. Hover or tap a parish; zoom into the
            Northeast where the marks cluster. Drag to pan when zoomed.
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
