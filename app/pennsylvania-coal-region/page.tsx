import type { Metadata } from "next";
import Link from "next/link";
import { EndStatePill } from "@/components/EndStatePill";
import { pennsylvaniaCoalRegion } from "@/lib/infographic-projection";

export const metadata: Metadata = {
  title: "The Pennsylvania Coal Region",
  description:
    "The 15 Lithuanian parish institutions in the canonical northeastern Pennsylvania coal-region comparison, with their governance and current institutional outcomes.",
};

type CoalRegionInstitution =
  (typeof pennsylvaniaCoalRegion.institutions)[number];

const institutions = [...pennsylvaniaCoalRegion.institutions];
const diocesanParishes = institutions
  .filter((institution) => institution.ownership === "diocese_rc")
  .sort(
    (a, b) =>
      a.city.localeCompare(b.city) || a.name.localeCompare(b.name),
  );
const independentComparisons = institutions
  .filter((institution) => institution.ownership !== "diocese_rc")
  .sort(
    (a, b) =>
      a.city.localeCompare(b.city) || a.name.localeCompare(b.name),
  );
const diocesanEnded = diocesanParishes.filter(
  (institution) => institution.ending_mode === "diocese_closed",
);
const diocesanOther = diocesanParishes.filter(
  (institution) => institution.ending_mode !== "diocese_closed",
);

if (
  institutions.length !== pennsylvaniaCoalRegion.population ||
  diocesanParishes.length !== pennsylvaniaCoalRegion.counts.diocese_owned ||
  independentComparisons.length !==
    pennsylvaniaCoalRegion.counts.community_owned ||
  diocesanEnded.length !== pennsylvaniaCoalRegion.counts.diocese_ended ||
  diocesanOther.length !==
    pennsylvaniaCoalRegion.counts.diocese_standing +
      pennsylvaniaCoalRegion.counts.diocese_unresolved
) {
  throw new Error(
    "Pennsylvania coal-region groups do not match the canonical projection",
  );
}

function InstitutionRow({
  institution,
}: {
  institution: CoalRegionInstitution;
}) {
  const comparisonLabel =
    institution.ownership === "diocese_rc"
      ? institution.ending_mode === "diocese_closed"
        ? "Ended by diocesan decision"
        : "Another documented institutional outcome"
      : "National/Independent Catholic comparison";

  return (
    <li className="border-t border-rule py-4 first:border-t-0">
      <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-2">
        <div>
          <Link
            href={institution.public_profile}
            className="font-serif text-card-title font-semibold underline decoration-rule underline-offset-4 hover:text-accent"
          >
            {institution.name}
          </Link>
          <p className="mt-1 text-small-copy text-muted">
            {institution.city}, {institution.state}
          </p>
        </div>
        <EndStatePill value={institution.status_group} />
      </div>
      <p className="mt-2 text-support-copy text-muted">{comparisonLabel}</p>
    </li>
  );
}

export default function PennsylvaniaCoalRegionPage() {
  const { counts } = pennsylvaniaCoalRegion;

  return (
    <article className="mx-auto max-w-5xl px-4 pb-12 pt-8">
      <header className="max-w-4xl">
        <p className="text-small-copy uppercase tracking-widest text-muted">
          Regional record
        </p>
        <h1 className="mt-1 font-serif text-outcomes-title font-semibold tracking-tight">
          The Pennsylvania Coal Region
        </h1>
        <p className="mt-3 max-w-3xl font-serif text-lead-copy leading-relaxed text-muted">
          Northeastern Pennsylvania held the country&rsquo;s densest early
          concentration of Lithuanian parish life. This page follows the
          complete 15-institution regional comparison and links every entry to
          its individual record.
        </p>
      </header>

      <section className="mt-8 border-y border-rule py-6">
        <div className="grid gap-7 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)]">
          <div>
            <p className="font-mono text-small-copy uppercase tracking-widest text-muted">
              Regional comparison
            </p>
            <p className="mt-2 font-serif text-outcomes-title font-semibold leading-none">
              {pennsylvaniaCoalRegion.population}
            </p>
            <h2 className="mt-2 font-serif text-subsection-title font-semibold">
              Lithuanian parish institutions
            </h2>
            <p className="mt-3 text-body-copy leading-relaxed text-muted">
              The bounded comparison contains {counts.diocese_owned} diocesan
              Roman Catholic parishes and one Lithuanian National Catholic
              comparison. It is a regional analytic set, not a new national
              denominator.
            </p>
          </div>

          <div className="border-t border-rule pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <p className="font-serif text-section-title font-semibold">
              {counts.diocese_ended} of {counts.diocese_owned}
            </p>
            <p className="mt-1 font-serif text-compact-heading font-semibold">
              diocesan parishes ended by diocesan decision
            </p>
            <div
              className="mt-5 flex h-4 overflow-hidden rounded-sm bg-band"
              role="img"
              aria-label={`${counts.diocese_ended} of ${counts.diocese_owned} diocesan parishes ended by diocesan decision; ${diocesanOther.length} have other documented institutional outcomes`}
            >
              <span
                className="h-full bg-[var(--es-closed)]"
                style={{
                  width: `${(counts.diocese_ended / counts.diocese_owned) * 100}%`,
                }}
              />
              <span className="h-full flex-1 bg-[var(--es-transferred)]" />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-small-copy text-muted">
              <span>{counts.diocese_ended} ended by diocesan decision</span>
              <span>{diocesanOther.length} in other documented outcomes</span>
            </div>
            <p className="mt-4 text-support-copy leading-relaxed text-muted">
              This compares institutional governance and outcome. It does not
              claim that ownership alone caused an outcome, and it does not
              describe whether a church building still stands. Physical sites
              are recorded separately in the buildings view of Parish &amp;
              Mission Status.
            </p>
          </div>
        </div>
      </section>

      <section className="pt-9">
        <p className="text-small-copy uppercase tracking-widest text-muted">
          Complete regional list
        </p>
        <h2 className="mt-1 font-serif text-section-title font-semibold">
          Diocesan Roman Catholic parishes · {diocesanParishes.length}
        </h2>
        <p className="mt-2 max-w-3xl text-body-copy leading-relaxed text-muted">
          Each label describes the Lithuanian institution&rsquo;s present
          canonical status. Open a profile for its history, sources,
          continuation relationships, and recorded worship sites.
        </p>
        <ul className="mt-5 grid gap-x-8 md:grid-cols-2">
          {diocesanParishes.map((institution) => (
            <InstitutionRow
              key={institution.culturenet_entity_id}
              institution={institution}
            />
          ))}
        </ul>
      </section>

      <section className="mt-8 border-t border-rule pt-8">
        <h2 className="font-serif text-section-title font-semibold">
          National/Independent Catholic comparison · {independentComparisons.length}
        </h2>
        <p className="mt-2 max-w-3xl text-body-copy leading-relaxed text-muted">
          This comparison belongs to a different Catholic tradition and is
          marked separately rather than folded into the diocesan Roman
          Catholic total.
        </p>
        <ul className="mt-4 max-w-2xl">
          {independentComparisons.map((institution) => (
            <InstitutionRow
              key={institution.culturenet_entity_id}
              institution={institution}
            />
          ))}
        </ul>
      </section>

      <footer className="mt-10 border-t border-rule pt-5 text-support-copy text-muted">
        <Link
          href="/history#beginning"
          className="font-medium text-foreground underline hover:text-accent"
        >
          Read how the national parish network began in Pennsylvania coal
          country
        </Link>
        {" · "}
        <Link
          href="/where-every-parish-ended-up"
          className="font-medium text-foreground underline hover:text-accent"
        >
          Compare all parish and mission outcomes
        </Link>
        {" · "}
        <Link
          href="/about-the-data"
          className="font-medium text-foreground underline hover:text-accent"
        >
          About the data
        </Link>
      </footer>
    </article>
  );
}
