// Apply the page-cited ELIP adjudications as Registry Revision 2.
//
// This script intentionally refuses any baseline other than Registry Revision
// 1 with 214 records. It preserves older year readings as provenance, applies
// only the six approved record mutations, writes the revision hash, and emits
// a human-readable report.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const registryPath = new URL("../data/registry-unified.json", import.meta.url);
const reportPath = new URL(
  "../data/candidates/registry-revision-2-elip-report.md",
  import.meta.url,
);
const registry = JSON.parse(readFileSync(registryPath, "utf8"));

if (registry.registryRevision?.version !== 1) {
  throw new Error(
    `Expected Registry Revision 1, found ${registry.registryRevision?.version ?? "none"}.`,
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
const addNameVariants = (record, ...variants) => {
  record.names.variants = [
    ...new Set([...(record.names?.variants ?? []), ...variants]),
  ];
};
const addAliases = (record, ...aliases) => {
  record.aliases = [...new Set([...(record.aliases ?? []), ...aliases])];
};
const addEvents = (record, ...events) => {
  record.events = uniqueByJson([...(record.events ?? []), ...events]);
};
const supersede = (record, ...readings) => {
  record.superseded_year_readings = uniqueByJson([
    ...(record.superseded_year_readings ?? []),
    ...readings,
  ]);
};
const adjudicate = (record, lifecycle) => {
  record.lifecycle = lifecycle;
  record.adjudication = {
    date: "2026-07-27",
    cite: "brain:docs/research/elip-2026/adjudications.md",
    status: "verified-or-labeled",
  };
};

const scrantonPdf =
  "https://www.dioceseofscranton.org/wp-content/uploads/2021/03/Consolidated-Parishes-3-24-21.pdf";
const allentownNotice =
  "https://www.ad-today.com/holy-family-parish-of-minersville/two-minersville-parishes-to-merge";

const diocesanSource = (pages, cites) => ({
  axis: "diocese-of-scranton",
  kind: "diocesan-record",
  work: "Consolidated Parishes (2021-03-24)",
  pages,
  sourceUrl: scrantonPdf,
  cites,
});
const selectedClosure = (value, page) => ({
  value,
  source: "diocese-of-scranton",
  cite: `Consolidated Parishes (2021-03-24), PDF p. ${page}`,
  selected: true,
});

const scranton = requireRecord("joseph-scranton-pa");
if (scranton.years.closed?.[0]?.value !== "2009") {
  throw new Error("Unexpected St. Joseph Scranton closure baseline.");
}
const scrantonOldClosures = scranton.years.closed;
scranton.years.closed = [
  selectedClosure("2011", 8),
  ...scrantonOldClosures,
];
supersede(scranton, ...scrantonOldClosures);
addSources(
  scranton,
  diocesanSource("8", "St. Joseph (Lithuanian), closed 2011-06-05"),
);
adjudicate(scranton, {
  canonical_status: "closed",
  selected_closed_year: 2011,
  selected_closed_date: "2011-06-05",
  confidence: "high",
});

const holyTrinity = requireRecord("trinity-wilkes-barre-pa");
if (holyTrinity.years.closed?.[0]?.value !== "2015") {
  throw new Error("Unexpected Holy Trinity Wilkes-Barre closure baseline.");
}
const holyTrinityOldClosures = holyTrinity.years.closed;
holyTrinity.years.closed = [selectedClosure("2010", 10)];
supersede(
  holyTrinity,
  ...holyTrinityOldClosures.map((reading) => ({
    ...reading,
    reclassified_as: "demolition",
  })),
);
addEvents(holyTrinity, {
  type: "demolition",
  year: 2015,
  source: "draugas-2008-2026",
});
addSources(
  holyTrinity,
  diocesanSource("10", "Holy Trinity (Lithuanian), closed 2010-05-30"),
);
adjudicate(holyTrinity, {
  canonical_status: "closed",
  selected_closed_year: 2010,
  selected_closed_date: "2010-05-30",
  confidence: "high",
});

const casimirLyndwood = requireRecord("st-casimir-wilkes-barre-pa");
if ((casimirLyndwood.years.closed ?? []).length !== 0) {
  throw new Error("Unexpected St. Casimir Lyndwood closure baseline.");
}
casimirLyndwood.years.closed = [selectedClosure("2010", 11)];
addNameVariants(
  casimirLyndwood,
  "St. Casimir Church, Lyndwood",
  "Lyndwood St. Casimir Church",
  "Lynnwood St. Casimir Church",
);
casimirLyndwood.city_history = [
  ...new Set([...(casimirLyndwood.city_history ?? []), "Lyndwood", "Lynnwood"]),
];
addSources(
  casimirLyndwood,
  diocesanSource(
    "11",
    "St. Casimir (Lithuanian), Lyndwood, Wilkes-Barre, closed 2010-08-29",
  ),
);
adjudicate(casimirLyndwood, {
  canonical_status: "closed",
  selected_closed_year: 2010,
  selected_closed_date: "2010-08-29",
  confidence: "high",
});

const francisMinersMills = requireRecord("st-francis-wilkes-barre-pa");
if (francisMinersMills.years.closed?.[0]?.value !== "2008") {
  throw new Error("Unexpected St. Francis Miners Mills closure baseline.");
}
const francisMinersMillsOldClosures = francisMinersMills.years.closed;
francisMinersMills.years.closed = [
  selectedClosure("2011", 11),
  ...francisMinersMillsOldClosures,
];
supersede(francisMinersMills, ...francisMinersMillsOldClosures);
addNameVariants(
  francisMinersMills,
  "St. Francis Church, Miners Mills",
  "Miners Mills St. Francis Church",
);
francisMinersMills.city_history = [
  ...new Set([...(francisMinersMills.city_history ?? []), "Miners Mills"]),
];
addSources(
  francisMinersMills,
  diocesanSource(
    "11",
    "St. Francis (Lithuanian), Miners Mills, Wilkes-Barre, closed 2011-06-26",
  ),
);
adjudicate(francisMinersMills, {
  canonical_status: "closed",
  selected_closed_year: 2011,
  selected_closed_date: "2011-06-26",
  confidence: "high",
});

const nanticoke = requireRecord("joseph-nanticoke-pa");
if (nanticoke.lifecycle?.canonical_status !== "unresolved") {
  throw new Error("Unexpected St. Joseph Nanticoke lifecycle baseline.");
}
const nanticokeOldClosures = nanticoke.years.closed ?? [];
nanticoke.years.closed = [
  selectedClosure("2001", 5),
  ...nanticokeOldClosures,
];
supersede(nanticoke, {
  value: "2004",
  source: "web-historical",
  reclassified_as: "sale_or_residential_conversion",
});
addAliases(
  nanticoke,
  "st-joseph-hanover-pa",
  "joseph-hanover-section-pa",
);
addNameVariants(
  nanticoke,
  "St. Joseph Church (Hanover Section)",
  "Hanover St. Joseph Church",
);
addEvents(nanticoke, {
  type: "sale_or_residential_conversion",
  year: 2004,
  source: "web-historical",
});
nanticoke.events = nanticoke.events.filter(
  (event) => event.type !== "church_closed_or_sold",
);
addSources(
  nanticoke,
  diocesanSource(
    "5",
    "St. Joseph Church (Hanover Section), closed 2001; joined Holy Spirit, Mocanaqua",
  ),
  {
    axis: "draugas-registry-1909-2007",
    kind: "newspaper-page",
    cites: "1965-11-03 p. 4",
    note: "Nanticoke parish organized in the Hanover district in 1908; present church built in 1924.",
  },
);
adjudicate(nanticoke, {
  canonical_status: "closed",
  selected_closed_year: 2001,
  confidence: "high",
});

const minersville = requireRecord("st-francis-minersville-pa");
if (
  minersville.years.founded?.[0]?.value !== "1950" ||
  minersville.years.closed?.[0]?.value !== "2020"
) {
  throw new Error("Unexpected St. Francis Minersville year baseline.");
}
const minersvilleOldFounded = minersville.years.founded;
const minersvilleOldClosed = minersville.years.closed;
minersville.years.founded = [
  {
    value: "1895",
    source: "secondary-histories",
    cite: "Draugas News and Lithuanian Global Genealogical Society",
    selected: true,
  },
  ...minersvilleOldFounded,
];
minersville.years.closed = [];
supersede(
  minersville,
  ...minersvilleOldFounded.map((reading) => ({
    ...reading,
    field: "founded",
  })),
  ...minersvilleOldClosed.map((reading) => ({
    ...reading,
    field: "closed",
    reclassified_as: "church_building_closed",
  })),
);
minersville.conflicts = uniqueByJson([
  ...(minersville.conflicts ?? []),
  {
    field: "founded",
    variants: minersville.years.founded,
    note: "1895 is selected secondary evidence; contemporary Draugas pages prove the parish existed by 1909.",
  },
]);
addEvents(
  minersville,
  {
    type: "new_church_dedicated",
    date: "1909-11-25",
    source: "draugas-registry-1909-2007",
    cite: "1909-11-18 p. 10; 1909-12-16 p. 5",
  },
  {
    type: "church_building_closed",
    date: "2020-07-01",
    source: "diocese-of-allentown",
    cite: "Two Minersville Parishes to Merge (2020-06-21)",
  },
);
addSources(
  minersville,
  {
    axis: "draugas-registry-1909-2007",
    kind: "newspaper-page",
    cites: "1909-11-18 p. 10; 1909-12-16 p. 5",
    note: "New Lithuanian St. Francis church dedicated 1909-11-25.",
  },
  {
    axis: "draugas-news",
    kind: "secondary-history",
    sourceUrl:
      "https://www.draugas.org/news/little-lithuania-usa-schuylkill-county-pa/",
    cites: "Parish founded 1895.",
  },
  {
    axis: "lithuanian-genealogy",
    kind: "secondary-history",
    sourceUrl: "https://lithuaniangenealogy.org/static_db/PA-sfa.php",
    cites: "Parish founded 1895.",
  },
  {
    axis: "diocese-of-allentown",
    kind: "diocesan-news",
    sourceUrl: allentownNotice,
    cites: "St. Francis church building closed with merger effective 2020-07-01.",
  },
);
minersville.caveat =
  "The parish existed by 1909; 1895 is the selected secondary founding reading. The St. Francis church building closed effective 2020-07-01, but the reviewed source does not establish the juridic end date of the former parish.";
adjudicate(minersville, {
  canonical_status: "unresolved",
  selected_closed_year: null,
  confidence: "juridic-end-unresolved",
});

registry.registryRevision = {
  version: 2,
  date: "2026-07-27",
  changelog: [
    ...(registry.registryRevision.changelog ?? []),
    "Registry Revision 2: corrected four Scranton/Wilkes-Barre closure identities and exact dates from the Diocese of Scranton consolidated-parishes table.",
    "Resolved Nanticoke St. Joseph as the Hanover-section entity closed in 2001; retained its later sale/conversion as a building event.",
    "Reconstructed Minersville St. Francis as founded 1895 (secondary reading), documented the 1909 church dedication, and separated the 2020 building closure from the unresolved juridic parish-end date.",
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

const report = `# Registry Revision 2 - ELIP adjudication application

**Applied:** 2026-07-27
**Evidence:** \`culturenet-brain/docs/research/elip-2026/adjudications.md\`
**Before:** Registry Revision 1, 214 records
**After:** Registry Revision 2, 214 records
**Additions/deletions:** none

| Record | Before | Registry Revision 2 |
|---|---|---|
| \`joseph-scranton-pa\` | Closure 2009 | Closure 2011-06-05; 2009 retained as superseded |
| \`trinity-wilkes-barre-pa\` | Closure 2015 | Closure 2010-05-30; 2015 typed as demolition |
| \`st-casimir-wilkes-barre-pa\` | No closure; ELIP incorrectly joined the date to Pittston | Closure 2010-08-29; Lyndwood/Lynnwood identity variants added |
| \`st-francis-wilkes-barre-pa\` | Closure 2008 | Closure 2011-06-26; Miners Mills identity variant added |
| \`joseph-nanticoke-pa\` | Closure unresolved; 2004 closure/sale lead | Hanover-section identity; closure 2001; 2004 sale/conversion |
| \`st-francis-minersville-pa\` | Founded 1950; closed 2020 | Founded 1895 selected as secondary; church dedicated 1909-11-25; building closed 2020-07-01; juridic parish end unresolved |

## Explicit non-mutations

- Pittston St. Casimir remains closed in 2008.
- New Haven St. Casimir remains closed in 2003.
- Bayonne St. Michael remains merged into its successor in 2016.
- Rochester St. George is not relitigated; site PR #100 owns its case-record source update.
- Camden St. George is not added because its titular, canonical erection, and end are not established.
- Plano St. Mary is not added because the evidence establishes Lithuanian Marian administration of a territorial parish, not a Lithuanian ethnic parish.
- No separate Hanover record is created.

## Guardrail result

The revision changes lifecycle and event interpretation without changing the
locked \`draugas-2008-2026\` arithmetic. Original locked values remain embedded
as provenance; site surfaces consume the selected lifecycle layer.
`;
writeFileSync(reportPath, report);

console.log(
  `Registry Revision 2 applied: ${registry.parishes.length} records; hash ${registry.registryRevision.contentHash.slice(0, 12)}...`,
);
