// Build the inspectable ledger behind the public U.S. institution count.
//
// This is a census of adjudicated registry identities, not a count of source
// mentions. Every included row carries an explicit scope decision and at
// least one source link with a locator.
import { readFileSync, writeFileSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));

const registry = read("registry-unified.json");
const draugasLinks = read("draugas-links.json").results;
const publicTypes = new Set(["parish", "misija", "congregation"]);
const bookSources = {
  wolkovich: {
    label: "Lithuanian Religious Life in America, Vol. 3",
    url: "https://archyvas.ziburioltmokykla.org/item/20260722_1784749031073",
  },
  "michelsonas-1961": {
    label: "Lietuvių Išeivija Amerikoje",
    url: "https://archyvas.ziburioltmokykla.org/item/20260225_lietuviu_iseivija_amerikoje",
  },
  "lukas-2009": {
    label: "Lietuvių kultūrinis paveldas Amerikoje",
    url: "https://archyvas.ziburioltmokykla.org/item/20260725_1785004329786",
  },
};

const expectedScope = (record) => {
  if (record.record_type === "phase") return "historical_phase";
  if (record.record_type === "lead") return "research_lead";
  if (record.record_type === "context") return "context_only";
  if (record.country === "CA" && publicTypes.has(record.record_type)) {
    return "canadian_comparator";
  }
  if (record.country !== "US" && publicTypes.has(record.record_type)) {
    return "international_institution";
  }
  if (record.country === "US" && publicTypes.has(record.record_type)) {
    return "public_us_institution";
  }
  throw new Error(
    `${record.slug}: cannot derive census scope for ${record.record_type}/${record.country}`,
  );
};

const dateFromSource = (source) => {
  const text = [source.cites, source.first_mention, source.last_mention]
    .filter(Boolean)
    .join(" ");
  return text.match(/\b(1[89]\d{2}|20[0-2]\d)-\d{2}-\d{2}\b/)?.[0] ?? null;
};
const draugasUrl = (date) => {
  if (!date) return "https://www.draugas.org/archyvas-pdf/";
  const verified = draugasLinks[date];
  return verified?.url ?? `https://www.draugas.org/archyvas-pdf-${date.slice(0, 4)}/`;
};
const sourceLabel = (source) =>
  source.work ??
  source.publisher ??
  bookSources[source.axis]?.label ??
  (source.axis?.startsWith("draugas") ? "Draugas archive" : source.axis);
const sourceLocator = (source) =>
  source.pages ??
  source.cites ??
  source.first_mention ??
  source.ref ??
  source.work ??
  source.sourceUrl ??
  null;
const sourceUrl = (source) => {
  if (/^https?:\/\//i.test(source.sourceUrl ?? "")) return source.sourceUrl;
  if (bookSources[source.axis]) return bookSources[source.axis].url;
  if (source.axis?.startsWith("draugas")) {
    return draugasUrl(dateFromSource(source));
  }
  return null;
};
const evidenceFor = (record) =>
  (record.sources ?? []).map((source) => ({
    sourceFamily: source.axis,
    label: sourceLabel(source),
    locator: sourceLocator(source),
    url: sourceUrl(source),
  }));
const qualifyingFamilies = (record) =>
  new Set(
    evidenceFor(record)
      .filter((source) => source.url && source.locator)
      .map((source) =>
        source.sourceFamily?.startsWith("draugas")
          ? "draugas"
          : source.sourceFamily,
      ),
  );
const expectedIdentitySupport = (record) => {
  if (record.in_locked_scope) return "canonical_case_file";
  const familyCount = qualifyingFamilies(record).size;
  if (familyCount >= 2) return "multi_source_corroborated";
  if (familyCount === 1) return "single_source_attested";
  return "unsupported";
};

const errors = [];
const identifierOwner = new Map();
for (const record of registry.parishes) {
  const scope = expectedScope(record);
  if (record.public_census?.scope !== scope) {
    errors.push(
      `${record.slug}: public_census.scope=${record.public_census?.scope}, expected ${scope}`,
    );
  }
  if (record.public_census?.included !== (scope === "public_us_institution")) {
    errors.push(`${record.slug}: public_census.included disagrees with scope`);
  }
  for (const identifier of [record.slug, ...(record.aliases ?? [])]) {
    const owner = identifierOwner.get(identifier);
    if (owner && owner !== record.slug) {
      errors.push(`${identifier}: identifier belongs to both ${owner} and ${record.slug}`);
    }
    identifierOwner.set(identifier, record.slug);
  }
}

const publicRecords = registry.parishes.filter(
  (record) => record.public_census?.included,
);
const canonicalCaseFiled = publicRecords.filter(
  (record) => record.public_census.identity_support === "canonical_case_file",
);
const multiSourceCorroborated = publicRecords.filter(
  (record) => record.public_census.identity_support === "multi_source_corroborated",
);
const singleSourceAttested = publicRecords.filter(
  (record) => record.public_census.identity_support === "single_source_attested",
);
const independentlySupported = [
  ...canonicalCaseFiled,
  ...multiSourceCorroborated,
];

for (const record of publicRecords) {
  const evidence = evidenceFor(record);
  if (!evidence.some((source) => source.url && source.locator)) {
    errors.push(`${record.slug}: no linked evidence with a source locator`);
  }
  if (/\battempt\b/i.test(`${record.names?.lt ?? ""} ${record.names?.en ?? ""}`)) {
    errors.push(`${record.slug}: an organizing attempt remains in the public census`);
  }
  const expectedSupport = expectedIdentitySupport(record);
  if (record.public_census.identity_support !== expectedSupport) {
    errors.push(
      `${record.slug}: identity_support=${record.public_census.identity_support}, expected ${expectedSupport}`,
    );
  }
}

const exclusions = Object.fromEntries(
  [...registry.parishes
    .filter((record) => !record.public_census.included)
    .reduce((counts, record) => {
      const scope = record.public_census.scope;
      counts.set(scope, (counts.get(scope) ?? 0) + 1);
      return counts;
    }, new Map())]
    .sort(([a], [b]) => a.localeCompare(b)),
);
const classPartition = Object.fromEntries(
  [...publicRecords.reduce((counts, record) => {
    const key = record.congregation_class;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  }, new Map())].sort(([a], [b]) => a.localeCompare(b)),
);
const typePartition = Object.fromEntries(
  [...publicRecords.reduce((counts, record) => {
    counts.set(record.record_type, (counts.get(record.record_type) ?? 0) + 1);
    return counts;
  }, new Map())].sort(([a], [b]) => a.localeCompare(b)),
);

if (publicRecords.length + Object.values(exclusions).reduce((a, b) => a + b, 0) !== registry.parishes.length) {
  errors.push("Public and excluded scope partitions do not reconcile to the registry");
}
if (errors.length) {
  console.error(`PUBLIC INSTITUTION LEDGER VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

const entries = publicRecords
  .map((record) => ({
    slug: record.slug,
    profile: `/parishes/${record.slug}`,
    name: record.names?.lt || record.names?.en || record.slug,
    englishName: record.names?.en || null,
    city: record.city,
    state: record.state,
    recordType: record.record_type,
    institutionClass: record.congregation_class,
    identitySupport: record.public_census.identity_support,
    recordDepth: record.record_depth,
    sourceFamilies: [
      ...new Set(
        (record.sources ?? []).map((source) =>
          source.axis?.startsWith("draugas") ? "draugas" : source.axis,
        ),
      ),
    ].sort(),
    evidence: evidenceFor(record),
  }))
  .sort((a, b) =>
    a.state.localeCompare(b.state) ||
    a.city.localeCompare(b.city) ||
    a.name.localeCompare(b.name),
  );

const ledger = {
  schemaVersion: 1,
  registryRevision: registry.registryRevision.version,
  registryDate: registry.registryRevision.date,
  claim:
    `The public record documents ${publicRecords.length} adjudicated U.S. Lithuanian religious institutions: ${canonicalCaseFiled.length} canonical case-filed identities, ${multiSourceCorroborated.length} additional multi-source corroborated identities, and ${singleSourceAttested.length} attested in one published source pending corroboration.`,
  inclusionRule:
    "Count one canonical entity when country is US, record type is parish, misija, or congregation, and identity adjudication places it in public_us_institution scope.",
  counts: {
    researchRecords: registry.parishes.length,
    publicUSInstitutions: publicRecords.length,
    independentlySupported: independentlySupported.length,
    canonicalCaseFiled: canonicalCaseFiled.length,
    multiSourceCorroborated: multiSourceCorroborated.length,
    singleSourceAttested: singleSourceAttested.length,
    excluded: exclusions,
    byRecordType: typePartition,
    byInstitutionClass: classPartition,
  },
  entries,
};

writeFileSync(
  new URL("../data/public-institution-ledger.json", import.meta.url),
  `${JSON.stringify(ledger, null, 2)}\n`,
);

const attestedRows = singleSourceAttested
  .sort((a, b) => a.state.localeCompare(b.state) || a.city.localeCompare(b.city))
  .map(
    (record) =>
      `| ${record.names?.lt || record.names?.en || record.slug} | ${record.city}, ${record.state} | ${record.record_type} | ${record.sources[0]?.axis ?? "unknown"} ${record.sources[0]?.pages ?? ""} |`,
  )
  .join("\n");
const audit = `# Public institution count audit

**Audit date:** 2026-07-31
**Registry revision:** ${registry.registryRevision.version}

## Press-safe claim

The public record documents **${publicRecords.length} adjudicated U.S. Lithuanian religious institutions**: **${canonicalCaseFiled.length} canonical case-filed identities**, **${multiSourceCorroborated.length} additional identities corroborated by at least two qualifying source families**, and **${singleSourceAttested.length} attested in one published, located source** and explicitly awaiting corroboration.

Do not state that exactly ${publicRecords.length} institutions are the permanently final historical universe. State that the current documented record contains ${publicRecords.length}, name the revision/date, and preserve the **${independentlySupported.length} independently supported + ${singleSourceAttested.length} single-source attested** evidence distinction.

## Reconciliation

- Research records: **${registry.parishes.length}**
- Public U.S. institutions: **${publicRecords.length}**
- Historical phases excluded: **${exclusions.historical_phase ?? 0}**
- Research leads excluded: **${exclusions.research_lead ?? 0}**
- Context-only records excluded: **${exclusions.context_only ?? 0}**
- Canadian comparator institutions excluded: **${exclusions.canadian_comparator ?? 0}**
- Other international institutions excluded: **${exclusions.international_institution ?? 0}**

The included and excluded partitions sum exactly to ${registry.parishes.length}.

## Corrections in this audit

- Baltimore's late-1880s independent-parish attempt is a historical phase, not an institution.
- Chicago's St. John Missionary Fathers (Jonistai) record is organization/seminary context, not a congregation.
- Chester's carried sources contain zero Draugas mentions and no linked web evidence, so it is a research lead rather than an institution.
- Brooklyn Holy Cross remains an attested institution but is independent Catholic, not Roman Catholic, on the sole source currently attached.
- Avellaneda and Rosario are explicitly coded as Argentine institutions rather than excluded through city-name pattern matching.

## Single-source attested institutions

These ${singleSourceAttested.length} rows remain visible and source-linked, but they do not enter the independently supported subtotal until a second qualifying source family or full case file confirms identity.

| Institution | Place | Type | Current source |
|---|---|---|---|
${attestedRows}

## Machine contract

\`data/public-institution-ledger.json\` lists all ${publicRecords.length} included identities, evidence families, locators, and links. The build fails if an inclusion lacks linked evidence, an organizing attempt enters the count, identifiers collide, support tiers drift, or the included/excluded arithmetic no longer reconciles.
`;
writeFileSync(
  new URL(
    "../data/candidates/public-institution-count-audit-2026-07-31.md",
    import.meta.url,
  ),
  audit,
);

console.log(
  `OK: public institution ledger — ${publicRecords.length} U.S. institutions (${canonicalCaseFiled.length} canonical case-filed + ${multiSourceCorroborated.length} multi-source corroborated + ${singleSourceAttested.length} single-source attested); ${registry.parishes.length} research records reconciled.`,
);
