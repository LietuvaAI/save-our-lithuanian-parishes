// Legacy evidence-coherence guard. Brain owns both the case evidence and the
// display overlay; neither may override the canonical institution/site graph.
// Exact Brain hashes are enforced by verify-brain-single-source.mjs. This
// check only keeps legacy path links and coarse building evidence coherent.
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

  if (situation.current_record_path !== `data/case-records/${file}`) {
    errors.push(`${slug}: overlay does not point to its governing case record`);
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

console.log("OK: Brain-owned case evidence and legacy display-overlay links are coherent.");
