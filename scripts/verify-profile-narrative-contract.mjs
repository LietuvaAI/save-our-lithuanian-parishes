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
const infographic = JSON.parse(
  readFileSync(join(ROOT, "data", "canonical-infographic-projection.json"), "utf8"),
);
const currentEvents = JSON.parse(
  readFileSync(join(ROOT, "data", "canonical-current-events-projection.json"), "utf8"),
);
const caseRoot = join(ROOT, "data", "case-records");
const caseFiles = readdirSync(caseRoot)
  .filter((name) => name.endsWith(".json"))
  .sort();

const protectedHistory = new Map([
  ["all-saints-wilkes-barre-pa.json", ["historicalNarrative", 5]],
  ["allsaints-worcester-ma.json", ["historicalNarrative", 4]],
  ["ausros-vartu-manhattan-ny.json", ["historicalNarrative", 6]],
  ["dievo-apvaizdos-southfield-mi.json", ["historicalNarrative", 4]],
  ["joseph-dubois-pa.json", ["historicalNarrative", 5]],
  ["kristaus-atsimainymo-maspeth-ny.json", ["historicalNarrative", 4]],
  [
    "lithuanian-national-catholic-parish-waterbury-ct.json",
    ["historicalNarrative", 5],
  ],
  ["our-lady-of-siluva-mission-mundelein-il.json", ["historicalNarrative", 4]],
  ["pal-jurgio-matulaicio-misija-lemont-il.json", ["historicalNarrative", 4]],
  ["st-ann-beverly-shores-in.json", ["historicalNarrative", 4]],
  ["st-george-detroit-mi.json", ["historicalNarrative", 5]],
  ["sv-andriejaus-new-britain-ct.json", ["historicalNarrative", 5]],
  ["sv-andriejaus-philadelphia-pa.json", ["historicalNarrative", 4]],
  ["sv-antano-cicero-il.json", ["historicalNarrative", 5]],
  ["sv-jurgio-chicago-il.json", ["historicalNarrative", 5]],
  ["sv-jurgio-norwood-ma.json", ["historicalNarrative", 5]],
  ["sv-jurgio-rochester-ny.json", ["historicalNarrative", 4]],
  ["sv-jurgio-shenandoah-pa.json", ["historicalNarrative", 6]],
  ["sv-kazimiero-worcester-ma.json", ["historicalNarrative", 6]],
  ["sv-juozapo-waterbury-ct.json", ["historicalNarrative", 3]],
  ["sv-kazimiero-cleveland-oh.json", ["historicalNarrative", 4]],
  ["sv-kazimiero-los-angeles-ca.json", ["historicalNarrative", 4]],
  ["sv-mykolo-bayonne-nj.json", ["historicalNarrative", 3]],
  ["sv-mykolo-scranton-pa.json", ["historicalNarrative", 4]],
  ["sv-petro-detroit-mi.json", ["historicalNarrative", 2]],
  ["sv-petro-boston-ma.json", ["historicalNarrative", 7]],
  ["sv-petro-ir-povilo-elizabeth-nj.json", ["historicalNarrative", 3]],
  ["sv-vincento-de-paul-girardville-pa.json", ["historicalNarrative", 3]],
  ["svc-m-marijos-apreiskimo-brooklyn-ny.json", ["historicalNarrative", 4]],
  ["svc-m-marijos-nekalto-prasidejimo-chicago-il.json", ["historicalNarrative", 5]],
  ["svc-mergeles-marijos-gimimo-chicago-il.json", ["historicalNarrative", 4]],
  ["svc-trejybes-hartford-ct.json", ["historicalNarrative", 4]],
]);

const errors = [];
const activeCatholicProfiles = infographic.institution_history
  .filter(
    (institution) =>
      institution.institution_class === "roman_catholic" &&
      institution.status_group === "active_parish",
  )
  .map((institution) => institution.public_profile.split("/").at(-1))
  .sort();
const monitoredProfiles = [
  ...new Set(
    currentEvents.alerts
      .map((alert) => alert.parishLink)
      .filter((href) => href?.startsWith("/parishes/"))
      .map((href) => href.split("/").at(-1)),
  ),
].sort();
const immaculateConceptionWatch = currentEvents.sustainabilityWatch.find(
  (entry) => entry.id === "brighton-park-immaculate-conception-watch",
);

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
  if ("historicalSummary" in record) {
    errors.push(
      `legacy historicalSummary is forbidden: ${filename}; ` +
        "use sourced historicalNarrative",
    );
  }
  (record.developments ?? []).forEach((development, index) => {
    const date = String(development?.date ?? "").trim().toLowerCase();
    if (!date || date === "undefined" || date === "null") {
      errors.push(
        `case development has no public date label: ${filename} #${index + 1}`,
      );
    }
  });
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

for (const slug of activeCatholicProfiles) {
  const filename = `${slug}.json`;
  if (!caseFiles.includes(filename)) {
    errors.push(`active Catholic profile lacks a Brain case file: ${filename}`);
    continue;
  }
  const record = JSON.parse(readFileSync(join(caseRoot, filename), "utf8"));
  if (!Array.isArray(record.historicalNarrative) || record.historicalNarrative.length < 3) {
    errors.push(
      `active Catholic profile needs at least 3 history paragraphs: ${filename}`,
    );
    continue;
  }
  record.historicalNarrative.forEach((paragraph, index) => {
    if (!paragraph.text?.trim()) {
      errors.push(`active history paragraph is empty: ${filename} #${index + 1}`);
    }
    if (
      !Array.isArray(paragraph.sources) ||
      paragraph.sources.length === 0 ||
      paragraph.sources.some((source) => !source.url?.trim())
    ) {
      errors.push(
        `active history paragraph lacks a linked source: ${filename} #${index + 1}`,
      );
    }
  });
}

for (const slug of monitoredProfiles) {
  const filename = `${slug}.json`;
  if (!caseFiles.includes(filename)) {
    errors.push(`monitored profile lacks a Brain case file: ${filename}`);
    continue;
  }
  const record = JSON.parse(readFileSync(join(caseRoot, filename), "utf8"));
  if (!Array.isArray(record.historicalNarrative) || record.historicalNarrative.length < 3) {
    errors.push(
      `monitored profile needs at least 3 history paragraphs: ${filename}`,
    );
  }
}

if (!immaculateConceptionWatch) {
  errors.push("Immaculate Conception current canonical summary is missing");
} else {
  for (const required of [
    "established by Lithuanian immigrants in 1914 as a Lithuanian parish",
    "not a mission",
    "merged with Five Holy Martyrs to form the multiethnic",
    "weekly Lithuanian Mass with a Lithuanian chaplain",
    "not one of the six active Lithuanian-led parishes or two active missions",
  ]) {
    if (!immaculateConceptionWatch.situation?.includes(required)) {
      errors.push(
        `Immaculate Conception current summary lost required meaning: ${required}`,
      );
    }
  }
}

for (const [source, fragment, label] of [
  [
    pageSource,
    "const historicalLeadNarrative = parishTimeline?.intro ?? null;",
    "typed historical lead",
  ],
  [pageSource, "caseRecord?.historicalNarrative?.length", "sourced narrative"],
  [pageSource, "caseRecord?.formationLabel", "case-specific formation label"],
  [pageSource, "caseRecord?.summary ??", "case summary in current condition"],
  [pageSource, "watchEntry?.situation ??", "canonical watch summary"],
  [pageSource, "situation?.situation ??", "situation in current condition"],
  [historySource, ">\n        History\n      </h2>", "History heading"],
  [
    historySource,
    "const renderedGroups = supplemental.length > 0 ? [] : groups;",
    "case history supersedes raw registry fact prose",
  ],
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
  "historicalSummary",
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
    `${protectedHistory.size} protected historical dossiers; ` +
    `${activeCatholicProfiles.length} active Catholic profiles have sourced histories; ` +
    `${monitoredProfiles.length} campaign/watch profiles have sourced histories; ` +
    `History precedes current condition.`,
);
