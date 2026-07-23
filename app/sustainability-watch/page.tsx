import type { Metadata } from "next";
import Link from "next/link";
import alertsData from "@/data/alerts.json";
import { parishes } from "@/lib/parishes";

export const metadata: Metadata = {
  title: "Sustainability watch — SaveOurLithuanianParishes.org",
  description:
    "Lithuanian parishes that survived but face slow-burn sustainability challenges: clergy shortages, financial strain, ethnic transition, post-merger fragility. Every fact sourced.",
};

type SustainabilityEntry = {
  id: string;
  entity: string;
  place: string;
  diocese: string;
  parishLink: string;
  hearthUrl?: string;
  dateObserved: string;
  clergy: {
    arrangement: string;
    detail: string;
  };
  liturgy: {
    lithuanianMass: boolean;
    frequency: string;
    detail: string;
  };
  governance: string;
  governanceDetail: string;
  survivedThreats: string;
  financial: string | null;
  situation: string;
  sources: { title: string; publisher: string; url: string }[];
};

const entries = (alertsData as any).sustainabilityWatch as SustainabilityEntry[];

const CLERGY_LABEL: Record<string, string> = {
  lithuanian_klebonas: "Lithuanian-speaking klebonas",
  collaborative_pastor: "Shared pastor (not Lithuanian-speaking)",
  visiting_priest: "Visiting priest only",
  no_lithuanian_clergy: "No Lithuanian-speaking clergy",
  unknown: "Not yet established",
};

const FREQUENCY_LABEL: Record<string, string> = {
  weekly: "Weekly Lithuanian Mass",
  monthly: "Monthly Lithuanian Mass",
  occasional: "Occasional Lithuanian Mass",
  none: "No Lithuanian Mass",
  unknown: "Not yet established",
};

const GOVERNANCE_LABEL: Record<string, string> = {
  standalone: "Standalone parish",
  collaborative: "In a diocesan collaborative",
  merged: "Post-merger entity",
  mission: "Mission status",
  unknown: "Not yet established",
};

function ClergyBadge({ arrangement }: { arrangement: string }) {
  const isHealthy = arrangement === "lithuanian_klebonas";
  const isWarning = arrangement === "collaborative_pastor" || arrangement === "visiting_priest";
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium " +
        (isHealthy
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
          : isWarning
            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400")
      }
    >
      <span
        className={
          "inline-block h-1.5 w-1.5 rounded-full " +
          (isHealthy
            ? "bg-emerald-500"
            : isWarning
              ? "bg-amber-500"
              : "bg-stone-400")
        }
        aria-hidden
      />
      {CLERGY_LABEL[arrangement] ?? arrangement}
    </span>
  );
}

const FREQ_SHORT: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  occasional: "Occasional",
  none: "None",
  unknown: "—",
};

/** Build the at-a-glance row data for all standing RC diocese parishes. */
function buildDashboardRows() {
  const watchIndex = new Map(
    ((alertsData as any).sustainabilityWatch as any[]).map((e: any) => [e.parishLink, e])
  );
  const alertIndex = new Map(
    (alertsData.alerts as any[]).map((a: any) => [a.parishLink, a])
  );

  return parishes
    .filter((p) => p.status === "standing" && !p.comparator && p.ownership === "diocese_rc")
    .map((p) => {
      const link = `/parishes/${p.slug}`;
      const watch = watchIndex.get(link) ?? null;
      const alert = alertIndex.get(link) ?? null;
      return { parish: p, watch, alert };
    })
    .sort((a, b) => {
      // Sort: watch entries first, then by state+city
      if (a.watch && !b.watch) return -1;
      if (!a.watch && b.watch) return 1;
      const loc = `${a.parish.state}${a.parish.city}`.localeCompare(`${b.parish.state}${b.parish.city}`);
      return loc;
    });
}

function AllParishesTable() {
  const rows = buildDashboardRows();
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-semibold">All standing parishes at a glance</h2>
      <p className="mt-1 text-sm text-muted">
        Every Roman Catholic Lithuanian parish still open in the United States — clergy situation, Lithuanian
        Mass frequency, and watch status. Parishes under active diocesan pressure appear on the{" "}
        <Link href="/under-threat" className="underline hover:text-foreground">
          under-threat page
        </Link>
        .
      </p>
      <div className="mt-4 overflow-x-auto rounded-lg border border-rule">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rule bg-background text-xs uppercase tracking-wide text-muted">
              <th className="px-3 py-2 text-left font-medium">Parish</th>
              <th className="px-3 py-2 text-left font-medium">Location</th>
              <th className="px-3 py-2 text-left font-medium">Clergy</th>
              <th className="px-3 py-2 text-left font-medium">Lithuanian Mass</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ parish: p, watch, alert }) => (
              <tr key={p.slug} className="border-b border-rule last:border-0 hover:bg-background/50">
                <td className="px-3 py-2.5">
                  <Link href={`/parishes/${p.slug}`} className="font-medium hover:underline">
                    {p.nameLt}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-muted whitespace-nowrap">
                  {p.city}, {p.state}
                </td>
                <td className="px-3 py-2.5">
                  {alert ? (
                    <span className="text-xs text-muted italic">
                      <Link href="/under-threat" className="underline hover:text-foreground">
                        Under threat
                      </Link>
                    </span>
                  ) : watch ? (
                    <ClergyBadge arrangement={watch.clergy.arrangement} />
                  ) : (
                    <span className="text-xs text-muted italic">Researching…</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-muted">
                  {alert ? (
                    <span className="text-xs italic">—</span>
                  ) : watch ? (
                    FREQ_SHORT[watch.liturgy.frequency] ?? watch.liturgy.frequency
                  ) : (
                    <span className="text-xs italic">Researching…</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SustainabilityWatchPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        The long watch
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold">
        Sustainability watch
      </h1>
      <p className="mt-3 text-muted leading-relaxed">
        Not every parish under pressure faces a closure decree. These parishes
        survived — or were never directly threatened — but face the slower
        challenges that decide whether Lithuanian liturgical life continues:
        clergy shortages, financial strain, ethnic transition, post-merger
        fragility. The threat is not a letter from the bishop. It is erosion.
      </p>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        Each entry documents the clergy situation, the Lithuanian Mass schedule,
        the governance structure, and what threats the parish has already
        survived — all sourced. Parishes facing active diocesan action are
        on the{" "}
        <Link href="/under-threat" className="underline hover:text-foreground">
          parishes under threat
        </Link>{" "}
        page.
      </p>

      <div className="mt-8 space-y-6">
        {entries.map((e) => (
          <article
            key={e.id}
            className="rounded-lg border border-rule overflow-hidden"
          >
            <div className="px-5 pt-4 pb-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div>
                  <Link
                    href={e.parishLink}
                    className="font-serif text-lg font-semibold hover:underline"
                  >
                    {e.entity}
                  </Link>
                  <span className="ml-2 text-muted text-sm">{e.place}</span>
                </div>
                <span className="text-xs text-muted">{e.diocese}</span>
              </div>

              <p className="mt-2 leading-relaxed">{e.situation}</p>

              {/* Clergy, liturgy, governance grid */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted mb-1">
                    Clergy
                  </p>
                  <ClergyBadge arrangement={e.clergy.arrangement} />
                  <p className="mt-1.5 text-muted leading-relaxed text-xs">
                    {e.clergy.detail}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted mb-1">
                    Lithuanian Mass
                  </p>
                  <p className="font-medium">
                    {FREQUENCY_LABEL[e.liturgy.frequency] ?? e.liturgy.frequency}
                  </p>
                  <p className="mt-0.5 text-muted text-xs">{e.liturgy.detail}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted mb-1">
                    Governance
                  </p>
                  <p className="font-medium">
                    {GOVERNANCE_LABEL[e.governance] ?? e.governance}
                  </p>
                  <p className="mt-0.5 text-muted text-xs">
                    {e.governanceDetail}
                  </p>
                </div>
              </div>

              {e.survivedThreats && (
                <div className="mt-3 text-sm">
                  <p className="text-xs uppercase tracking-wide text-muted mb-0.5">
                    Survived
                  </p>
                  <p className="text-muted leading-relaxed">
                    {e.survivedThreats}
                  </p>
                </div>
              )}

              {e.financial && (
                <div className="mt-3 text-sm">
                  <p className="text-xs uppercase tracking-wide text-muted mb-0.5">
                    Financial signal
                  </p>
                  <p className="text-muted leading-relaxed">{e.financial}</p>
                </div>
              )}
            </div>

            <div className="border-t border-rule bg-background px-5 py-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted">
                Sources:{" "}
                {e.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && " \u00b7 "}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      {s.publisher}
                    </a>
                  </span>
                ))}
                {" \u00b7 "}
                <span>checked {e.dateObserved}</span>
              </p>
              <div className="flex gap-2">
                {e.hearthUrl && (
                  <a
                    href={e.hearthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-rule px-3 py-1 text-xs font-medium hover:border-foreground transition-colors"
                  >
                    Read the dispatch &rarr;
                  </a>
                )}
                <Link
                  href={e.parishLink}
                  className="rounded-md border border-rule px-3 py-1 text-xs font-medium hover:border-foreground transition-colors"
                >
                  Full record &rarr;
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {entries.length === 1 && (
        <p className="mt-6 text-sm text-muted leading-relaxed italic">
          This page is new. More parishes will be added as their clergy,
          liturgy, and governance situations are researched and sourced —
          including Philadelphia, Chicago, Cleveland, and the coal-region
          parishes of Pennsylvania.
        </p>
      )}

      <AllParishesTable />

      <section className="mt-10 rounded-lg border border-rule px-4 py-3.5 text-sm text-muted leading-relaxed">
        <p>
          <span className="font-medium text-foreground">
            Know the current situation at a parish?
          </span>{" "}
          Whether there is a Lithuanian-speaking priest, what Masses are
          offered, how the community is organized — this is the information
          that keeps this page accurate.{" "}
          <Link href="/report" className="underline hover:text-foreground">
            Tell us
          </Link>
          . Full methodology:{" "}
          <Link
            href="/about-the-data"
            className="underline hover:text-foreground"
          >
            About the data
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
