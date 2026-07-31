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
import { ParishProfileChronology } from "@/components/ParishProfileChronology";
import {
  CONGREGATION_CLASS_LABEL,
  ParishPublishedRecord,
  ParishRecordReadings,
  RECORD_TYPE_LABEL,
  isCommunityRecord,
  parishHistoryLeadNarrative,
} from "@/components/ParishResearchRecord";
import { ProfileSourceLedger } from "@/components/ProfileSourceLedger";
import { splitStory } from "@/lib/dek";
import { END_STATE_LABEL, isLoss, type EndState } from "@/lib/end-state";
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
  INSTITUTION_TYPE_LABEL,
  OWNERSHIP_LABEL,
  getParishSituation,
  getSituationByRegistrySlug,
  type BuildingFate,
} from "@/lib/parishes";
import {
  clearedOrNull,
  getClearedParishPortrait,
} from "@/lib/photos";
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
  name,
  city,
  state,
  institution,
  currentUse,
  sourceLead,
}: {
  situationText: string | null;
  endState: EndState;
  founded: number | null;
  closed: number | null;
  community: boolean;
  name: string;
  city: string;
  state: string | null;
  institution: string;
  currentUse: string | null;
  sourceLead: string | null;
}) {
  function narrativeSituation(text: string) {
    if (
      /^No Lithuanian Šv[.] Kazimiero parish ever stood inside Chicago itself/i.test(
        text,
      )
    ) {
      return "Šv. Kazimiero belonged to Chicago Heights, a separate city south of Chicago, rather than Chicago itself. The parish was founded in 1911, celebrated its first Mass at Easter 1912, and closed in the late 1980s. Sources give 1987 and 1989; the exact year remains unresolved. Earlier references to Marquette Park and Brighton Park appear to have confused the parish with the Sisters of St. Casimir motherhouse there. Ten stained-glass windows, each donated by a Lithuanian family, reached the Vilnius Archdiocese restoration trust around 2008. Their maker remains uncertain; a proposed attribution to Adolfas Valeška is disputed in Draugas reporting from 2013.";
    }
    if (/^Argentina location\b/i.test(text)) {
      return `${name} belonged to Lithuanian Catholic life in Argentina. It appears here as a diaspora comparator and is not included in United States parish counts.`;
    }
    if (
      /^Diocese closed the parish ~2009 in the Allentown wave; building sold to a private individual/i.test(
        text,
      )
    ) {
      return "The Diocese of Allentown closed the parish around 2009. The church was sold to R. Demyanovich for about $24,000 to prevent its conversion to warehouse use. This was a private sale, not a community buyout. The parish belongs to the Pennsylvania coal-region story.";
    }
    if (/^LNCC, community-governed, never diocesan\./i.test(text)) {
      return "This community-governed Lithuanian National Catholic parish broke from Roman Catholic authority during the 1916 schism. When it closed in 1972, about 30 to 40 parishioners remained; the community sold the building, which was later demolished. The parish cemetery in Bensalem, Pennsylvania, survives.";
    }
    return text
      .replace(
        /^Survived an earlier ~(\d{4}) closure danger; ~\$(\d+)K community savings deemed insufficient\. Diocese closed\/merged the parish in (\d{4}) into ([^;]+); building sold to Spanish-speakers\.$/i,
        "The parish survived a closure threat around $1, although diocesan officials considered its roughly $$$2,000 in community savings insufficient. In $3, the diocese closed the parish and merged it into $4. The church was sold to a Spanish-speaking congregation.",
      )
      .replace(
        /^Diocese closed the parish (June \d{1,2} \d{4}) under Together in Faith, merged into ([^.]+)\. Survived a (\d{4}) closure scare but resistance only delayed the outcome\. Only (\d+) registered parishioners at closure\.$/i,
        "The diocese closed the parish on $1 under Together in Faith and merged it into $2. The community had survived a closure threat in $3, but its resistance only delayed the outcome. At closure, just $4 parishioners were registered.",
      )
      .replace(
        /^Founded ~(\d{4}); by (\d{4}) described as the ([^.]+)\./i,
        `${name} was founded around $1. In $2, the surrounding neighborhood was described as the $3.`,
      )
      .replace(
        /^Founded (\d{4}), rebuilt (\d{4});\s*/i,
        `${name} was founded in $1 and rebuilt in $2. `,
      )
      .replace(/^Founded (\d{4});\s*/i, `${name} was founded in $1. `)
      .replace(/^Founded (\d{4})\.\s*/i, `${name} was founded in $1. `)
      .replace(/^Closed (\d{4});\s*/i, `The parish closed in $1. `)
      .replace(/^Survived\b/i, "The parish survived")
      .replace(
        /^Bridgeport\.\s*/i,
        "This was the Lithuanian parish in Chicago's Bridgeport neighborhood. ",
      )
      .replace(
        /\bLetter campaign to the cardinal and Pope failed\./i,
        "Parishioners appealed to the cardinal and the Pope, but the campaign failed.",
      )
      .replace(
        /;\s*rescue committee concluded saving it was impossible\./i,
        ". A rescue committee concluded that the church could not be saved.",
      )
      .replace(
        /^Marquette Park\.\s*/i,
        "This parish serves Chicago's Marquette Park neighborhood. ",
      )
      .replace(
        /^Pilsen\/Brighton Park area\.\s*/i,
        "The parish served Chicago's Pilsen and Brighton Park area. ",
      )
      .replace(
        /^18th Street\/Pilsen\.\s*/i,
        "The parish served Chicago's 18th Street and Pilsen neighborhood. ",
      )
      .replace(
        /^Back of the Yards\.\s*/i,
        "The parish served Chicago's Back of the Yards neighborhood. ",
      )
      .replace(
        /^East Side\.\s*/i,
        "The parish served Chicago's East Side. ",
      )
      .replace(
        /^Pittsburgh area\.\s*/i,
        "The parish served the Pittsburgh area. ",
      )
      .replace(/^Queens\.\s*/i, "The parish served Queens. ")
      .replace(
        /^Last Lithuanian priest died; diocese sold the building to a Mexican Catholic congregation around (\d{4})\./i,
        "After the parish's last Lithuanian priest died, the diocese sold the church to a Mexican Catholic congregation around $1.",
      )
      .replace(
        /\bLithuanian identity erased\./i,
        "Its life as a Lithuanian parish ended, while the church continued in another Catholic community.",
      )
      .replace(
        /\bBuilding fate (?:is )?(?:unrecorded|not recorded)\./gi,
        "What became of the church building has not yet been established.",
      )
      .replace(
        /^Historical reference only; closed (\d{4})\. Building may remain but identity uncertain\.$/i,
        "The parish closed in $1. The surviving sources do not yet establish whether its church building remains or what became of it.",
      )
      .replace(
        /\bSurvived inside the diocese; by (\d{4}) the sole surviving Lithuanian (?:Roman Catholic|RC) parish in Chicago\./i,
        "It survived successive diocesan changes. By $1, it was Chicago's sole surviving Lithuanian Roman Catholic parish.",
      )
      .replace(
        /\bChronic deficit covered by the archdiocese as a high-interest loan; building valued ~\$(\d+)M and not parish-owned\./i,
        "The archdiocese has covered a chronic operating deficit through a high-interest loan. The church building, valued at roughly $$$1 million, remains archdiocesan property.",
      )
      .replace(/^Closed (\d{4}) when\b/i, "The parish closed in $1 when")
      .replace(/(^|[.!?]\s+)Diocese\b/g, "$1The diocese")
      .replace(/\bclosed\/merged\b/gi, "closed and merged")
      .replace(/\bSpanish-speakers\b/gi, "a Spanish-speaking congregation")
      .replace(/\bRC\b/g, "Roman Catholic")
      .replace(/\s*\(adjudicated \d{4}-\d{2}-\d{2}[^)]*\)/gi, "")
      .replace(/\s*Registry Revision \d+[^.]*\./gi, "")
      .replace(/a ~(\d+)-year\b/gi, "a nearly $1-year")
      .replace(/~end of (\d{4})/gi, "near the end of $1")
      .replace(/\s~(\d{4})\b/g, " around $1")
      .replace(
        /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?) (\d{1,2}) (\d{4})\b/g,
        "$1 $2, $3",
      )
      .replace(/\s+/g, " ")
      .trim();
  }

  const internalStatusCopy =
    /documented in (?:the )?(?:draugas )?registry|documented in draugas|minimal (?:research details|documentation)|needs (?:clarification|verification)|status not yet (?:researched|verified)|present status not yet researched|single source only|unnamed\/duplicate parish entry/i;
  const location = [city, state].filter(Boolean).join(", ");
  const historical =
    isLoss(endState) ||
    endState === "transferred" ||
    endState === "repurposed" ||
    endState === "demolished" ||
    endState === "closed";
  const institutionCopy =
    institution === "Parish record" ? "parish record" : institution;
  const intro = `${name} ${historical ? "was" : "is"} ${community ? "a Lithuanian worshipping community" : `a ${institutionCopy}`} in ${location}${founded ? `, founded in ${founded}` : ""}.`;
  const researched =
    situationText &&
    !internalStatusCopy.test(situationText)
      ? situationText
      : null;
  if (researched) {
    return splitStory(`${intro} ${narrativeSituation(researched)}`);
  }

  const opening = [intro, sourceLead].filter(Boolean).join(" ");
  const knownCurrentUse =
    currentUse && !/^(unknown|not established)$/i.test(currentUse)
      ? currentUse.replace(/\.$/, "")
      : null;

  if (community) {
    return splitStory(
      `${opening} The surviving evidence does not establish a distinct Lithuanian national parish.`,
    );
  }
  if (closed && isLoss(endState)) {
    const outcome =
      endState === "demolished"
        ? " The church building was later demolished."
        : endState === "repurposed"
          ? ` The church building survives in a new use.${knownCurrentUse ? ` Today, ${knownCurrentUse}.` : ""}`
          : knownCurrentUse
            ? ` Today, ${knownCurrentUse}.`
            : "";
    return splitStory(
      `${opening} The parish closed in ${closed}.${outcome}`,
    );
  }
  if (endState === "demolished") {
    return splitStory(
      `${opening} The parish closed and the church building was demolished.`,
    );
  }
  if (endState === "repurposed") {
    return splitStory(
      `${opening} The parish closed, but the church building survives in a new use.${knownCurrentUse ? ` Today, ${knownCurrentUse}.` : ""}`,
    );
  }
  if (endState === "closed") {
    return splitStory(`${opening} The parish is now closed.`);
  }
  if (endState === "transferred") {
    return splitStory(
      `${opening} Its life as a Lithuanian parish has ended, while the church continues in another community.${knownCurrentUse ? ` Today, ${knownCurrentUse}.` : ""}`,
    );
  }
  if (endState === "active_parish") {
    return splitStory(`${opening} It remains an active Lithuanian parish.`);
  }
  if (endState === "mass_continues") {
    return splitStory(
      `${opening} It is no longer Lithuanian-led, but Lithuanian Mass continues.`,
    );
  }
  if (endState === "unresolved") {
    return splitStory(
      `${opening} The church stands, but the parish's final institutional status remains unresolved.`,
    );
  }
  return splitStory(
    `${opening} The surviving sources do not yet establish the community's later history.`,
  );
}

function researchRecordStory(recordType: string) {
  if (recordType === "phase") {
    return {
      dek: "A short-lived independent or national Catholic movement took shape here, but the surviving evidence does not establish a durable parish.",
      rest: null,
    };
  }
  if (recordType === "lead") {
    return {
      dek: "The surviving evidence points to a possible Lithuanian religious community here, but its name and institutional status remain uncertain.",
      rest: null,
    };
  }
  return {
    dek: "This place or episode belongs to the history of Lithuanian religious life, but it does not represent a separate parish or congregation.",
    rest: null,
  };
}

function researchStatusCopy(recordType: string) {
  if (recordType === "phase") {
    return "This was a historical attempt or phase, not a separate present-day parish.";
  }
  if (recordType === "lead") {
    return "The community's identity and institutional status remain unresolved, so it is not included in parish counts.";
  }
  return "This is historical context rather than a separate parish, and it is not included in parish counts.";
}

function publicOwnershipLabel(ownership: string | null | undefined) {
  if (!ownership || /^(none|unknown|unspecified)$/i.test(ownership)) {
    return null;
  }
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
  if (profile.core) {
    return INSTITUTION_TYPE_LABEL[profile.core.institutionType];
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
  if (!caseStatus || /^(unknown|not established)$/i.test(caseStatus)) {
    return null;
  }
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
  const baseDisplayStatus =
    researchOnly
      ? "Research record"
      : recordType === "misija" && endState === "active_parish"
        ? "Active Lithuanian mission"
        : END_STATE_LABEL[endState];
  const displayStatus =
    !researchOnly && closedYear && isLoss(endState)
      ? `${baseDisplayStatus} · ${closedYear}`
      : baseDisplayStatus;
  const profileView = buildParishProfileView({
    name,
    city: entry.city,
    state: entry.state ?? null,
    country: entry.country,
    institution,
    founded: foundedYear,
    closed: closedYear,
    status: displayStatus,
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
  });
  const identityBadges = (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {!researchOnly || parishAlert || watchEntry ? (
        <>
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
        </>
      ) : null}
      <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium">
        {institution}
      </span>
      {entry.needs_human_source_review && (
        <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Identity or status unresolved
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
  );
  const overviewSection = (
    <section
      id="profile-overview"
      className="mt-7 scroll-mt-8"
      aria-labelledby="parish-overview-heading"
    >
      <h2
        id="parish-overview-heading"
        className="font-serif text-xl font-semibold"
      >
        Overview
      </h2>
      <p className="mt-3 max-w-2xl font-serif text-lg leading-relaxed sm:text-xl">
        {dek}
      </p>
    </section>
  );

  return (
    <article
      className="mx-auto max-w-4xl px-4 py-12"
      data-profile-layout="canonical-v1"
      data-record-depth={profile.recordDepth}
    >
      <p className="text-xs uppercase tracking-widest text-muted">
        <Link href="/record" className="underline hover:text-foreground">
          The Record
        </Link>{" "}
        / {entry.city}
        {entry.state ? `, ${entry.state}` : ""}
      </p>

      <div className="mt-4 grid items-start gap-5 md:grid-cols-[20rem_minmax(0,1fr)] md:gap-8 lg:grid-cols-[23rem_minmax(0,1fr)]">
        <figure className="w-full max-w-md overflow-hidden rounded-lg border border-rule md:max-w-none">
          {photo ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              width={720}
              height={isLineDrawing ? 720 : 540}
              loading="eager"
              className={
                isLineDrawing
                  ? "aspect-square w-full bg-[#fffdf9] object-contain p-3"
                  : "aspect-[4/3] w-full object-cover"
              }
            />
          ) : (
            <div className="flex aspect-square w-full flex-col items-center justify-center bg-band px-8 text-center">
              <p className="text-xs uppercase tracking-widest text-muted">
                {institution}
              </p>
              <p className="mt-3 font-serif text-2xl font-semibold">{name}</p>
              <p className="mt-1 text-sm text-muted">
                {entry.city}
                {entry.state ? `, ${entry.state}` : ""}
              </p>
              <p className="mt-5 text-xs text-muted">
                {foundedYear ? `Established ${foundedYear}` : displayStatus}
              </p>
            </div>
          )}
          <figcaption className="border-t border-rule px-2 py-1 text-[10px] leading-snug text-muted">
            {photo ? (
              <a
                href="#evidence-sources"
                className="underline underline-offset-2 hover:text-accent"
              >
                {isLineDrawing
                  ? "Line-art credit & source"
                  : "Image credit & source"}
              </a>
            ) : (
              "Parish identity record"
            )}
          </figcaption>
        </figure>

        <div className="min-w-0">
          <h1
            className="font-serif text-3xl font-semibold leading-tight [overflow-wrap:anywhere] sm:text-4xl"
          >
            {name}
          </h1>
          <p className="mt-1 text-lg text-muted">
            {altName ? `${altName} · ` : ""}
            {entry.city}
            {entry.state ? `, ${entry.state}` : ""}
            {entry.country === "CA" ? " · Canada" : ""}
          </p>

          {identityBadges}
          {overviewSection}
        </div>
      </div>

      <section
        id="place-and-jurisdiction"
        className="mt-10"
        aria-labelledby="place-and-jurisdiction-heading"
      >
        <h2
          id="place-and-jurisdiction-heading"
          className="font-serif text-2xl font-semibold"
        >
          The community and its place
        </h2>
        <p className="mt-2 text-sm text-muted">
          {entry.city}
          {entry.state ? `, ${entry.state}` : ""}
          {entry.diocese ? ` · ${entry.diocese}` : ""}
        </p>
        {hasMap ? (
          <div className="mt-4 max-w-2xl">
            <ParishContextMap
              slug={profile.slug}
              dioceseLabel={entry.diocese ?? undefined}
            />
          </div>
        ) : (
          <dl className="mt-4 grid gap-x-8 gap-y-4 border-y border-rule py-5 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Place
              </dt>
              <dd className="mt-1">
                {entry.city}
                {entry.state ? `, ${entry.state}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Country
              </dt>
              <dd className="mt-1">
                {entry.country === "CA" ? "Canada" : "United States"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Jurisdiction
              </dt>
              <dd className="mt-1">{entry.diocese ?? "Not established"}</dd>
            </div>
          </dl>
        )}
      </section>

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

      <section
        id="profile-facts"
        className="mt-10"
        aria-labelledby="profile-facts-heading"
      >
        <h2
          id="profile-facts-heading"
          className="font-serif text-2xl font-semibold"
        >
          At a glance
        </h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 border-y border-rule py-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {profileView.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs uppercase tracking-wide text-muted">
                {fact.label}
              </dt>
              <dd className="mt-1 leading-relaxed">{fact.value}</dd>
            </div>
          ))}
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

      <ParishProfileChronology items={profileView.chronology} />

      <section
        id="present-condition"
        className="mt-10"
        aria-labelledby="present-condition-heading"
      >
        <h2
          id="present-condition-heading"
          className="font-serif text-2xl font-semibold"
        >
          {researchOnly ? "Research status" : "Where it stands today"}
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          {profileView.currentSummary}
        </p>
        {profileView.currentAsOf && (
          <p className="mt-2 text-xs uppercase tracking-wide text-muted">
            Current record dated {profileView.currentAsOf}
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
                href="/#happening-now"
                className="inline-flex items-center gap-1 rounded-md border border-rule px-3 py-1.5 text-sm font-medium transition-colors hover:border-foreground"
              >
                All current campaigns &rarr;
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
                  href="/lithuanian-catholic-life-today#worship-network-heading"
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

        {core?.survivedReviewThenClosed && (
          <p
            className="mt-5 rounded-lg border border-rule p-4 leading-relaxed"
            style={{ borderLeft: "4px solid var(--es-closed)" }}
          >
            This parish <strong>survived an earlier diocesan review</strong>{" "}
            before a later decision closed it. Its history shows that one
            favorable restructuring decision did not guarantee long-term
            security.
          </p>
        )}
      </section>

      <section
        id="profile-corrections"
        className="mt-10 rounded-lg border border-rule p-5"
      >
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
