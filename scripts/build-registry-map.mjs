// Builds data/registry-map.json: pre-projected points for the RESEARCH-RECORD
// layer — every parish/congregation in the unified registry (corpusScope
// parish-registry-unified) that is NOT in the case-filed core (map.json).
// non_catholic_christian entries are included here regardless of in_locked_scope
// because they are never in parishes.json/map.json. Same geoAlbersUsa 975x610
// frame as scripts/build-map.mjs.
//
// Discipline: presentation-layer only — no figures derive from this file; the
// canonical layer and locked figures are untouched. Records without usable
// geo are SKIPPED and counted (never invented); Canada cannot project in
// geoAlbersUsa and is counted separately.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoConicEqualArea, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
// Canada outline so Canadian parishes sit on land, not in a void.
const world = require("world-atlas/countries-110m.json");

const REGISTRY_PATH = new URL("../data/registry-unified.json", import.meta.url);
const GEO_MAIN = new URL("../data/geo.json", import.meta.url);
const GEO_CAND = new URL("../data/candidates/geo.json", import.meta.url);
const OUT_PATH = new URL("../data/registry-map.json", import.meta.url);

const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf-8"));
const geoCache = {
  ...JSON.parse(readFileSync(GEO_CAND, "utf-8")),
  ...JSON.parse(readFileSync(GEO_MAIN, "utf-8")),
};

// The exact lower-48 component of geoAlbersUsa — identical to the canonical
// map's projection for the mainland US, but (unlike the composite) it also
// projects southern Canada, so Canadian parishes join the same frame
// (Canada on the map is Vilija's rule, 2026-07-21; Alaska/Hawaii have no
// registry entries, so the composite's insets aren't needed here).
const projection = geoConicEqualArea()
  .rotate([96, 0])
  .center([-0.6, 38.7])
  .parallels([29.5, 45.5])
  .scale(1300)
  .translate([487.5, 305]);

// Non-North-American records (e.g. Argentina entries mis-coded state "AR")
// stay out of the map and site counts entirely — the record's scope is the
// U.S. with Canada as the comparator exception (Vilija 2026-07-21).
function isNorthAmerica(rec) {
  return !/buenos aires|argentin|rosario/i.test(rec.city ?? "");
}

const AXIS_LABEL = {
  "draugas-2008-2026": "Draugas record (2008–2026)",
  "draugas-registry-1909-2007": "Draugas record (1909–2007)",
  wolkovich: "Wolkovich compendium",
  truelithuania: "field survey",
  "web-historical": "web research",
  "michelsonas-1961": "Michelsonas (1961)",
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
let skippedNoGeo = 0;

// Include:
//   - All non-locked registry entries (the research record beyond the case-filed core)
//   - non_catholic_christian AND national_catholic_pncc entries regardless of locked
//     status — neither class ever appears in parishes.json/map.json, so this is their
//     only map rendering path.
// Exclude: Argentina mis-codes, "no parish" civic associations.
const NON_ROMAN = new Set(["non_catholic_christian", "national_catholic_pncc"]);
const toPlot = registry.parishes.filter(
  (r) =>
    (!r.in_locked_scope || NON_ROMAN.has(r.congregation_class)) &&
    isRealParish(r) &&
    isNorthAmerica(r)
);

for (const r of toPlot) {
  const ll = lonLatOf(r);
  const projected = ll && projection(ll);
  if (!projected) {
    skippedNoGeo++;
    continue;
  }
  const isCong = r.congregation_class === "non_catholic_christian";
  points.push({
    kind: isCong ? "congregation" : "parish",
    slug: r.slug,
    name: r.names.lt || r.names.en || r.slug,
    city: r.city_history?.[0] || r.city,
    state: r.state,
    country: r.country,
    foundedYear: yearOf(r.years?.founded),
    closedYear: yearOf(r.years?.closed, { closing: true }),
    // lockedStanding: comparator parishes and web-confirmed-standing parishes
    // show as open on the map; non_catholic_christian entries are confirmed
    // active if they have a truelithuania source.
    lockedStanding:
      !yearOf(r.years?.closed, { closing: true }) && (
        (r.comparator === true &&
          ["standing", "community_decided"].includes(r.locked?.ending_mode ?? "")) ||
        (r.sources ?? []).some(
          (s) =>
            (s.axis === "web-historical" && /^(standing|open)/i.test(s.currentStatus ?? "")) ||
            s.axis === "truelithuania"
        )
      ),
    depth: r.record_depth,
    congregationClass: r.congregation_class,
    documentedIn: [...new Set(r.sources.map((s) => AXIS_LABEL[s.axis] ?? s.axis))],
    hasConflicts: (r.conflicts?.length ?? 0) > 0,
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

// Extend the frame north to fit Canadian points; the SVG viewBox clips the
// Canada outline to whatever frame we emit.
const minY = Math.min(0, ...out.map((p) => p.y));
const frame = {
  x: 0,
  y: Math.floor(minY - 18),
  w: 975,
  h: 610 + (0 - Math.floor(minY - 18)),
};

const canadaFeature = feature(world, world.objects.countries).features.find(
  (f) => f.id === "124"
);
const canadaPath = geoPath(projection)(canadaFeature);

writeFileSync(
  OUT_PATH,
  JSON.stringify({
    corpusScope: "parish-registry-unified",
    note: "Research-record layer: all registry entries not in the case-filed core (US + Canada), including all non_catholic_christian congregations. Presentation-layer only; no figures derive from this file.",
    counts: {
      plotted: out.length,
      parishes: out.filter((p) => p.kind === "parish").length,
      congregations: out.filter((p) => p.kind === "congregation").length,
      canada: out.filter((p) => p.country === "CA").length,
      skippedNoGeo,
    },
    frame,
    canadaPath,
    points: out,
  }) + "\n",
);
console.log(
  `OK: registry-map.json with ${out.length} research-record points (${out.filter((p) => p.kind === "parish").length} parishes + ${out.filter((p) => p.kind === "congregation").length} congregations; ${out.filter((p) => p.country === "CA").length} in Canada; skipped ${skippedNoGeo} without geo; frame y=${frame.y}).`,
);
