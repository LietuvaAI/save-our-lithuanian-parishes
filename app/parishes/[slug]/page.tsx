import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import registry from "@/data/registry-unified.json";
import alertsData from "@/data/alerts.json";
import { getClearedPhoto, clearedOrNull } from "@/lib/photos";
import contextPoints from "@/data/context-points.json";
import { toScopedParish, type RegParish } from "@/lib/registry-scope";
import {
  parishes,
  getParishSituation,
  ENDING_MODE_LABEL,
  OWNERSHIP_LABEL,
  INSTITUTION_TYPE_LABEL,
  BUILDING_FATE_LABEL,
  type BuildingFate,
  type LithuanianIdentity,
} from "@/lib/parishes";
import { resolveEndState, isLoss } from "@/lib/end-state";
import { splitStory } from "@/lib/dek";
import { EndStatePill } from "@/components/EndStatePill";
import { ProfileSourceLedger } from "@/components/ProfileSourceLedger";
import ParishContextMap from "@/components/ParishContextMap";
import {
  draugasProfileSources,
  finalizeProfileSources,
  linkedProfileSources,
  photoProfileSource,
  projectProfileSource,
  registryProfileSources,
  type RegistryProfileSource,
} from "@/lib/profile-sources";
import {
  CLERGY_LABEL,
  FREQUENCY_LABEL,
  GOVERNANCE_LABEL,
} from "@/lib/watch-labels";

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

type RegistrySource = {
  axis?: string;
  work?: string;
  pages?: string;
  cites?: string;
  first_mention?: string;
  last_mention?: string;
  total_mentions?: number;
  sourceUrl?: string;
  school?: string;
  convent?: string;
  cemetery?: string;
  diocese?: string;
  description?: string;
  architect?: string;
  ethnic_status?: string;
  lens?: string;
};

type RegistryEntry = Omit<RegParish, "sources"> & {
  sources?: RegistrySource[];
};

type AlertSource = {
  url: string;
  publisher: string;
  title?: string;
};

type DispatchLink = {
  url: string;
  title: string;
};

type WatchPhoto = {
  url?: string;
  alt?: string;
  attribution?: string;
  license?: string;
  archiveUrl?: string;
  rights?: string;
};

type ParishAlertEntry = {
  parishLink: string;
  level: string;
  whatChanged: string;
  sources: AlertSource[];
};

type ParishCampaignEntry = {
  parishLink: string;
  hearthUrl?: string;
  dispatches?: DispatchLink[];
};

type SustainabilityWatchEntry = {
  parishLink: string;
  situation: string;
  clergy: {
    arrangement: string;
    detail: string;
  };
  liturgy: {
    frequency: string;
    detail: string;
  };
  governance: string;
  governanceDetail: string;
  survivedThreats?: string | null;
  financial?: string | null;
  sources: AlertSource[];
  dateObserved: string;
  hearthUrl?: string | null;
  dispatches?: DispatchLink[];
  photo?: WatchPhoto | null;
};

type AlertsPayload = {
  alerts: ParishAlertEntry[];
  campaigns: ParishCampaignEntry[];
  sustainabilityWatch?: SustainabilityWatchEntry[];
};

const alerts = alertsData as AlertsPayload;

function loadCaseRecord(slug: string): CaseRecord | null {
  const p = join(process.cwd(), "data", "case-records", `${slug}.json`);
  return existsSync(p) ? (JSON.parse(readFileSync(p, "utf-8")) as CaseRecord) : null;
}

// Build a registrySlug → registry-entry index for scholarly-source lookups.
const registryBySlug = new Map(
  (registry as { parishes: RegistryEntry[] }).parishes.map((p) => [p.slug, p])
);

/** Extract Wolkovich and/or Michelsonas sources for a canonical parish. */
function getScholarlySources(registrySlug: string | null): RegistrySource[] {
  if (!registrySlug) return [];
  const entry = registryBySlug.get(registrySlug);
  if (!entry) return [];
  return (entry.sources ?? []).filter(
    (s) => s.axis === "wolkovich" || s.axis === "michelsonas-1961" || s.axis === "lukas-2009"
  );
}

/** Find the alert and/or campaign for a parish by its canonical slug. */
function getParishAlert(slug: string) {
  const matchLink = `/parishes/${slug}`;
  const alert = alerts.alerts.find((a) => a.parishLink === matchLink);
  const campaign = alerts.campaigns.find((c) => c.parishLink === matchLink);
  return { alert, campaign };
}

/** Find the sustainability-watch entry for a parish by its canonical slug. */
function getSustainabilityWatch(slug: string) {
  const matchLink = `/parishes/${slug}`;
  return (alerts.sustainabilityWatch ?? []).find(
    (e) => e.parishLink === matchLink
  ) ?? null;
}

// Photo lookup lives in lib/photos.ts — the rights gate: only images with
// cleared rights (permission_granted / public_domain / open_license /
// own_work) ever render.

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


/** The one-sentence story a profile opens with: curated situation text when
 *  it exists, otherwise an honest sentence composed from the record. */
function storyDek(
  parish: (typeof parishes)[number],
  situationText: string | null,
  endState: ReturnType<typeof resolveEndState>,
  foundedYear: number | null,
  closedYear: number | null,
): { dek: string; rest: string | null } {
  if (situationText) return splitStory(situationText);
  const f = foundedYear ? `Founded ${foundedYear}. ` : "";
  const c = closedYear ? ` in ${closedYear}` : "";
  switch (endState) {
    case "unresolved":
      return { dek: `${f}The church stands and the parish's fate is canonically unresolved — the decision is not final.`, rest: null };
    case "active_parish":
      return { dek: `${f}It still stands as an active Lithuanian parish today.`, rest: null };
    case "mass_continues":
      return { dek: `${f}A Lithuanian Mass continues here, within a parish that is no longer Lithuanian-led.`, rest: null };
    case "transferred":
      return { dek: `${f}The church lives on, serving another community; its life as a Lithuanian parish has ended.`, rest: null };
    case "demolished":
      return { dek: `${f}The parish was closed${c}, and the church was demolished.`, rest: null };
    case "repurposed":
      return { dek: `${f}The parish was closed${c}, and the building was sold on.`, rest: null };
    case "closed":
      return { dek: `${f}The parish was closed${c}.`, rest: null };
    default:
      return { dek: `${f}Attested in the record; its fate has not yet been established.`, rest: null };
  }
}

export default async function ParishPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parish = parishes.find((p) => p.slug === slug);
  if (!parish) notFound();
  const registryEntry = parish.registrySlug ? registryBySlug.get(parish.registrySlug) : null;
  const scoped = registryEntry ? toScopedParish(registryEntry) : null;
  const foundedYear = scoped?.founded ?? parish.yearFounded;
  const closedYear = scoped?.closed ?? parish.yearClosed;
  const buildingFate = scoped?.buildingFate ?? parish.buildingFate;
  const endingMode = scoped?.endingMode ?? parish.endingMode;
  const caseRecord = loadCaseRecord(slug);
  const situation = getParishSituation(slug);
  const scholarlySources = getScholarlySources(parish.registrySlug);
  const { alert: parishAlert, campaign: parishCampaign } = getParishAlert(slug);
  const watchEntry = getSustainabilityWatch(slug);
  const campaignDispatches = parishCampaign?.dispatches ?? [];
  const watchDispatches = watchEntry?.dispatches ?? [];

  // Photo: prefer photos.json, fall back to sustainability-watch entry.
  // Both paths pass through the rights gate — uncleared images never render.
  const photosEntry = getClearedPhoto(slug);
  const watchPhoto = clearedOrNull(watchEntry?.photo);
  const photo = photosEntry
    ? photosEntry
    : watchPhoto?.url
      ? {
          src: watchPhoto.url,
          alt: watchPhoto.alt ?? `${parish.nameLt} photo`,
          attribution: watchPhoto.attribution ?? "",
          license: watchPhoto.license,
          archiveUrl: watchPhoto.archiveUrl,
        }
      : null;

  const caseSources = caseRecord
    ? [
        ...linkedProfileSources(caseRecord.sources, {
          group: "current",
          context: "Current verified case record",
          fallbackTitle: "Current case-record source",
        }),
        ...caseRecord.developments.flatMap((development) =>
          linkedProfileSources(development.sources, {
            group: "current",
            context: `Development: ${development.headline}`,
            fallbackTitle: "Development source",
          }),
        ),
      ]
    : [];
  const alertSources = parishAlert
    ? linkedProfileSources(parishAlert.sources, {
        group: "current",
        context: "Current threat alert",
        fallbackTitle: "Parish alert source",
      })
    : [];
  const watchSources = watchEntry
    ? linkedProfileSources(watchEntry.sources, {
        group: "current",
        context: `Sustainability watch checked ${watchEntry.dateObserved}`,
        fallbackTitle: "Sustainability-watch source",
      })
    : [];
  const situationSources = situation?.sources
    ? linkedProfileSources(situation.sources, {
        group: "current",
        context: "Adjudicated situation record",
        fallbackTitle: "Situation-record source",
      })
    : [];
  const projectSources = [
    ...campaignDispatches.flatMap((dispatch) =>
      projectProfileSource(
        dispatch.url,
        dispatch.title,
        "Related Židinys campaign dispatch",
      ),
    ),
    ...watchDispatches.flatMap((dispatch) =>
      projectProfileSource(
        dispatch.url,
        dispatch.title,
        "Related Židinys sustainability dispatch",
      ),
    ),
    ...projectProfileSource(
      parishCampaign?.hearthUrl,
      "Židinys campaign page",
      "Current campaign action page",
    ),
    ...projectProfileSource(
      watchEntry?.hearthUrl,
      "Židinys sustainability dispatch",
      "Current sustainability-watch publication",
    ),
  ];
  const profileSources = finalizeProfileSources([
    draugasProfileSources(parish.citations),
    registryProfileSources(
      (registryEntry?.sources ?? []) as RegistryProfileSource[],
    ),
    caseSources,
    alertSources,
    watchSources,
    situationSources,
    projectSources,
    photoProfileSource(photo),
  ]);

  // The one status verdict, from the shared resolver.
  const isStanding = parish.status === "standing";
  const endState =
    scoped?.endState ??
    resolveEndState(
      (parish.lithuanianIdentity as LithuanianIdentity | null) ?? null,
      (parish.buildingFate as BuildingFate | null) ?? null,
      parish.yearClosed != null || !isStanding,
      isStanding,
      parish.endingMode,
    );

  const { dek, rest } = storyDek(
    parish,
    situation?.situation ?? null,
    endState,
    foundedYear,
    closedYear,
  );

  const showWhatHappened =
    isLoss(endState) ||
    endState === "unresolved" ||
    parish.survivedReviewThenClosed ||
    !!parish.notes;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        <Link href="/record" className="underline hover:text-foreground">
          The Record
        </Link>{" "}
        / {parish.city}, {parish.state}
      </p>

      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        {parish.nameLt}
      </h1>
      <p className="mt-1 text-lg text-muted">
        {parish.city}, {parish.state}
      </p>

      {/* The verdict comes first — before the story (Vilija 2026-07-27:
          the status must be the first thing a reader sees). */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EndStatePill value={endState} size="lg" />
        {(parishAlert || watchEntry) && (
          <span
            className="rounded-full border-2 px-3 py-0.5 text-xs font-semibold"
            style={{
              borderColor: parishAlert ? "var(--es-closed)" : "var(--mark-ink)",
              color: parishAlert ? "var(--es-closed)" : "var(--mark-ink)",
            }}
          >
            {parishAlert
              ? parishCampaign
                ? "Active campaign"
                : "Under threat"
              : "Sustainability watch"}
          </span>
        )}
      </div>

      <p className="mt-4 font-serif text-xl sm:text-2xl leading-snug max-w-2xl">
        {dek}
      </p>
      {rest && (
        <p className="mt-3 leading-relaxed max-w-2xl text-muted">{rest}</p>
      )}

      {/* ══ The church and its place — photo beside the diocese zoom ══ */}
      {(() => {
        const hasMap = (
          contextPoints.points as {
            slug: string;
            diocese: string | null;
            congregationClass: string | null;
          }[]
        ).some(
          (p) =>
            p.slug === parish.slug &&
            p.diocese &&
            p.congregationClass === "roman_catholic",
        );
        if (!photo && !hasMap) return null;
        return (
          <section className="mt-10">
            <h2 className="font-serif text-xl font-semibold">
              The church and its place
            </h2>
            <p className="mt-1 text-sm text-muted">
              Among its neighbors — no parish stands alone.
            </p>
            <div
              className={`mt-4 grid gap-5 items-start ${photo && hasMap ? "sm:grid-cols-2" : ""}`}
            >
              {photo && (
                <div className="overflow-hidden rounded-lg border border-rule">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={640}
                    height={427}
                    className="w-full h-auto object-cover"
                  />
                  <p className="px-3 py-1.5 text-xs text-muted">
                    {photo.attribution}
                    {photo.license && <span> · {photo.license}</span>}
                  </p>
                </div>
              )}
              {hasMap && (
                <div className={photo ? "" : "max-w-xl"}>
                  <ParishContextMap slug={parish.slug} />
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* ══ What it was ══ */}
      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold">What it was</h2>
        <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Founded</dt>
            <dd className="mt-0.5">{foundedYear ?? "Not established"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Type</dt>
            <dd className="mt-0.5">{INSTITUTION_TYPE_LABEL[parish.institutionType]}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Ownership</dt>
            <dd className="mt-0.5">{OWNERSHIP_LABEL[parish.ownership]}</dd>
          </div>
          {parish.comparator && (
            <div className="col-span-full">
              <dt className="text-xs uppercase tracking-wide text-muted">Scope</dt>
              <dd className="mt-0.5">Canadian comparator — documented for contrast, outside the U.S. figures</dd>
            </div>
          )}
        </dl>

        {scholarlySources.length > 0 && (
          <div className="mt-5">
            <p className="text-sm text-muted leading-relaxed">
              As the published record describes it — quoted descriptions are
              the author&#8217;s own characterization.
            </p>
            <div className="mt-4 space-y-5 border-l-2 border-rule pl-4">
              {scholarlySources.map((s, i) => {
                const isWolkovich = s.axis === "wolkovich";
                const isLukas = s.axis === "lukas-2009";
                const hasDetail =
                  s.school || s.convent || s.cemetery ||
                  (s.diocese && !/^(none|unknown|unspecified)$/i.test(s.diocese));
                return (
                  <div
                    key={i}
                    className="text-sm"
                  >
                    <p className="font-medium">
                      {isLukas ? (
                        <>
                          Lukas,{" "}
                          <em>Lietuvių Kultūrinis Paveldas Amerikoje</em> (2009)
                        </>
                      ) : isWolkovich ? (
                        <>
                          Wolkovich-Valkavičius,{" "}
                          <em>Lithuanian Religious Life in America</em>, Vol.&nbsp;3
                          (1998)
                        </>
                      ) : (
                        <>
                          Michelsonas,{" "}
                          <em>Lietuvių Išeivija Amerikoje</em> (1868–1961),
                          Keleivis, 1961
                        </>
                      )}
                      {s.pages && (
                        <span className="text-muted font-normal">
                          , {s.pages}
                        </span>
                      )}
                    </p>
                    {isLukas && s.description && (
                      <p className="mt-2 leading-relaxed text-muted">
                        {s.description}
                      </p>
                    )}
                    {isLukas && s.architect && (
                      <p className="mt-1 text-muted">Architect: {s.architect}</p>
                    )}
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
          </div>
        )}
      </section>

      {/* ══ What happened ══ */}
      {showWhatHappened && (
        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold">What happened</h2>
          <dl className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
            {isLoss(endState) && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Closed</dt>
                <dd className="mt-0.5">{closedYear ?? "Not established"}</dd>
              </div>
            )}
            {endingMode && endingMode !== "standing" && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Decision</dt>
                <dd className="mt-0.5">{ENDING_MODE_LABEL[endingMode]}</dd>
              </div>
            )}
            {buildingFate && buildingFate !== "unknown" && buildingFate !== "standing" && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Building</dt>
                <dd className="mt-0.5">{BUILDING_FATE_LABEL[buildingFate as BuildingFate]}</dd>
              </div>
            )}
          </dl>

          {parish.survivedReviewThenClosed && (
            <p
              className="mt-5 rounded-lg border border-rule p-4 leading-relaxed"
              style={{ borderLeft: "4px solid var(--es-closed)" }}
            >
              This parish <strong>survived an earlier diocesan review</strong> —
              and a later one still reached it. It is one of the seven parishes in
              the record showing that surviving one restructuring buys time, not
              safety.
            </p>
          )}

          {parish.notes && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-muted">
                From the record
              </p>
              <p className="mt-1 leading-relaxed">{parish.notes}</p>
            </div>
          )}
        </section>
      )}

      {/* ══ Where it stands today ══ */}
      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold">
          Where it stands today
        </h2>

        {!parishAlert && !watchEntry && !caseRecord && situation?.current_use && situation.current_use !== "Unknown" && (
          <p className="mt-2 leading-relaxed">
            Current use: {situation.current_use}.
          </p>
        )}
        {!parishAlert && !watchEntry && !caseRecord && (!situation?.current_use || situation.current_use === "Unknown") && (
          <p className="mt-2 leading-relaxed text-muted">
            The present-day record for this parish is still being researched.
            If you know its current state,{" "}
            <Link href="/report" className="underline hover:text-foreground">
              tell us
            </Link>
            .
          </p>
        )}

        {parishAlert && (
          <div
            className="mt-4 rounded-lg border-2 px-4 py-3.5"
            style={{ borderColor: parishAlert.level === "red" ? "var(--es-closed)" : "var(--color-amber-600)" }}
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
                  style={{ background: "var(--es-transferred)", color: "#1c1917" }}
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
              Evidence and full source links are listed below.
            </p>
            {campaignDispatches.length > 0 && (
              <div className="mt-3 border-t border-rule pt-3">
                <p className="text-xs uppercase tracking-wide text-muted mb-1.5">
                  From Židinys (The Hearth)
                </p>
                <ul className="space-y-1">
                  {campaignDispatches.map((d) => (
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
          </div>
        )}

        {watchEntry && (
          <div className="mt-4 rounded-lg border border-rule overflow-hidden">
            <div className="px-4 pt-3.5 pb-3">
              <p className="text-xs uppercase tracking-widest text-muted">
                Sustainability Watch
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
                  <p className="font-medium">{FREQUENCY_LABEL[watchEntry.liturgy.frequency] ?? watchEntry.liturgy.frequency}</p>
                  <p className="mt-1 text-xs text-muted">{watchEntry.liturgy.detail}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted mb-1">Governance</p>
                  <p className="font-medium">{GOVERNANCE_LABEL[watchEntry.governance] ?? watchEntry.governance}</p>
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
                Evidence listed below · checked {watchEntry.dateObserved}
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
                  Sustainability Watch &rarr;
                </Link>
              </div>
            </div>
            {watchDispatches.length > 0 && (
              <div className="border-t border-rule px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-muted mb-1.5">
                  From Židinys (The Hearth)
                </p>
                <ul className="space-y-1">
                  {watchDispatches.map((d) => (
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
          </div>
        )}

        {caseRecord && (
          <div className="mt-6">
            <h3 className="font-serif text-lg font-semibold">
              The verified record
            </h3>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">
              as of {caseRecord.asOf} ·{" "}
              {caseRecord.confidence === "verified"
                ? "verified against published sources"
                : caseRecord.confidence === "reported"
                  ? "reported — corroboration limited"
                  : "thin — treat with caution"}
            </p>
            <p className="mt-3 leading-relaxed">{caseRecord.summary}</p>
            {caseRecord.developments.length > 0 && (() => {
              const devs = [...caseRecord.developments].sort((a, b) =>
                b.date.localeCompare(a.date),
              );
              const recent = devs.slice(0, 4);
              const older = devs.slice(4);
              const entry = (d: (typeof devs)[number]) => (
                <li key={`${d.date}-${d.headline}`}>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {d.date}
                  </p>
                  <p className="font-medium">{d.headline}</p>
                  <p className="text-sm text-muted leading-relaxed">{d.detail}</p>
                  {d.sources.length > 0 && (
                    <p className="mt-1 text-xs text-muted">
                      Sources:{" "}
                      {[...new Set(d.sources.map((source) => source.publisher || source.title))].join(", ")}
                    </p>
                  )}
                </li>
              );
              return (
                <div className="mt-6">
                  <h3 className="font-serif text-lg font-semibold">
                    The trail of events
                  </h3>
                  <ol className="mt-3 space-y-4 border-l-2 border-rule pl-4">
                    {recent.map(entry)}
                  </ol>
                  {older.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-muted underline hover:text-foreground">
                        Earlier entries ({older.length})
                      </summary>
                      <ol className="mt-3 space-y-4 border-l-2 border-rule pl-4">
                        {older.map(entry)}
                      </ol>
                    </details>
                  )}
                </div>
              );
            })()}
            {caseRecord.gaps && (
              <p className="mt-4 text-sm text-muted leading-relaxed">
                <span className="font-medium text-foreground">
                  What we could not yet establish:
                </span>{" "}
                {caseRecord.gaps}
              </p>
            )}
          </div>
        )}
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
            style={{ background: "var(--es-closed)" }}
          >
            Report it
          </Link>
        </p>
      </section>

      <ProfileSourceLedger sources={profileSources} />
    </div>
  );
}
