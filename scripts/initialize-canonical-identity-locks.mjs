// One-time creation of the 82-entity canonical identity register.
//
// This is intentionally not part of `npm run data`. Later identity changes
// must edit the independent register, increase its revision, document why, and
// receive the explicit review required by data/PROVENANCE.md.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

if (!process.argv.includes("--approved-by=Vilija")) {
  throw new Error(
    "Initial canonical identity snapshot requires --approved-by=Vilija.",
  );
}

const target = new URL(
  "../data/canonical-identity-locks.json",
  import.meta.url,
);
if (existsSync(target)) {
  throw new Error(
    "Canonical identity register already exists; revise it explicitly instead of regenerating it.",
  );
}

const read = (name) =>
  JSON.parse(
    readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"),
  );
const core = read("parishes.json");
const registry = read("registry-unified.json").parishes;
const alerts = read("canonical-current-events-projection.json");
const registryBySlug = new Map(
  registry.map((record) => [record.slug, record]),
);

const canonical = core
  .filter((parish) => parish.country === "US" && !parish.mergedInto)
  .sort((a, b) => Math.min(...a.c83Rows) - Math.min(...b.c83Rows));
if (canonical.length !== 82) {
  throw new Error(`Expected 82 canonical U.S. identities, found ${canonical.length}.`);
}
const sourceRows = canonical.flatMap((parish) => parish.c83Rows).sort((a, b) => a - b);
if (
  sourceRows.length !== 83 ||
  sourceRows.some((row, index) => row !== index + 1)
) {
  throw new Error(
    `Canonical identities must account for C83 rows 1-83 exactly; found ${JSON.stringify(sourceRows)}.`,
  );
}

const identities = canonical.map((parish) => {
  const record = registryBySlug.get(parish.registrySlug);
  if (!record) {
    throw new Error(
      `${parish.slug} has no registry record ${parish.registrySlug}.`,
    );
  }
  return {
    profileSlug: parish.slug,
    registrySlug: parish.registrySlug,
    nameLt: parish.nameLt,
    city: parish.city,
    state: parish.state,
    country: parish.country,
    institutionType: parish.institutionType,
    recordType: record.record_type,
    congregationClass: record.congregation_class,
    c83Rows: parish.c83Rows,
  };
});
const identityByProfile = new Map(
  identities.map((identity) => [identity.profileSlug, identity]),
);

const campaigns = alerts.campaigns.map((campaign) => {
  const profileSlug = campaign.parishLink.replace(/^\/parishes\//, "");
  const identity = identityByProfile.get(profileSlug);
  if (!identity) {
    throw new Error(
      `Campaign ${campaign.id} does not point to a protected canonical identity.`,
    );
  }
  return {
    campaignId: campaign.id,
    entity: campaign.entity,
    place: campaign.place,
    parishLink: campaign.parishLink,
    profileSlug,
    registrySlug: identity.registrySlug,
  };
});

const output = {
  corpusScope: "canonical-c83-parish-identities",
  lockedAt: "2026-07-28",
  authority:
    "Vilija approval is required for any identity-revision change.",
  scope:
    "The 83 U.S. C83 source rows resolved into 82 unique canonical parish identities. The false Waterbury St. Casimir row remains lineage within St. Joseph rather than a separate entity.",
  lockedFields: [
    "profileSlug",
    "registrySlug",
    "nameLt",
    "city",
    "state",
    "country",
    "institutionType",
    "recordType",
    "congregationClass",
    "c83Rows",
  ],
  mutableOutsideIdentityRevision: [
    "current status",
    "building fate and use",
    "pastoral status",
    "ownership changes",
    "dates and selected lifecycle readings",
    "sources, citations, notes, and narrative",
    "campaign status, dispatches, and action links",
  ],
  counts: {
    sourceRows: 83,
    canonicalIdentities: 82,
    publicCampaigns: campaigns.length,
  },
  identityRevision: {
    version: 1,
    date: "2026-07-28",
    approvedBy: "Vilija",
    changelog: [
      "Established the independent canonical identity register for all 82 unique U.S. C83 entities and anchored every public campaign to that register.",
    ],
    contentHash: "",
  },
  campaigns,
  identities,
};

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
const hashInput = structuredClone(output);
delete hashInput.identityRevision.contentHash;
output.identityRevision.contentHash = createHash("sha256")
  .update(JSON.stringify(sortValue(hashInput)))
  .digest("hex");

writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`);
console.log(
  `Locked ${identities.length} canonical identities and ${campaigns.length} campaign assignments; hash ${output.identityRevision.contentHash.slice(0, 12)}...`,
);
