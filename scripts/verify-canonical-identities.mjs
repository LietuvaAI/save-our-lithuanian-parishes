// Blocking guard for the 82 unique canonical U.S. parish identities.
//
// Current conditions and research can evolve without touching this register.
// Entity joins, routes, names, places, institutional class, denomination, and
// C83 lineage require an explicit identity revision and Vilija review.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const registerPath = "data/canonical-identity-locks.json";
const read = (name) =>
  JSON.parse(
    readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"),
  );
const register = JSON.parse(readFileSync(registerPath, "utf8"));
const core = read("parishes.json");
const registry = read("registry-unified.json").parishes;
const alerts = read("alerts.json");
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
const withoutHash = (value) => {
  const copy = structuredClone(value);
  if (copy.identityRevision) delete copy.identityRevision.contentHash;
  return copy;
};
const digest = (value) =>
  createHash("sha256")
    .update(JSON.stringify(sortValue(withoutHash(value))))
    .digest("hex");
const contentOnly = (value) => {
  const copy = structuredClone(value);
  delete copy.identityRevision;
  return JSON.stringify(sortValue(copy));
};
const gitFile = (ref) => {
  const result = spawnSync("git", ["show", `${ref}:${registerPath}`], {
    encoding: "utf8",
  });
  if (result.status !== 0) return null;
  return JSON.parse(result.stdout);
};

const revision = register.identityRevision;
if (!Number.isInteger(revision?.version) || revision.version < 1) {
  errors.push("identityRevision.version must be a positive integer");
}
const actualHash = digest(register);
if (revision?.contentHash !== actualHash) {
  errors.push(
    `identity register hash mismatch: embedded=${revision?.contentHash}, actual=${actualHash}`,
  );
}
const head = gitFile("HEAD");
const baseline =
  head && contentOnly(head) !== contentOnly(register) ? head : gitFile("HEAD^");
if (
  baseline &&
  contentOnly(baseline) !== contentOnly(register) &&
  Number.isInteger(baseline.identityRevision?.version) &&
  revision.version <= baseline.identityRevision.version
) {
  errors.push(
    `canonical identity content changed without an identity revision bump (${baseline.identityRevision.version} -> ${revision.version})`,
  );
}

const canonical = core.filter(
  (parish) => parish.country === "US" && !parish.mergedInto,
);
const coreBySlug = new Map(
  canonical.map((parish) => [parish.slug, parish]),
);
const registryBySlug = new Map(
  registry.map((record) => [record.slug, record]),
);
const lockBySlug = new Map(
  register.identities.map((identity) => [identity.profileSlug, identity]),
);
const sameArray = (left, right) =>
  JSON.stringify(left ?? []) === JSON.stringify(right ?? []);

if (canonical.length !== register.counts.canonicalIdentities) {
  errors.push(
    `canonical profile count changed: register=${register.counts.canonicalIdentities}, actual=${canonical.length}`,
  );
}
if (register.identities.length !== register.counts.canonicalIdentities) {
  errors.push(
    `identity register holds ${register.identities.length}, expected ${register.counts.canonicalIdentities}`,
  );
}

for (const parish of canonical) {
  if (!lockBySlug.has(parish.slug)) {
    errors.push(`${parish.slug}: canonical profile is absent from identity register`);
  }
}
for (const lock of register.identities) {
  const parish = coreBySlug.get(lock.profileSlug);
  if (!parish) {
    errors.push(`${lock.profileSlug}: protected canonical profile is missing`);
    continue;
  }
  const coreChecks = {
    registrySlug: parish.registrySlug,
    nameLt: parish.nameLt,
    city: parish.city,
    state: parish.state,
    country: parish.country,
    institutionType: parish.institutionType,
  };
  for (const [field, actual] of Object.entries(coreChecks)) {
    if (actual !== lock[field]) {
      errors.push(
        `${lock.profileSlug}: protected ${field} changed from ${JSON.stringify(lock[field])} to ${JSON.stringify(actual)}`,
      );
    }
  }
  if (!sameArray(parish.c83Rows, lock.c83Rows)) {
    errors.push(
      `${lock.profileSlug}: protected c83Rows changed from ${JSON.stringify(lock.c83Rows)} to ${JSON.stringify(parish.c83Rows)}`,
    );
  }

  const record = registryBySlug.get(lock.registrySlug);
  if (!record) {
    errors.push(`${lock.profileSlug}: registry row ${lock.registrySlug} is missing`);
    continue;
  }
  const registryChecks = {
    nameLt: record.names?.lt,
    city: record.city,
    state: record.state,
    country: record.country,
    recordType: record.record_type,
    congregationClass: record.congregation_class,
  };
  for (const [field, actual] of Object.entries(registryChecks)) {
    if (actual !== lock[field]) {
      errors.push(
        `${lock.profileSlug}: registry ${field} changed from ${JSON.stringify(lock[field])} to ${JSON.stringify(actual)}`,
      );
    }
  }
  if (!sameArray(record.c83_rows, lock.c83Rows)) {
    errors.push(
      `${lock.profileSlug}: registry c83_rows changed from ${JSON.stringify(lock.c83Rows)} to ${JSON.stringify(record.c83_rows)}`,
    );
  }
}

const sourceRows = register.identities
  .flatMap((identity) => identity.c83Rows)
  .sort((a, b) => a - b);
if (
  sourceRows.length !== register.counts.sourceRows ||
  sourceRows.some((row, index) => row !== index + 1)
) {
  errors.push(
    `identity register must account for C83 rows 1-${register.counts.sourceRows} exactly`,
  );
}

const campaignLocks = new Map(
  register.campaigns.map((campaign) => [campaign.campaignId, campaign]),
);
if ((alerts.campaigns ?? []).length !== register.counts.publicCampaigns) {
  errors.push(
    `public campaign count changed: register=${register.counts.publicCampaigns}, actual=${alerts.campaigns?.length ?? 0}`,
  );
}
for (const campaign of alerts.campaigns ?? []) {
  if ("identityLock" in campaign) {
    errors.push(
      `${campaign.id}: duplicate inline identityLock found; the canonical register is the sole authority`,
    );
  }
  const lock = campaignLocks.get(campaign.id);
  if (!lock) {
    errors.push(`${campaign.id}: campaign is absent from canonical register`);
    continue;
  }
  for (const field of ["entity", "place", "parishLink"]) {
    if (campaign[field] !== lock[field]) {
      errors.push(
        `${campaign.id}: protected ${field} changed from ${JSON.stringify(lock[field])} to ${JSON.stringify(campaign[field])}`,
      );
    }
  }
  const identity = lockBySlug.get(lock.profileSlug);
  if (!identity) {
    errors.push(`${campaign.id}: protected profile ${lock.profileSlug} is absent`);
    continue;
  }
  if (
    lock.parishLink !== `/parishes/${lock.profileSlug}` ||
    lock.registrySlug !== identity.registrySlug
  ) {
    errors.push(`${campaign.id}: campaign assignment disagrees with canonical identity`);
  }
}
for (const lock of register.campaigns) {
  if (!(alerts.campaigns ?? []).some((campaign) => campaign.id === lock.campaignId)) {
    errors.push(`${lock.campaignId}: protected campaign is missing`);
  }
}

if (errors.length) {
  console.error(`CANONICAL IDENTITY VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  `OK: ${register.identities.length} canonical identities cover ${sourceRows.length} C83 rows; ${register.campaigns.length} campaign assignments are protected; identity revision ${revision.version} hash ${actualHash.slice(0, 12)}…`,
);
