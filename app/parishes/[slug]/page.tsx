import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import alertsData from "@/data/alerts.json";
import contextPoints from "@/data/context-points.json";
import { EndStatePill } from "@/components/EndStatePill";
import ParishContextMap from "@/components/ParishContextMap";
import { ParishLifeTimeline } from "@/components/ParishLifeTimeline";
import {
  CONGREGATION_CLASS_LABEL,
  ParishPublishedRecord,
  ParishRecordReadings,
  RECORD_TYPE_LABEL,
  isCommunityRecord,
} from "@/components/ParishResearchRecord";
import { ProfileSourceLedger } from "@/components/ProfileSourceLedger";
import { splitStory } from "@/lib/dek";
import {
  GROUP_DESCRIPTION,
  isLoss,
  type EndState,
} from "@/lib/end-state";
import {
  canonicalParishProfiles,
  getCanonicalParishProfile,
  type CanonicalParishProfile,
} from "@/lib/parish-profile";
import {
  getParishTimeline,
  parishTimelineProfileSources,
} from "@/lib/parish-timelines";
import {
  BUILDING_FATE_LABEL,
  ENDING_MODE_LABEL,
  INSTITUTION_TYPE_LABEL,
  OWNERSHIP_LABEL,
  getParishSituation,
  getSituationByRegistrySlug,
  type BuildingFate,
} from "@/lib/parishes";
import { clearedOrNull, getClearedPhoto } from "@/lib/photos";
import {
  draugasProfileSources,
  finalizeProfileSources,
  linkedProfileSources,
  photoProfileSource,
  projectProfileSource,
  registryProfileSources,
} from "@/lib/profile-sources";
import { toScopedParish } from "@/lib/registry-scope";
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
  kind: "active" | "watch" | "building";
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

function loadCaseRecord(profile: CanonicalParishProfile): CaseRecord | null {
  for (const slug of new Set([profile.slug, profile.registrySlug])) {
    const path = join(process.cwd(), "data", "case-records", `${slug}.json`);
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, "utf-8")) as CaseRecord;
    }
  }
  return null;
}

function profileLinks(profile: CanonicalParishProfile) {
  return new Set([
    profile.href,
    `/registry/${profile.registrySlug}`,
    ...(profile.registry.aliases ?? []).map((alias) => `/registry/${alias}`),
  ]);
}

function getParishAlert(profile: CanonicalParishProfile) {
  const links = profileLinks(profile);
  return {
    alert: alerts.alerts.find((entry) => links.has(entry.parishLink)) ?? null,
    campaign:
      alerts.campaigns.find((entry) => links.has(entry.parishLink)) ?? null,
  };
}

function getSustainabilityWatch(profile: CanonicalParishProfile) {
  const links = profileLinks(profile);
  return (
    (alerts.sustainabilityWatch ?? []).find((entry) =>
      links.has(entry.parishLink),
    ) ?? null
  );
}

function profileName(profile: CanonicalParishProfile) {
  return (
    profile.core?.nameLt ||
    profile.registry.names.lt ||
    profile.registry.names.en ||
    profile.registry.slug
  );
}

function profileStory({
  situationText,
  endState,
  founded,
  closed,
  community,
}: {
  situationText: string | null;
  endState: EndState;
  founded: number | null;
  closed: number | null;
  community: boolean;
}) {
  const researched =
    situationText &&
    !/minimal research details available/i.test(situationText)
      ? situationText
      : null;
  if (researched) return splitStory(researched);

  const prefix = founded ? `Founded ${founded}. ` : "";
  if (community) {
    return {
      dek: `${prefix}A Lithuanian community that worshipped together is documented here, although the evidence does not establish a distinct national parish.`,
      rest: null,
    };
  }
  if (closed && isLoss(endState)) {
    return {
      dek: `${prefix}The record shows the parish closed in ${closed}; its fuller present-day story is still being researched.`,
      rest: null,
    };
  }
  if (endState === "demolished") {
    return {
      dek: `${prefix}The parish is closed and the church building has been demolished.`,
      rest: null,
    };
  }
  if (endState === "repurposed") {
    return {
      dek: `${prefix}The parish is closed and the church building has been repurposed.`,
      rest: null,
    };
  }
  if (endState === "closed") {
    return {
      dek: `${prefix}The parish is closed; its fuller story is still being researched.`,
      rest: null,
    };
  }
  return {
    dek: `${prefix}${GROUP_DESCRIPTION[endState]}`,
    rest: null,
  };
}

function researchRecordStory(recordType: string) {
  if (recordType === "phase") {
    return {
      dek: "The source record documents an independent or national Catholic attempt or phase here. It is preserved as historical evidence, not counted as a durable parish.",
      rest: null,
    };
  }
  if (recordType === "lead") {
    return {
      dek: "This is a bounded research lead whose identity or institutional status has not yet been established. It is preserved for verification, not counted as a parish or congregation.",
      rest: null,
    };
  }
  return {
    dek: "This entry preserves historical context connected to Lithuanian religious life. It does not establish a separate parish or congregation and is excluded from public institutional counts.",
    rest: null,
  };
}

function researchStatusCopy(recordType: string) {
  if (recordType === "phase") {
    return "This record describes a historical phase or attempt, not a separate present-day parish. The supporting evidence remains linked below.";
  }
  if (recordType === "lead") {
    return "This lead remains unresolved until its identity and institutional status can be verified. It is excluded from public counts.";
  }
  return "This entry provides historical context rather than documenting a separate parish. It is excluded from public counts.";
}

function ownershipLabel(profile: CanonicalParishProfile) {
  if (profile.core) return OWNERSHIP_LABEL[profile.core.ownership];
  const locked = profile.registry.locked?.ownership;
  if (locked === "diocese_rc") return "Diocese-owned Roman Catholic";
  if (locked === "national_catholic")
    return "Lithuanian National Catholic (community-owned)";
  if (locked === "other_self_owned") return "Community-owned";

  const surveyed = (profile.registry.sources ?? []).find(
    (source) =>
      source.ownership &&
      !/^(none|unknown|unspecified)$/i.test(source.ownership),
  )?.ownership;
  return surveyed ?? "Not established";
}

function institutionLabel(profile: CanonicalParishProfile, community: boolean) {
  if (community) return "Lithuanian worshipping community";
  if (profile.core) {
    return INSTITUTION_TYPE_LABEL[profile.core.institutionType];
  }
  return (
    RECORD_TYPE_LABEL[profile.registry.record_type ?? ""] ??
    CONGREGATION_CLASS_LABEL[profile.congregationClass ?? ""] ??
    "Parish record"
  );
}

export function generateStaticParams() {
  return canonicalParishProfiles.map((profile) => ({ slug: profile.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = getCanonicalParishProfile(slug);
  if (!profile) return {};
  const name = profileName(profile);
  const location = [profile.registry.city, profile.registry.state]
    .filter(Boolean)
    .join(", ");
  return {
    title: `${name} — ${location}`,
    description: `Canonical research profile for ${name}, ${location}: status, history, current evidence, conflicts, and complete source links.`,
  };
}

export default async function ParishPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getCanonicalParishProfile(slug);
  if (!profile) notFound();

  const entry = profile.registry;
  const core = profile.core;
  const scoped = toScopedParish(entry);
  const name = profileName(profile);
  const altName =
    entry.names.lt && entry.names.en && entry.names.en !== name
      ? entry.names.en
      : null;
  const community = isCommunityRecord(entry.sources ?? []);
  const foundedYear = scoped.founded ?? core?.yearFounded ?? null;
  const closedYear = scoped.closed ?? core?.yearClosed ?? null;
  const buildingFate = scoped.buildingFate ?? core?.buildingFate ?? null;
  const endingMode = scoped.endingMode ?? core?.endingMode ?? null;
  const endState = scoped.endState;
  const recordType = entry.record_type ?? "parish";
  const researchOnly = ["phase", "lead", "context"].includes(recordType);

  const situation = core
    ? getParishSituation(profile.slug)
    : getSituationByRegistrySlug(profile.registrySlug);
  const caseRecord = loadCaseRecord(profile);
  const parishTimeline = getParishTimeline(profileLinks(profile));
  const { alert: parishAlert, campaign: parishCampaign } =
    getParishAlert(profile);
  const watchEntry = getSustainabilityWatch(profile);
  const campaignDispatches = parishCampaign?.dispatches ?? [];
  const watchDispatches = watchEntry?.dispatches ?? [];
  const currentSignalLabel = parishCampaign
    ? "Active campaign"
    : parishAlert?.kind === "building"
      ? "Building at risk"
      : "Current development";

  const photosEntry =
    getClearedPhoto(profile.slug) ??
    (profile.registrySlug !== profile.slug
      ? getClearedPhoto(profile.registrySlug)
      : null);
  const watchPhoto = clearedOrNull(watchEntry?.photo);
  const photo = photosEntry
    ? photosEntry
    : watchPhoto?.url
      ? {
          src: watchPhoto.url,
          alt: watchPhoto.alt ?? `${name} photo`,
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
        context: `Pastoral conditions checked ${watchEntry.dateObserved}`,
        fallbackTitle: "Pastoral conditions source",
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
        "Related Židinys pastoral dispatch",
      ),
    ),
    ...projectProfileSource(
      parishCampaign?.hearthUrl,
      "Židinys campaign page",
      "Current campaign action page",
    ),
    ...projectProfileSource(
      watchEntry?.hearthUrl,
      "Židinys pastoral dispatch",
      "Current parish pastoral publication",
    ),
  ];
  const profileSources = finalizeProfileSources([
    core ? draugasProfileSources(core.citations) : [],
    registryProfileSources(entry.sources ?? []),
    caseSources,
    alertSources,
    watchSources,
    situationSources,
    parishTimelineProfileSources(parishTimeline),
    projectSources,
    photoProfileSource(photo),
  ]);

  const { dek, rest } = researchOnly
    ? researchRecordStory(recordType)
    : profileStory({
        situationText: situation?.situation ?? null,
        endState,
        founded: foundedYear,
        closed: closedYear,
        community,
      });

  const hasMap = (
    contextPoints.points as {
      slug: string;
      diocese: string | null;
      congregationClass: string | null;
    }[]
  ).some(
    (point) =>
      point.slug === profile.slug &&
      point.diocese &&
      point.congregationClass === "roman_catholic",
  );
  const showWhatHappened =
    isLoss(endState) ||
    endState === "unresolved" ||
    !!core?.survivedReviewThenClosed ||
    !!core?.notes ||
    !!entry.conflicts?.length;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        <Link href="/record" className="underline hover:text-foreground">
          The Record
        </Link>{" "}
        / {entry.city}
        {entry.state ? `, ${entry.state}` : ""}
      </p>

      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        {name}
      </h1>
      <p className="mt-1 text-lg text-muted">
        {altName ? `${altName} · ` : ""}
        {entry.city}
        {entry.state ? `, ${entry.state}` : ""}
        {entry.country === "CA" ? " · Canada" : ""}
      </p>

      {(!researchOnly || parishAlert || watchEntry) && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {!researchOnly && (
            <EndStatePill
              value={endState}
              size="lg"
              label={
                recordType === "misija" && endState === "active_parish"
                  ? "Active Lithuanian mission"
                  : undefined
              }
            />
          )}
          {(parishAlert || watchEntry) && (
            <span
              className="rounded-full border-2 px-3 py-0.5 text-xs font-semibold"
              style={{
                borderColor: parishAlert
                  ? "var(--es-closed)"
                  : "var(--mark-ink)",
                color: parishAlert ? "var(--es-closed)" : "var(--mark-ink)",
              }}
            >
              {parishAlert ? currentSignalLabel : "Pastoral profile"}
            </span>
          )}
        </div>
      )}

      <p className="mt-4 max-w-2xl font-serif text-xl leading-snug sm:text-2xl">
        {dek}
      </p>
      {rest && (
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">{rest}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium">
          {institutionLabel(profile, community)}
        </span>
        {entry.needs_human_source_review && (
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            Human source review pending
          </span>
        )}
        {profile.congregationClass === "national_catholic_pncc" && (
          <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
            independent from Rome · historical witness
          </span>
        )}
        {profile.congregationClass === "independent_catholic" && (
          <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
            independent Catholic · historical witness
          </span>
        )}
        {core?.comparator && (
          <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
            Canadian comparator
          </span>
        )}
      </div>

      {(photo || hasMap) && (
        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold">
            The church and its place
          </h2>
          {hasMap && (
            <p className="mt-1 text-sm text-muted">
              Among its neighbors — no parish stands alone.
            </p>
          )}
          <div
            className={`mt-4 grid items-start gap-5 ${
              photo && hasMap ? "sm:grid-cols-2" : ""
            }`}
          >
            {photo && (
              <figure className="overflow-hidden rounded-lg border border-rule">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={640}
                  height={427}
                  loading="eager"
                  className="h-auto w-full object-cover"
                />
                <figcaption className="px-3 py-1.5 text-xs text-muted">
                  {photo.attribution}
                  {photo.license && <span> · {photo.license}</span>}
                </figcaption>
              </figure>
            )}
            {hasMap && (
              <div className={photo ? "" : "max-w-xl"}>
                <ParishContextMap slug={profile.slug} />
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold">What it was</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">
              Founded
            </dt>
            <dd className="mt-0.5">{foundedYear ?? "Not established"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Type</dt>
            <dd className="mt-0.5">{institutionLabel(profile, community)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">
              Ownership
            </dt>
            <dd className="mt-0.5">
              {researchOnly ? "Not established" : ownershipLabel(profile)}
            </dd>
          </div>
          {entry.diocese && (
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs uppercase tracking-wide text-muted">
                Diocese
              </dt>
              <dd className="mt-0.5">{entry.diocese}</dd>
            </div>
          )}
        </dl>
        <ParishRecordReadings profile={profile} />
        {community && (
          <div className="mt-5 border-l-2 border-rule pl-4 text-sm leading-relaxed text-muted">
            <p className="font-medium text-foreground">
              Why this community is in the record
            </p>
            <p className="mt-1">
              The source documents a Lithuanian community that worshipped
              together, but does not establish a distinct Lithuanian national
              parish. It remains visible because the record includes the full
              lived geography of Lithuanian religious life, while preserving
              the distinction between a community and a parish.
            </p>
          </div>
        )}
      </section>

      {parishTimeline && <ParishLifeTimeline timeline={parishTimeline} />}

      {showWhatHappened && (
        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold">What happened</h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
            {isLoss(endState) && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">
                  Closed
                </dt>
                <dd className="mt-0.5">{closedYear ?? "Not established"}</dd>
              </div>
            )}
            {endingMode && endingMode !== "standing" && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">
                  Decision
                </dt>
                <dd className="mt-0.5">{ENDING_MODE_LABEL[endingMode]}</dd>
              </div>
            )}
            {buildingFate &&
              buildingFate !== "unknown" &&
              buildingFate !== "standing" && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">
                    Building
                  </dt>
                  <dd className="mt-0.5">
                    {BUILDING_FATE_LABEL[buildingFate as BuildingFate]}
                  </dd>
                </div>
              )}
          </dl>

          {core?.survivedReviewThenClosed && (
            <p
              className="mt-5 rounded-lg border border-rule p-4 leading-relaxed"
              style={{ borderLeft: "4px solid var(--es-closed)" }}
            >
              This parish <strong>survived an earlier diocesan review</strong>{" "}
              and a later one still reached it. It is part of the documented
              pattern showing that one favorable restructuring decision does
              not guarantee long-term safety.
            </p>
          )}

          {core?.notes && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide text-muted">
                From the record
              </p>
              <p className="mt-1 leading-relaxed">{core.notes}</p>
            </div>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold">
          {researchOnly ? "Research status" : "Where it stands today"}
        </h2>

        {researchOnly && (
          <p className="mt-2 leading-relaxed text-muted">
            {researchStatusCopy(recordType)}
          </p>
        )}
        {!researchOnly &&
          !parishAlert &&
          !watchEntry &&
          !caseRecord &&
          situation?.current_use &&
          situation.current_use !== "Unknown" && (
            <p className="mt-2 leading-relaxed">
              Current use: {situation.current_use}.
            </p>
          )}
        {!researchOnly &&
          !parishAlert &&
          !watchEntry &&
          !caseRecord &&
          (!situation?.current_use || situation.current_use === "Unknown") && (
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
            style={{
              borderColor:
                parishAlert.level === "red"
                  ? "var(--es-closed)"
                  : "var(--color-amber-600)",
            }}
          >
            <p className="text-xs uppercase tracking-widest text-muted">
              {currentSignalLabel}
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              {parishAlert.whatChanged}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {parishCampaign?.hearthUrl && (
                <a
                  href={parishCampaign.hearthUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    background: "var(--es-transferred)",
                    color: "#1c1917",
                  }}
                >
                  How to help &rarr;
                </a>
              )}
              <Link
                href="/under-threat"
                className="inline-flex items-center gap-1 rounded-md border border-rule px-3 py-1.5 text-sm font-medium transition-colors hover:border-foreground"
              >
                What&rsquo;s happening now &rarr;
              </Link>
            </div>
            <p className="mt-2 text-xs text-muted">
              Evidence and complete source links are listed below.
            </p>
            {campaignDispatches.length > 0 && (
              <div className="mt-3 border-t border-rule pt-3">
                <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">
                  From Židinys (The Hearth)
                </p>
                <ul className="space-y-1">
                  {campaignDispatches.map((dispatch) => (
                    <li key={dispatch.url}>
                      <a
                        href={dispatch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline hover:text-foreground"
                      >
                        {dispatch.title} &rarr;
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {watchEntry && (
          <div className="mt-4 overflow-hidden rounded-lg border border-rule">
            <div className="px-4 pb-3 pt-3.5">
              <p className="text-xs uppercase tracking-widest text-muted">
                Pastoral conditions
              </p>
              <p className="mt-1.5 leading-relaxed">{watchEntry.situation}</p>

              <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted">
                    Clergy
                  </p>
                  <p className="font-medium">
                    {CLERGY_LABEL[watchEntry.clergy.arrangement] ??
                      watchEntry.clergy.arrangement}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {watchEntry.clergy.detail}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted">
                    Lithuanian Mass
                  </p>
                  <p className="font-medium">
                    {FREQUENCY_LABEL[watchEntry.liturgy.frequency] ??
                      watchEntry.liturgy.frequency}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {watchEntry.liturgy.detail}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted">
                    Governance
                  </p>
                  <p className="font-medium">
                    {GOVERNANCE_LABEL[watchEntry.governance] ??
                      watchEntry.governance}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {watchEntry.governanceDetail}
                  </p>
                </div>
              </div>

              {watchEntry.survivedThreats && (
                <div className="mt-3 text-sm">
                  <p className="mb-0.5 text-xs uppercase tracking-wide text-muted">
                    Survived
                  </p>
                  <p className="leading-relaxed text-muted">
                    {watchEntry.survivedThreats}
                  </p>
                </div>
              )}
              {watchEntry.financial && (
                <div className="mt-3 text-sm">
                  <p className="mb-0.5 text-xs uppercase tracking-wide text-muted">
                    Financial signal
                  </p>
                  <p className="leading-relaxed text-muted">
                    {watchEntry.financial}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule bg-background px-4 py-2.5">
              <p className="text-xs text-muted">
                Evidence listed below · checked {watchEntry.dateObserved}
              </p>
              <div className="flex gap-2">
                {watchEntry.hearthUrl && (
                  <a
                    href={watchEntry.hearthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-rule px-3 py-1 text-xs font-medium transition-colors hover:border-foreground"
                  >
                    Read the dispatch &rarr;
                  </a>
                )}
                <Link
                  href="/lithuanian-catholic-life-today#parish-health-heading"
                  className="rounded-md border border-rule px-3 py-1 text-xs font-medium transition-colors hover:border-foreground"
                >
                  Catholic life today &rarr;
                </Link>
              </div>
            </div>
            {watchDispatches.length > 0 && (
              <div className="border-t border-rule px-4 py-3">
                <p className="mb-1.5 text-xs uppercase tracking-wide text-muted">
                  From Židinys (The Hearth)
                </p>
                <ul className="space-y-1">
                  {watchDispatches.map((dispatch) => (
                    <li key={dispatch.url}>
                      <a
                        href={dispatch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline hover:text-foreground"
                      >
                        {dispatch.title} &rarr;
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
            {caseRecord.developments.length > 0 &&
              (() => {
                const developments = [...caseRecord.developments].sort((a, b) =>
                  b.date.localeCompare(a.date),
                );
                const recent = developments.slice(0, 4);
                const older = developments.slice(4);
                const item = (development: (typeof developments)[number]) => (
                  <li key={`${development.date}-${development.headline}`}>
                    <p className="text-xs uppercase tracking-wide text-muted">
                      {development.date}
                    </p>
                    <p className="font-medium">{development.headline}</p>
                    <p className="text-sm leading-relaxed text-muted">
                      {development.detail}
                    </p>
                    {development.sources.length > 0 && (
                      <p className="mt-1 text-xs text-muted">
                        Sources:{" "}
                        {[
                          ...new Set(
                            development.sources.map(
                              (source) => source.publisher || source.title,
                            ),
                          ),
                        ].join(", ")}
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
                      {recent.map(item)}
                    </ol>
                    {older.length > 0 && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-muted underline hover:text-foreground">
                          Earlier entries ({older.length})
                        </summary>
                        <ol className="mt-3 space-y-4 border-l-2 border-rule pl-4">
                          {older.map(item)}
                        </ol>
                      </details>
                    )}
                  </div>
                );
              })()}
            {caseRecord.gaps && (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                <span className="font-medium text-foreground">
                  What we could not yet establish:
                </span>{" "}
                {caseRecord.gaps}
              </p>
            )}
          </div>
        )}
      </section>

      <ParishPublishedRecord profile={profile} />

      {profile.recordDepth !== "case-filed" && (
        <section className="mt-10 border-l-2 border-rule pl-4 text-sm leading-relaxed text-muted">
          <p>
            <span className="font-medium text-foreground">
              {researchOnly
                ? "This research record is still being deepened."
                : "This profile is still being deepened."}
            </span>{" "}
            {researchOnly
              ? "The source evidence is public now; further identity and context work remains."
              : "The source record is public now; archival and present-day case research proceeds parish by parish."}{" "}
            The research method is described in{" "}
            <Link
              href="/about-the-data"
              className="underline hover:text-foreground"
            >
              About the Data
            </Link>
            .
          </p>
        </section>
      )}

      <section className="mt-10 rounded-lg border border-rule p-5">
        <p className="font-medium">
          {researchOnly
            ? "Do you know more about this historical record?"
            : "Do you know this parish? Is something happening there now?"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {researchOnly
            ? "Corrections, corroborating documents, photographs, and local knowledge are all welcome."
            : "The record grows through people who were there. Corrections, documents, photographs, and current news are all welcome."}
        </p>
        <p className="mt-3">
          <Link
            href="/report"
            className="inline-block rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--es-closed)" }}
          >
            Report it
          </Link>
        </p>
      </section>

      <ProfileSourceLedger sources={profileSources} />
    </article>
  );
}
