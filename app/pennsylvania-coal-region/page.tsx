import type { Metadata } from "next";
import Link from "next/link";
import ParishViewList from "@/components/ParishViewList";
import { parishes } from "@/lib/parishes";

export const metadata: Metadata = {
  title: "The Pennsylvania Coal Region",
  description:
    "The 15 Lithuanian parishes documented in northeastern Pennsylvania's coal region, grouped by ownership and outcome.",
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
const closedByDiocese = dioceseOwned.filter(
  (parish) => parish.endingMode === "diocese_closed",
);
const standingDioceseOwned = dioceseOwned.filter(
  (parish) => parish.endingMode === "standing",
);
const unresolved = dioceseOwned.filter(
  (parish) => parish.endingMode === "undecided",
);
const communityOwned = coalRegion.filter(
  (parish) => parish.ownership !== "diocese_rc",
);

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <div className="py-4">
      <p className="font-serif text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-snug text-muted">{label}</p>
    </div>
  );
}

export default function PennsylvaniaCoalRegionPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        Comparative view
      </p>
      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        The Pennsylvania coal region
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
        {coalRegion.length} Lithuanian parishes in northeastern Pennsylvania
        form the densest Lithuanian parish settlement documented in America.
        Of the {dioceseOwned.length} diocese-owned parishes,{" "}
        {closedByDiocese.length} were closed by the diocese,{" "}
        {standingDioceseOwned.length} remain standing under diocesan ownership,
        and {unresolved.length} remains unresolved. The remaining parish is
        community-owned.
      </p>

      <section
        aria-label="Coal-region figures"
        className="mt-8 grid grid-cols-2 divide-x divide-y divide-rule border-y border-rule sm:grid-cols-5 sm:divide-y-0"
      >
        <div className="px-3 sm:pl-0">
          <Figure value={coalRegion.length} label="documented parishes" />
        </div>
        <div className="px-3">
          <Figure value={dioceseOwned.length} label="diocese-owned" />
        </div>
        <div className="px-3">
          <Figure value={closedByDiocese.length} label="closed by the diocese" />
        </div>
        <div className="px-3">
          <Figure
            value={standingDioceseOwned.length}
            label="standing, diocese-owned"
          />
        </div>
        <div className="px-3 sm:pr-0">
          <Figure value={unresolved.length} label="unresolved" />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Closed by the diocese · {closedByDiocese.length}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The parish ended by diocesan decision. The profile distinguishes that
          canonical outcome from what later happened to the church building.
        </p>
        <ParishViewList parishes={closedByDiocese} />
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Standing under diocesan ownership · {standingDioceseOwned.length}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          These churches remain in Catholic use, although Lithuanian parish
          identity and Lithuanian-led worship do not necessarily continue.
        </p>
        <ParishViewList parishes={standingDioceseOwned} />
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Unresolved · {unresolved.length}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The record keeps this case separate because its canonical outcome is
          not established by the current evidence.
        </p>
        <ParishViewList parishes={unresolved} />
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Community-owned · {communityOwned.length}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This parish belongs to the Lithuanian National Catholic tradition and
          provides the region&rsquo;s community-owned comparison.
        </p>
        <ParishViewList parishes={communityOwned} />
      </section>

      <p className="mt-12 border-t border-rule pt-5 text-sm leading-relaxed text-muted">
        This is a bounded view of the locked <em>Draugas</em> case-filed record,
        not every Lithuanian institution in Pennsylvania. Counts are calculated
        from the same parish register used across the site.{" "}
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
