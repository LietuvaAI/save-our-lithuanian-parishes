// Synchronize the site's rich display registry with the canonical CultureNet
// publication projection. CultureNet decides public identity, count, type,
// class, and route; the site retains narrative, lifecycle, media, and source
// detail for rendering.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));
const write = (path, value) =>
  writeFileSync(
    new URL(`../data/${path}`, import.meta.url),
    `${JSON.stringify(value, null, 2)}\n`,
  );

const registry = read("registry-unified.json");
const revisions = read("registry-revisions.json");
const projection = read("canonical-publication-projection.json");
const infographic = read("canonical-infographic-projection.json");
const adjudications = read("canonical-public-census-adjudications.json");

const TARGET_REVISION = 15;
const TARGET_DATE = "2026-08-02";
const CHANGELOG =
  "Registry Revision 15: reconciled the four protected campaign profiles to current official evidence, separated institution and building status, and corrected Hartford and Maspeth status groups; public institution, site, and continuity-edge counts are unchanged.";

if (projection.schema !== "culturenet-parish-publication-projection.v1") {
  throw new Error(`Unsupported publication projection schema: ${projection.schema}`);
}
if (
  projection.counts.public_us_institutions !==
  adjudications.current_public_us_institutions
) {
  throw new Error("Canonical projection and census adjudications disagree on count.");
}

const byRegistrySlug = new Map(
  projection.public_institutions.map((institution) => [
    institution.registry_slug,
    institution,
  ]),
);
const exclusionBySlug = new Map(
  adjudications.decisions.map((decision) => [decision.registry_slug, decision]),
);
const registryBySlug = new Map(
  registry.parishes.map((record) => [record.slug, record]),
);

for (const institution of projection.public_institutions) {
  if (!registryBySlug.has(institution.registry_slug)) {
    throw new Error(
      `${institution.registry_slug}: canonical publication institution is missing from the site registry.`,
    );
  }
  if (!institution.public_profile.startsWith("/parishes/")) {
    throw new Error(
      `${institution.registry_slug}: invalid public profile ${institution.public_profile}.`,
    );
  }
}

for (const record of registry.parishes) {
  const institution = byRegistrySlug.get(record.slug);
  if (institution) {
    record.record_type = institution.record_type;
    record.congregation_class = institution.institution_class;
    record.public_census = {
      included: true,
      scope: "public_us_institution",
      reason:
        "Included by the canonical CultureNet parish publication projection.",
      identity_support: institution.identity_support,
      canonical_entity_id: institution.culturenet_entity_id,
      canonical_slug: institution.canonical_slug,
      canonical_profile: institution.public_profile,
      canonical_detail_status: institution.canonical_detail_status,
      projection_record_id: institution.projection_record_id,
      protected_campaign: institution.protected_campaign,
    };
    continue;
  }

  const decision = exclusionBySlug.get(record.slug);
  if (decision) {
    record.public_census = {
      included: false,
      scope: decision.scope,
      reason: decision.reason,
      identity_support: null,
      canonical_entity_id: decision.canonical_entity_id,
      canonical_public_registry_slug:
        decision.canonical_public_registry_slug ?? null,
      adjudication: decision.adjudication,
      confidence: decision.confidence,
    };
    continue;
  }

  if (record.public_census?.included) {
    throw new Error(
      `${record.slug}: previously public row is absent from both the canonical projection and census adjudications.`,
    );
  }
}

const publicRecords = registry.parishes.filter(
  (record) => record.public_census?.included,
);
const publicSlugs = new Set(publicRecords.map((record) => record.slug));
if (
  publicRecords.length !== projection.counts.public_us_institutions ||
  publicSlugs.size !== projection.counts.public_us_institutions
) {
  throw new Error(
    `Site registry projects ${publicRecords.length} public rows and ${publicSlugs.size} unique slugs; expected ${projection.counts.public_us_institutions}.`,
  );
}

const typedCounts = {
  records: registry.parishes.length,
  parishes: registry.parishes.filter((record) => record.record_type === "parish")
    .length,
  phases: registry.parishes.filter((record) => record.record_type === "phase")
    .length,
  missions: registry.parishes.filter((record) => record.record_type === "misija")
    .length,
  congregations: registry.parishes.filter(
    (record) => record.record_type === "congregation",
  ).length,
  leads: registry.parishes.filter((record) => record.record_type === "lead")
    .length,
  context: registry.parishes.filter((record) => record.record_type === "context")
    .length,
};
registry.counts = { ...registry.counts, ...typedCounts };
registry.publicationAuthority = {
  repository: "LietuvaAI/culturenet-brain",
  path: "docs/research/parish-canon/publication-projection.json",
  revisionId: projection.revision_id,
  contentHash: projection.content_hash,
  publicUSInstitutions: projection.counts.public_us_institutions,
  synchronized: TARGET_DATE,
};
registry.registryRevision = {
  ...registry.registryRevision,
  version: TARGET_REVISION,
  date: TARGET_DATE,
  changelog: [
    ...(registry.registryRevision.changelog ?? []).filter(
      (entry) => entry !== CHANGELOG,
    ),
    CHANGELOG,
  ],
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

const romanCatholicParishes = publicRecords.filter(
  (record) =>
    record.record_type === "parish" &&
    record.congregation_class === "roman_catholic",
).length;
const revisionEntry = {
  version: TARGET_REVISION,
  date: TARGET_DATE,
  registryRecords: registry.parishes.length,
  publicUSRecords: publicRecords.length,
  usRomanCatholicParishes: romanCatholicParishes,
  summary:
    "Reconciled Divine Providence, Hartford Holy Trinity, Waterbury St. Joseph, and Maspeth Transfiguration to current official evidence; separated institution, building, and liturgy states; corrected the closed Roman Catholic count to 87 while keeping 154 public U.S. institutions unchanged.",
  evidence: [
    "data/canonical-publication-projection.json",
    "data/canonical-infographic-projection.json",
    "data/alerts.json",
    "data/parish-situation.json",
    "data/candidates/registry-revision-15-campaign-current-condition-2026-08-02.md",
  ],
};
const priorRevision = revisions.revisions.find(
  (entry) => entry.version === TARGET_REVISION,
);
if (priorRevision) {
  Object.assign(priorRevision, revisionEntry);
} else {
  revisions.revisions.push(revisionEntry);
}

const removed = adjudications.decisions
  .map(
    (decision) =>
      `| ${decision.registry_slug} | ${decision.scope} | ${decision.reason} |`,
  )
  .join("\n");
const infographicClosedCount =
  infographic.counts.closed_roman_catholic_parishes;
const report = `# Registry Revision 15: protected campaign current conditions

**Date:** ${TARGET_DATE}
**Authority:** CultureNet parish publication projection
**Public U.S. institutions:** ${publicRecords.length}
**Count-risk rows:** 0

This revision reconciles the four protected public campaign profiles to their current official records and keeps three different questions separate: what happened to the historical institution, what condition the church building is in, and whether Lithuanian worship continues on a regular or occasional basis.

- **Divine Providence, Southfield:** remains an active Lithuanian parish in Planning Area 8; no final restructuring decision has been made. Its current church now has an explicit standing-site assertion.
- **Holy Trinity, Hartford:** remains an archdiocesan mission after its regular Mass schedule ended; its partial closure is unresolved, not a completed closure.
- **Saint Joseph, Waterbury:** its separate parish merged into Our Lady of Mount Carmel effective May 1, 2024; the church remains a Catholic sacred edifice without a regular Mass schedule, with occasional special worship documented.
- **Transfiguration, Maspeth:** the Lithuanian parish merged in 2019; its church remains in Sunday use under the successor parish, while Lithuanian Mass moved to Annunciation in 2025.

These corrections change the Roman Catholic status distribution: the closed count is now ${infographicClosedCount} rather than 88. Public census membership remains ${publicRecords.length}; physical worship sites and continuity edges are unchanged.

## Census reconciliation

- Public types: ${projection.counts.by_record_type.parish} parishes, ${projection.counts.by_record_type.misija} missions, ${projection.counts.by_record_type.congregation} congregations.
- Institution classes: ${projection.counts.by_institution_class.roman_catholic} Roman Catholic, ${projection.counts.by_institution_class.national_catholic_pncc} PNCC, ${projection.counts.by_institution_class.independent_catholic} independent Catholic, ${projection.counts.by_institution_class.non_catholic_christian} non-Catholic Christian.
- Profiles pending richer deep-case work: ${projection.counts.profiles_pending_deep_case}. Their institution identity is settled; the label describes lifecycle-detail depth, not count uncertainty.

## Explicit exclusions from the prior public scope

| Registry row | Canonical scope | Reason |
|---|---|---|
${removed}

No research row was deleted. Excluded rows retain their evidence and canonical adjudication but cannot enter public institution totals, maps, profile routes, or figures.
`;

write("registry-unified.json", registry);
write("registry-revisions.json", revisions);
writeFileSync(
  new URL(
    "../data/candidates/registry-revision-15-campaign-current-condition-2026-08-02.md",
    import.meta.url,
  ),
  report,
);

console.log(
  `OK: Registry Revision ${TARGET_REVISION} synchronized to ${publicRecords.length} canonical public U.S. institutions.`,
);
