import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkIcon } from "@/components/marks";
import { ClassifierGrid } from "@/components/ClassifierGrid";
import registry from "@/data/registry-unified.json";
import alertsData from "@/data/alerts.json";
import {
  parishes,
  draugasCitationUrl,
  getParishSituation,
  ENDING_MODE_LABEL,
  OWNERSHIP_LABEL,
  STATUS_LABEL,
  INSTITUTION_TYPE_LABEL,
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

// Build a registrySlug → registry-entry index for scholarly-source lookups.
const registryBySlug = new Map(
  (registry.parishes as any[]).map((p) => [p.slug, p])
);

/** Extract Wolkovich and/or Michelsonas sources for a canonical parish. */
function getScholarlySources(registrySlug: string | null): any[] {
  if (!registrySlug) return [];
  const entry = registryBySlug.get(registrySlug);
  if (!entry) return [];
  return entry.sources.filter(
    (s: any) => s.axis === "wolkovich" || s.axis === "michelsonas-1961"
  );
}

/** Find the alert and/or campaign for a parish by its canonical slug. */
function getParishAlert(slug: string) {
  const matchLink = `/parishes/${slug}`;
  const alert = (alertsData.alerts as any[]).find((a) => a.parishLink === matchLink);
  const campaign = (alertsData.campaigns as any[]).find((c) => c.parishLink === matchLink);
  return { alert, campaign };
}

/** Find the sustainability-watch entry for a parish by its canonical slug. */
function getSustainabilityWatch(slug: string) {
  const matchLink = `/parishes/${slug}`;
  return ((alertsData as any).sustainabilityWatch as any[]).find(
    (e) => e.parishLink === matchLink
  ) ?? null;
}

const CLERGY_LABEL: Record<string, string> = {
  lithuanian_klebonas: "Lithuanian-speaking klebonas",
  collaborative_pastor: "Shared pastor (not Lithuanian-speaking)",
  visiting_priest: "Visiting priest only",
  no_lithuanian_clergy: "No Lithuanian-speaking clergy",
  unknown: "Not yet established",
};

const FREQ_LABEL: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  occasional: "Occasional",
  none: "None",
  unknown: "Not yet established",
};

const GOV_LABEL: Record<string, string> = {
  standalone: "Standalone parish",
  collaborative: "In a diocesan collaborative",
  merged: "Post-merger entity",
  chapel: "Chapel",
  mission: "Mission",
  unknown: "Not yet established",
};

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
  const situation = getParishSituation(slug);
  const scholarlySources = getScholarlySources(parish.registrySlug);
  const { alert: parishAlert, campaign: parishCampaign } = getParishAlert(slug);
  const watchEntry = getSustainabilityWatch(slug);

  const facts: [string, string][] = [
    ["Status", STATUS_LABEL[parish.status]],
    ["Founded", parish.yearFounded ? String(parish.yearFounded) : "Not established by the research"],
    ["Closed", parish.yearClosed ? String(parish.yearClosed) : parish.status === "standing" ? "—" : "Not established by the research"],
  ];
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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rule px-3 py-1 text-sm font-medium">
          <MarkIcon mode={parish.endingMode} size={12} />
          {ENDING_MODE_LABEL[parish.endingMode]}
        </span>
        <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
          {INSTITUTION_TYPE_LABEL[parish.institutionType]}
        </span>
      </div>

      {watchEntry?.photo?.url && (
        <div className="mt-6 overflow-hidden rounded-lg border border-rule">
          <Image
            src={watchEntry.photo.url}
            alt={watchEntry.photo.alt}
            width={800}
            height={500}
            className="w-full object-cover"
          />
          <p className="px-3 py-1.5 text-xs text-muted">
            {watchEntry.photo.attribution}
            {watchEntry.photo.license && (
              <span> · {watchEntry.photo.license}</span>
            )}
          </p>
        </div>
      )}

      {situation && (
        <p className="mt-5 text-lg leading-relaxed">{situation.situation}</p>
      )}

      {situation && (
        <div className="mt-6">
          <ClassifierGrid
            situation={situation}
            ownership={parish.ownership}
            coalRegion={parish.coalRegion}
          />
        </div>
      )}

      <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-3 text-sm">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>

      {parishAlert && (
        <section
          className="mt-8 rounded-lg border-2 px-4 py-3.5"
          style={{ borderColor: parishAlert.level === "red" ? "var(--mark-closed)" : "var(--color-amber-600)" }}
        >
          <p className="text-xs uppercase tracking-widest text-muted">
            {parishCampaign ? "Active campaign" : "Under threat"}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{parishAlert.whatChanged}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {parishCampaign?.hearthUrl && (
              <a
                href={parishCampaign.hearthUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ background: "var(--mark-community)", color: "#1c1917" }}
              >
                How to help &rarr;
              </a>
            )}
            <Link
              href="/under-threat"
              className="inline-flex items-center gap-1 rounded-md border border-rule px-3 py-1.5 text-sm font-medium hover:border-foreground transition-colors"
            >
              All parishes under threat &rarr;
            </Link>
          </div>
          <p className="mt-2 text-xs text-muted">
            Sources:{" "}
            {parishAlert.sources.map((s: any, i: number) => (
              <span key={s.url}>
                {i > 0 && " \u00b7 "}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                  {s.publisher}
                </a>
              </span>
            ))}
          </p>
          {parishCampaign?.dispatches?.length > 0 && (
            <div className="mt-3 border-t border-rule pt-3">
              <p className="text-xs uppercase tracking-wide text-muted mb-1.5">
                From Židinys (The Hearth)
              </p>
              <ul className="space-y-1">
                {parishCampaign.dispatches.map((d: any) => (
                  <li key={d.url}>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline hover:text-foreground"
                    >
                      {d.title} &rarr;
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {watchEntry && (
        <section className="mt-8 rounded-lg border border-rule overflow-hidden">
          <div className="px-4 pt-3.5 pb-3">
            <p className="text-xs uppercase tracking-widest text-muted">
              The Vigil
            </p>
            <p className="mt-1.5 leading-relaxed">{watchEntry.situation}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted mb-1">Clergy</p>
                <p className="font-medium">{CLERGY_LABEL[watchEntry.clergy.arrangement] ?? watchEntry.clergy.arrangement}</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">{watchEntry.clergy.detail}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted mb-1">Lithuanian Mass</p>
                <p className="font-medium">{FREQ_LABEL[watchEntry.liturgy.frequency] ?? watchEntry.liturgy.frequency}</p>
                <p className="mt-1 text-xs text-muted">{watchEntry.liturgy.detail}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted mb-1">Governance</p>
                <p className="font-medium">{GOV_LABEL[watchEntry.governance] ?? watchEntry.governance}</p>
                <p className="mt-1 text-xs text-muted">{watchEntry.governanceDetail}</p>
              </div>
            </div>

            {watchEntry.survivedThreats && (
              <div className="mt-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted mb-0.5">Survived</p>
                <p className="text-muted leading-relaxed">{watchEntry.survivedThreats}</p>
              </div>
            )}
            {watchEntry.financial && (
              <div className="mt-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted mb-0.5">Financial signal</p>
                <p className="text-muted leading-relaxed">{watchEntry.financial}</p>
              </div>
            )}
          </div>
          <div className="border-t border-rule bg-background px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted">
              Sources:{" "}
              {(watchEntry.sources as any[]).map((s: any, i: number) => (
                <span key={s.url}>
                  {i > 0 && " · "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                    {s.publisher}
                  </a>
                </span>
              ))}
              {" · "}checked {watchEntry.dateObserved}
            </p>
            <div className="flex gap-2">
              {watchEntry.hearthUrl && (
                <a
                  href={watchEntry.hearthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-rule px-3 py-1 text-xs font-medium hover:border-foreground transition-colors"
                >
                  Read the dispatch &rarr;
                </a>
              )}
              <Link
                href="/sustainability-watch"
                className="rounded-md border border-rule px-3 py-1 text-xs font-medium hover:border-foreground transition-colors"
              >
                The Vigil &rarr;
              </Link>
            </div>
          </div>
          {watchEntry.dispatches?.length > 0 && (
            <div className="border-t border-rule px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted mb-1.5">
                From Židinys (The Hearth)
              </p>
              <ul className="space-y-1">
                {(watchEntry.dispatches as any[]).map((d: any) => (
                  <li key={d.url}>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline hover:text-foreground"
                    >
                      {d.title} &rarr;
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

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

      {scholarlySources.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold">Scholarly sources</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Cross-referenced from published monographs that independently
            documented this parish. Quoted descriptions are the author&#8217;s own
            characterization.
          </p>
          <div className="mt-3 space-y-3">
            {scholarlySources.map((s: any, i: number) => {
              const isWolkovich = s.axis === "wolkovich";
              const hasDetail =
                s.school || s.convent || s.cemetery ||
                (s.diocese && !/^(none|unknown|unspecified)$/i.test(s.diocese));
              return (
                <div
                  key={i}
                  className="rounded-lg border border-rule px-4 py-3 text-sm"
                >
                  <p className="font-medium">
                    {isWolkovich ? (
                      <a
                        href="https://archyvas.ziburioltmokykla.org/item/20260722_1784749031073"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-accent"
                      >
                        Wolkovich-Valkavičius,{" "}
                        <em>Lithuanian Religious Life in America</em>, Vol.&nbsp;3
                        (1998)
                      </a>
                    ) : (
                      <a
                        href="https://archyvas.ziburioltmokykla.org/item/20260225_lietuviu_iseivija_amerikoje"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-accent"
                      >
                        Michelsonas,{" "}
                        <em>Lietuvių Išeivija Amerikoje</em> (1868–1961),
                        Keleivis, 1961
                      </a>
                    )}
                    {s.pages && (
                      <span className="text-muted font-normal">
                        , {s.pages}
                      </span>
                    )}
                  </p>
                  {s.ethnic_status &&
                    !/^(none|unknown|unspecified)$/i.test(s.ethnic_status) && (
                      <p className="mt-2 italic leading-relaxed text-muted">
                        &ldquo;{s.ethnic_status}&rdquo;
                      </p>
                    )}
                  {hasDetail && (
                    <div className="mt-2 space-y-0.5 text-muted">
                      {s.diocese &&
                        !/^(none|unknown|unspecified)$/i.test(s.diocese) && (
                          <p>Diocese: {s.diocese}</p>
                        )}
                      {s.school && <p>School: {s.school}</p>}
                      {s.convent && <p>Convent: {s.convent}</p>}
                      {s.cemetery && <p>Cemetery: {s.cemetery}</p>}
                    </div>
                  )}
                  {s.lens && (
                    <p className="mt-2 text-xs italic text-muted">
                      Note: {s.lens}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {parish.registrySlug && (
            <p className="mt-3 text-sm text-muted">
              <Link
                href={`/registry/${parish.registrySlug}`}
                className="underline hover:text-foreground"
              >
                See the full research record →
              </Link>
            </p>
          )}
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
