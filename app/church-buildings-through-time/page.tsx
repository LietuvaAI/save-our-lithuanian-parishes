import type { Metadata } from "next";
import Link from "next/link";
import PhysicalSiteTimeline, {
  type PhysicalSiteState,
  type PhysicalSiteTimelineRow,
} from "@/components/PhysicalSiteTimeline";
import {
  infographicCounts,
  physicalWorshipSiteHistory,
  resolvePhysicalSiteCondition,
} from "@/lib/infographic-projection";

export const metadata: Metadata = {
  title: "Lithuanian Church Buildings Through Time",
  description:
    "A physical-site view of documented Lithuanian Catholic churches and worship places, kept separate from parish-institution history.",
};

function buildSites(): PhysicalSiteTimelineRow[] {
  return physicalWorshipSiteHistory.map((site) => {
    const directProfiles = site.institution_use_periods
      .map((period) => period.institution_profile)
      .filter((profile): profile is string => profile != null);
    const profiles =
      directProfiles.length > 0 ? directProfiles : site.related_public_profiles;
    return {
      slug: site.slug,
      name: site.name,
      firstYear: site.first_documented_year,
      endYear: site.demolished_year,
      state: resolvePhysicalSiteCondition(site.condition_relationships),
      profileHref: profiles.at(-1) ?? null,
    };
  });
}

export default function ChurchBuildingHistoryPage() {
  const sites = buildSites();
  const stateCounts = Object.fromEntries(
    sites.reduce((counts, site) => {
      counts.set(site.state, (counts.get(site.state) ?? 0) + 1);
      return counts;
    }, new Map<PhysicalSiteState, number>()),
  ) as Partial<Record<PhysicalSiteState, number>>;

  if (sites.length !== infographicCounts.physical_worship_sites) {
    throw new Error("Physical worship-site population drifted.");
  }

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs uppercase text-muted">Physical-site view</p>
      <h1 className="mt-1 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Lithuanian church buildings through time
      </h1>
      <p className="mt-2 max-w-3xl text-lg leading-relaxed">
        When did each documented church or worship site enter the Lithuanian
        parish story, and what is known about the building today?
      </p>

      <section className="mt-5 border-y border-rule py-4">
        <p className="max-w-3xl leading-relaxed">
          The canonical graph currently identifies {sites.length} physical
          worship sites connected to the U.S. parish record. It records{" "}
          {stateCounts.demolished ?? 0} as demolished and{" "}
          {stateCounts.repurposed ?? 0} as repurposed; the present condition of{" "}
          {stateCounts.not_established ?? 0} sites is not yet established in
          the building ledger.
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted">
          This is a building history, not an institution count. A parish or
          mission may have used several buildings, and one building may have
          served more than one congregation. Follow institutional outcomes in{" "}
          <Link
            href="/where-every-parish-ended-up"
            className="underline hover:text-foreground"
          >
            Where Every Parish and Mission Ended Up
          </Link>
          .
        </p>
      </section>

      <section className="mt-6 overflow-x-auto">
        <PhysicalSiteTimeline sites={sites} />
      </section>
    </article>
  );
}
