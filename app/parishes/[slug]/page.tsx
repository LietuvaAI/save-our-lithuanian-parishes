import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkIcon } from "@/components/marks";
import {
  parishes,
  draugasCitationUrl,
  ENDING_MODE_LABEL,
  OWNERSHIP_LABEL,
  STATUS_LABEL,
} from "@/lib/parishes";

interface CaseSource {
  title: string;
  publisher: string;
  date: string;
  url: string;
}

interface CaseRecord {
  asOf: string;
  buildingStatus: string;
  currentUse: string;
  summary: string;
  developments: {
    date: string;
    headline: string;
    detail: string;
    sources: CaseSource[];
  }[];
  sources: CaseSource[];
  confidence: "verified" | "reported" | "thin";
  conflictsWithArchiveRecord: string;
  gaps: string;
}

function loadCaseRecord(slug: string): CaseRecord | null {
  const p = join(process.cwd(), "data", "case-records", `${slug}.json`);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf-8")) as CaseRecord) : null;
}

export function generateStaticParams() {
  return parishes.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parish = parishes.find((p) => p.slug === slug);
  if (!parish) return {};
  return {
    title: `${parish.nameLt} — ${parish.city}, ${parish.state}`,
    description: `${parish.nameLt} (${parish.city}, ${parish.state}): ${OWNERSHIP_LABEL[parish.ownership]}, ${ENDING_MODE_LABEL[parish.endingMode].toLowerCase()}. Every fact traced to dated Draugas issues.`,
  };
}

export default async function ParishPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parish = parishes.find((p) => p.slug === slug);
  if (!parish) notFound();
  const caseRecord = loadCaseRecord(slug);

  const facts: [string, string][] = [
    ["Ownership", OWNERSHIP_LABEL[parish.ownership]],
    ["Status", STATUS_LABEL[parish.status]],
    ["Founded", parish.yearFounded ? String(parish.yearFounded) : "Not established by the research"],
    ["Closed", parish.yearClosed ? String(parish.yearClosed) : parish.status === "standing" ? "—" : "Not established by the research"],
  ];
  if (parish.coalRegion) {
    facts.push(["Region", "Pennsylvania coal region"]);
  }
  if (parish.comparator) {
    facts.push(["Scope", "Canadian comparator — documented for contrast, outside the U.S. figures"]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted">
        <Link href="/parishes" className="underline hover:text-foreground">
          Parish Profiles
        </Link>{" "}
        / {parish.city}, {parish.state}
      </p>

      <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold">
        {parish.nameLt}
      </h1>
      <p className="mt-1 text-lg text-muted">
        {parish.city}, {parish.state}
      </p>

      <p className="mt-5 inline-flex items-center gap-2 rounded-lg border border-rule px-4 py-2.5">
        <MarkIcon mode={parish.endingMode} size={16} />
        <span className="font-medium">{ENDING_MODE_LABEL[parish.endingMode]}</span>
      </p>

      <dl className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>

      {parish.survivedReviewThenClosed && (
        <p
          className="mt-8 rounded-lg border border-rule p-4 leading-relaxed"
          style={{ borderLeft: "4px solid var(--mark-closed)" }}
        >
          This parish <strong>survived an earlier diocesan review</strong> —
          and a later one still reached it. It is one of the seven parishes in
          the record showing that surviving one restructuring buys time, not
          safety.
        </p>
      )}

      {parish.notes && (
        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold">From the record</h2>
          <p className="mt-2 leading-relaxed">{parish.notes}</p>
        </section>
      )}

      {caseRecord && (
        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold">
            The present record
          </h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted">
            As of {caseRecord.asOf} ·{" "}
            {caseRecord.confidence === "verified"
              ? "verified against published sources"
              : caseRecord.confidence === "reported"
                ? "reported — corroboration limited"
                : "thin — treat with caution"}
          </p>
          <p className="mt-3 leading-relaxed">{caseRecord.summary}</p>
          {caseRecord.developments.length > 0 && (
            <ol className="mt-5 space-y-4 border-l-2 border-rule pl-4">
              {caseRecord.developments.map((d) => (
                <li key={`${d.date}-${d.headline}`}>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {d.date}
                  </p>
                  <p className="font-medium">{d.headline}</p>
                  <p className="text-sm text-muted leading-relaxed">
                    {d.detail}{" "}
                    {d.sources.map((s, i) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground whitespace-nowrap"
                      >
                        {s.publisher || s.title}
                        {i < d.sources.length - 1 ? ", " : ""}
                      </a>
                    ))}
                  </p>
                </li>
              ))}
            </ol>
          )}
          {caseRecord.gaps && (
            <p className="mt-4 text-sm text-muted leading-relaxed">
              <span className="font-medium text-foreground">
                What we could not yet establish:
              </span>{" "}
              {caseRecord.gaps}
            </p>
          )}
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">
          Original Draugas coverage
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Every fact above traces to dated issues of <em>Draugas</em>, the
          Lithuanian-American newspaper of record. Where the issue PDF is
          openly available, the link opens it directly; otherwise it opens the
          public Draugas archive for that year — find the issue by its date.
          Recent years may require a Draugas subscription.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {parish.citations.map((c) => (
            <li key={c.date}>
              <a
                href={draugasCitationUrl(c.date)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-md border border-rule px-3 py-1.5 text-sm hover:border-foreground transition-colors"
              >
                Draugas, {c.date} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mt-10 rounded-lg border border-rule p-5"
      >
        <p className="font-medium">
          Do you know this parish? Is something happening there now?
        </p>
        <p className="mt-1 text-sm text-muted">
          The record grows through people who were there — corrections,
          documents, and news are all welcome.
        </p>
        <p className="mt-3">
          <Link
            href="/report"
            className="inline-block rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "var(--mark-closed)" }}
          >
            Report it
          </Link>
        </p>
      </section>
    </div>
  );
}
