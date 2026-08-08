"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HistoryYear } from "@/lib/history-projection";

const WIDTH = 920;
const HEIGHT = 330;
const MARGIN = { top: 34, right: 28, bottom: 42, left: 48 };

export default function HistoryAliveCurve({
  years,
}: {
  years: readonly HistoryYear[];
}) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const minYear = years[0]?.year ?? 1880;
  const maxYear = years.at(-1)?.year ?? 2026;
  const maxAlive = Math.max(...years.map((point) => point.alive), 1);
  const x = (year: number) =>
    MARGIN.left +
    ((year - minYear) / (maxYear - minYear)) *
      (WIDTH - MARGIN.left - MARGIN.right);
  const y = (alive: number) =>
    HEIGHT -
    MARGIN.bottom -
    (alive / maxAlive) * (HEIGHT - MARGIN.top - MARGIN.bottom);
  const path = years
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(point.year)},${y(point.alive)}`)
    .join(" ");
  const eventYears = useMemo(
    () => years.filter((point) => point.founded.length || point.ended.length),
    [years],
  );
  const selected = years.find(
    (point) => point.year === (selectedYear ?? 1960),
  ) ?? null;
  const yTicks = [0, 30, 60, 90, 120];
  const yearTicks = [1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020, maxYear];

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="min-w-[760px] w-full"
          role="img"
          aria-label="Line chart of dated Lithuanian Roman Catholic parishes alive in each year"
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={WIDTH - MARGIN.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--rule)"
              />
              <text
                x={MARGIN.left - 10}
                y={y(tick) + 4}
                textAnchor="end"
                fill="var(--muted)"
                className="font-mono text-ui-label"
              >
                {tick}
              </text>
            </g>
          ))}
          {[1930, 1960].map((year) => (
            <line
              key={year}
              x1={x(year)}
              x2={x(year)}
              y1={MARGIN.top}
              y2={HEIGHT - MARGIN.bottom}
              stroke="var(--foreground)"
              strokeOpacity={0.2}
              strokeDasharray="4 4"
            />
          ))}
          <path d={path} fill="none" stroke="var(--foreground)" strokeWidth={2.5} />
          {eventYears.map((point) => {
            const both = point.founded.length > 0 && point.ended.length > 0;
            const color = both
              ? "var(--mark-community)"
              : point.ended.length
                ? "var(--es-closed)"
                : "var(--foreground)";
            return (
              <circle
                key={point.year}
                cx={x(point.year)}
                cy={y(point.alive)}
                r={selected?.year === point.year ? 5.5 : 3.2}
                fill={color}
                stroke="var(--background)"
                strokeWidth={1.5}
                className="cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={`${point.year}: ${point.alive} parishes alive; ${point.founded.length} founded; ${point.ended.length} ended`}
                onClick={() => setSelectedYear(point.year)}
                onMouseEnter={() => setSelectedYear(point.year)}
                onFocus={() => setSelectedYear(point.year)}
              />
            );
          })}
          {yearTicks.map((tick, index) => (
            <text
              key={`${tick}-${index}`}
              x={x(tick)}
              y={HEIGHT - 15}
              textAnchor="middle"
              fill="var(--muted)"
              className="font-mono text-ui-label"
            >
              {tick}
            </text>
          ))}
          <text
            x={MARGIN.left}
            y={18}
            fill="var(--muted)"
            className="font-sans text-ui-label uppercase"
          >
            parishes alive
          </text>
        </svg>
      </div>

      <div className="mt-3 grid gap-4 border-t border-rule pt-4 md:grid-cols-[12rem_1fr_1fr]">
        <div>
          <p className="font-mono text-ui-label uppercase tracking-widest text-muted">
            {selected ? selected.year : "Select a point"}
          </p>
          {selected ? (
            <p className="mt-1 font-serif text-section-title font-semibold">
              {selected.alive} parishes alive
            </p>
          ) : null}
        </div>
        <EventList title="Founded" entries={selected?.founded ?? []} />
        <EventList title="Institutional ending" entries={selected?.ended ?? []} />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-sans text-small-copy text-muted">
        <Key color="var(--foreground)" label="founding event" />
        <Key color="var(--es-closed)" label="ending event" />
        <Key color="var(--mark-community)" label="both in the same year" />
      </div>
    </div>
  );
}

function EventList({
  title,
  entries,
}: {
  title: string;
  entries: Readonly<HistoryYear["founded"]>;
}) {
  return (
    <div>
      <h3 className="font-sans text-ui-label font-semibold uppercase tracking-widest text-muted">
        {title} · {entries.length}
      </h3>
      {entries.length ? (
        <ul className="mt-1 space-y-1 text-support-copy">
          {entries.map((parish) => (
            <li key={parish.slug}>
              <Link href={parish.profileHref} className="underline hover:text-accent">
                {parish.name}
              </Link>{" "}
              <span className="text-muted">· {parish.city}, {parish.state}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-support-copy text-muted">No dated event.</p>
      )}
    </div>
  );
}

function Key({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
