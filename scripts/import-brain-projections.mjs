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

console.log(
  "OK: imported canonical publication and infographic projections from CultureNet Brain.",
);
