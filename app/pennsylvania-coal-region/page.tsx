import type { Metadata } from "next";
import Link from "next/link";
import registry from "@/data/registry-unified.json";
import siteFigures from "@/data/site-figures.json";
import CoalRegionMatrix, {
  type CoalMatrixCell,
  type CoalMatrixParish,
} from "@/components/CoalRegionMatrix";
import { pennsylvaniaCoalRegion } from "@/lib/infographic-projection";
import type { EndState } from "@/lib/end-state";

export const metadata: Metadata = {
  title: "The Pennsylvania Coal Region",
  description: `The ${siteFigures.coalRegion.parishes} Lithuanian parishes documented in northeastern Pennsylvania's coal region, compared by ownership and outcome.`,
};

const coalRegion = [...pennsylvaniaCoalRegion.institutions]
  .sort(
    (a, b) =>
      a.city.localeCompare(b.city) || a.name.localeCompare(b.name),
  );
const dioceseOwned = coalRegion.filter(
  (parish) => parish.ownership === "diocese_rc",
);
const communityOwned = coalRegion.filter(
  (parish) => parish.ownership !== "diocese_rc",
);
const closedByDiocese = dioceseOwned.filter(
  (parish) =>
    parish.ending_mode === "diocese_closed" &&
    parish.status_group !== "unresolved",
);
const standingDioceseOwned = dioceseOwned.filter(
  (parish) =>
    parish.ending_mode !== "diocese_closed" &&
    parish.status_group !== "unresolved",
);
const unresolved = dioceseOwned.filter(
  (parish) => parish.status_group === "unresolved",
);

if (
  coalRegion.length !== siteFigures.coalRegion.parishes ||
  dioceseOwned.length !== siteFigures.coalRegion.dioceseOwned ||
  closedByDiocese.length !== siteFigures.coalRegion.dioceseEnded ||
  standingDioceseOwned.length !== siteFigures.coalRegion.dioceseStanding ||
  communityOwned.length !== siteFigures.coalRegion.communityOwned
) {
  throw new Error("Coal-region figures do not match site-figures.json");
}

type CoalRegionInstitution = (typeof coalRegion)[number];

function matrixParishes(records: CoalRegionInstitution[]): CoalMatrixParish[] {
  return records.map((parish) => ({
    slug: parish.registry_slug,
    profileHref: parish.public_profile,
    name: parish.name,
    city: parish.city,
    endState: parish.status_group as EndState,
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
    </article>
  );
}
