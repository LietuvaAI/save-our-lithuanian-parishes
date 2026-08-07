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

type RegionName = "Northeast" | "Midwest" | "South" | "West";

const REGION_STATES: Record<RegionName, Set<string>> = {
  Northeast: new Set(["CT", "ME", "MA", "NH", "RI", "VT", "NJ", "NY", "PA"]),
  Midwest: new Set([
    "IN",
    "IL",
    "MI",
    "OH",
    "WI",
    "IA",
    "KS",
    "MN",
    "MO",
    "NE",
    "ND",
    "SD",
  ]),
  South: new Set([
    "AL",
    "AR",
    "DE",
    "DC",
    "FL",
    "GA",
    "KY",
    "LA",
    "MD",
    "MS",
    "NC",
    "OK",
    "SC",
    "TN",
    "TX",
    "VA",
    "WV",
  ]),
  West: new Set([
    "AK",
    "AZ",
    "CA",
    "CO",
    "HI",
    "ID",
    "MT",
    "NV",
    "NM",
    "OR",
    "UT",
    "WA",
    "WY",
  ]),
};

const REGION_VIEW: Record<
  RegionName,
  { x: number; y: number; width: number; height: number }
> = {
  Northeast: { x: 720, y: 105, width: 255, height: 190 },
  Midwest: { x: 405, y: 105, width: 415, height: 255 },
  South: { x: 400, y: 215, width: 550, height: 380 },
  West: { x: 0, y: 120, width: 520, height: 470 },
};

function regionForState(state: string): RegionName {
  return (
    (Object.entries(REGION_STATES).find(([, states]) =>
      states.has(state),
    )?.[0] as RegionName | undefined) ?? "Northeast"
  );
}

export default function ParishNationalLocator({ slug }: { slug: string }) {
  const subject = (contextPoints.points as LocatorPoint[]).find(
    (point) => point.slug === slug,
  );

  if (!subject) return null;

  const region = regionForState(subject.state);
  const view = REGION_VIEW[region];
  const pointRadius = view.width / 48;

  return (
    <figure data-profile-national-locator className="mt-5 border-t border-rule pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.15em] text-muted">
          Where in the {region}
        </p>
        <p className="shrink-0 text-small-copy text-muted">
          {subject.city}, {subject.state}
        </p>
      </div>
      <svg
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        className="mt-2 h-28 w-full"
        role="img"
        aria-label={`${subject.name} in ${subject.city}, ${subject.state}, within the ${region} region of the United States`}
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
          r={pointRadius * 2.1}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={pointRadius * 0.42}
          opacity={0.42}
        />
        <circle
          cx={subject.x}
          cy={subject.y}
          r={pointRadius}
          fill="var(--accent)"
          stroke="var(--background)"
          strokeWidth={pointRadius * 0.4}
        >
          <title>{`${subject.name} — ${subject.city}, ${subject.state}`}</title>
        </circle>
      </svg>
    </figure>
  );
}
