import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  catholicLifeProfileBySlug,
  catholicLifeProfileRecords,
} from "@/lib/catholic-life-profiles";
import { getWiderCatholicLifeEvidence } from "@/lib/wider-catholic-life-evidence";
import { currentPastoralNetwork } from "@/lib/infographic-projection";
import { getClearedPhoto } from "@/lib/photos";
import {
  finalizeProfileSources,
  linkedProfileSources,
} from "@/lib/profile-sources";
import { ProfileSourceLedger } from "@/components/ProfileSourceLedger";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return catholicLifeProfileRecords.map((record) => ({ slug: record.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const record = catholicLifeProfileBySlug.get(slug);
  return record
    ? {
        title: record.nameEn,
        description: `${record.classificationLabel} in ${record.city}, ${record.state}, documented in the wider record of Lithuanian Catholic life in the United States.`,
      }
    : {};
}

export default async function WiderCatholicLifePage({ params }: PageProps) {
  const { slug } = await params;
  const record = catholicLifeProfileBySlug.get(slug);
  if (!record) notFound();
  const evidence = record.widerRecord
    ? getWiderCatholicLifeEvidence(record.widerRecord.entityId)
    : { sources: [], ministry: null };
  const currentExplanation = evidence.ministry
    ? `The sisters’ Putnam motherhouse and Immaculate Conception Center continue a ministry of ${evidence.ministry}.`
    : record.explanation;
  const portrait = getClearedPhoto(record.portraitKey);
  const directorySource = currentPastoralNetwork.directory.source;
  const sources = finalizeProfileSources([
    record.directoryEntry
      ? linkedProfileSources(
          [
            {
              title: String(directorySource.title),
              publisher: String(directorySource.publisher),
              date: String(directorySource.checked),
              url: String(directorySource.url),
              supports:
                "Official Sielovada directory membership, name, address, and listed ministry",
            },
          ],
          {
            group: "current",
            context: "Current pastoral-directory record",
            fallbackTitle: "Sielovada directory",
          },
        )
      : [],
    record.directoryEntry
      ? linkedProfileSources([record.directoryEntry.draugasEvidence], {
          group: "newspaper",
          context: "Reviewed Draugas evidence",
          fallbackTitle: "Reviewed Draugas source",
        })
      : [],
    linkedProfileSources(
      evidence.sources.map((source) => ({
        title: source.title,
        url: source.url,
      })),
      {
        group: "current",
        context: "Canonical current-status evidence",
        fallbackTitle: "Canonical source",
      },
    ),
  ]);

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

      {portrait ? (
        <figure className="mt-7 overflow-hidden border border-rule bg-band">
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={1200}
            height={720}
            className="h-auto w-full object-cover"
            priority
          />
          <figcaption className="border-t border-rule px-3 py-2 text-ui-label text-muted">
            {portrait.attribution}
          </figcaption>
        </figure>
      ) : null}

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
        {record.identityNote ? (
          <p className="mt-3 border-l-2 border-rule pl-4 text-small-copy leading-relaxed text-muted">
            {record.identityNote}
          </p>
        ) : null}
        {record.latestDocumentedMass ? (
          <p className="mt-3 leading-relaxed">
            Latest Lithuanian Mass documented in the reviewed evidence: {" "}
            <strong>{record.latestDocumentedMass}</strong>.
          </p>
        ) : null}
      </section>

      <aside className="mt-9 border-l-2 border-rule pl-4 text-small-copy leading-relaxed text-muted">
        {record.populationNote}
      </aside>

      <ProfileSourceLedger sources={sources} />
      <p className="mt-3 text-small-copy text-muted">
        Current classification as of {record.observedAt}.
      </p>

      <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-small-copy">
        <Link
          href="/lithuanian-catholic-life-today"
          className="font-medium underline underline-offset-2 hover:text-accent"
        >
          Lithuanian Catholic life today
        </Link>
        {record.officialSite ? (
          <a
            href={record.officialSite}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-accent"
          >
            Official website
          </a>
        ) : null}
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
