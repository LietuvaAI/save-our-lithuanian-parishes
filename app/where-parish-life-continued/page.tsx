import type { Metadata } from "next";
import Link from "next/link";
import {
  continuityEdges,
  getInfographicInstitutionByEntityId,
  infographicCounts,
  recordsCustodyEdges,
  type ContinuityEdge,
  type RecordsCustodyEdge,
} from "@/lib/infographic-projection";

export const metadata: Metadata = {
  title: "How Parish Histories Connect",
  description:
    "Documented institutional transitions, community destinations, records custody, identity history, and future plans in the Lithuanian parish record.",
};

function EntityName({
  entityId,
  fallback,
}: {
  entityId: string;
  fallback: string;
}) {
  const institution = getInfographicInstitutionByEntityId(entityId);
  return institution ? (
    <Link
      href={institution.public_profile}
      className="font-medium underline underline-offset-2 hover:text-accent"
    >
      {institution.name}
    </Link>
  ) : (
    <span className="font-medium">{fallback}</span>
  );
}

function dateText(edge: ContinuityEdge | RecordsCustodyEdge) {
  const date = edge.date as
    | { start?: string | null; end?: string | null; label?: string | null }
    | null
    | undefined;
  return date?.start ?? "Date not established";
}

function evidenceText(edge: ContinuityEdge | RecordsCustodyEdge) {
  const date = edge.date as { label?: string | null } | null | undefined;
  return date?.label ?? null;
}

function sortEdges<T extends ContinuityEdge | RecordsCustodyEdge>(rows: T[]) {
  return [...rows].sort(
    (a, b) =>
      dateText(a).localeCompare(dateText(b), undefined, { numeric: true }) ||
      a.source.display_name.localeCompare(b.source.display_name),
  );
}

function RelationshipRows({
  edges,
  relationshipLabel,
}: {
  edges: Array<ContinuityEdge | RecordsCustodyEdge>;
  relationshipLabel?: (edge: ContinuityEdge | RecordsCustodyEdge) => string;
}) {
  return (
    <div className="divide-y divide-rule border-y border-rule">
      {sortEdges(edges).map((edge) => {
        const detail = evidenceText(edge);
        const taxonomy = "taxonomy" in edge ? edge.taxonomy : null;
        return (
          <div
            key={edge.id}
            className="grid gap-2 py-3 text-body-copy sm:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-4"
          >
            <p className="font-mono text-small-copy text-muted">
              {dateText(edge)}
            </p>
            <p>
              <EntityName
                entityId={edge.source.entity_id}
                fallback={edge.source.display_name}
              />
            </p>
            <div>
              <p className="text-small-copy font-semibold text-foreground">
                {relationshipLabel?.(edge) ??
                  taxonomy?.public_label ??
                  "Records held at"}
              </p>
              <p className="mt-0.5">
                <EntityName
                  entityId={edge.target.entity_id}
                  fallback={edge.target.display_name}
                />
              </p>
              {detail && (
                <p className="mt-1 text-small-copy leading-relaxed text-muted">
                  {detail}
                </p>
              )}
              {taxonomy?.certainty === "canonical_form_unresolved" && (
                <p className="mt-1 text-ui-label font-medium uppercase tracking-[0.08em] text-muted">
                  Exact canonical form not established
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RelationshipSection({
  title,
  description,
  edges,
}: {
  title: string;
  description: string;
  edges: ContinuityEdge[];
}) {
  if (edges.length === 0) return null;
  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-serif text-section-title font-semibold">{title}</h2>
        <span className="font-mono text-small-copy text-muted">
          {edges.length}
        </span>
      </div>
      <p className="mb-3 max-w-[82ch] text-body-copy leading-relaxed text-muted">
        {description}
      </p>
      <RelationshipRows edges={edges} />
    </section>
  );
}

export default function ParishContinuityPage() {
  if (
    continuityEdges.length !== infographicCounts.institution_continuity_edges ||
    recordsCustodyEdges.length !== infographicCounts.records_custody_edges
  ) {
    throw new Error("Canonical relationship populations drifted.");
  }

  const institutional = continuityEdges.filter(
    (edge) => edge.taxonomy.dimension === "institutional_transition",
  );
  const community = continuityEdges.filter((edge) =>
    ["community_continuity", "worship_site_continuity"].includes(
      edge.taxonomy.dimension,
    ),
  );
  const identity = continuityEdges.filter(
    (edge) => edge.taxonomy.dimension === "identity_history",
  );
  const planned = continuityEdges.filter(
    (edge) => edge.taxonomy.dimension === "future_plan",
  );

  return (
    <article className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-ui-label font-semibold uppercase tracking-[0.14em] text-muted">
        Relationship ledger
      </p>
      <h1 className="mt-1 max-w-4xl font-serif text-page-title font-semibold leading-tight">
        How parish histories connect
      </h1>
      <p className="mt-2 max-w-[82ch] text-body-copy leading-relaxed text-muted">
        A parish ending, a community moving, a church receiving a new use, and
        sacramental records changing custody are different events. They are
        listed separately here so one fact is not used as a substitute for
        another.
      </p>

      <section className="mt-5 border-y border-rule py-4">
        <h2 className="font-serif text-subsection-title font-semibold">
          How to read this page
        </h2>
        <p className="mt-1 max-w-[82ch] text-body-copy leading-relaxed">
          Institutional changes describe relationships between parish
          institutions. Community continuity records where people, worship,
          or parish objects went. Records custody says only who holds the
          records. Identity history explains origins or renamings. Future
          plans remain plans until they take effect.
        </p>
        <p className="mt-2 max-w-[82ch] text-small-copy leading-relaxed text-muted">
          These relationships connect records; they do not change the 155 U.S.
          profile total or the 137 Roman Catholic institution population. The
          current status of each institution remains in the{" "}
          <Link
            href="/where-every-parish-ended-up"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Parish &amp; Mission Status view
          </Link>
          .
        </p>
      </section>

      <RelationshipSection
        title="Completed institutional changes"
        description="Documented mergers, consolidations, or successor relationships. Where the surviving evidence does not establish the exact canonical form, the row says so instead of treating every transition as the same kind of merger."
        edges={institutional}
      />
      <RelationshipSection
        title="Where communities or worship continued"
        description="Destinations documented for parishioners, worship, artifacts, a territorial successor, or a former church designated for continued Catholic use. These statements do not by themselves establish a legal successor."
        edges={community}
      />
      <RelationshipSection
        title="Institutional identity history"
        description="Origins, same-institution renamings, and historical lineage claims. These explain identity without counting two phases of one institution as two parishes."
        edges={identity}
      />
      <RelationshipSection
        title="Future plans"
        description="Announced or conditional changes that have not taken effect. They are never displayed as completed mergers."
        edges={planned}
      />

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-serif text-section-title font-semibold">
            Where records are held
          </h2>
          <span className="font-mono text-small-copy text-muted">
            {recordsCustodyEdges.length}
          </span>
        </div>
        <p className="mb-3 max-w-[82ch] text-body-copy leading-relaxed text-muted">
          Documented custody of sacramental registers or institutional records.
          The absence of a row means custody is not yet structured in the
          canonical graph—not that the records do not exist.
        </p>
        <RelationshipRows
          edges={recordsCustodyEdges}
          relationshipLabel={() => "Records held at"}
        />
      </section>
    </article>
  );
}
