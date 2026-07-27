// Probes direct Draugas PDF URLs for every citation date in data/parishes.json
// and caches the results in data/draugas-links.json (committed, like the other
// generated data files). Parish profile pages prefer a verified direct PDF
// link over the per-year archive page — see draugasCitationUrl in lib/parishes.ts.
//
// Filename conventions differ by era:
//   born-digital era (2008+) — predictable, probed as guesses:
//     https://draugas.org/key/YYYY_reg/YYYY-MM-DD-DRAUGASo.pdf
//     https://draugas.org/key/YYYY_reg/YYYY-MM-DD-DRAUGAS.pdf
//   scanned era (pre-2008) — NOT guessable: a date may have several files
//     (main issue "YYYY-MM-DD-DRAUGAS.pdf", weekday partials like
//     "-DRAUGAS-i13-16.pdf", supplements "-PRIEDAS-…"), and weekday issues
//     exist ONLY as the suffixed partial. The per-year archive pages
//     (draugas.org/archyvas-pdf-YYYY/) list every real file, so pre-2008
//     dates are matched against that index instead of guessed; the old
//     single-filename guess remains only as a fallback when the year page
//     is unreachable.
//
// 200 with a PDF content type   => "verified" (link directly)
// 401                           => "gated" (exists, subscriber-only)
// anything else on all variants => "unresolved" (year-archive fallback)
//
// Verified and gated entries are kept on re-runs; unresolved dates are
// re-probed. Requests go out at ~1/second out of courtesy to draugas.org.
//
// Second pass: every draugas.org /archive/ or /key/ PDF URL embedded in
// data/case-records/*.json is HEAD-checked too (link-rot guard for the
// scanned-era citations added per issue #13). Failures warn, never block.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";

const PARISHES = new URL("../data/parishes.json", import.meta.url);
const RECORDS_DIR = new URL("../data/case-records/", import.meta.url);
const CACHE = new URL("../data/draugas-links.json", import.meta.url);
const RATE_LIMIT_MS = 1000;
const KEEP = new Set(["verified", "gated"]);
const UA = "SaveOurLithuanianParishes.org link verifier (vilija@lietuva.ai)";

const variantUrls = (date) => {
  const year = date.slice(0, 4);
  const key = [
    `https://draugas.org/key/${year}_reg/${date}-DRAUGASo.pdf`,
    `https://draugas.org/key/${year}_reg/${date}-DRAUGAS.pdf`,
  ];
  const archive = [`https://www.draugas.org/archive/${year}_reg/${date}-DRAUGAS.pdf`];
  return Number(year) < 2008 ? [...archive, ...key] : [...key, ...archive];
};

// Main issue before weekday partial before supplement — a citation without a
// filename should land on the fullest file for its date.
const filePreference = (url) =>
  /PRIEDAS/.test(url) ? 2 : /-DRAUGAS-i[\d-]+\.pdf$/.test(url) ? 1 : 0;

const yearIndexCache = new Map();
/** Scrape the per-year archive page into date -> [pdf urls], best first. */
async function yearIndex(year, throttle) {
  if (yearIndexCache.has(year)) return yearIndexCache.get(year);
  const byDate = new Map();
  try {
    await throttle();
    const res = await fetch(`https://www.draugas.org/archyvas-pdf-${year}/`, {
      headers: { "user-agent": UA },
      redirect: "follow",
    });
    if (res.ok) {
      const html = await res.text();
      for (const m of html.matchAll(
        /href="(https?:\/\/www\.draugas\.org\/archive\/[^"]+\.pdf)"/g,
      )) {
        const d = m[1].match(/(\d{4}-\d{2}-\d{2})/)?.[1];
        if (!d) continue;
        if (!byDate.has(d)) byDate.set(d, []);
        byDate.get(d).push(m[1]);
      }
      for (const urls of byDate.values())
        urls.sort((a, b) => filePreference(a) - filePreference(b));
    }
  } catch {
    // Year page unreachable — resolveDate falls back to guessed variants.
  }
  yearIndexCache.set(year, byDate);
  return byDate;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "user-agent": UA },
    });
    return { status: res.status, contentType: res.headers.get("content-type") || "" };
  } catch (err) {
    return { status: 0, contentType: "", error: String(err) };
  }
}

/** Resolve one citation date to {status, url?}. */
async function resolveDate(date, throttle) {
  const year = date.slice(0, 4);
  const indexed =
    Number(year) < 2008 ? (await yearIndex(year, throttle)).get(date) ?? [] : [];
  let gatedUrl = null;
  for (const url of [...indexed, ...variantUrls(date)]) {
    await throttle();
    const { status, contentType } = await probe(url);
    if (status === 200 && contentType.includes("pdf")) return { status: "verified", url };
    if (status === 401 && !gatedUrl) gatedUrl = url;
  }
  return gatedUrl ? { status: "gated", url: gatedUrl } : { status: "unresolved" };
}

const dates = [
  ...new Set(
    JSON.parse(readFileSync(PARISHES)).flatMap((p) => p.citations.map((c) => c.date))
  ),
].sort();

const prior = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE)).results : {};
const results = {};
let probed = 0;

let last = 0;
const throttle = async () => {
  const wait = last + RATE_LIMIT_MS - Date.now();
  if (wait > 0) await sleep(wait);
  last = Date.now();
};

for (const date of dates) {
  if (KEEP.has(prior[date]?.status)) {
    results[date] = prior[date];
    continue;
  }
  results[date] = await resolveDate(date, throttle);
  probed++;
  console.log(`${date}: ${results[date].status}`);
}

const tally = Object.values(results).reduce(
  (acc, r) => ((acc[r.status] = (acc[r.status] || 0) + 1), acc),
  {}
);

// ── Link-rot guard: direct Draugas PDF URLs embedded in case records ────────
const recordUrls = new Set();
for (const f of readdirSync(RECORDS_DIR).filter((f) => f.endsWith(".json"))) {
  const text = readFileSync(new URL(f, RECORDS_DIR), "utf8");
  for (const m of text.matchAll(
    /https?:\/\/(?:www\.)?draugas\.org\/(?:archive|key)\/[^"]+\.pdf/g,
  ))
    recordUrls.add(m[0]);
}
const rot = [];
for (const url of [...recordUrls].sort()) {
  await throttle();
  const { status, contentType } = await probe(url);
  const ok = (status === 200 && contentType.includes("pdf")) || status === 401;
  if (!ok) rot.push(`${url} -> HTTP ${status}`);
}
if (rot.length) {
  console.warn(`WARN: ${rot.length} case-record Draugas PDF links no longer resolve:`);
  for (const r of rot) console.warn("  " + r);
}

writeFileSync(
  CACHE,
  JSON.stringify({ probedAt: new Date().toISOString().slice(0, 10), results }, null, 2) + "\n"
);
console.log(
  `OK: ${dates.length} citation dates (${probed} probed, ${dates.length - probed} cached) — ` +
    Object.entries(tally).map(([k, v]) => `${k}: ${v}`).join(", ") +
    `; ${recordUrls.size} case-record PDF links checked, ${rot.length} broken`
);
