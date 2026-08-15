import { geoAlbersUsa } from "d3-geo";
import alertsData from "@/data/canonical-current-events-projection.json";
import contextPointsData from "@/data/context-points.json";
import {
  canonicalInfographics,
  currentPastoralNetwork,
  romanCatholicInstitutionHistory,
  type CurrentPastoralDirectoryEntry,
} from "@/lib/infographic-projection";
import { canonicalProfileHrefForRegistrySlug } from "@/lib/parish-profile";
import { widerCatholicLifeRecords } from "@/lib/wider-catholic-life";
import { CLERGY_LABEL, FREQUENCY_LABEL } from "@/lib/watch-labels";

type AlertKind = "active" | "watch" | "building";

type CurrentAlert = {
  id: string;
  kind: AlertKind;
  entity: string;
  place: string;
  diocese: string;
  dateObserved: string;
  whatChanged: string;
  parishLink: string | null;
};

type CurrentCampaign = {
  id: string;
  parishLink: string;
  hearthUrl: string;
  actionUrl: string;
  actionLabel: string;
};

type SustainabilityRecord = {
  parishLink: string;
  dateObserved: string;
  clergy: { arrangement: string };
  liturgy: { frequency: string };
};

type ContextPoint = {
  href: string | null;
  x: number;
  y: number;
};

export type LivingNetworkSituation = {
  id: string;
  kind: AlertKind;
  tag: string;
  text: string;
  dateObserved: string;
  diocese: string;
  hearthUrl: string | null;
  actionUrl: string | null;
  actionLabel: string | null;
};

export type LivingNetworkCard = {
  id: string;
  anchor: string;
  nameEn: string;
  nameLt: string;
  city: string;
  state: string;
  typeLabel: string;
  networkClass: CurrentPastoralDirectoryEntry["networkClass"];
  ministry: string;
  clergy: string | null;
  massCadence: string | null;
  checked: string | null;
  profileHref: string | null;
  officialSite: string | null;
  founded: number | null;
  portraitKey: string;
  situation: LivingNetworkSituation | null;
};

export type LivingNetworkMapPoint = {
  id: string;
  anchor: string;
  nameEn: string;
  nameLt: string;
  city: string;
  state: string;
  detail: string;
  x: number;
  y: number;
  kind:
    | "active_parish"
    | "active_mission"
    | "mass_continues"
    | "religious_house"
    | "occasional_worship_community";
};

export type WiderLifeCard = {
  id: string;
  anchor: string;
  nameEn: string;
  nameLt: string;
  city: string;
  state: string;
  typeLabel: string;
  explanation: string;
  profileHref: string;
  officialSite: string;
  portraitKey: string;
};

export type TrackedCard = {
  id: string;
  anchor: string;
  name: string;
  place: string;
  profileHref: string | null;
  portraitKey: string | null;
  situation: LivingNetworkSituation;
};

const entries = currentPastoralNetwork.directory.entries;
const alerts = alertsData.alerts as CurrentAlert[];
const campaigns = alertsData.campaigns as CurrentCampaign[];
const sustainability = alertsData.sustainabilityWatch as SustainabilityRecord[];

const contextByHref = new Map(
  (contextPointsData.points as ContextPoint[])
    .filter((point) => point.href)
    .map((point) => [point.href!, point]),
);
const institutionByHref = new Map(
  romanCatholicInstitutionHistory.map((row) => [row.public_profile, row]),
);
const alertByHref = new Map(
  alerts
    .filter((alert) => alert.parishLink)
    .map((alert) => [alert.parishLink!, alert]),
);
const campaignByHref = new Map(
  campaigns.map((campaign) => [campaign.parishLink, campaign]),
);
const sustainabilityByHref = new Map(
  sustainability.map((record) => [record.parishLink, record]),
);

const NETWORK_ONLY_COORDS: Record<string, { x: number; y: number }> = {
  "washington-epiphany": { x: 828, y: 267.5 },
};

function profileHrefFor(entry: CurrentPastoralDirectoryEntry) {
  return entry.registrySlug
    ? canonicalProfileHrefForRegistrySlug(entry.registrySlug)
    : null;
}

function portraitKeyFor(
  entry: CurrentPastoralDirectoryEntry,
  profileHref: string | null,
) {
  const slug = profileHref?.replace(/^\/parishes\//, "");
  return `${slug ?? entry.id}-line-drawing`;
}

function firstSentences(value: string, limit = 2) {
  const matches = value.match(/[^.!?]+[.!?]+(?:\s|$)/g);
  if (!matches) return value;
  return matches.slice(0, limit).join(" ").replace(/\s+/g, " ").trim();
}

function situationFor(profileHref: string | null): LivingNetworkSituation | null {
  if (!profileHref) return null;
  const alert = alertByHref.get(profileHref);
  if (!alert) return null;
  const campaign = campaignByHref.get(profileHref);
  return {
    id: alert.id,
    kind: alert.kind,
    tag:
      alert.kind === "active"
        ? "Active campaign"
        : alert.kind === "building"
          ? "Building at risk"
          : "Development to monitor",
    text: firstSentences(alert.whatChanged),
    dateObserved: alert.dateObserved,
    diocese: alert.diocese,
    hearthUrl: campaign?.hearthUrl ?? null,
    actionUrl: campaign?.actionUrl ?? null,
    actionLabel: campaign?.actionLabel ?? null,
  };
}

function cardFor(entry: CurrentPastoralDirectoryEntry): LivingNetworkCard {
  const profileHref = profileHrefFor(entry);
  const condition = profileHref
    ? sustainabilityByHref.get(profileHref) ?? null
    : null;
  const institution = profileHref ? institutionByHref.get(profileHref) : null;
  const typeLabel =
    entry.networkClass === "active_parish"
      ? "Lithuanian parish"
      : entry.networkClass === "active_mission"
        ? "Lithuanian mission"
        : entry.networkClass === "mass_continues"
          ? "Hosted Lithuanian Mass"
          : entry.networkClass === "religious_house"
            ? "Religious house"
            : "On the Sielovada listing";

  return {
    id: entry.id,
    anchor: `network-${entry.id}`,
    nameEn: entry.nameEn,
    nameLt: entry.nameLt,
    city: entry.city,
    state: entry.state,
    typeLabel,
    networkClass: entry.networkClass,
    ministry: entry.ministry,
    clergy:
      entry.clergy ??
      (condition ? CLERGY_LABEL[condition.clergy.arrangement] ?? null : null),
    massCadence: condition
      ? FREQUENCY_LABEL[condition.liturgy.frequency] ?? null
      : null,
    checked: condition?.dateObserved ?? null,
    profileHref,
    officialSite: entry.officialSite ?? null,
    founded: institution?.founded.year ?? null,
    portraitKey: portraitKeyFor(entry, profileHref),
    situation: situationFor(profileHref),
  };
}

const regularClasses = new Set([
  "active_parish",
  "active_mission",
  "mass_continues",
]);
const regularEntries = entries.filter((entry) =>
  regularClasses.has(entry.networkClass),
);
const activeCards = regularEntries
  .filter((entry) => entry.networkClass !== "mass_continues")
  .map(cardFor)
  .sort(
    (a, b) =>
      (a.founded ?? 9999) - (b.founded ?? 9999) ||
      a.nameEn.localeCompare(b.nameEn),
  );
const hostedCards = regularEntries
  .filter((entry) => entry.networkClass === "mass_continues")
  .map(cardFor)
  .sort((a, b) => a.nameEn.localeCompare(b.nameEn));

const widerCards: WiderLifeCard[] = widerCatholicLifeRecords.map((record) => ({
  id: record.entityId,
  anchor: `wider-${record.slug}`,
  nameEn: record.nameEn,
  nameLt: record.nameLt,
  city: record.city,
  state: record.state,
  typeLabel: record.classificationLabel,
  explanation: record.explanation,
  profileHref: record.href,
  officialSite: record.officialSite,
  portraitKey: `${record.slug}-line-drawing`,
}));

const directoryReligiousIds = new Set(
  entries
    .filter((entry) => entry.networkClass === "religious_house")
    .map((entry) => entry.canonicalEntityId)
    .filter((id): id is string => !!id),
);
const widerEntityIds = new Set(widerCatholicLifeRecords.map((record) => record.entityId));
for (const entityId of directoryReligiousIds) {
  if (!widerEntityIds.has(entityId)) {
    throw new Error(
      `Sielovada religious-house entry ${entityId} is missing from wider Catholic life`,
    );
  }
}

const otherDirectoryCards = entries
  .filter(
    (entry) =>
      !regularClasses.has(entry.networkClass) &&
      entry.networkClass !== "religious_house",
  )
  .map(cardFor)
  .sort((a, b) => a.nameEn.localeCompare(b.nameEn));

const directoryProfileHrefs = new Set(
  entries
    .map(profileHrefFor)
    .filter((href): href is string => !!href),
);
const trackedCards: TrackedCard[] = alerts
  .filter(
    (alert) =>
      !alert.parishLink || !directoryProfileHrefs.has(alert.parishLink),
  )
  .map((alert) => {
    const campaign = alert.parishLink
      ? campaignByHref.get(alert.parishLink)
      : null;
    const situation: LivingNetworkSituation = {
      id: alert.id,
      kind: alert.kind,
      tag:
        alert.kind === "active"
          ? "Active campaign"
          : alert.kind === "building"
            ? "Building at risk"
            : "Development to monitor",
      text: firstSentences(alert.whatChanged),
      dateObserved: alert.dateObserved,
      diocese: alert.diocese,
      hearthUrl: campaign?.hearthUrl ?? null,
      actionUrl: campaign?.actionUrl ?? null,
      actionLabel: campaign?.actionLabel ?? null,
    };
    const slug = alert.parishLink?.replace(/^\/parishes\//, "") ?? null;
    return {
      id: alert.id,
      anchor: `tracked-${alert.id}`,
      name: alert.entity,
      place: alert.place,
      profileHref: alert.parishLink,
      portraitKey: slug ? `${slug}-line-drawing` : null,
      situation,
    };
  })
  .sort(
    (a, b) =>
      ({ active: 0, watch: 1, building: 2 })[a.situation.kind] -
        ({ active: 0, watch: 1, building: 2 })[b.situation.kind] ||
      a.name.localeCompare(b.name),
  );

const mapProjection = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const regularMapPoints: LivingNetworkMapPoint[] = regularEntries.map((entry) => {
  const profileHref = profileHrefFor(entry);
  const coords =
    (profileHref ? contextByHref.get(profileHref) : null) ??
    NETWORK_ONLY_COORDS[entry.id];
  if (!coords) {
    throw new Error(`${entry.id}: regular worship place lacks map coordinates`);
  }
  return {
    id: entry.id,
    anchor: `network-${entry.id}`,
    nameEn: entry.nameEn,
    nameLt: entry.nameLt,
    city: entry.city,
    state: entry.state,
    detail: entry.ministry,
    x: coords.x,
    y: coords.y,
    kind: entry.networkClass as LivingNetworkMapPoint["kind"],
  };
});
const widerMapPoints: LivingNetworkMapPoint[] = widerCatholicLifeRecords.map(
  (record) => {
    const coords = mapProjection([record.geo.lon, record.geo.lat]);
    if (!coords) throw new Error(`${record.entityId}: wider-life map projection failed`);
    return {
      id: record.entityId,
      anchor: `wider-${record.slug}`,
      nameEn: record.nameEn,
      nameLt: record.nameLt,
      city: record.city,
      state: record.state,
      detail: record.explanation,
      x: coords[0],
      y: coords[1],
      kind: record.classification,
    };
  },
);

const stateCount = new Set(regularEntries.map((entry) => entry.state)).size;
const counts = currentPastoralNetwork.counts;

if (
  regularEntries.length !== 14 ||
  counts.active_parish !== 6 ||
  counts.active_mission !== 2 ||
  counts.mass_continues !== 6 ||
  stateCount !== 9 ||
  entries.length !== 20 ||
  widerCards.length !== 3 ||
  otherDirectoryCards.length !== 5 ||
  trackedCards.length !== 5 ||
  regularMapPoints.length !== regularEntries.length ||
  widerMapPoints.length !== widerCards.length ||
  alerts.some((alert) => alert.id === "cleveland-st-casimir-watch")
) {
  throw new Error("Living Network canonical population or exclusion contract drifted");
}

export const livingNetworkView = {
  revision: canonicalInfographics.revision_id,
  generated: canonicalInfographics.generated,
  observed: String(currentPastoralNetwork.directory.source.checked),
  sourceTitle: String(currentPastoralNetwork.directory.source.title),
  sourceUrl: String(currentPastoralNetwork.directory.source.url),
  institutionCount: romanCatholicInstitutionHistory.length,
  counts: {
    places: regularEntries.length,
    states: stateCount,
    parishes: counts.active_parish,
    missions: counts.active_mission,
    hosted: counts.mass_continues,
    directory: entries.length,
    wider: widerCards.length,
    otherDirectory: otherDirectoryCards.length,
    tracked: trackedCards.length,
  },
  activeCards,
  hostedCards,
  widerCards,
  otherDirectoryCards,
  trackedCards,
  regularMapPoints,
  widerMapPoints,
};
