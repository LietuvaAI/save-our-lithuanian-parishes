import type { Metadata } from "next";
import Link from "next/link";
import AllProfilesTimeline, {
  type AllProfilesTimelineRow,
} from "@/components/AllProfilesTimeline";
import alertsData from "@/data/alerts.json";
import {
  infographicCounts,
  institutionHistory,
} from "@/lib/infographic-projection";
import type { RecordSignal } from "@/lib/record-mark";

export const metadata: Metadata = {
  title: "All Parish Profiles",
  description:
    "A searchable century timeline of every published U.S. Lithuanian parish, mission, and congregation profile in the canonical public record.",
};

type SignalSource = { parishLink?: string };
type AlertSignalSource = SignalSource & { kind?: string };

const signalPriority: Record<RecordSignal, number> = {
  active: 3,
  building: 2,
  watch: 1,
};

const slugFromLink = (link: string) => link.split("/").filter(Boolean).at(-1);

function buildSignalBySlug() {
  const result = new Map<string, RecordSignal>();
  const add = (link: string | undefined, signal: RecordSignal) => {
    if (!link) return;
    const slug = slugFromLink(link);
    if (!slug) return;
    const current = result.get(slug);
    if (!current || signalPriority[signal] > signalPriority[current]) {
      result.set(slug, signal);
    }
  };

  for (const alert of alertsData.alerts as AlertSignalSource[]) {
    if (
      alert.kind === "active" ||
      alert.kind === "watch" ||
      alert.kind === "building"
    ) {
      add(alert.parishLink, alert.kind);
    }
  }
  for (const campaign of alertsData.campaigns as SignalSource[]) {
    add(campaign.parishLink, "active");
  }
  for (const watch of alertsData.sustainabilityWatch as SignalSource[]) {
    add(watch.parishLink, "watch");
  }

  return result;
}

function buildRows(): AllProfilesTimelineRow[] {
  const signalBySlug = buildSignalBySlug();
  return institutionHistory.map((institution) => ({
    slug: institution.registry_slug,
    canonicalName:
      institution.canonical_name.split(",", 1)[0]?.trim() ||
      institution.canonical_name,
    lithuanianName: institution.name,
    city: institution.city,
    state: institution.state,
    jurisdiction: institution.jurisdiction?.canonical_name ?? null,
    founded: institution.founded.year,
    closed: institution.closed.year,
    statusGroup: institution.status_group,
    recordType: institution.record_type,
    profileHref: institution.public_profile,
    signal: signalBySlug.get(institution.registry_slug) ?? null,
  }));
}

export default function ParishProfilesPage() {
  const rows = buildRows();

  if (
    rows.length !== infographicCounts.public_us_institutions ||
    new Set(rows.map((row) => row.profileHref)).size !== rows.length
  ) {
    throw new Error(
      "The All Profiles timeline does not match the canonical publication projection.",
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Profile directory · the parish view
      </p>
      <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
        Every parish, across the whole record
      </h1>
      <div className="mt-4 max-w-4xl space-y-3 leading-relaxed">
        <p>
          This is the <strong>institution view</strong> — every Lithuanian
          parish, mission, and congregation as a community in its own right,
          not a building. Each is drawn as a life on one shared timeline that
          runs from the 1880s to the present day: the bar marks the years the
          institution existed, colored by what became of it, and left open
          where the community still lives. Use it to find a parish by name,
          place, or era and open its full profile.
        </p>
        <p className="text-sm text-muted">
          For the physical churches — which a parish may have moved through
          more than one of — see the building view. For how the whole population
          changed over time and where each parish ended up, see Parish &amp;
          Mission Outcomes.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/church-buildings-through-time"
          className="group inline-flex items-center gap-3 rounded-lg border border-rule px-4 py-3 hover:border-foreground"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
            Building view
          </span>
          <span className="text-sm font-semibold group-hover:text-accent">
            Church Buildings Through Time →
          </span>
        </Link>
        <Link
          href="/where-every-parish-ended-up"
          className="group inline-flex items-center gap-3 rounded-lg border border-rule px-4 py-3 hover:border-foreground"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
            Outcomes
          </span>
          <span className="text-sm font-semibold group-hover:text-accent">
            Where every parish ended up →
          </span>
        </Link>
      </div>

      <div className="mt-7">
        <AllProfilesTimeline rows={rows} />
      </div>

      <p className="mt-8 max-w-3xl border-t border-rule pt-5 text-sm leading-relaxed text-muted">
        Institutions only — the physical churches are counted separately in
        the {" "}
        <Link
          href="/church-buildings-through-time"
          className="font-medium text-foreground underline underline-offset-4 hover:text-accent"
        >
          building view
        </Link>
        . All {rows.length} lanes, dates, and profile routes are generated from
        the canonical CultureNet institution projection. A hollow marker at
        the far right means the founding year has not yet been established; it
        is a research gap, not a claim that the institution began in 2026. The
        source hierarchy and citation rules are documented in {" "}
        <Link
          href="/about/sources-and-archives"
          className="font-medium text-foreground underline underline-offset-4 hover:text-accent"
        >
          Sources &amp; Archives
        </Link>
        .
      </p>
    </div>
  );
}
