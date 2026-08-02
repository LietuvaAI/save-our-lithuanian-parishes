import {
  buildingSiteHistory,
  canadianComparators,
  continuityEdges,
  getInfographicInstitutionByEntityId,
  getInfographicInstitutionByProfile,
  type BuildingSiteHistoryRow,
  type ContinuityEdge,
  type ContinuityEndpoint,
} from "@/lib/infographic-projection";

/**
 * Per-parish selectors over the canonical infographic projection.
 *
 * Institutions, worship sites, and continuity relationships are three different
 * units. Nothing here merges them, derives a count, or substitutes a building
 * date for an institution date. See docs/design-system-profile.md §6b.
 */

export type WorshipSiteRow = {
  entityId: string;
  slug: string;
  name: string;
  /** Range this institution used the site, as text. Never a founding date. */
  range: string | null;
  /** True only when the canonical relationship identifies the current site. */
  isCurrent: boolean;
  outcome: string;
  demolishedYear: number | null;
  milestones: Array<{
    id: string;
    date: string;
    label: string;
  }>;
};

export type RelatedRecordRow = {
  id: string;
  /** Mono rail label: "Predecessor", "Merged in", … */
  kind: string;
  name: string;
  href: string | null;
  linkQualifier: string | null;
  meta: string | null;
  confidence: string;
};

export type IdentityNotice = {
  id: string;
  label: string;
  text: string;
};

export type InstitutionTransition =
  | "merged"
  | "succeeded"
  | "continued"
  | null;

function humanize(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function titleCase(value: string) {
  const text = humanize(value);
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function yearOf(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = /(\d{4})/.exec(value);
  return match ? Number.parseInt(match[1], 10) : null;
}

function usePeriodRange(
  site: BuildingSiteHistoryRow,
  entityId: string,
): string | null {
  const period = site.institution_use_periods.find(
    (entry) => entry.institution_entity_id === entityId,
  );
  if (!period) return null;
  if (period.date?.label) return period.date.label;
  const start = yearOf(period.date?.start);
  const end = yearOf(period.date?.end) ?? site.demolished_year;
  if (start && end) return `${start}\u2013${end}`;
  if (start) return `${start}\u2013present`;
  if (end) return `until ${end}`;
  return null;
}

/**
 * What became of the building. Irreversible and specific outcomes outrank a
 * generic standing condition; dates break ties within the same outcome class.
 */
const CONDITION_PRECEDENCE: Record<string, number> = {
  "building-demolished": 4,
  "building-repurposed": 3,
  "building-listed-for-sale": 2,
  "building-standing": 1,
};

const CONDITION_LABELS: Record<string, string> = {
  "building-demolished": "Demolished",
  "building-repurposed": "Repurposed",
  "building-listed-for-sale": "Listed for sale",
  "building-standing": "Standing",
};

function siteDemolishedYear(site: BuildingSiteHistoryRow): number | null {
  if (site.demolished_year) return site.demolished_year;
  return (
    site.milestones
      .filter((milestone) => /demolish|razed|torn_down/i.test(milestone.event))
      .map((milestone) => yearOf(milestone.date))
      .filter((year): year is number => year !== null)
      .sort((a, b) => b - a)[0] ?? null
  );
}

function siteOutcome(site: BuildingSiteHistoryRow): string {
  const demolishedYear = siteDemolishedYear(site);
  if (demolishedYear) return `Demolished ${demolishedYear}`;
  const conditionTypes = new Set(
    site.condition_relationships.map((entry) => entry.relationship_type),
  );
  if (
    conditionTypes.has("building-repurposed") &&
    conditionTypes.has("building-standing")
  ) {
    return "Repurposed, standing";
  }
  if (
    conditionTypes.has("building-listed-for-sale") &&
    conditionTypes.has("building-standing")
  ) {
    return "Listed for sale, standing";
  }
  const condition = [...site.condition_relationships].sort(
    (a, b) =>
      (CONDITION_PRECEDENCE[b.relationship_type] ?? 0) -
        (CONDITION_PRECEDENCE[a.relationship_type] ?? 0) ||
      (yearOf(b.date?.start) ?? yearOf(b.date?.end) ?? 0) -
        (yearOf(a.date?.start) ?? yearOf(a.date?.end) ?? 0),
  )[0];
  if (condition) {
    return (
      CONDITION_LABELS[condition.relationship_type] ??
      titleCase(condition.relationship_type)
    );
  }
  const lifecycleOutcome = site.lifecycle_text?.end;
  if (typeof lifecycleOutcome === "string" && lifecycleOutcome.trim()) {
    if (/active.*worship site|worship site.*active/i.test(lifecycleOutcome)) {
      return "Standing, active worship site";
    }
    return `${lifecycleOutcome.charAt(0).toUpperCase()}${lifecycleOutcome.slice(1)}`;
  }
  return "Not established";
}

export function getWorshipSitesForInstitution(
  entityId: string | null,
): WorshipSiteRow[] {
  if (!entityId) return [];
  return buildingSiteHistory
    .filter(
      (site) =>
        site.site_class === "worship_site" &&
        (site.related_public_institution_ids.includes(entityId) ||
          site.institution_use_periods.some(
            (period) => period.institution_entity_id === entityId,
          )),
    )
    .map((site) => {
      const usePeriod = site.institution_use_periods.find(
        (period) => period.institution_entity_id === entityId,
      );
      return {
        entityId: site.culturenet_entity_id,
        slug: site.slug,
        name: site.name,
        range: usePeriodRange(site, entityId),
        isCurrent:
          usePeriod?.relationship_type === "institution-relocated-to-site" ||
          Boolean(usePeriod?.date && !usePeriod.date.end && /present/i.test(usePeriod.date.label ?? "")),
        outcome: siteOutcome(site),
        demolishedYear: siteDemolishedYear(site),
        milestones: site.milestones.map((milestone) => ({
          id: `${milestone.assertion_id}:${milestone.event}`,
          date: milestone.date,
          label: milestone.label,
        })),
      };
    })
    .sort((a, b) => {
      const aYear = yearOf(a.range) ?? 0;
      const bYear = yearOf(b.range) ?? 0;
      return bYear - aYear;
    });
}

/**
 * Relationship labels read from the subject institution's point of view. An
 * unmapped type is humanized rather than guessed at.
 */
const RELATIONSHIP_LABELS: Record<
  string,
  { source: string; target: string }
> = {
  "congregation/canonical-life-continued-in": {
    source: "Continues in",
    target: "Continues here",
  },
  "institution-merged-into-institution": {
    source: "Merged into",
    target: "Merged in",
  },
  "institution-originated-from-institution": {
    source: "Originated from",
    target: "Origin of",
  },
  "institution-succeeded-by-institution": {
    source: "Succeeded by",
    target: "Successor to",
  },
  "institution-renamed-as-same-entity": {
    source: "Renamed as",
    target: "Formerly named",
  },
};

function relationshipKind(edge: ContinuityEdge, isSource: boolean): string {
  const labels = RELATIONSHIP_LABELS[edge.relationship_type];
  return labels
    ? labels[isSource ? "source" : "target"]
    : titleCase(edge.relationship_type);
}

function endpointMeta(endpoint: ContinuityEndpoint, edge: ContinuityEdge) {
  const lifecycle = endpoint.lifecycle ?? {};
  const founded = yearOf(
    (lifecycle as Record<string, unknown>).founded ??
      (lifecycle as Record<string, unknown>).start,
  );
  const closed = yearOf(
    (lifecycle as Record<string, unknown>).closed ??
      (lifecycle as Record<string, unknown>).end,
  );
  const span =
    founded && closed
      ? `${founded}\u2013${closed}`
      : founded
        ? `${founded}\u2013present`
        : closed
          ? `until ${closed}`
          : null;
  const dated = yearOf((edge.date as Record<string, unknown> | null)?.start);
  return [span, dated ? `relationship ${dated}` : null]
    .filter(Boolean)
    .join(" \u00b7 ") || null;
}

export function getRelatedRecordsForInstitution(
  entityId: string | null,
): RelatedRecordRow[] {
  if (!entityId) return [];
  return continuityEdges
    .filter(
      (edge) =>
        edge.publication_state === "publishable" &&
        edge.source.entity_id !== edge.target.entity_id &&
        (edge.source.entity_id === entityId || edge.target.entity_id === entityId),
    )
    .map((edge) => {
      const isSource = edge.source.entity_id === entityId;
      const other = isSource ? edge.target : edge.source;
      const publicProfile = getInfographicInstitutionByEntityId(
        other.entity_id,
      )?.public_profile;
      return {
        id: edge.id,
        kind: relationshipKind(edge, isSource),
        name: other.display_name,
        href: publicProfile ?? null,
        linkQualifier: publicProfile
          ? null
          : "No separate Lithuanian parish profile",
        meta: endpointMeta(other, edge),
        confidence: edge.confidence,
      };
    })
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
}

/** The reviewed outgoing institutional transition, never inferred from status. */
export function getInstitutionTransition(
  entityId: string | null,
): InstitutionTransition {
  if (!entityId) return null;
  const outgoingTypes = new Set(
    continuityEdges
      .filter(
        (edge) =>
          edge.publication_state === "publishable" &&
          edge.source.entity_id === entityId &&
          edge.source.entity_id !== edge.target.entity_id,
      )
      .map((edge) => edge.relationship_type),
  );
  if (outgoingTypes.has("institution-merged-into-institution")) {
    return "merged";
  }
  if (outgoingTypes.has("institution-succeeded-by-institution")) {
    return "succeeded";
  }
  if (outgoingTypes.has("congregation/canonical-life-continued-in")) {
    return "continued";
  }
  return null;
}

/**
 * A small, high identity note for an adjudicated overlap between distinct
 * institutions. It prevents a reader from mistaking an origin date for the
 * predecessor parish's closure date.
 */
export function getIdentityNoticesForInstitution(
  entityId: string | null,
): IdentityNotice[] {
  if (!entityId) return [];
  return continuityEdges
    .filter(
      (edge) =>
        edge.publication_state === "publishable" &&
        edge.adjudication_state === "accepted" &&
        edge.identity_effect === "distinct_institutions_lineage" &&
        String((edge.date as Record<string, unknown> | null)?.certainty ?? "")
          .toLowerCase()
          .includes("overlap") &&
        (edge.source.entity_id === entityId || edge.target.entity_id === entityId),
    )
    .map((edge) => ({
      id: edge.id,
      label: "Distinct institutions",
      text: terminalSentence(
        String((edge.date as Record<string, unknown> | null)?.label ?? ""),
      ),
    }))
    .filter((notice) => notice.text.length > 1);
}

function terminalSentence(value: string): string {
  const text = value.trim();
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

/** The institution's own founding/ending, with unresolved dates left unresolved. */
export function getInstitutionDates(profileHref: string) {
  const row = getInfographicInstitutionByProfile(profileHref);
  if (!row) {
    const comparator = canadianComparators.parishes.find(
      (candidate) => candidate.profile === profileHref,
    );
    if (!comparator) return null;
    const unresolved = comparator.founded_year === null;
    return {
      entityId: null,
      statusGroup: comparator.status_group,
      foundedYear: comparator.founded_year,
      foundedDisplay: comparator.founded_year
        ? String(comparator.founded_year)
        : null,
      foundedUnresolved: unresolved,
      closedYear: comparator.closed_year,
      closedDisplay: comparator.closed_year
        ? String(comparator.closed_year)
        : null,
      existed: unresolved
        ? "Founding year unresolved"
        : comparator.closed_year
          ? `${comparator.founded_year}\u2013${comparator.closed_year}`
          : `${comparator.founded_year}\u2013present`,
    };
  }
  const foundedDisplay =
    row.founded.display?.trim() ||
    (row.founded.year === null ? null : String(row.founded.year));
  const closedDisplay =
    row.closed.display?.trim() ||
    (row.closed.year === null ? null : String(row.closed.year));
  const unresolved =
    row.founded.authority === "unresolved" ||
    row.founded.year === null ||
    /(?:founding|canonical start|year) unresolved|year not given/i.test(
      foundedDisplay ?? "",
    );
  const institutionEnded = ["closed", "transferred"].includes(
    row.status_group,
  );
  const existed = unresolved
    ? "Founding year unresolved"
    : closedDisplay
      ? `${foundedDisplay}\u2013${closedDisplay}`
      : row.status_group === "mass_continues"
        ? `${foundedDisplay}\u2013institutional transition unresolved`
      : institutionEnded
        ? `${foundedDisplay}\u2013end date unresolved`
        : row.status_group === "unresolved"
          ? `${foundedDisplay}\u2013outcome unresolved`
          : row.status_group === "unverified"
            ? `${foundedDisplay}\u2013present status unresolved`
            : `${foundedDisplay}\u2013present`;
  return {
    entityId: row.culturenet_entity_id,
    statusGroup: row.status_group,
    foundedYear: row.founded.year,
    foundedDisplay,
    foundedUnresolved: unresolved,
    closedYear: row.closed.year,
    closedDisplay,
    existed,
  };
}
