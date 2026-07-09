import type { SVGProps } from "react";
import type { EndingMode } from "@/lib/parishes";

/**
 * The mark language of the „Kam priklauso bažnyčia?" infographic —
 * shape + fill carry the outcome, so the encoding survives grayscale:
 *   diocese_closed    filled deep-red circle
 *   standing          background-filled circle, ink stroke
 *   community_decided gold diamond, ink stroke
 *   undecided         background-filled circle, dashed ink stroke
 */
export function markVisual(mode: EndingMode): {
  fill: string;
  stroke: string;
  dash?: string;
} {
  switch (mode) {
    case "diocese_closed":
      return { fill: "var(--mark-closed)", stroke: "var(--mark-ink)" };
    case "community_decided":
      return { fill: "var(--mark-community)", stroke: "var(--mark-ink)" };
    case "undecided":
      return { fill: "var(--background)", stroke: "var(--mark-ink)", dash: "3 2.2" };
    case "standing":
      return { fill: "var(--background)", stroke: "var(--mark-ink)" };
  }
}

/** SVG shape for use INSIDE an existing <svg> (the map, the unit chart). */
export function MarkShape({
  mode,
  x,
  y,
  r,
  ...rest
}: { mode: EndingMode; x: number; y: number; r: number } & SVGProps<
  SVGCircleElement & SVGPolygonElement
>) {
  const v = markVisual(mode);
  const common = {
    fill: v.fill,
    stroke: v.stroke,
    strokeWidth: r * 0.22,
    strokeDasharray: v.dash,
    ...rest,
  };
  if (mode === "community_decided") {
    const d = r * 1.25;
    return (
      <polygon
        points={`${x},${y - d} ${x + d},${y} ${x},${y + d} ${x - d},${y}`}
        {...common}
      />
    );
  }
  return <circle cx={x} cy={y} r={r} {...common} />;
}

/** Standalone little icon for legends and table cells. */
export function MarkIcon({ mode, size = 14 }: { mode: EndingMode; size?: number }) {
  const half = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden
      className="inline-block shrink-0"
    >
      <MarkShape mode={mode} x={half} y={half} r={half - 2.2} />
    </svg>
  );
}
