// Builds data/diocese-overlay.json: US Catholic diocese boundaries as
// pre-projected SVG paths in the same geoAlbersUsa 975x610 frame as the
// homepage map (us-atlas pre-projected counties → merged per diocese).
//
// Sources (both fully open):
//   - us-atlas counties-albers-10m.json — US Census TIGER geometry,
//     public domain, pre-projected to the standard 975x610 frame.
//   - data/diocese-counties.csv — county→diocese crosswalk from
//     github.com/kburchfiel/us_diocese_mapper (released into the public
//     domain per its license.md; captured 2026-07-25; split counties carry
//     the source's primary-diocese assignment).
//
// Output: one merged boundary path per diocese + one interior-borders mesh.
// Presentation-layer only — no figures derive from this file.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoPath } from "d3-geo";
import { merge, mesh } from "topojson-client";

const require = createRequire(import.meta.url);
const topo = require("us-atlas/counties-albers-10m.json");

// ── Crosswalk: county GEOID → diocese ───────────────────────────────────────
const csv = readFileSync(
  new URL("../data/diocese-counties.csv", import.meta.url),
  "utf-8",
);
const dioceseByFips = new Map();
for (const line of csv.split("\n").slice(1)) {
  if (!line.trim()) continue;
  // GEOID,county_state,Diocese,Diocese_Detail,Province — county_state is quoted
  const m = line.match(/^(\d+),/);
  const dio = line.split('",')[1]?.split(",")[0] ?? line.split(",")[2];
  if (!m || !dio) continue;
  dioceseByFips.set(m[1].padStart(5, "0"), dio.trim());
}

// ── Group county geometries by diocese ──────────────────────────────────────
const byDiocese = new Map();
for (const g of topo.objects.counties.geometries) {
  const dio = dioceseByFips.get(String(g.id).padStart(5, "0"));
  if (!dio) continue;
  if (!byDiocese.has(dio)) byDiocese.set(dio, []);
  byDiocese.get(dio).push(g);
}

const path = geoPath().digits(1);

const dioceses = [];
for (const [name, geoms] of [...byDiocese.entries()].sort((a, b) =>
  a[0].localeCompare(b[0]),
)) {
  const merged = merge(topo, geoms);
  const [cx, cy] = path.centroid(merged);
  dioceses.push({
    name,
    path: path(merged),
    cx: +cx.toFixed(1),
    cy: +cy.toFixed(1),
    counties: geoms.length,
  });
}

// Interior diocese-to-diocese borders only (coastline/state chrome is drawn
// by the base map already).
const dioOf = (g) => dioceseByFips.get(String(g.id).padStart(5, "0"));
const borders = path(
  mesh(topo, topo.objects.counties, (a, b) => a !== b && dioOf(a) !== dioOf(b)),
);

// ── Match report against the registry's diocese names ───────────────────────
const registry = JSON.parse(
  readFileSync(new URL("../data/registry-unified.json", import.meta.url), "utf-8"),
);
const normalize = (raw) => {
  if (!raw) return null;
  let d = raw.replace(/\s*\(.*\)$/, "").replace(/\s*\/.*$/, "").trim();
  if (/bellevue/i.test(d)) d = "Diocese of Belleville";
  if (/unspecified/i.test(raw)) return null;
  return d || null;
};
const ourNames = new Set();
for (const p of registry.parishes) {
  const n = normalize(p.diocese);
  if (n) ourNames.add(n.replace(/^(Arch)?diocese of /i, ""));
}
// Known naming differences between our registry and the crosswalk.
const ALIASES = {
  // ours → crosswalk
};
const overlayNames = new Set(dioceses.map((d) => d.name));
const unmatched = [...ourNames].filter(
  (n) => !overlayNames.has(ALIASES[n] ?? n),
);
if (unmatched.length) {
  console.warn(
    `WARN: ${unmatched.length} registry dioceses have no overlay match (add ALIASES): ${unmatched.join(" | ")}`,
  );
}

const out = {
  note: "Diocese boundaries in the pre-projected geoAlbersUsa 975x610 frame. Counties (US Census, public domain) merged per diocese via the public-domain crosswalk from github.com/kburchfiel/us_diocese_mapper. Presentation-layer only.",
  frame: { w: 975, h: 610 },
  borders,
  dioceses,
};
writeFileSync(
  new URL("../data/diocese-overlay.json", import.meta.url),
  JSON.stringify(out) + "\n",
);
console.log(
  `OK: diocese-overlay.json — ${dioceses.length} dioceses, ${(JSON.stringify(out).length / 1024).toFixed(0)}KB; registry match ${ourNames.size - unmatched.length}/${ourNames.size}.`,
);
