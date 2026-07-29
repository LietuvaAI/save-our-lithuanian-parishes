// Apply Registry Revision 3 from the two-pass parish-canon tranche 1.
//
// This step starts from the unmerged ELIP Revision 2 branch. It collapses two
// duplicate rows, corrects three entity classifications, preserves provisional
// boundaries, and keeps the locked C83 evidence unchanged.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const registryPath = new URL("../data/registry-unified.json", import.meta.url);
const situationPath = new URL("../data/parish-situation.json", import.meta.url);
const reportPath = new URL(
  "../data/candidates/registry-revision-3-tranche1-report.md",
  import.meta.url,
);

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const situations = JSON.parse(readFileSync(situationPath, "utf8"));

if (registry.registryRevision?.version !== 2) {
  throw new Error(
    `Expected Registry Revision 2, found ${registry.registryRevision?.version ?? "none"}.`,
  );
}
if (registry.parishes?.length !== 214) {
  throw new Error(`Expected 214 records, found ${registry.parishes?.length}.`);
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
const addSources = (record, ...sources) => {
  record.sources = uniqueByJson([...(record.sources ?? []), ...sources]);
};
const addAliases = (record, ...aliases) => {
  record.aliases = [...new Set([...(record.aliases ?? []), ...aliases])];
};
const addNameVariants = (record, ...variants) => {
  record.names.variants = [
    ...new Set([...(record.names?.variants ?? []), ...variants]),
  ];
};
const addConflicts = (record, ...conflicts) => {
  record.conflicts = uniqueByJson([...(record.conflicts ?? []), ...conflicts]);
};
const addEvents = (record, ...events) => {
  record.events = uniqueByJson([...(record.events ?? []), ...events]);
};
const draugasPage = (date, page, sourceUrl, note) => ({
  axis:
    Number(date.slice(0, 4)) >= 2008
      ? "draugas-2008-2026"
      : "draugas-registry-1909-2007",
  kind: "newspaper-page",
  cites: `${date} ${page}`,
  sourceUrl,
  note,
});
const currentSource = ({
  axis,
  kind,
  work,
  publisher,
  sourceUrl,
  note,
}) => ({
  axis,
  kind,
  work,
  publisher,
  sourceUrl,
  accessed: "2026-07-28",
  note,
});
const markAdjudicated = (record, lifecycle) => {
  record.lifecycle = lifecycle;
  record.adjudication = {
    date: "2026-07-28",
    cite:
      "brain:docs/research/parish-canon-beyond-83/tranche-1/survival-ledger.json",
    status: "verified-or-labeled",
  };
  record.needs_human_source_review = true;
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

const draugas1984 =
  "https://www.draugas.org/archive/1984_reg/1984-07-06-DRAUGAS-i6-8.pdf";
const easternPncc =
  "https://www.easterndiocesepncc.org/our-parishes/";
const centralPncc =
  "https://www.centraldiocesepncc.org/about/our-parishes/";

const waterbury = requireRecord(
  "lithuanian-national-catholic-parish-waterbury-ct",
);
waterbury.names.lt = "Visų Šventųjų";
waterbury.names.en =
  "All Saints Lithuanian independent/national church";
addNameVariants(
  waterbury,
  "Visu Sventuju",
  "Visų Šventųjų lietuvių nepriklausoma bažnyčia",
  "All Saints Lithuanian independent church",
  "All Saints Lithuanian national church",
);
waterbury.congregation_class = "independent_catholic";
waterbury.diocese = null;
waterbury.sources = (waterbury.sources ?? []).map((source) =>
  source.axis === "web-historical"
    ? {
        ...source,
        kind: "baseline-candidate",
        currentStatus: "historical; exact end unknown",
        ownership: "unknown",
        confidence: "baseline-only",
        note: "Carries the provisional 1902 baseline; no stable public source URL is attached.",
      }
    : source,
);
waterbury.years.founded = (waterbury.years.founded ?? []).map((reading) => ({
  ...reading,
  provisional: true,
}));
waterbury.relationships = [
  {
    type: "distinct_from",
    slug: "joseph-waterbury-ct",
    note: "Roman Catholic St. Joseph is a separate institution.",
  },
  {
    type: "distinct_from",
    label: "modern All Saints/Todos los Santos, Waterbury",
    note: "The current Roman Catholic parish is not the historical independent entity.",
  },
  {
    type: "distinct_from",
    slug: "casimir-waterbury-ct",
    note: "The disputed St. Casimir case-file identity is not this entity.",
  },
];
addSources(
  waterbury,
  draugasPage(
    "1984-07-06",
    "p. 5",
    draugas1984,
    "Retrospective identifies the Waterbury independent/national entity as All Saints.",
  ),
  currentSource({
    axis: "pncc-eastern-diocese",
    kind: "official-denominational-directory",
    work: "Our Parishes",
    publisher: "Eastern Diocese, Polish National Catholic Church",
    sourceUrl: easternPncc,
    note: "No current Waterbury PNCC parish is listed; directory absence does not establish an end date.",
  }),
  currentSource({
    axis: "archdiocese-of-hartford",
    kind: "official-diocesan-directory",
    work: "Parishes",
    publisher: "Archdiocese of Hartford",
    sourceUrl: "https://archdioceseofhartford.org/parishes/",
    note: "Current Roman Catholic roster used to separate modern institutions from the historical independent entity.",
  }),
  currentSource({
    axis: "current-parish-waterbury",
    kind: "current-institutional-site",
    work: "All Saints/Todos los Santos Parish",
    publisher: "All Saints/Todos los Santos Parish",
    sourceUrl: "https://allsaintswtby.org/",
    note: "Modern Roman Catholic All Saints is a separate institution.",
  }),
  currentSource({
    axis: "truelithuania",
    kind: "specialist-heritage-source",
    work: "Waterbury, Connecticut",
    publisher: "Global True Lithuania",
    sourceUrl: "https://global.truelithuania.com/waterbury-connecticut-318/",
    note: "Specialist discovery source; does not settle title, property, or end date.",
  }),
);
waterbury.caveat =
  "The All Saints identity is supported, but the 1902 start remains a provisional baseline and no exact end date, address, property record, or living successor has been established.";
addConflicts(waterbury, {
  field: "survival and building",
  variants: [
    {
      value: "historical independent/national entity",
      source: "draugas-registry-1909-2007",
      cite: "1984-07-06 p. 5",
    },
    {
      value: "no current successor established; building status unknown",
      source: "current/official pass",
      cite: "accessed 2026-07-28",
    },
  ],
  note: "Directory absence does not prove a closure date or building disposition.",
});
markAdjudicated(waterbury, {
  canonical_status: "unknown",
  selected_closed_year: null,
  confidence: "historical-identity-supported-end-unresolved",
});
refreshDepth(waterbury);

const worcester = requireRecord("allsaints-worcester-ma");
const worcesterAlias = requireRecord("parish-worcester-ma");
worcester.names.lt = "Visų Šventųjų";
worcester.names.en =
  "All Saints independent/national Lithuanian parish";
addNameVariants(
  worcester,
  ...worcesterAlias.names.variants,
  "Visu Sventuju",
  "All Saints independent Lithuanian parish",
);
addAliases(worcester, worcesterAlias.slug);
addSources(
  worcester,
  ...worcesterAlias.sources,
  draugasPage(
    "1909-08-12",
    "p. 11",
    "https://www.draugas.org/archive/1909_reg/1909-08-12-DRAUGASw.pdf",
    "Contemporary report of the All Saints independent parish meeting.",
  ),
  draugasPage(
    "1910-04-14",
    "p. 4",
    "https://www.draugas.org/archive/1910_reg/1910-04-14-DRAUGASw.pdf",
    "Reports the remaining All Saints group and its decline.",
  ),
  draugasPage(
    "1994-09-09",
    "p. 3",
    "https://www.draugas.org/archive/1994_reg/1994-09-09-DRAUGAS-i7-8.pdf",
    "St. Casimir centennial history confirms the separate All Saints split.",
  ),
  draugasPage(
    "1919-07-30",
    "p. 3",
    "https://www.draugas.org/archive/1919_reg/1919-07-30-DRAUGASw_2nd_ed_i5-8.pdf",
    "Later Catholic polemic says Worcester returned to its church; treated as end-state evidence, not a decree.",
  ),
  currentSource({
    axis: "pncc-eastern-diocese",
    kind: "official-denominational-directory",
    work: "Our Parishes",
    publisher: "Eastern Diocese, Polish National Catholic Church",
    sourceUrl: easternPncc,
    note: "No current Worcester All Saints national parish is listed.",
  }),
  currentSource({
    axis: "diocese-of-worcester",
    kind: "official-diocesan-directory",
    work: "Parish Finder",
    publisher: "Diocese of Worcester",
    sourceUrl: "https://worcesterdiocese.org/parishfinder",
    note: "Current Roman Catholic roster checked to separate All Saints from St. Casimir.",
  }),
  currentSource({
    axis: "truelithuania",
    kind: "specialist-heritage-source",
    work: "Worcester, Massachusetts",
    publisher: "Global True Lithuania",
    sourceUrl: "https://global.truelithuania.com/worcester-massachusetts-314/",
    note: "Specialist discovery source; current property and exact end remain unresolved.",
  }),
);
worcester.congregation_class = "independent_catholic";
worcester.diocese = null;
worcester.relationships = [
  {
    type: "distinct_from",
    slug: "casimir-worcester-ma",
    note: "All Saints was the Rome-independent split from Roman Catholic St. Casimir.",
  },
];
worcester.caveat =
  "The parish is directly attested in 1909–1910 and again in retrospective evidence. A 1913 secondary closure reading conflicts with decline by 1910 and a 1919 report that the group had returned; the exact end remains unresolved.";
addConflicts(worcester, {
  field: "end date",
  variants: [
    {
      value: "declining by 1910",
      source: "draugas-registry-1909-2007",
      cite: "1910-04-14 p. 4",
    },
    {
      value: "1913",
      source: "michelsonas-1961",
      cite: "pp. 344–345",
    },
    {
      value: "returned by 1919",
      source: "draugas-registry-1909-2007",
      cite: "1919-07-30 p. 3",
    },
  ],
  note: "These readings establish a historical end, but not a precise canonical closure date.",
});
markAdjudicated(worcester, {
  canonical_status: "closed",
  selected_closed_year: null,
  confidence: "historical-end-supported-date-unresolved",
});
refreshDepth(worcester);

const wilkesBarre = requireRecord("all-saints-wilkes-barre-pa");
const wilkesBarreAlias = requireRecord("parish-wilkes-barre-pa");
wilkesBarre.names.lt = "Visų Šventųjų";
wilkesBarre.names.en =
  "All Saints Lithuanian national/independent Catholic parish";
addNameVariants(
  wilkesBarre,
  ...wilkesBarreAlias.names.variants,
  "Wilkes-Barre Lithuanian National Church",
);
addAliases(wilkesBarre, wilkesBarreAlias.slug);
addSources(
  wilkesBarre,
  ...wilkesBarreAlias.sources,
  draugasPage(
    "1984-07-06",
    "p. 5",
    draugas1984,
    "Retrospective lists the Wilkes-Barre national parish and gives 1929.",
  ),
  draugasPage(
    "2022-10-01",
    "p. 11",
    "https://draugas.org/key/2022_reg/2022-10-01-DRAUGASo.pdf",
    "Identifies a memorial stone on the wall of the Wilkes-Barre Lithuanian national church.",
  ),
  draugasPage(
    "2024-01-20",
    "pp. 10, 13",
    "https://draugas.org/key/2024_reg/2024-01-20-DRAUGASo.pdf",
    "Identifies Scranton as the surviving Lithuanian national parish and provides Wilkes-Barre community context.",
  ),
  currentSource({
    axis: "pncc-central-diocese",
    kind: "official-denominational-directory",
    work: "Our Parishes",
    publisher: "Central Diocese, Polish National Catholic Church",
    sourceUrl: centralPncc,
    note: "No current Wilkes-Barre national parish is listed; directory absence does not establish a closure date.",
  }),
  currentSource({
    axis: "lktb-current",
    kind: "specialist-institutional-source",
    work: "About",
    publisher: "Lietuvių Katalikų Tautinė Bažnyčia",
    sourceUrl: "https://www.lktb.org/home/about",
    note: "Corroborates Scranton Providence of God as the remaining Lithuanian National Catholic parish.",
  }),
);
wilkesBarre.diocese = null;
wilkesBarre.years.founded = [
  {
    value: "1929",
    source: "draugas-registry-1909-2007",
    cite: "1984-07-06 p. 5",
  },
  {
    value: "1932",
    source: "truelithuania",
    cite: "cornerstone/building clue",
  },
];
wilkesBarre.relationships = [
  {
    type: "distinct_from",
    slug: "trinity-wilkes-barre-pa",
    note: "Roman Catholic Holy Trinity is a separate institution.",
  },
  {
    type: "sister_institution_not_successor",
    slug: "providence-of-god-scranton-pa",
    note: "Scranton survives, but no legal succession from Wilkes-Barre is established.",
  },
];
wilkesBarre.caveat =
  "No living Wilkes-Barre national congregation is established by the 2024–2026 evidence. The exact end date, ownership, present use, and building disposition remain unresolved; demolition is not claimed.";
addConflicts(wilkesBarre, {
  field: "founded",
  variants: wilkesBarre.years.founded,
  note: "1929 may mark organization; 1932 may mark the building or cornerstone.",
});
markAdjudicated(wilkesBarre, {
  canonical_status: "closed",
  selected_closed_year: null,
  confidence: "no-living-congregation-end-date-unresolved",
});
refreshDepth(wilkesBarre);

const providence = requireRecord("providence-providence-ri");
providence.names.en =
  "Providence Lithuanian independent/national Catholic phase";
addNameVariants(
  providence,
  "Providence Lithuanian independent phase",
  "Providence Lithuanian national Catholic phase",
);
providence.record_type = "phase";
providence.congregation_class = "independent_catholic";
providence.diocese = null;
addSources(
  providence,
  draugasPage(
    "1909-08-12",
    "p. 11",
    "https://www.draugas.org/archive/1909_reg/1909-08-12-DRAUGASw.pdf",
    "Links the Providence independent phase to the Mickevičius dispute.",
  ),
  draugasPage(
    "1910-08-18",
    "p. 11",
    "https://www.draugas.org/archive/1910_reg/1910-08-18-DRAUGASw.pdf",
    "Reader letter and editorial response on Mickevičius serving Providence Lithuanians.",
  ),
  draugasPage(
    "1910-09-29",
    "p. 5",
    "https://www.draugas.org/archive/1910_reg/1910-09-29-DRAUGASw.pdf",
    "Documents the Providence dispute and money complaint.",
  ),
  draugasPage(
    "1911-06-15",
    "p. 6",
    "https://www.draugas.org/archive/1911_reg/1911-06-15-DRAUGASw.pdf",
    "Additional contemporary evidence for the Providence independent phase.",
  ),
  draugasPage(
    "1919-07-30",
    "p. 3",
    "https://www.draugas.org/archive/1919_reg/1919-07-30-DRAUGASw_2nd_ed_i5-8.pdf",
    "Later Catholic polemic says Providence returned; treated as phase-end evidence, not a decree.",
  ),
  currentSource({
    axis: "pncc-eastern-diocese",
    kind: "official-denominational-directory",
    work: "Our Parishes",
    publisher: "Eastern Diocese, Polish National Catholic Church",
    sourceUrl: easternPncc,
    note: "No current Providence Lithuanian national parish is listed.",
  }),
  currentSource({
    axis: "diocese-of-providence",
    kind: "official-diocesan-directory",
    work: "Parish Finder",
    publisher: "Diocese of Providence",
    sourceUrl: "https://www.dioceseofprovidence.org/parishfinder",
    note: "The later Roman Catholic St. Casimir record is separate: legal title established in 1919 and closure effective 2017-07-01.",
  }),
);
providence.relationships = [
  {
    type: "distinct_from",
    slug: "casimir-providence-ri",
    note: "Later Roman Catholic St. Casimir is separate unless a succession source is found.",
  },
];
providence.caveat =
  "The independent/national episode is supported as a historical phase, not yet as a durable standalone parish. Its title, corporation, property, governance, and exact end remain unresolved; the later Roman Catholic St. Casimir closure belongs to a separate record.";
addConflicts(providence, {
  field: "institutional continuity",
  variants: [
    {
      value: "independent/national phase documented by 1909–1911",
      source: "draugas-registry-1909-2007",
    },
    {
      value: "reported returned by 1919",
      source: "draugas-registry-1909-2007",
      cite: "1919-07-30 p. 3",
    },
  ],
  note: "No succession document connects this phase to the later Roman Catholic St. Casimir parish.",
});
markAdjudicated(providence, {
  canonical_status: "unknown",
  selected_closed_year: null,
  confidence: "phase-supported-durable-parish-unresolved",
});
refreshDepth(providence);

const dubois = requireRecord("joseph-dubois-pa");
const duboisAlias = requireRecord("st-joseph-du-bois-pa");
dubois.names.lt = "Šv. Juozapo";
dubois.names.en = "St. Joseph Lithuanian Roman Catholic parish";
addNameVariants(
  dubois,
  ...duboisAlias.names.variants,
  "Šv. Juozapo parapija, DuBois, Pa.",
  "St. Joseph Lithuanian parish, DuBois",
);
addAliases(dubois, duboisAlias.slug);
dubois.congregation_class = "roman_catholic";
dubois.diocese = "Diocese of Erie";
dubois.sources = (dubois.sources ?? []).map((source) => {
  if (source.axis !== "michelsonas-1961") return source;
  const rest = { ...source };
  delete rest.ownership;
  return {
    ...rest,
    ethnic_status:
      "Roman Catholic St. Joseph; Michelsonas also records a separate national-church attempt in DuBois.",
    diocese: "Diocese of Erie",
  };
});
dubois.years = {
  founded: [
    {
      value: "active by 1912",
      source: "draugas-registry-1909-2007",
      cite: "1912-05-02 p. 8",
    },
  ],
  closed: [],
};
addSources(
  dubois,
  draugasPage(
    "1912-05-02",
    "p. 8",
    "https://www.draugas.org/archive/1912_reg/1912-05-02-DRAUGASw.pdf",
    "Contemporary donation/accounting item names St. Joseph parish, DuBois.",
  ),
  draugasPage(
    "1984-07-06",
    "p. 5",
    draugas1984,
    "Separately records a DuBois independent/national attempt in 1903; it is not assigned to St. Joseph.",
  ),
  draugasPage(
    "2018-01-11",
    "p. 4",
    "https://draugas.org/key/2018_reg/2018-01-11-DRAUGASo.pdf",
    "Documents the Lithuanian church, cemetery, and club heritage context.",
  ),
  currentSource({
    axis: "diocese-of-erie",
    kind: "official-diocesan-directory",
    work: "Parishes and Churches Directory",
    publisher: "Diocese of Erie",
    sourceUrl:
      "https://www.eriercd.org/directoryparishesandchurches.html",
    note: "DuBois is served by Holy Spirit Parish; St. Joseph is not listed as a current standalone parish or church.",
  }),
  currentSource({
    axis: "st-nicholas-dubois",
    kind: "current-institutional-site",
    work: "About Us",
    publisher: "St. Nicholas Orthodox Church, DuBois",
    sourceUrl: "https://www.stnicholasdubois.org/aboutus",
    note: "Reports purchasing the former St. Joseph Roman Catholic Church at 301 South State Street in April 2020 and converting it for Orthodox use.",
  }),
  currentSource({
    axis: "pncc-central-diocese",
    kind: "official-denominational-directory",
    work: "Our Parishes",
    publisher: "Central Diocese, Polish National Catholic Church",
    sourceUrl: centralPncc,
    note: "No current DuBois national parish is listed.",
  }),
);
dubois.relationships = [
  {
    type: "distinct_from",
    label: "DuBois independent/national church attempt, 1903",
    note: "The attempt's title, property, governance, and end are not established; no separate row is created.",
  },
  {
    type: "former_building_used_by",
    label: "St. Nicholas Orthodox Church",
    address: "301 South State Street, DuBois, PA",
    since: "2020-04",
    note: "Current institutional source; civil deed confirmation remains pending.",
  },
];
addEvents(dubois, {
  type: "former_church_purchased_for_orthodox_use",
  date: "2020-04",
  source: "st-nicholas-dubois",
  cite: "About Us",
});
dubois.caveat =
  "This row is Roman Catholic St. Joseph. A separate DuBois independent/national attempt is attested in 1903 but is not sufficiently identified for its own registry row. St. Joseph's exact suppression or merger date remains unresolved.";
addConflicts(dubois, {
  field: "entity identity",
  variants: [
    {
      value: "Roman Catholic St. Joseph active by 1912",
      source: "draugas-registry-1909-2007",
      cite: "1912-05-02 p. 8",
    },
    {
      value: "separate independent/national attempt in 1903",
      source: "draugas-registry-1909-2007",
      cite: "1984-07-06 p. 5",
    },
  ],
  note: "The two entities must not be flattened into one denomination or timeline.",
});
markAdjudicated(dubois, {
  canonical_status: "closed",
  selected_closed_year: null,
  confidence: "not-current-standalone-exact-end-unresolved",
});
refreshDepth(dubois);

const removed = new Set([
  "parish-worcester-ma",
  "parish-wilkes-barre-pa",
  "st-joseph-du-bois-pa",
]);
registry.parishes = registry.parishes.filter(
  (record) => !removed.has(record.slug),
);

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
  version: 3,
  date: "2026-07-28",
  changelog: [
    ...(registry.registryRevision.changelog ?? []),
    "Applied parish-canon tranche 1 after archival and current/official review: restored Waterbury All Saints as a distinct historical entity, collapsed Worcester, Wilkes-Barre, and DuBois duplicate rows, marked Providence as a phase, and separated Roman Catholic DuBois St. Joseph from the provisional 1903 national attempt.",
    "Preserved full direct Draugas issue links, current institutional sources, unresolved boundaries, and the unchanged locked C83 evidence.",
  ],
  contentHash: "",
};

situations.generated = "2026-07-28";
situations.note =
  "Structured present-state classifiers for canonical registry records. Hand-reviewed cases retain source-linked narrative and explicitly labeled uncertainty; generated records remain provisional until verified.";
situations.parishes["lithuanian-national-catholic-parish-waterbury-ct"] = {
  registry_slug: "lithuanian-national-catholic-parish-waterbury-ct",
  canonical_status: "unknown",
  building_fate: "unknown",
  current_use: "No current successor or building disposition established",
  lithuanian_identity: "lost",
  pastoral_status: "unknown",
  situation:
    "Draugas identifies a distinct All Saints Lithuanian independent/national church in Waterbury. It was not Roman Catholic St. Joseph, the disputed St. Casimir record, or today's Roman Catholic All Saints/Todos los Santos. No current PNCC successor, exact end date, address, property record, or building fate has been established; the 1902 start remains a provisional baseline.",
};
situations.parishes["allsaints-worcester-ma"] = {
  registry_slug: "allsaints-worcester-ma",
  canonical_status: "closed",
  building_fate: "unknown",
  current_use: "No current All Saints successor established",
  lithuanian_identity: "lost",
  pastoral_status: "not_applicable",
  situation:
    "All Saints was a real, Rome-independent Lithuanian parish that split from St. Casimir and is directly attested in 1909–1910. A secondary history gives 1913, while Draugas reports decline by 1910 and return by 1919; the exact end remains unresolved. No current All Saints independent/national successor or building disposition has been established.",
};
situations.parishes["all-saints-wilkes-barre-pa"] = {
  registry_slug: "all-saints-wilkes-barre-pa",
  canonical_status: "closed",
  building_fate: "unknown",
  current_use: "Closed historical site; present use and building fate unresolved",
  lithuanian_identity: "lost",
  pastoral_status: "not_applicable",
  situation:
    "All Saints is the canonical Wilkes-Barre national/independent Catholic record; the generic Wilkes-Barre row was a duplicate. Sources disagree between 1929 and 1932. No living congregation is established by the 2024–2026 evidence, but the exact end, ownership, current use, and building disposition remain unresolved; demolition is not claimed.",
};
situations.parishes["providence-providence-ri"] = {
  registry_slug: "providence-providence-ri",
  canonical_status: "unknown",
  building_fate: "unknown",
  current_use: "Historical phase; no current independent/national successor established",
  lithuanian_identity: "unknown",
  pastoral_status: "unknown",
  situation:
    "Draugas supports a Providence Lithuanian independent/national Catholic phase around 1909–1911 and reports a return by 1919. The evidence does not yet establish a durable standalone parish, corporation, property, or exact end. The later Roman Catholic St. Casimir parish, whose legal title began in 1919 and closed in 2017, is a separate record unless a succession source is found.",
};
situations.parishes["joseph-dubois-pa"] = {
  registry_slug: "joseph-dubois-pa",
  canonical_status: "closed",
  building_fate: "repurposed_religious",
  current_use:
    "St. Nicholas Orthodox Church, 301 South State Street, since 2020",
  lithuanian_identity: "lost",
  pastoral_status: "not_applicable",
  situation:
    "This record is St. Joseph Lithuanian Roman Catholic parish, active by 1912 and no longer listed as a standalone Diocese of Erie parish. St. Nicholas Orthodox reports purchasing the former church in April 2020 and using it for Orthodox worship. A separate DuBois independent/national attempt is attested in 1903, but its title, property, and end are unresolved and it is not counted as a parish row.",
};
delete situations.parishes["parish-worcester-ma"];
delete situations.parishes["parish-wilkes-barre-pa"];
delete situations.parishes["st-joseph-du-bois-pa"];

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

const report = `# Registry Revision 3 - parish-canon tranche 1 application

**Applied:** 2026-07-28
**Evidence:** \`culturenet-brain/docs/research/parish-canon-beyond-83/tranche-1/\`
**Before:** Registry Revision 2 ELIP draft, 214 records
**After:** Registry Revision 3 combined draft, ${registry.parishes.length} records
**Locked C83 impact:** none

## Record changes

| Before | After | Count effect |
|---|---|---|
| \`lithuanian-national-catholic-parish-waterbury-ct\` generic national row | Retitled All Saints; independent Catholic; end and building unresolved | none |
| \`allsaints-worcester-ma\` + \`parish-worcester-ma\` | One titled All Saints row; generic slug retained as alias | -1 |
| \`all-saints-wilkes-barre-pa\` + \`parish-wilkes-barre-pa\` | One titled All Saints row; generic slug retained as alias | -1 |
| \`providence-providence-ri\` parish | Historical independent/national phase, visible but not counted as a durable parish | parish -1; phase +1 |
| \`joseph-dubois-pa\` + \`st-joseph-du-bois-pa\` national/RC conflation and duplicate | One Roman Catholic St. Joseph row; spelling variant retained as alias; 1903 national attempt retained only as a provisional note | -1 |

## Count impact

| Measure | Before | After |
|---|---:|---:|
| Registry records | 214 | ${registry.counts.records} |
| Parish rows | 200 | ${registry.counts.parishes} |
| Historical phase rows | 0 | ${registry.counts.phases} |
| Mission rows | 4 | ${registry.counts.missions} |
| Congregation rows | 10 | ${registry.counts.congregations} |
| Locked C83 cases | 83 | ${registry.counts.case_filed} |

## Unresolved boundaries carried forward

- Waterbury All Saints: 1902 is provisional; exact title history, address, property, end date, and building fate remain open.
- Worcester All Saints: decline by 1910, secondary 1913 closure, and return by 1919 are all retained; exact end is not selected.
- Wilkes-Barre All Saints: 1929/1932 conflict retained; end date, ownership, current use, and building disposition remain open.
- Providence: supported as a phase, not a durable parish; no succession to later Roman Catholic St. Casimir is asserted.
- DuBois: the two Roman Catholic St. Joseph rows are collapsed; the exact suppression/merger date and civil deed confirmation remain open; no separate 1903 national-attempt row is created.

## Source handling

- Every page-cited Draugas item added by this tranche carries its full direct issue URL.
- Official diocesan/denominational directories and current institutional pages are linked separately from specialist secondary sources.
- Directory absence is used only as negative current evidence, never as a silent closure date.
`;
writeFileSync(reportPath, report);

console.log(
  `Parish-canon tranche 1 applied: ${registry.parishes.length} records; hash ${registry.registryRevision.contentHash.slice(0, 12)}...`,
);
