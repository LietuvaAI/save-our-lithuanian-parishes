import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EndStatePill } from "@/components/EndStatePill";
import HistoryChapterNav from "@/components/HistoryChapterNav";
import photosData from "@/data/photos.json";
import { historyProjection } from "@/lib/history-projection";
import { pennsylvaniaCoalRegion } from "@/lib/infographic-projection";

export const metadata: Metadata = {
  title: "The Beginning: Pennsylvania Coal Country",
  description:
    "How America’s Lithuanian parish network began in Pennsylvania coal country, followed by the complete northeastern Pennsylvania regional record.",
};

const shenandoahSlug = "sv-jurgio-shenandoah-pa";
const shenandoahDrawing =
  photosData.parishes["sv-jurgio-shenandoah-pa-line-drawing"];

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
  const historyCounts = historyProjection.counts;

  return (
    <article className="mx-auto max-w-5xl px-4 pb-12 pt-8">
      <HistoryChapterNav current="/pennsylvania-coal-region" />
      <header className="max-w-4xl">
        <p className="text-small-copy uppercase tracking-widest text-muted">
          Chapter I · The beginning
        </p>
        <h1 className="mt-1 font-serif text-outcomes-title font-semibold tracking-tight">
          Pennsylvania Coal Country
        </h1>
        <p className="mt-3 max-w-3xl font-serif text-lead-copy leading-relaxed text-muted">
          America&rsquo;s Lithuanian parish story begins in the coal towns of
          Pennsylvania. This chapter follows those first foundations and the
          complete {pennsylvaniaCoalRegion.population}-institution northeastern
          Pennsylvania regional comparison.
        </p>
      </header>

      <section className="mt-8 grid items-start gap-8 md:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)]">
        <figure>
          <div className="relative aspect-[4/5] overflow-hidden bg-band">
            <Image
              src={shenandoahDrawing.src}
              alt={shenandoahDrawing.alt}
              fill
              className="object-contain p-3"
              sizes="(min-width: 768px) 34vw, 100vw"
              priority
              unoptimized
            />
          </div>
          <figcaption className="mt-2 font-sans text-small-copy leading-relaxed text-muted">
            St. George Lithuanian church, Shenandoah, Pennsylvania.
          </figcaption>
        </figure>
        <div className="space-y-4 font-serif text-lead-copy leading-[1.7]">
          <p>
            Pennsylvania contains {historyCounts.pennsylvania} of the{" "}
            {historyCounts.total} documented Roman Catholic Lithuanian
            parishes. The earliest dated foundations in the state appear at
            Mount Carmel in 1886, Plymouth and Mahanoy City in 1888, and
            Pittston in 1890.
          </p>
          <p>
            St. George in Shenandoah followed in 1891. Its Lithuanian church
            was dedicated in 1893, and the parish became a central symbol of
            the first large Lithuanian settlement in the United States. The
            parish closed in 2006; the church was demolished in 2009.
          </p>
          <p>
            Northeastern Pennsylvania became the country&rsquo;s densest early
            concentration of Lithuanian parish life. The complete comparison
            below shows how those institutions began and where each stands
            today.
          </p>
          <Link
            href={`/parishes/${shenandoahSlug}`}
            className="inline-block font-sans text-body-copy font-semibold underline hover:text-accent"
          >
            Read the full St. George parish history
          </Link>
        </div>
      </section>

      <section className="mt-10 border-y border-rule py-6">
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
              comparison. It is shown separately from the national Roman
              Catholic parish total.
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
              This chart follows parish institutions, not individual church
              buildings. A parish and the buildings it used may have different
              histories.
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
          recorded institutional status. Open a profile for its history,
          sources, continuation relationships, and recorded worship sites.
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
          href="/history/two-waves-across-a-century"
          className="font-medium text-foreground underline hover:text-accent"
        >
          Next: two waves across a century
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
