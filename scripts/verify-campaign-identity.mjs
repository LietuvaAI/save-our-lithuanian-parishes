// Public campaigns are protected identities. Research may update a campaign
// parish's documented current status, but it may not silently rename, merge,
// redirect, relocate, or reclassify the parish carrying the campaign.
import { readFileSync } from "node:fs";

const read = (name) =>
  JSON.parse(
    readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"),
  );

const alerts = read("alerts.json");
const core = read("parishes.json");
const registry = read("registry-unified.json").parishes;
const coreBySlug = new Map(core.map((parish) => [parish.slug, parish]));
const registryBySlug = new Map(registry.map((record) => [record.slug, record]));
const errors = [];

const sameArray = (left, right) =>
  JSON.stringify(left ?? []) === JSON.stringify(right ?? []);

for (const campaign of alerts.campaigns ?? []) {
  const lock = campaign.identityLock;
  if (!lock) {
    errors.push(`${campaign.id}: public campaign has no identityLock`);
    continue;
  }

  const expectedLink = `/parishes/${lock.profileSlug}`;
  if (campaign.parishLink !== expectedLink) {
    errors.push(
      `${campaign.id}: parishLink ${campaign.parishLink} must remain ${expectedLink}`,
    );
  }

  const parish = coreBySlug.get(lock.profileSlug);
  if (!parish) {
    errors.push(`${campaign.id}: protected profile ${lock.profileSlug} is missing`);
    continue;
  }
  if (parish.mergedInto) {
    errors.push(
      `${campaign.id}: protected profile ${lock.profileSlug} was merged into ${parish.mergedInto}`,
    );
  }

  for (const field of [
    "registrySlug",
    "nameLt",
    "city",
    "state",
    "country",
    "institutionType",
    "ownership",
    "yearFounded",
  ]) {
    if (parish[field] !== lock[field]) {
      errors.push(
        `${campaign.id}: protected ${field} changed from ${JSON.stringify(lock[field])} to ${JSON.stringify(parish[field])}`,
      );
    }
  }
  if (!sameArray(parish.c83Rows, lock.c83Rows)) {
    errors.push(
      `${campaign.id}: protected c83Rows changed from ${JSON.stringify(lock.c83Rows)} to ${JSON.stringify(parish.c83Rows)}`,
    );
  }

  const record = registryBySlug.get(lock.registrySlug);
  if (!record) {
    errors.push(
      `${campaign.id}: protected registry row ${lock.registrySlug} is missing`,
    );
    continue;
  }
  const registryChecks = {
    "registry Lithuanian name": [record.names?.lt, lock.nameLt],
    "registry city": [record.city, lock.city],
    "registry state": [record.state, lock.state],
    "registry country": [record.country, lock.country],
    "registry record type": [record.record_type, "parish"],
    "registry congregation class": [
      record.congregation_class,
      lock.congregationClass,
    ],
  };
  for (const [label, [actual, expected]] of Object.entries(registryChecks)) {
    if (actual !== expected) {
      errors.push(
        `${campaign.id}: protected ${label} changed from ${JSON.stringify(expected)} to ${JSON.stringify(actual)}`,
      );
    }
  }
  if (!sameArray(record.c83_rows, lock.c83Rows)) {
    errors.push(
      `${campaign.id}: registry c83_rows changed from ${JSON.stringify(lock.c83Rows)} to ${JSON.stringify(record.c83_rows)}`,
    );
  }
}

if (errors.length) {
  console.error(`CAMPAIGN IDENTITY VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  `OK: ${(alerts.campaigns ?? []).length} public campaign identities are locked to their canonical profiles.`,
);
