import type { Metadata } from "next";
import Link from "next/link";
import siteFigures from "@/data/site-figures.json";
import { EndStatePill } from "@/components/EndStatePill";
import { canadianComparators } from "@/lib/infographic-projection";
import type { EndState } from "@/lib/end-state";

export const metadata: Metadata = {
  title: "Canadian Comparators",
  description: `${siteFigures.comparators.canadianParishes} Canadian Lithuanian parishes included to compare survival, ownership, and community decision-making with the United States.`,
};

const canadianParishes = [...canadianComparators.parishes].sort(
  (a, b) =>
    a.province.localeCompare(b.province) ||
    a.city.localeCompare(b.city) ||
    a.name.localeCompare(b.name),
);
const activeParishes = canadianParishes.filter(
  (parish) => parish.status_group === "active_parish",
);

if (canadianParishes.length !== siteFigures.comparators.canadianParishes) {
  throw new Error("Canadian comparator count does not match site-figures.json");
}

type CanadianComparator = (typeof canadianParishes)[number];

function canadianOwnershipLabel(parish: CanadianComparator) {
  return parish.province === "QC"
    ? "Parish-owned under Quebec civil law"
    : parish.ownership === "diocese_rc"
      ? "Diocese-owned Roman Catholic"
      : "Ownership not yet established";
}

export default function CanadianComparatorsPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-small-copy uppercase text-muted">
        Comparative view
      </p>
      <h1 className="mt-1 font-serif text-page-title font-semibold leading-tight">
        Canadian comparators
      </h1>
      <p className="mt-4 max-w-3xl font-serif text-section-title leading-relaxed sm:text-section-title">
        What changes when the parish community has a formal role in the
        property and in the decision about its future?
      </p>

      <section className="mt-10 border-y border-rule py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(14rem,0.55fr)_minmax(0,1.45fr)] lg:items-center">
          <div>
            <p className="font-serif text-page-title font-semibold leading-none">
              {activeParishes.length} of {canadianParishes.length}
            </p>
            <h2 className="mt-3 font-serif text-section-title font-semibold leading-tight">
              remain active Lithuanian parishes
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              The third parish closed, but on the community&rsquo;s own
              decision. Survival is not guaranteed; agency is the distinction.
            </p>
          </div>

          <div aria-label="Ownership, decision, and outcome for the three Canadian comparator parishes">
            <div className="hidden grid-cols-[1fr_1fr_auto] gap-4 border-b border-rule pb-2 text-small-copy uppercase text-muted sm:grid">
              <span>Ownership</span>
              <span>Decision</span>
              <span>Today</span>
            </div>
            <div className="divide-y divide-rule">
              {canadianParishes.map((parish) => (
                <div
                  key={parish.slug}
                  className="grid gap-3 py-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-4"
                >
                  <div>
                    <Link
                      href={parish.profile}
                      className="font-serif font-semibold hover:underline"
                    >
                      {parish.name}
                    </Link>
                    <p className="text-small-copy text-muted">
                      {parish.city}, {parish.province}
                    </p>
                    <p className="mt-1 text-body-copy">
                      {canadianOwnershipLabel(parish)}
                    </p>
                  </div>
                  <p className="text-body-copy leading-relaxed text-muted">
                    {parish.ending_mode === "community_decided"
                      ? "The parish community chose the ending."
                      : "Parish governance continues under Quebec civil law."}
                  </p>
                  <EndStatePill value={parish.status_group as EndState} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-5 border-t border-rule pt-3 text-small-copy leading-relaxed text-muted">
          Scope: {canadianParishes.length} Canadian comparator parishes;
          excluded from every U.S. headline figure
          {" · "}
          <Link href="/about-the-data" className="underline hover:text-accent">
            About the data
          </Link>
        </p>
      </section>

    </article>
  );
}
