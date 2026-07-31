// Blocking guard for the site's living canonical registry.
//
// 1. The embedded SHA-256 must match the full registry content.
// 2. If registry content changed from HEAD (working tree) or HEAD^ (committed
//    change), the integer revision must increase. No silent mutation.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const path = "data/registry-unified.json";
const historyPath = "data/registry-revisions.json";
const registry = JSON.parse(readFileSync(path, "utf8"));
const history = JSON.parse(readFileSync(historyPath, "utf8"));

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
const withoutHash = (value) => {
  const copy = structuredClone(value);
  if (copy.registryRevision) delete copy.registryRevision.contentHash;
  return copy;
};
const digest = (value) =>
  createHash("sha256")
    .update(JSON.stringify(sortValue(withoutHash(value))))
    .digest("hex");
const contentOnly = (value) => {
  const copy = structuredClone(value);
  delete copy.registryRevision;
  return JSON.stringify(sortValue(copy));
};
const gitFile = (ref) => {
  const result = spawnSync("git", ["show", `${ref}:${path}`], {
    encoding: "utf8",
  });
  if (result.status !== 0) return null;
  return JSON.parse(result.stdout);
};

const revision = registry.registryRevision;
if (!Number.isInteger(revision?.version) || revision.version < 1) {
  throw new Error("registryRevision.version must be a positive integer.");
}
if (!Array.isArray(history.revisions) || history.revisions.length === 0) {
  throw new Error(
    "registry-revisions.json must contain a non-empty revisions array.",
  );
}
history.revisions.forEach((entry, index) => {
  const expectedVersion = index + 1;
  if (entry.version !== expectedVersion) {
    throw new Error(
      `Registry revision history must be contiguous: expected ${expectedVersion}, found ${entry.version}.`,
    );
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
    throw new Error(`Registry Revision ${entry.version} has an invalid date.`);
  }
  if (index > 0 && entry.date < history.revisions[index - 1].date) {
    throw new Error("Registry revision dates must be chronological.");
  }
  if (!entry.summary?.trim()) {
    throw new Error(`Registry Revision ${entry.version} needs a summary.`);
  }
});
const latestHistory = history.revisions.at(-1);
if (
  latestHistory.version !== revision.version ||
  latestHistory.date !== revision.date
) {
  throw new Error(
    `Registry revision history ends at Revision ${latestHistory.version} (${latestHistory.date}), but the live registry is Revision ${revision.version} (${revision.date}).`,
  );
}
const publicUSRecords = registry.parishes.filter(
  (record) => record.public_census?.included,
);
const usRomanCatholicParishes = publicUSRecords.filter(
  (record) =>
    record.record_type === "parish" &&
    record.congregation_class === "roman_catholic",
);
const releaseCounts = {
  registryRecords: registry.parishes.length,
  publicUSRecords: publicUSRecords.length,
  usRomanCatholicParishes: usRomanCatholicParishes.length,
};
for (const [field, expected] of Object.entries(releaseCounts)) {
  if (latestHistory[field] !== expected) {
    throw new Error(
      `Registry Revision ${revision.version} ledger ${field}=${latestHistory[field]}, expected ${expected}.`,
    );
  }
}
for (const evidencePath of latestHistory.evidence ?? []) {
  if (!existsSync(evidencePath)) {
    throw new Error(
      `Registry Revision ${revision.version} evidence file is missing: ${evidencePath}`,
    );
  }
}
const actualHash = digest(registry);
if (revision.contentHash !== actualHash) {
  throw new Error(
    `Registry Revision ${revision.version} hash mismatch: embedded=${revision.contentHash}, actual=${actualHash}. Bump the revision and regenerate its hash.`,
  );
}

const head = gitFile("HEAD");
const baseline =
  head && contentOnly(head) !== contentOnly(registry) ? head : gitFile("HEAD^");
if (
  baseline &&
  contentOnly(baseline) !== contentOnly(registry) &&
  Number.isInteger(baseline.registryRevision?.version) &&
  revision.version <= baseline.registryRevision.version
) {
  throw new Error(
    `Registry content changed without a revision bump (${baseline.registryRevision.version} -> ${revision.version}).`,
  );
}

console.log(
  `OK: Registry Revision ${revision.version} content hash ${actualHash.slice(0, 12)}…; no silent mutation.`,
);
