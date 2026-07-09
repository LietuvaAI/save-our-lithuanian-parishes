// Builds data/map.json: pre-projected SVG geometry for the homepage map.
// State/nation outlines come from us-atlas (pre-projected to the standard
// d3 geoAlbersUsa 975x610 frame); parish points are projected with the same
// projection from committed data/geo.json. Same-city parishes are fanned
// into a small deterministic ring so none hide behind another.
// Canadian comparators are outside the projection and are not mapped.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";

const require = createRequire(import.meta.url);
const topo = require("us-atlas/states-albers-10m.json");

const parishes = JSON.parse(readFileSync(new URL("../data/parishes.json", import.meta.url), "utf-8"));
const geo = JSON.parse(readFileSync(new URL("../data/geo.json", import.meta.url), "utf-8"));

const path = geoPath(); // identity — the atlas is already projected
const nationPath = path(feature(topo, topo.objects.nation));
const stateBorders = path(mesh(topo, topo.objects.states, (a, b) => a !== b));

// The exact projection us-atlas pre-projected files were built with.
const projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);

const mappable = parishes.filter((p) => !p.comparator);
const byCity = new Map();
for (const p of mappable) {
  const key = `${p.city}|${p.state}`;
  if (!byCity.has(key)) byCity.set(key, []);
  byCity.get(key).push(p);
}

const points = [];
for (const [key, group] of byCity) {
  const g = geo[key];
  if (!g) throw new Error(`No geocode entry for ${key} — run scripts/geocode.mjs`);
  const projected = projection([g.lon, g.lat]);
  if (!projected) throw new Error(`Projection failed for ${key}`);
  const [cx, cy] = projected;
  group.sort((a, b) => a.slug.localeCompare(b.slug));
  const n = group.length;
  group.forEach((p, i) => {
    // Single parish sits on the city; groups fan around it in a ring.
    const r = n === 1 ? 0 : 7 + 1.2 * n;
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    points.push({
      slug: p.slug,
      x: +(cx + r * Math.cos(angle)).toFixed(1),
      y: +(cy + r * Math.sin(angle)).toFixed(1),
    });
  });
}

if (points.length !== mappable.length) {
  throw new Error(`Point count ${points.length} != US parish count ${mappable.length}`);
}

writeFileSync(
  new URL("../data/map.json", import.meta.url),
  JSON.stringify({ viewBox: "0 0 975 610", nationPath, stateBorders, points }) + "\n"
);
console.log(`OK: map.json with ${points.length} projected parish points (${byCity.size} cities).`);
