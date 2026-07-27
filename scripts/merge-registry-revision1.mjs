// Merge a freshly rebuilt brain registry into the enriched site snapshot.
//
// Usage:
//   node scripts/merge-registry-revision1.mjs /path/to/registry-unified.json
//
// The brain build owns source identity, lifecycle adjudications, and locked-row
// provenance. The site snapshot owns later diocese, exact geo, congregation
// class, web-survey, and editorial enrichment. This script makes that boundary
// explicit and emits a machine-readable merge report before replacing the
// canonical site registry.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const upstreamPath = process.argv[2];
if (!upstreamPath) {
  throw new Error("Pass the rebuilt brain registry path.");
}

const sitePath = new URL("../data/registry-unified.json", import.meta.url);
const reportPath = new URL(
  "../data/candidates/registry-revision-1-merge-report.json",
  import.meta.url,
);
const upstream = JSON.parse(readFileSync(upstreamPath, "utf8"));
const current = JSON.parse(readFileSync(sitePath, "utf8"));
const headResult = spawnSync(
  "git",
  ["show", "HEAD:data/registry-unified.json"],
  { encoding: "utf8" },
);
const headRegistry =
  headResult.status === 0 ? JSON.parse(headResult.stdout) : { parishes: [] };
const priorReport = existsSync(reportPath)
  ? JSON.parse(readFileSync(reportPath, "utf8"))
  : null;

const stable = (value) => JSON.stringify(value);
const uniqueObjects = (values) => {
  const seen = new Set();
  return values.filter((value) => {
    const key = stable(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const uniqueStrings = (values) => [...new Set(values.filter(Boolean))];

const currentBySlug = new Map(current.parishes.map((record) => [record.slug, record]));
const headBySlug = new Map(headRegistry.parishes.map((record) => [record.slug, record]));
const claimedCurrent = new Set();
const decisions = [];
const US_POSTAL = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA",
  "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
  "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX",
  "UT", "VT", "VA", "WA", "WV", "WI", "WY",
]);

function candidatesFor(record) {
  const slugs = uniqueStrings([record.slug, ...(record.aliases ?? [])]);
  return [
    ...slugs.map((slug) => currentBySlug.get(slug)).filter(Boolean),
    ...slugs.map((slug) => headBySlug.get(slug)).filter(Boolean),
  ];
}

function preferredGeo(records, fallback) {
  return (
    records.find((record) => record.geo?.precision === "exact")?.geo ??
    records.find((record) => record.geo?.lat != null && record.geo?.lon != null)?.geo ??
    fallback
  );
}

function mergeRecord(record) {
  const candidates = candidatesFor(record);
  for (const candidate of candidates) claimedCurrent.add(candidate.slug);
  const primary =
    candidates.find((candidate) => candidate.slug === record.slug) ??
    candidates.find((candidate) => candidate.c83_row === record.c83_row) ??
    candidates[0] ??
    {};

  // Start from site enrichment, then replace build-owned fields.
  const merged = { ...primary, ...record };
  merged.record_type = primary.record_type ?? record.record_type;
  merged.congregation_class =
    primary.congregation_class ?? record.congregation_class;
  if (!US_POSTAL.has(record.state)) {
    const validSiteState = candidates.find((candidate) =>
      US_POSTAL.has(candidate.state),
    )?.state;
    if (validSiteState) merged.state = validSiteState;
  }
  merged.diocese = primary.diocese ?? record.diocese ?? null;
  merged.geo = preferredGeo(candidates, record.geo);
  merged.sources = uniqueObjects([
    ...(record.sources ?? []),
    ...candidates.flatMap((candidate) => candidate.sources ?? []),
  ]);
  merged.conflicts = uniqueObjects([
    ...(record.conflicts ?? []),
    ...candidates.flatMap((candidate) => candidate.conflicts ?? []),
  ]);
  merged.names = {
    ...record.names,
    variants: uniqueStrings([
      ...(record.names?.variants ?? []),
      ...candidates.flatMap((candidate) => candidate.names?.variants ?? []),
      ...candidates.flatMap((candidate) => [
        candidate.names?.lt,
        candidate.names?.en,
      ]),
    ]),
  };
  merged.city_history = uniqueStrings([
    ...(record.city_history ?? []),
    ...candidates.flatMap((candidate) => candidate.city_history ?? []),
    ...candidates.map((candidate) => candidate.city),
  ]).filter((city) => city !== record.city);

  decisions.push({
    slug: record.slug,
    matchedSiteSlugs: uniqueStrings(candidates.map((candidate) => candidate.slug)),
    preserved: uniqueStrings([
      ...candidates.flatMap((candidate) =>
        Object.keys(candidate).filter((key) => !(key in record)),
      ),
      primary.diocese ? "diocese" : null,
      merged.geo !== record.geo ? "geo" : null,
      primary.record_type !== record.record_type ? "record_type" : null,
      primary.congregation_class !== record.congregation_class
        ? "congregation_class"
        : null,
    ]),
  });
  return merged;
}

const mergedRecords = upstream.parishes.map(mergeRecord);

// The brain builder emits non-Catholic congregations in a separate research
// artifact. They already have adjudicated, display-ready records in the site
// registry, so retain only those site-owned congregation entities.
const siteOwned = current.parishes.filter(
  (record) =>
    !claimedCurrent.has(record.slug) && record.record_type === "congregation",
);
mergedRecords.push(...siteOwned);
mergedRecords.sort((a, b) => a.slug.localeCompare(b.slug));

const output = {
  ...upstream,
  counts: {
    ...upstream.counts,
    records: mergedRecords.length,
    parishes: mergedRecords.filter((record) => record.record_type === "parish").length,
    missions: mergedRecords.filter((record) => record.record_type === "misija").length,
    congregations: mergedRecords.filter(
      (record) => record.record_type === "congregation",
    ).length,
  },
  parishes: mergedRecords,
};

delete output.registryRevision.contentHash;
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
output.registryRevision.contentHash = createHash("sha256")
  .update(JSON.stringify(sortValue(output)))
  .digest("hex");

const report = {
  generated: "2026-07-27",
  before:
    priorReport?.before ??
    {
      records: current.parishes.length,
      parishes: current.parishes.filter(
        (record) => record.record_type === "parish",
      ).length,
    },
  upstream: {
    records: upstream.parishes.length,
    caseFiles: upstream.counts.case_filed,
    caseFiledEntities: upstream.counts.case_filed_records,
  },
  after: output.counts,
  siteOwnedRecordsPreserved:
    priorReport?.siteOwnedRecordsPreserved ??
    siteOwned.map((record) => record.slug),
  removedSiteRecords:
    priorReport?.removedSiteRecords ??
    current.parishes
      .filter(
        (record) =>
          !claimedCurrent.has(record.slug) &&
          record.record_type !== "congregation",
      )
      .map((record) => record.slug),
  decisions,
};

writeFileSync(sitePath, `${JSON.stringify(output, null, 1)}\n`);
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `Registry Revision 1: ${report.before.records} site records + ${report.upstream.records} rebuilt parish records -> ${report.after.records} canonical records.`,
);
console.log(
  `Preserved ${siteOwned.length} site-owned congregations; report: data/candidates/registry-revision-1-merge-report.json`,
);
