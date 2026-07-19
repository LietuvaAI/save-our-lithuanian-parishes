// Geocoder for unified-registry places lacking coordinates. Same contract as
// geocode.mjs (Nominatim ~1 req/sec, state-bounds sanity check, results
// committed to data/geo.json) with three additions: city-string cleanup for
// compound registry names, county disambiguators from data/gazetteer.csv
// (Draugas 1909–2007 FINAL deliverable), and skip-don't-throw semantics —
// a place that cannot be confidently geocoded stays needs_geocode and is
// reported as an upstream lead. Never guess.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parse } from "csv-parse/sync";

const GEO_PATH = new URL("../data/geo.json", import.meta.url);

const STATE_BOUNDS = {
  AZ: [31.3, 37.1, -114.9, -109.0],
  CA: [32.5, 42.1, -124.5, -114.1],
  CO: [36.9, 41.1, -109.1, -102.0],
  CT: [40.9, 42.1, -73.8, -71.8],
  IA: [40.3, 43.6, -96.7, -90.1],
  IL: [36.9, 42.6, -91.6, -87.0],
  IN: [37.7, 41.8, -88.1, -84.7],
  KS: [36.9, 40.1, -102.1, -94.5],
  MA: [41.2, 42.9, -73.6, -69.9],
  MD: [37.8, 39.8, -79.5, -75.0],
  ME: [42.9, 47.5, -71.1, -66.8],
  MI: [41.6, 48.3, -90.5, -82.1],
  MN: [43.4, 49.4, -97.3, -89.4],
  MO: [35.9, 40.7, -95.8, -89.1],
  NE: [39.9, 43.1, -104.1, -95.3],
  NH: [42.6, 45.4, -72.6, -70.6],
  NJ: [38.8, 41.4, -75.6, -73.8],
  NY: [40.4, 45.1, -79.9, -71.8],
  OH: [38.4, 42.0, -84.9, -80.5],
  OK: [33.6, 37.1, -103.1, -94.4],
  OR: [41.9, 46.3, -124.6, -116.4],
  PA: [39.7, 42.6, -80.6, -74.6],
  RI: [41.1, 42.1, -71.9, -71.1],
  WI: [42.4, 47.1, -92.9, -86.7],
  QC: [44.9, 62.6, -79.8, -57.0],
  ON: [41.6, 56.9, -95.2, -74.3],
  MB: [48.9, 60.1, -102.1, -88.9],
};

// Upstream data-quality skips (leads reported to the research lane; never guessed here):
const SKIP = new Map([
  ["Avellaneda (suburb of Buenos Aires)|AR", "Argentina row mis-coded as US/AR — out of US/CA scope; fix country upstream"],
  ["Rosario|AR", "Argentina row mis-coded as US/AR — out of US/CA scope; fix country upstream"],
  ["Kansas City|KA", "invalid state code KA — upstream twin-Kansas-Cities row needs KS/MO fix"],
  ["Minneapolis|MI", "Minneapolis is MN, not MI — upstream state fix needed"],
  ["Hartshorne|IN", "Hartshorne is an Oklahoma coal town — upstream state fix needed (IN→OK)"],
]);

// Compound registry city strings -> the geocodable town
function cleanCity(city) {
  let c = city.replace(/\(.*?\)/g, " ").split("/")[0].replace(/\s+/g, " ").trim();
  if (/^indian harbou?r$/i.test(c)) c = "East Chicago";
  if (/^du bois$/i.test(c)) c = "DuBois";
  return c.replace(/,\s*$/, "");
}

const reg = JSON.parse(readFileSync(new URL("../data/registry-unified.json", import.meta.url)));
const gaz = parse(
  readFileSync(new URL("../data/gazetteer.csv", import.meta.url), "utf-8")
    .split("\n").filter((l) => !l.startsWith("#")).join("\n"),
  { columns: true, skip_empty_lines: true, trim: true }
);
const countyOf = new Map();
for (const g of gaz) {
  if (g.county) countyOf.set(`${(g.city || "").toLowerCase()}|${g.state}`, g.county);
}

const need = new Map();
for (const r of reg.parishes) {
  if (r.geo?.needs_geocode && r.city && r.state) need.set(`${r.city}|${r.state}`, r);
}
const existing = existsSync(GEO_PATH) ? JSON.parse(readFileSync(GEO_PATH, "utf-8")) : {};
const todo = [...need.keys()].filter((p) => !existing[p]);
console.log(`${need.size} unique places lacking geo; ${todo.length} not yet in cache`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const skipped = [];
let ok = 0;

for (const pair of todo) {
  const [rawCity, state] = pair.split("|");
  if (SKIP.has(pair)) { skipped.push([pair, SKIP.get(pair)]); continue; }
  const bounds = STATE_BOUNDS[state];
  if (!bounds) { skipped.push([pair, `no bounds for state ${state}`]); continue; }
  const city = cleanCity(rawCity);
  const country = ["QC", "ON", "MB"].includes(state) ? "Canada" : "USA";
  const county = countyOf.get(`${city.toLowerCase()}|${state}`);
  const q = encodeURIComponent(county ? `${city}, ${county} County, ${state}, ${country}` : `${city}, ${state}, ${country}`);
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
    headers: { "User-Agent": "SaveOurLithuanianParishes.org data build (vboguta@gmail.com)" },
  });
  if (!res.ok) { skipped.push([pair, `Nominatim ${res.status}`]); await sleep(1100); continue; }
  const hits = await res.json();
  if (!hits.length) { skipped.push([pair, "no result"]); await sleep(1100); continue; }
  const lat = Number(hits[0].lat), lon = Number(hits[0].lon);
  if (lat < bounds[0] || lat > bounds[1] || lon < bounds[2] || lon > bounds[3]) {
    skipped.push([pair, `out of ${state} bounds: ${hits[0].display_name}`]);
    await sleep(1100);
    continue;
  }
  existing[pair] = { lat, lon, source: "nominatim", place: hits[0].display_name };
  ok++;
  console.log(`  ok ${pair} -> ${lat.toFixed(4)}, ${lon.toFixed(4)}${county ? ` (via ${county} County)` : ""}`);
  await sleep(1100);
}

const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(GEO_PATH, JSON.stringify(sorted, null, 2) + "\n");
console.log(`\nOK: ${ok} geocoded; ${skipped.length} skipped (stay needs_geocode). Cache now ${Object.keys(sorted).length} entries.`);
for (const [p, why] of skipped) console.log(`  SKIP ${p}: ${why}`);
