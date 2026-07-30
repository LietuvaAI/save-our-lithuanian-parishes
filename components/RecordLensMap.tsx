"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import mapData from "@/data/map.json";
import type { RecordMarkShape } from "@/lib/record-mark";

export type RecordLensPoint = {
  slug: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
  href?: string | null;
  color: string;
  shape?: RecordMarkShape;
  hollow?: boolean;
  demolished?: boolean;
  ringColor?: string;
  detail?: string;
};

export type RecordLensLegendItem = {
  label: string;
  color: string;
  shape?: "circle" | "diamond" | "square" | "ring";
  hollow?: boolean;
};

function LegendMark({
  color,
  shape = "circle",
  hollow = false,
}: {
  color: string;
  shape?: RecordLensLegendItem["shape"];
  hollow?: boolean;
}) {
  if (shape === "ring") {
    return (
      <span
        aria-hidden="true"
        className="h-3 w-3 rounded-full border-2"
        style={{ borderColor: color }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`h-2.5 w-2.5 ${
        shape === "circle"
          ? "rounded-full"
          : shape === "diamond"
            ? "rotate-45"
            : "rounded-[1px]"
      }`}
      style={{
        backgroundColor: hollow ? "var(--background)" : color,
        border: hollow ? `2px solid ${color}` : undefined,
      }}
    />
  );
}

function PointMark({
  point,
  selected,
  onSelect,
}: {
  point: RecordLensPoint;
  selected: boolean;
  onSelect: () => void;
}) {
  const shape = point.shape ?? "circle";
  const fill = point.hollow ? "var(--background)" : point.color;
  const stroke = selected
    ? "var(--foreground)"
    : point.hollow
      ? point.color
      : "var(--background)";
  const strokeWidth = selected ? 3.5 : point.hollow ? 3 : 2;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${point.name}, ${point.city}, ${point.state}${
        point.detail ? ` — ${point.detail}` : ""
      }. Select for details.`}
      className="cursor-pointer focus:outline-none"
      onClick={onSelect}
      onFocus={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      {point.ringColor ? (
        <circle
          cx={point.x}
          cy={point.y}
          r="15"
          fill="none"
          stroke={point.ringColor}
          strokeWidth="3"
        />
      ) : null}
      {shape === "diamond" ? (
        <path
          d={`M ${point.x} ${point.y - 10} L ${point.x + 10} ${point.y} L ${point.x} ${point.y + 10} L ${point.x - 10} ${point.y} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ) : shape === "square" ? (
        <rect
          x={point.x - 9}
          y={point.y - 9}
          width="18"
          height="18"
          rx="1"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ) : (
        <circle
          cx={point.x}
          cy={point.y}
          r="9"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )}
      {point.demolished ? (
        <g
          stroke={point.hollow ? point.color : "var(--background)"}
          strokeWidth="2.5"
          strokeLinecap="round"
          pointerEvents="none"
        >
          <line
            x1={point.x - 4}
            y1={point.y - 4}
            x2={point.x + 4}
            y2={point.y + 4}
          />
          <line
            x1={point.x - 4}
            y1={point.y + 4}
            x2={point.x + 4}
            y2={point.y - 4}
          />
        </g>
      ) : null}
      <title>{`${point.name}, ${point.city}, ${point.state}${
        point.detail ? ` — ${point.detail}` : ""
      }`}</title>
    </g>
  );
}

export default function RecordLensMap({
  points,
  legend,
  ariaLabel,
  initialSelection,
}: {
  points: RecordLensPoint[];
  legend: RecordLensLegendItem[];
  ariaLabel: string;
  initialSelection?: string;
}) {
  const firstSlug = initialSelection ?? points[0]?.slug ?? null;
  const [selectedSlug, setSelectedSlug] = useState<string | null>(firstSlug);
  const selected = useMemo(
    () =>
      points.find((point) => point.slug === selectedSlug) ??
      points[0] ??
      null,
    [points, selectedSlug],
  );

  return (
    <figure>
      <svg
        viewBox={mapData.viewBox}
        role="img"
        aria-label={ariaLabel}
        className="h-auto w-full"
      >
        {mapData.statePaths.map((path, index) => (
          <path
            key={index}
            d={path}
            fill="var(--band)"
            stroke="var(--foreground)"
            strokeOpacity={0.2}
            strokeWidth={0.8}
          />
        ))}
        <path
          d={mapData.stateBorders}
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity={0.16}
          strokeWidth={0.8}
        />
        {points.map((point) => (
          <PointMark
            key={point.slug}
            point={point}
            selected={selected?.slug === point.slug}
            onSelect={() => setSelectedSlug(point.slug)}
          />
        ))}
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
        {legend.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <LegendMark
              color={item.color}
              shape={item.shape}
              hollow={item.hollow}
            />
            {item.label}
          </span>
        ))}
      </figcaption>
      {selected ? (
        <div
          className="mt-4 border-t border-rule pt-3 text-sm"
          aria-live="polite"
        >
          <p className="font-serif text-base font-semibold">{selected.name}</p>
          <p className="mt-0.5 text-muted">
            {selected.city}, {selected.state}
            {selected.detail ? ` · ${selected.detail}` : ""}
          </p>
          {selected.href ? (
            <Link
              href={selected.href}
              className="mt-2 inline-block font-medium underline underline-offset-2 hover:text-accent"
            >
              See profile and sources &rarr;
            </Link>
          ) : null}
        </div>
      ) : null}
    </figure>
  );
}
