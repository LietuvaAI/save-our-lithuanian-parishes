// Registry Revision 9: reconcile current-condition projections with the deep
// case records, without changing institutional identity or public census
// inclusion. Run once from Revision 8; the output is committed as the replayed
// publication revision.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));
const write = (path, value, space = 2) =>
  writeFileSync(
    new URL(`../data/${path}`, import.meta.url),
    `${JSON.stringify(value, null, space)}\n`,
  );

const registry = read("registry-unified.json");
const situations = read("parish-situation.json");
const revisions = read("registry-revisions.json");

const reapplyingRevision9 = registry.registryRevision?.version === 9;
if (![8, 9].includes(registry.registryRevision?.version)) {
  throw new Error(
    `Expected Registry Revision 8 or a Revision 9 replay, found ${registry.registryRevision?.version ?? "none"}.`,
  );
}
if (
  revisions.revisions.at(-1)?.version !==
  (reapplyingRevision9 ? 9 : 8)
) {
  throw new Error("Registry release ledger does not match the replay baseline.");
}

const corrections = {
  "ausros-vartu-chicago-il": {
    fate: "standing",
    situation:
      "Our Lady of Vilna closed in 1987 and merged into St. Paul. The former combined church-and-school building remains standing, but no current occupant or use could be verified.",
  },
  "dievo-apvaizdos-chicago-il": {
    fate: "repurposed_religious",
    situation:
      "Providence of God was canonically suppressed in 2016 after a Pilsen parish-planning process and remained an occasional worship site until 2017. The campus was sold in September 2025 to another church congregation and remains in religious/community use.",
  },
  "saldziausios-jezaus-sirdies-lawrence-ma": {
    fate: "repurposed_religious",
  },
  "siluvos-dievo-motinos-maizeville-pa": { fate: "standing" },
  "sv-andriejaus-new-britain-ct": {
    fate: "standing",
    situation:
      "The parish was suppressed in 2017 and worship continued at the church into the early 2020s. The building was later sold and remains standing; the purchaser and present occupant could not be verified. The Vanagas commemorative plaque was removed after closure.",
  },
  "sv-antano-detroit-mi": {
    fate: "standing",
    situation:
      "St. Anthony parish closed in 2013 and merged into Divine Providence in Southfield. Its 1923 former church remains standing but is not an active church. It was reused as a community center and was listed for sale in September 2024; the sale outcome remains unverified.",
  },
  "sv-antano-omaha-ne": {
    fate: "repurposed_religious",
    situation:
      "St. Anthony closed and merged into Ss. Peter and Paul in 2014. The former church remains standing and is probably occupied by a Spanish-language Protestant congregation; the exact parcel match remains labeled probable.",
  },
  "sv-juozapo-south-chicago-il": {
    fate: "repurposed_secular",
    situation:
      "St. Joseph closed in 1987. The former parish campus has since been repurposed: Casa Esperanza operates at the Saginaw Avenue address, and the heritage survey records the small church as absorbed into the former parish-school complex.",
  },
  "sv-juozapo-waterbury-ct": { fate: "standing" },
  "sv-jurgio-cleveland-oh": {
    fate: "standing",
    situation:
      "St. George closed in 2009 and merged with Our Lady of Perpetual Help into the newly constituted St. Casimir parish. Its former church remains standing within the Superior Farm nonprofit campus and is slated for rehabilitation as a community and food-education space.",
  },
  "sv-jurgio-philadelphia-pa": {
    fate: "repurposed_religious",
    situation:
      "St. George remained a distinct Lithuanian parish until its July 1, 2019 merger into the present St. John Paul II Parish. The Lithuanian parish identity ended, but the church remains an active Catholic worship site with a weekly Sunday Mass and the parish school remains on the campus.",
  },
  "sv-jurgio-rochester-ny": { fate: "repurposed_religious" },
  "sv-kazimiero-amsterdam-ny": {
    fate: "repurposed_religious",
    situation:
      "The Diocese of Albany closed St. Casimir around May 2009. The former church remains standing and is now used as the Five World Buddhas Temple.",
  },
  "sv-kazimiero-brockton-ma": {
    fate: "repurposed_religious",
    situation:
      "The Archdiocese of Boston closed St. Casimir in June 2008 and merged the community into St. Michael in Avon. The former church remains standing and is now used by Greater Generations Tabernacle.",
  },
  "sv-kazimiero-gary-in": {
    fate: "repurposed_religious",
    situation:
      "The Diocese of Gary closed St. Casimir in 1998. The former church and school remain standing and are now used by Power and Light Church of Gary, an independent Protestant congregation.",
  },
  "sv-kazimiero-pittston-pa": { fate: "repurposed_secular" },
  "sv-konstantino-oglesby-il": {
    fate: "repurposed_secular",
    situation:
      "St. Constantine closed in the 1953 consolidation that formed Holy Family Parish. The former church site at East Florence Street is now used as a Knights of Columbus hall.",
  },
  "sv-kryziaus-mount-carmel-pa": { fate: "repurposed_secular" },
  "sv-mykolo-bayonne-nj": {
    fate: "standing",
    situation:
      "The Lithuanian parish ended in a diocesan merger. The later Syriac Catholic cathedral use ended in 2022; the former church complex now stands vacant under a redevelopment plan, with a 2025 proposal seeking demolition for a mixed-use building.",
  },
  "sv-mykolo-scranton-pa": {
    fate: "standing",
    situation:
      "The Lithuanian parish identity ended, while the St. Michael FSSP personal parish continued in the building until September 28, 2025. That congregation relocated to St. Lucy's Church; the former Lithuanian church and rectory now stand vacant and are listed for sale.",
  },
  "sv-onos-spring-valley-il": {
    fate: "repurposed_religious",
    situation:
      "St. Anne closed around the late 1980s or early 1990s. Its former church remains standing and is now used by Templo Cristiano Asambleas de Dios, a Spanish-language Protestant congregation, not a Catholic parish.",
  },
  "sv-petro-detroit-mi": { fate: "repurposed_secular" },
  "sv-pranciskaus-lawrence-ma": { fate: "repurposed_secular" },
  "sv-vincento-de-paul-girardville-pa": {
    fate: "standing",
    situation:
      "St. Vincent de Paul merged into St. Charles Borromeo Parish in 2015. The Lithuanian-built church remained a worship site until its final Mass on January 5, 2026 and now stands vacant, with no announced buyer or reuse plan.",
  },
  "unnamed-lithuanian-parish-baltimore-md": {
    fate: "standing",
    situation:
      "The Lithuanian worshipping community at St. Alphonsus ended when its Lithuanian Mass was discontinued in 2017. The building remains an active Catholic church, now the National Shrine of St. Alphonsus and an FSSP personal parish, but it has no current Lithuanian liturgy.",
  },
};

const projected = [];
const caseFiles = readdirSync(
  new URL("../data/case-records/", import.meta.url),
)
  .filter((file) => file.endsWith(".json"))
  .sort();

for (const file of caseFiles) {
  const slug = file.replace(/\.json$/, "");
  const correction = corrections[slug];
  const situation = situations.parishes[slug];
  if (!situation) throw new Error(`Missing situation overlay for ${slug}.`);
  const caseRecord = read(`case-records/${slug}.json`);
  if (caseRecord.slug !== slug) {
    throw new Error(`Case-record slug mismatch for ${slug}.`);
  }
  if (!caseRecord.currentUse?.trim()) {
    throw new Error(`Case record ${slug} has no currentUse.`);
  }

  if (correction?.fate) situation.building_fate = correction.fate;
  situation.current_use = caseRecord.currentUse;
  if (correction?.situation) situation.situation = correction.situation;
  situation.current_record_as_of = caseRecord.asOf;
  situation.current_record_path = `data/case-records/${slug}.json`;

  const sources = [...(situation.sources ?? []), ...(caseRecord.sources ?? [])];
  const seen = new Set();
  situation.sources = sources.filter((source) => {
    const key = source.url ?? `${source.publisher ?? ""}|${source.title ?? ""}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  projected.push(slug);
}

// The Archdiocese of Philadelphia's own record and merger reporting establish
// St. George as a 1902-2019 parish. Keep the older 1920/2016 source readings,
// but select the official current record for public lifecycle fields.
const philadelphia = registry.parishes.find(
  (record) => record.slug === "george-philadelphia-pa",
);
if (!philadelphia) throw new Error("Missing george-philadelphia-pa.");
philadelphia.years.founded = [
  ...philadelphia.years.founded
    .filter((reading) => reading.source !== "archdiocese-of-philadelphia")
    .map((reading) => ({
    ...reading,
    selected: false,
    })),
  {
    value: "1902",
    source: "archdiocese-of-philadelphia",
    cite: "https://archphila.org/parish/st-george-philadelphia/",
    selected: true,
  },
];
philadelphia.years.closed = [
  ...philadelphia.years.closed
    .filter((reading) => reading.source !== "archdiocese-of-philadelphia")
    .map((reading) => ({
    ...reading,
    selected: false,
    })),
  {
    value: "2019",
    source: "archdiocese-of-philadelphia",
    cite: "https://archphila.org/parish/st-george-philadelphia/",
    selected: true,
  },
];
philadelphia.conflicts = [
  {
    field: "founded",
    variants: philadelphia.years.founded,
  },
  {
    field: "closed",
    variants: philadelphia.years.closed,
  },
];
philadelphia.lifecycle = {
  canonical_status: "merged",
  selected_founded_year: 1902,
  selected_closed_year: 2019,
  identity: "lost",
  confidence: "high",
};
philadelphia.adjudication = {
  date: "2026-07-31",
  cite: "data/case-records/sv-jurgio-philadelphia-pa.json",
  status: "verified-or-labeled",
};

registry.generated = "2026-07-31";
registry.registryRevision = {
  ...registry.registryRevision,
  version: 9,
  date: "2026-07-31",
  changelog: [
    ...(registry.registryRevision.changelog ?? []).filter(
      (entry) =>
        !entry.startsWith("Reconciled 25 public current-condition overlays") &&
        !entry.startsWith("Projected all 83 deep case records") &&
        !entry.startsWith("Corrected Philadelphia St. George") &&
        !entry.startsWith("Established case-record/overlay parity"),
    ),
    `Projected all ${projected.length} deep case records into the public current-condition layer; ${Object.keys(corrections).length} required a building-fate or situation correction.`,
    "Corrected Philadelphia St. George to the Archdiocese's official 1902-2019 parish lifecycle while preserving the older 1920/2016 readings as explicit conflicts.",
    "Established case-record/overlay parity as a blocking publication guard so researched building outcomes cannot regress to unknown or imply an active parish.",
  ],
  contentHash: "",
};
situations.generated = "2026-07-31";

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

const publicUS = registry.parishes.filter(
  (record) => record.public_census?.included,
);
const romanCatholic = publicUS.filter(
  (record) =>
    record.record_type === "parish" &&
    record.congregation_class === "roman_catholic",
);

const reportPath =
  "candidates/registry-revision-9-current-condition-2026-07-31.md";
const report = `# Registry Revision 9: current-condition reconciliation

**Audit date:** 2026-07-31

**Registry revision:** 9

## Result

This revision reconciles the public classifier overlay with the newer deep case records. It keeps parish lifecycle, Lithuanian identity, physical building fate, and current building use as separate facts.

- Research registry records: **${registry.parishes.length}**
- Public U.S. institutions: **${publicUS.length}**
- U.S. Roman Catholic parish institutions: **${romanCatholic.length}**
- Deep case records projected: **${projected.length}**
- Building-fate or situation corrections: **${Object.keys(corrections).length}**
- Public identity additions or deletions: **0**

## Corrections

${Object.keys(corrections).map((slug, index) => `${index + 1}. \`${slug}\` — present building fate or situation text corrected from \`data/case-records/${slug}.json\`.`).join("\n")}

All ${projected.length} deep case files now govern the public \`current_use\`
field and carry an explicit \`current_record_path\` and as-of date. The profile
continues to read the full case summary, chronology, gaps, and source ledger
directly from that case file.

## Lifecycle adjudication

Philadelphia St. George now publishes the Archdiocese of Philadelphia's official 1902-2019 parish lifecycle. The prior 1920 founding and 2016 merger readings remain visible as source conflicts. The church building remains an active worship site of St. John Paul II Parish; that building continuity does not make the former Lithuanian parish active.

## Guard

\`scripts/verify-case-overlay-parity.mjs\` blocks publication when a deep case file establishes a standing, converted, demolished, or for-sale building but the public overlay regresses to \`unknown\`, or when obvious present-use classifications conflict.
`;

const revisionEntry = {
  version: 9,
  date: "2026-07-31",
  registryRecords: registry.parishes.length,
  publicUSRecords: publicUS.length,
  usRomanCatholicParishes: romanCatholic.length,
  summary:
    "Reconciled deep case-file current conditions with the public overlay, corrected Philadelphia St. George to the official 1902-2019 lifecycle, and added a blocking case/overlay parity guard.",
  evidence: [
    `data/${reportPath}`,
    "data/public-institution-ledger.json",
  ],
};
if (reapplyingRevision9) revisions.revisions.splice(-1, 1, revisionEntry);
else revisions.revisions.push(revisionEntry);

write("registry-unified.json", registry, 1);
write("parish-situation.json", situations);
write("registry-revisions.json", revisions);
writeFileSync(new URL(`../data/${reportPath}`, import.meta.url), report);

console.log(
  `Applied Registry Revision 9: ${projected.length} case records projected, ${Object.keys(corrections).length} current-condition corrections; ${publicUS.length} public U.S. institutions; counts unchanged.`,
);
