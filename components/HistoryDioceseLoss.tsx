"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import overlay from "@/data/diocese-overlay.json";
import type { HistoryDiocese } from "@/lib/history-projection";

type OverlayDiocese = {
  name: string;
  path: string;
  cx: number;
  cy: number;
};

const START_YEAR = 1900;

export default function HistoryDioceseLoss({
  dioceses,
  currentYear,
}: {
  dioceses: readonly HistoryDiocese[];
  currentYear: number;
}) {
  const [year, setYear] = useState(currentYear);
  const [selectedKey, setSelectedKey] = useState("Scranton");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const byKey = useMemo(
    () => new Map(dioceses.map((diocese) => [diocese.key, diocese])),
    [dioceses],
  );
  const activeKey = hoveredKey ?? selectedKey;
  const selected = byKey.get(activeKey) ?? dioceses[0];

  const statsAt = (diocese: HistoryDiocese) => {
    const begun = diocese.parishes.filter(
      (parish) => parish.foundedYear != null && parish.foundedYear <= year,
    );
    const ended = begun.filter(
      (parish) => parish.endedYear != null && parish.endedYear <= year,
    );
    return { begun: begun.length, ended: ended.length };
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div>
      <div className="grid gap-4 border-y border-rule py-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label htmlFor="history-year" className="font-sans text-ui-label font-semibold uppercase tracking-widest">
              Watch it happen
            </label>
            <input
              id="history-year"
              type="range"
              min={START_YEAR}
              max={currentYear}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="min-w-44 flex-1 accent-[var(--accent)]"
            />
            <output className="w-12 text-right font-mono text-support-copy font-semibold">
              {year}
            </output>
            <div className="flex gap-1" aria-label="Map zoom controls">
              <MapButton label="Zoom out" onClick={() => setZoom((value) => Math.max(1, value - 0.35))}>−</MapButton>
              <MapButton label="Zoom in" onClick={() => setZoom((value) => Math.min(3.5, value + 0.35))}>+</MapButton>
              <MapButton label="Reset map" onClick={resetView}>Reset</MapButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-sm border border-rule bg-background">
            <svg
              viewBox={`0 0 ${overlay.frame.w} ${overlay.frame.h}`}
              className="h-auto w-full touch-none"
              role="img"
              aria-label={`Catholic dioceses with documented Lithuanian parishes in ${year}`}
              onPointerDown={(event) => {
                if (zoom === 1) return;
                drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!drag.current) return;
                setPan({
                  x: drag.current.panX + (event.clientX - drag.current.x) / zoom,
                  y: drag.current.panY + (event.clientY - drag.current.y) / zoom,
                });
              }}
              onPointerUp={() => { drag.current = null; }}
            >
              <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
                {(overlay.dioceses as OverlayDiocese[]).map((shape) => {
                  const diocese = byKey.get(shape.name);
                  const stats = diocese ? statsAt(diocese) : null;
                  const partial = stats && stats.begun > 0 && stats.ended > 0 && stats.ended < stats.begun;
                  const allEnded = stats && stats.begun > 0 && stats.ended === stats.begun;
                  const fill = !stats || stats.begun === 0
                    ? "var(--band)"
                    : allEnded
                      ? "var(--es-closed)"
                      : partial
                        ? "var(--mark-community)"
                        : "var(--es-active)";
                  return (
                    <path
                      key={shape.name}
                      d={shape.path}
                      fill={fill}
                      fillOpacity={!stats || stats.begun === 0 ? 0.35 : 0.82}
                      stroke={activeKey === shape.name ? "var(--foreground)" : "var(--background)"}
                      strokeWidth={activeKey === shape.name ? 2 / zoom : 0.45 / zoom}
                      className={diocese ? "cursor-pointer" : undefined}
                      onMouseEnter={() => setHoveredKey(shape.name)}
                      onMouseLeave={() => setHoveredKey(null)}
                      onClick={() => diocese && setSelectedKey(shape.name)}
                    >
                      <title>{diocese ? `${diocese.canonicalName}: ${stats?.ended ?? 0} of ${stats?.begun ?? 0} begun parishes had ended by ${year}` : shape.name}</title>
                    </path>
                  );
                })}
                <path d={overlay.borders} fill="none" stroke="var(--foreground)" strokeOpacity={0.2} strokeWidth={0.5 / zoom} />
              </g>
            </svg>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 font-sans text-small-copy text-muted">
            <Key color="var(--es-active)" label="no dated ending yet" />
            <Key color="var(--mark-community)" label="some parish life ended" />
            <Key color="var(--es-closed)" label="all begun parish life ended" />
            <Key color="var(--band)" label="none begun yet / no record" border />
          </div>
        </div>

        <aside className="border-l-0 border-rule lg:border-l lg:pl-4" aria-live="polite">
          {selected ? (
            <>
              <p className="font-mono text-ui-label uppercase tracking-widest text-muted">{year}</p>
              <h3 className="mt-1 font-serif text-subsection-title font-semibold">{selected.canonicalName}</h3>
              <p className="mt-2 font-serif text-section-title font-semibold">
                {statsAt(selected).ended} of {statsAt(selected).begun} dated histories ended
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-support-copy">
                <dt className="text-muted">All documented</dt><dd>{selected.total}</dd>
                <dt className="text-muted">Formal closures</dt><dd>{selected.formalClosed}</dd>
                <dt className="text-muted">Transferred</dt><dd>{selected.transferred}</dd>
                <dt className="text-muted">Active today</dt><dd>{selected.active}</dd>
              </dl>
            </>
          ) : null}
        </aside>
      </div>

      <div className="mt-8 space-y-6">
        {dioceses.map((diocese) => (
          <DioceseTimeline key={diocese.key} diocese={diocese} currentYear={currentYear} />
        ))}
      </div>
    </div>
  );
}

function DioceseTimeline({ diocese, currentYear }: { diocese: HistoryDiocese; currentYear: number }) {
  const left = (year: number) => `${Math.max(0, Math.min(100, ((year - 1880) / (currentYear - 1880)) * 100))}%`;
  return (
    <section className="grid gap-2 border-t border-rule pt-3 md:grid-cols-[15rem_1fr]">
      <div>
        <h3 className="font-serif text-card-title font-semibold">{diocese.canonicalName}</h3>
        <p className="mt-1 font-sans text-small-copy text-muted">
          {diocese.total} total · {diocese.formalClosed} closed · {diocese.transferred} transferred · {diocese.active} active
        </p>
      </div>
      <div className="relative min-h-12 border-b border-rule">
        {[1900, 1940, 1980, 2020].map((tick) => (
          <span key={tick} className="absolute bottom-0 top-0 border-l border-rule" style={{ left: left(tick) }}>
            <span className="absolute -bottom-5 -translate-x-1/2 font-mono text-ui-label text-muted">{tick}</span>
          </span>
        ))}
        {diocese.parishes.map((parish, index) => {
          const eventYear = parish.endedYear;
          const isActive = parish.status === "active_parish";
          const undatedEnding = !eventYear && (parish.status === "closed" || parish.status === "transferred");
          if (!eventYear && !isActive && !undatedEnding) return null;
          const x = eventYear ? left(eventYear) : "100%";
          const color = isActive ? "var(--es-active)" : parish.status === "transferred" ? "var(--mark-community)" : "var(--es-closed)";
          return (
            <Link
              key={parish.slug}
              href={parish.profileHref}
              title={`${parish.canonicalName}: ${isActive ? "active" : eventYear ? `ended ${eventYear}` : "ending year not established"}`}
              aria-label={`${parish.canonicalName}: ${isActive ? "active" : eventYear ? `ended ${eventYear}` : "ending year not established"}`}
              className="absolute size-3 -translate-x-1/2 rounded-full border-2 border-background outline-offset-1 hover:outline focus:outline"
              style={{ left: x, top: `${5 + (index % 3) * 12}px`, background: undatedEnding ? "var(--background)" : color, outlineColor: color, borderColor: undatedEnding ? color : "var(--background)", borderStyle: undatedEnding ? "dashed" : "solid" }}
            />
          );
        })}
      </div>
    </section>
  );
}

function MapButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} onClick={onClick} className="min-w-7 rounded border border-rule px-2 py-1 font-sans text-ui-label hover:border-foreground">{children}</button>;
}

function Key({ color, label, border = false }: { color: string; label: string; border?: boolean }) {
  return <span className="inline-flex items-center gap-1.5"><span className={`size-3 rounded-sm ${border ? "border border-rule" : ""}`} style={{ background: color }} />{label}</span>;
}
