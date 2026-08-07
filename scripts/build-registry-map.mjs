// Builds data/registry-map.json: pre-projected points for the RESEARCH-RECORD
// layer — every parish/congregation in the unified registry (corpusScope
// parish-registry-unified) that is not already represented in map.json.
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
const publication = JSON.parse(
  readFileSync(
    new URL("../data/canonical-publication-projection.json", import.meta.url),
    "utf-8",
  ),
);
const infographic = JSON.parse(
  readFileSync(
    new URL("../data/canonical-infographic-projection.json", import.meta.url),
    "utf-8",
  ),
);
const institutionByRegistrySlug = new Map(
  publication.public_institutions.map((institution) => [
    institution.registry_slug,
    institution,
  ]),
);
const canonicalEntityById = new Map(
  publication.canonical_entities.map((entity) => [entity.id, entity]),
);
const infographicByRegistrySlug = new Map(
  infographic.institution_history.map((institution) => [
    institution.registry_slug,
    institution,
  ]),
);
const geoCache = {
  ...JSON.parse(readFileSync(GEO_CAND, "utf-8")),
  ...JSON.parse(readFileSync(GEO_MAIN, "utf-8")),
};

// Classifier overlay — carries researched lithuanian_identity for registry
// supplemental registry entries, so the map can distinguish a standing
// Lithuanian parish from a standing church whose ethnic mission moved on.
const SIT_PATH = new URL("../data/parish-situation.json", import.meta.url);
const situationByRegistrySlug = new Map(
  Object.values(JSON.parse(readFileSync(SIT_PATH, "utf-8")).parishes).map(
    (e) => [e.registry_slug, e],
  ),
);

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

// The registry map shows U.S. institutions plus Canadian comparators. Other
// international records and research-only object types stay out explicitly.
function isNorthAmerica(rec) {
  return rec.country === "US" || rec.country === "CA";
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

function canonicalLifecycleOf(record) {
  const institution = institutionByRegistrySlug.get(record.slug);
  return institution
    ? canonicalEntityById.get(institution.culturenet_entity_id)?.lifecycle
    : null;
}

function foundedYearOf(record) {
  const projected = infographicByRegistrySlug.get(record.slug);
  if (projected) return projected.founded.year;
  const lifecycle = canonicalLifecycleOf(record);
  return lifecycle ? yearOf([{ value: lifecycle.start }]) : yearOf(record.years?.founded);
}

function closedYearOf(record) {
  const projected = infographicByRegistrySlug.get(record.slug);
  if (projected) return projected.closed.year;
  const lifecycle = canonicalLifecycleOf(record);
  if (lifecycle) {
    return yearOf([{ value: lifecycle.end }], { closing: true });
  }
  if (record.lifecycle) {
    return record.lifecycle.selected_closed_year ?? null;
  }
  return yearOf(record.years?.closed, { closing: true });
}

// Only institutional records belong on the public map. Historical phases,
// unresolved leads, context references, and "no parish" settlements remain
// in the research registry without becoming public parish dots.
function isPublicRecord(rec) {
  return (
    ["parish", "misija", "congregation"].includes(rec.record_type) &&
    (rec.public_census?.included === true ||
      rec.public_census?.scope === "canadian_comparator") &&
    !(rec.sources ?? []).some((s) => /no parish/i.test(s.ethnic_status ?? ""))
  );
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

// Include: every registry record WITHOUT a canonical case row (c83_row).
// Rows with a case row — including the non-Roman-Catholic canonical
// additions (rows 78-83) — render from parishes.json/map.json; plotting
// them here too double-counted five parishes (homepage "All" said 204
// while The Record said 199 — caught by Vilija 2026-07-27).
// Exclude: Argentina mis-codes and non-public research records.
const toPlot = registry.parishes.filter(
  (r) => r.c83_row == null && isPublicRecord(r) && isNorthAmerica(r)
);

for (const r of toPlot) {
  const ll = lonLatOf(r);
  const projected = ll && projection(ll);
  if (!projected) {
    skippedNoGeo++;
    continue;
  }
  const isCong = r.record_type === "congregation";
  const projectedInstitution = infographicByRegistrySlug.get(r.slug);
  const closedYear = closedYearOf(r);
  points.push({
    kind: isCong ? "congregation" : "parish",
    slug: r.slug,
    name: r.names.lt || r.names.en || r.slug,
    city: r.city_history?.[0] || r.city,
    state: r.state,
    country: r.country,
    foundedYear: foundedYearOf(r),
    closedYear,
    // lockedStanding: comparator parishes and web-confirmed-standing parishes
    // show as open on the map; non_catholic_christian entries are confirmed
    // active if they have a truelithuania source.
    lockedStanding:
      projectedInstitution
        ? ["active_parish", "mass_continues"].includes(
            projectedInstitution.status_group,
          )
        : !closedYear &&
          r.lifecycle?.canonical_status !== "unresolved" &&
          (r.lifecycle?.canonical_status === "standing" ||
            (r.comparator === true &&
              ["standing", "community_decided"].includes(
                r.locked?.ending_mode ?? "",
              )) ||
            (r.sources ?? []).some(
              (s) =>
                (s.axis === "web-historical" &&
                  /^(standing|open)/i.test(s.currentStatus ?? "")) ||
                s.axis === "truelithuania",
            )),
    depth: r.record_depth,
    identity: (() => {
      if (projectedInstitution) {
        if (projectedInstitution.status_group === "active_parish") {
          return "active_parish";
        }
        if (projectedInstitution.status_group === "mass_continues") {
          return "mass_continues";
        }
        if (projectedInstitution.status_group === "transferred") {
          return "ethnically_transferred";
        }
        if (projectedInstitution.status_group === "closed") return "lost";
      }
      const v = situationByRegistrySlug.get(r.slug)?.lithuanian_identity;
      return v && v !== "unknown" ? v : null;
    })(),
    buildingFate: projectedInstitution?.building_fate ?? null,
    buildingFateAuthority:
      projectedInstitution?.building_fate_authority ?? "unresolved",
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
    note: "Public institutional map layer: parishes, missions, and congregations in the U.S. and Canada. Historical phases, unresolved leads, and context records remain in the research registry but are not mapped.",
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
