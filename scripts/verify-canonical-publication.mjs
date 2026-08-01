// Blocking contract between CultureNet's canonical parish authority and the
// public site. This is deliberately independent of display narratives so a
// profile edit cannot change the institution census.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));
const projection = read("canonical-publication-projection.json");
const adjudications = read("canonical-public-census-adjudications.json");
const registry = read("registry-unified.json");
const errors = [];

const sortValue = (value) => {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, child]) => [key, sortValue(child)]),
    );
  }
  return value;
};
const hashInput = structuredClone(projection);
delete hashInput.content_hash;
const actualHash = `sha256:${createHash("sha256")
  .update(JSON.stringify(sortValue(hashInput)))
  .digest("hex")}`;
if (projection.content_hash !== actualHash) {
  errors.push(
    `projection hash mismatch: embedded=${projection.content_hash}, actual=${actualHash}`,
  );
}

const institutions = projection.public_institutions;
const expected = projection.counts.public_us_institutions;
const unique = (values) => new Set(values).size;
if (institutions.length !== expected) {
  errors.push(`projection contains ${institutions.length} rows; expected ${expected}`);
}
for (const [label, values] of [
  ["registry slugs", institutions.map((row) => row.registry_slug)],
  ["public routes", institutions.map((row) => row.public_profile)],
  ["canonical entity IDs", institutions.map((row) => row.culturenet_entity_id)],
]) {
  if (unique(values) !== expected) {
    errors.push(`${label} are not unique (${unique(values)} of ${expected})`);
  }
}

const tally = (key) =>
  Object.fromEntries(
    [...institutions.reduce((counts, row) => {
      const value = row[key];
      counts.set(value, (counts.get(value) ?? 0) + 1);
      return counts;
    }, new Map())].sort(([a], [b]) => a.localeCompare(b)),
  );
if (
  JSON.stringify(tally("record_type")) !==
  JSON.stringify(projection.counts.by_record_type)
) {
  errors.push("record-type partition disagrees with projection counts");
}
if (
  JSON.stringify(tally("institution_class")) !==
  JSON.stringify(projection.counts.by_institution_class)
) {
  errors.push("institution-class partition disagrees with projection counts");
}
const campaignCount = institutions.filter((row) => row.protected_campaign).length;
if (campaignCount !== projection.counts.protected_campaign_assignments) {
  errors.push(
    `protected campaigns=${campaignCount}, expected ${projection.counts.protected_campaign_assignments}`,
  );
}

const forbiddenPublicationFields = new Set([
  "researchRecords",
  "research_records",
  "caseFiled",
  "case_filed",
  "caseFiledRecords",
  "case_filed_records",
  "sourceRows",
]);
const scanForbidden = (value, path = "projection") => {
  if (Array.isArray(value)) {
    value.forEach((child, index) => scanForbidden(child, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenPublicationFields.has(key)) {
      errors.push(`${path}.${key}: internal research count leaked into projection`);
    }
    scanForbidden(child, `${path}.${key}`);
  }
};
scanForbidden(projection);

const projectionBySlug = new Map(
  institutions.map((institution) => [institution.registry_slug, institution]),
);
const registryBySlug = new Map(
  registry.parishes.map((record) => [record.slug, record]),
);
const publicRegistry = registry.parishes.filter(
  (record) => record.public_census?.included,
);
if (publicRegistry.length !== expected) {
  errors.push(`site registry publishes ${publicRegistry.length} rows; expected ${expected}`);
}
for (const [slug, institution] of projectionBySlug) {
  const record = registryBySlug.get(slug);
  if (!record) {
    errors.push(`${slug}: missing site display record`);
    continue;
  }
  if (!record.public_census?.included) errors.push(`${slug}: not public in site registry`);
  if (record.record_type !== institution.record_type) {
    errors.push(
      `${slug}: site type ${record.record_type} != ${institution.record_type}`,
    );
  }
  if (record.congregation_class !== institution.institution_class) {
    errors.push(
      `${slug}: site class ${record.congregation_class} != ${institution.institution_class}`,
    );
  }
  if (record.public_census?.canonical_entity_id !== institution.culturenet_entity_id) {
    errors.push(`${slug}: canonical entity ID drift`);
  }
  if (record.public_census?.canonical_profile !== institution.public_profile) {
    errors.push(`${slug}: canonical public route drift`);
  }
}
for (const record of publicRegistry) {
  if (!projectionBySlug.has(record.slug)) {
    errors.push(`${record.slug}: public site row absent from canonical projection`);
  }
}

if (adjudications.current_public_us_institutions !== expected) {
  errors.push("census adjudications disagree with publication projection count");
}
for (const decision of adjudications.decisions) {
  const record = registryBySlug.get(decision.registry_slug);
  if (!record) {
    errors.push(`${decision.registry_slug}: adjudicated research row is missing`);
  } else if (record.public_census?.included) {
    errors.push(`${decision.registry_slug}: excluded adjudication is still public`);
  }
}

if (errors.length) {
  console.error(`CANONICAL PUBLICATION VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(
  `OK: canonical publication — ${expected} unique U.S. institutions, ` +
    `${campaignCount} protected campaigns, 0 public count-risk rows.`,
);
