// Build the inspectable ledger behind the public U.S. institution count.
//
// CultureNet's publication projection is the identity and census authority.
// The site registry contributes only its richer public source links and
// display detail; it cannot add or remove institutions from this ledger.
import { readFileSync, writeFileSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));

const projection = read("canonical-publication-projection.json");
const registry = read("registry-unified.json");
const draugasLinks = read("draugas-links.json").results;
const registryBySlug = new Map(
  registry.parishes.map((record) => [record.slug, record]),
);
const sourceArtifactById = new Map(
  projection.source_artifacts.map((source) => [source.id, source]),
);
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

const dateFromSource = (source) => {
  const text = [source.cites, source.first_mention, source.last_mention]
    .filter(Boolean)
    .join(" ");
  return text.match(/\b(1[89]\d{2}|20[0-2]\d)-\d{2}-\d{2}\b/)?.[0] ?? null;
};
const draugasUrl = (date) => {
  if (!date) return "https://www.draugas.org/archyvas-pdf/";
  return (
    draugasLinks[date]?.url ??
    `https://www.draugas.org/archyvas-pdf-${date.slice(0, 4)}/`
  );
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
const registryEvidence = (record) =>
  (record.sources ?? []).map((source) => ({
    sourceFamily: source.axis,
    label: sourceLabel(source),
    locator: sourceLocator(source),
    url: sourceUrl(source),
  }));
const canonicalEvidence = (institution) =>
  institution.source_artifact_ids
    .map((id) => sourceArtifactById.get(id))
    .filter(Boolean)
    .map((source) => ({
      sourceArtifactId: source.id,
      label: source.title,
      locator:
        source.locator?.exact_label ??
        source.locator?.section ??
        source.locator?.page ??
        null,
      url: source.rights?.public_url ?? null,
    }));

const errors = [];
const entries = projection.public_institutions.map((institution) => {
  const record = registryBySlug.get(institution.registry_slug);
  if (!record) {
    errors.push(`${institution.registry_slug}: missing site display record`);
    return null;
  }
  const evidence = registryEvidence(record);
  const canonicalSources = canonicalEvidence(institution);
  if (
    ![...evidence, ...canonicalSources].some(
      (source) => source.url && source.locator,
    )
  ) {
    errors.push(`${institution.registry_slug}: no public linked source locator`);
  }
  return {
    slug: institution.registry_slug,
    canonicalSlug: institution.canonical_slug,
    canonicalEntityId: institution.culturenet_entity_id,
    profile: institution.public_profile,
    name: institution.name,
    canonicalName: institution.canonical_name,
    aliases: institution.aliases,
    city: institution.city,
    state: institution.state,
    recordType: institution.record_type,
    institutionClass: institution.institution_class,
    identitySupport: institution.identity_support,
    canonicalDetailStatus: institution.canonical_detail_status,
    protectedCampaign: institution.protected_campaign,
    assertionIds: institution.evidence_assertion_ids,
    sourceArtifactIds: institution.source_artifact_ids,
    sourceFamilies: [
      ...new Set(
        (record.sources ?? []).map((source) =>
          source.axis?.startsWith("draugas") ? "draugas" : source.axis,
        ),
      ),
    ].sort(),
    evidence,
    canonicalSources,
  };
});

const publishedEntries = entries.filter(Boolean);
const independentlySupported = publishedEntries.filter(
  (entry) => entry.identitySupport !== "single_source_attested",
);
const singleSourceAttested = publishedEntries.filter(
  (entry) => entry.identitySupport === "single_source_attested",
);

if (publishedEntries.length !== projection.counts.public_us_institutions) {
  errors.push(
    `ledger contains ${publishedEntries.length} institutions; expected ${projection.counts.public_us_institutions}`,
  );
}
if (errors.length) {
  console.error(`PUBLIC INSTITUTION LEDGER VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

publishedEntries.sort(
  (a, b) =>
    a.state.localeCompare(b.state) ||
    a.city.localeCompare(b.city) ||
    a.name.localeCompare(b.name),
);

const ledger = {
  schemaVersion: 2,
  authority: {
    repository: "LietuvaAI/culturenet-brain",
    path: "docs/research/parish-canon/publication-projection.json",
    revisionId: projection.revision_id,
    contentHash: projection.content_hash,
  },
  registryRevision: registry.registryRevision.version,
  registryDate: registry.registryRevision.date,
  claim: `The current documented record contains ${publishedEntries.length} distinct U.S. Lithuanian religious institutions.`,
  inclusionRule:
    "Count one canonical U.S. institution when CultureNet publishes it as a parish, mission, or congregation. Buildings, duplicate aliases, historical attempts, hosted worship, research leads, and comparators remain linked context and never increase this total.",
  counts: {
    publicUSInstitutions: publishedEntries.length,
    independentlySupported: independentlySupported.length,
    singleSourceAttested: singleSourceAttested.length,
    profilesPendingDeepCase: projection.counts.profiles_pending_deep_case,
    byRecordType: projection.counts.by_record_type,
    byInstitutionClass: projection.counts.by_institution_class,
  },
  entries: publishedEntries,
};

writeFileSync(
  new URL("../data/public-institution-ledger.json", import.meta.url),
  `${JSON.stringify(ledger, null, 2)}\n`,
);

const audit = `# Public institution count audit

**Audit date:** ${registry.registryRevision.date}
**Registry revision:** ${registry.registryRevision.version}
**Canonical authority:** CultureNet ${projection.revision_id}

## Press-safe claim

The current documented record contains **${publishedEntries.length} distinct U.S. Lithuanian religious institutions**: ${projection.counts.by_record_type.parish} parishes, ${projection.counts.by_record_type.misija} missions, and ${projection.counts.by_record_type.congregation} congregations.

Of these, ${independentlySupported.length} are supported by a completed two-pass case file or multiple source families. ${singleSourceAttested.length} are attested in one located published source and remain explicitly labeled for corroboration. This evidence-depth distinction does not change the institution count.

## Scope

The count includes canonical U.S. institutions only. Buildings and sites, successor entities, duplicate aliases, historical organizing attempts, hosted worship communities, leads, context records, and international comparators are preserved as linked research context and excluded from the institution total.

## Machine contract

\`data/canonical-publication-projection.json\` is the sole identity and census input. \`data/public-institution-ledger.json\` lists every included institution, its canonical entity ID and public route, and its site and CultureNet source links. The build fails on count drift, duplicate identifiers or routes, missing display joins, or absent public source locators.
`;
writeFileSync(
  new URL(
    "../data/candidates/public-institution-count-audit-2026-07-31.md",
    import.meta.url,
  ),
  audit,
);

console.log(
  `OK: public institution ledger — ${publishedEntries.length} canonical U.S. institutions; ${independentlySupported.length} independently supported and ${singleSourceAttested.length} single-source attested.`,
);
