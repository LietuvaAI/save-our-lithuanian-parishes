// Geo sanity sweep: project every mappable registry record's TRUE coordinates
// and test them against the record's own state polygon (us-atlas, unprojected).
// Reports mismatches; never edits. Coastal/border tolerance: a point counts as
// OK if it falls in its state OR within ~15km of it (borders, harbors).
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoContains, geoDistance } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const usTopo = require("us-atlas/states-10m.json");
const states = feature(usTopo, usTopo.objects.states).features;
// us-atlas state ids are FIPS; map postal → feature via the census FIPS table.
const FIPS_TO_POSTAL = {"01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"};
const byPostal = new Map(states.map((f) => [FIPS_TO_POSTAL[String(f.id).padStart(2, "0")], f]));

const registry = JSON.parse(readFileSync("data/registry-unified.json", "utf-8"));
const geoCache = {
  ...JSON.parse(readFileSync("data/candidates/geo.json", "utf-8")),
  ...JSON.parse(readFileSync("data/geo.json", "utf-8")),
};

function lonLatOf(rec) {
  const g = rec.geo ?? {};
  if (g.lat != null && g.lon != null) return [g.lon, g.lat, "record.geo"];
  const cached = geoCache[`${rec.city}|${rec.state}`];
  if (cached) return [cached.lon, cached.lat, "gazetteer"];
  return null;
}

// Rough distance from point to state: sample the state's exterior vertices.
function nearState(f, pt, kmTol) {
  let min = Infinity;
  const scan = (coords) => {
    for (const c of coords) {
      if (typeof c[0] === "number") {
        const d = geoDistance(pt, c) * 6371;
        if (d < min) min = d;
      } else scan(c);
    }
  };
  scan(f.geometry.coordinates);
  return min <= kmTol;
}

let checked = 0;
const bad = [];
for (const r of registry.parishes) {
  if (r.country !== "US" || !r.state) continue;
  const ll = lonLatOf(r);
  if (!ll) continue;
  const f = byPostal.get(r.state);
  if (!f) { bad.push([r.slug, r.city, r.state, "unknown state", ll[2]]); continue; }
  checked++;
  const pt = [ll[0], ll[1]];
  if (!geoContains(f, pt) && !nearState(f, pt, 15)) {
    bad.push([r.slug, `${r.city}, ${r.state}`, `src=${ll[2]}`, `lon/lat=${ll[0]},${ll[1]}`]);
  }
}
console.log(`checked ${checked} US records with coordinates`);
if (bad.length) {
  console.error(`GEO MISMATCHES (${bad.length}) — fix or null the geo before shipping:`);
  for (const b of bad) console.error("  ", b.join(" | "));
  process.exit(1);
} else console.log("OK: all points fall in (or within 15km of) their state");
