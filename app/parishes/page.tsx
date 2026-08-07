import type { Metadata } from "next";
import Link from "next/link";
import AllProfilesTimeline, {
  type AllProfilesTimelineRow,
} from "@/components/AllProfilesTimeline";
import alertsData from "@/data/canonical-current-events-projection.json";
import {
  infographicCounts,
  institutionHistory,
} from "@/lib/infographic-projection";
import type { RecordSignal } from "@/lib/record-mark";

export const metadata: Metadata = {
  title: "All Parish Profiles",
  description:
    "A searchable century timeline of every published U.S. Lithuanian parish, mission, and congregation profile.",
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
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-[22px]">
      <p className="text-ui-label font-semibold uppercase tracking-[0.15em] text-muted">
        Profile directory · the parish view
      </p>
      <h1 className="mt-1 font-serif text-page-title font-semibold">
        Every parish, mission, and congregation
      </h1>
      <p className="mt-2 max-w-[90ch] text-body-copy text-muted">
        Browse all {rows.length} published U.S. parish, mission, and
        congregation profiles on one shared timeline, then open any record for
        its full history and sources.
      </p>

      <div className="mt-4">
        <AllProfilesTimeline rows={rows} />
      </div>

      <p className="mt-8 max-w-3xl border-t border-rule pt-5 text-support-copy text-muted">
        Institutions only — the physical churches are counted separately in
        the {" "}
        <Link
          href="/church-buildings-through-time"
          className="font-medium text-foreground underline underline-offset-4 hover:text-accent"
        >
          building view
        </Link>
        . A hollow marker at the far right means the founding year has not yet
        been established; it does not mean that the institution began in 2026.
        Dates, names, and outcomes follow the sources linked in each profile.
        The evidence and citation rules are explained in {" "}
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
