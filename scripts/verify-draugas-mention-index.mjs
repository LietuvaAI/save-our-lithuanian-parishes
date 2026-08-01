import { readFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const index = readJson("data/draugas-mention-index.json");
const links = readJson("data/draugas-links.json").results;
const registry = readJson("data/registry-unified.json").parishes;
const publication = readJson(
  "data/canonical-publication-projection.json",
).public_institutions;
const serializedIndex = JSON.stringify(index);

for (const forbidden of ["/Volumes/", "_mine-output", "file://"]) {
  if (serializedIndex.includes(forbidden)) {
    throw new Error(`public mention index exposes research-only path: ${forbidden}`);
  }
}

if (index.schema_version !== "draugas-parish-mention-index-v1") {
  throw new Error(`unsupported schema ${index.schema_version}`);
}

const byKey = new Map(index.parishes.map((row) => [row.parish_key, row]));
if (byKey.size !== index.parishes.length) throw new Error("duplicate parish key");

let totalHits = 0;
let totalIssues = 0;
let exactLinks = 0;
for (const row of index.parishes) {
  const issueKeys = new Set();
  let datedHits = 0;
  for (const issue of row.issues) {
    const key = `${issue.date}:${issue.file}`;
    if (issueKeys.has(key)) throw new Error(`${row.parish_key}: duplicate ${key}`);
    issueKeys.add(key);
    datedHits += issue.hit_occurrences;

    const link = links[issue.date];
    if (link?.url && ["verified", "gated"].includes(link.status)) {
      const parsedUrl = new URL(link.url);
      if (!/(^|\.)draugas\.org$/i.test(parsedUrl.hostname)) {
        throw new Error(`${row.parish_key}: non-Draugas public issue URL`);
      }
      const filename = decodeURIComponent(parsedUrl.pathname.split("/").at(-1));
      if (filename === issue.file) exactLinks++;
    }
  }
  if (issueKeys.size !== row.unique_dated_issues) {
    throw new Error(`${row.parish_key}: unique issue count drift`);
  }
  if (datedHits !== row.dated_hit_occurrences) {
    throw new Error(`${row.parish_key}: dated occurrence count drift`);
  }
  if (
    datedHits + row.undated_hit_occurrences !==
    row.registry_hit_occurrences
  ) {
    throw new Error(`${row.parish_key}: total occurrence count drift`);
  }
  if (JSON.stringify(row).includes('"context"')) {
    throw new Error(`${row.parish_key}: raw OCR context entered public data`);
  }
  totalHits += row.registry_hit_occurrences;
  totalIssues += row.unique_dated_issues;
}

const hasPage = (count) => count > 10;
if (hasPage(10) || !hasPage(11)) throw new Error("10/11 route threshold drift");

const registryBySlug = new Map(registry.map((row) => [row.slug, row]));
const publicRoutes = [];
let summaryDriftRows = 0;
for (const institution of publication) {
  const registryRow = registryBySlug.get(institution.registry_slug);
  if (!registryRow) continue;
  const source = registryRow.sources?.find(
    (candidate) => candidate.axis === "draugas-registry-1909-2007",
  );
  if (!source?.parish_key) continue;
  const mentionRow = byKey.get(source.parish_key);
  if (!mentionRow) {
    throw new Error(`${institution.registry_slug}: missing mention-index row`);
  }
  if (source.total_mentions !== mentionRow.registry_hit_occurrences) {
    summaryDriftRows++;
  }
  if (hasPage(mentionRow.registry_hit_occurrences)) {
    publicRoutes.push(`${institution.public_profile}/draugas`);
  }
}

const divineProvidence = byKey.get("providence-of-god-southfield-mi");
if (
  divineProvidence?.registry_hit_occurrences !== 211 ||
  divineProvidence?.unique_dated_issues !== 168 ||
  divineProvidence?.undated_hit_occurrences !== 0
) {
  throw new Error("Divine Providence mention semantics drift");
}

for (const boundary of [
  ["st-luke-bentleyville-pa", false],
  ["ss-peter-and-paul-hazleton-pa", true],
]) {
  const row = byKey.get(boundary[0]);
  if (!row || hasPage(row.registry_hit_occurrences) !== boundary[1]) {
    throw new Error(`${boundary[0]}: boundary fixture drift`);
  }
}

console.log(
  `OK: ${index.parishes.length} rows; ${totalHits} attributed hits; ` +
    `${totalIssues} dated issue files; ${exactLinks} exact verified links; ` +
    `${publicRoutes.length} public source pages; ${summaryDriftRows} legacy summary drifts acknowledged`,
);
