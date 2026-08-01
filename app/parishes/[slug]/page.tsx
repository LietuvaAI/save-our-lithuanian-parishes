import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import alertsData from "@/data/alerts.json";
import contextPoints from "@/data/context-points.json";
import { EndStateDot } from "@/components/EndStatePill";
import ParishContextMap from "@/components/ParishContextMap";
import { ParishProfileChronology } from "@/components/ParishProfileChronology";
import {
  CONGREGATION_CLASS_LABEL,
  ParishPublishedRecord,
  ParishRecordReadings,
  RECORD_TYPE_LABEL,
  isCommunityRecord,
  parishHistoryLeadNarrative,
} from "@/components/ParishResearchRecord";
import { ProfileRelatedRecords } from "@/components/ProfileRelatedRecords";
import { ProfileSection } from "@/components/ProfileSection";
import { ProfileSourceLedger } from "@/components/ProfileSourceLedger";
import { ProfileWorshipSites } from "@/components/ProfileWorshipSites";
import { END_STATE_LABEL, isLoss } from "@/lib/end-state";
import {
  canonicalParishProfiles,
  getCanonicalParishProfile,
  type CanonicalParishProfile,
} from "@/lib/parish-profile";
import {
  getInstitutionDates,
  getRelatedRecordsForInstitution,
  getWorshipSitesForInstitution,
} from "@/lib/parish-record-graph";
import {
  getParishTimeline,
  parishTimelineProfileSources,
} from "@/lib/parish-timelines";
import {
  BUILDING_FATE_LABEL,
  INSTITUTION_TYPE_LABEL,
  OWNERSHIP_LABEL,
  getParishSituation,
  getSituationByRegistrySlug,
  type BuildingFate,
} from "@/lib/parishes";
import { clearedOrNull, getClearedParishPortrait } from "@/lib/photos";
import {
  profileStory,
  researchRecordStory,
  researchStatusCopy,
} from "@/lib/profile-narrative";
import {
  draugasProfileSources,
  finalizeProfileSources,
  linkedProfileSources,
  photoProfileSource,
  projectProfileSource,
  registryProfileSources,
} from "@/lib/profile-sources";
import { buildParishProfileView } from "@/lib/parish-profile-view";
import { toScopedParish } from "@/lib/registry-scope";
import { CLERGY_LABEL, FREQUENCY_LABEL, GOVERNANCE_LABEL } from "@/lib/watch-labels";

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
  historicalSummary?: string[];
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

type AlertSource = { url: string; publisher: string; title?: string };
type DispatchLink = { url: string; title: string };

type WatchPhoto = {
  url?: string;
  alt?: string;
  attribution?: string;
  license?: string;
  archiveUrl?: string;
  evidenceUrl?: string;
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
  clergy: { arrangement: string; detail: string };
  liturgy: { frequency: string; detail: string };
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

function publicOwnershipLabel(ownership: string | null | undefined) {
  if (!ownership || /^(none|unknown|unspecified)$/i.test(ownership)) return null;
  if (ownership === "diocese_rc") return "Diocese-owned Roman Catholic";
  if (ownership === "national_catholic") {
    return "Lithuanian National Catholic (community-owned)";
  }
  if (ownership === "other_self_owned") return "Community-owned";
  return ownership;
}

function ownershipLabel(profile: CanonicalParishProfile) {
  if (profile.core) return OWNERSHIP_LABEL[profile.core.ownership];
  const locked = publicOwnershipLabel(profile.registry.locked?.ownership);
  if (locked) return locked;
  const surveyed = publicOwnershipLabel(
    (profile.registry.sources ?? []).find((source) =>
      publicOwnershipLabel(source.ownership),
    )?.ownership,
  );
  return surveyed ?? "Not established";
}

function institutionLabel(profile: CanonicalParishProfile, community: boolean) {
  if (community) return "Lithuanian worshipping community";
  if (profile.core) return INSTITUTION_TYPE_LABEL[profile.core.institutionType];
  return (
    RECORD_TYPE_LABEL[profile.registry.record_type ?? ""] ??
    CONGREGATION_CLASS_LABEL[profile.congregationClass ?? ""] ??
    "Parish record"
  );
}

function readableBuildingStatus(
  buildingFate: BuildingFate | null,
  caseStatus: string | null,
) {
  if (buildingFate && buildingFate !== "unknown") {
    if (buildingFate === "standing") return "Standing";
    return BUILDING_FATE_LABEL[buildingFate];
  }
  if (!caseStatus || /^(unknown|not established)$/i.test(caseStatus)) return null;
  const text = caseStatus.replace(/[_-]+/g, " ").trim();
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
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
    title: `${name} \u2014 ${location}`,
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
  if (slug !== profile.slug) redirect(profile.href);

  const entry = profile.registry;
  const core = profile.core;
  const scoped = toScopedParish(entry);
  const name = profileName(profile);
  const altName =
    entry.names.lt && entry.names.en && entry.names.en !== name
      ? entry.names.en
      : null;
  const community = isCommunityRecord(entry.sources ?? []);
  const institution = institutionLabel(profile, community);
  const sourceLead = parishHistoryLeadNarrative(profile);
  const foundedYear = scoped.founded ?? core?.yearFounded ?? null;
  const closedYear = scoped.closed ?? core?.yearClosed ?? null;
  const buildingFate = scoped.buildingFate ?? core?.buildingFate ?? null;
  const endState = scoped.endState;
  const recordType = entry.record_type ?? "parish";
  const researchOnly = ["phase", "lead", "context"].includes(recordType);

  const situation = core
    ? getParishSituation(profile.slug)
    : getSituationByRegistrySlug(profile.registrySlug);
  const caseRecord = loadCaseRecord(profile);
  const parishTimeline = getParishTimeline(profileLinks(profile));
  const { alert: parishAlert, campaign: parishCampaign } = getParishAlert(profile);
  const watchEntry = getSustainabilityWatch(profile);
  const campaignDispatches = parishCampaign?.dispatches ?? [];
  const watchDispatches = watchEntry?.dispatches ?? [];
  const currentSignalLabel = parishCampaign
    ? "Active campaign"
    : parishAlert?.kind === "building"
      ? "Building at risk"
      : "Current development";

  // Canonical record graph: institutions, worship sites, and continuity
  // relationships stay three distinct units.
  const institutionDates = getInstitutionDates(profile.href);
  const worshipSites = getWorshipSitesForInstitution(
    institutionDates?.entityId ?? null,
  );
  const relatedRecords = getRelatedRecordsForInstitution(
    institutionDates?.entityId ?? null,
  );
  const standingSite =
    worshipSites.find(
      (site) => !site.demolishedYear && /present/i.test(site.range ?? ""),
    ) ?? null;
  const standingSiteYear = standingSite?.range?.match(/(\d{4})/)?.[1] ?? null;
  const currentChurch = standingSiteYear
    ? `Dedicated ${standingSiteYear}`
    : readableBuildingStatus(buildingFate, caseRecord?.buildingStatus ?? null);
  const lithuanianMass = watchEntry
    ? (FREQUENCY_LABEL[watchEntry.liturgy.frequency] ??
      watchEntry.liturgy.frequency)
    : null;

  const photosEntry =
    getClearedParishPortrait(profile.slug) ??
    (profile.registrySlug !== profile.slug
      ? getClearedParishPortrait(profile.registrySlug)
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
          evidenceUrl: watchPhoto.evidenceUrl,
        }
      : null;
  const isLineDrawing = photo?.src.endsWith("-line-drawing.png") ?? false;

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
        "Related \u017didinys campaign dispatch",
      ),
    ),
    ...watchDispatches.flatMap((dispatch) =>
      projectProfileSource(
        dispatch.url,
        dispatch.title,
        "Related \u017didinys pastoral dispatch",
      ),
    ),
    ...projectProfileSource(
      parishCampaign?.hearthUrl,
      "\u017didinys campaign page",
      "Current campaign action page",
    ),
    ...projectProfileSource(
      watchEntry?.hearthUrl,
      "\u017didinys pastoral dispatch",
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
        name,
        city: entry.city,
        state: entry.state ?? null,
        institution,
        currentUse: situation?.current_use ?? null,
        sourceLead,
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

  // Status is stated once, here: a dot and a label. Not also a pill, a fact row,
  // and a prose sentence. docs/design-system-profile.md §6.
  const statusLabel = researchOnly
    ? "Research record"
    : recordType === "misija" && endState === "active_parish"
      ? "Active Lithuanian mission"
      : END_STATE_LABEL[endState];

  const profileView = buildParishProfileView({
    name,
    city: entry.city,
    state: entry.state ?? null,
    country: entry.country,
    institution,
    founded: foundedYear,
    closed: closedYear,
    status: statusLabel,
    ownership: researchOnly ? "Not established" : ownershipLabel(profile),
    diocese: entry.diocese ?? null,
    building: readableBuildingStatus(
      buildingFate,
      caseRecord?.buildingStatus ?? null,
    ),
    overview: [dek, rest].filter(Boolean).join(" "),
    researchOnly,
    researchStatus: researchStatusCopy(recordType),
    currentUse: caseRecord?.currentUse ?? situation?.current_use ?? null,
    caseSummary: caseRecord?.summary ?? null,
    caseAsOf: caseRecord?.asOf ?? null,
    developments: caseRecord?.developments ?? [],
    timelineEvents: parishTimeline?.events ?? [],
    existed: institutionDates?.existed ?? null,
    currentChurch,
    lithuanianMass,
  });

  return (
    <article
      className="mx-auto max-w-[1060px] px-4 py-10"
      data-profile-layout="canonical-v2"
      data-record-depth={profile.recordDepth}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        <Link href="/record" className="hover:text-foreground">
          The Record
        </Link>{" "}
        / {entry.city}
        {entry.state ? `, ${entry.state}` : ""}
      </p>

      <div className="mt-4 grid items-start gap-x-10 gap-y-6 md:grid-cols-[272px_minmax(0,1fr)]">
        <div>
          <figure className="w-full">
            {photo ? (
              <Image
                src={photo.src}
                alt={photo.alt}
                width={720}
                height={isLineDrawing ? 720 : 540}
                loading="eager"
                className={
                  isLineDrawing
                    ? "aspect-square w-full object-contain mix-blend-multiply"
                    : "aspect-[4/3] w-full object-cover"
                }
              />
            ) : (
              <div className="flex aspect-square w-full flex-col items-center justify-center bg-band px-8 text-center">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.15em] text-muted">
                  {institution}
                </p>
                <p className="mt-3 font-serif text-2xl font-semibold">{name}</p>
                <p className="mt-1 text-sm text-muted">
                  {entry.city}
                  {entry.state ? `, ${entry.state}` : ""}
                </p>
                <p className="mt-5 font-mono text-[10.5px] text-muted">
                  {foundedYear ? `Established ${foundedYear}` : statusLabel}
                </p>
              </div>
            )}
            <figcaption className="mt-1.5 font-mono text-[10.5px] leading-normal text-muted">
              {photo ? (
                <a href="#evidence-sources" className="hover:text-accent">
                  {isLineDrawing ? "Line art" : "Photograph"}
                  {standingSiteYear ? ` \u00b7 the ${standingSiteYear} church` : ""}{" "}
                  \u00b7 credit &amp; source
                </a>
              ) : (
                "Parish identity record"
              )}
            </figcaption>
          </figure>

          {hasMap && (
            <figure className="mt-6">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.15em] text-muted">
                Among its neighbours
              </p>
              {entry.diocese && (
                <p className="mt-2 font-serif text-sm">{entry.diocese}</p>
              )}
              <div className="mt-2.5">
                <ParishContextMap
                  slug={profile.slug}
                  dioceseLabel={entry.diocese ?? undefined}
                  compact
                />
              </div>
            </figure>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-semibold leading-tight [overflow-wrap:anywhere] sm:text-[31px]">
            {name}
          </h1>
          <p className="mt-2.5 font-serif text-base text-muted">
            {altName ? `${altName} \u00b7 ` : ""}
            {entry.city}
            {entry.state ? `, ${entry.state}` : ""}
            {entry.country === "CA" ? " \u00b7 Canada" : ""}
            {entry.country === "AR" ? " \u00b7 Argentina" : ""}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-[18px] gap-y-2 font-mono text-[11px] font-medium uppercase tracking-[0.09em]">
            <span className="inline-flex items-center gap-2">
              {!researchOnly && <EndStateDot value={endState} />}
              {statusLabel}
            </span>
            {institutionDates?.foundedUnresolved ? (
              <span className="text-muted">Founding year unresolved</span>
            ) : (
              institutionDates?.foundedYear && (
                <span className="text-muted">
                  Founded {institutionDates.foundedYear}
                </span>
              )
            )}
            {entry.diocese && <span className="text-muted">{entry.diocese}</span>}
          </div>

          <dl className="mt-4 grid max-w-[38em] gap-x-6 gap-y-4 border-t border-rule pt-3.5 sm:grid-cols-4">
            {profileView.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="font-mono text-[10.5px] font-medium uppercase tracking-[0.09em] text-muted">
                  {fact.label}
                </dt>
                <dd className="mt-1.5 text-sm leading-snug">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 max-w-[34em] font-serif text-[16.5px] leading-relaxed">
            {dek}
          </p>

          {parishAlert && (
            <div
              className="mt-5 max-w-[34em] px-4 py-3.5"
              style={{
                background: "color-mix(in oklab, var(--accent) 8%, transparent)",
                borderLeft: "3px solid var(--accent)",
              }}
            >
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">
                {currentSignalLabel}
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                {parishAlert.whatChanged}
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                {parishCampaign?.hearthUrl && (
                  <a
                    href={parishCampaign.hearthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 text-sm font-medium text-background"
                    style={{ background: "var(--accent)" }}
                  >
                    How to help &rarr;
                  </a>
                )}
                <Link
                  href="/#happening-now"
                  className="border border-rule px-3.5 py-2 text-sm font-medium hover:border-foreground"
                >
                  All current campaigns &rarr;
                </Link>
              </div>
              {campaignDispatches.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1">
                  {campaignDispatches.map((dispatch) => (
                    <li key={dispatch.url}>
                      <a
                        href={dispatch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13.5px] underline decoration-1 underline-offset-2 hover:text-foreground"
                      >
                        {dispatch.title} &rarr;
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <ParishPublishedRecord
        profile={profile}
        overviewText={researchOnly ? undefined : `${dek} ${rest ?? ""}`}
        supplementalNarrative={
          caseRecord?.historicalSummary?.length
            ? caseRecord.historicalSummary
            : rest
              ? [rest]
              : []
        }
        fallbackNarrative={profileView.historyFallback}
      />

      <ParishProfileChronology items={profileView.chronology} />

      <ProfileWorshipSites sites={worshipSites} />

      <ProfileRelatedRecords records={relatedRecords} />

      <ProfileSection
        id="present-condition"
        label={researchOnly ? "Research status" : "Where it stands today"}
        note={
          profileView.currentAsOf
            ? `Record dated\n${profileView.currentAsOf}`
            : undefined
        }
      >
        <div className="max-w-[38em]">
          <p className="font-serif text-[15.5px] leading-relaxed">
            {profileView.currentSummary}
          </p>

          {watchEntry && (
            <div className="mt-4 flex flex-col gap-2 text-[13.5px] leading-relaxed text-muted">
              <p>
                <span className="text-foreground">
                  {CLERGY_LABEL[watchEntry.clergy.arrangement] ??
                    watchEntry.clergy.arrangement}
                  .
                </span>{" "}
                {watchEntry.clergy.detail}
              </p>
              <p>
                <span className="text-foreground">
                  {GOVERNANCE_LABEL[watchEntry.governance] ??
                    watchEntry.governance}
                  .
                </span>{" "}
                {watchEntry.governanceDetail}
              </p>
              {watchEntry.survivedThreats && <p>{watchEntry.survivedThreats}</p>}
              {watchEntry.financial && <p>{watchEntry.financial}</p>}
            </div>
          )}

          {caseRecord?.gaps && (
            <div className="mt-5 border-t border-rule pt-4">
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.09em] text-muted">
                What the record cannot yet establish
              </p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                {caseRecord.gaps}
              </p>
              {caseRecord.conflictsWithArchiveRecord && (
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                  {caseRecord.conflictsWithArchiveRecord}
                </p>
              )}
            </div>
          )}

          {institutionDates?.foundedUnresolved && (
            <p className="mt-4 text-[13.5px] leading-relaxed text-muted">
              The founding year is not established in the canonical record and is
              left unresolved rather than estimated.
            </p>
          )}
        </div>
      </ParishPublishedRecord>

      <ParishRecordReadings profile={profile} />

      <ProfileSourceLedger sources={profileSources} />

      <div className="mt-8 grid gap-x-10 border-t border-rule pt-6 md:grid-cols-[158px_minmax(0,1fr)]">
        <div />
        <div className="max-w-[38em] bg-band px-6 py-5">
          <p className="font-serif text-[16.5px] font-semibold leading-snug">
            Do you know this parish? Is something happening there now?
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
            The record grows through people who were there. Corrections,
            documents, photographs, and current news are all welcome.
          </p>
          <Link
            href="/contribute"
            className="mt-4 inline-block px-4 py-2.5 text-[13.5px] font-medium text-background"
            style={{ background: "var(--accent)" }}
          >
            Report it &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
