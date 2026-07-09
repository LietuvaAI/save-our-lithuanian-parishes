// Probes direct Draugas PDF URLs for every citation date in data/parishes.json
// and caches the results in data/draugas-links.json (committed, like the other
// generated data files). Parish profile pages prefer a verified direct PDF
// link over the per-year archive page — see draugasCitationUrl in lib/parishes.ts.
//
// Filename conventions vary by year, so each date is probed against both:
//   https://draugas.org/key/YYYY_reg/YYYY-MM-DD-DRAUGASo.pdf
//   https://draugas.org/key/YYYY_reg/YYYY-MM-DD-DRAUGAS.pdf
//
// 200 with a PDF content type   => "verified" (link directly)
// 401                           => "gated" (exists, subscriber-only)
// anything else on both variants => "unresolved" (year-archive fallback)
//
// Verified and gated entries are kept on re-runs; unresolved dates are
// re-probed. Requests go out at ~1/second out of courtesy to draugas.org.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const PARISHES = new URL("../data/parishes.json", import.meta.url);
const CACHE = new URL("../data/draugas-links.json", import.meta.url);
const RATE_LIMIT_MS = 1000;
const KEEP = new Set(["verified", "gated"]);

const variantUrls = (date) => [
  `https://draugas.org/key/${date.slice(0, 4)}_reg/${date}-DRAUGASo.pdf`,
  `https://draugas.org/key/${date.slice(0, 4)}_reg/${date}-DRAUGAS.pdf`,
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(url) {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { status: res.status, contentType: res.headers.get("content-type") || "" };
  } catch (err) {
    return { status: 0, contentType: "", error: String(err) };
  }
}

/** Resolve one citation date to {status, url?}, probing both filename variants. */
async function resolveDate(date, throttle) {
  let gatedUrl = null;
  for (const url of variantUrls(date)) {
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

writeFileSync(
  CACHE,
  JSON.stringify({ probedAt: new Date().toISOString().slice(0, 10), results }, null, 2) + "\n"
);
console.log(
  `OK: ${dates.length} citation dates (${probed} probed, ${dates.length - probed} cached) — ` +
    Object.entries(tally).map(([k, v]) => `${k}: ${v}`).join(", ")
);
