import type { Metadata } from "next";
import Link from "next/link";
import ParishThreads, {
  type FateKey,
  type ThreadParish,
} from "@/components/ParishThreads";
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
    <article className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs uppercase text-muted">Institution outcome view</p>
      <h1 className="mt-1 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        The State of Lithuanian Catholic Parishes in America
      </h1>
      <p className="mt-2 max-w-2xl font-serif text-xl leading-snug text-muted">
        What became of {threads.length} parishes and missions&mdash;and where
        Lithuanian worship continues today
      </p>

      <section className="mt-5 border-y border-rule py-4">
        <p className="max-w-3xl text-lg leading-relaxed">
          Of <strong>{threads.length}</strong> Lithuanian Roman Catholic
          parishes and missions, <strong>{closed.length}</strong> have closed.
          Lithuanian worship continues at{" "}
          <strong>{currentWorshipPlaces}</strong>.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed">
          Every line below is one <strong>institution</strong> &mdash; one parish
          or mission, counted once &mdash; running from the decade it began to
          where it stands today. This view follows <strong>institutions</strong>,
          not <strong>buildings</strong>: {romanCatholicParishHistory.length}{" "}
          U.S. Roman Catholic parishes and{" "}
          {romanCatholicMissionHistory.length} missions, each listed once. The{" "}
          {closed.length} that closed gather together, then fan out by what
          became of the church they last used &mdash; but what happened to an
          institution and what happened to its building are separate facts,
          counted separately. Lithuanian National Catholic congregations, other
          non-Roman Catholic institutions, research-only records and Canadian
          comparators are outside this population; all{" "}
          {infographicCounts.public_us_institutions} published U.S. profiles are
          in the{" "}
          <Link href="/parishes" className="underline hover:text-accent">
            full directory
          </Link>
          .
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted">
          Canonical projection {canonicalInfographics.revision_id}, generated{" "}
          {generated}.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/church-buildings-through-time"
            className="font-semibold underline hover:text-accent"
          >
            Follow the church buildings separately
          </Link>
          <span className="text-muted">
            {" "}
            &mdash; a different population, counted as physical sites
          </span>
        </p>
      </section>

      <h2 className="mt-8 font-serif text-2xl font-semibold">
        Institution by institution
      </h2>

      <section className="mt-4">
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
      </section>

      <p className="mt-8 border-t border-rule pt-4 text-xs leading-relaxed text-muted">
        Every line and figure derives from the canonical CultureNet projection. A
        line begins at its institution&rsquo;s own founding year &mdash; never at
        the dedication of a church it later used; where no founding year is
        established, the line starts in the undated band. Open any line for the
        institution profile and its evidence. See{" "}
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
