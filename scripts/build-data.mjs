// Builds data/parishes.json and data/figures.json from data/parishes.csv,
// then validates every derived figure against the locked figure set
// (culturenet-brain: Draugas-Infographic-Locked-Figures.md, locked 2026-05-23).
// The build FAILS if any figure drifts — see data/PROVENANCE.md.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parse } from "csv-parse/sync";

const CORPUS_SCOPE = "draugas-2008-2026";
const COMPARATOR_STATES = new Set(["QC", "ON"]);

// Locked figures — change ONLY to match a new upstream locked-figures revision.
const LOCKED = {
  usTotal: 83,
  comparators: 3,
  endingMode: { diocese_closed: 55, standing: 23, community_decided: 3, undecided: 2 },
  dioceseClosedByStatus: { closed: 36, demolished: 13, merged: 5, suppressed: 1 },
  ownership: { diocese_rc: 77, national_catholic: 4, other_self_owned: 2 },
  dioceseOwned: { diocese_closed: 55, standing: 20, undecided: 2 },
  communityOwned: { total: 6, closedByOutsideAuthority: 0, standing: 3 },
  coalRegion: { total: 15, dioceseOwned: 14, dioceseOwnedClosed: 12, dioceseOwnedStanding: 2 },
  survivedReviewThenClosed: 7,
};

const LT_MAP = { ą: "a", č: "c", ę: "e", ė: "e", į: "i", š: "s", ų: "u", ū: "u", ž: "z" };
function slugify(...parts) {
  return parts
    .join(" ")
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (c) => LT_MAP[c])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const rows = parse(readFileSync(new URL("../data/parishes.csv", import.meta.url)), {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

const seen = new Set();
const parishes = rows.map((r) => {
  const comparator = COMPARATOR_STATES.has(r.state);
  const slug = slugify(r.parish, r.city, r.state);
  if (seen.has(slug)) throw new Error(`Duplicate slug: ${slug}`);
  seen.add(slug);
  const citations = (r.source || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((date) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`Bad citation date "${date}" (${slug})`);
      return { type: "draugas_issue", date };
    });
  // Detect missions: Lithuanian name contains "Misija" or English-style "Mission"
  const isMisija = /\bMisija\b/i.test(r.parish) || /\bMission\b/i.test(r.parish);
  return {
    slug,
    nameLt: r.parish,
    city: r.city,
    state: r.state,
    country: comparator ? "CA" : "US",
    comparator,
    ownership: r.ownership,
    status: r.status,
    endingMode: r.ending_mode,
    institutionType: isMisija ? "misija" : "parapija",
    // Classifier fields — enriched below from situation overlay.
    // parish-situation.json is the source of truth for these.
    lithuanianIdentity: null,
    buildingFate: null,
    currentUse: null,
    pastoralStatus: null,
    situation: null,
    registrySlug: null,
    yearFounded: r.year_founded ? Number(r.year_founded) : null,
    yearClosed: r.year_closed ? Number(r.year_closed) : null,
    coalRegion: r.coal_region === "true",
    survivedReviewThenClosed: r.survived_review_then_closed === "true",
    citations,
    notes: r.notes || "",
    corpusScope: CORPUS_SCOPE,
    recordKind: "archive_verified",
  };
});

// Enrich with ALL situation-overlay fields from parish-situation.json.
// This is the single merge point: the overlay is the source of truth for
// classifier fields the CSV doesn't carry. After this, parishes.json has
// everything and the app never reads the overlay directly.
const sitPath = new URL("../data/parish-situation.json", import.meta.url);
if (existsSync(sitPath)) {
  const sitData = JSON.parse(readFileSync(sitPath, "utf-8"));
  const sitMap = sitData.parishes || {};
  let enriched = 0;
  for (const p of parishes) {
    const sit = sitMap[p.slug];
    if (sit) {
      p.lithuanianIdentity = sit.lithuanian_identity || null;
      p.buildingFate = sit.building_fate || null;
      p.currentUse = sit.current_use || null;
      p.pastoralStatus = sit.pastoral_status || null;
      p.situation = sit.situation || null;
      p.registrySlug = sit.registry_slug || null;
      enriched++;
    }
  }
  console.log(`  Enriched ${enriched}/${parishes.length} parishes from situation overlay.`);
}

const us = parishes.filter((p) => !p.comparator);
const tally = (list, key) =>
  list.reduce((acc, p) => ((acc[p[key]] = (acc[p[key]] || 0) + 1), acc), {});

const dioceseOwnedUs = us.filter((p) => p.ownership === "diocese_rc");
const communityOwnedUs = us.filter((p) => p.ownership !== "diocese_rc");
const coalUs = us.filter((p) => p.coalRegion);
const coalDiocese = coalUs.filter((p) => p.ownership === "diocese_rc");

const derived = {
  usTotal: us.length,
  comparators: parishes.length - us.length,
  endingMode: tally(us, "endingMode"),
  dioceseClosedByStatus: tally(us.filter((p) => p.endingMode === "diocese_closed"), "status"),
  ownership: tally(us, "ownership"),
  dioceseOwned: tally(dioceseOwnedUs, "endingMode"),
  communityOwned: {
    total: communityOwnedUs.length,
    closedByOutsideAuthority: communityOwnedUs.filter((p) => p.endingMode === "diocese_closed").length,
    standing: communityOwnedUs.filter((p) => p.endingMode === "standing").length,
  },
  coalRegion: {
    total: coalUs.length,
    dioceseOwned: coalDiocese.length,
    dioceseOwnedClosed: coalDiocese.filter((p) => p.endingMode === "diocese_closed").length,
    dioceseOwnedStanding: coalDiocese.filter((p) => p.endingMode === "standing").length,
  },
  survivedReviewThenClosed: us.filter((p) => p.survivedReviewThenClosed).length,
};

// Deep-compare derived vs locked; report every mismatch, then fail.
const errors = [];
function compare(expected, actual, path) {
  for (const [k, v] of Object.entries(expected)) {
    const a = actual?.[k];
    if (typeof v === "object") compare(v, a, `${path}${k}.`);
    else if (a !== v) errors.push(`${path}${k}: locked=${v} derived=${a ?? 0}`);
  }
}
compare(LOCKED, derived, "");
if (errors.length) {
  console.error("LOCKED-FIGURE VALIDATION FAILED — data/parishes.csv disagrees with the locked figure set:");
  for (const e of errors) console.error(`  ${e}`);
  console.error("See data/PROVENANCE.md for the update protocol. Refusing to build.");
  process.exit(1);
}

const figures = {
  corpusScope: CORPUS_SCOPE,
  lockedAt: "2026-05-23",
  sourceLine: "Šaltinis: „Draugo“ archyvas, 2008–2026 m.",
  ...derived,
};

writeFileSync(new URL("../data/parishes.json", import.meta.url), JSON.stringify(parishes, null, 2) + "\n");
writeFileSync(new URL("../data/figures.json", import.meta.url), JSON.stringify(figures, null, 2) + "\n");
console.log(
  `OK: ${us.length} US parishes + ${derived.comparators} comparators; all locked figures validated (${CORPUS_SCOPE}).`
);
