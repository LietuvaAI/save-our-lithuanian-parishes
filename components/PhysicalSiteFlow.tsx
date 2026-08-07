"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  PhysicalSiteState,
  PhysicalSiteTimelineRow,
} from "@/components/PhysicalSiteTimeline";

const STATE_ORDER: PhysicalSiteState[] = [
  "standing",
  "repurposed",
  "demolished",
  "listed_for_sale",
  "not_established",
];

const STATE_LABEL: Record<PhysicalSiteState, string> = {
  standing: "Standing",
  repurposed: "Repurposed",
  demolished: "Demolished",
  listed_for_sale: "Listed for sale or redevelopment",
  not_established: "Present condition not established",
};

const STATE_SUBLABEL: Record<PhysicalSiteState, string> = {
  standing: "the building still stands",
  repurposed: "in another use",
  demolished: "the building is gone",
  listed_for_sale: "sale or redevelopment pending",
  not_established: "a research gap, not an outcome",
};

const STATE_NOTE: Record<PhysicalSiteState, string> = {
  standing:
    "These physical worship sites are documented as standing. This describes the building, not the status of the parish or mission that used it.",
  repurposed:
    "These physical worship sites survive in another use. Repurposed may mean worship by another community, housing, cultural use, or another documented purpose.",
  demolished:
    "These physical worship sites are documented as demolished. A parish may also have used earlier or later buildings that appear elsewhere in this flow.",
  listed_for_sale:
    "These physical worship sites are publicly listed for sale or redevelopment. A listing records a current condition, not a completed outcome.",
  not_established:
    "No current condition has been established for these physical worship sites. This is a research gap: it does not mean that the building has been demolished or survives.",
};

const STATE_COLOR: Record<PhysicalSiteState, string> = {
  standing: "var(--es-active)",
  repurposed: "var(--es-transferred)",
  demolished: "var(--es-closed)",
  listed_for_sale: "var(--mark-ink)",
  not_established: "var(--es-unverified)",
};

const W = 872;
const TOP = 54;
const X_DECADE = 178;
const DECADE_WIDTH = 10;
const X_STATE = 610;
const STATE_WIDTH = 12;
const DECADE_GAP = 9;
const STATE_GAP = 26;
const DECADE_LABEL_GAP = 16;
const STATE_LABEL_GAP = 34;

function decadeOf(year: number | null) {
  if (!year) return "Undated";
  return `${Math.floor(year / 10) * 10}s`;
}

const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

function declutterLabels(
  bands: { y0: number; y1: number }[],
  minimumGap: number,
  floor: number,
) {
  const positions: number[] = [];
  let previous = Number.NEGATIVE_INFINITY;
  for (const band of bands) {
    const center = Math.max(
      (band.y0 + band.y1) / 2,
      previous + minimumGap,
    );
    positions.push(center);
    previous = center;
  }
  if (positions.length && positions.at(-1)! > floor) {
    let ceiling = floor;
    for (let index = positions.length - 1; index >= 0; index -= 1) {
      positions[index] = Math.min(positions[index], ceiling);
      ceiling = positions[index] - minimumGap;
    }
  }
  return positions;
}

export default function PhysicalSiteFlow({
  sites,
}: {
  sites: PhysicalSiteTimelineRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hot, setHot] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const model = useMemo(() => {
    const decades = new Map<string, PhysicalSiteTimelineRow[]>();
    for (const site of sites) {
      const key = decadeOf(site.firstYear);
      if (!decades.has(key)) decades.set(key, []);
      decades.get(key)!.push(site);
    }
    const decadeKeys = [...decades.keys()].sort((left, right) => {
      if (left === "Undated") return 1;
      if (right === "Undated") return -1;
      return Number.parseInt(left) - Number.parseInt(right);
    });
    for (const key of decadeKeys) {
      decades
        .get(key)!
        .sort(
          (left, right) =>
            STATE_ORDER.indexOf(left.state) -
              STATE_ORDER.indexOf(right.state) ||
            left.name.localeCompare(right.name),
        );
    }

    const stateKeys = STATE_ORDER.filter((state) =>
      sites.some((site) => site.state === state),
    );
    const states = new Map<PhysicalSiteState, PhysicalSiteTimelineRow[]>();
    for (const state of stateKeys) states.set(state, []);
    for (const site of sites) states.get(site.state)?.push(site);
    const decadeIndex = (site: PhysicalSiteTimelineRow) =>
      decadeKeys.indexOf(decadeOf(site.firstYear));
    for (const state of stateKeys) {
      states
        .get(state)!
        .sort(
          (left, right) =>
            decadeIndex(left) - decadeIndex(right) ||
            left.name.localeCompare(right.name),
        );
    }

    const total = sites.length;
    const decadeUnit =
      (560 - DECADE_GAP * (decadeKeys.length - 1)) / Math.max(total, 1);
    const decadeLayout: {
      key: string;
      y0: number;
      y1: number;
      count: number;
    }[] = [];
    const decadeY = new Map<string, number>();
    let decadeCursor = TOP;
    for (const key of decadeKeys) {
      const members = decades.get(key)!;
      const y0 = decadeCursor;
      members.forEach((site, index) =>
        decadeY.set(site.slug, y0 + (index + 0.5) * decadeUnit),
      );
      decadeCursor += members.length * decadeUnit;
      decadeLayout.push({
        key,
        y0,
        y1: decadeCursor,
        count: members.length,
      });
      decadeCursor += DECADE_GAP;
    }
    const fieldBottom = decadeCursor - DECADE_GAP;

    const stateUnit =
      (fieldBottom - TOP - STATE_GAP * (stateKeys.length - 1)) /
      Math.max(total, 1);
    const stateLayout = new Map<
      PhysicalSiteState,
      { y0: number; y1: number; count: number }
    >();
    const stateY = new Map<string, number>();
    let stateCursor = TOP;
    for (const state of stateKeys) {
      const members = states.get(state)!;
      const y0 = stateCursor;
      members.forEach((site, index) =>
        stateY.set(site.slug, y0 + (index + 0.5) * stateUnit),
      );
      stateCursor += members.length * stateUnit;
      stateLayout.set(state, {
        y0,
        y1: stateCursor,
        count: members.length,
      });
      stateCursor += STATE_GAP;
    }

    const height = Math.max(fieldBottom, stateCursor - STATE_GAP) + 38;
    const labelFloor = height - 30;
    const decadeLabelY = declutterLabels(
      decadeLayout,
      DECADE_LABEL_GAP,
      labelFloor,
    );
    const stateLabelY = declutterLabels(
      stateKeys.map((state) => stateLayout.get(state)!),
      STATE_LABEL_GAP,
      labelFloor,
    );
    const bandMembers = new Map<string, PhysicalSiteTimelineRow[]>();
    for (const key of decadeKeys) {
      bandMembers.set(`decade:${key}`, decades.get(key)!);
    }
    for (const state of stateKeys) {
      bandMembers.set(`state:${state}`, states.get(state)!);
    }

    return {
      decadeLayout,
      decadeLabelY,
      stateKeys,
      stateLayout,
      stateLabelY,
      decadeY,
      stateY,
      bandMembers,
      height,
      total,
    };
  }, [sites]);

  const matches = useMemo(() => {
    const normalized = fold(query.trim());
    if (normalized.length < 2) return [];
    return sites
      .filter((site) => fold(site.name).includes(normalized))
      .slice(0, 8);
  }, [query, sites]);
  const matchSlugs = useMemo(
    () => new Set(matches.map((site) => site.slug)),
    [matches],
  );

  const active = (site: PhysicalSiteTimelineRow) => {
    if (matchSlugs.size) return matchSlugs.has(site.slug);
    if (!hot) return true;
    if (hot.startsWith("state:")) return site.state === hot.slice(6);
    if (hot.startsWith("decade:")) {
      return decadeOf(site.firstYear) === hot.slice(7);
    }
    return site.slug === hot;
  };
  const anyFocus = hot !== null || matchSlugs.size > 0;
  const hovered = hot && !hot.includes(":")
    ? sites.find((site) => site.slug === hot)
    : null;

  const threadPath = (site: PhysicalSiteTimelineRow) => {
    const y0 = model.decadeY.get(site.slug)!;
    const y1 = model.stateY.get(site.slug)!;
    const start = X_DECADE + DECADE_WIDTH;
    const control = (start + X_STATE) / 2;
    return `M ${start} ${y0.toFixed(1)} C ${control} ${y0.toFixed(1)}, ${control} ${y1.toFixed(1)}, ${X_STATE} ${y1.toFixed(1)}`;
  };

  const openState = open?.startsWith("state:")
    ? (open.slice(6) as PhysicalSiteState)
    : null;
  const openDecade = open?.startsWith("decade:") ? open.slice(7) : null;
  const openMembers = open ? model.bandMembers.get(open) ?? [] : [];
  const openLabel = openState
    ? STATE_LABEL[openState]
    : openDecade === "Undated"
      ? "First documented year not established"
      : openDecade
        ? `First documented in the ${openDecade}`
        : null;
  const openNote = openState
    ? STATE_NOTE[openState]
    : openDecade === "Undated"
      ? "No first documented year is established for these worship sites; none is inferred."
      : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find a church or worship site…"
          className="w-72 rounded-md border border-rule bg-background px-2 py-1.5 text-body-copy"
          aria-label="Find a church or worship site"
        />
      </div>

      {matches.length > 0 ? (
        <ul className="mb-3 flex flex-wrap gap-2 text-body-copy">
          {matches.map((site) => (
            <li key={site.slug}>
              {site.profileHref ? (
                <Link
                  href={site.profileHref}
                  className="block rounded-md border border-rule px-2 py-1 hover:border-foreground"
                >
                  {site.name}
                </Link>
              ) : (
                <span className="block rounded-md border border-rule px-2 py-1">
                  {site.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <div
        className="mb-3 flex min-h-10 items-center border-y border-rule px-3 py-2 text-body-copy"
        aria-live="polite"
      >
        {hovered ? (
          <span>
            <span className="font-serif font-semibold">{hovered.name}</span>
            <span className="text-muted">
              {" "}
              · first documented {hovered.firstYear ?? "year not established"}
              · {STATE_LABEL[hovered.state].toLowerCase()}
              {hovered.profileHref ? " · click to open related profile" : ""}
            </span>
          </span>
        ) : (
          <span className="text-muted">
            Hover a line to identify the physical site. Click or tap a line to
            open its related profile.
          </span>
        )}
      </div>

      <div className="w-full min-w-0 max-w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${model.height}`}
          className="block h-auto w-full max-w-none"
          style={{ minWidth: 740 }}
          role="img"
          aria-label={`Each of the ${model.total} physical worship sites as one line, from its first documented decade to its present building condition.`}
        >
          <text
            x={X_DECADE}
            y={16}
            textAnchor="end"
            fontSize={10}
            fontWeight={700}
            fill="var(--foreground)"
          >
            FIRST DOCUMENTED
          </text>
          <text
            x={X_STATE}
            y={16}
            fontSize={10}
            fontWeight={700}
            fill="var(--foreground)"
          >
            CONDITION TODAY
          </text>
          <text x={X_STATE} y={31} fontSize={9} fill="var(--muted)">
            one line per physical worship site
          </text>

          {model.decadeLayout.map((decade, index) => {
            const key = `decade:${decade.key}`;
            return (
              <g key={key}>
                <rect
                  x={X_DECADE}
                  y={decade.y0}
                  width={DECADE_WIDTH}
                  height={Math.max(decade.y1 - decade.y0, 2.5)}
                  fill="var(--mark-ink)"
                  opacity={hot === key ? 0.9 : anyFocus ? 0.25 : 0.55}
                  rx={2}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`List ${decade.count} ${decade.count === 1 ? "site" : "sites"} first documented in ${decade.key}`}
                  onMouseEnter={() => setHot(key)}
                  onMouseLeave={() => setHot(null)}
                  onClick={() => setOpen((value) => (value === key ? null : key))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setOpen((value) => (value === key ? null : key));
                    }
                  }}
                >
                  <title>{`${decade.key}: ${decade.count} ${decade.count === 1 ? "site" : "sites"} — click to list`}</title>
                </rect>
                <text
                  x={X_DECADE - 8}
                  y={model.decadeLabelY[index]}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={decade.count >= 8 ? 12 : 10}
                  fontWeight={600}
                  fill="var(--foreground)"
                  opacity={anyFocus && hot !== key ? 0.35 : 1}
                >
                  {decade.key}
                  <tspan fontWeight={400} fill="var(--muted)">
                    {` · ${decade.count}`}
                  </tspan>
                </text>
              </g>
            );
          })}

          {sites.map((site) => {
            const isActive = active(site);
            const spotlight = isActive &&
              (hot === site.slug || matchSlugs.has(site.slug));
            return (
              <g key={site.slug}>
                {spotlight ? (
                  <path
                    d={threadPath(site)}
                    fill="none"
                    stroke="var(--background)"
                    strokeWidth={5}
                    opacity={0.9}
                  />
                ) : null}
                <path
                  d={threadPath(site)}
                  fill="none"
                  stroke={STATE_COLOR[site.state]}
                  strokeWidth={spotlight ? 2.4 : 0.7}
                  opacity={
                    isActive ? (spotlight ? 1 : anyFocus ? 0.75 : 0.55) : 0.04
                  }
                />
                <path
                  d={threadPath(site)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={14}
                  className={site.profileHref ? "cursor-pointer" : ""}
                  role={site.profileHref ? "button" : undefined}
                  tabIndex={site.profileHref ? 0 : undefined}
                  aria-label={
                    site.profileHref
                      ? `Open the related profile for ${site.name}`
                      : undefined
                  }
                  onMouseEnter={() => setHot(site.slug)}
                  onMouseLeave={() => setHot(null)}
                  onClick={() => {
                    if (site.profileHref) router.push(site.profileHref);
                  }}
                  onKeyDown={(event) => {
                    if (
                      site.profileHref &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      router.push(site.profileHref);
                    }
                  }}
                >
                  <title>{`${site.name} — ${STATE_LABEL[site.state]}`}</title>
                </path>
              </g>
            );
          })}

          {model.stateKeys.map((state, index) => {
            const band = model.stateLayout.get(state)!;
            const key = `state:${state}`;
            return (
              <g key={key}>
                <rect
                  x={X_STATE}
                  y={band.y0}
                  width={STATE_WIDTH}
                  height={Math.max(band.y1 - band.y0, 3)}
                  fill={STATE_COLOR[state]}
                  opacity={hot === key ? 1 : anyFocus ? 0.35 : 0.95}
                  rx={2}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`List ${band.count} ${band.count === 1 ? "site" : "sites"}: ${STATE_LABEL[state]}`}
                  onMouseEnter={() => setHot(key)}
                  onMouseLeave={() => setHot(null)}
                  onClick={() => setOpen((value) => (value === key ? null : key))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setOpen((value) => (value === key ? null : key));
                    }
                  }}
                >
                  <title>{`${STATE_LABEL[state]}: ${band.count} ${band.count === 1 ? "site" : "sites"} — click to list`}</title>
                </rect>
                <text
                  x={X_STATE + STATE_WIDTH + 10}
                  y={model.stateLabelY[index] - 5}
                  fontSize={13}
                  fontWeight={700}
                  fill="var(--foreground)"
                  opacity={anyFocus && hot !== key ? 0.35 : 1}
                  className="cursor-pointer"
                  onClick={() => setOpen((value) => (value === key ? null : key))}
                >
                  {STATE_LABEL[state]}
                  <tspan fontWeight={400} fill="var(--muted)">
                    {` · ${band.count}`}
                  </tspan>
                  <tspan
                    x={X_STATE + STATE_WIDTH + 10}
                    dy={15}
                    fontSize={10}
                    fontWeight={400}
                    fill="var(--muted)"
                  >
                    {STATE_SUBLABEL[state]}
                  </tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {open && openLabel ? (
        <section className="mt-5 border-t-2 border-foreground pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-subsection-title font-semibold">
                {openLabel} · {openMembers.length} of {model.total}
              </h3>
              {openNote ? (
                <p className="mt-1 max-w-3xl text-body-copy leading-relaxed text-muted">
                  {openNote}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="shrink-0 text-body-copy font-semibold underline decoration-rule underline-offset-4"
            >
              Close list
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {openMembers.map((site) => {
              const content = (
                <>
                  <span className="block font-serif text-[15.5px] font-semibold leading-tight">
                    {site.name}
                  </span>
                  <span className="mt-1 block text-small-copy text-muted">
                    Worship site in the building ledger
                  </span>
                  <span className="mt-1 block text-small-copy text-muted">
                    First documented {site.firstYear ?? "year not established"}
                  </span>
                  <span className="mt-1.5 block text-body-copy font-semibold">
                    {STATE_LABEL[site.state]}
                  </span>
                </>
              );
              return site.profileHref ? (
                <Link
                  key={site.slug}
                  href={site.profileHref}
                  className="block rounded-md border border-rule p-3 hover:border-foreground"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={site.slug}
                  className="rounded-md border border-rule p-3"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
