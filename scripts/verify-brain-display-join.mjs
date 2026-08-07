// Read-only boundary check between Brain's canonical publication projection
// and the Brain-owned display registry imported into this repository.
//
// This deliberately writes nothing. Canonical identity, count, type, class,
// route, and display membership are authored in culturenet-brain and copied by
// scripts/import-culturenet-brain.mjs. The site may validate that join, but it
// must never "synchronize" those values by rewriting the imported artifact.
import { readFileSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));

const registry = read("registry-unified.json");
const projection = read("canonical-publication-projection.json");
const infographic = read("canonical-infographic-projection.json");
const adjudications = read("canonical-public-census-adjudications.json");

if (projection.schema !== "culturenet-parish-publication-projection.v1") {
  throw new Error(`Unsupported publication projection schema: ${projection.schema}`);
}
if (
  projection.counts.public_us_institutions !==
  adjudications.current_public_us_institutions
) {
  throw new Error("Canonical projection and census adjudications disagree on count.");
}
if (
  infographic.authority.publication_projection_hash !== projection.content_hash
) {
  throw new Error("Canonical infographic and publication projections disagree.");
}

const registryBySlug = new Map(
  registry.parishes.map((record) => [record.slug, record]),
);
const projectedSlugs = new Set();

for (const institution of projection.public_institutions) {
  projectedSlugs.add(institution.registry_slug);
  const record = registryBySlug.get(institution.registry_slug);
  if (!record) {
    throw new Error(
      `${institution.registry_slug}: canonical publication institution is missing from the display registry.`,
    );
  }
  const census = record.public_census;
  const mismatches = [
    ["included", census?.included, true],
    ["scope", census?.scope, "public_us_institution"],
    ["record type", record.record_type, institution.record_type],
    ["institution class", record.congregation_class, institution.institution_class],
    ["identity support", census?.identity_support, institution.identity_support],
    ["entity ID", census?.canonical_entity_id, institution.culturenet_entity_id],
    ["canonical slug", census?.canonical_slug, institution.canonical_slug],
    ["profile route", census?.canonical_profile, institution.public_profile],
    ["projection row", census?.projection_record_id, institution.projection_record_id],
  ].filter(([, actual, expected]) => actual !== expected);
  if (mismatches.length) {
    throw new Error(
      `${institution.registry_slug}: display registry differs from Brain: ${mismatches
        .map(([label, actual, expected]) => `${label}=${actual ?? "null"} (expected ${expected})`)
        .join(", ")}`,
    );
  }
}

const publicRecords = registry.parishes.filter(
  (record) => record.public_census?.included === true,
);
const extraPublic = publicRecords
  .filter((record) => !projectedSlugs.has(record.slug))
  .map((record) => record.slug);
if (extraPublic.length) {
  throw new Error(
    `Display registry publishes rows absent from Brain: ${extraPublic.join(", ")}`,
  );
}
if (publicRecords.length !== projection.counts.public_us_institutions) {
  throw new Error(
    `Display registry publishes ${publicRecords.length} rows; Brain publishes ${projection.counts.public_us_institutions}.`,
  );
}

const authority = registry.publicationAuthority;
if (
  authority?.revisionId !== projection.revision_id ||
  authority?.contentHash !== projection.content_hash ||
  authority?.publicUSInstitutions !== projection.counts.public_us_institutions
) {
  throw new Error("Display registry publication authority is not tied to Brain.");
}

console.log(
  `OK: read-only Brain display join — ${publicRecords.length} canonical public U.S. institutions.`,
);
