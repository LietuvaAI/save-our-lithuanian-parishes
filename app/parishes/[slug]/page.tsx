import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import alertsData from "@/data/canonical-current-events-projection.json";
import contextPoints from "@/data/context-points.json";
import { EndStateDot } from "@/components/EndStatePill";
import ParishContextMap from "@/components/ParishContextMap";
import ParishNationalLocator from "@/components/ParishNationalLocator";
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
import { draugasNewspaperProfileSources } from "@/lib/draugas-newspaper-records";
import { END_STATE_LABEL } from "@/lib/end-state";
import { getCurrentPastoralDirectoryEntry } from "@/lib/infographic-projection";
import {
  canonicalParishProfiles,
  getCanonicalParishProfile,
  type CanonicalParishProfile,
} from "@/lib/parish-profile";
import {
  getIdentityNoticesForInstitution,
  getInstitutionDates,
  getInstitutionTransition,
  getRelatedRecordsForInstitution,
  getWorshipSitesForInstitution,
  worshipSiteAddressDetail,
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
import { clearedOrNull, getParishPortraitState } from "@/lib/photos";
import {
  profileStory,
  researchRecordStory,
  researchStatusCopy,
} from "@/lib/profile-narrative";
import { getPublicationSourceArtifacts } from "@/lib/publication-projection";
import {
  canonicalArtifactProfileSources,
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
  page?: string;
  excerpt?: string;
  supports?: string;
  url: string;
}

interface HistoricalNarrativeParagraph {
  text: string;
  sources: {
    url: string;
    locator: string;
  }[];
}

interface CaseRecord {
  asOf: string;
  formationLabel?: string;
  buildingStatus: string;
  currentUse: string;
  historicalNarrative?: HistoricalNarrativeParagraph[];
  profile?: {
    institutionalLife?: string;
    currentSite?: {
      label: string;
      value: string;
      detail?: string;
      href?: string;
    };
    formerSite?: {
      label: string;
      value: string;
      detail?: string;
      href?: string;
    };
    liturgy?: {
      value: string;
      detail?: string;
      href?: string;
    };
  };
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
  parishLink?: string;
  relatedProfileLink?: string;
  context?: string;
  level: string;
  kind: "active" | "watch" | "building";
  whatChanged: string;
  sources: AlertSource[];
};

type ParishCampaignEntry = {
  parishLink: string;
  state: string;
  hearthUrl?: string;
  dispatches?: DispatchLink[];
  sources?: AlertSource[];
  profile?: {
    siteDetail?: string;
    liturgy?: {
      value: string;
      detail?: string;
      href?: string;
    };
  };
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
  snapshot: string;
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
    alert:
      alerts.alerts.find((entry) =>
        links.has(entry.parishLink ?? entry.relatedProfileLink ?? ""),
      ) ?? null,
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
  if (
    profile.congregationClass &&
    profile.congregationClass !== "roman_catholic"
  ) {
    return CONGREGATION_CLASS_LABEL[profile.congregationClass];
  }
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
    description: `${name} in ${location}: history, present condition, related places, and public source links.`,
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
  const recordType = entry.record_type ?? "parish";
  const researchOnly = ["phase", "lead", "context"].includes(recordType);
  const institutionDates = getInstitutionDates(profile.href);
  const endState = institutionDates?.statusGroup ?? scoped.endState;
  const isUsProjection =
    entry.country === "US" && typeof institutionDates?.entityId === "string";
  const buildingFate = isUsProjection
    ? scoped.buildingFate
    : (scoped.buildingFate ?? core?.buildingFate ?? null);
  const foundedYear = institutionDates
    ? institutionDates.foundedYear
    : (scoped.founded ?? core?.yearFounded ?? null);
  const closedYear = institutionDates
    ? institutionDates.closedYear
    : (scoped.closed ?? core?.yearClosed ?? null);
  const establishedYear = institutionDates?.foundedUnresolved
    ? null
    : foundedYear;

  const situation = core
    ? getParishSituation(profile.slug)
    : getSituationByRegistrySlug(profile.registrySlug);
  const caseRecord = loadCaseRecord(profile);
  const formationLabel =
    caseRecord?.formationLabel ??
    (establishedYear ? `Established ${establishedYear}` : "Founding year unresolved");
  const parishTimeline = getParishTimeline(profileLinks(profile));
  const { alert: parishAlert, campaign: parishCampaign } = getParishAlert(profile);
  const watchEntry = getSustainabilityWatch(profile);
  const pastoralDirectoryEntry = isUsProjection
    ? getCurrentPastoralDirectoryEntry(profile.registrySlug)
    : null;
  const campaignDispatches = parishCampaign?.dispatches ?? [];
  const watchDispatches = watchEntry?.dispatches ?? [];
  const currentSignalLabel = parishCampaign
    ? "Active campaign"
    : parishAlert?.kind === "building"
      ? "Building at risk"
      : "Current development";

  // Canonical record graph: institutions, worship sites, and continuity
  // relationships stay three distinct units.
  const worshipSites = getWorshipSitesForInstitution(
    institutionDates?.entityId ?? null,
  );
  const relatedRecords = getRelatedRecordsForInstitution(
    institutionDates?.entityId ?? null,
  );
  const institutionTransition = getInstitutionTransition(
    institutionDates?.entityId ?? null,
  );
  const identityNotices = getIdentityNoticesForInstitution(
    institutionDates?.entityId ?? null,
  );
  const activeWorshipSite = worshipSites.find((site) => site.isCurrent) ?? null;
  const terminalWorshipSite = worshipSites.find((site) =>
    institutionDates?.terminalSiteIds.includes(site.entityId),
  );
  // A demolished church is still the institution's church building. Do not
  // replace its identity with the outcome label merely because no site stands.
  // For canonical U.S. profiles, however, Brain alone decides which site is
  // terminal. Associated sites remain visible below but are never promoted by
  // a site-side heuristic.
  const selectedWorshipSite = isUsProjection
    ? (terminalWorshipSite ?? null)
    : (activeWorshipSite ?? worshipSites[0] ?? null);
  const standingSiteYear = selectedWorshipSite?.range?.match(/(\d{4})/)?.[1] ?? null;
  const fallbackBuildingOutcome = readableBuildingStatus(
    buildingFate,
    caseRecord?.buildingStatus ?? null,
  );
  const buildingOutcome = isUsProjection
    ? (selectedWorshipSite?.outcome ?? "Not established")
    : selectedWorshipSite?.outcome &&
        !/^not established$/i.test(selectedWorshipSite.outcome)
      ? selectedWorshipSite.outcome
      : fallbackBuildingOutcome;
  const currentChurch =
    (recordType === "misija"
      ? (activeWorshipSite?.name ??
        (!isUsProjection ? caseRecord?.profile?.currentSite?.value : null) ??
        "Not established")
      : (selectedWorshipSite?.name ??
        (!isUsProjection ? caseRecord?.profile?.currentSite?.value : null) ??
        (worshipSites.length > 0
          ? "Terminal worship site not established"
          : "Worship site not established")));
  const rawCurrentChurchDetail =
    parishCampaign?.profile?.siteDetail ??
    (!isUsProjection ? caseRecord?.profile?.currentSite?.detail : null) ??
    null;
  const normalizedCurrentChurchDetail =
    rawCurrentChurchDetail &&
    buildingOutcome &&
    rawCurrentChurchDetail
      .toLowerCase()
      .startsWith(buildingOutcome.toLowerCase())
      ? rawCurrentChurchDetail
          .slice(buildingOutcome.length)
          .replace(/^\s*[\u00b7:;,-]\s*/, "")
          .replace(/^./, (character) => character.toUpperCase())
      : rawCurrentChurchDetail;
  const currentChurchDetail = isUsProjection
    ? [
        selectedWorshipSite
          ? worshipSiteAddressDetail(selectedWorshipSite.address)
          : "Address not established",
        normalizedCurrentChurchDetail,
      ]
        .filter(Boolean)
        .join(" \u00b7 ")
    : normalizedCurrentChurchDetail;
  const renderedWorshipSites =
    recordType === "misija" || !isUsProjection ? [] : worshipSites;
  const renderedRelatedRecords = !isUsProjection ? [] : relatedRecords;
  const campaignLiturgy = parishCampaign?.profile?.liturgy;
  const caseLiturgy = !isUsProjection ? caseRecord?.profile?.liturgy : null;
  const lithuanianMass = campaignLiturgy
    ? campaignLiturgy.value
    : caseLiturgy
      ? caseLiturgy.value
    : pastoralDirectoryEntry?.networkClass === "mass_continues"
      ? /monthly/i.test(pastoralDirectoryEntry.ministry)
        ? "Monthly"
        : "Continues"
    : pastoralDirectoryEntry?.networkClass === "active_parish" ||
        pastoralDirectoryEntry?.networkClass === "active_mission"
      ? "Regular"
    : watchEntry
      ? (FREQUENCY_LABEL[watchEntry.liturgy.frequency] ??
        watchEntry.liturgy.frequency)
      : caseRecord?.currentUse &&
          /Lithuanian[^.]*Mass|Mass(?:es)?[^.]*Lithuanian/i.test(
            caseRecord.currentUse,
          )
        ? /(?:Sunday|weekly)/i.test(caseRecord.currentUse)
          ? "Weekly"
          : "Documented"
        : null;
  const worshipLabel =
    entry.congregation_class === "non_catholic_christian"
      ? "Lithuanian worship"
      : "Lithuanian Mass";

  const portraitState = getParishPortraitState([
    profile.slug,
    profile.registrySlug,
  ]);
  const photosEntry = portraitState.photo;
  const watchPhoto = clearedOrNull(watchEntry?.photo);
  const parishPhoto = photosEntry
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
  const isLineDrawing = parishPhoto?.src.endsWith("-line-drawing.png") ?? false;
  const imageState = parishPhoto ? "cleared" : portraitState.state;

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
  const campaignSources = parishCampaign?.sources
    ? linkedProfileSources(parishCampaign.sources, {
        group: "current",
        context: "Current campaign status",
        fallbackTitle: "Campaign source",
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
        context: "Current parish situation",
        fallbackTitle: "Situation-record source",
      })
    : [];
  const publicationSourceArtifacts = getPublicationSourceArtifacts(
    profile.registrySlug,
  );
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
  const registrySourcesForProfile = pastoralDirectoryEntry?.draugasEvidence
    ? (entry.sources ?? []).filter(
        (source) =>
          source.axis !== "draugas-2008-2026" ||
          Boolean(source.work && source.sourceUrl && source.supports),
      )
    : (entry.sources ?? []);
  const governedDraugasSources = draugasNewspaperProfileSources(
    profile.href,
    profile.publication?.culturenet_entity_id,
  );
  const profileSources = finalizeProfileSources([
    governedDraugasSources,
    core && !pastoralDirectoryEntry?.draugasEvidence
      ? draugasProfileSources(core.citations)
      : [],
    pastoralDirectoryEntry?.draugasEvidence
      ? linkedProfileSources([pastoralDirectoryEntry.draugasEvidence], {
          group: "newspaper",
          context: "Reviewed Draugas evidence for the Sielovada U.S. directory",
          fallbackTitle: "Reviewed Draugas source",
        })
      : [],
    registryProfileSources(registrySourcesForProfile),
    canonicalArtifactProfileSources(publicationSourceArtifacts),
    caseSources,
    alertSources,
    campaignSources,
    watchSources,
    situationSources,
    parishTimelineProfileSources(parishTimeline),
    projectSources,
    photoProfileSource(parishPhoto),
  ]);

  const relatedAlertSummary =
    parishAlert?.relatedProfileLink && parishAlert.context
      ? `${parishAlert.context} ${parishAlert.whatChanged}`
      : parishAlert?.whatChanged;
  const canonicalCurrentSummary =
    parishCampaign?.state ??
    relatedAlertSummary ??
    watchEntry?.situation ??
    null;
  const canonicalCurrentAsOf =
    parishCampaign || relatedAlertSummary
      ? alertsData.snapshot
      : (watchEntry?.dateObserved ?? null);
  const historicalLeadNarrative = parishTimeline?.intro ?? null;
  const { dek, rest } = researchOnly
    ? researchRecordStory(recordType)
    : profileStory({
        situationText: historicalLeadNarrative,
        endState,
        founded: caseRecord?.formationLabel ? null : establishedYear,
        closed: closedYear,
        community,
        name,
        city: entry.city,
        state: entry.state ?? null,
        institution,
        currentUse: situation?.current_use ?? null,
        sourceLead,
      });
  const displayDek = dek;
  const displayRest = rest;

  const hasMap = (
    contextPoints.points as {
      slug: string;
      diocese: string | null;
      congregationClass: string | null;
    }[]
  ).some(
    (point) =>
      isUsProjection &&
      point.slug === profile.slug &&
      point.diocese &&
      point.congregationClass === "roman_catholic",
  );

  // Status is stated once, here: a dot and a label. Not also a pill, a fact row,
  // and a prose sentence. docs/design-system-profile.md §6.
  const baseStatusLabel = researchOnly
    ? RECORD_TYPE_LABEL[recordType] ?? "Historical context"
    : recordType === "misija" && endState === "active_parish"
      ? "Active Lithuanian mission"
      : END_STATE_LABEL[endState];
  const closedInstitutionLabel = /congregation/i.test(institution)
    ? "Congregation closed"
    : /mission/i.test(institution)
      ? "Mission closed"
      : "Parish closed";
  const statusLabel =
    !researchOnly && ["closed", "demolished", "repurposed"].includes(endState)
      ? `${closedInstitutionLabel}${closedYear ? ` ${closedYear}` : ""}`
      : baseStatusLabel;
  const buildingStatusLabel =
    !researchOnly && buildingOutcome && !/^not established$/i.test(buildingOutcome)
      ? /^demolished\b/i.test(buildingOutcome)
        ? `Church ${buildingOutcome.toLowerCase()}`
        : /^repurposed\b/i.test(buildingOutcome)
          ? `Church ${buildingOutcome.toLowerCase()}`
          : /^standing\b/i.test(buildingOutcome)
            ? "Church standing"
            : `Church \u00b7 ${buildingOutcome}`
      : null;

  const imageCaption = [
    isLineDrawing ? "Line art" : "Photograph",
    standingSiteYear ? `the ${standingSiteYear} church` : null,
    "credit & source",
  ]
    .filter(Boolean)
    .join(" \u00b7 ");

  const profileView = buildParishProfileView({
    name,
    city: entry.city,
    state: entry.state ?? null,
    country: entry.country,
    institution,
    founded: establishedYear,
    closed: closedYear,
    status: statusLabel,
    endState,
    ownership: researchOnly ? "Not established" : ownershipLabel(profile),
    diocese: entry.diocese ?? null,
    building: readableBuildingStatus(
      buildingFate,
      caseRecord?.buildingStatus ?? null,
    ),
    overview: [displayDek, displayRest].filter(Boolean).join(" "),
    researchOnly,
    researchStatus: researchStatusCopy(recordType),
    currentUse:
      canonicalCurrentSummary ??
      caseRecord?.currentUse ??
      situation?.current_use ??
      null,
    caseSummary:
      canonicalCurrentSummary ??
      caseRecord?.summary ??
      situation?.situation ??
      null,
    caseAsOf: isUsProjection
      ? (canonicalCurrentAsOf ?? caseRecord?.asOf ?? null)
      : (caseRecord?.asOf ?? null),
    developments: caseRecord?.developments ?? [],
    timelineEvents: parishTimeline?.events ?? [],
    existed: institutionDates?.existed ?? null,
    currentChurch,
    buildingOutcome,
    currentChurchDetail,
    currentChurchHref: !isUsProjection
      ? (caseRecord?.profile?.currentSite?.href ?? null)
      : null,
    formerChurch: !isUsProjection
      ? (caseRecord?.profile?.formerSite ?? null)
      : null,
    lithuanianMass,
    lithuanianMassDetail:
      campaignLiturgy?.detail ??
      caseLiturgy?.detail ??
      pastoralDirectoryEntry?.ministry ??
      null,
    lithuanianMassHref:
      campaignLiturgy?.href ??
      caseLiturgy?.href ??
      pastoralDirectoryEntry?.officialSite ??
      null,
    worshipLabel,
    recordType,
    institutionTransition,
    institutionalLifeOverride: !isUsProjection
      ? (caseRecord?.profile?.institutionalLife ?? null)
      : null,
  });

  const contextMapFigure = hasMap ? (
    <figure>
      <p className="font-mono text-ui-label font-medium uppercase tracking-[0.15em] text-muted">
        Among its neighbours
      </p>
      {entry.diocese && (
        <p className="mt-2 font-serif text-body-copy">{entry.diocese}</p>
      )}
      <div className="mt-2.5">
        <ParishContextMap
          slug={profile.slug}
          dioceseLabel={entry.diocese ?? undefined}
          compact
        />
      </div>
      <ParishNationalLocator slug={profile.slug} />
    </figure>
  ) : null;

  return (
    <article
      className="parish-profile mx-auto max-w-[1060px] px-4 py-10"
      data-profile-layout="canonical-v2"
      data-profile-image-state={imageState}
      data-record-depth={profile.recordDepth}
    >
      <p className="font-mono text-ui-label uppercase tracking-[0.16em] text-muted">
        <Link href="/parishes" className="hover:text-foreground">
          All Parish Profiles
        </Link>{" "}
        / {entry.city}
        {entry.state ? `, ${entry.state}` : ""}
      </p>

      <div
        id="profile-identity"
        className="mt-4 grid items-start gap-x-10 gap-y-6 md:grid-cols-[272px_minmax(0,1fr)]"
      >
        <div className="min-w-0">
          {parishPhoto ? (
            <>
              <figure className="w-full">
              <Image
                src={parishPhoto.src}
                alt={parishPhoto.alt}
                width={720}
                height={isLineDrawing ? 720 : 540}
                loading="eager"
                className={
                  isLineDrawing
                    ? "aspect-square w-full object-contain mix-blend-multiply"
                    : "aspect-[4/3] w-full object-cover"
                }
              />
                <figcaption className="mt-1.5 font-mono text-ui-label leading-normal text-muted">
                  <a href="#evidence-sources" className="hover:text-accent">
                    {imageCaption}
                  </a>
                </figcaption>
              </figure>
              {contextMapFigure && (
                <div className="mt-6">{contextMapFigure}</div>
              )}
            </>
          ) : contextMapFigure ? (
            contextMapFigure
          ) : (
            <figure className="w-full">
              <div className="flex aspect-square w-full flex-col items-center justify-center bg-band px-8 text-center">
                <p className="font-mono text-ui-label uppercase tracking-[0.15em] text-muted">
                  {institution}
                </p>
                <p className="mt-3 font-serif text-section-title font-semibold">{name}</p>
                <p className="mt-1 text-body-copy text-muted">
                  {entry.city}
                  {entry.state ? `, ${entry.state}` : ""}
                </p>
                <p className="mt-5 font-mono text-ui-label text-muted">
                  {formationLabel}
                </p>
              </div>
              <figcaption className="mt-1.5 font-mono text-ui-label leading-normal text-muted">
                {portraitState.state === "pending_permission"
                  ? "Image file held \u00b7 permission pending"
                  : "Image not yet gathered"}
              </figcaption>
            </figure>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="font-serif text-page-title font-semibold leading-tight [overflow-wrap:anywhere]">
            {name}
          </h1>
          <p className="mt-2.5 font-serif text-card-title text-muted">
            {altName ? `${altName} \u00b7 ` : ""}
            {entry.city}
            {entry.state ? `, ${entry.state}` : ""}
            {entry.country === "CA" ? " \u00b7 Canada" : ""}
            {entry.country === "AR" ? " \u00b7 Argentina" : ""}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-[18px] gap-y-2 font-mono text-ui-label font-medium uppercase tracking-[0.09em]">
            <span className="inline-flex items-center gap-2">
              {!researchOnly && <EndStateDot value={endState} />}
              {statusLabel}
            </span>
            {buildingStatusLabel && (
              <span
                data-profile-building-status
                className="text-muted"
              >
                {buildingStatusLabel}
              </span>
            )}
            {caseRecord?.formationLabel ? (
              <span className="text-muted">{caseRecord.formationLabel}</span>
            ) : recordType !== "misija" && institutionDates?.foundedUnresolved ? (
              <span className="text-muted">Founding year unresolved</span>
            ) : recordType !== "misija" && institutionDates?.foundedYear ? (
              <span className="text-muted">
                Founded {institutionDates.foundedDisplay}
              </span>
            ) : null}
            {entry.diocese && <span className="text-muted">{entry.diocese}</span>}
          </div>

          <ParishPublishedRecord
            profile={profile}
            leadText={displayDek}
            overviewText={
              researchOnly
                ? undefined
                : [displayDek, displayRest].filter(Boolean).join(" ")
            }
            supplementalNarrative={
              caseRecord?.historicalNarrative?.length
                ? caseRecord.historicalNarrative.map(
                    (paragraph) => paragraph.text,
                  )
                : displayRest
                  ? [displayRest]
                  : []
            }
            fallbackNarrative={
              historicalLeadNarrative ? [] : profileView.historyFallback
            }
            closingNote={
              core?.survivedReviewThenClosed &&
              institutionTransition === "merged"
                ? "Survived review, then merged. This parish remained open after an earlier diocesan review, but a later decision merged its juridic life into a successor parish."
                : core?.survivedReviewThenClosed
                  ? "Survived review, then closed. This parish remained open after an earlier diocesan review, but a later decision ended its institutional life."
                  : undefined
            }
            embedded
          />

          {isUsProjection && (
            <>
              <dl className="mt-4 grid max-w-[38em] gap-x-6 gap-y-4 border-t border-rule pt-3.5 sm:grid-cols-4">
                {profileView.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="font-mono text-ui-label font-medium uppercase tracking-[0.09em] text-muted">
                      {fact.label}
                    </dt>
                    <dd className="mt-1.5 text-body-copy leading-snug">
                      {fact.href ? (
                        <Link className="underline underline-offset-2" href={fact.href}>
                          {fact.value}
                        </Link>
                      ) : (
                        fact.value
                      )}
                      {fact.detail && (
                        <span className="mt-1 block text-small-copy leading-relaxed text-muted">
                          {fact.detail}
                        </span>
                      )}
                      {fact.secondary && (
                        <span className="mt-3 block border-t border-rule pt-2.5">
                          <span className="block font-mono text-ui-label font-medium uppercase tracking-[0.09em] text-muted">
                            {fact.secondary.label}
                          </span>
                          <span className="mt-1 block">
                            {fact.secondary.href ? (
                              <Link
                                className="underline underline-offset-2"
                                href={fact.secondary.href}
                              >
                                {fact.secondary.value}
                              </Link>
                            ) : (
                              fact.secondary.value
                            )}
                          </span>
                          {fact.secondary.detail && (
                            <span className="mt-1 block text-small-copy leading-relaxed text-muted">
                              {fact.secondary.detail}
                            </span>
                          )}
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {identityNotices.map((notice) => (
            <div
              key={notice.id}
              data-profile-identity-notice={notice.id}
              className="mt-5 max-w-[34em] bg-band px-4 py-3.5"
            >
              <p className="font-mono text-ui-label font-medium uppercase tracking-[0.15em] text-muted">
                {notice.label}
              </p>
              <p className="mt-2 text-body-copy leading-relaxed">{notice.text}</p>
            </div>
          ))}

          {parishAlert && (
            <div
              className="mt-5 max-w-[34em] px-4 py-3.5"
              style={{
                background: "color-mix(in oklab, var(--accent) 8%, transparent)",
                borderLeft: "3px solid var(--accent)",
              }}
            >
              <p className="font-mono text-ui-label font-medium uppercase tracking-[0.16em] text-accent">
                {currentSignalLabel}
              </p>
              <p className="mt-2 text-body-copy leading-relaxed">
                {parishAlert.whatChanged}
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                {parishCampaign?.hearthUrl && (
                  <a
                    href={parishCampaign.hearthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 text-body-copy font-medium text-background"
                    style={{ background: "var(--accent)" }}
                  >
                    How to help &rarr;
                  </a>
                )}
                <Link
                  href="/#happening-now"
                  className="border border-rule px-3.5 py-2 text-body-copy font-medium hover:border-foreground"
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
                        className="text-body-copy underline decoration-1 underline-offset-2 hover:text-foreground"
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

      {!isUsProjection && (
        <div
          data-profile-scope="outside-us-projection"
          className="mt-8 grid gap-x-10 border-t border-rule pt-6 md:grid-cols-[158px_minmax(0,1fr)]"
        >
          <p className="font-mono text-ui-label font-medium uppercase tracking-[0.15em] text-muted">
            Scope
          </p>
          <p className="max-w-[38em] bg-band px-5 py-4 text-body-copy leading-relaxed text-foreground">
            This Canadian parish is included for comparison with Lithuanian
            parish life in the United States. It remains outside the U.S.
            national totals and map.
          </p>
        </div>
      )}

      <ProfileSection
        id="present-condition"
        label={researchOnly ? "What is known" : "Where it stands today"}
        note={
          profileView.currentAsOf
            ? `Current as of\n${profileView.currentAsOf}`
            : undefined
        }
      >
        <div className="max-w-[38em]">
          <p className="font-serif text-card-title leading-relaxed">
            {profileView.currentSummary}
          </p>

          {watchEntry && (
            <details className="mt-4 border-t border-rule pt-3 text-body-copy leading-relaxed text-muted">
              <summary className="cursor-pointer font-medium text-foreground">
                Pastoral details
              </summary>
              <div className="mt-3 flex flex-col gap-2">
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
                {watchEntry.survivedThreats && (
                  <p>{watchEntry.survivedThreats}</p>
                )}
                {watchEntry.financial && <p>{watchEntry.financial}</p>}
              </div>
            </details>
          )}

          {institutionDates?.foundedUnresolved && (
            <p className="mt-4 text-body-copy leading-relaxed text-muted">
              The sources do not yet establish a founding year, so no year is
              estimated here.
            </p>
          )}
        </div>
      </ProfileSection>

      <ParishProfileChronology items={profileView.chronology} />

      <ProfileWorshipSites sites={renderedWorshipSites} />

      <ProfileRelatedRecords records={renderedRelatedRecords} />

      <ParishRecordReadings profile={profile} />

      <ProfileSourceLedger sources={profileSources} />

      <div
        id="profile-corrections"
        className="mt-5 max-w-[38em] bg-band px-5 py-4"
      >
        <p className="font-serif text-section-title font-semibold leading-snug">
          Do you know this {recordType === "misija" ? "mission" : "parish"}?
        </p>
        <p className="mt-1 text-small-copy leading-relaxed text-muted">
          People who were there can help complete this history. Corrections,
          documents, photographs, and current news are all welcome.
        </p>
        <Link
          href="/report"
          className="mt-2 inline-block text-small-copy font-semibold underline underline-offset-4"
        >
          Report it &rarr;
        </Link>
      </div>
    </article>
  );
}
