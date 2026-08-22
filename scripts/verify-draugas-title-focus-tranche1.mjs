import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const readJson = (relativePath) =>
  JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const projection = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche1.json",
);
const held = readJson(
  "data/canonical-draugas-parish-centered-title-focus-tranche1-held.json",
);
const publication = readJson("data/canonical-publication-projection.json");
const errors = [];

const expected = [
  [
    "solp:draugas-newspaper-record:draugas-1952-11-01-p8-st-george-norwood-ma",
    "candidate-page:draugas-parish-centered-1:norwood:1952-11-01-p8",
    "cn:institution:st-george-norwood-ma",
    "/parishes/sv-jurgio-norwood-ma",
    "Gražiai išdekoruota bažnyčia",
    "Draugas, 1952-11-01, p. 8",
    "https://www.draugas.org/archive/1952_reg/1952-11-01-PRIEDAS-DRAUGAS.pdf#page=8",
    "core_parish_reference",
    null,
  ],
  [
    "solp:draugas-newspaper-record:draugas-1986-10-01-p4-st-george-norwood-ma",
    "candidate-page:draugas-parish-centered-1:norwood:1986-10-01-p4",
    "cn:institution:st-george-norwood-ma",
    "/parishes/sv-jurgio-norwood-ma",
    "ETNOGRAFINIS ANSAMBLIS",
    "Draugas, 1986-10-01, p. 4",
    "https://www.draugas.org/archive/1986_reg/1986-10-01-DRAUGAS-i7-8.pdf#page=4",
    "supplemental_reference",
    "Supplemental",
  ],
  [
    "solp:draugas-newspaper-record:draugas-2007-08-09-p4-st-george-norwood-ma",
    "candidate-page:draugas-parish-centered-1:norwood:2007-08-09-p4",
    "cn:institution:st-george-norwood-ma",
    "/parishes/sv-jurgio-norwood-ma",
    "NEJAUGI LIETUVIAI NEKOVOJO UŽ SAVO TURTĄ?",
    "Draugas, 2007-08-09, p. 4",
    "https://www.draugas.org/archive/2007_reg/2007-08-09-DRAUGAS-i13-16.pdf#page=4",
    "core_parish_reference",
    null,
  ],
  [
    "solp:draugas-newspaper-record:draugas-1941-03-22-p2-st-george-norwood-ma",
    "candidate-page:draugas-parish-centered-1:norwood:1941-03-22-p2",
    "cn:institution:st-george-norwood-ma",
    "/parishes/sv-jurgio-norwood-ma",
    "TT. Marijonų Misijos Gavėnios Metu",
    "Draugas, 1941-03-22, p. 2",
    "https://www.draugas.org/archive/1941_reg/1941-03-22-DRAUGASo.pdf#page=2",
    "supplemental_reference",
    "Supplemental",
  ],
  [
    "solp:draugas-newspaper-record:draugas-1940-10-14-p8-st-george-bridgeport-chicago-il",
    "candidate-page:draugas-parish-centered-1:chicago:1940-10-14-p8",
    "cn:institution:st-george-bridgeport-chicago-il",
    "/parishes/sv-jurgio-chicago-il",
    "Ruošias Auksiniam Parapijos Jubiliejui",
    "Draugas, 1940-10-14, p. 8",
    "https://www.draugas.org/archive/1940_reg/1940-10-14-DRAUGAS.pdf#page=8",
    "core_parish_reference",
    null,
  ],
  [
    "solp:draugas-newspaper-record:draugas-1942-02-23-p6-st-george-bridgeport-chicago-il",
    "candidate-page:draugas-parish-centered-1:chicago:1942-02-23-p6",
    "cn:institution:st-george-bridgeport-chicago-il",
    "/parishes/sv-jurgio-chicago-il",
    "Aplink Mus",
    "Draugas, 1942-02-23, p. 6",
    "https://www.draugas.org/archive/1942_reg/1942-02-23-DRAUGASw-i7-8.pdf#page=6",
    "supplemental_reference",
    "Supplemental",
  ],
  [
    "solp:draugas-newspaper-record:draugas-1941-04-11-p2-st-george-bridgeport-chicago-il",
    "candidate-page:draugas-parish-centered-1:chicago:1941-04-11-p2",
    "cn:institution:st-george-bridgeport-chicago-il",
    "/parishes/sv-jurgio-chicago-il",
    "DETROITO LIETUVIAI MINĖS „DRAUGO“ - DIENR. 25 M. JUBILIEJŲ",
    "Draugas, 1941-04-11, p. 2",
    "https://www.draugas.org/archive/1941_reg/1941-04-11-DRAUGASw.pdf#page=2",
    "supplemental_reference",
    "Supplemental",
  ],
  [
    "solp:draugas-newspaper-record:draugas-1954-07-07-p5-st-george-lithuanian-rochester-ny",
    "candidate-page:draugas-parish-centered-1:rochester:1954-07-07-p5",
    "cn:institution:st-george-lithuanian-rochester-ny",
    "/parishes/sv-jurgio-rochester-ny",
    "Rochester, N. Y.",
    "Draugas, 1954-07-07, p. 5",
    "https://www.draugas.org/archive/1954_reg/1954-07-07-DRAUGAS.pdf#page=5",
    "core_parish_reference",
    null,
  ],
  [
    "solp:draugas-newspaper-record:draugas-1970-07-06-p2-st-george-lithuanian-rochester-ny",
    "candidate-page:draugas-parish-centered-1:rochester:1970-07-06-p2",
    "cn:institution:st-george-lithuanian-rochester-ny",
    "/parishes/sv-jurgio-rochester-ny",
    "PUSŠIMTINIS KUN. JONO BAKŠIO KUNIGYSTĖS JUBILIEJUS",
    "Draugas, 1970-07-06, p. 2",
    "https://www.draugas.org/archive/1970_reg/1970-07-06-DRAUGAS-i7-8.pdf#page=2",
    "core_parish_reference",
    null,
  ],
  [
    "solp:draugas-newspaper-record:draugas-1949-05-27-p5-st-george-lithuanian-rochester-ny",
    "candidate-page:draugas-parish-centered-1:rochester:1949-05-27-p5",
    "cn:institution:st-george-lithuanian-rochester-ny",
    "/parishes/sv-jurgio-rochester-ny",
    "SODALIEČIŲ ŠVENTĖ",
    "Draugas, 1949-05-27, p. 5",
    "https://www.draugas.org/archive/1949_reg/1949-05-27-DRAUGAS.pdf#page=5",
    "supplemental_reference",
    "Supplemental",
  ],
  [
    "solp:draugas-newspaper-record:draugas-1944-12-21-p4-st-george-shenandoah-pa",
    "candidate-page:draugas-parish-centered-1:shenandoah:1944-12-21-p4",
    "cn:institution:st-george-shenandoah-pa",
    "/parishes/sv-jurgio-shenandoah-pa",
    "Kun. J. A. Karaliaus jubiliejus",
    "Draugas, 1944-12-21, p. 4",
    "https://www.draugas.org/archive/1944_reg/1944-12-21-DRAUGASw.pdf#page=4",
    "core_parish_reference",
    null,
  ],
];

const fields = [
  "record_id",
  "candidate_page_id",
  "canonical_entity_id",
  "public_profile",
  "display_title",
  "citation_label",
  "page_url",
  "public_display_class",
  "badge_label",
];
const expectedHeldIds = [
  "candidate-page:draugas-parish-centered-1:chicago:1955-08-12-p4",
  "candidate-page:draugas-parish-centered-1:shenandoah:1953-08-15-p5",
  "candidate-page:draugas-parish-centered-1:shenandoah:1956-08-16-p4",
];

const sortValue = (value) => {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortValue(child)]),
    );
  }
  return value;
};
const contentHash = (value) => {
  const input = structuredClone(value);
  delete input.content_hash_sha256;
  return createHash("sha256")
    .update(`${JSON.stringify(sortValue(input))}\n`)
    .digest("hex");
};

if (
  projection.content_hash_sha256 !==
    "b424efefe2131d8c940a9dfb4b795c1d203d0decb9aaf233e404fbd664e8e577" ||
  projection.content_hash_sha256 !== contentHash(projection)
) {
  errors.push("title-focus public record-set hash does not match Brain #539");
}
if (
  held.content_hash_sha256 !==
    "b44a20a754ba8dee8266557d74d76efed81324c39d7651840476d13c241f9101" ||
  held.content_hash_sha256 !== contentHash(held)
) {
  errors.push("title-focus held-disposition hash does not match Brain #539");
}
if (
  projection.schema_version !==
  "culturenet-solp-draugas-parish-centered-title-focus-public-record-set-v1"
) {
  errors.push("unexpected title-focus public record-set schema");
}
if (
  held.schema_version !==
  "culturenet-draugas-parish-centered-title-focus-held-dispositions-v1"
) {
  errors.push("unexpected title-focus held-disposition schema");
}
if (projection.records?.length !== 11 || expected.length !== 11) {
  errors.push(`expected exactly 11 public records; got ${projection.records?.length}`);
}

const publicationByEntity = new Map(
  publication.public_institutions.map((row) => [row.culturenet_entity_id, row]),
);
const seenIds = new Set();
for (const [index, expectedValues] of expected.entries()) {
  const record = projection.records?.[index];
  if (!record) continue;
  if (seenIds.has(record.record_id)) errors.push(`duplicate record ${record.record_id}`);
  seenIds.add(record.record_id);
  fields.forEach((field, fieldIndex) => {
    if (record[field] !== expectedValues[fieldIndex]) {
      errors.push(`${record.record_id}: ${field} drifted from Brain #539`);
    }
  });
  const institution = publicationByEntity.get(record.canonical_entity_id);
  if (!institution || institution.public_profile !== record.public_profile) {
    errors.push(`${record.record_id}: canonical entity/public profile join drifted`);
  }
  if (
    record.rights?.quote_policy !== "citation_metadata_only" ||
    record.rights?.public_release_allowed !== true ||
    record.rights?.raw_text_allowed_in_git !== false ||
    record.historical_claim_adjudication_state !== "not_adjudicated"
  ) {
    errors.push(`${record.record_id}: citation-only or claim gate drifted`);
  }
  try {
    const url = new URL(record.page_url);
    if (
      url.hostname.replace(/^www\./, "") !== "draugas.org" ||
      url.hash !== `#page=${record.pdf_page}`
    ) {
      errors.push(`${record.record_id}: exact page link drifted`);
    }
  } catch {
    errors.push(`${record.record_id}: invalid page URL`);
  }
}

const counts = Object.fromEntries(
  Object.entries({
    "/parishes/sv-jurgio-norwood-ma": 4,
    "/parishes/sv-jurgio-chicago-il": 3,
    "/parishes/sv-jurgio-rochester-ny": 3,
    "/parishes/sv-jurgio-shenandoah-pa": 1,
  }).map(([profile, expectedCount]) => [
    profile,
    [
      projection.records.filter((record) => record.public_profile === profile).length,
      expectedCount,
    ],
  ]),
);
for (const [profile, [actual, expectedCount]] of Object.entries(counts)) {
  if (actual !== expectedCount) errors.push(`${profile}: ${actual} != ${expectedCount}`);
}
if (
  projection.records.filter(
    (record) => record.public_display_class === "core_parish_reference",
  ).length !== 6 ||
  projection.records.filter(
    (record) => record.public_display_class === "supplemental_reference",
  ).length !== 5 ||
  projection.records.filter((record) => record.badge_label === "Supplemental")
    .length !== 5
) {
  errors.push("6 core / 5 Supplemental classification contract drifted");
}

if (
  JSON.stringify(projection.held_candidate_page_ids) !==
    JSON.stringify(expectedHeldIds) ||
  JSON.stringify(held.held_candidate_page_ids) !== JSON.stringify(expectedHeldIds) ||
  held.held_dispositions?.length !== 3
) {
  errors.push("three held candidates drifted");
}
const publicCandidateIds = new Set(
  projection.records.map((record) => record.candidate_page_id),
);
for (const disposition of held.held_dispositions ?? []) {
  if (
    publicCandidateIds.has(disposition.candidate_page_id) ||
    disposition.public_record_created !== false ||
    disposition.disposition_state !== "held_collision_or_focus_uncertain"
  ) {
    errors.push(`${disposition.candidate_page_id}: held row entered public display`);
  }
}

const forbiddenKeys = new Set([
  "excerpt",
  "contextual_excerpt",
  "quoted_text",
  "ocr_text",
  "page_text",
  "source_prose",
  "claims",
  "assertions",
  "relationships",
  "canonical_entities",
  "sacred_core_payload",
]);
const walk = (value, path = "projection") => {
  if (Array.isArray(value)) return value.forEach((child, index) => walk(child, `${path}[${index}]`));
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) errors.push(`${path}.${key}: forbidden display payload`);
    walk(child, `${path}.${key}`);
  }
};
walk(projection);

const importer = readFileSync(join(root, "scripts/import-brain-projections.mjs"), "utf8");
const loader = readFileSync(join(root, "lib/draugas-newspaper-records.ts"), "utf8");
const ledger = readFileSync(join(root, "components/ProfileSourceLedger.tsx"), "utf8");
for (const required of [
  "draugas-parish-centered-title-focus-tranche1-2026-08-16/record-set.json",
  "draugas-parish-centered-title-focus-tranche1-2026-08-16/held-dispositions.json",
]) {
  if (!importer.includes(required)) errors.push(`importer is missing ${required}`);
}
for (const [source, required] of [
  [loader, "referenceClass: record.public_display_class"],
  [loader, "badgeLabel: record.badge_label ?? undefined"],
  [loader, "supplementalReason: record.supplemental_reason ?? undefined"],
  [loader, "identityKey(record.canonicalEntityId, record.publicProfile)"],
  [ledger, 'referenceClass === "supplemental_reference"'],
  [ledger, "{source.badgeLabel}"],
  [ledger, "source.supplementalReason"],
]) {
  if (!source.includes(required)) errors.push(`display contract is missing ${required}`);
}
for (const forbidden of ["reviewed_topic_targets"]) {
  if (loader.includes(forbidden)) {
    errors.push(`consumer must not infer public class from ${forbidden}`);
  }
}

for (const relativePath of [
  "app/page.tsx",
  "app/parishes/page.tsx",
  "app/lithuanian-catholic-life-today/page.tsx",
  "components/AllProfilesDirectory.tsx",
  "components/AllProfilesTimeline.tsx",
  "lib/living-network-view.ts",
]) {
  const source = readFileSync(join(root, relativePath), "utf8");
  for (const forbidden of [
    "canonical-draugas-parish-centered-title-focus-tranche1",
    "titleFocusData",
    "titleFocusHeldData",
  ]) {
    if (source.includes(forbidden)) {
      errors.push(`${relativePath}: title-focus records escaped parish source ledger`);
    }
  }
}

if (errors.length) {
  console.error(`DRAUGAS TITLE-FOCUS VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(
  "OK: 11 Brain-governed Draugas title-focus records (6 core, 5 Supplemental) join only to four parish newspaper ledgers; 3 held rows remain absent.",
);
