// Inventory deep case files that likely contain multiple physical sites or
// institution-lineage events. Matches flag records for human extraction only;
// they never create public entities or assertions.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const caseDirectory = new URL("../data/case-records/", import.meta.url);
const outputJson = new URL(
  "../data/candidates/case-file-site-lineage-inventory-2026-07-31.json",
  import.meta.url,
);
const outputMarkdown = new URL(
  "../data/candidates/case-file-site-lineage-inventory-2026-07-31.md",
  import.meta.url,
);

const siteTerms = [
  "first church",
  "second church",
  "third church",
  "original church",
  "former church",
  "earlier church",
  "new church",
  "current church",
  "moved",
  "relocated",
  "replaced",
  "rebuilt",
  "burned",
  "fire",
];
const lineageTerms = [
  "merged",
  "merger",
  "consolidated",
  "consolidation",
  "successor",
  "records at",
  "records held",
  "continued",
  "absorbed",
  "suppressed",
];

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ");
const termsFound = (text, terms) => terms.filter((term) => text.includes(term));

const entries = readdirSync(caseDirectory)
  .filter((file) => file.endsWith(".json"))
  .map((file) => {
    const record = JSON.parse(readFileSync(new URL(file, caseDirectory), "utf8"));
    const text = normalize([
      record.summary,
      record.conflictsWithArchiveRecord,
      record.gaps,
      ...(record.historicalSummary ?? []),
      ...(record.developments ?? []).flatMap((development) => [
        development.headline,
        development.detail,
      ]),
    ].join(" "));
    const matchedSiteTerms = termsFound(text, siteTerms);
    const matchedLineageTerms = termsFound(text, lineageTerms);

    return {
      slug: record.slug,
      case_record: `data/case-records/${file}`,
      as_of: record.asOf,
      source_count: record.sources?.length ?? 0,
      development_count: record.developments?.length ?? 0,
      has_historical_summary: Boolean(record.historicalSummary?.length),
      site_extraction_candidate: matchedSiteTerms.length > 0,
      lineage_extraction_candidate: matchedLineageTerms.length > 0,
      matched_site_terms: matchedSiteTerms,
      matched_lineage_terms: matchedLineageTerms,
      publication_state: "manual_review_required",
    };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

const totals = {
  case_files: entries.length,
  with_sources: entries.filter((entry) => entry.source_count > 0).length,
  with_developments: entries.filter((entry) => entry.development_count > 0)
    .length,
  with_historical_summary: entries.filter(
    (entry) => entry.has_historical_summary,
  ).length,
  site_extraction_candidates: entries.filter(
    (entry) => entry.site_extraction_candidate,
  ).length,
  lineage_extraction_candidates: entries.filter(
    (entry) => entry.lineage_extraction_candidate,
  ).length,
};

const inventory = {
  generated: "2026-07-31",
  purpose:
    "Planning inventory for source-backed institution/site/lineage extraction. Heuristic matches are not public facts.",
  publication_rule:
    "No site or lineage edge may publish until a human-reviewed extraction names the entities, predicate, date, exact locator, and source URL.",
  totals,
  entries,
};

const candidateLines = entries
  .filter(
    (entry) =>
      entry.site_extraction_candidate || entry.lineage_extraction_candidate,
  )
  .map(
    (entry) =>
      `| \`${entry.slug}\` | ${entry.site_extraction_candidate ? "yes" : "no"} | ${entry.lineage_extraction_candidate ? "yes" : "no"} | ${entry.development_count} | ${entry.source_count} |`,
  );

const report = `# Case-file site and lineage inventory

**Audit date:** 2026-07-31

## Result

The deep case files are substantially richer than the flat public condition
overlay. Every case file has linked sources, and almost every case file has a
dated event chronology. A majority appear to contain either multiple physical
site stages or an institution-lineage event.

- Case files: **${totals.case_files}**
- With linked sources: **${totals.with_sources}**
- With developments: **${totals.with_developments}**
- With a separate historical-summary field: **${totals.with_historical_summary}**
- Site-extraction candidates: **${totals.site_extraction_candidates}**
- Lineage-extraction candidates: **${totals.lineage_extraction_candidates}**

## Publication boundary

This inventory does not create buildings, institutions, or relationships. Its
text matching only identifies a manual-review queue. A publishable extraction
must name the institution and site entities separately, type and date every
relationship, and retain an exact locator and source URL.

## Candidate queue

| Case file | Site review | Lineage review | Events | Sources |
|---|---:|---:|---:|---:|
${candidateLines.join("\n")}
`;

writeFileSync(outputJson, `${JSON.stringify(inventory, null, 2)}\n`);
writeFileSync(outputMarkdown, report);

console.log(
  `Case-file inventory: ${totals.case_files} files; ${totals.site_extraction_candidates} site candidates; ${totals.lineage_extraction_candidates} lineage candidates.`,
);
