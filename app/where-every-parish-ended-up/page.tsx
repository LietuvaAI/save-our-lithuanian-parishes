import type { Metadata } from "next";
import Link from "next/link";
import OutcomeModeExplorer from "@/components/OutcomeModeExplorer";
import ParishThreads, {
  type FateKey,
  type ThreadParish,
} from "@/components/ParishThreads";
import PhysicalSiteTimeline from "@/components/PhysicalSiteTimeline";
import {
  additionalCurrentHostedCommunities,
  canonicalInfographics,
  currentPastoralNetwork,
  infographicCounts,
  romanCatholicInstitutionHistory,
  romanCatholicMissionHistory,
  romanCatholicParishHistory,
} from "@/lib/infographic-projection";
import { toGroup } from "@/lib/end-state";
import { physicalSiteOutcomeProjection } from "@/lib/physical-site-outcome-projection";

export const metadata: Metadata = {
  title: "The State of Lithuanian Catholic Parishes in America",
  description:
    "What became of every documented Lithuanian Roman Catholic parish and mission in the United States — and where Lithuanian worship continues today.",
};

/**
 * The terminal church outcome of a closed institution. Published only on
 * `terminal_site_condition` authority; an unresolved authority publishes
 * nothing rather than a guess, and `legacy_building_fate` is never read.
 */
function fateKey(buildingFate: string | null): FateKey {
  if (buildingFate === "demolished") return "demolished";
  if (buildingFate === "repurposed") return "repurposed";
  if (buildingFate === "listed_for_sale") return "listed_for_sale";
  if (buildingFate === "standing") return "standing";
  return "unrecorded";
}

function buildThreads(): ThreadParish[] {
  return romanCatholicInstitutionHistory.map((institution) => ({
    slug: institution.registry_slug,
    name: institution.name,
    city: institution.city,
    state: institution.state,
    // Rendered verbatim from the canonical typed jurisdiction. The short
    // `diocese` field cannot tell a diocese from an archdiocese and is never
    // prefixed to build a label.
    jurisdiction: institution.jurisdiction?.canonical_name ?? null,
    anchorYear: institution.founded.year,
    anchorLabel:
      institution.record_type === "misija" ? "Established" : "Founded",
    anchorDisplay: institution.founded.display,
    endedDisplay: institution.closed.display,
    recordType: institution.record_type as "parish" | "misija",
    endState: institution.status_group,
    fateKey:
      institution.status_group === "closed"
        ? fateKey(
            institution.building_fate_authority === "terminal_site_condition"
              ? institution.building_fate
              : null,
          )
        : null,
    continuation: institution.continuation_summary
      ? {
          mode: institution.continuation_summary.continuation_mode,
          summary: institution.continuation_summary.display_summary,
          destination: institution.continuation_summary.destination_name,
          effective: institution.continuation_summary.effective_date,
          futurePlan: institution.continuation_summary.future_plan,
        }
      : null,
    href: institution.public_profile,
  }));
}

export default function ParishOutcomeFlowPage() {
  const threads = buildThreads();
  const closed = threads.filter(
    (institution) => toGroup(institution.endState) === "closed",
  );
  // Current places of Lithuanian worship come from the pastoral network, which
  // is the authority for "today". One member sits outside this historical
  // population, so the two figures never agree and must not be summed from the
  // bands on this page.
  const currentWorshipPlaces = currentPastoralNetwork.members.length;
  const generated = new Date(
    `${canonicalInfographics.generated}T00:00:00Z`,
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  if (
    threads.length !==
    romanCatholicParishHistory.length + romanCatholicMissionHistory.length
  ) {
    throw new Error("Parish-and-mission flow population drifted.");
  }

  return (
    <article className="mx-auto max-w-6xl px-4 py-5 sm:py-6">
      <OutcomeModeExplorer
        institutionCount={threads.length}
        parishCount={romanCatholicParishHistory.length}
        missionCount={romanCatholicMissionHistory.length}
        closedCount={closed.length}
        currentWorshipPlaces={currentWorshipPlaces}
        publicInstitutionCount={infographicCounts.public_us_institutions}
        physicalSiteCount={physicalSiteOutcomeProjection.sites.length}
        demolishedSiteCount={
          physicalSiteOutcomeProjection.stateCounts.demolished ?? 0
        }
        repurposedSiteCount={
          physicalSiteOutcomeProjection.stateCounts.repurposed ?? 0
        }
        standingSiteCount={
          physicalSiteOutcomeProjection.stateCounts.standing ?? 0
        }
        listedSiteCount={
          physicalSiteOutcomeProjection.stateCounts.listed_for_sale ?? 0
        }
        unestablishedSiteCount={
          physicalSiteOutcomeProjection.stateCounts.not_established ?? 0
        }
        revision={canonicalInfographics.revision_id}
        generated={generated}
        institutionView={
          <ParishThreads
            parishes={threads}
            additionalHostedCommunities={additionalCurrentHostedCommunities.map(
              (community) => ({
                id: community.id,
                name: community.nameLt,
                city: community.city,
                state: community.state,
                ministry: community.ministry,
                officialSite: community.officialSite ?? undefined,
              }),
            )}
          />
        }
        buildingView={
          <PhysicalSiteTimeline sites={physicalSiteOutcomeProjection.sites} />
        }
      />

      <p className="mt-8 border-t border-rule pt-4 text-xs leading-relaxed text-muted">
        Every line and figure derives from the canonical CultureNet projection.
        Institution lines begin at the institution&rsquo;s own founding year;
        building rows begin with the first documented use of the physical site.
        Open a line or row for the related profile and its evidence. See{" "}
        <Link
          href="/about-the-data"
          className="underline hover:text-foreground"
        >
          About the Data
        </Link>{" "}
        for scope and method.
      </p>
    </article>
  );
}
