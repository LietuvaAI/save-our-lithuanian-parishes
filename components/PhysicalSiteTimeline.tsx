"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type PhysicalSiteState =
  | "demolished"
  | "repurposed"
  | "listed_for_sale"
  | "standing"
  | "not_established";

export type PhysicalSiteTimelineRow = {
  slug: string;
  name: string;
  firstYear: number | null;
  endYear: number | null;
  state: PhysicalSiteState;
  profileHref: string | null;
};

const LABEL: Record<PhysicalSiteState, string> = {
  demolished: "Demolished",
  repurposed: "Repurposed",
  listed_for_sale: "Sale or redevelopment pending",
  standing: "Standing",
  not_established: "Present condition not established",
};

const COLOR: Record<PhysicalSiteState, string> = {
  demolished: "var(--es-closed)",
  repurposed: "var(--es-transferred)",
  listed_for_sale: "var(--mark-ink)",
  standing: "var(--es-active)",
  not_established: "var(--es-unverified)",
};

const YEAR_MIN = 1840;
const YEAR_MAX = 2026;
const percentage = (year: number) =>
  Math.max(0, Math.min(100, ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100));

export default function PhysicalSiteTimeline({
  sites,
}: {
  sites: PhysicalSiteTimelineRow[];
}) {
  const [query, setQuery] = useState("");
  const visibleSites = useMemo(() => {
    const foldedQuery = query.trim().toLocaleLowerCase();
    if (!foldedQuery) return sites;
    return sites.filter((site) =>
      site.name.toLocaleLowerCase().includes(foldedQuery),
    );
  }, [query, sites]);
  const dated = visibleSites
    .filter((site) => site.firstYear != null)
    .sort(
      (a, b) =>
        a.firstYear! - b.firstYear! || a.name.localeCompare(b.name),
    );
  const undated = visibleSites
    .filter((site) => site.firstYear == null)
    .sort((a, b) => a.name.localeCompare(b.name));

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
        {query.trim() ? (
          <span className="text-small-copy text-muted">
            {visibleSites.length} of {sites.length} sites
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-[minmax(11rem,0.72fr)_minmax(22rem,1.28fr)] gap-3 border-y border-rule py-2 text-[10px] uppercase text-muted">
        <span>Physical church or worship site</span>
        <div className="flex justify-between">
          <span>{YEAR_MIN}</span>
          <span>1900</span>
          <span>1950</span>
          <span>2000</span>
          <span>Today</span>
        </div>
      </div>
      <div className="divide-y divide-rule">
        {dated.map((site) => {
          const start = percentage(site.firstYear!);
          const end = percentage(site.endYear ?? YEAR_MAX);
          const width = Math.max(0.7, end - start);
          const content = (
            <>
              <span className="min-w-0 truncate text-small-copy font-medium group-hover:underline">
                {site.name}
              </span>
              <span className="relative h-5 bg-band">
                <span
                  className="absolute top-1/2 h-1.5 -translate-y-1/2 transition-[height] group-hover:h-2.5"
                  style={{
                    left: String(start) + "%",
                    width: String(width) + "%",
                    background: COLOR[site.state],
                    opacity: site.state === "not_established" ? 0.45 : 0.9,
                  }}
                />
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-muted"
                  style={{ left: String(start) + "%" }}
                >
                  {site.firstYear}
                </span>
                <span className="sr-only">{LABEL[site.state]}</span>
              </span>
            </>
          );
          const className =
            "group grid min-h-8 grid-cols-[minmax(11rem,0.72fr)_minmax(22rem,1.28fr)] items-center gap-3 py-1";
          return site.profileHref ? (
            <Link key={site.slug} href={site.profileHref} className={className}>
              {content}
            </Link>
          ) : (
            <div key={site.slug} className={className}>
              {content}
            </div>
          );
        })}
      </div>

      {visibleSites.length === 0 ? (
        <p className="border-b border-rule py-6 text-body-copy text-muted">
          No worship site matches that search.
        </p>
      ) : null}

      {undated.length > 0 ? (
        <details
          className="mt-4 border-y border-rule py-3"
          open={query.trim() ? true : undefined}
        >
          <summary className="cursor-pointer text-body-copy font-medium">
            {undated.length} worship sites without a documented building date
          </summary>
          <div className="mt-3 columns-1 gap-6 text-small-copy sm:columns-2">
            {undated.map((site) => (
              <p key={site.slug} className="mb-2 break-inside-avoid">
                {site.profileHref ? (
                  <Link href={site.profileHref} className="underline">
                    {site.name}
                  </Link>
                ) : (
                  site.name
                )}
              </p>
            ))}
          </div>
        </details>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-y border-rule py-3 text-small-copy">
        {Object.entries(LABEL).map(([state, label]) => (
          <span key={state} className="inline-flex items-center gap-2">
            <span
              className="h-2 w-5"
              style={{ background: COLOR[state as PhysicalSiteState] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
