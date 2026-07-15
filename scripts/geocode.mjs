// One-time geocoder for the parish cities. Queries Nominatim (OpenStreetMap)
// at ~1 req/sec, writes data/geo.json keyed by "City|ST", and sanity-checks
// every result against its state's bounding box. Results are committed —
// rerun only when new cities enter the dataset.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parse } from "csv-parse/sync";

const GEO_PATH = new URL("../data/geo.json", import.meta.url);

// Rough state bounding boxes [minLat, maxLat, minLon, maxLon] for sanity checks.
const STATE_BOUNDS = {
  CA: [32.5, 42.1, -124.5, -114.1],
  CT: [40.9, 42.1, -73.8, -71.8],
  IA: [40.3, 43.6, -96.7, -90.1],
  IL: [36.9, 42.6, -91.6, -87.0],
  IN: [37.7, 41.8, -88.1, -84.7],
  MA: [41.2, 42.9, -73.6, -69.9],
  MD: [37.8, 39.8, -79.5, -75.0],
  MI: [41.6, 48.3, -90.5, -82.1],
  MO: [35.9, 40.7, -95.8, -89.1],
  NE: [39.9, 43.1, -104.1, -95.3],
  NH: [42.6, 45.4, -72.6, -70.6],
  NJ: [38.8, 41.4, -75.6, -73.8],
  NY: [40.4, 45.1, -79.9, -71.8],
  OH: [38.4, 42.0, -84.9, -80.5],
  PA: [39.7, 42.6, -80.6, -74.6],
  RI: [41.1, 42.1, -71.9, -71.1],
  QC: [44.9, 62.6, -79.8, -57.0],
  ON: [41.6, 56.9, -95.2, -74.3],
};

const rows = parse(readFileSync(new URL("../data/parishes.csv", import.meta.url)), {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

const existing = existsSync(GEO_PATH) ? JSON.parse(readFileSync(GEO_PATH, "utf-8")) : {};
const pairs = [...new Set(rows.map((r) => `${r.city}|${r.state}`))];
const missing = pairs.filter((p) => !existing[p]);
console.log(`${pairs.length} unique city/state pairs, ${missing.length} to geocode`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const pair of missing) {
  const [city, state] = pair.split("|");
  const country = state === "QC" || state === "ON" ? "Canada" : "USA";
  const q = encodeURIComponent(`${city}, ${state}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "SaveOurLithuanianParishes.org data build (vboguta@gmail.com)" },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status} for ${pair}`);
  const hits = await res.json();
  if (!hits.length) throw new Error(`No geocode result for ${pair}`);
  const lat = Number(hits[0].lat);
  const lon = Number(hits[0].lon);
  const b = STATE_BOUNDS[state];
  if (!b) throw new Error(`No bounds defined for state ${state}`);
  if (lat < b[0] || lat > b[1] || lon < b[2] || lon > b[3]) {
    throw new Error(`Geocode for ${pair} out of ${state} bounds: ${lat}, ${lon} (${hits[0].display_name})`);
  }
  existing[pair] = { lat, lon, source: "nominatim", place: hits[0].display_name };
  console.log(`  ${pair} -> ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  await sleep(1100);
}

const sorted = Object.fromEntries(Object.entries(existing).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(GEO_PATH, JSON.stringify(sorted, null, 2) + "\n");
console.log(`OK: wrote ${Object.keys(sorted).length} entries to data/geo.json`);
