import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  widerCatholicLifeBySlug,
  widerCatholicLifeRecords,
} from "@/lib/wider-catholic-life";
import { getWiderCatholicLifeEvidence } from "@/lib/wider-catholic-life-evidence";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return widerCatholicLifeRecords.map((record) => ({ slug: record.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = widerCatholicLifeBySlug.get(slug);
  return record
    ? {
        title: record.nameEn,
        description: `${record.classificationLabel} in ${record.city}, ${record.state}, documented in the wider record of Lithuanian Catholic life in the United States.`,
      }
    : {};
}

export default async function WiderCatholicLifePage({ params }: PageProps) {
  const { slug } = await params;
  const record = widerCatholicLifeBySlug.get(slug);
  if (!record) notFound();
  const evidence = getWiderCatholicLifeEvidence(record.entityId);
  const currentExplanation = evidence.ministry
    ? `The sisters’ Putnam motherhouse and Immaculate Conception Center continue a ministry of ${evidence.ministry}.`
    : record.explanation;

  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 pt-10">
      <p className="text-ui-label font-medium uppercase tracking-widest text-muted">
        Wider Lithuanian Catholic life
      </p>
      <h1 className="mt-2 font-serif text-page-title font-semibold leading-tight">
        {record.nameLt}
      </h1>
      <p className="mt-2 font-serif text-card-title text-muted">
        {record.nameEn}
      </p>

      <dl className="mt-7 grid gap-4 border-y border-rule py-5 text-body-copy sm:grid-cols-2">
        <div>
          <dt className="text-ui-label font-medium uppercase tracking-wide text-muted">
            Classification
          </dt>
          <dd className="mt-1 font-medium">{record.classificationLabel}</dd>
        </div>
        <div>
          <dt className="text-ui-label font-medium uppercase tracking-wide text-muted">
            Current record
          </dt>
          <dd className="mt-1 font-medium">{record.currentStatus}</dd>
        </div>
        <div>
          <dt className="text-ui-label font-medium uppercase tracking-wide text-muted">
            Location
          </dt>
          <dd className="mt-1">
            {record.city}, {record.state}
            <br />
            <span className="text-muted">{record.address}</span>
          </dd>
        </div>
        {record.hostName ? (
          <div>
            <dt className="text-ui-label font-medium uppercase tracking-wide text-muted">
              Host church
            </dt>
            <dd className="mt-1">
              {record.hostSite ? (
                <a
                  href={record.hostSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-accent"
                >
                  {record.hostName}
                </a>
              ) : (
                record.hostName
              )}
            </dd>
          </div>
        ) : null}
      </dl>

      <section className="mt-9" aria-labelledby="current-standing-heading">
        <h2
          id="current-standing-heading"
          className="font-serif text-section-title font-semibold"
        >
          Where it stands today
        </h2>
        <p className="mt-3 leading-relaxed">{currentExplanation}</p>
        {record.latestDocumentedMass ? (
          <p className="mt-3 leading-relaxed">
            Latest Lithuanian Mass documented in the reviewed evidence: {" "}
            <strong>{record.latestDocumentedMass}</strong>.
          </p>
        ) : null}
      </section>

      <aside className="mt-9 border-l-2 border-rule pl-4 text-small-copy leading-relaxed text-muted">
        This record sits outside the 155-institution public census, the 137
        Roman Catholic parish-and-mission histories, and the 14-place regular
        current-worship network. It broadens the view of Lithuanian Catholic
        life without changing those populations.
      </aside>

      <section className="mt-10" aria-labelledby="sources-heading">
        <h2
          id="sources-heading"
          className="font-serif text-section-title font-semibold"
        >
          Sources
        </h2>
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {evidence.sources.map((source) => (
            <li key={source.id} className="py-3">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 hover:text-accent"
              >
                {source.title} ↗
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-small-copy text-muted">
          Current classification as of {record.observedAt}. The map marker uses
          the verified street address.
        </p>
      </section>

      <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-small-copy">
        <Link
          href="/lithuanian-catholic-life-today"
          className="font-medium underline underline-offset-2 hover:text-accent"
        >
          Lithuanian Catholic life today
        </Link>
        <Link
          href="/parishes"
          className="underline underline-offset-2 hover:text-accent"
        >
          All parish, mission, and congregation profiles
        </Link>
      </nav>
    </article>
  );
}
