// Import generated canonical projections from the sibling CultureNet Brain
// checkout. These files are committed build caches for deployments; they are
// never authored or adjudicated in the site repository.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const brainRoot = resolve(
  process.env.CULTURENET_BRAIN_ROOT ??
    new URL("../../culturenet-brain/", import.meta.url).pathname,
);

const jsonPairs = [
  [
    "docs/research/parish-canon/publication-projection.json",
    "../data/canonical-publication-projection.json",
  ],
  [
    "docs/research/parish-canon/infographic-projection.json",
    "../data/canonical-infographic-projection.json",
  ],
  [
    "docs/research/parish-canon/current-events/public-projection.json",
    "../data/canonical-current-events-projection.json",
  ],
  [
    "docs/research/parish-canon/case-files/manifest.json",
    "../data/canonical-case-files-manifest.json",
  ],
  [
    "docs/research/parish-canon/public-census-adjudications.json",
    "../data/canonical-public-census-adjudications.json",
  ],
  [
    "docs/research/parish-canon/public-display/registry-unified.json",
    "../data/registry-unified.json",
  ],
  [
    "docs/research/parish-canon/public-display/parish-situation.json",
    "../data/parish-situation.json",
  ],
  [
    "docs/research/parish-canon/public-display/parish-timelines.json",
    "../data/parish-timelines.json",
  ],
  [
    "docs/research/parish-canon/public-display/photos.json",
    "../data/photos.json",
  ],
  [
    "docs/research/parish-canon/public-display/manifest.json",
    "../data/canonical-public-display-manifest.json",
  ],
  [
    "docs/research/parish-canon/public-display/draugas-newspaper-records.json",
    "../data/canonical-draugas-newspaper-records.json",
  ],
  [
    "docs/research/parish-canon/public-display/draugas-parish-centered-title-focus-tranche1-2026-08-16/record-set.json",
    "../data/canonical-draugas-parish-centered-title-focus-tranche1.json",
  ],
  [
    "docs/research/parish-canon/public-display/draugas-parish-centered-title-focus-tranche1-2026-08-16/held-dispositions.json",
    "../data/canonical-draugas-parish-centered-title-focus-tranche1-held.json",
  ],
  [
    "docs/research/parish-canon/public-display/draugas-parish-centered-title-focus-tranche2-2026-08-16/record-set.json",
    "../data/canonical-draugas-parish-centered-title-focus-tranche2.json",
  ],
  [
    "docs/research/parish-canon/public-display/draugas-parish-centered-title-focus-tranche3-2026-08-17/record-set.json",
    "../data/canonical-draugas-parish-centered-title-focus-tranche3.json",
  ],
  [
    "docs/research/parish-canon/public-display/draugas-parish-centered-title-focus-tranche4-2026-08-17/record-set.json",
    "../data/canonical-draugas-parish-centered-title-focus-tranche4.json",
  ],
  [
    "docs/research/parish-canon/public-display/draugas-parish-centered-title-focus-tranche5-2026-08-17/record-set.json",
    "../data/canonical-draugas-parish-centered-title-focus-tranche5.json",
  ],
  [
    "docs/research/parish-preservation-deep-research/phase-2-reversal-database.json",
    "../data/reversal-database.json",
  ],
];

for (const [source, target] of jsonPairs) {
  const contents = readFileSync(resolve(brainRoot, source), "utf8");
  JSON.parse(contents);
  writeFileSync(new URL(target, import.meta.url), contents);
}

for (const [source, target] of [
  ["docs/research/draugas/parishes.csv", "../data/parishes.csv"],
]) {
  writeFileSync(
    new URL(target, import.meta.url),
    readFileSync(resolve(brainRoot, source)),
  );
}

const caseSource = resolve(
  brainRoot,
  "docs/research/parish-canon/case-files/current",
);
const caseTarget = new URL("../data/case-records/", import.meta.url);
for (const filename of readdirSync(caseSource).filter((name) => name.endsWith(".json"))) {
  const contents = readFileSync(resolve(caseSource, filename), "utf8");
  JSON.parse(contents);
  writeFileSync(new URL(filename, caseTarget), contents);
}

console.log("OK: imported canonical projections and Brain-owned case evidence from CultureNet Brain.");
