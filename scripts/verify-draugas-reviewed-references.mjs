import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const readJson = (relativePath) =>
  JSON.parse(readFileSync(join(root, relativePath), "utf8"));
const projection = readJson("data/canonical-draugas-newspaper-records.json");
const publication = readJson("data/canonical-publication-projection.json");
const errors = [];

const expected = [
  {
    source_record_id:
      "solp:draugas-newspaper-record:draugas-1932-04-09-p2-st-george-chicago-il",
    canonical_entity_id: "cn:institution:st-george-bridgeport-chicago-il",
    public_profile: "/parishes/sv-jurgio-chicago-il",
    issue_date: "1932-04-09",
    pdf_page: 2,
    display_title: "Šv. Jurgio par. Chicagoj 40 m. gyvavimo sukaktį minint",
    citation_label: "Draugas, 1932-04-09, p. 2",
    page_url:
      "https://www.draugas.org/archive/1932_reg/1932-04-09-DRAUGASw.pdf#page=2",
  },
  {
    source_record_id:
      "solp:draugas-newspaper-record:draugas-1987-04-24-p4-st-george-norwood-ma",
    canonical_entity_id: "cn:institution:st-george-norwood-ma",
    public_profile: "/parishes/sv-jurgio-norwood-ma",
    issue_date: "1987-04-24",
    pdf_page: 4,
    display_title: "DAIVOS MONGIRDAITĖS KONCERTAS",
    citation_label: "Draugas, 1987-04-24, p. 4",
    page_url:
      "https://www.draugas.org/archive/1987_reg/1987-04-24-DRAUGAS-i7-8.pdf#page=4",
  },
  {
    source_record_id:
      "solp:draugas-newspaper-record:draugas-1941-10-28-p2-st-george-rochester-ny",
    canonical_entity_id: "cn:institution:st-george-lithuanian-rochester-ny",
    public_profile: "/parishes/sv-jurgio-rochester-ny",
    issue_date: "1941-10-28",
    pdf_page: 2,
    display_title: "Paminėta Parapijos 35 Metų Sukaktis",
    citation_label: "Draugas, 1941-10-28, p. 2",
    page_url:
      "https://www.draugas.org/archive/1941_reg/1941-10-28-DRAUGASw.pdf#page=2",
  },
  {
    source_record_id:
      "solp:draugas-newspaper-record:draugas-2007-10-25-p5-st-george-shenandoah-pa-correction",
    canonical_entity_id: "cn:institution:st-george-shenandoah-pa",
    public_profile: "/parishes/sv-jurgio-shenandoah-pa",
    issue_date: "2007-10-25",
    pdf_page: 5,
    display_title: "KLAIDŲ ATITAISYMAS",
    citation_label: "Draugas, 2007-10-25, p. 5",
    page_url:
      "https://www.draugas.org/archive/2007_reg/2007-10-25-DRAUGAS-i13-16.pdf#page=5",
  },
  {
    source_record_id:
      "solp:draugas-newspaper-record:draugas-1941-11-03-p2-st-george-shenandoah-pa",
    canonical_entity_id: "cn:institution:st-george-shenandoah-pa",
    public_profile: "/parishes/sv-jurgio-shenandoah-pa",
    issue_date: "1941-11-03",
    pdf_page: 2,
    display_title:
      "Šv. Jurgio Parapija, Shenandoah, Pa., Iškilmingai Atšventė Auksinį Jubiliejų",
    citation_label: "Draugas, 1941-11-03, p. 2",
    page_url:
      "https://www.draugas.org/archive/1941_reg/1941-11-03-DRAUGASw.pdf#page=2",
  },
  {
    source_record_id:
      "solp:draugas-newspaper-record:draugas-2007-03-03-p1-st-george-shenandoah-pa",
    canonical_entity_id: "cn:institution:st-george-shenandoah-pa",
    public_profile: "/parishes/sv-jurgio-shenandoah-pa",
    issue_date: "2007-03-03",
    pdf_page: 1,
    display_title:
      "Sunerimę čikagiškiai reaguos į lietuviškų bažnyčių uždarymą",
    citation_label: "Draugas, 2007-03-03, p. 1",
    page_url:
      "https://www.draugas.org/archive/2007_reg/2007-03-03-DRAUGAS.pdf#page=1",
  },
  {
    source_record_id:
      "solp:draugas-newspaper-record:draugas-2007-03-03-p6-st-george-shenandoah-pa-resolutions",
    canonical_entity_id: "cn:institution:st-george-shenandoah-pa",
    public_profile: "/parishes/sv-jurgio-shenandoah-pa",
    issue_date: "2007-03-03",
    pdf_page: 6,
    display_title: "Lietuviškų organizacijų atstovų posėdyje priimtos rezoliucijos",
    citation_label: "Draugas, 2007-03-03, p. 6",
    page_url:
      "https://www.draugas.org/archive/2007_reg/2007-03-03-DRAUGAS.pdf#page=6",
  },
  {
    source_record_id:
      "solp:draugas-newspaper-record:draugas-2008-03-27-p4-st-george-shenandoah-pa",
    canonical_entity_id: "cn:institution:st-george-shenandoah-pa",
    public_profile: "/parishes/sv-jurgio-shenandoah-pa",
    issue_date: "2008-03-27",
    pdf_page: 4,
    display_title: "Ar bus uždaryta dar viena lietuviška bažnyčia JAV?",
    citation_label: "Draugas, 2008-03-27, p. 4",
    page_url:
      "https://draugas.org/key/2008_reg/2008-03-27-DRAUGASo.pdf#page=4",
  },
  {
    source_record_id:
      "solp:draugas-newspaper-record:draugas-2009-10-27-p6-st-george-shenandoah-pa",
    canonical_entity_id: "cn:institution:st-george-shenandoah-pa",
    public_profile: "/parishes/sv-jurgio-shenandoah-pa",
    issue_date: "2009-10-27",
    pdf_page: 6,
    display_title: "Išeiviai aprauda bažnyčias",
    citation_label: "Draugas, 2009-10-27, p. 6",
    page_url:
      "https://draugas.org/key/2009_reg/2009-10-27-DRAUGASo.pdf#page=6",
  },
];

const expectedControls = {
  publication_allowed: true,
  solp_consumer_projection: true,
  solp_newspaper_display_allowed: true,
  solp_mutation_performed: false,
  canonical_evidence: false,
  assertion_admission_allowed: false,
  relationship_promotion_allowed: false,
  historical_claim_admission_allowed: false,
  sacred_core_write_allowed: false,
  contains_ocr_text: false,
  contains_page_text: false,
  contains_source_prose: false,
  contains_contextual_excerpts: false,
  contains_model_output: false,
  contains_raw_extraction_rows: false,
};
const forbiddenKeys = new Set([
  "contextual_excerpt",
  "contexts",
  "excerpt",
  "ocr_text",
  "page_text",
  "source_prose",
  "raw_ocr",
  "raw_extraction_rows",
  "model_output",
  "assertions",
  "relationships",
  "canonical_entities",
  "profile_evidence",
  "supports",
  "used_for",
  "claims",
  "solp_payload",
  "sacred_core_payload",
]);

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
const hashInput = structuredClone(projection);
delete hashInput.content_hash_sha256;
const contentHash = createHash("sha256")
  .update(`${JSON.stringify(sortValue(hashInput))}\n`)
  .digest("hex");
if (
  projection.content_hash_sha256 !==
    "143118db45388cb94c1421623e0139428751b6606626d5b51d5ea7b4a3b4e742" ||
  projection.content_hash_sha256 !== contentHash
) {
  errors.push(
    `Draugas newspaper projection hash mismatch: ${projection.content_hash_sha256} != ${contentHash}`,
  );
}

if (
  projection.schema_version !==
    "culturenet-solp-draugas-newspaper-projection-v1" ||
  projection.publication_state !==
    "reviewed_public_newspaper_metadata_projection"
) {
  errors.push("Draugas projection is not the reviewed newspaper metadata contract.");
}
if (JSON.stringify(projection.controls) !== JSON.stringify(expectedControls)) {
  errors.push("Draugas projection controls do not match the approved metadata-only gate.");
}
if (!Array.isArray(projection.records) || projection.records.length !== 9) {
  errors.push(
    `Draugas newspaper projection must contain exactly nine rows; got ${projection.records?.length}.`,
  );
}

const publicationByEntity = new Map(
  publication.public_institutions.map((row) => [row.culturenet_entity_id, row]),
);
const seenIds = new Set();
for (const [index, expectedRow] of expected.entries()) {
  const row = projection.records?.[index];
  if (!row) continue;
  if (seenIds.has(row.source_record_id)) {
    errors.push(`duplicate source record ID: ${row.source_record_id}`);
  }
  seenIds.add(row.source_record_id);
  for (const field of Object.keys(expectedRow)) {
    if (row[field] !== expectedRow[field]) {
      errors.push(
        `record ${index} ${field}=${row[field]} expected ${expectedRow[field]}`,
      );
    }
  }
  const institution = publicationByEntity.get(row.canonical_entity_id);
  if (!institution || institution.public_profile !== row.public_profile) {
    errors.push(
      `${row.source_record_id}: canonical entity/public-profile join does not match Brain.`,
    );
  }
  if (
    row.rights?.public_release_allowed !== true ||
    row.rights?.quote_policy !== "citation_metadata_only" ||
    row.rights?.raw_text_allowed_in_git !== false
  ) {
    errors.push(`${row.source_record_id}: rights are not citation-metadata-only.`);
  }
  try {
    const page = new URL(row.page_url);
    if (
      page.protocol !== "https:" ||
      page.hostname.replace(/^www\./, "") !== "draugas.org" ||
      !page.pathname.endsWith(".pdf") ||
      page.hash !== `#page=${row.pdf_page}`
    ) {
      errors.push(`${row.source_record_id}: exact PDF page URL is invalid.`);
    }
  } catch {
    errors.push(`${row.source_record_id}: exact PDF page URL is invalid.`);
  }
}

const profileCounts = Object.fromEntries(
  [...new Set(expected.map((row) => row.public_profile))].map((profile) => [
    profile,
    projection.records.filter((row) => row.public_profile === profile).length,
  ]),
);
for (const [profile, count] of Object.entries({
  "/parishes/sv-jurgio-chicago-il": 1,
  "/parishes/sv-jurgio-norwood-ma": 1,
  "/parishes/sv-jurgio-rochester-ny": 1,
  "/parishes/sv-jurgio-shenandoah-pa": 6,
})) {
  if (profileCounts[profile] !== count) {
    errors.push(`${profile}: governed Draugas count ${profileCounts[profile]} != ${count}`);
  }
}
const norwood = projection.records.find((row) => row.issue_date === "1987-04-24");
if (
  norwood?.canonical_entity_id !== "cn:institution:st-george-norwood-ma" ||
  norwood?.public_profile !== "/parishes/sv-jurgio-norwood-ma"
) {
  errors.push("Norwood reference drifted to Chicago or another St. George profile.");
}
const rochester = projection.records.find((row) => row.issue_date === "1941-10-28");
if (
  rochester?.canonical_entity_id !==
    "cn:institution:st-george-lithuanian-rochester-ny" ||
  rochester?.public_profile !== "/parishes/sv-jurgio-rochester-ny"
) {
  errors.push("Rochester reference drifted to Shenandoah or another St. George profile.");
}

const walk = (value, path = "projection") => {
  if (Array.isArray(value)) {
    value.forEach((child, index) => walk(child, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) {
      errors.push(`${path}.${key}: forbidden source or claim payload in projection.`);
    }
    if (
      typeof child === "string" &&
      ["/Volumes/", "/Users/", "file://"].some((marker) => child.includes(marker))
    ) {
      errors.push(`${path}.${key}: local filesystem path leaked into projection.`);
    }
    walk(child, `${path}.${key}`);
  }
};
walk(projection);

const importer = readFileSync(
  join(root, "scripts/import-brain-projections.mjs"),
  "utf8",
);
const loader = readFileSync(
  join(root, "lib/draugas-newspaper-records.ts"),
  "utf8",
);
const profileSources = readFileSync(join(root, "lib/profile-sources.ts"), "utf8");
const ledger = readFileSync(join(root, "components/ProfileSourceLedger.tsx"), "utf8");
const profile = readFileSync(join(root, "app/parishes/[slug]/page.tsx"), "utf8");

for (const [source, token, label] of [
  [
    importer,
    "docs/research/parish-canon/public-display/draugas-newspaper-records.json",
    "Brain import",
  ],
  [loader, "identityKey(canonicalEntityId, publicProfile)", "strict identity join"],
  [loader, "record.display_title", "exact display title"],
  [loader, "record.citation_label", "exact citation label"],
  [loader, "record.page_url", "exact page URL"],
  [loader, "contexts: []", "claim-free source row"],
  [profile, "draugasNewspaperProfileSources", "profile source join"],
  [profile, "<ProfileSourceLedger", "Evidence and sources render"],
  [ledger, 'label: "Newspapers and periodicals"', "newspaper source group"],
  [ledger, "source.reviewedPublicReference", "reviewed group expansion"],
  [profileSources, "reviewedDraugasByDate", "governed-row dedupe"],
]) {
  if (!source.includes(token)) errors.push(`${label} is missing ${token}`);
}

for (const forbidden of [
  "display_label",
  "getDraugasProfileLedger",
  "canonical-draugas-mention-projection",
]) {
  if (loader.includes(forbidden)) {
    errors.push(`retired or source-local Draugas token returned: ${forbidden}`);
  }
}
for (const forbidden of ["ProfileDraugasReferences", 'id="press-archive"']) {
  if (profile.includes(forbidden)) {
    errors.push(`standalone press-archive display returned: ${forbidden}`);
  }
}
for (const retiredPath of [
  "data/canonical-draugas-references.json",
  "lib/draugas-references.ts",
  "components/ProfileDraugasReferences.tsx",
]) {
  if (existsSync(join(root, retiredPath))) {
    errors.push(`${retiredPath}: superseded four-row display direction remains`);
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
    "canonical-draugas-newspaper-records",
    "draugasNewspaperProfileSources",
  ]) {
    if (source.includes(forbidden)) {
      errors.push(`${relativePath}: governed Draugas rows escaped the profile ledger`);
    }
  }
}

if (errors.length) {
  console.error(`REVIEWED DRAUGAS NEWSPAPER VIOLATIONS (${errors.length}):`);
  errors.forEach((error) => console.error(`  ${error}`));
  process.exit(1);
}

console.log(
  "OK: 9 reviewed Draugas newspaper records join to four exact parish profiles and render only in Newspapers and periodicals.",
);
