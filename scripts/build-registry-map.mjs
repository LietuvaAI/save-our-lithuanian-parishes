// Builds data/registry-map.json: pre-projected points for the RESEARCH-RECORD
// layer — every parish in the unified registry (corpusScope
// parish-registry-unified) that is NOT one of the canonical 83, plus the 11
// non-Catholic Lithuanian Christian congregations (distinct mark per Vilija
// 2026-07-18). Same geoAlbersUsa 975x610 frame as scripts/build-map.mjs.
//
// Discipline: presentation-layer only — no figures derive from this file; the
// canonical layer and locked figures are untouched. Records without usable
// geo are SKIPPED and counted (never invented); Canada cannot project in
// geoAlbersUsa and is counted separately.
import { readFileSync, writeFileSync } from "node:fs";
import { geoAlbersUsa } from "d3-geo";

const REGISTRY_PATH = new URL("../data/registry-unified.json", import.meta.url);
const CONG_PATH = new URL("../data/non-catholic-congregations.json", import.meta.url);
const GEO_MAIN = new URL("../data/geo.json", import.meta.url);
const GEO_CAND = new URL("../data/candidates/geo.json", import.meta.url);
const OUT_PATH = new URL("../data/registry-map.json", import.meta.url);

const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf-8"));
const congs = JSON.parse(readFileSync(CONG_PATH, "utf-8")).congregations;
const geoCache = {
  ...JSON.parse(readFileSync(GEO_CAND, "utf-8")),
  ...JSON.parse(readFileSync(GEO_MAIN, "utf-8")),
};

const projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);

const AXIS_LABEL = {
  "draugas-2008-2026": "Draugas record (2008–2026)",
  "draugas-registry-1909-2007": "Draugas record (1909–2007)",
  wolkovich: "Wolkovich compendium",
  truelithuania: "field survey",
  "web-historical": "web research",
};

function yearOf(variants, { closing = false } = {}) {
  // First numeric year among carried variants; null when the record has none.
  // Registry year values can be narrative ("still active at time of writing
  // (…1911…)") — a year inside a still-active note is NOT a closing year.
  for (const v of variants ?? []) {
    const text = String(v.value ?? "");
    if (closing && /still active|active at time|remains active/i.test(text)) continue;
    const m = text.match(/\b(1[89]\d\d|20\d\d)\b/);
    if (m) return Number(m[1]);
  }
  return null;
}

// Registry entries whose own sources say "no parish" are settlements or
// civic/memorial associations — documented, but not parishes; keep them
// off the parish map and out of parish counts.
function isRealParish(rec) {
  return !(rec.sources ?? []).some((s) => /no parish/i.test(s.ethnic_status ?? ""));
}

function lonLatOf(rec) {
  const g = rec.geo ?? {};
  if (g.lat != null && g.lon != null) return [g.lon, g.lat];
  const cached = geoCache[`${rec.city}|${rec.state}`];
  if (cached) return [cached.lon, cached.lat];
  return null;
}

const points = [];
let skippedCanada = 0;
let skippedNoGeo = 0;

const nonCanonical = registry.parishes.filter(
  (r) => !r.in_locked_scope && !r.comparator && isRealParish(r)
);
for (const r of nonCanonical) {
  if (r.country === "CA") {
    skippedCanada++;
    continue;
  }
  const ll = lonLatOf(r);
  const projected = ll && projection(ll);
  if (!projected) {
    skippedNoGeo++;
    continue;
  }
  points.push({
    kind: "parish",
    slug: r.slug,
    name: r.names.lt || r.names.en || r.slug,
    city: r.city,
    state: r.state,
    foundedYear: yearOf(r.years?.founded),
    closedYear: yearOf(r.years?.closed, { closing: true }),
    depth: r.record_depth, // "multi-source" | "single-source"
    congregationClass: r.congregation_class,
    documentedIn: [...new Set(r.sources.map((s) => AXIS_LABEL[s.axis] ?? s.axis))],
    hasConflicts: (r.conflicts?.length ?? 0) > 0,
    lon: ll[0],
    lat: ll[1],
  });
}

for (const c of congs) {
  const ll = c.geo?.lat != null ? [c.geo.lon, c.geo.lat] : (geoCache[`${c.city}|${c.state}`] ? [geoCache[`${c.city}|${c.state}`].lon, geoCache[`${c.city}|${c.state}`].lat] : null);
  const projected = ll && projection(ll);
  if (!projected) {
    skippedNoGeo++;
    continue;
  }
  points.push({
    kind: "congregation",
    slug: c.slug,
    name: c.name,
    city: c.city || c.city_history?.[0] || "",
    state: c.state,
    foundedYear: null,
    closedYear: null,
    depth: c.sources.length > 1 ? "multi-source" : "single-source",
    congregationClass: "non_catholic_christian",
    documentedIn: [...new Set(c.sources.map((s) => AXIS_LABEL[s.axis] ?? s.axis))],
    hasConflicts: false,
    lon: ll[0],
    lat: ll[1],
  });
}

// City-fan so shared-city points don't stack on the canonical marks.
const byCity = new Map();
for (const p of points) {
  const key = `${p.city}|${p.state}`;
  if (!byCity.has(key)) byCity.set(key, []);
  byCity.get(key).push(p);
}
const out = [];
for (const [, group] of byCity) {
  group.sort((a, b) => a.name.localeCompare(b.name));
  const n = group.length;
  group.forEach((p, i) => {
    const [cx, cy] = projection([p.lon, p.lat]);
    const r = n === 1 ? 5 : 11 + 1.3 * n;
    const angle = (2 * Math.PI * i) / n - Math.PI / 3;
    const { lon: _lon, lat: _lat, ...rest } = p;
    out.push({
      ...rest,
      x: +(cx + (n === 1 ? 0 : r * Math.cos(angle))).toFixed(1),
      y: +(cy + (n === 1 ? 0 : r * Math.sin(angle))).toFixed(1),
    });
  });
}

writeFileSync(
  OUT_PATH,
  JSON.stringify({
    corpusScope: "parish-registry-unified",
    note: "Research-record layer: registry parishes beyond the canonical 83 + non-Catholic congregations. Presentation-layer only; no figures derive from this file.",
    counts: {
      plotted: out.length,
      parishes: out.filter((p) => p.kind === "parish").length,
      congregations: out.filter((p) => p.kind === "congregation").length,
      skippedCanada,
      skippedNoGeo,
    },
    points: out,
  }) + "\n",
);
console.log(
  `OK: registry-map.json with ${out.length} research-record points (${out.filter((p) => p.kind === "parish").length} parishes + ${out.filter((p) => p.kind === "congregation").length} congregations; skipped ${skippedCanada} Canada, ${skippedNoGeo} without geo).`,
);
