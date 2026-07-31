import { readFileSync, readdirSync } from "node:fs";

const readJson = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));

const dates = new Set(
  readJson("parishes.json").flatMap((parish) =>
    parish.citations.map((citation) => citation.date),
  ),
);

for (const parish of readJson("registry-unified.json").parishes) {
  for (const source of parish.sources ?? []) {
    if (!String(source.axis ?? "").startsWith("draugas")) continue;
    for (const field of ["first_mention", "last_mention"]) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(source[field] ?? "")) {
        dates.add(source[field]);
      }
    }
    for (const match of String(source.cites ?? "").matchAll(
      /\b\d{4}-\d{2}-\d{2}\b/g,
    )) {
      dates.add(match[0]);
    }
  }
}

const caseRecordsDirectory = new URL("../data/case-records/", import.meta.url);
const caseRecords = readdirSync(caseRecordsDirectory)
  .filter((name) => name.endsWith(".json"))
  .map((file) => ({
    file,
    record: JSON.parse(
      readFileSync(new URL(file, caseRecordsDirectory), "utf8"),
    ),
  }));
const addCaseRecordIssueDates = (value) => {
  if (Array.isArray(value)) {
    for (const item of value) addCaseRecordIssueDates(item);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(value.date ?? "") &&
    /draugas\.org\/(?:archyvas-pdf-\d{4}\/?$|(?:archive|key)\/.*\.pdf$)/i.test(
      value.url ?? "",
    )
  ) {
    dates.add(value.date);
  }
  for (const child of Object.values(value)) addCaseRecordIssueDates(child);
};
for (const { record } of caseRecords) addCaseRecordIssueDates(record);

const links = readJson("draugas-links.json").results;
const failures = [];
for (const date of [...dates].sort()) {
  const entry = links[date];
  if (!entry) {
    failures.push(`${date}: no cached issue link`);
    continue;
  }
  if (!["verified", "gated"].includes(entry.status)) {
    failures.push(`${date}: ${entry.status}`);
    continue;
  }
  if (
    typeof entry.url !== "string" ||
    !entry.url.includes(date) ||
    !/\.pdf$/i.test(entry.url)
  ) {
    failures.push(`${date}: issue URL is not date-matched (${entry.url ?? "missing"})`);
  }
}

const inspectCaseRecordSources = (value, file) => {
  if (Array.isArray(value)) {
    for (const item of value) inspectCaseRecordSources(item, file);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(value.date ?? "") &&
    /^https?:\/\/(?:www\.)?draugas\.org\//i.test(value.url ?? "")
  ) {
    if (/\/archyvas-pdf-\d{4}\/?$/i.test(value.url)) {
      failures.push(`${file} ${value.date}: dated source points to a yearly archive`);
    } else if (/\.pdf$/i.test(value.url) && !value.url.includes(value.date)) {
      failures.push(`${file} ${value.date}: issue PDF date does not match`);
    }
  }
  for (const child of Object.values(value)) {
    inspectCaseRecordSources(child, file);
  }
};
for (const { file, record } of caseRecords) {
  inspectCaseRecordSources(record, file);
}

if (failures.length > 0) {
  console.error("Draugas issue-link coverage failed:");
  for (const failure of failures) console.error(`  ${failure}`);
  console.error("Run: npm run verify:draugas-links");
  process.exit(1);
}

const tally = [...dates].reduce(
  (counts, date) => {
    const status = links[date].status;
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  },
  {},
);

console.log(
  `OK: ${dates.size} dated Draugas citations have issue-level PDF links ` +
    `(${tally.verified ?? 0} public, ${tally.gated ?? 0} subscriber-gated).`,
);
