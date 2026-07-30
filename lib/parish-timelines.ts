import timelineData from "@/data/parish-timelines.json";
import {
  finalizeProfileSources,
  type ProfileSource,
  type ProfileSourceGroup,
} from "@/lib/profile-sources";

export type ParishTimelineKind =
  | "parish"
  | "building_lost"
  | "decision"
  | "building_current"
  | "current";

export type ParishTimelineEvent = {
  date: string;
  sortYear: number;
  kind: ParishTimelineKind;
  title: string;
  detail: string;
  sourceIds: string[];
};

export type ParishTimelineSource = {
  id: string;
  group: ProfileSourceGroup;
  title: string;
  citation: string;
  url: string;
};

export type ParishTimeline = {
  parishLink: string;
  title: string;
  intro: string;
  asOf: string;
  events: ParishTimelineEvent[];
  sources: ParishTimelineSource[];
};

const timelines = (timelineData as { timelines: ParishTimeline[] }).timelines;
const timelineByLink = new Map<string, ParishTimeline>();

for (const timeline of timelines) {
  if (timelineByLink.has(timeline.parishLink)) {
    throw new Error(
      `Duplicate parish timeline for ${timeline.parishLink}.`,
    );
  }

  const sourceIds = new Set<string>();
  for (const source of timeline.sources) {
    if (sourceIds.has(source.id)) {
      throw new Error(
        `Duplicate timeline source ${source.id} for ${timeline.parishLink}.`,
      );
    }
    sourceIds.add(source.id);
  }

  for (const [index, event] of timeline.events.entries()) {
    if (
      index > 0 &&
      event.sortYear < timeline.events[index - 1].sortYear
    ) {
      throw new Error(
        `Timeline events are out of order for ${timeline.parishLink}.`,
      );
    }
    for (const sourceId of event.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        throw new Error(
          `Timeline event "${event.title}" references missing source ${sourceId}.`,
        );
      }
    }
  }

  timelineByLink.set(timeline.parishLink, timeline);
}

export function getParishTimeline(
  profileLinks: Iterable<string>,
): ParishTimeline | null {
  for (const link of profileLinks) {
    const timeline = timelineByLink.get(link);
    if (timeline) return timeline;
  }
  return null;
}

export function parishTimelineProfileSources(
  timeline: ParishTimeline | null,
): ProfileSource[] {
  if (!timeline) return [];

  return finalizeProfileSources(
    timeline.sources.map((source) => ({
      id: source.id,
      group: source.group,
      title: source.title,
      citation: source.citation,
      additionalCitations: [],
      url: source.url,
      contexts: timeline.events
        .filter((event) => event.sourceIds.includes(source.id))
        .map((event) => `Timeline: ${event.date} — ${event.title}`),
    })),
  );
}
