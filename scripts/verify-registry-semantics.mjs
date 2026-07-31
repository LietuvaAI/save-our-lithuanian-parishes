// Permanent guard for Registry Revision 6 public scope and source lineage.
//
// The canonical-identity guards protect the locked 82. This guard protects
// the surrounding registry from becoming countable merely because a source
// seed, historical attempt, or contextual mention was shaped like a parish
// row during extraction.
import { readFileSync } from "node:fs";

const registryData = JSON.parse(
  readFileSync(new URL("../data/registry-unified.json", import.meta.url), "utf8"),
);
const records = registryData.parishes;
const bySlug = new Map(records.map((record) => [record.slug, record]));
const errors = [];

const publicTypes = new Set(["parish", "misija", "congregation"]);
const researchOnlyTypes = new Set(["phase", "lead", "context"]);
const allowedTypes = new Set([...publicTypes, ...researchOnlyTypes]);
const isInstitution = (record) => publicTypes.has(record.record_type);
const requireRecord = (slug) => {
  const record = bySlug.get(slug);
  if (!record) errors.push(`${slug}: required record is missing`);
  return record;
};
const hasSource = (record, axis, pages) =>
  (record?.sources ?? []).some(
    (source) =>
      source.axis === axis &&
      (pages == null || String(source.pages ?? "").includes(pages)),
  );

for (const record of records) {
  if (!allowedTypes.has(record.record_type)) {
    errors.push(`${record.slug}: unsupported record_type ${record.record_type}`);
  }
  if (
    record.congregation_class !== "roman_catholic" &&
    record.diocese != null
  ) {
    errors.push(
      `${record.slug}: non-Roman record carries Roman diocese ${record.diocese}`,
    );
  }
  if (
    isInstitution(record) &&
    !(record.names?.lt?.trim() || record.names?.en?.trim())
  ) {
    errors.push(`${record.slug}: public record has no human-readable name`);
  }
  if (
    researchOnlyTypes.has(record.record_type) &&
    registryData.counts?.parishes === undefined
  ) {
    errors.push(`${record.slug}: research-only type exists without typed counts`);
  }
}

const duplicateGroups = [
  {
    canonical: "jesus-lawrence-ma",
    aliases: ["lawrence-lawrence-ma", "parish-lawrence-ma"],
  },
  {
    canonical: "joseph-scranton-pa",
    aliases: ["holyname-scranton-pa"],
  },
  {
    canonical: "providence-scranton-pa",
    aliases: ["parish-scranton-pa"],
  },
  {
    canonical: "ascension-pittsburgh-pa",
    aliases: ["ascension-pittsburgh-pa-2", "parish-pittsburgh-pa"],
  },
  {
    canonical: "motherofgod-maizeville-pa",
    aliases: ["louis-maizeville-pa", "parish-maizeville-pa"],
  },
  {
    canonical: "casimir-worcester-ma",
    aliases: ["parish-worcester-ma-2"],
  },
  {
    canonical: "annunciation-brooklyn-ny",
    aliases: ["annunciation-maspeth-ny"],
  },
  {
    canonical: "francis-east-chicago-in",
    aliases: ["francis-indian-harbor-in"],
  },
  {
    canonical: "st-joseph-mahanoy-city-pa",
    aliases: ["george-mahanoy-city-pa"],
  },
  {
    canonical: "mary-custer-mi",
    aliases: ["joseph-custer-mi"],
  },
  {
    canonical: "paul-esplen-pa",
    aliases: ["vincent-pittsburgh-pa"],
  },
];
for (const group of duplicateGroups) {
  const canonical = requireRecord(group.canonical);
  if (!canonical) continue;
  for (const alias of group.aliases) {
    if (bySlug.has(alias)) errors.push(`${alias}: duplicate shell returned`);
    if (!(canonical.aliases ?? []).includes(alias)) {
      errors.push(`${group.canonical}: missing retired alias ${alias}`);
    }
  }
}

const westPullman = requireRecord("ss-peter-and-paul-chicago-il");
const townOfLake = requireRecord("parish-chicago-il-2");
if (hasSource(westPullman, "wolkovich", "p.223")) {
  errors.push("ss-peter-and-paul-chicago-il: Town of Lake source reattached");
}
if (!hasSource(townOfLake, "wolkovich", "p.223")) {
  errors.push("parish-chicago-il-2: missing Town of Lake Wolkovich source");
}

const atholRoman = requireRecord("st-francis-athol-ma");
const atholAttempt = requireRecord("national-catholic-attempt-athol-ma");
if (hasSource(atholRoman, "michelsonas-1961", "130")) {
  errors.push("st-francis-athol-ma: failed National Catholic attempt reattached");
}
if (
  atholAttempt?.record_type !== "phase" ||
  !hasSource(atholAttempt, "michelsonas-1961", "130")
) {
  errors.push("national-catholic-attempt-athol-ma: separated phase is incomplete");
}

const raymond = requireRecord("raymond-baptist-chicago");
const torontoJohn = requireRecord("john-toronto-on");
const torontoLead = requireRecord("lithuanian-toronto-on");
const torontoResurrection = requireRecord("christ-toronto-on");
if (hasSource(raymond, "michelsonas-1961")) {
  errors.push("raymond-baptist-chicago: Toronto source reattached");
}
if ((raymond?.city_history ?? []).some((city) => /Toronto/i.test(city))) {
  errors.push("raymond-baptist-chicago: Toronto remains in city history");
}
if (!hasSource(torontoJohn, "michelsonas-1961", "425")) {
  errors.push("john-toronto-on: missing reassigned Michelsonas source");
}
if (hasSource(torontoLead, "michelsonas-1961")) {
  errors.push("lithuanian-toronto-on: Resurrection source reattached to lead");
}
if (
  torontoLead?.record_type !== "lead" ||
  torontoLead?.geo != null ||
  !hasSource(torontoResurrection, "michelsonas-1961", "427")
) {
  errors.push("Toronto lead/Resurrection source separation is incomplete");
}

const expectedClassifications = {
  "george-pittsburgh-pa": ["parish", "national_catholic_pncc"],
  "holycross-cleveland-oh": ["phase", "independent_catholic"],
  "holyname-philadelphia-pa": ["phase", "independent_catholic"],
  "joseph-cambridge-ma": ["parish", "independent_catholic"],
  "mary-chicago-il": ["parish", "independent_catholic"],
  "parish-chicago-il": ["phase", "non_catholic_christian"],
  "bukauskas-independent-chicago": ["phase", "independent_catholic"],
  "jonistai-chicago": ["context", "independent_catholic"],
  "springfield-independent": ["congregation", "independent_catholic"],
  "parish-mt-pleasant-pa": ["context", "roman_catholic"],
  "parish-scottville-mi": ["lead", "roman_catholic"],
  "parish-grand-prairie-ar": ["misija", "roman_catholic"],
  "cong-lithuanian-evangelical-luthera": [
    "lead",
    "non_catholic_christian",
  ],
  "parish-chicago-il-3": ["lead", "roman_catholic"],
  "trinity-new-york-ny": ["phase", "roman_catholic"],
  "holycross-brooklyn-ny": ["parish", "independent_catholic"],
};
for (const [slug, [recordType, congregationClass]] of Object.entries(
  expectedClassifications,
)) {
  const record = requireRecord(slug);
  if (!record) continue;
  if (
    record.record_type !== recordType ||
    record.congregation_class !== congregationClass
  ) {
    errors.push(
      `${slug}: expected ${recordType}/${congregationClass}, found ${record.record_type}/${record.congregation_class}`,
    );
  }
}

const expectedCounts = {
  records: records.length,
  parishes: records.filter((record) => record.record_type === "parish").length,
  phases: records.filter((record) => record.record_type === "phase").length,
  missions: records.filter((record) => record.record_type === "misija").length,
  congregations: records.filter(
    (record) => record.record_type === "congregation",
  ).length,
  leads: records.filter((record) => record.record_type === "lead").length,
  context: records.filter((record) => record.record_type === "context").length,
};
for (const [field, expected] of Object.entries(expectedCounts)) {
  if (registryData.counts?.[field] !== expected) {
    errors.push(
      `registry counts.${field}=${registryData.counts?.[field]}, expected ${expected}`,
    );
  }
}

const usPublic = records.filter((record) => record.public_census?.included);
const usRomanParishes = usPublic.filter(
  (record) =>
    record.record_type === "parish" &&
    record.congregation_class === "roman_catholic",
);
const jurisdictionNames = new Map();
for (const record of usRomanParishes) {
  if (!record.diocese) continue;
  const shortName = record.diocese
    .replace(/^(?:arch)?diocese of /i, "")
    .trim()
    .toLocaleLowerCase("en-US");
  const variants = jurisdictionNames.get(shortName) ?? new Set();
  variants.add(record.diocese);
  jurisdictionNames.set(shortName, variants);
}
for (const [shortName, variants] of jurisdictionNames) {
  if (variants.size > 1) {
    errors.push(
      `jurisdiction ${shortName}: conflicting present-day labels ${[
        ...variants,
      ].join(" / ")}`,
    );
  }
}
const waterburyJoseph = requireRecord("joseph-waterbury-ct");
if (waterburyJoseph?.diocese !== "Archdiocese of Hartford") {
  errors.push(
    `joseph-waterbury-ct: expected current Archdiocese of Hartford governance, found ${waterburyJoseph?.diocese ?? "none"}`,
  );
}
const expectedJurisdictions = {
  "anthony-philadelphia-pa": "Archdiocese of Philadelphia",
  "mary-custer-mi": "Diocese of Grand Rapids",
  "ss-peter-and-paul-hazleton-pa": "Diocese of Scranton",
};
for (const [slug, expectedDiocese] of Object.entries(expectedJurisdictions)) {
  const record = requireRecord(slug);
  if (record?.diocese !== expectedDiocese) {
    errors.push(
      `${slug}: expected ${expectedDiocese}, found ${record?.diocese ?? "none"}`,
    );
  }
}
const expectedResearchOnly = {
  "trinity-new-york-ny": "phase",
  "parish-baltimore-md": "phase",
  "jonistai-chicago": "context",
  "lithuanian-church-chester-pa": "lead",
};
for (const [slug, expectedType] of Object.entries(expectedResearchOnly)) {
  const record = requireRecord(slug);
  if (record?.record_type !== expectedType || record?.public_census?.included) {
    errors.push(
      `${slug}: expected research-only ${expectedType}, found ${record?.record_type}/${record?.public_census?.scope}`,
    );
  }
}
const brooklynHolyCross = requireRecord("holycross-brooklyn-ny");
if (brooklynHolyCross?.congregation_class !== "independent_catholic") {
  errors.push(
    `holycross-brooklyn-ny: expected independent_catholic, found ${brooklynHolyCross?.congregation_class}`,
  );
}
for (const slug of ["parish-avellaneda-ar", "casimir-rosario-ar"]) {
  const record = requireRecord(slug);
  if (record?.country !== "AR" || record?.public_census?.scope !== "international_institution") {
    errors.push(
      `${slug}: expected AR international institution scope, found ${record?.country}/${record?.public_census?.scope}`,
    );
  }
}
if (
  usRomanParishes.some(
    (record) =>
      record.record_type !== "parish" ||
      record.congregation_class !== "roman_catholic",
  )
) {
  errors.push("Roman Catholic parish scope admitted a non-parish record");
}

if (errors.length) {
  console.error(`REGISTRY SEMANTICS VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  `OK: Registry Revision ${registryData.registryRevision.version} semantics — ${usPublic.length} public U.S. records, ${usRomanParishes.length} U.S. Roman Catholic parishes, source joins and research-only scope locked.`,
);
