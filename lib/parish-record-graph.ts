import {
  buildingSiteHistory,
  continuityEdges,
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
  outcome: string;
  demolishedYear: number | null;
};

export type RelatedRecordRow = {
  id: string;
  /** Mono rail label: "Predecessor", "Merged in", … */
  kind: string;
  name: string;
  href: string | null;
  meta: string | null;
  confidence: string;
};

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
 * What became of the building. Demolition is authoritative; otherwise the most
 * recent condition relationship is reported as the record states it.
 */
function siteOutcome(site: BuildingSiteHistoryRow): string {
  if (site.demolished_year) return `Demolished ${site.demolished_year}`;
  const condition = site.condition_relationships.at(-1);
  if (condition) return titleCase(condition.relationship_type);
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
    .map((site) => ({
      entityId: site.culturenet_entity_id,
      slug: site.slug,
      name: site.name,
      range: usePeriodRange(site, entityId),
      outcome: siteOutcome(site),
      demolishedYear: site.demolished_year,
    }))
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
function relationshipKind(edge: ContinuityEdge, isSource: boolean): string {
  const type = edge.relationship_type;
  if (/merge/i.test(type)) return isSource ? "Merged into" : "Merged in";
  if (/succeed|successor/i.test(type)) return isSource ? "Succeeded by" : "Successor to";
  if (/reloc|moved/i.test(type)) return "Relocated";
  if (/preced|predecessor|root/i.test(type)) return isSource ? "Predecessor of" : "Predecessor";
  if (/continu/i.test(type)) return isSource ? "Continues in" : "Continues here";
  return titleCase(type);
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
        edge.publication_state === "published" &&
        (edge.source.entity_id === entityId || edge.target.entity_id === entityId),
    )
    .map((edge) => {
      const isSource = edge.source.entity_id === entityId;
      const other = isSource ? edge.target : edge.source;
      return {
        id: edge.id,
        kind: relationshipKind(edge, isSource),
        name: other.display_name,
        href: other.slug ? `/parishes/${other.slug}` : null,
        meta: endpointMeta(other, edge),
        confidence: edge.confidence,
      };
    })
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
}

/** The institution's own founding/ending, with unresolved dates left unresolved. */
export function getInstitutionDates(profileHref: string) {
  const row = getInfographicInstitutionByProfile(profileHref);
  if (!row) return null;
  const unresolved =
    row.founded.authority === "unresolved" || row.founded.year === null;
  return {
    entityId: row.culturenet_entity_id,
    foundedYear: row.founded.year,
    foundedDisplay: row.founded.display,
    foundedUnresolved: unresolved,
    closedYear: row.closed.year,
    closedDisplay: row.closed.display,
    existed: unresolved
      ? "Founding year unresolved"
      : row.closed.year
        ? `${row.founded.year}\u2013${row.closed.year}`
        : `${row.founded.year}\u2013present`,
  };
}
