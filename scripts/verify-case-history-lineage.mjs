// Historical narrative is public prose, but every paragraph must remain
// traceable to a linked source and an exact source locator.
import { readFileSync, readdirSync } from "node:fs";

const caseDirectory = new URL("../data/case-records/", import.meta.url);
const errors = [];
let narrativeFiles = 0;
let narrativeParagraphs = 0;

for (const file of readdirSync(caseDirectory).filter((name) => name.endsWith(".json"))) {
  const record = JSON.parse(readFileSync(new URL(file, caseDirectory), "utf8"));
  if ("historicalSummary" in record) {
    errors.push(
      `${file}: legacy historicalSummary is forbidden; use sourced historicalNarrative`,
    );
  }
  const narrative = record.historicalNarrative ?? [];
  if (!Array.isArray(narrative)) {
    errors.push(`${file}: historicalNarrative must be an array`);
    continue;
  }
  if (narrative.length === 0) continue;

  narrativeFiles += 1;
  const linkedUrls = new Set([
    ...(record.sources ?? []).map((source) => source.url),
    ...(record.developments ?? []).flatMap((development) =>
      (development.sources ?? []).map((source) => source.url),
    ),
  ]);
  const seenParagraphs = new Set();

  for (const [index, paragraph] of narrative.entries()) {
    narrativeParagraphs += 1;
    const label = `${file}: historicalNarrative[${index}]`;
    const text = paragraph?.text?.trim();
    if (!text) errors.push(`${label} has no text`);
    if (text && seenParagraphs.has(text)) {
      errors.push(`${label} duplicates an earlier paragraph`);
    }
    if (text) seenParagraphs.add(text);

    if (!Array.isArray(paragraph?.sources) || paragraph.sources.length === 0) {
      errors.push(`${label} has no source lineage`);
      continue;
    }
    for (const [sourceIndex, source] of paragraph.sources.entries()) {
      const sourceLabel = `${label}.sources[${sourceIndex}]`;
      if (!/^https?:\/\//i.test(source?.url ?? "")) {
        errors.push(`${sourceLabel} has no absolute public URL`);
      } else if (!linkedUrls.has(source.url)) {
        errors.push(`${sourceLabel} URL is absent from the case evidence ledger`);
      }
      if (!source?.locator?.trim()) {
        errors.push(`${sourceLabel} has no exact source locator`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`CASE HISTORY LINEAGE VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  `OK: source-linked historical narrative — ${narrativeParagraphs} paragraphs across ${narrativeFiles} case files.`,
);
