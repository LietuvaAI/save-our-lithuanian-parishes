import type { EndStateGroup } from "@/lib/end-state";
import {
  canonicalInfographics,
  infographicCounts,
  pennsylvaniaCoalRegion,
  romanCatholicParishHistory,
} from "@/lib/infographic-projection";

export type HistoryParish = {
  slug: string;
  name: string;
  canonicalName: string;
  city: string;
  state: string;
  jurisdictionKey: string;
  jurisdictionName: string;
  foundedYear: number | null;
  endedYear: number | null;
  status: EndStateGroup;
  profileHref: string;
};

export type HistoryDecade = {
  decade: number;
  founded: HistoryParish[];
  closed: HistoryParish[];
};

export type HistoryYear = {
  year: number;
  alive: number;
  founded: HistoryParish[];
  ended: HistoryParish[];
};

export type HistoryDiocese = {
  key: string;
  canonicalName: string;
  total: number;
  active: number;
  ended: number;
  formalClosed: number;
  transferred: number;
  unresolved: number;
  parishes: HistoryParish[];
};

const currentYear = new Date(
  `${canonicalInfographics.generated}T00:00:00Z`,
).getUTCFullYear();

const parishes: HistoryParish[] = romanCatholicParishHistory.map((parish) => ({
  slug: parish.registry_slug,
  name: parish.name,
  canonicalName: parish.canonical_name,
  city: parish.city,
  state: parish.state,
  jurisdictionKey: parish.jurisdiction?.key ?? parish.diocese ?? "Unassigned",
  jurisdictionName:
    parish.jurisdiction?.canonical_name ?? "Jurisdiction not established",
  foundedYear: parish.founded.year,
  endedYear: parish.closed.year,
  status: parish.status_group,
  profileHref: parish.public_profile,
}));

const decades: HistoryDecade[] = [];
for (let decade = 1880; decade <= Math.floor(currentYear / 10) * 10; decade += 10) {
  decades.push({
    decade,
    founded: parishes.filter(
      (parish) =>
        parish.foundedYear != null &&
        Math.floor(parish.foundedYear / 10) * 10 === decade,
    ),
    closed: parishes.filter(
      (parish) =>
        parish.status === "closed" &&
        parish.endedYear != null &&
        Math.floor(parish.endedYear / 10) * 10 === decade,
    ),
  });
}

const years: HistoryYear[] = [];
for (let year = 1880; year <= currentYear; year += 1) {
  const founded = parishes.filter((parish) => parish.foundedYear === year);
  const ended = parishes.filter((parish) => parish.endedYear === year);
  const alive = parishes.filter(
    (parish) =>
      parish.foundedYear != null &&
      parish.foundedYear <= year &&
      (parish.endedYear == null || parish.endedYear > year),
  ).length;
  years.push({ year, alive, founded, ended });
}

const dioceseMap = new Map<string, HistoryParish[]>();
for (const parish of parishes) {
  if (!dioceseMap.has(parish.jurisdictionKey)) {
    dioceseMap.set(parish.jurisdictionKey, []);
  }
  dioceseMap.get(parish.jurisdictionKey)!.push(parish);
}

const dioceses: HistoryDiocese[] = [...dioceseMap.entries()]
  .map(([key, members]) => ({
    key,
    canonicalName: members[0]?.jurisdictionName ?? "Jurisdiction not established",
    total: members.length,
    active: members.filter((parish) => parish.status === "active_parish").length,
    ended: members.filter(
      (parish) => parish.status === "closed" || parish.status === "transferred",
    ).length,
    formalClosed: members.filter((parish) => parish.status === "closed").length,
    transferred: members.filter((parish) => parish.status === "transferred")
      .length,
    unresolved: members.filter((parish) => parish.status === "unresolved").length,
    parishes: members.sort(
      (a, b) =>
        (a.foundedYear ?? 9999) - (b.foundedYear ?? 9999) ||
        a.name.localeCompare(b.name),
    ),
  }))
  .sort((a, b) => b.total - a.total || a.canonicalName.localeCompare(b.canonicalName));

const statusCounts = Object.fromEntries(
  [
    "active_parish",
    "mass_continues",
    "transferred",
    "unresolved",
    "closed",
    "unverified",
  ].map((status) => [
    status,
    parishes.filter((parish) => parish.status === status).length,
  ]),
) as Record<EndStateGroup, number>;

const peakAlive = Math.max(...years.map((year) => year.alive));
const peakYears = years.filter((year) => year.alive === peakAlive);
const peakYear = peakYears[Math.floor(peakYears.length / 2)]!;
const peakFoundedDecade = decades.reduce((peak, decade) =>
  decade.founded.length > peak.founded.length ? decade : peak,
);
const peakClosedDecade = decades.reduce((peak, decade) =>
  decade.closed.length > peak.closed.length ? decade : peak,
);
const namedDioceses = dioceses.filter((diocese) => diocese.key !== "Unassigned");

export const historyProjection = {
  revision: canonicalInfographics.revision_id,
  generated: canonicalInfographics.generated,
  currentYear,
  parishes,
  decades,
  years,
  dioceses: namedDioceses,
  counts: {
    total: parishes.length,
    status: statusCounts,
    foundedUndated: parishes.filter((parish) => parish.foundedYear == null).length,
    formalClosureUndated: parishes.filter(
      (parish) => parish.status === "closed" && parish.endedYear == null,
    ).length,
    closedSince1990: parishes.filter(
      (parish) =>
        parish.status === "closed" &&
        parish.endedYear != null &&
        parish.endedYear >= 1990,
    ).length,
    closedSince2020: parishes.filter(
      (parish) =>
        parish.status === "closed" &&
        parish.endedYear != null &&
        parish.endedYear >= 2020,
    ).length,
    foundedBy1929: parishes.filter(
      (parish) => parish.foundedYear != null && parish.foundedYear <= 1929,
    ).length,
    pennsylvania: parishes.filter((parish) => parish.state === "PA").length,
    namedDioceses: namedDioceses.length,
    diocesesWithoutActive: namedDioceses.filter((diocese) => diocese.active === 0)
      .length,
    endedOrTransferred: parishes.filter(
      (parish) => parish.status === "closed" || parish.status === "transferred",
    ).length,
    coalRegion: pennsylvaniaCoalRegion.counts,
  },
  peakYear,
  currentYearPoint: years.at(-1)!,
  peakFoundedDecade,
  peakClosedDecade,
} as const;

if (
  historyProjection.counts.total !==
    infographicCounts.roman_catholic_parish_institutions ||
  historyProjection.counts.status.closed !==
    infographicCounts.closed_roman_catholic_parishes ||
  historyProjection.counts.closedSince1990 !==
    infographicCounts.closed_roman_catholic_parishes_since_1990 ||
  historyProjection.counts.closedSince2020 !==
    infographicCounts.closed_roman_catholic_parishes_since_2020 ||
  historyProjection.counts.coalRegion.diocese_owned !== 14 ||
  historyProjection.counts.coalRegion.diocese_ended !== 11
) {
  throw new Error("Canonical History projection drifted from its unit contracts.");
}
