import type { Metadata } from "next";
import Link from "next/link";
import ParishViewList from "@/components/ParishViewList";
import {
  comparatorParishes,
  OWNERSHIP_SHORT,
  type Parish,
} from "@/lib/parishes";

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
const communityDecided = canadianParishes.filter(
  (parish) => parish.endingMode === "community_decided",
);

function canadianOwnershipLabel(parish: Parish) {
  return parish.state === "QC"
    ? "Parish-owned under Quebec civil law"
    : OWNERSHIP_SHORT[parish.ownership];
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <div className="py-4">
      <p className="font-serif text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-snug text-muted">{label}</p>
    </div>
  );
}

export default function CanadianComparatorsPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        Comparative view
      </p>
      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Canadian comparators
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
        {canadianParishes.length} Canadian Lithuanian parish records are
        included outside the U.S. totals to make differences in ownership,
        governance, survival, and community decision-making visible. They are
        deliberately bounded comparators, not a complete census of Lithuanian
        religious life in Canada.
      </p>

      <section
        aria-label="Canadian comparator figures"
        className="mt-8 grid grid-cols-3 divide-x divide-rule border-y border-rule"
      >
        <div className="pr-3">
          <Figure value={canadianParishes.length} label="comparator records" />
        </div>
        <div className="px-3">
          <Figure value={activeParishes.length} label="active Lithuanian parishes" />
        </div>
        <div className="pl-3">
          <Figure
            value={communityDecided.length}
            label="community-decided closure"
          />
        </div>
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
          What this comparison can show
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          These three records help compare ownership structures, liturgical
          continuity, and who participates in an ending. They cannot establish a
          general rule for Canada or replace parish-specific civil and canonical
          evidence.
        </p>
      </section>

      <p className="mt-12 border-t border-rule pt-5 text-sm leading-relaxed text-muted">
        Canadian comparators are excluded from every U.S. headline figure.
        Their profile pages carry the current evidence and source ledger.{" "}
        <Link href="/about-the-data" className="underline hover:text-foreground">
          About the Data
        </Link>
        {" · "}
        <Link
          href="/about/sources-and-archives"
          className="underline hover:text-foreground"
        >
          Sources &amp; Archives
        </Link>
        {" · "}
        <Link href="/record" className="underline hover:text-foreground">
          The full record
        </Link>
      </p>
    </article>
  );
}
