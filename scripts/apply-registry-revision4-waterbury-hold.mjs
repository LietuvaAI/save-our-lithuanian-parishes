// Apply Registry Revision 4.
//
// The unnamed 1902 Waterbury row is an unresolved identity lead, not an
// adjudicated public entity. Preserve its complete lineage in a research hold,
// remove it from public counts and profiles, and leave the protected St. Joseph
// campaign plus the separately supported historical All Saints entity intact.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const registryPath = new URL("../data/registry-unified.json", import.meta.url);
const situationPath = new URL("../data/parish-situation.json", import.meta.url);
const holdPath = new URL(
  "../data/candidates/waterbury-1902-unresolved-lead.json",
  import.meta.url,
);
const reportPath = new URL(
  "../data/candidates/registry-revision-4-waterbury-report.md",
  import.meta.url,
);

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const situations = JSON.parse(readFileSync(situationPath, "utf8"));

if (registry.registryRevision?.version !== 3) {
  throw new Error(
    `Expected Registry Revision 3, found ${registry.registryRevision?.version ?? "none"}.`,
  );
}
if (registry.parishes?.length !== 211) {
  throw new Error(`Expected 211 records, found ${registry.parishes?.length}.`);
}

const leadSlug = "lithuanian-church-waterbury-ct";
const lead = registry.parishes.find((record) => record.slug === leadSlug);
if (!lead) throw new Error(`Missing unresolved lead ${leadSlug}.`);
const leadSituation = situations.parishes[leadSlug];
if (!leadSituation) throw new Error(`Missing situation overlay for ${leadSlug}.`);

const campaign = JSON.parse(
  readFileSync(new URL("../data/alerts.json", import.meta.url), "utf8"),
).campaigns.find((entry) => entry.id === "waterbury-campaign");
if (campaign?.parishLink !== "/parishes/sv-juozapo-waterbury-ct") {
  throw new Error("Waterbury campaign is not anchored to canonical St. Joseph.");
}

const allSaints = registry.parishes.find(
  (record) =>
    record.slug === "lithuanian-national-catholic-parish-waterbury-ct",
);
if (!allSaints) throw new Error("Missing historical Waterbury All Saints row.");
const stJoseph = registry.parishes.find(
  (record) => record.slug === "joseph-waterbury-ct",
);
if (!stJoseph) throw new Error("Missing protected Waterbury St. Joseph row.");

const hold = {
  corpusScope: "registry-research-hold",
  generated: "2026-07-28",
  status: "excluded-from-public-canonical-registry",
  slug: leadSlug,
  reason:
    "The row has a provisional 1902 founding reading but no indexed newspaper mentions, named institution, address, corroborating source, or evidence establishing that it is distinct from Waterbury St. Joseph or the historical All Saints independent/national entity.",
  publicEffect:
    "No public profile, map point, category count, or campaign association. The evidence remains available for later identity adjudication.",
  protectedIdentities: {
    campaign:
      "St. Joseph Lithuanian Catholic Church, /parishes/sv-juozapo-waterbury-ct",
    historical:
      "All Saints Lithuanian independent/national church, lithuanian-national-catholic-parish-waterbury-ct",
  },
  originalRegistryRecord: lead,
  originalSituationOverlay: leadSituation,
};

registry.parishes = registry.parishes.filter(
  (record) => record.slug !== leadSlug,
);
delete situations.parishes[leadSlug];

registry.generated = "2026-07-28";
registry.counts = {
  ...registry.counts,
  records: registry.parishes.length,
  parishes: registry.parishes.filter(
    (record) => record.record_type === "parish",
  ).length,
  phases: registry.parishes.filter((record) => record.record_type === "phase")
    .length,
  missions: registry.parishes.filter(
    (record) => record.record_type === "misija",
  ).length,
  congregations: registry.parishes.filter(
    (record) => record.record_type === "congregation",
  ).length,
  multi_source: registry.parishes.filter(
    (record) => record.record_depth === "multi-source",
  ).length,
  single_source: registry.parishes.filter(
    (record) => record.record_depth === "single-source",
  ).length,
  with_exact_geo: registry.parishes.filter(
    (record) => record.geo?.precision === "exact",
  ).length,
  with_city_geo: registry.parishes.filter(
    (record) => record.geo?.precision === "city-centroid",
  ).length,
  needs_geocode: registry.parishes.filter(
    (record) => record.geo?.needs_geocode,
  ).length,
};

registry.registryRevision = {
  ...registry.registryRevision,
  version: 4,
  date: "2026-07-28",
  changelog: [
    ...(registry.registryRevision.changelog ?? []),
    "Moved the unresolved unnamed 1902 Waterbury lead out of the public canonical registry and into a lossless research hold; public St. Joseph campaign identity and historical All Saints identity remain separate and unchanged.",
    "Added machine-enforced identity locks for every public campaign parish so research cannot silently rename, merge, redirect, relocate, or reclassify the institution carrying a campaign.",
  ],
  contentHash: "",
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
const hashInput = structuredClone(registry);
delete hashInput.registryRevision.contentHash;
registry.registryRevision.contentHash = createHash("sha256")
  .update(JSON.stringify(sortValue(hashInput)))
  .digest("hex");

writeFileSync(registryPath, `${JSON.stringify(registry, null, 1)}\n`);
writeFileSync(situationPath, `${JSON.stringify(situations, null, 2)}\n`);
writeFileSync(holdPath, `${JSON.stringify(hold, null, 2)}\n`);

const report = `# Registry Revision 4 - Waterbury identity hold

**Applied:** 2026-07-28
**Before:** Registry Revision 3, 211 records
**After:** Registry Revision 4, ${registry.parishes.length} records
**Locked C83 impact:** none

## Decision

The unnamed \`lithuanian-church-waterbury-ct\` row is a research lead, not an adjudicated public entity. It has a provisional 1902 founding reading but no indexed newspaper mentions, institutional name, address, corroborating source, or evidence proving that it is distinct from Waterbury St. Joseph or historical All Saints.

Its complete registry record and classifier overlay are preserved in \`data/candidates/waterbury-1902-unresolved-lead.json\`. It no longer creates a public profile, map point, category count, or campaign association.

## Protected Waterbury identities

- **Public campaign:** St. Joseph Lithuanian Catholic Church remains \`/parishes/sv-juozapo-waterbury-ct\`, backed by registry row \`joseph-waterbury-ct\`.
- **Historical entity:** All Saints remains a separately supported historical independent/national church under \`lithuanian-national-catholic-parish-waterbury-ct\`.
- **Retired duplicate:** the false St. Casimir C83 row remains merged into St. Joseph and does not create another entity.

## Count impact

| Measure | Before | After |
|---|---:|---:|
| Registry records | 211 | ${registry.counts.records} |
| Parish rows | 196 | ${registry.counts.parishes} |
| Historical phase rows | 1 | ${registry.counts.phases} |
| Mission rows | 4 | ${registry.counts.missions} |
| Congregation rows | 10 | ${registry.counts.congregations} |
| Locked C83 cases | 83 | ${registry.counts.case_filed} |

## Canonical identity protection

\`data/canonical-identity-locks.json\` independently protects all 82 unique U.S. C83 identities, covering all 83 source rows. The four public campaigns are anchored to entries in that register. The data build fails if a protected identity or campaign assignment is renamed, merged, redirected, relocated, moved to another registry row, assigned different C83 lineage, or reclassified as another institution or denomination. Current status and other evidence-driven facts remain updateable because the public record must reflect documented events.
`;
writeFileSync(reportPath, report);

console.log(
  `Waterbury research hold applied: ${registry.parishes.length} records; hash ${registry.registryRevision.contentHash.slice(0, 12)}...`,
);
