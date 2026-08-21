import type { Metadata } from "next";
import Link from "next/link";
import OutcomeModeExplorer from "@/components/OutcomeModeExplorer";
import PhysicalSiteFlow from "@/components/PhysicalSiteFlow";
import {
  infographicCounts,
  romanCatholicInstitutionHistory,
} from "@/lib/infographic-projection";
import { physicalSiteOutcomeProjection } from "@/lib/physical-site-outcome-projection";

export const metadata: Metadata = {
  title: "Lithuanian Church Buildings Through Time",
  description:
    "The documented physical worship sites used by Lithuanian Catholic parishes and missions in the United States, including earlier and replacement churches.",
};

export default function ChurchBuildingHistoryPage() {
  if (
    physicalSiteOutcomeProjection.sites.length !==
    infographicCounts.physical_worship_sites
  ) {
    throw new Error("Physical worship-site population drifted.");
  }

  return (
    <article className="mx-auto max-w-6xl px-4 py-5 sm:py-6">
      <OutcomeModeExplorer
        mode="buildings"
        institutionCount={romanCatholicInstitutionHistory.length}
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
        view={<PhysicalSiteFlow sites={physicalSiteOutcomeProjection.sites} />}
      />

      <p className="mt-8 border-t border-rule pt-4 text-small-copy leading-relaxed text-muted">
        Building rows begin with the first documented use of each physical site.
        Open a row for the related parish profile and its evidence. Institution
        histories begin with the parish or mission itself and remain in the{" "}
        <Link
          href="/where-every-parish-ended-up"
          className="underline hover:text-foreground"
        >
          parish and mission view
        </Link>
        . See{" "}
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
