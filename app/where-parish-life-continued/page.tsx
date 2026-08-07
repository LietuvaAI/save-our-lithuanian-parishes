import type { Metadata } from "next";
import Link from "next/link";
import {
  continuityEdges,
  getInfographicInstitutionByEntityId,
  infographicCounts,
} from "@/lib/infographic-projection";

export const metadata: Metadata = {
  title: "Where Parish Life Continued",
  description:
    "Canonical continuity relationships among distinct Lithuanian parish institutions, mergers, successors, and same-entity renamings.",
};

const RELATIONSHIP_LABEL: Record<string, string> = {
  "congregation/canonical-life-continued-in": "canonical life continued in",
  "institution-merged-into-institution": "merged into",
  "institution-originated-from-institution": "originated from",
  "institution-renamed-as-same-entity": "was renamed as the same institution",
  "institution-succeeded-by-institution": "was succeeded by",
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
      className="font-medium underline hover:text-accent"
    >
      {institution.name}
    </Link>
  ) : (
    <span className="font-medium">{fallback}</span>
  );
}

export default function ParishContinuityPage() {
  const edges = [...continuityEdges].sort(
    (a, b) =>
      a.source.display_name.localeCompare(b.source.display_name) ||
      a.target.display_name.localeCompare(b.target.display_name),
  );

  if (edges.length !== infographicCounts.institution_continuity_edges) {
    throw new Error("Institution continuity count drifted.");
  }

  return (
    <article className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-small-copy uppercase text-muted">Continuity view</p>
      <h1 className="mt-1 max-w-3xl font-serif text-page-title font-semibold leading-tight">
        Where parish life continued
      </h1>
      <p className="mt-2 max-w-3xl text-subsection-title leading-relaxed">
        When one Lithuanian parish ended, where did its canonical life,
        congregation, records, or institutional identity continue?
      </p>

      <section className="mt-5 border-y border-rule py-4">
        <p className="max-w-3xl leading-relaxed">
          The canonical graph currently publishes {edges.length} continuity
          relationships. Each link connects institutions without treating a
          predecessor and successor as the same parish.
        </p>
        <p className="mt-2 max-w-3xl text-small-copy leading-relaxed text-muted">
          These relationships do not add to or subtract from the{" "}
          <Link href="/parishes" className="underline hover:text-foreground">
            public institution count
          </Link>
          . They explain how distinct parish histories connect.
        </p>
      </section>

      <section className="mt-6">
        <div className="hidden grid-cols-[minmax(0,1fr)_11rem_minmax(0,1fr)] gap-4 border-y border-rule py-2 text-ui-label uppercase text-muted sm:grid">
          <span>Earlier institution</span>
          <span>Relationship</span>
          <span>Later institution</span>
        </div>
        <div className="divide-y divide-rule">
          {edges.map((edge) => (
            <div
              key={edge.id}
              className="grid gap-1 py-3 text-body-copy sm:grid-cols-[minmax(0,1fr)_11rem_minmax(0,1fr)] sm:items-center sm:gap-4"
            >
              <EntityName
                entityId={edge.source.entity_id}
                fallback={edge.source.display_name}
              />
              <span className="text-small-copy text-muted">
                {RELATIONSHIP_LABEL[edge.relationship_type] ??
                  edge.relationship_type}
              </span>
              <EntityName
                entityId={edge.target.entity_id}
                fallback={edge.target.display_name}
              />
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
