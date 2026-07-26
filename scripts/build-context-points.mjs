// Builds data/context-points.json — the ONE shared point layer for
// diocese-zoom context maps (the site's per-profile ParishContextMap and the
// Hearth dispatch renderer consume the same file, so the two can never
// drift). TRUE projected coordinates, deliberately un-fanned: the national
// map's same-city ring-fanning is a display trick that is geographically
// wrong at diocese zoom (2026-07-26 dispatch-session finding) — zoom
// renderers fan at their own scale.
//
// Every point: slug, name, city/state, x/y (geoAlbersUsa 975x610), end-state
// group (mirrors lib/end-state.ts resolveEndState — KEEP IN SYNC; undecided
// endingMode renders unresolved, never closed: binding guardrail), closed
// year, congregation class, normalized diocese, profile href.
import { readFileSync, writeFileSync } from "node:fs";
import { geoAlbersUsa } from "d3-geo";

const read = (p) =>
  JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), "utf8"));

const PROJ = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const registry = read("registry-unified.json");
const libParishes = read("parishes.json");
const situation = read("parish-situation.json").parishes;
const geoCache = {
  ...read("candidates/geo.json"),
  ...read("geo.json"),
};

const situationByRegistrySlug = new Map(
  Object.values(situation).map((e) => [e.registry_slug, e]),
);

const asYear = (v) => {
  const m = (v ?? "").match(/\b(1[89]\d{2}|20[0-2]\d)\b/);
  return m ? parseInt(m[1]) : null;
};
const yearOf = (lockedVal, arr) =>
  asYear(lockedVal) ?? asYear(arr?.[0]?.value) ?? null;

const normalizeDiocese = (raw) => {
  if (!raw) return null;
  let d = raw.replace(/\s*\(.*\)$/, "").replace(/\s*\/.*$/, "").trim();
  if (/bellevue/i.test(d)) d = "Diocese of Belleville";
  if (/unspecified/i.test(raw)) return null;
  return d ? d.replace(/^(Arch)?diocese of /i, "") : null;
};

// Mirrors lib/end-state.ts resolveEndState, loss sub-fates collapsed.
function groupOf({ identity, buildingFate, hasClosed, isStanding, endingMode }) {
  if (endingMode === "undecided") return "unresolved";
  if (isStanding) return identity === "mass_continues" ? "mass_continues"
    : identity === "ethnically_transferred" ? "transferred" : "active_parish";
  if (identity === "ethnically_transferred") return "transferred";
  if (buildingFate === "demolished") return "closed";
  if (buildingFate === "repurposed_secular" || buildingFate === "repurposed_religious") return "closed";
  if (identity === "lost") return "closed";
  if (hasClosed) return "closed";
  return "unverified";
}

const clean = (v) => (v && v !== "unknown" ? v : null);

const points = [];
let skipped = 0;
for (const r of registry.parishes) {
  if (r.country === "CA") continue;
  if (/buenos aires|argentin|rosario/i.test(r.city ?? "")) continue;
  if ((r.sources ?? []).some((s) => /no parish/i.test(s.ethnic_status ?? ""))) continue;

  const lib = r.c83_row != null ? libParishes[r.c83_row - 1] : undefined;
  const libOk = !!(lib && lib.city === r.city);
  const overlay = libOk ? null : situationByRegistrySlug.get(r.slug);

  const closed = yearOf(r.locked?.year_closed, r.years?.closed);
  const endingMode = libOk ? lib.endingMode : null;
  const identity = libOk ? lib.lithuanianIdentity : clean(overlay?.lithuanian_identity);
  const buildingFate = libOk ? lib.buildingFate : clean(overlay?.building_fate);
  const isStanding = !!(
    (endingMode === "standing" && !closed) ||
    (!closed && (identity === "active_parish" || identity === "mass_continues")) ||
    (!closed && !libOk && overlay?.canonical_status === "standing")
  );

  const g = r.geo ?? {};
  const ll =
    g.lat != null && g.lon != null
      ? [g.lon, g.lat]
      : geoCache[`${r.city}|${r.state}`]
        ? [geoCache[`${r.city}|${r.state}`].lon, geoCache[`${r.city}|${r.state}`].lat]
        : null;
  const xy = ll && PROJ(ll);
  if (!xy) {
    skipped++;
    continue;
  }

  points.push({
    slug: libOk ? lib.slug : r.slug,
    name: r.names.lt || r.names.en || r.slug,
    city: r.city.replace(/\s*[(;].*$/, ""),
    state: r.state,
    x: +xy[0].toFixed(1),
    y: +xy[1].toFixed(1),
    group: groupOf({ identity, buildingFate, hasClosed: !!closed, isStanding, endingMode }),
    closed,
    congregationClass: r.congregation_class ?? null,
    diocese: normalizeDiocese(r.diocese),
    href: libOk
      ? `/parishes/${lib.slug}`
      : r.c83_row == null
        ? `/registry/${r.slug}`
        : null,
  });
}

writeFileSync(
  new URL("../data/context-points.json", import.meta.url),
  JSON.stringify(
    {
      note: "Shared diocese-zoom point layer — true un-fanned geoAlbersUsa 975x610 coords. Consumed by components/ParishContextMap.tsx and scripts/render-dispatch-map.mjs. Group mirrors lib/end-state.ts.",
      frame: { w: 975, h: 610 },
      counts: { points: points.length, skippedNoGeo: skipped },
      points,
    },
    null,
    0,
  ) + "\n",
);
console.log(
  `OK: context-points.json — ${points.length} true-coordinate points (${skipped} skipped without geo).`,
);
