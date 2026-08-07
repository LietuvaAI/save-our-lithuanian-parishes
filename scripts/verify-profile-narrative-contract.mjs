import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const pageSource = readFileSync(
  join(ROOT, "app", "parishes", "[slug]", "page.tsx"),
  "utf8",
);
const historySource = readFileSync(
  join(ROOT, "components", "ParishResearchRecord.tsx"),
  "utf8",
);
const manifest = JSON.parse(
  readFileSync(join(ROOT, "data", "canonical-case-files-manifest.json"), "utf8"),
);
const caseRoot = join(ROOT, "data", "case-records");
const caseFiles = readdirSync(caseRoot)
  .filter((name) => name.endsWith(".json"))
  .sort();

const protectedHistory = new Map([
  ["ausros-vartu-manhattan-ny.json", ["historicalNarrative", 6]],
  ["dievo-apvaizdos-southfield-mi.json", ["historicalNarrative", 3]],
  ["sv-jurgio-norwood-ma.json", ["historicalNarrative", 2]],
  ["sv-jurgio-shenandoah-pa.json", ["historicalNarrative", 2]],
  ["sv-kazimiero-cleveland-oh.json", ["historicalSummary", 2]],
  ["sv-mykolo-scranton-pa.json", ["historicalSummary", 5]],
  ["sv-petro-detroit-mi.json", ["historicalSummary", 2]],
  ["svc-m-marijos-apreiskimo-brooklyn-ny.json", ["historicalNarrative", 4]],
  ["svc-trejybes-hartford-ct.json", ["historicalNarrative", 1]],
]);

const errors = [];

if (caseFiles.length !== manifest.counts.case_files) {
  errors.push(
    `case-file population drift: ${caseFiles.length} files, ` +
      `${manifest.counts.case_files} in the Brain manifest`,
  );
}

for (const filename of caseFiles) {
  const record = JSON.parse(readFileSync(join(caseRoot, filename), "utf8"));
  if (!record.summary?.trim()) {
    errors.push(`case summary is empty: ${filename}`);
  }
  const contract = protectedHistory.get(filename);
  if (!contract) continue;
  const [field, minimum] = contract;
  if (!Array.isArray(record[field]) || record[field].length < minimum) {
    errors.push(
      `protected history was removed: ${filename} requires at least ` +
        `${minimum} ${field} paragraphs`,
    );
  }
}

for (const [source, fragment, label] of [
  [
    pageSource,
    "const historicalLeadNarrative = parishTimeline?.intro ?? null;",
    "typed historical lead",
  ],
  [pageSource, "caseRecord?.historicalNarrative?.length", "sourced narrative"],
  [pageSource, "caseRecord?.historicalSummary?.length", "historical summary"],
  [pageSource, "caseRecord?.summary ??", "case summary in current condition"],
  [pageSource, "situation?.situation ??", "situation in current condition"],
  [historySource, ">\n        History\n      </h2>", "History heading"],
]) {
  if (!source.includes(fragment)) errors.push(`missing ${label}`);
}

const historyIndex = pageSource.indexOf("<ParishPublishedRecord");
const currentIndex = pageSource.indexOf('id="present-condition"');
if (historyIndex < 0 || currentIndex < 0 || historyIndex >= currentIndex) {
  errors.push("profile order must be History before Where it stands today");
}

for (const forbidden of [
  "What happened",
  "data-profile-institutional-reading",
  "situationText: isUsProjection ? null",
  "currentUse: isUsProjection ? null",
  "caseSummary: isUsProjection",
]) {
  if (pageSource.includes(forbidden)) {
    errors.push(`suppressed or superseded narrative path returned: ${forbidden}`);
  }
}

if (errors.length) {
  console.error("Profile narrative contract failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `OK: profile narrative contract — ${caseFiles.length} Brain-owned case files; ` +
    `${protectedHistory.size} protected historical dossiers; History precedes current condition.`,
);
