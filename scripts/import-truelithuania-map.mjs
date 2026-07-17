// One-time extraction of the "Destination Lithuanian America" map inventory
// (map.truelithuania.com, Augustinas Žemaitis — sites visited in person,
// Lithuanian Government Chancellery centenary project) into a CANDIDATE
// dataset: data/candidates/truelithuania-map-2026-07-17.json.
//
// What is committed: STRUCTURED FACTS ONLY — title, coordinates, category,
// importance tier, years found in the notes, status keywords, and the
// per-entry "read more" URL. The notes themselves are Žemaitis's copyrighted
// prose and are NOT committed; each entry links to its source instead.
//
// Source-level caution (binding): two truelithuania.com narratives were
// refuted-as-stated by the 2026-07-16 adversarial verification (Aušros Vartų
// Manhattan; Minersville St. Francis). Treat every fact here as CANDIDATE —
// to be validated against the Draugas 1909–2007 registry as it lands.
//
// Usage: node scripts/import-truelithuania-map.mjs <path-to-saved-map-html>
//   (save the page first: curl over plain http — the map subdomain's TLS
//    cert does not cover it — e.g.
//    curl -sSL "http://map.truelithuania.com/" -o /tmp/tl-map.html)
import { readFileSync, writeFileSync } from "node:fs";

const htmlPath = process.argv[2];
if (!htmlPath) throw new Error("usage: node scripts/import-truelithuania-map.mjs <saved-map.html>");
const html = readFileSync(htmlPath, "utf8");

const OUT = new URL("../data/candidates/truelithuania-map-2026-07-17.json", import.meta.url);

// --- extract the inline markers array (bracket-matched, string-aware) ---
const start = html.indexOf("markers : [");
if (start < 0) throw new Error("markers array not found — page layout changed?");
const arrStart = html.indexOf("[", start);
let depth = 0, i = arrStart, inStr = false, esc = false;
for (; i < html.length; i++) {
  const c = html[i];
  if (esc) { esc = false; continue; }
  if (c === "\\") { esc = true; continue; }
  if (c === '"') inStr = !inStr;
  if (inStr) continue;
  if (c === "[") depth++;
  if (c === "]") { depth--; if (!depth) break; }
}
const markers = JSON.parse(html.slice(arrStart, i + 1));

// Lithuanian state/province category names -> codes.
const STATE_LT = {
  "Ilinojus": "IL", "Pensilvanija": "PA", "Masačusetsas": "MA", "Mičiganas": "MI",
  "Konektikutas": "CT", "Naujasis Džersis": "NJ", "Niujorkas": "NY", "Ohajas": "OH",
  "Merilandas": "MD", "Meinas": "ME", "Naujasis Hampšyras": "NH", "Rod Ailandas": "RI",
  "Viskonsinas": "WI", "Nebraska": "NE", "Ajova": "IA", "Misūris": "MO",
  "Kalifornija": "CA", "Florida": "FL", "Teksasas": "TX", "Oklahoma": "OK",
  "Kanzasas": "KS", "Arizona": "AZ", "Naujoji Meksika": "NM", "Vermontas": "VT",
  "Oregonas": "OR", "Vašingtonas (valstija)": "WA", "Vašingtonas (JAV sostinė)": "DC",
  "Džordžija": "GA", "Šiaurės Karolina": "NC", "Minesota": "MN", "Indiana": "IN",
  "Aliaska": "AK", "Connecticut": "CT",
  "Ontarijas": "ON", "Kvebekas": "QC", "Manitoba (LT)": "MB", "Alberta LT": "AB",
  "Naujoji Škotija": "NS",
};
const TYPE_CATS = new Set(["Bažnyčios", "Vienuolynai", "Kapinės", "Klebonijos", "Churches"]);
const IMPORTANCE = { "1 svarbos": 1, "2 svarbos": 2, "3 svarbos": 3 };

const STATUS_STEMS = [
  ["closed", /uždar/i],
  ["sold", /parduot|pardav/i],
  ["demolished", /nugriaut|griov/i],
  ["burned", /sudeg/i],
  ["converted", /paverst|tapo|dabar (?:čia|jame|joje)/i],
  ["still_active", /teb(?:eveikia|évis)|vis dar veikia|iki šiol veikia/i],
];

const sites = [];
for (const m of markers) {
  const cats = (m.categories || []).map((c) => c.name || c);
  const typeCats = cats.filter((c) => TYPE_CATS.has(c));
  if (!typeCats.length) continue; // churches, monasteries, cemeteries, rectories only

  const text = String(m.details || "").replace(/<[^>]+>/g, " ");
  const years = [...new Set((text.match(/\b1[89]\d{2}\b|\b20[0-2]\d\b/g) || []).map(Number))].sort();
  const statusFlags = STATUS_STEMS.filter(([, rx]) => rx.test(text)).map(([k]) => k);
  const readMore = (String(m.details || "").match(/href=["']?(https?:\/\/global\.truelithuania\.com[^"'\s>]+)/) || [])[1] || null;
  const state = cats.map((c) => STATE_LT[c]).find(Boolean) || null;
  const nonLithuanian = /lenkų|latvių|estų|ukrainiečių|slovakų/i.test(m.title) ? true : false;

  sites.push({
    tlId: m.id,
    titleLt: m.title,
    types: typeCats,
    importance: cats.map((c) => IMPORTANCE[c]).find(Boolean) ?? null,
    lat: Number(m.latitude),
    lon: Number(m.longitude),
    state,
    country: ["ON", "QC", "MB", "AB", "NS"].includes(state) ? "CA" : "US",
    nonLithuanianEthnicity: nonLithuanian,
    yearsMentioned: years,
    statusFlags,
    sourceUrl: readMore || "http://map.truelithuania.com/",
  });
}

// crude crosswalk: nearest canonical-parish city within 15 km
const geo = JSON.parse(readFileSync(new URL("../data/geo.json", import.meta.url), "utf8"));
const km = (a, b, c, d) => {
  const r = Math.PI / 180;
  const x = (c - a) * r, y = (d - b) * r * Math.cos(((a + c) / 2) * r);
  return Math.sqrt(x * x + y * y) * 6371;
};
for (const s of sites) {
  let best = null;
  for (const [cityKey, g] of Object.entries(geo)) {
    const d = km(s.lat, s.lon, g.lat, g.lon);
    if (!best || d < best.km) best = { cityKey, km: +d.toFixed(1) };
  }
  s.nearestCanonicalCity = best && best.km <= 15 ? best : null;
}

const out = {
  corpusScope: "truelithuania-map-2026-07",
  extractedAt: "2026-07-17",
  source: {
    name: "Destination Lithuanian America (map.truelithuania.com)",
    author: "Augustinas Žemaitis",
    note: "Sites visited in person; Lithuanian Government Chancellery centenary project. Notes are copyrighted prose — facts extracted, prose not committed; see sourceUrl per entry.",
    reliabilityCaveat: "Two truelithuania.com narratives were refuted-as-stated by 2026-07-16 adversarial verification (Aušros Vartų Manhattan; Minersville St. Francis). CANDIDATE scope: validate against the Draugas 1909-2007 registry before any fact reaches the record.",
  },
  counts: {
    total: sites.length,
    byType: Object.fromEntries(
      [...new Set(sites.flatMap((s) => s.types))].map((t) => [t, sites.filter((s) => s.types.includes(t)).length])
    ),
    canada: sites.filter((s) => s.country === "CA").length,
    nonLithuanianEthnicity: sites.filter((s) => s.nonLithuanianEthnicity).length,
    nearCanonicalCity: sites.filter((s) => s.nearestCanonicalCity).length,
  },
  sites,
};

writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(`OK: ${sites.length} church/monastery/cemetery/rectory sites -> data/candidates/truelithuania-map-2026-07-17.json`);
console.log(JSON.stringify(out.counts, null, 1));
