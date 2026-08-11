import "server-only";
import publicationData from "@/data/canonical-publication-projection.json";

type SourceArtifact = {
  id: string;
  artifact_type: string;
  title: string;
  rights?: { public_url?: string };
};

type CanonicalAssertion = {
  id: string;
  subject?: { canonical_entity_id?: string };
  object?: Record<string, unknown>;
  source_artifact_id?: string;
};

const publication = publicationData as {
  assertions: CanonicalAssertion[];
  source_artifacts: SourceArtifact[];
};
const sourceById = new Map(
  publication.source_artifacts.map((source) => [source.id, source]),
);

export function getWiderCatholicLifeEvidence(entityId: string) {
  const assertions = publication.assertions.filter(
    (assertion) => assertion.subject?.canonical_entity_id === entityId,
  );
  const sourceIds = new Set(
    assertions.flatMap((assertion) =>
      assertion.source_artifact_id ? [assertion.source_artifact_id] : [],
    ),
  );
  const sources = [...sourceIds].flatMap((id) => {
    const source = sourceById.get(id);
    const url = source?.rights?.public_url;
    return source && url && source.artifact_type !== "public_geocoder"
      ? [{ id: source.id, title: source.title, url }]
      : [];
  });
  const ministry = assertions.find(
    (assertion) =>
      assertion.id ===
      "assert:religious-houses-atlanta-23:putnam-current-ministry",
  )?.object?.ministry;

  return {
    sources,
    ministry: typeof ministry === "string" ? ministry : null,
  };
}
