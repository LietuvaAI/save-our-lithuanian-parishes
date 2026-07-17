// Builds data/candidates/map.json: pre-projected points for the UNVERIFIED
// historical-candidate layer. Same geoAlbersUsa 975x610 frame as
// scripts/build-map.mjs. Only candidates not already matched to the canonical
// record (likelyKnown: false) are plotted; they never touch the canonical
// dataset or its locked figures — this is a separate, clearly-labeled layer.
import { readFileSync, writeFileSync } from "node:fs";
import { geoAlbersUsa } from "d3-geo";

const CANDIDATES_PATH = new URL("../data/candidates/web-historical-2026-07-15.json", import.meta.url);
const GEO_PATH = new URL("../data/candidates/geo.json", import.meta.url);
const OUT_PATH = new URL("../data/candidates/map.json", import.meta.url);

const { corpusScope, parishes } = JSON.parse(readFileSync(CANDIDATES_PATH, "utf-8"));
const geo = JSON.parse(readFileSync(GEO_PATH, "utf-8"));

const projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);

const fresh = parishes.filter((p) => !p.likelyKnown);
const byCity = new Map();
for (const p of fresh) {
  const key = `${p.city}|${p.state}`;
  if (!byCity.has(key)) byCity.set(key, []);
  byCity.get(key).push(p);
}

const points = [];
for (const [key, group] of byCity) {
  const g = geo[key];
  if (!g) throw new Error(`No geocode entry for ${key} — run scripts/geocode-candidates.mjs`);
  const projected = projection([g.lon, g.lat]);
  if (!projected) throw new Error(`Projection failed for ${key}`);
  const [cx, cy] = projected;
  group.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  const n = group.length;
  group.forEach((p, i) => {
    // Candidates ring slightly wider than the canonical fan so they don't
    // sit exactly on top of canonical marks in shared cities.
    const r = n === 1 ? 4 : 10 + 1.2 * n;
    const angle = (2 * Math.PI * i) / n - Math.PI / 4;
    points.push({
      id: `${p.nameEn}|${key}`.toLowerCase().replace(/[^a-z0-9|]+/g, "-"),
      nameEn: p.nameEn,
      city: p.city,
      state: p.state,
      foundedYear: p.foundedYear ?? null,
      closedYear: p.closedYear ?? null,
      currentStatus: p.currentStatus ?? "unknown",
      confidence: p.confidence ?? "unverified",
      x: +(cx + r * Math.cos(angle)).toFixed(1),
      y: +(cy + r * Math.sin(angle)).toFixed(1),
    });
  });
}

if (points.length !== fresh.length) {
  throw new Error(`Point count ${points.length} != new-candidate count ${fresh.length}`);
}

writeFileSync(OUT_PATH, JSON.stringify({ corpusScope, points }) + "\n");
console.log(`OK: candidates/map.json with ${points.length} projected candidate points (${byCity.size} cities).`);
