import type { Metadata } from "next";
import Link from "next/link";
import registry from "@/data/registry-unified.json";
import ParishViewList from "@/components/ParishViewList";
import { EndStatePill } from "@/components/EndStatePill";
import {
  comparatorParishes,
  OWNERSHIP_SHORT,
  type Parish,
} from "@/lib/parishes";
import { resolveParishEndState } from "@/lib/end-state";

export const metadata: Metadata = {
  title: "Canadian Comparators",
  description:
    "Three Canadian Lithuanian parish records included to compare survival, ownership, and community decision-making with the U.S. record.",
};

const canadianParishes = [...comparatorParishes].sort(
  (a, b) =>
    a.state.localeCompare(b.state) ||
    a.city.localeCompare(b.city) ||
    a.nameLt.localeCompare(b.nameLt),
);
const quebecParishes = canadianParishes.filter(
  (parish) => parish.state === "QC",
);
const ontarioParishes = canadianParishes.filter(
  (parish) => parish.state === "ON",
);
const activeParishes = canadianParishes.filter(
  (parish) => parish.lithuanianIdentity === "active_parish",
);

function canadianOwnershipLabel(parish: Parish) {
  return parish.state === "QC"
    ? "Parish-owned under Quebec civil law"
    : OWNERSHIP_SHORT[parish.ownership];
}

export default function CanadianComparatorsPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs uppercase text-muted">
        Comparative view
      </p>
      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Canadian comparators
      </h1>
      <p className="mt-4 max-w-3xl font-serif text-xl leading-relaxed sm:text-2xl">
        What changes when the parish community has a formal role in the
        property and in the decision about its future?
      </p>

      <section className="mt-10 border-y border-rule py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(14rem,0.55fr)_minmax(0,1.45fr)] lg:items-center">
          <div>
            <p className="font-serif text-6xl font-semibold leading-none">
              {activeParishes.length} of {canadianParishes.length}
            </p>
            <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight">
              remain active Lithuanian parishes
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              The third parish closed, but on the community&rsquo;s own
              decision. Survival is not guaranteed; agency is the distinction.
            </p>
          </div>

          <div aria-label="Ownership, decision, and outcome for the three Canadian comparator parishes">
            <div className="hidden grid-cols-[1fr_1fr_auto] gap-4 border-b border-rule pb-2 text-xs uppercase text-muted sm:grid">
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
                      href={`/parishes/${parish.slug}`}
                      className="font-serif font-semibold hover:underline"
                    >
                      {parish.nameLt}
                    </Link>
                    <p className="text-xs text-muted">
                      {parish.city}, {parish.state}
                    </p>
                    <p className="mt-1 text-sm">
                      {canadianOwnershipLabel(parish)}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">
                    {parish.endingMode === "community_decided"
                      ? "The parish community chose the ending."
                      : "Parish governance continues under Quebec civil law."}
                  </p>
                  <EndStatePill value={resolveParishEndState(parish)} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-5 border-t border-rule pt-3 text-xs leading-relaxed text-muted">
          Scope: {canadianParishes.length} Canadian comparator parish records;
          excluded from every U.S. headline figure · Registry Revision{" "}
          {registry.registryRevision.version}, {registry.registryRevision.date}
          {" · "}
          <Link href="/about-the-data" className="underline hover:text-accent">
            About the data
          </Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Quebec · {quebecParishes.length}
        </h2>
        <p className="mt-2 leading-relaxed">
          The two Montreal records are classified as active Lithuanian parishes
          under Quebec civil-law parish ownership. Both retain regular
          Lithuanian Masses and share a Lithuanian chaplain. Their relevance is
          structural: the legal and governance setting around parish property
          differs from the U.S. diocesan-ownership model.
        </p>
        <ParishViewList
          parishes={quebecParishes}
          ownershipLabel={canadianOwnershipLabel}
        />
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Ontario · {ontarioParishes.length}
        </h2>
        <p className="mt-2 leading-relaxed">
          The Ontario record prevents the comparison from becoming a simple
          survival claim. St. Casimir in Delhi closed in 2020 after 61 years,
          but the community described the ending as its own decision. The
          contrast is therefore about who governs the outcome, not whether
          every Canadian parish survives.
        </p>
        <ParishViewList
          parishes={ontarioParishes}
          ownershipLabel={canadianOwnershipLabel}
        />
      </section>

      <section className="mt-12 border-l-4 border-rule py-1 pl-4">
        <h2 className="font-serif text-xl font-semibold">
          The comparison
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          These records do not claim that every Canadian parish survives.
          They show communities acting within a different property and
          governance structure.
        </p>
      </section>

      <p className="mt-12 border-t border-rule pt-5 text-sm text-muted">
        Canadian comparators are excluded from every U.S. headline figure.{" "}
        <Link href="/record" className="underline hover:text-foreground">
          See the full U.S. record
        </Link>
      </p>
    </article>
  );
}
