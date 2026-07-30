import type { Metadata } from "next";
import Link from "next/link";
import contextPointsData from "@/data/context-points.json";
import registry from "@/data/registry-unified.json";
import CoalRegionMatrix, {
  type CoalMatrixCell,
  type CoalMatrixParish,
} from "@/components/CoalRegionMatrix";
import { parishes, type Parish } from "@/lib/parishes";
import type { EndState } from "@/lib/end-state";

export const metadata: Metadata = {
  title: "The Pennsylvania Coal Region",
  description:
    "The 15 Lithuanian parishes documented in northeastern Pennsylvania's coal region, compared by ownership and outcome.",
};

const coalRegion = parishes
  .filter((parish) => parish.coalRegion && !parish.comparator)
  .sort(
    (a, b) =>
      a.city.localeCompare(b.city) || a.nameLt.localeCompare(b.nameLt),
  );
const dioceseOwned = coalRegion.filter(
  (parish) => parish.ownership === "diocese_rc",
);
const communityOwned = coalRegion.filter(
  (parish) => parish.ownership !== "diocese_rc",
);
const canonicalStatusByProfile = new Map(
  (
    contextPointsData.points as Array<{
      href: string | null;
      group: EndState;
    }>
  )
    .filter((parish) => parish.href)
    .map((parish) => [parish.href!, parish.group]),
);

function statusForParish(parish: Parish): EndState {
  return (
    canonicalStatusByProfile.get(`/parishes/${parish.slug}`) ?? "unverified"
  );
}

const closedByDiocese = dioceseOwned.filter(
  (parish) =>
    parish.endingMode === "diocese_closed" &&
    statusForParish(parish) !== "unresolved",
);
const standingDioceseOwned = dioceseOwned.filter(
  (parish) =>
    parish.endingMode !== "diocese_closed" &&
    statusForParish(parish) !== "unresolved",
);
const unresolved = dioceseOwned.filter(
  (parish) => statusForParish(parish) === "unresolved",
);

function matrixParishes(records: Parish[]): CoalMatrixParish[] {
  return records.map((parish) => ({
    slug: parish.slug,
    name: parish.nameLt,
    city: parish.city,
    endState: statusForParish(parish),
  }));
}

const matrixCells: CoalMatrixCell[] = [
  {
    id: "diocese-ended",
    ownership: "Diocese-owned",
    outcome: "Ended",
    color: "var(--es-closed)",
    parishes: matrixParishes(closedByDiocese),
  },
  {
    id: "diocese-standing",
    ownership: "Diocese-owned",
    outcome: "Standing",
    color: "var(--es-transferred)",
    textColor: "#1c1917",
    parishes: matrixParishes(standingDioceseOwned),
  },
  {
    id: "diocese-unresolved",
    ownership: "Diocese-owned",
    outcome: "Unresolved",
    color: "var(--foreground)",
    parishes: matrixParishes(unresolved),
  },
  {
    id: "community-ended",
    ownership: "Community-owned",
    outcome: "Ended",
    color: "var(--es-closed)",
    parishes: [],
  },
  {
    id: "community-standing",
    ownership: "Community-owned",
    outcome: "Standing",
    color: "var(--es-active)",
    parishes: matrixParishes(communityOwned),
  },
  {
    id: "community-unresolved",
    ownership: "Community-owned",
    outcome: "Unresolved",
    color: "var(--foreground)",
    parishes: [],
  },
];

export default function PennsylvaniaCoalRegionPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase text-muted">
        Regional view
      </p>
      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        The Pennsylvania coal region
      </h1>
      <p className="mt-4 max-w-3xl font-serif text-xl leading-relaxed sm:text-2xl">
        Did ownership affect survival in America&rsquo;s densest Lithuanian
        parish region?
      </p>

      <section className="mt-10 border-y border-rule py-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.75fr)]">
          <CoalRegionMatrix cells={matrixCells} />
          <div>
            <p className="font-serif text-6xl font-semibold leading-none">
              {closedByDiocese.length} of {dioceseOwned.length}
            </p>
            <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight">
              diocese-owned parishes ended by diocesan decision
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              {standingDioceseOwned.length} remain standing under diocesan
              ownership. The region&rsquo;s one community-owned comparison
              remains standing.
            </p>
          </div>
        </div>
        <p className="mt-6 border-t border-rule pt-3 text-xs leading-relaxed text-muted">
          Scope: {coalRegion.length} parish records in northeastern
          Pennsylvania · Ownership and institutional outcome · Registry
          Revision {registry.registryRevision.version},{" "}
          {registry.registryRevision.date}
          {" · "}
          <Link href="/about-the-data" className="underline hover:text-accent">
            About the data
          </Link>
        </p>
      </section>

      <p className="mt-10 text-sm text-muted">
        <Link href="/record" className="underline hover:text-foreground">
          See all parish profiles in the Record
        </Link>
      </p>
    </article>
  );
}
