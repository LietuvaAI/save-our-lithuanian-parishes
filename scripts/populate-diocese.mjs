#!/usr/bin/env node
// ============================================================================
// populate-diocese.mjs
// Adds a top-level `diocese` field to every parish in registry-unified.json.
//
// Resolution order:
//   1. alerts.json (standardized, highest confidence)
//   2. Wolkovich / Michelsonas source entries in the registry
//   3. Geographic lookup (city+state → diocese)
//
// For non-RC congregations (PNCC, Protestant), the geographic RC diocese is
// still assigned — the field answers "whose territory is this in?", and
// congregation_class distinguishes RC from non-RC.
//
// Run: node scripts/populate-diocese.mjs
// ============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, "..", "data");

// ── Geographic lookup: city+state → diocese ─────────────────────────────────
// US Catholic diocese boundaries are geographic. Every city falls in exactly
// one diocese. This table covers every city that appears in the registry.

const DIOCESE_BY_CITY = {
  // Colorado
  "Denver, CO": "Archdiocese of Denver",

  // Connecticut
  "Ansonia, CT": "Archdiocese of Hartford",
  "Bridgeport, CT": "Diocese of Bridgeport",
  "Hartford, CT": "Archdiocese of Hartford",
  "Naugatuck, CT": "Archdiocese of Hartford",
  "New Britain, CT": "Archdiocese of Hartford",
  "New Haven, CT": "Archdiocese of Hartford",
  "Thompson, CT": "Diocese of Norwich",
  "Waterbury, CT": "Archdiocese of Hartford",

  // Florida
  "St. Pete Beach, FL": "Diocese of St. Petersburg",

  // Iowa
  "Sioux City, IA": "Diocese of Sioux City",

  // Illinois
  "Chicago, IL": "Archdiocese of Chicago",
  "Chicago Heights, IL": "Archdiocese of Chicago",
  "Cicero, IL": "Archdiocese of Chicago",
  "Collinsville, IL": "Diocese of Belleville",
  "Darien, IL": "Diocese of Joliet",
  "East St. Louis, IL": "Diocese of Belleville",
  "Harrisburg, IL": "Diocese of Belleville",
  "Kewanee, IL": "Diocese of Peoria",
  "Lemont, IL": "Archdiocese of Chicago",
  "Melrose Park, IL": "Archdiocese of Chicago",
  "North Chicago, IL": "Archdiocese of Chicago",
  "Oak Lawn, IL": "Archdiocese of Chicago",
  "Oglesby, IL": "Diocese of Peoria",
  "Rockford, IL": "Diocese of Rockford",
  "South Chicago, IL": "Archdiocese of Chicago",
  "Spring Valley, IL": "Diocese of Peoria",
  "Springfield, IL": "Diocese of Springfield in Illinois",
  "Waukegan, IL": "Archdiocese of Chicago",
  "Westville, IL": "Diocese of Peoria",

  // Indiana
  "Beverly Shores, IN": "Diocese of Gary",
  "East Chicago, IN": "Diocese of Gary",
  "Gary, IN": "Diocese of Gary",
  "Hartshorne, IN": "Diocese of Gary",
  "Indian Harbor, IN": "Diocese of Gary",

  // Kansas
  "Kansas City, KS": "Archdiocese of Kansas City in Kansas",

  // Massachusetts
  "Athol, MA": "Diocese of Worcester",
  "Boston, MA": "Archdiocese of Boston",
  "Brockton, MA": "Archdiocese of Boston",
  "Cambridge, MA": "Archdiocese of Boston",
  "Haverhill, MA": "Archdiocese of Boston",
  "Lawrence, MA": "Archdiocese of Boston",
  "Lowell, MA": "Archdiocese of Boston",
  "Norwood, MA": "Archdiocese of Boston",
  "Westfield, MA": "Diocese of Springfield in Massachusetts",
  "Worcester, MA": "Diocese of Worcester",

  // Maryland
  "Baltimore, MD": "Archdiocese of Baltimore",

  // Michigan
  "Custer, MI": "Diocese of Grand Rapids",
  "Detroit, MI": "Archdiocese of Detroit",
  "Grand Rapids, MI": "Diocese of Grand Rapids",
  "Irons, MI": "Diocese of Grand Rapids",
  "Luther, MI": "Diocese of Grand Rapids",
  "Saginaw, MI": "Diocese of Saginaw",
  "Scottville, MI": "Diocese of Grand Rapids",
  "Southfield, MI": "Archdiocese of Detroit",
  "Union Pier, MI": "Diocese of Kalamazoo",

  // Minnesota
  "Minneapolis, MN": "Archdiocese of Saint Paul and Minneapolis",

  // Missouri
  "Kansas City, MO": "Diocese of Kansas City-St. Joseph",
  "St. Louis, MO": "Archdiocese of St. Louis",

  // Nebraska
  "Omaha, NE": "Archdiocese of Omaha",

  // New Hampshire
  "Nashua, NH": "Diocese of Manchester",

  // New Jersey
  "Bayonne, NJ": "Archdiocese of Newark",
  "Elizabeth, NJ": "Archdiocese of Newark",
  "Harrison, NJ": "Archdiocese of Newark",
  "Jersey City, NJ": "Archdiocese of Newark",
  "Kearny, NJ": "Archdiocese of Newark",
  "Newark, NJ": "Archdiocese of Newark",
  "Paterson, NJ": "Diocese of Paterson",

  // New York
  "Albany, NY": "Diocese of Albany",
  "Amsterdam, NY": "Diocese of Albany",
  "Binghamton, NY": "Diocese of Syracuse",
  "Bronx, NY": "Archdiocese of New York",
  "Brooklyn, NY": "Diocese of Brooklyn",
  "Manhattan, NY": "Archdiocese of New York",
  "Maspeth, NY": "Diocese of Brooklyn",
  "New York, NY": "Archdiocese of New York",
  "New York City, NY": "Archdiocese of New York",
  "Niagara Falls, NY": "Diocese of Buffalo",
  "Rochester, NY": "Diocese of Rochester",
  "Schenectady, NY": "Diocese of Albany",
  "Utica, NY": "Diocese of Syracuse",

  // Ohio
  "Akron, OH": "Diocese of Cleveland",
  "Cleveland, OH": "Diocese of Cleveland",
  "Dayton, OH": "Archdiocese of Cincinnati",
  "Youngstown, OH": "Diocese of Youngstown",

  // Oregon
  "Portland, OR": "Archdiocese of Portland in Oregon",

  // Pennsylvania — Lackawanna County → Diocese of Scranton
  "Scranton, PA": "Diocese of Scranton",
  "Archbald, PA": "Diocese of Scranton",
  "Eynon, PA": "Diocese of Scranton",
  // Pennsylvania — Luzerne County → Diocese of Scranton
  "Wilkes-Barre, PA": "Diocese of Scranton",
  "Kingston, PA": "Diocese of Scranton",
  "Plymouth, PA": "Diocese of Scranton",
  "Nanticoke, PA": "Diocese of Scranton",
  "Luzerne, PA": "Diocese of Scranton",
  "Sugar Notch, PA": "Diocese of Scranton",
  "Wanamie, PA": "Diocese of Scranton",
  "Pittston, PA": "Diocese of Scranton",
  "Duryea, PA": "Diocese of Scranton",
  "Freeland, PA": "Diocese of Scranton",
  "Hazleton, PA": "Diocese of Scranton",
  // Pennsylvania — Susquehanna County → Diocese of Scranton
  "Forest City, PA": "Diocese of Scranton",
  // Pennsylvania — Schuylkill County → Diocese of Allentown
  "Frackville, PA": "Diocese of Allentown",
  "Girardville, PA": "Diocese of Allentown",
  "Mahanoy City, PA": "Diocese of Allentown",
  "Minersville, PA": "Diocese of Allentown",
  "Shenandoah, PA": "Diocese of Allentown",
  "St. Clair, PA": "Diocese of Allentown",
  "Middleport, PA": "Diocese of Allentown",
  "New Philadelphia, PA": "Diocese of Allentown",
  "Maizeville, PA": "Diocese of Allentown",
  "McAdoo, PA": "Diocese of Allentown",
  // Pennsylvania — Carbon County → Diocese of Allentown
  "Coaldale, PA": "Diocese of Allentown",
  "Tamaqua, PA": "Diocese of Allentown",
  // Pennsylvania — Northampton County → Diocese of Allentown
  "Easton, PA": "Diocese of Allentown",
  // Pennsylvania — Northumberland County → Diocese of Harrisburg
  "Shamokin, PA": "Diocese of Harrisburg",
  "Mount Carmel, PA": "Diocese of Harrisburg",
  // Pennsylvania — Philadelphia area → Archdiocese of Philadelphia
  "Philadelphia, PA": "Archdiocese of Philadelphia",
  "Chester, PA": "Archdiocese of Philadelphia",
  // Pennsylvania — Allegheny County → Diocese of Pittsburgh
  "Pittsburgh, PA": "Diocese of Pittsburgh",
  "Homestead, PA": "Diocese of Pittsburgh",
  "Braddock, PA": "Diocese of Pittsburgh",
  "Esplen, PA": "Diocese of Pittsburgh",
  "Bridgeville, PA": "Diocese of Pittsburgh",
  // Pennsylvania — Washington County → Diocese of Pittsburgh
  "Donora, PA": "Diocese of Pittsburgh",
  "Bentleyville, PA": "Diocese of Pittsburgh",
  // Pennsylvania — Westmoreland County → Diocese of Greensburg
  "Mt. Pleasant, PA": "Diocese of Greensburg",
  "East Vandergrift, PA": "Diocese of Greensburg",
  // Pennsylvania — Clearfield County → Diocese of Altoona-Johnstown
  "Du Bois, PA": "Diocese of Altoona-Johnstown",
  "DuBois, PA": "Diocese of Altoona-Johnstown",

  // Rhode Island
  "Providence, RI": "Diocese of Providence",

  // California
  "Los Angeles, CA": "Archdiocese of Los Angeles",

  // Texas
  "Yorktown, TX": "Diocese of Victoria",

  // Wisconsin
  "Kenosha, WI": "Archdiocese of Milwaukee",
  "Milwaukee, WI": "Archdiocese of Milwaukee",
  "Port Washington, WI": "Archdiocese of Milwaukee",
  "Racine, WI": "Archdiocese of Milwaukee",
  "Sheboygan, WI": "Archdiocese of Milwaukee",
};

// Normalize a city name: strip parenthetical detail, slash alternatives, trim
function normalizeCity(raw) {
  return raw
    .replace(/\s*[(;].*$/, "")     // strip parenthetical
    .replace(/\s*\/.*$/, "")       // strip slash alternatives (e.g. "Denver / Globeville")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Load data ───────────────────────────────────────────────────────────────

const registry = JSON.parse(readFileSync(join(DATA, "registry-unified.json"), "utf-8"));
const alerts = JSON.parse(readFileSync(join(DATA, "alerts.json"), "utf-8"));

// ── Build priority lookups ──────────────────────────────────────────────────

// Priority 1: alerts.json (standardized diocese names)
const alertDiocese = new Map();
for (const a of alerts.alerts ?? []) {
  const slug = a.parishLink.replace(/^\/(parishes|registry)\//, "");
  if (a.diocese) alertDiocese.set(slug, a.diocese);
}
for (const sw of alerts.sustainabilityWatch ?? []) {
  const slug = (sw.parishLink ?? "").replace(/^\/(parishes|registry)\//, "");
  if (sw.diocese && slug) alertDiocese.set(slug, sw.diocese);
}

// Priority 2: existing source entries (Wolkovich, then Michelsonas)
function getSourceDiocese(parish) {
  if (!parish.sources) return null;
  const validDiocese = (d) =>
    d && d !== "None" && d !== "unspecified" && d !== "" &&
    !/independent|separatist|national catholic/i.test(d);
  // Prefer Wolkovich (more recent scholarship)
  const wolk = parish.sources.find(s => s.axis === "wolkovich" && validDiocese(s.diocese));
  if (wolk) return wolk.diocese;
  const mich = parish.sources.find(s => s.axis === "michelsonas-1961" && validDiocese(s.diocese));
  if (mich) return mich.diocese;
  // Any other source
  const any = parish.sources.find(s => validDiocese(s.diocese));
  return any?.diocese ?? null;
}

// Standardize diocese names from sources to match alerts.json format
const STANDARDIZE = {
  "Gary": "Diocese of Gary",
  "Cleveland": "Diocese of Cleveland",
  "Milwaukee (archdiocese)": "Archdiocese of Milwaukee",
  "Archdiocese of Chicago": "Archdiocese of Chicago",
  "Archdiocese of Philadelphia": "Archdiocese of Philadelphia",
  "Boston": "Archdiocese of Boston",
  "Detroit": "Archdiocese of Detroit",
  "Hartford": "Archdiocese of Hartford",
  "Grand Rapids": "Diocese of Grand Rapids",
  "Omaha": "Archdiocese of Omaha",
  "Philadelphia": "Archdiocese of Philadelphia",
  "St. Louis": "Archdiocese of St. Louis",
  "Belleville": "Diocese of Belleville",
  "Peoria": "Diocese of Peoria",
  "Rockford": "Diocese of Rockford",
  "Saginaw": "Diocese of Saginaw",
  "Scranton": "Diocese of Scranton",
  "Sioux City": "Diocese of Sioux City",
  "Los Angeles": "Archdiocese of Los Angeles",
  "New York": "Archdiocese of New York",
  "Little Rock": "Diocese of Little Rock",
  "Springfield": "Diocese of Springfield in Illinois",
};

function standardizeDiocese(raw) {
  if (!raw) return null;
  // Already in "Archdiocese of X" / "Diocese of X" format
  if (/^(Arch)?diocese of /i.test(raw)) return raw;
  // Try lookup
  if (STANDARDIZE[raw]) return STANDARDIZE[raw];
  // Strip contextual notes like "Cleveland (later Cincinnati archdiocese per context)"
  const base = raw.replace(/\s*\(.*\)$/, "").trim();
  if (STANDARDIZE[base]) return STANDARDIZE[base];
  return raw; // Return as-is for manual review
}

// ── Resolve diocese for each parish ─────────────────────────────────────────

const stats = { alert: 0, source: 0, geo: 0, skipped: 0, unresolved: 0 };
const unresolved = [];

for (const p of registry.parishes) {
  // Skip non-US parishes
  if (p.country !== "US") {
    p.diocese = null;
    stats.skipped++;
    continue;
  }

  let diocese = null;

  // Priority 1: alerts.json
  const alertVal = alertDiocese.get(p.slug);
  if (alertVal) {
    diocese = alertVal;
    stats.alert++;
  }

  // Priority 2: source entries
  if (!diocese) {
    const srcVal = getSourceDiocese(p);
    if (srcVal) {
      diocese = standardizeDiocese(srcVal);
      stats.source++;
    }
  }

  // Priority 3: geographic lookup
  if (!diocese) {
    const city = normalizeCity(p.city);
    const key = `${city}, ${p.state}`;
    const geoVal = DIOCESE_BY_CITY[key];
    if (geoVal) {
      diocese = geoVal;
      stats.geo++;
    }
  }

  if (!diocese) {
    stats.unresolved++;
    unresolved.push(`  ${p.slug}: ${p.city}, ${p.state}`);
  }

  p.diocese = diocese;
}

// ── Write result ────────────────────────────────────────────────────────────

writeFileSync(
  join(DATA, "registry-unified.json"),
  JSON.stringify(registry, null, 1) + "\n",
  "utf-8"
);

// ── Report ──────────────────────────────────────────────────────────────────

console.log("Diocese population complete:");
console.log(`  From alerts.json:    ${stats.alert}`);
console.log(`  From source entries: ${stats.source}`);
console.log(`  From geo lookup:     ${stats.geo}`);
console.log(`  Skipped (non-US):    ${stats.skipped}`);
console.log(`  Unresolved:          ${stats.unresolved}`);

if (unresolved.length > 0) {
  console.log("\nUnresolved parishes (need manual diocese assignment):");
  for (const u of unresolved) console.log(u);
}

const total = stats.alert + stats.source + stats.geo;
console.log(`\nTotal US parishes with diocese: ${total}`);
