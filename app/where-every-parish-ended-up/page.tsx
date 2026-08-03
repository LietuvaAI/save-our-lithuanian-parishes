import type { Metadata } from "next";
import Link from "next/link";
import ParishThreads, {
  type FateKey,
  type ThreadParish,
} from "@/components/ParishThreads";
import {
  canonicalInfographics,
  romanCatholicInstitutionHistory,
  romanCatholicMissionHistory,
  romanCatholicParishHistory,
} from "@/lib/infographic-projection";
import { toGroup } from "@/lib/end-state";

export const metadata: Metadata = {
  title: "Where Every Lithuanian Parish and Mission Ended Up",
  description:
    "Follow every documented Roman Catholic Lithuanian parish and mission from its institutional beginning to its present status.",
};

function fateKey(buildingFate: string | null): FateKey {
  if (buildingFate === "demolished") return "demolished";
  if (buildingFate === "repurposed_religious") return "religious";
  if (buildingFate === "repurposed_secular") return "secular";
  if (buildingFate === "derelict") return "derelict";
  if (buildingFate === "standing") return "standing";
  return "unrecorded";
}

function buildThreads(): ThreadParish[] {
  return romanCatholicInstitutionHistory.map((institution) => ({
    slug: institution.registry_slug,
    name: institution.name,
    city: institution.city,
    state: institution.state,
    anchorYear: institution.founded.year,
    anchorLabel:
      institution.record_type === "misija" ? "Established" : "Founded",
    recordType: institution.record_type as "parish" | "misija",
    endState: institution.status_group,
    fateKey:
      institution.status_group === "closed"
        ? fateKey(institution.building_fate)
        : null,
    href: institution.public_profile,
  }));
}

export default function ParishOutcomeFlowPage() {
  const threads = buildThreads();
  const closed = threads.filter(
    (institution) => toGroup(institution.endState) === "closed",
  );
  const retainingLithuanianWorship = threads.filter(
    (institution) =>
      institution.endState === "active_parish" ||
      institution.endState === "mass_continues",
  );
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
        Where every Lithuanian parish and mission ended up
      </h1>
      <p className="mt-2 max-w-3xl text-lg leading-relaxed">
        Follow each Roman Catholic Lithuanian parish and mission from its
        institutional beginning to its present condition. Closed institutions
        continue into the recorded fate of their last church building.
      </p>

      <section className="mt-5 border-y border-rule py-4">
        <p className="max-w-3xl font-serif text-xl leading-relaxed">
          Of <strong>{threads.length}</strong> Roman Catholic Lithuanian
          parishes and missions, <strong>{closed.length}</strong> have closed.{" "}
          <strong>{retainingLithuanianWorship.length}</strong> still hold
          Lithuanian worship.
        </p>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Scope: {romanCatholicParishHistory.length} parish institutions +{" "}
          {romanCatholicMissionHistory.length} missions · canonical projection
          generated {generated}. A parish and its church building are distinct
          records.
        </p>
        <p className="mt-2 text-sm">
          <Link
            href="/church-buildings-through-time"
            className="font-semibold underline hover:text-accent"
          >
            View the physical church buildings separately
          </Link>
        </p>
      </section>

      <section className="mt-6">
        <ParishThreads parishes={threads} />
      </section>

      <p className="mt-8 border-t border-rule pt-4 text-xs leading-relaxed text-muted">
        Every line and figure derives from the canonical CultureNet projection.
        Open any line for the institution profile and its evidence. See{" "}
        <Link href="/about-the-data" className="underline hover:text-foreground">
          About the Data
        </Link>{" "}
        for scope and method.
      </p>
    </article>
  );
}
