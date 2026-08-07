import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";

const DATA = new URL("../data/", import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, DATA), "utf8"));
const errors = [];

function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, sorted(child)]),
    );
  }
  return value;
}

function contentHash(value) {
  const copy = structuredClone(value);
  delete copy.content_hash;
  return `sha256:${createHash("sha256")
    .update(JSON.stringify(sorted(copy)))
    .digest("hex")}`;
}

function fileHash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

const publication = read("canonical-publication-projection.json");
const infographic = read("canonical-infographic-projection.json");
const current = read("canonical-current-events-projection.json");
const displayManifest = read("canonical-public-display-manifest.json");
const caseManifest = read("canonical-case-files-manifest.json");

if (current.schema !== "culturenet-parish-current-events-projection.v1") {
  errors.push(`unsupported current-events projection schema: ${current.schema}`);
}
if (current.content_hash !== contentHash(current)) {
  errors.push("canonical current-events projection content hash drifted");
}
if (
  current.authority.publication_projection_revision !== publication.revision_id ||
  current.authority.infographic_projection_revision !== infographic.revision_id
) {
  errors.push("canonical current-events projection was built from different Brain projections");
}
if (
  current.counts.alerts !== current.alerts.length ||
  current.counts.campaigns !== current.campaigns.length ||
  current.counts.sustainabilityWatch !== current.sustainabilityWatch.length
) {
  errors.push("canonical current-events projection counts drifted");
}

const publicByProfile = new Map(
  publication.public_institutions.map((item) => [item.public_profile, item]),
);
const institutionIds = new Set(
  publication.canonical_entities.map((item) => item.id),
);
const siteIds = new Set(
  infographic.building_site_history.map((item) => item.culturenet_entity_id),
);
for (const alert of current.alerts) {
  if (
    !institutionIds.has(alert.canonicalSubjectId) &&
    !siteIds.has(alert.canonicalSubjectId)
  ) {
    errors.push(`${alert.id}: current event names an unknown canonical subject`);
  }
  const profile = alert.parishLink ?? alert.relatedProfileLink;
  const linked = publicByProfile.get(profile);
  const expectedId = alert.relatedInstitutionId ?? alert.canonicalSubjectId;
  if (!linked || linked.culturenet_entity_id !== expectedId) {
    errors.push(`${alert.id}: current-event profile identity drifted`);
  }
}
for (const [label, records] of [
  ["campaign", current.campaigns],
  ["sustainability watch", current.sustainabilityWatch],
]) {
  for (const record of records) {
    const linked = publicByProfile.get(record.parishLink);
    if (!linked || linked.culturenet_entity_id !== record.canonicalEntityId) {
      errors.push(`${label} ${record.id ?? record.parishLink}: canonical identity drifted`);
    }
  }
}

if (
  displayManifest.publication_projection_revision !== publication.revision_id ||
  displayManifest.infographic_projection_revision !== infographic.revision_id ||
  displayManifest.current_events_revision !== current.revision_id
) {
  errors.push("Brain public-display manifest was built from different canonical releases");
}
for (const entry of displayManifest.files) {
  const path = new URL(`../${entry.site_path}`, import.meta.url);
  if (!existsSync(path)) {
    errors.push(`missing Brain-owned display artifact: ${entry.site_path}`);
  } else if (fileHash(path) !== entry.sha256) {
    errors.push(`Brain-owned display artifact drifted: ${entry.site_path}`);
  }
}

const expectedCases = new Map(
  caseManifest.entries.map((entry) => [basename(entry.case_file), entry]),
);
for (const filename of readdirSync(new URL("case-records/", DATA)).filter((name) =>
  name.endsWith(".json"),
)) {
  const expected = expectedCases.get(filename);
  if (!expected) {
    errors.push(`site-only case record is forbidden: data/case-records/${filename}`);
    continue;
  }
  const path = new URL(`case-records/${filename}`, DATA);
  if (fileHash(path) !== expected.content_sha256) {
    errors.push(`Brain-owned case record drifted: data/case-records/${filename}`);
  }
  expectedCases.delete(filename);
}
for (const filename of expectedCases.keys()) {
  errors.push(`missing Brain-owned case record: data/case-records/${filename}`);
}

if (existsSync(new URL("alerts.json", DATA))) {
  errors.push("legacy site-owned data/alerts.json must not exist");
}
if (existsSync(new URL("canonical-identity-locks.json", DATA))) {
  errors.push("legacy site-owned canonical identity lock must not exist");
}
if (existsSync(new URL("registry-revisions.json", DATA))) {
  errors.push("legacy site-owned registry revision snapshot must not exist");
}
const publicationJoinSource = readFileSync(
  new URL("verify-brain-display-join.mjs", import.meta.url),
  "utf8",
);
if (/writeFileSync|appendFileSync|renameSync/.test(publicationJoinSource)) {
  errors.push(
    "the normal publication join may validate Brain artifacts but must not rewrite them",
  );
}
for (const directory of ["app", "components", "lib"]) {
  const stack = [new URL(`../${directory}/`, import.meta.url).pathname];
  while (stack.length) {
    const currentPath = stack.pop();
    for (const entry of readdirSync(currentPath, { withFileTypes: true })) {
      const path = join(currentPath, entry.name);
      if (entry.isDirectory()) stack.push(path);
      else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) {
        const source = readFileSync(path, "utf8");
        if (/data\/alerts\.json/.test(source)) {
          errors.push(`${path}: runtime import of the retired alerts snapshot`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error(`BRAIN SINGLE-SOURCE VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}
console.log(
  `OK: Brain single-source release — ${publication.counts.public_us_institutions} institutions, ` +
    `${current.alerts.length} current alerts, ${caseManifest.counts.case_files} case evidence files.`,
);
