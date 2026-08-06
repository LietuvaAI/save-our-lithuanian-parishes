// Release guard for the fully audited case-filed source cohort.
// Brain's publication and display releases own identity. This guard verifies
// that every frozen source row still has its case file, resolved duplicate
// shells cannot return, and imported display metadata agrees with those joins.
import {
  readFileSync,
  readdirSync,
} from "node:fs";
import { parse } from "csv-parse/sync";

const readData = (name) =>
  JSON.parse(
    readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"),
  );
const registryData = readData("registry-unified.json");
const registry = registryData.parishes;
const core = readData("parishes.json");
const situations = readData("parish-situation.json").parishes;
const sourceRows = parse(
  readFileSync(new URL("../data/parishes.csv", import.meta.url)),
  {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  },
);
const errors = [];

const LT_MAP = {
  ą: "a",
  č: "c",
  ę: "e",
  ė: "e",
  į: "i",
  š: "s",
  ų: "u",
  ū: "u",
  ž: "z",
};
const slugify = (...parts) =>
  parts
    .join(" ")
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (character) => LT_MAP[character])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const registryBySlug = new Map(
  registry.map((record) => [record.slug, record]),
);
const coreBySlug = new Map(core.map((parish) => [parish.slug, parish]));
const caseDirectory = new URL("../data/case-records/", import.meta.url);
const caseFiles = readdirSync(caseDirectory)
  .filter((name) => name.endsWith(".json"))
  .sort();
const caseBySlug = new Map();
for (const name of caseFiles) {
  const record = JSON.parse(readFileSync(new URL(name, caseDirectory), "utf8"));
  const filenameSlug = name.replace(/\.json$/, "");
  if (record.slug !== filenameSlug) {
    errors.push(
      `${name}: internal case slug ${JSON.stringify(record.slug)} does not match filename`,
    );
  }
  if (!record.summary?.trim()) errors.push(`${name}: missing case summary`);
  if (!Array.isArray(record.sources) || record.sources.length === 0) {
    errors.push(`${name}: missing case sources`);
  }
  if (caseBySlug.has(record.slug)) {
    errors.push(`${name}: duplicate case slug ${record.slug}`);
  }
  caseBySlug.set(record.slug, record);
}

const usRows = sourceRows.slice(0, 83);
if (sourceRows.length !== 86 || usRows.length !== 83) {
  errors.push(
    `frozen source snapshot must contain 83 U.S. rows plus 3 comparators; found ${sourceRows.length}`,
  );
}
const expectedCaseSlugs = usRows.map((row) =>
  slugify(row.parish, row.city, row.state),
);
if (caseFiles.length !== expectedCaseSlugs.length) {
  errors.push(
    `case-file count changed: expected ${expectedCaseSlugs.length}, found ${caseFiles.length}`,
  );
}
for (const slug of expectedCaseSlugs) {
  if (!caseBySlug.has(slug)) errors.push(`${slug}: frozen source row lacks a case file`);
}
for (const slug of caseBySlug.keys()) {
  if (!expectedCaseSlugs.includes(slug)) {
    errors.push(`${slug}: case file is not attached to a frozen U.S. source row`);
  }
}

const canonicalCore = core.filter(
  (parish) => parish.country === "US" && !parish.mergedInto,
);
if (canonicalCore.length !== 82) {
  errors.push(`expected 82 canonical U.S. profiles, found ${canonicalCore.length}`);
}
const identityRows = canonicalCore
  .flatMap((identity) => identity.c83Rows ?? [])
  .sort((left, right) => left - right);
if (
  identityRows.length !== 83 ||
  identityRows.some((row, index) => row !== index + 1)
) {
  errors.push("Brain-imported canonical profiles do not cover frozen C83 rows 1-83 exactly");
}
const mergedIdentities = canonicalCore.filter(
  (identity) => (identity.c83Rows ?? []).length > 1,
);
if (
  mergedIdentities.length !== 1 ||
  JSON.stringify(mergedIdentities[0].c83Rows) !== JSON.stringify([32, 76])
) {
  errors.push(
    "Waterbury St. Joseph rows 32 and 76 must remain the sole intentional source-row merge",
  );
}

const aliasOwner = new Map();
for (const record of registry) {
  for (const alias of record.aliases ?? []) {
    if (registryBySlug.has(alias)) {
      errors.push(
        `${record.slug}: alias ${alias} also exists as an active registry row`,
      );
    }
    const existing = aliasOwner.get(alias);
    if (existing && existing !== record.slug) {
      errors.push(`${alias}: alias collision between ${existing} and ${record.slug}`);
    }
    aliasOwner.set(alias, record.slug);
  }
}

const resolvedJoins = [
  {
    row: 13,
    registrySlug: "st-casimir-kansas-city-ks",
    nameLt: "Šv. Kazimiero",
    state: "KS",
    aliases: [
      "casimir-kansas-city-mo",
      "casimir-kansas-city-ka",
      "casimir-kansas-city-ks",
    ],
  },
  {
    row: 27,
    registrySlug: "holy-trinity-newark-nj",
    nameLt: "Švč. Trejybės",
    state: "NJ",
    aliases: ["holyname-newark-nj"],
  },
  {
    row: 31,
    registrySlug: "st-anthony-ansonia-ct",
    nameLt: "Šv. Antano",
    state: "CT",
    aliases: ["holyname-ansonia-ct"],
  },
  {
    row: 83,
    registrySlug: "parish-collinsville-il",
    nameLt: "Jeruzalės liuteronų parapija",
    state: "IL",
    aliases: [],
  },
];
for (const expected of resolvedJoins) {
  const identity = canonicalCore.find((entry) =>
    (entry.c83Rows ?? []).includes(expected.row),
  );
  if (!identity) {
    errors.push(`C83 row ${expected.row}: audited identity is missing`);
    continue;
  }
  for (const field of ["registrySlug", "nameLt", "state"]) {
    if (identity[field] !== expected[field]) {
      errors.push(
        `C83 row ${expected.row}: ${field} must remain ${JSON.stringify(expected[field])}`,
      );
    }
  }
  const record = registryBySlug.get(expected.registrySlug);
  if (!record) {
    errors.push(`C83 row ${expected.row}: registry record is missing`);
    continue;
  }
  for (const alias of expected.aliases) {
    if (!(record.aliases ?? []).includes(alias)) {
      errors.push(`${record.slug}: missing retired registry alias ${alias}`);
    }
  }
}

for (const identity of canonicalCore) {
  if (/\(unnamed\)/i.test(identity.nameLt)) {
    errors.push(
      `${identity.slug}: audited canonical identity reverted to an unnamed label`,
    );
  }
  const profile = coreBySlug.get(identity.slug);
  if (!profile) {
    errors.push(`${identity.slug}: canonical profile is missing`);
    continue;
  }
  const overlay = situations[identity.slug];
  if (!overlay) {
    errors.push(`${identity.slug}: situation overlay is missing`);
  } else if (overlay.registry_slug !== identity.registrySlug) {
    errors.push(
      `${identity.slug}: overlay points to ${overlay.registry_slug}, expected ${identity.registrySlug}`,
    );
  }
}

const expectedCounts = {
  records: registry.length,
  parishes: registry.filter((record) => record.record_type === "parish").length,
  phases: registry.filter((record) => record.record_type === "phase").length,
  missions: registry.filter((record) => record.record_type === "misija").length,
  congregations: registry.filter(
    (record) => record.record_type === "congregation",
  ).length,
  leads: registry.filter((record) => record.record_type === "lead").length,
  context: registry.filter((record) => record.record_type === "context").length,
  case_filed: registry
    .filter((record) => record.country === "US")
    .flatMap((record) => record.c83_rows ?? [])
    .filter((row) => row >= 1 && row <= 83).length,
  case_filed_records: registry.filter(
    (record) =>
      record.country === "US" &&
      (record.c83_rows ?? []).some((row) => row >= 1 && row <= 83),
  ).length,
  multi_source: registry.filter(
    (record) => record.record_depth === "multi-source",
  ).length,
  single_source: registry.filter(
    (record) => record.record_depth === "single-source",
  ).length,
  with_exact_geo: registry.filter(
    (record) => record.geo?.precision === "exact",
  ).length,
  with_city_geo: registry.filter(
    (record) => record.geo?.precision === "city-centroid",
  ).length,
  needs_geocode: registry.filter((record) => record.geo?.needs_geocode).length,
};
for (const [field, actual] of Object.entries(expectedCounts)) {
  if (registryData.counts[field] !== actual) {
    errors.push(
      `registry count ${field} is stale: embedded=${registryData.counts[field]}, actual=${actual}`,
    );
  }
}

if (errors.length) {
  console.error(`CANONICAL RELEASE VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  `OK: 83 frozen source rows -> 83 sourced case files -> 82 canonical identities; 0 unresolved identity exceptions; Registry Revision ${registryData.registryRevision.version}.`,
);
