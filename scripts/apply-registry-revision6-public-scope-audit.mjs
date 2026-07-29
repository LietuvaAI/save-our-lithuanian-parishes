// Apply Registry Revision 6 from the full public-scope and source-join audit.
//
// Revision 5 locked the 82 canonical C83 identities. This revision leaves
// those locks untouched and repairs the surrounding research registry:
// confirmed duplicate shells are collapsed, false source joins are separated,
// and research leads/context/attempts are typed so they cannot inflate public
// parish counts.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const registryPath = new URL("../data/registry-unified.json", import.meta.url);
const situationPath = new URL("../data/parish-situation.json", import.meta.url);
const reportPath = new URL(
  "../data/candidates/registry-semantics-audit-2026-07-29.md",
  import.meta.url,
);

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const situations = JSON.parse(readFileSync(situationPath, "utf8"));

if (registry.registryRevision?.version !== 5) {
  throw new Error(
    `Expected Registry Revision 5, found ${registry.registryRevision?.version ?? "none"}.`,
  );
}
if (registry.parishes?.length !== 205) {
  throw new Error(`Expected 205 records, found ${registry.parishes?.length}.`);
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
  target[field] = uniqueByJson(records.flatMap((record) => record[field] ?? []));
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
const stamp = (record, status, caveat) => {
  record.adjudication = {
    date: "2026-07-29",
    cite: "data/candidates/registry-semantics-audit-2026-07-29.md",
    status,
  };
  if (caveat) record.caveat = caveat;
  refreshDepth(record);
};
const mergeInto = (canonicalSlug, duplicateSlugs, note) => {
  const canonical = requireRecord(canonicalSlug);
  const duplicates = duplicateSlugs.map(requireRecord);
  const records = [canonical, ...duplicates];

  canonical.names = {
    ...canonical.names,
    variants: uniqueStrings([
      ...(canonical.names?.variants ?? []),
      ...records.flatMap((record) => [
        record.names?.lt,
        record.names?.en,
        ...(record.names?.variants ?? []),
        ...(record.name_variants ?? []),
      ]),
    ]),
  };
  canonical.aliases = uniqueStrings([
    ...(canonical.aliases ?? []),
    ...duplicates.flatMap((record) => [
      record.slug,
      ...(record.aliases ?? []),
    ]),
  ]);
  mergeArrayField(canonical, "sources", records);
  mergeArrayField(canonical, "conflicts", records);
  mergeArrayField(canonical, "related_sites", records);
  mergeArrayField(canonical, "events_refs", records);
  mergeArrayField(canonical, "events", records);
  mergeArrayField(canonical, "city_history", records);
  mergeYears(canonical, records);

  const exactGeo = records.find(
    (record) => record.geo?.precision === "exact",
  )?.geo;
  if (exactGeo && canonical.geo?.precision !== "exact") {
    canonical.geo = structuredClone(exactGeo);
  }
  stamp(canonical, "same-entity-shells-collapsed", note);
  return canonical;
};

// Same-entity joins established by name, place, chronology, source narrative,
// and (where available) exact site evidence. Retired slugs remain aliases.
const lawrence = mergeInto(
  "jesus-lawrence-ma",
  ["lawrence-lawrence-ma", "parish-lawrence-ma"],
  "Three shells described the same Sacred Heart Lithuanian National Catholic parish at 150 Garden Street. The 2001 building sale and selected 2002 institutional-end reading remain distinct source readings.",
);
lawrence.diocese = null;

mergeInto(
  "joseph-scranton-pa",
  ["holyname-scranton-pa"],
  "The unnamed Theodore Street parish under Fr. Kuras is St. Joseph. The official diocesan closure date, 2011-06-05, remains the selected institutional end.",
);

const scrantonProvidence = mergeInto(
  "providence-scranton-pa",
  ["parish-scranton-pa"],
  "The generic Lithuanian National Catholic Church shell is Providence of God, the surviving Scranton LNCC/PNCC-line congregation.",
);
scrantonProvidence.diocese = null;

mergeInto(
  "ascension-pittsburgh-pa",
  ["ascension-pittsburgh-pa-2", "parish-pittsburgh-pa"],
  "All three shells describe the one Ascension parish in Pittsburgh, founded in 1906 and closed in 1962.",
);
mergeInto(
  "motherofgod-maizeville-pa",
  ["louis-maizeville-pa", "parish-maizeville-pa"],
  "St. Louis was the earlier church of the parish that became Our Lady of Siluva in Maizeville; the 1967 building is not a second parish.",
);
mergeInto(
  "casimir-worcester-ma",
  ["parish-worcester-ma-2"],
  "Michelsonas's Worcester parish under Fr. Bukaveckas is St. Casimir, not an additional Worcester parish.",
);

const removedSlugs = new Set([
  "lawrence-lawrence-ma",
  "parish-lawrence-ma",
  "holyname-scranton-pa",
  "parish-scranton-pa",
  "ascension-pittsburgh-pa-2",
  "parish-pittsburgh-pa",
  "louis-maizeville-pa",
  "parish-maizeville-pa",
  "parish-worcester-ma-2",
]);

// False join: independent St. Peter in Town of Lake was attached to the
// Roman Catholic Ss. Peter and Paul parish in West Pullman.
const westPullman = requireRecord("ss-peter-and-paul-chicago-il");
const townOfLake = requireRecord("parish-chicago-il-2");
const townOfLakeSource = westPullman.sources.find(
  (source) => source.axis === "wolkovich" && /p\.223/.test(source.pages ?? ""),
);
if (!townOfLakeSource) throw new Error("Missing Town of Lake Wolkovich source.");
westPullman.sources = westPullman.sources.filter(
  (source) => source !== townOfLakeSource,
);
westPullman.names.variants = (westPullman.names.variants ?? []).filter(
  (name) => name !== "St. Peter Parish, Town of Lake",
);
westPullman.years.closed = (westPullman.years.closed ?? []).filter(
  (reading) => !(reading.source === "wolkovich" && /p\.223/.test(reading.cite ?? "")),
);
westPullman.conflicts = (westPullman.conflicts ?? [])
  .map((conflict) => ({
    ...conflict,
    variants: (conflict.variants ?? []).filter(
      (variant) =>
        !(variant.source === "wolkovich" && /p\.223/.test(variant.cite ?? "")),
    ),
  }))
  .filter((conflict) => (conflict.variants?.length ?? 0) > 1 || conflict.note);
townOfLake.sources = uniqueByJson([
  ...(townOfLake.sources ?? []),
  structuredClone(townOfLakeSource),
]);
townOfLake.names.variants = uniqueStrings([
  ...(townOfLake.names.variants ?? []),
  "St. Peter Parish, Town of Lake",
]);
townOfLake.years.closed = uniqueByJson([
  ...(townOfLake.years.closed ?? []),
  {
    value: "1919",
    source: "wolkovich",
    cite: "Vol. 3 p.223",
  },
]);
townOfLake.diocese = null;
stamp(
  westPullman,
  "false-source-join-repaired",
  "The independent Town of Lake St. Peter evidence has been removed; this row is only the Roman Catholic Ss. Peter and Paul parish in West Pullman.",
);
stamp(
  townOfLake,
  "false-source-join-repaired",
  "Michelsonas and Wolkovich evidence now meet on this independent Town of Lake parish. No Roman Catholic diocesan affiliation is asserted.",
);

// False join: an attempted Athol National Catholic organization was attached
// to the established Roman Catholic St. Francis parish.
const atholRoman = requireRecord("st-francis-athol-ma");
const atholAttemptSource = atholRoman.sources.find(
  (source) =>
    source.axis === "michelsonas-1961" &&
    /attempted, failed/i.test(source.ethnic_status ?? ""),
);
if (!atholAttemptSource) throw new Error("Missing Athol attempted-parish source.");
atholRoman.sources = atholRoman.sources.filter(
  (source) => source !== atholAttemptSource,
);
atholRoman.names.variants = (atholRoman.names.variants ?? []).filter(
  (name) => !/nepriklausoma|tautinė/i.test(name),
);
stamp(
  atholRoman,
  "false-source-join-repaired",
  "The failed independent/National Catholic attempt is tracked separately from the Roman Catholic St. Francis parish.",
);
const atholAttempt = {
  slug: "national-catholic-attempt-athol-ma",
  names: {
    lt: "Bandymas steigti tautinę katalikų parapiją",
    en: "Attempted Lithuanian National Catholic parish",
    variants: ["nepriklausoma (tautinė) parapija, Athol, Mass."],
  },
  city: "Athol",
  state: "MA",
  country: "US",
  record_type: "phase",
  in_locked_scope: false,
  c83_row: null,
  c83_rows: [],
  sources: [structuredClone(atholAttemptSource)],
  years: { founded: [], closed: [] },
  conflicts: [],
  related_sites: [],
  events_refs: [],
  geo: structuredClone(atholRoman.geo),
  congregation_class: "independent_catholic",
  diocese: null,
  comparator: false,
  city_history: [],
  caveat:
    "Michelsonas records an attempted independent/National Catholic parish that failed. It is historical movement evidence, not an additional durable Athol parish.",
};
stamp(atholAttempt, "historical-attempt-separated");
registry.parishes.push(atholAttempt);
bySlug.set(atholAttempt.slug, atholAttempt);

// False joins: Toronto St. John and Resurrection sources had been attached to
// a Chicago Baptist context record and to an unidentified Toronto archive lead.
const raymond = requireRecord("raymond-baptist-chicago");
const torontoJohn = requireRecord("john-toronto-on");
const torontoLead = requireRecord("lithuanian-toronto-on");
const torontoResurrection = requireRecord("christ-toronto-on");
const stJohnSource = raymond.sources.find(
  (source) => source.axis === "michelsonas-1961",
);
const resurrectionSource = torontoLead.sources.find(
  (source) => source.axis === "michelsonas-1961",
);
if (!stJohnSource || !resurrectionSource) {
  throw new Error("Missing Toronto sources on their false-join records.");
}
raymond.sources = raymond.sources.filter((source) => source !== stJohnSource);
raymond.names.variants = [];
raymond.city_history = (raymond.city_history ?? []).filter(
  (city) => !/^Toronto$/i.test(city),
);
raymond.record_type = "context";
raymond.diocese = null;
stamp(
  raymond,
  "context-record-separated",
  "Wolkovich describes an American Baptist congregation joined by a Lithuanian minister, not a distinct Lithuanian ethnic congregation. It remains as context and is excluded from public parish counts.",
);
torontoJohn.sources = uniqueByJson([
  ...(torontoJohn.sources ?? []),
  { ...structuredClone(stJohnSource), pages: "p.425, p.427" },
]);
torontoJohn.names.variants = uniqueStrings([
  ...(torontoJohn.names.variants ?? []),
  "St. John's Parish",
  "Šv. Jono Krikštytojo parapija",
]);
torontoJohn.years.founded = uniqueByJson([
  ...(torontoJohn.years.founded ?? []),
  {
    value: "1902",
    source: "michelsonas-1961",
    cite: "p.425, p.427",
  },
]);
stamp(torontoJohn, "false-source-join-repaired");

torontoLead.sources = torontoLead.sources.filter(
  (source) => source !== resurrectionSource,
);
torontoLead.names = {
  lt: null,
  en: "Toronto Lithuanian parish (1929 archive lead)",
  variants: [],
};
torontoLead.record_type = "lead";
torontoLead.geo = null;
stamp(
  torontoLead,
  "unresolved-archive-lead",
  "The 1929 archive seed has no indexed mentions and cannot yet be joined to St. John the Baptist or Resurrection. It is withheld from public counts pending source adjudication.",
);
torontoResurrection.sources = uniqueByJson([
  ...(torontoResurrection.sources ?? []),
  structuredClone(resurrectionSource),
]);
torontoResurrection.names.variants = uniqueStrings([
  ...(torontoResurrection.names.variants ?? []),
  "Prisikėlimo parapija",
  "Resurrection Parish",
]);
stamp(torontoResurrection, "false-source-join-repaired");

// Source-defined classes and record roles.
const classify = (slug, recordType, congregationClass, caveat) => {
  const record = requireRecord(slug);
  record.record_type = recordType;
  record.congregation_class = congregationClass;
  if (congregationClass !== "roman_catholic") record.diocese = null;
  stamp(record, "source-classification-audited", caveat);
};
classify(
  "george-pittsburgh-pa",
  "parish",
  "national_catholic_pncc",
  "The source describes a Lithuanian separatist parish later taken under PNCC jurisdiction.",
);
classify(
  "holycross-cleveland-oh",
  "phase",
  "independent_catholic",
  "The proposed 1917 Old Catholic organization was abandoned and never became a durable parish.",
);
classify(
  "holyname-philadelphia-pa",
  "phase",
  "independent_catholic",
  "A single source attests an unnamed independent/schismatic phase; a durable standalone parish identity is not established.",
);
classify(
  "joseph-cambridge-ma",
  "parish",
  "independent_catholic",
  "The source describes a brief Lithuanian separatist Catholic congregation in 1917.",
);
classify(
  "mary-chicago-il",
  "parish",
  "independent_catholic",
  "The source describes an independent Lithuanian separatist Catholic congregation.",
);
classify(
  "parish-chicago-il",
  "phase",
  "non_catholic_christian",
  "Twelve Apostles was a proposed non-Catholic, non-denominational movement; no durable parish is established.",
);
classify(
  "bukauskas-independent-chicago",
  "phase",
  "independent_catholic",
  "A short-lived Lithuanian separatist Catholic attempt, not a Protestant congregation.",
);
classify(
  "jonistai-chicago",
  "congregation",
  "independent_catholic",
  "An independent quasi-Catholic movement, not a Protestant congregation.",
);
classify(
  "springfield-independent",
  "congregation",
  "independent_catholic",
  "A Lithuanian separatist Catholic congregation, not a Protestant congregation.",
);
classify(
  "parish-mt-pleasant-pa",
  "context",
  "roman_catholic",
  "The source describes a Polish parish served by a Lithuanian priest, not a Lithuanian parish.",
);
classify(
  "parish-scottville-mi",
  "lead",
  "roman_catholic",
  "The source offers only a Lithuanian-presence lead through a pastor and a separate Bass Lake mission; a Scottville Lithuanian parish is not established.",
);
classify(
  "parish-grand-prairie-ar",
  "misija",
  "roman_catholic",
  "The source describes a settler colony with a small chapel for a Lithuanian congregation, properly counted as a mission rather than a parish.",
);
classify(
  "cong-lithuanian-evangelical-luthera",
  "lead",
  "non_catholic_christian",
  "The generic Boston source may duplicate the known First Lutheran community; it remains a lead until the identity join is proved.",
);
classify(
  "parish-chicago-il-3",
  "lead",
  "roman_catholic",
  "The generic Fr. Steponavicius reference cannot yet be joined safely to a named Chicago parish.",
);

for (const slug of [
  "lithuanian-bronx-ny",
  "lithuanian-easton-pa",
  "lithuanian-union-pier-mi",
]) {
  const lead = requireRecord(slug);
  lead.record_type = "lead";
  stamp(
    lead,
    "unresolved-archive-lead",
    "The archive seed does not yet establish a named institutional identity. It is preserved for research and withheld from public counts.",
  );
}

// A Roman Catholic diocese is a governance field, not a geographic label.
// Clear it from every non-Roman record after the individual adjudications.
requireRecord("joseph-waterbury-ct").diocese = "Archdiocese of Hartford";
for (const record of registry.parishes) {
  if (record.congregation_class !== "roman_catholic") {
    record.diocese = null;
  }
}

registry.parishes = registry.parishes.filter(
  (record) => !removedSlugs.has(record.slug),
);

// Remove stale duplicate overlays; canonical overlays continue to carry the
// current-state finding, while retired registry slugs resolve through aliases.
for (const [profileSlug, overlay] of Object.entries(situations.parishes)) {
  if (removedSlugs.has(overlay.registry_slug)) {
    delete situations.parishes[profileSlug];
  }
}
if (situations.parishes["sv-juozapo-scranton-pa"]) {
  situations.parishes["sv-juozapo-scranton-pa"].situation =
    "St. Joseph, the Roman Catholic Theodore Street parish at the center of Scranton's early property conflict, was closed by the Diocese of Scranton on June 5, 2011. The later Lithuanian National Catholic congregation is Providence of God, a separate institution.";
}

const recalculateCounts = () => {
  const records = registry.parishes;
  return {
    ...registry.counts,
    records: records.length,
    parishes: records.filter((record) => record.record_type === "parish").length,
    phases: records.filter((record) => record.record_type === "phase").length,
    missions: records.filter((record) => record.record_type === "misija").length,
    congregations: records.filter(
      (record) => record.record_type === "congregation",
    ).length,
    leads: records.filter((record) => record.record_type === "lead").length,
    context: records.filter((record) => record.record_type === "context").length,
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
    needs_geocode: records.filter((record) => record.geo?.needs_geocode).length,
  };
};

registry.generated = "2026-07-29";
registry.counts = recalculateCounts();
registry.registryRevision = {
  ...registry.registryRevision,
  version: 6,
  date: "2026-07-29",
  changelog: [
    ...(registry.registryRevision.changelog ?? []),
    "Collapsed nine confirmed duplicate source shells into six named institutions, preserving every source and retired slug as lineage and redirect aliases.",
    "Repaired four cross-entity source joins: Town of Lake versus West Pullman, the Athol National Catholic attempt versus St. Francis, Toronto St. John versus Raymond Baptist, and Toronto Resurrection versus an unresolved archive lead.",
    "Separated public parishes, missions, and congregations from historical phases, unresolved leads, and contextual mentions so every site count and map uses the same institutional scope.",
    "Cleared Roman Catholic geographic dioceses from all non-Roman records and corrected source-defined independent, National Catholic, Protestant, mission, lead, and context classifications.",
    "Normalized Waterbury St. Joseph to the current Archdiocese of Hartford governance label so By Diocese cannot split one jurisdiction into two buckets.",
  ],
  contentHash: "",
};
situations.generated = "2026-07-29";

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
const registryForHash = structuredClone(registry);
delete registryForHash.registryRevision.contentHash;
registry.registryRevision.contentHash = createHash("sha256")
  .update(JSON.stringify(sortValue(registryForHash)))
  .digest("hex");

writeFileSync(registryPath, `${JSON.stringify(registry, null, 1)}\n`);
writeFileSync(situationPath, `${JSON.stringify(situations, null, 2)}\n`);

const publicRecords = registry.parishes.filter((record) =>
  ["parish", "misija", "congregation"].includes(record.record_type),
);
const usPublicRecords = publicRecords.filter(
  (record) =>
    record.country !== "CA" &&
    !/buenos aires|argentin|rosario/i.test(record.city ?? ""),
);
const usRomanParishes = usPublicRecords.filter(
  (record) =>
    record.record_type === "parish" &&
    record.congregation_class === "roman_catholic",
);
const report = `# Registry semantics and public-scope audit

**Audit date:** 2026-07-29

**Registry revision:** 6

## Result

This audit checked all Registry Revision 5 rows for institutional identity, source-to-entity lineage, record type, congregation class, diocesan governance, public count eligibility, and route preservation.

- Registry rows after lossless consolidation: **${registry.parishes.length}**
- Public U.S. records (parishes, missions, and congregations): **${usPublicRecords.length}**
- U.S. Roman Catholic parish records: **${usRomanParishes.length}**
- Historical phases withheld from public counts: **${registry.counts.phases}**
- Unresolved research leads withheld from public counts: **${registry.counts.leads}**
- Context-only records withheld from public counts: **${registry.counts.context}**
- Frozen C83 source rows: **${registry.counts.case_filed}**
- Locked canonical C83 identities: **${registry.counts.case_filed_records}**

## Confirmed same-entity consolidations

1. Lawrence Sacred Heart: \`jesus-lawrence-ma\` absorbs \`lawrence-lawrence-ma\` and \`parish-lawrence-ma\`.
2. Scranton St. Joseph: \`joseph-scranton-pa\` absorbs \`holyname-scranton-pa\`.
3. Scranton Providence of God: \`providence-scranton-pa\` absorbs \`parish-scranton-pa\`.
4. Pittsburgh Ascension: \`ascension-pittsburgh-pa\` absorbs \`ascension-pittsburgh-pa-2\` and \`parish-pittsburgh-pa\`.
5. Maizeville Our Lady of Siluva: \`motherofgod-maizeville-pa\` absorbs \`louis-maizeville-pa\` and \`parish-maizeville-pa\`.
6. Worcester St. Casimir: \`casimir-worcester-ma\` absorbs \`parish-worcester-ma-2\`.

All retired slugs remain aliases. No canonical C83 slug or campaign identity changed.

## Cross-entity source repairs

- Wolkovich p.223 now belongs to the independent Town of Lake St. Peter record, not Roman Catholic Ss. Peter and Paul in West Pullman.
- Michelsonas p.130's failed Athol National Catholic attempt is a separate historical phase, not part of Roman Catholic St. Francis.
- Michelsonas pp.425 and 427 now support Toronto St. John, not Chicago's Raymond Baptist context record.
- Michelsonas p.427's Resurrection reference now supports Toronto Resurrection; the unidentified 1929 Toronto archive seed remains a research lead.

## Scope rule

Only records typed \`parish\`, \`misija\`, or \`congregation\` may appear in the public Record and registry map. Homepage, History, and By Diocese Roman Catholic figures additionally require \`record_type: parish\` and \`congregation_class: roman_catholic\`.

\`phase\`, \`lead\`, and \`context\` records remain fully preserved, source-linked, and directly routable for research. They cannot inflate public institutional counts.

## Governance normalization

Waterbury St. Joseph now uses the current \`Archdiocese of Hartford\` governance label. Historical source transcriptions may still say \`Diocese of Hartford\`, but that older wording cannot create a second present-day jurisdiction bucket.

## Sources used for identity adjudication

- Global True Lithuania, Lawrence and Lowell: https://global.truelithuania.com/lawrence-and-lowell-massachusetts-1682/
- Global True Lithuania, Pittsburgh: https://global.truelithuania.com/pittsburgh-pennsylvania-1133/
- Global True Lithuania, Shenandoah and southern coal region: https://global.truelithuania.com/lt/shenandoah-and-southern-coal-region-pennsylvania-1111/
- Global True Lithuania, Scranton and northern coal region: https://global.truelithuania.com/northern-coal-region-scranton-1614/
- Diocese of Scranton consolidated-parishes table: https://www.dioceseofscranton.org/wp-content/uploads/2021/03/Consolidated-Parishes-3-24-21.pdf
- Lithuanian National Catholic Church history: https://www.lktb.org/home/about
- Worcester Lithuanian history: https://old.lituanus.org/1980_2/80_2_06.htm

The underlying Wolkovich and Michelsonas page citations remain attached directly to the affected registry rows.
`;
writeFileSync(reportPath, report);

console.log(
  `Applied Registry Revision 6: ${registry.parishes.length} rows; ${usPublicRecords.length} public U.S. records; ${usRomanParishes.length} U.S. Roman Catholic parishes.`,
);
