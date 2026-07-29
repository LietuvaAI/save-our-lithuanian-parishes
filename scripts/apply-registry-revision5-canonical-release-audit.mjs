// Apply Registry Revision 5 from the 82-identity release audit.
//
// The source C83 snapshot remains frozen. This revision repairs four
// presentation-layer identity joins, preserves every retired registry slug as
// an alias, and records the approved Identity Revision 2.
import { createHash } from "node:crypto";
import {
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";

const registryPath = new URL("../data/registry-unified.json", import.meta.url);
const situationPath = new URL("../data/parish-situation.json", import.meta.url);
const identitiesPath = new URL(
  "../data/canonical-identity-locks.json",
  import.meta.url,
);
const reportPath = new URL(
  "../data/candidates/canonical-identity-release-audit-2026-07-28.md",
  import.meta.url,
);
const caseRecordsPath = new URL("../data/case-records/", import.meta.url);

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const situations = JSON.parse(readFileSync(situationPath, "utf8"));
const identities = JSON.parse(readFileSync(identitiesPath, "utf8"));

if (registry.registryRevision?.version !== 4) {
  throw new Error(
    `Expected Registry Revision 4, found ${registry.registryRevision?.version ?? "none"}.`,
  );
}
if (registry.parishes?.length !== 210) {
  throw new Error(`Expected 210 records, found ${registry.parishes?.length}.`);
}
if (identities.identityRevision?.version !== 1) {
  throw new Error(
    `Expected Identity Revision 1, found ${identities.identityRevision?.version ?? "none"}.`,
  );
}

const bySlug = new Map(registry.parishes.map((record) => [record.slug, record]));
const requireRecord = (slug) => {
  const record = bySlug.get(slug);
  if (!record) throw new Error(`Missing registry record: ${slug}`);
  return record;
};
const uniqueByJson = (values) => {
  const seen = new Set();
  return values.filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
const uniqueStrings = (values) =>
  [...new Set(values.filter((value) => value != null && value !== ""))];
const mergeArrayField = (target, field, records) => {
  target[field] = uniqueByJson(
    records.flatMap((record) => record[field] ?? []),
  );
};
const mergeYears = (target, records) => {
  target.years = {
    founded: uniqueByJson(
      records.flatMap((record) => record.years?.founded ?? []),
    ),
    closed: uniqueByJson(
      records.flatMap((record) => record.years?.closed ?? []),
    ),
  };
};
const refreshDepth = (record) => {
  const axes = new Set(
    (record.sources ?? []).map((source) =>
      source.axis?.startsWith("draugas") ? "draugas" : source.axis,
    ),
  );
  record.axes_count = axes.size;
  record.record_depth = record.in_locked_scope
    ? "case-filed"
    : axes.size >= 2
      ? "multi-source"
      : "single-source";
};
const mergeCanonical = ({
  canonicalSlug,
  duplicateSlugs,
  names,
  place,
  lifecycle,
  conflicts = [],
  extraVariants = [],
}) => {
  const canonical = requireRecord(canonicalSlug);
  const duplicates = duplicateSlugs.map(requireRecord);
  const records = [canonical, ...duplicates];
  const lockedRecord = records.find(
    (record) => record.in_locked_scope && record.c83_row,
  );
  if (!lockedRecord) {
    throw new Error(`${canonicalSlug}: no locked C83 record to absorb.`);
  }

  canonical.names = {
    lt: names.lt,
    en: names.en,
    variants: uniqueStrings([
      ...records.flatMap((record) => record.names?.variants ?? []),
      ...records.flatMap((record) => [
        record.names?.lt,
        record.names?.en,
      ]),
      ...extraVariants,
      names.lt,
      names.en,
    ]),
  };
  canonical.city = place.city;
  canonical.state = place.state;
  canonical.country = place.country;
  canonical.diocese = place.diocese;
  canonical.in_locked_scope = true;
  canonical.comparator = false;
  canonical.c83_row = lockedRecord.c83_row;
  canonical.c83_rows = [...(lockedRecord.c83_rows ?? [lockedRecord.c83_row])];
  canonical.locked = structuredClone(lockedRecord.locked);
  canonical.aliases = uniqueStrings([
    ...(canonical.aliases ?? []),
    ...duplicates.flatMap((record) => [
      record.slug,
      ...(record.aliases ?? []),
    ]),
  ]);
  mergeArrayField(canonical, "sources", records);
  mergeArrayField(canonical, "conflicts", records);
  canonical.conflicts = uniqueByJson([
    ...(canonical.conflicts ?? []),
    ...conflicts,
  ]);
  mergeArrayField(canonical, "related_sites", records);
  mergeArrayField(canonical, "events_refs", records);
  mergeArrayField(canonical, "events", records);
  mergeArrayField(canonical, "city_history", records);
  mergeYears(canonical, records);
  canonical.lifecycle = lifecycle;
  canonical.adjudication = {
    date: "2026-07-28",
    cite:
      "data/candidates/canonical-identity-release-audit-2026-07-28.md",
    status: "identity-release-audited",
  };
  canonical.needs_human_source_review = true;
  refreshDepth(canonical);
  return canonical;
};

const ansonia = mergeCanonical({
  canonicalSlug: "st-anthony-ansonia-ct",
  duplicateSlugs: ["holyname-ansonia-ct"],
  names: { lt: "Šv. Antano", en: "St. Anthony" },
  place: {
    city: "Ansonia",
    state: "CT",
    country: "US",
    diocese: "Archdiocese of Hartford",
  },
  lifecycle: {
    canonical_status: "closed",
    selected_closed_year: 2015,
    identity: "lost",
    confidence: "identity-confirmed-current-use-probable",
  },
  extraVariants: [
    "St. Anthony's Lithuanian parish",
    "Šv. Antano lietuvių parapija",
  ],
});

const newark = mergeCanonical({
  canonicalSlug: "holy-trinity-newark-nj",
  duplicateSlugs: ["holyname-newark-nj"],
  names: { lt: "Švč. Trejybės", en: "Holy Trinity" },
  place: {
    city: "Newark",
    state: "NJ",
    country: "US",
    diocese: "Archdiocese of Newark",
  },
  lifecycle: {
    canonical_status: "merged",
    selected_closed_year: null,
    identity: "ethnically_transferred",
    confidence: "identity-confirmed-current-parish-continuity-probable",
  },
  conflicts: [
    {
      field: "founding year",
      variants: [
        {
          value: "1901",
          source: "draugas-registry-1909-2007",
          cite: "1971-12-13 p. 6 (70-year jubilee)",
        },
        {
          value: "1902",
          source: "current case record",
          cite: "case record researched 2026-07-16",
        },
      ],
      note: "The identity is settled; the one-year founding variance remains visible.",
    },
    {
      field: "institution and building outcome",
      variants: [
        {
          value: "original church demolished after the 1981 fire",
          source: "draugas-2008-2026",
        },
        {
          value:
            "parish continued in its hall, merged with Epiphany, and remains active as Holy Trinity-Epiphany",
          source: "current/official case record",
        },
      ],
      note:
        "Demolition describes the original church building, not suppression of the continuing parish.",
    },
  ],
  extraVariants: [
    "Holy Trinity Lithuanian parish",
    "Holy Trinity-Epiphany",
  ],
});

const kansasCity = mergeCanonical({
  canonicalSlug: "st-casimir-kansas-city-ks",
  duplicateSlugs: [
    "casimir-kansas-city-mo",
    "casimir-kansas-city-ka",
    "casimir-kansas-city-ks",
  ],
  names: { lt: "Šv. Kazimiero", en: "St. Casimir" },
  place: {
    city: "Kansas City",
    state: "KS",
    country: "US",
    diocese: "Archdiocese of Kansas City in Kansas",
  },
  lifecycle: {
    canonical_status: "closed",
    selected_closed_year: 1947,
    identity: "lost",
    confidence: "identity-and-location-confirmed-building-fate-probable",
  },
  conflicts: [
    {
      field: "founding and church-acquisition dates",
      variants: [
        {
          value: "1905 parish founding",
          source: "wolkovich",
          cite: "Vol. 3 pp. 160-162",
        },
        {
          value: "1912 church acquisition/opening",
          source: "draugas-registry-1909-2007; web-historical",
        },
      ],
      note:
        "1905 is the parish founding reading; 1912 describes acquisition/opening of the church building.",
    },
    {
      field: "state",
      variants: [
        {
          value: "MO",
          source: "frozen C83 source row 13",
        },
        {
          value: "KS",
          source: "Wolkovich; current case record; Kansas sources",
        },
      ],
      note:
        "The public canonical place is Kansas City, Kansas. The old -mo profile slug remains only as a stable legacy URL.",
    },
  ],
  extraVariants: [
    "St. Casimir Lithuanian parish",
    "Kansas City Lithuanian St. Casimir",
  ],
});
kansasCity.years.founded.sort((left, right) => {
  if (left.value === "1905") return -1;
  if (right.value === "1905") return 1;
  return 0;
});

const collinsville = requireRecord("parish-collinsville-il");
collinsville.names = {
  lt: "Jeruzalės liuteronų parapija",
  en: "Jerusalem Lutheran Church",
  variants: uniqueStrings([
    ...(collinsville.names?.variants ?? []),
    ...(collinsville.name_variants ?? []),
    "Lithuanian Lutheran Church",
    "Jeruzalės parapija",
    "Jerusalem Lutheran",
  ]),
};
collinsville.diocese = null;
collinsville.lifecycle = {
  canonical_status: "standing",
  selected_closed_year: null,
  identity: "ethnically_transferred",
  confidence: "identity-and-current-congregation-verified",
};
collinsville.adjudication = {
  date: "2026-07-28",
  cite: "data/candidates/canonical-identity-release-audit-2026-07-28.md",
  status: "identity-release-audited",
};
collinsville.needs_human_source_review = true;
collinsville.conflicts = uniqueByJson([
  ...(collinsville.conflicts ?? []),
  {
    field: "governance",
    variants: [
      {
        value: "independent/self-governing",
        source: "frozen C83 source row 83",
      },
      {
        value: "member congregation, Lutheran Church-Missouri Synod",
        source: "official LCMS locator; current case record",
      },
    ],
    note:
      "The congregation owns its property and LCMS polity is congregational, but it is not denominationally independent.",
  },
]);
refreshDepth(collinsville);

const westville = requireRecord("holy-cross-westville-il");
westville.diocese = null;
westville.adjudication = {
  ...(westville.adjudication ?? {}),
  date: "2026-07-28",
  cite: "data/candidates/canonical-identity-release-audit-2026-07-28.md",
  status: "identity-release-audited",
};

const removed = new Set([
  "holyname-ansonia-ct",
  "holyname-newark-nj",
  "casimir-kansas-city-mo",
  "casimir-kansas-city-ka",
  "casimir-kansas-city-ks",
]);
registry.parishes = registry.parishes.filter(
  (record) => !removed.has(record.slug),
);

const profileSituations = {
  "lietuviu-baznycia-unnamed-ansonia-ct": {
    registry_slug: ansonia.slug,
    canonical_status: "closed",
    building_fate: "repurposed_religious",
    current_use:
      "The former St. Anthony church at 195-199 North Main Street is now home to Abundant Life Fellowship Ministries; the Lithuanian monument remains in the churchyard",
    lithuanian_identity: "lost",
    pastoral_status: "not_applicable",
    situation:
      "St. Anthony Lithuanian parish closed after its centennial in November 2015. The church survives in non-Catholic Christian use, and the Gediminas-columns monument remains in the former churchyard.",
  },
  "lietuviu-baznycia-unnamed-newark-nj": {
    registry_slug: newark.slug,
    canonical_status: "merged",
    building_fate: "demolished",
    current_use:
      "The original Lithuanian church is gone; Holy Trinity-Epiphany Parish continues in the 1963 parish-hall building at 207 Adams Street and now serves a Portuguese-speaking congregation",
    lithuanian_identity: "ethnically_transferred",
    pastoral_status: "not_applicable",
    situation:
      "The original Holy Trinity church was demolished after the 1981 fire, but the parish continued in its hall, merged with Epiphany in 2002, and remains active as Holy Trinity-Epiphany. Lithuanian worship has ended.",
  },
  "sv-kazimiero-kansas-city-mo": {
    registry_slug: kansasCity.slug,
    canonical_status: "closed",
    building_fate: "demolished",
    current_use:
      "Vacant lot at Broadview and Ridge Avenue in Kansas City, Kansas; the parish bell is preserved at the Wyandotte County Museum",
    lithuanian_identity: "lost",
    pastoral_status: "not_applicable",
    situation:
      "St. Casimir was in Kansas City, Kansas, not Missouri. The parish closed in a 1947 forced merger, the church was demolished, and its bell is preserved at the Wyandotte County Museum.",
  },
  "lithuanian-lutheran-church-collinsville-il": {
    registry_slug: collinsville.slug,
    canonical_status: "standing",
    building_fate: "standing",
    current_use:
      "Active worship as Jerusalem Lutheran Church, an LCMS congregation at 305 Collinsville Avenue; weekly Sunday service in English",
    lithuanian_identity: "ethnically_transferred",
    pastoral_status: "not_applicable",
    situation:
      "Jerusalem Lutheran Church remains active in its 1903 building as a Lutheran Church-Missouri Synod congregation. Weekly worship continues in English; no current Lithuanian-language liturgy is documented.",
  },
  "lncc-congregation-westville-il": {
    registry_slug: westville.slug,
    canonical_status: "demolished",
    building_fate: "demolished",
    current_use:
      "The independent Holy Cross church was demolished; its bell and cornerstone became part of a 2004 memorial, and the cemetery remains",
    lithuanian_identity: "lost",
    pastoral_status: "not_applicable",
    situation:
      "Holy Cross was an independent Lithuanian Catholic congregation, not a Roman Catholic parish of the Diocese of Peoria. The church closed in the sourced 1956-1961 window and was demolished; the older circa-1969 reading remains only as an approximate archival calculation.",
  },
};
for (const [profileSlug, overlay] of Object.entries(profileSituations)) {
  situations.parishes[profileSlug] = overlay;
  situations.parishes[overlay.registry_slug] = structuredClone(overlay);
}
for (const slug of removed) delete situations.parishes[slug];

const identityChanges = new Map([
  [
    13,
    {
      registrySlug: kansasCity.slug,
      nameLt: kansasCity.names.lt,
      city: kansasCity.city,
      state: kansasCity.state,
      country: kansasCity.country,
    },
  ],
  [
    27,
    {
      registrySlug: newark.slug,
      nameLt: newark.names.lt,
      city: newark.city,
      state: newark.state,
      country: newark.country,
    },
  ],
  [
    31,
    {
      registrySlug: ansonia.slug,
      nameLt: ansonia.names.lt,
      city: ansonia.city,
      state: ansonia.state,
      country: ansonia.country,
    },
  ],
  [
    83,
    {
      registrySlug: collinsville.slug,
      nameLt: collinsville.names.lt,
      city: collinsville.city,
      state: collinsville.state,
      country: collinsville.country,
    },
  ],
]);
for (const identity of identities.identities) {
  const change = identityChanges.get(identity.c83Rows[0]);
  if (change) Object.assign(identity, change);
}
identities.identityRevision = {
  ...identities.identityRevision,
  version: 2,
  date: "2026-07-28",
  approvedBy: "Vilija",
  changelog: [
    ...(identities.identityRevision.changelog ?? []),
    "Release-audited all 82 identities and corrected four joins: Ansonia St. Anthony, Newark Holy Trinity, Jerusalem Lutheran in Collinsville, and Kansas City St. Casimir on the Kansas side. Retired registry slugs remain aliases; the frozen 83-row source snapshot is unchanged.",
  ],
  contentHash: "",
};

const recalculateCounts = () => {
  const records = registry.parishes;
  return {
    ...registry.counts,
    records: records.length,
    parishes: records.filter((record) => record.record_type === "parish")
      .length,
    phases: records.filter((record) => record.record_type === "phase").length,
    missions: records.filter((record) => record.record_type === "misija")
      .length,
    congregations: records.filter(
      (record) => record.record_type === "congregation",
    ).length,
    case_filed: records
      .filter((record) => record.country === "US")
      .flatMap((record) => record.c83_rows ?? [])
      .filter((row) => row >= 1 && row <= 83).length,
    case_filed_records: records.filter(
      (record) =>
        record.country === "US" &&
        (record.c83_rows ?? []).some((row) => row >= 1 && row <= 83),
    ).length,
    multi_source: records.filter(
      (record) => record.record_depth === "multi-source",
    ).length,
    single_source: records.filter(
      (record) => record.record_depth === "single-source",
    ).length,
    with_exact_geo: records.filter(
      (record) => record.geo?.precision === "exact",
    ).length,
    with_city_geo: records.filter(
      (record) => record.geo?.precision === "city-centroid",
    ).length,
    needs_geocode: records.filter((record) => record.geo?.needs_geocode)
      .length,
  };
};
registry.generated = "2026-07-28";
registry.counts = recalculateCounts();
registry.registryRevision = {
  ...registry.registryRevision,
  version: 5,
  date: "2026-07-28",
  changelog: [
    ...(registry.registryRevision.changelog ?? []),
    "Release-audited all 82 canonical U.S. C83 identities and repaired four source-to-registry joins: Ansonia St. Anthony, Newark Holy Trinity, Collinsville Jerusalem Lutheran, and Kansas City St. Casimir in Kansas.",
    "Collapsed five duplicate registry shells while preserving every source, conflict, locked source block, and retired slug as lineage or redirect aliases. The frozen C83 source rows and headline figures remain unchanged.",
  ],
  contentHash: "",
};
situations.generated = "2026-07-28";

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
const hashWithout = (value, path) => {
  const copy = structuredClone(value);
  const [group, field] = path;
  delete copy[group][field];
  return createHash("sha256")
    .update(JSON.stringify(sortValue(copy)))
    .digest("hex");
};
registry.registryRevision.contentHash = hashWithout(registry, [
  "registryRevision",
  "contentHash",
]);
identities.identityRevision.contentHash = hashWithout(identities, [
  "identityRevision",
  "contentHash",
]);

writeFileSync(registryPath, `${JSON.stringify(registry, null, 1)}\n`);
writeFileSync(situationPath, `${JSON.stringify(situations, null, 2)}\n`);
writeFileSync(identitiesPath, `${JSON.stringify(identities, null, 2)}\n`);

const caseRecords = new Map(
  readdirSync(caseRecordsPath)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const record = JSON.parse(
        readFileSync(new URL(name, caseRecordsPath), "utf8"),
      );
      return [record.slug, record];
    }),
);
const correctedRows = new Set([13, 27, 31, 83]);
const coreRows = JSON.parse(
  readFileSync(new URL("../data/parishes.json", import.meta.url), "utf8"),
);
const coreByRow = new Map();
for (const parish of coreRows) {
  for (const row of parish.c83Rows ?? []) coreByRow.set(row, parish);
}
const auditRows = identities.identities
  .map((identity) => {
    const cases = identity.c83Rows
      .map((row) => coreByRow.get(row)?.slug)
      .map((slug) => caseRecords.get(slug))
      .filter(Boolean);
    const confidence = uniqueStrings(cases.map((record) => record.confidence))
      .join(" / ");
    const outcome = correctedRows.has(identity.c83Rows[0])
      ? "Corrected in R5"
      : identity.c83Rows.length > 1
        ? "Confirmed; intentional merge"
        : "Confirmed";
    return `| ${identity.c83Rows.join(", ")} | ${identity.nameLt} | ${identity.city}, ${identity.state} | \`${identity.registrySlug}\` | ${confidence || "not labeled"} | ${outcome} |`;
  })
  .join("\n");

const report = `# Canonical identity release audit

**Audit date:** 2026-07-28

**Identity revision:** 2

**Registry revision:** 5
**Scope:** all 82 unique U.S. C83 identities, covering all 83 frozen source rows

## Release finding

The full source-row, case-file, registry, public-profile, and campaign cross-check found **four identity exceptions**. All four were adjudicated against the evidence already in the repository and corrected in Registry Revision 5:

1. **Ansonia:** the generic C83 row is St. Anthony / Šv. Antano. It is now joined to the 14-mention Draugas registry record and exact site record.
2. **Newark:** the generic C83 row is Holy Trinity / Švč. Trejybės. The original church was demolished, but the parish continued, merged with Epiphany, and remains in another ethnic community.
3. **Collinsville:** the generic Lutheran row is Jerusalem Lutheran Church / Jeruzalės liuteronų parapija, an active LCMS congregation rather than a denominationally independent church.
4. **Kansas City:** St. Casimir was in Kansas City, Kansas, not Missouri. Four shells were one entity; the public record now uses Kansas, the correct archdiocese, and the documented demolished-building outcome.

The other **78 identities matched their case-file and registry joins without an identity change**. Waterbury remains the sole intentional source-row collapse: rows 32 and 76 are one St. Joseph identity, while historical All Saints remains separate and the unresolved 1902 lead remains outside the public registry.

The audit also repaired one stale classifier pointer: Westville Holy Cross was already correctly identified, but its public overlay still pointed to a retired generic registry row and displayed a Roman Catholic diocese. The overlay now points to the independent Holy Cross record and carries no diocese.

## What this freezes

Identity Revision 2 locks the 82 entity joins, canonical names, public profile associations, places, institutional class, denomination, and C83 lineage. Current status, ownership, dates, building use, and narrative can still change when new evidence warrants it; those are evidence revisions, not identity revisions.

The legacy public URL \`/parishes/sv-kazimiero-kansas-city-mo\` remains stable so existing links do not break. The page, maps, state grouping, registry, and source ledger now identify the parish as Kansas City, Kansas.

## Count reconciliation

| Measure | Result |
|---|---:|
| Frozen U.S. source rows | 83 |
| Unique canonical U.S. identities | 82 |
| Public campaign assignments protected | ${identities.campaigns.length} |
| Registry records before R5 | 210 |
| Registry records after R5 | ${registry.counts.records} |
| Duplicate registry shells removed | 5 |
| Identity exceptions remaining | 0 |

## Complete 82-identity ledger

The confidence label is the existing current case-file confidence. It is not a downgrade of the identity join: a parish may have a settled identity while its present building use or exact dates remain only probable.

| C83 row(s) | Canonical identity | Place | Registry record | Case confidence | Audit outcome |
|---:|---|---|---|---|---|
${auditRows}

## Evidence used for the four corrections

- **Ansonia:** \`data/case-records/lietuviu-baznycia-unnamed-ansonia-ct.json\`; Draugas registry record \`st-anthony-ansonia-ct\`; Global True Lithuania; Historic Buildings of Connecticut; current Abundant Life institutional site.
- **Newark:** \`data/case-records/lietuviu-baznycia-unnamed-newark-nj.json\`; Draugas registry record \`holy-trinity-newark-nj\`; Archdiocese of Newark directory; Global True Lithuania; Newark church-history sources.
- **Collinsville:** \`data/case-records/lithuanian-lutheran-church-collinsville-il.json\`; official LCMS locator; Draugas/web historical record; current institutional evidence.
- **Kansas City:** \`data/case-records/sv-kazimiero-kansas-city-mo.json\`; Wolkovich, *Lithuanian Religious Life in America*, Vol. 3, pp. 160-162; Draugas registry record \`st-casimir-kansas-city-ks\`; Kansas City and Wyandotte County sources.

## Release boundary

This audit establishes that the public profiles represent the right 82 institutions. It does **not** claim that every lifecycle date or present-use detail is equally final. Those uncertainties remain visible in the case files and source ledgers and can be improved without silently changing parish identity.
`;
writeFileSync(reportPath, report);

console.log(
  `Registry Revision 5 applied: ${registry.counts.records} records; Identity Revision 2 locks ${identities.identities.length} entities.`,
);
