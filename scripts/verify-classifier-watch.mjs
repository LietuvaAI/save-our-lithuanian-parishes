// Consistency guard: the classifier overlay (parish-situation.json) must
// never claim MORE Lithuanian life than the sustainability-watch research
// (alerts.json) supports. Born 2026-07-26, after East St. Louis shipped as
// "Active Lithuanian parish" while its own watch entry recorded the parish
// ended in 2014 with no Lithuanian clergy and no Lithuanian Mass.
//
// Rules (watch entry present for the parish):
//   1. watch says lithuanianMass=false AND no_lithuanian_clergy
//      → classifier identity must NOT be active_parish or mass_continues.
//   2. classifier identity=active_parish → watch lithuanianMass must be true.
// Violations block the build, same discipline as the locked figures.
import { readFileSync } from "node:fs";

const read = (p) =>
  JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), "utf8"));
const alerts = read("canonical-current-events-projection.json");
const sit = read("parish-situation.json").parishes;

const bad = [];
for (const e of alerts.sustainabilityWatch ?? []) {
  const slug = e.parishLink.split("/").pop();
  const s = sit[slug];
  if (!s) continue;
  const id = s.lithuanian_identity;
  const noMass = e.liturgy?.lithuanianMass === false;
  const noClergy = e.clergy?.arrangement === "no_lithuanian_clergy";
  if (noMass && noClergy && (id === "active_parish" || id === "mass_continues"))
    bad.push(
      `${slug}: classifier says "${id}" but watch research found no Lithuanian Mass and no Lithuanian clergy`,
    );
  if (id === "active_parish" && e.liturgy && e.liturgy.lithuanianMass !== true)
    bad.push(
      `${slug}: classifier says "active_parish" but watch research does not confirm a Lithuanian Mass`,
    );
}

if (bad.length) {
  console.error(
    `CLASSIFIER/WATCH CONTRADICTIONS (${bad.length}) — reconcile before shipping:`,
  );
  for (const b of bad) console.error("  " + b);
  process.exit(1);
}
console.log(
  `OK: classifier agrees with all ${alerts.sustainabilityWatch?.length ?? 0} watch entries.`,
);
