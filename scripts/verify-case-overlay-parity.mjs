// Blocking guard for present-condition parity between deep case records and
// the classifier overlay used by public maps, profile facts, and filters.
//
// Case records are the fresher current-research layer. The overlay may use a
// coarser public vocabulary, but it may not erase a researched building fate,
// imply an active church from a standing structure, or contradict the known
// kind of reuse.
import { readFileSync, readdirSync } from "node:fs";

const read = (path) =>
  JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), "utf8"));

const situations = read("parish-situation.json").parishes;
const caseDirectory = new URL("../data/case-records/", import.meta.url);
const errors = [];

const allowedFates = {
  standing: new Set([
    "standing",
    "repurposed_religious",
    "repurposed_secular",
    "derelict",
  ]),
  converted: new Set(["repurposed_religious", "repurposed_secular"]),
  demolished: new Set(["demolished"]),
  "for-sale": new Set(["standing", "repurposed_secular"]),
  unknown: new Set([
    "standing",
    "repurposed_religious",
    "repurposed_secular",
    "derelict",
    "demolished",
    "unknown",
  ]),
};

const nonCatholicUse =
  /protestant|pentecostal|baptist|seventh-day adventist|anglican|assembl(?:y|ies) of god|buddhist/i;
const catholicUse = /catholic (?:church|congregation|cathedral|parish)/i;
const staleUnknownSituation =
  /building fate (?:not recorded|unrecorded|unknown)|present status not yet researched|current use unknown/i;

for (const file of readdirSync(caseDirectory)) {
  if (!file.endsWith(".json")) continue;
  const record = JSON.parse(readFileSync(new URL(file, caseDirectory), "utf8"));
  const slug = record.slug ?? file.replace(/\.json$/, "");
  const situation = situations[slug];
  if (!situation) {
    errors.push(`${slug}: deep case record has no classifier overlay`);
    continue;
  }

  const caseStatus = record.buildingStatus ?? "unknown";
  const allowed = allowedFates[caseStatus];
  if (!allowed) {
    errors.push(`${slug}: unknown case buildingStatus "${caseStatus}"`);
  } else if (!allowed.has(situation.building_fate)) {
    errors.push(
      `${slug}: case buildingStatus "${caseStatus}" conflicts with overlay building_fate "${situation.building_fate}"`,
    );
  }

  const caseUse = record.currentUse?.trim() ?? "";
  const overlayUse = situation.current_use?.trim() ?? "";
  if (
    caseUse &&
    !/^unknown\b/i.test(caseUse) &&
    (!overlayUse || /^unknown\b/i.test(overlayUse))
  ) {
    errors.push(
      `${slug}: case record establishes current use but overlay says "${overlayUse || "<blank>"}"`,
    );
  }

  if (caseUse !== overlayUse) {
    errors.push(`${slug}: overlay current_use does not equal the deep case record`);
  }
  if (situation.current_record_path !== `data/case-records/${file}`) {
    errors.push(`${slug}: overlay does not point to its governing case record`);
  }
  if (situation.current_record_as_of !== record.asOf) {
    errors.push(`${slug}: overlay as-of date does not match the case record`);
  }

  if (
    caseStatus === "for-sale" &&
    !/(?:for sale|listed|vacant)/i.test(overlayUse)
  ) {
    errors.push(
      `${slug}: for-sale case record is not reflected in overlay current_use`,
    );
  }

  if (
    caseUse !== overlayUse &&
    nonCatholicUse.test(caseUse) &&
    catholicUse.test(overlayUse) &&
    !/non-catholic/i.test(overlayUse)
  ) {
    errors.push(
      `${slug}: case record reports non-Catholic reuse but overlay reports Catholic use`,
    );
  }

  if (
    situation.building_fate !== "unknown" &&
    staleUnknownSituation.test(situation.situation ?? "")
  ) {
    errors.push(
      `${slug}: situation prose says the present condition is unknown after the overlay established building_fate "${situation.building_fate}"`,
    );
  }
}

if (errors.length) {
  console.error(`CASE/OVERLAY PARITY VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  "OK: deep case building status and present use agree with the public classifier overlay.",
);
