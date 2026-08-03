// Import generated canonical projections from the sibling CultureNet Brain
// checkout. These files are committed build caches for deployments; they are
// never authored or adjudicated in the site repository.
import { readFileSync, writeFileSync } from "node:fs";

const pairs = [
  [
    "../../culturenet-brain/docs/research/parish-canon/publication-projection.json",
    "../data/canonical-publication-projection.json",
  ],
  [
    "../../culturenet-brain/docs/research/parish-canon/infographic-projection.json",
    "../data/canonical-infographic-projection.json",
  ],
];

for (const [source, target] of pairs) {
  const contents = readFileSync(new URL(source, import.meta.url), "utf8");
  JSON.parse(contents);
  writeFileSync(new URL(target, import.meta.url), contents);
}

const infographic = JSON.parse(
  readFileSync(
    new URL(
      "../../culturenet-brain/docs/research/parish-canon/infographic-projection.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const pastoralDirectory = infographic.current_pastoral_network?.directory;
if (!pastoralDirectory) {
  throw new Error("Brain infographic projection lacks the canonical pastoral directory");
}
writeFileSync(
  new URL("../data/sielovada-us-network.json", import.meta.url),
  `${JSON.stringify(pastoralDirectory, null, 2)}\n`,
);

console.log("OK: imported canonical projections and pastoral directory from CultureNet Brain.");
