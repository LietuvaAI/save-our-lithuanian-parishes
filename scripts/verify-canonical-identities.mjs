// Identity verification without a site-owned identity snapshot.
// Brain's publication projection and case manifest are the authorities; this
// guard fails if the retired parallel lock file returns.
import { existsSync, readFileSync } from "node:fs";

const DATA = new URL("../data/", import.meta.url);
const read = (name) =>
  JSON.parse(readFileSync(new URL(name, DATA), "utf8"));
const errors = [];

if (existsSync(new URL("canonical-identity-locks.json", DATA))) {
  errors.push(
    "retired site-owned canonical-identity-locks.json must not exist; Brain projections own identity",
  );
}

const publication = read("canonical-publication-projection.json");
const current = read("canonical-current-events-projection.json");
const cases = read("canonical-case-files-manifest.json");
const institutions = publication.public_institutions ?? [];
const ids = institutions.map((item) => item.culturenet_entity_id);
const profiles = institutions.map((item) => item.public_profile);

if (new Set(ids).size !== ids.length) {
  errors.push("Brain publication projection has duplicate canonical entity IDs");
}
if (new Set(profiles).size !== profiles.length) {
  errors.push("Brain publication projection has duplicate public profiles");
}
if (institutions.length !== publication.counts.public_us_institutions) {
  errors.push("Brain publication identity count disagrees with its contract");
}

const idByProfile = new Map(
  institutions.map((item) => [item.public_profile, item.culturenet_entity_id]),
);
for (const campaign of current.campaigns ?? []) {
  if (idByProfile.get(campaign.parishLink) !== campaign.canonicalEntityId) {
    errors.push(`${campaign.id}: campaign identity disagrees with Brain publication canon`);
  }
}

if (cases.counts.case_files !== cases.entries.length) {
  errors.push("Brain case-file manifest count drifted");
}

if (errors.length) {
  console.error(`CANONICAL IDENTITY VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  `OK: ${institutions.length} Brain-canonical public identities; ` +
    `${current.campaigns.length} campaign assignments and ${cases.entries.length} case files joined without a site-owned lock.`,
);
