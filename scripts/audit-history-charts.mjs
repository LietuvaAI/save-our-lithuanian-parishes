import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projection = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "data", "canonical-infographic-projection.json"),
    "utf8",
  ),
);
const dioceseOverlay = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "diocese-overlay.json"), "utf8"),
);

const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

const parishes = projection.institution_history.filter(
  (row) =>
    row.record_type === "parish" && row.institution_class === "roman_catholic",
);
const currentYear = new Date(`${projection.generated}T00:00:00Z`).getUTCFullYear();
const datedFoundations = parishes.filter((row) => row.founded.year != null);
const formalClosures = parishes.filter(
  (row) => row.status_group === "closed" && row.closed.year != null,
);
const datedEndings = parishes.filter((row) => row.closed.year != null);
const intervalEndings = datedEndings.filter(
  (row) =>
    row.founded.year != null && row.founded.year <= row.closed.year,
);
const currentOutcomeEndings = parishes.filter(
  (row) =>
    row.closed.year != null ||
    (row.closed.year == null &&
      (row.status_group === "closed" || row.status_group === "transferred")),
);

assert(
  parishes.length === projection.counts.roman_catholic_parish_institutions,
  `History population ${parishes.length} != canonical parish population ${projection.counts.roman_catholic_parish_institutions}`,
);
assert(
  datedFoundations.length ===
    projection.counts.roman_catholic_parishes_with_founding_year,
  `Dated foundations ${datedFoundations.length} != canonical count ${projection.counts.roman_catholic_parishes_with_founding_year}`,
);
assert(
  datedEndings.length === projection.counts.roman_catholic_parishes_with_closure_year,
  `Dated institutional endings ${datedEndings.length} != canonical count ${projection.counts.roman_catholic_parishes_with_closure_year}`,
);
assert(
  formalClosures.length ===
    projection.counts.closed_roman_catholic_parishes_with_dated_year,
  `Dated formal closures ${formalClosures.length} != canonical count ${projection.counts.closed_roman_catholic_parishes_with_dated_year}`,
);

for (const row of parishes) {
  assert(Boolean(row.registry_slug), "History parish without registry slug");
  assert(Boolean(row.public_profile), `${row.registry_slug}: missing public profile`);
  assert(
    Boolean(row.jurisdiction?.key),
    `${row.registry_slug}: missing canonical jurisdiction key`,
  );
  if (row.founded.year != null && row.closed.year != null) {
    assert(
      row.founded.year <= row.closed.year,
      `${row.registry_slug}: founded ${row.founded.year} after ending ${row.closed.year}`,
    );
  }
}
assert(
  new Set(parishes.map((row) => row.registry_slug)).size === parishes.length,
  "History population contains duplicate registry slugs",
);

const rosterAt = (year) =>
  parishes.filter(
    (row) =>
      row.founded.year != null &&
      row.founded.year <= year &&
      (row.closed.year == null || row.closed.year > year),
  );

const years = [];
for (let year = 1880; year <= currentYear; year += 1) {
  const roster = rosterAt(year);
  const founded = datedFoundations.filter((row) => row.founded.year === year);
  const ended = intervalEndings.filter((row) => row.closed.year === year);
  years.push({ year, roster, founded, ended });

  if (year > 1880) {
    const previous = years.at(-2);
    assert(
      roster.length === previous.roster.length + founded.length - ended.length,
      `${year}: interval roster delta does not reconcile (${previous.roster.length} + ${founded.length} - ${ended.length} != ${roster.length})`,
    );
  }
}

const allFoundationSlugs = new Set(datedFoundations.map((row) => row.registry_slug));
const decadeFoundationSlugs = new Set();
const decadeClosureSlugs = new Set();
for (let decade = 1880; decade <= Math.floor(currentYear / 10) * 10; decade += 10) {
  for (const row of datedFoundations.filter(
    (entry) => Math.floor(entry.founded.year / 10) * 10 === decade,
  )) {
    assert(
      !decadeFoundationSlugs.has(row.registry_slug),
      `${row.registry_slug}: duplicated in foundation decades`,
    );
    decadeFoundationSlugs.add(row.registry_slug);
  }
  for (const row of formalClosures.filter(
    (entry) => Math.floor(entry.closed.year / 10) * 10 === decade,
  )) {
    assert(
      !decadeClosureSlugs.has(row.registry_slug),
      `${row.registry_slug}: duplicated in formal-closure decades`,
    );
    decadeClosureSlugs.add(row.registry_slug);
  }
}
assert(
  decadeFoundationSlugs.size === allFoundationSlugs.size,
  `Foundation decade chart covers ${decadeFoundationSlugs.size}/${allFoundationSlugs.size} dated foundations`,
);
assert(
  decadeClosureSlugs.size === formalClosures.length,
  `Closure decade chart covers ${decadeClosureSlugs.size}/${formalClosures.length} dated formal closures`,
);

const jurisdictionGroups = new Map();
for (const row of parishes) {
  const key = row.jurisdiction?.key;
  if (!key) continue;
  const members = jurisdictionGroups.get(key) ?? [];
  members.push(row);
  jurisdictionGroups.set(key, members);
}
assert(
  [...jurisdictionGroups.values()].reduce((sum, rows) => sum + rows.length, 0) ===
    parishes.length,
  "Diocese groups do not partition the full parish population",
);
const overlayKeys = new Set(dioceseOverlay.dioceses.map((row) => row.name));
for (const key of jurisdictionGroups.keys()) {
  assert(overlayKeys.has(key), `${key}: canonical jurisdiction missing from map overlay`);
}

const statusClosedOrTransferred = parishes.filter(
  (row) => row.status_group === "closed" || row.status_group === "transferred",
);
assert(
  statusClosedOrTransferred.length === 109,
  `Closed/transferred outcome population drifted from 109 to ${statusClosedOrTransferred.length}`,
);

const peak = Math.max(...years.map((entry) => entry.roster.length));
const peakYears = years.filter((entry) => entry.roster.length === peak).map((entry) => entry.year);
const roster1960 = rosterAt(1960);

if (errors.length) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `OK: History charts — ${parishes.length} parishes; ` +
    `${datedFoundations.length} dated foundations; ${formalClosures.length} dated formal closures; ` +
    `${datedEndings.length} dated institutional endings (${intervalEndings.length} curve-eligible); ` +
    `1960 roster ${roster1960.length}; peak ${peak} in ${peakYears[0]}-${peakYears.at(-1)}; ` +
    `${currentOutcomeEndings.length} ended/current-outcome histories today; ` +
    `${jurisdictionGroups.size} canonical jurisdictions.`,
);
