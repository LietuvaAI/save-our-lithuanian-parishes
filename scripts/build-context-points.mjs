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
const publication = read("canonical-publication-projection.json");
const infographic = read("canonical-infographic-projection.json");
const publicationByRegistrySlug = new Map(
  publication.public_institutions.map((institution) => [
    institution.registry_slug,
    institution,
  ]),
);
const infographicByProfile = new Map(
  infographic.institution_history.map((institution) => [
    institution.public_profile,
    institution,
  ]),
);
const libParishes = read("parishes.json");
const libByC83Row = new Map(
  libParishes.filter((parish) => !parish.mergedInto).flatMap((parish) =>
    (parish.c83Rows ?? []).map((row) => [row, parish]),
  ),
);
const geoCache = {
  ...read("candidates/geo.json"),
  ...read("geo.json"),
};

const normalizeDiocese = (raw) => {
  if (!raw) return null;
  let d = raw.replace(/\s*\(.*\)$/, "").replace(/\s*\/.*$/, "").trim();
  if (/bellevue/i.test(d)) d = "Diocese of Belleville";
  if (/unspecified/i.test(raw)) return null;
  return d ? d.replace(/^(Arch)?diocese of /i, "") : null;
};

const points = [];
let skipped = 0;
for (const r of registry.parishes) {
  const institution = publicationByRegistrySlug.get(r.slug);
  if (!institution) continue;
  const canonicalInfographic = infographicByProfile.get(
    institution.public_profile,
  );
  if (!canonicalInfographic) {
    throw new Error(
      `${institution.registry_slug}: missing canonical infographic institution`,
    );
  }

  const lib = r.c83_row != null ? libByC83Row.get(r.c83_row) : undefined;
  const libOk = !!(lib && lib.city === r.city);
  const closed = canonicalInfographic.closed.year;

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
    group: canonicalInfographic.status_group,
    founded: canonicalInfographic.founded.year,
    closed,
    recordType: institution.record_type,
    congregationClass: institution.institution_class,
    diocese: normalizeDiocese(r.diocese),
    href: institution.public_profile,
  });
}

writeFileSync(
  new URL("../data/context-points.json", import.meta.url),
  JSON.stringify(
    {
      note: "Shared diocese-zoom point layer — true un-fanned geoAlbersUsa 975x610 coords. Consumed by components/ParishContextMap.tsx and scripts/render-dispatch-map.mjs. Public lifecycle fields come from the canonical infographic projection.",
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
