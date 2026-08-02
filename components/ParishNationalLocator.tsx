import contextPoints from "@/data/context-points.json";
import mapData from "@/data/map.json";

interface LocatorPoint {
  slug: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
}

const VIEW_BOX = "0 -18 975 628";

export default function ParishNationalLocator({ slug }: { slug: string }) {
  const subject = (contextPoints.points as LocatorPoint[]).find(
    (point) => point.slug === slug,
  );

  if (!subject) return null;

  return (
    <figure data-profile-national-locator className="mt-5 border-t border-rule pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.15em] text-muted">
          Where in the United States
        </p>
        <p className="shrink-0 text-xs text-muted">
          {subject.city}, {subject.state}
        </p>
      </div>
      <svg
        viewBox={VIEW_BOX}
        className="mt-2 h-28 w-full"
        role="img"
        aria-label={`${subject.name} in ${subject.city}, ${subject.state}, within the United States`}
      >
        {mapData.statePaths.map((path, index) => (
          <path key={index} d={path} fill="var(--band)" />
        ))}
        <path
          d={mapData.stateBorders}
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity={0.3}
          strokeWidth={1.15}
        />
        <circle
          cx={subject.x}
          cy={subject.y}
          r={14}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={3}
          opacity={0.42}
        />
        <circle
          cx={subject.x}
          cy={subject.y}
          r={6.5}
          fill="var(--accent)"
          stroke="var(--background)"
          strokeWidth={2.5}
        >
          <title>{`${subject.name} — ${subject.city}, ${subject.state}`}</title>
        </circle>
      </svg>
    </figure>
  );
}
