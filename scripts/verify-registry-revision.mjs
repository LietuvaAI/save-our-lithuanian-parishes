// Blocking guard for the site's living canonical registry.
//
// 1. The embedded SHA-256 must match the full registry content.
// 2. If registry content changed from HEAD (working tree) or HEAD^ (committed
//    change), the integer revision must increase. No silent mutation.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const path = "data/registry-unified.json";
const registry = JSON.parse(readFileSync(path, "utf8"));

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
