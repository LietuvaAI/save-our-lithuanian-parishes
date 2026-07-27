// Renders the diocese-level zoom map for a Hearth dispatch — the parish in
// its diocese, with every recorded Lithuanian parish around it, in the site's
// one status language. Approved direction (Vilija, 2026-07-25/26): every
// parish dispatch carries this map; the site renders the same map
// interactively on every profile (ParishContextMap).
//
// Usage: node scripts/render-dispatch-map.mjs <canonical-slug> [out.svg]
//        [--pad=0.35] [--kicker="…"] [--title="…"] [--deck="…"]
//
// DATA: one shared layer, two renderers, zero drift — points come verbatim
// from data/context-points.json (built in `npm run data`, PR #80): true
// un-fanned projected coords in the geoAlbersUsa 975×610 frame, end-state
// `group` with the unresolved guardrail baked in (undecided renders ink,
// never closed-red), normalized short diocese names, hrefs that encode the
// record tier (/parishes/ = canonical case file, /registry/ = registry
// layer). Diocese shapes + per-diocese bboxes: data/diocese-overlay.json.
// Coordinate correctness is guaranteed upstream by scripts/verify-geo.mjs
// (blocking in `npm run data`) — every point in frame is drawn.
//
// RENDERER-SIDE (stays here): CSS-var color parsing from app/globals.css,
// same-city ring-fanning at zoom (0.6-unit cells), the label hierarchy,
// collision-avoiding placement, and the NYT panel anatomy for standalone use
// (kicker/title/deck/rule + footer legend/source; the site's interactive
// component omits the panel — its page provides framing).
//
// Chart discipline: labels are the site's canonical end-state labels
// (lib/end-state.ts GROUP_LABEL) — no invented wording, no counts.
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => a.replace(/^--/, "").split(/=(.*)/s).slice(0, 2)),
);
const SLUG = args[0];
const OUT = args[1] ?? `dispatch-map-${SLUG}.svg`;
const PAD = Number(flags.pad ?? 0.35);
const KICKER = flags.kicker ?? "";
const TITLE = flags.title ?? "";
const DECK = flags.deck ?? "";
if (!SLUG) {
  console.error("usage: node scripts/render-dispatch-map.mjs <canonical-slug> [out.svg] [--pad=0.35] [--kicker=…] [--title=…] [--deck=…]");
  process.exit(1);
}

const read = (p) => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), "utf8"));
const overlay = read("diocese-overlay.json");
const context = read("context-points.json");
const registry = read("registry-unified.json"); // metadata only: the subject diocese's full display name

// --- status colors from the site's own CSS (light mode), with fallbacks ---
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const cssVar = (name, fallback) =>
  (css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{3,8})`)) ?? [, fallback])[1];
const COLOR = {
  active_parish: cssVar("--es-active", "#2d6a4f"),
  mass_continues: cssVar("--es-mass", "#74a892"),
  transferred: cssVar("--es-transferred", "#d5c28b"),
  closed: cssVar("--es-closed", "#7d1f1f"),
  unverified: cssVar("--es-unverified", "#b3aca2"),
  unresolved: "#151515", // --mark-ink; the guardrail color
};
const INK = "#151515", SEC = "#555", DIO = "#a49a87";
// Labels are the site's own — lib/end-state.ts GROUP_LABEL, verbatim.
const SITE_LABEL = {
  active_parish: "Active Lithuanian parish", mass_continues: "Lithuanian Mass continues",
  transferred: "Ethnically transferred", unresolved: "Unresolved",
  closed: "Closed", unverified: "Not yet verified",
};
const GROUP_ORDER = ["active_parish", "mass_continues", "transferred", "unresolved", "closed", "unverified"];
const STATE_WORD = Object.fromEntries(Object.entries(SITE_LABEL).map(([k, v]) => [k, k === "mass_continues" ? v : v.charAt(0).toLowerCase() + v.slice(1)]));

// --- subject + diocese (all from the shared layer) ---
const roman = context.points.filter((p) => p.congregationClass === "roman_catholic");
const subject = roman.find((p) => p.slug === SLUG);
if (!subject) { console.error(`no roman_catholic context point for '${SLUG}'`); process.exit(1); }
const dioShort = subject.diocese;
const dio = overlay.dioceses.find((d) => d.name === dioShort);
if (!dio) { console.error(`diocese '${dioShort}' not in overlay`); process.exit(1); }
const regRow = registry.parishes.find((r) => r.diocese && r.diocese.endsWith(dioShort) && (r.slug === SLUG || `/parishes/${SLUG}` === subject.href));
const dioceseFull = regRow?.diocese ?? `Diocese of ${dioShort}`;

// --- viewBox: per-diocese bbox from the overlay; padded; small dioceses get a floor ---
let [minX, minY, maxX, maxY] = dio.bbox ?? (() => {
  const nums = dio.path.match(/-?\d+(\.\d+)?/g).map(Number);
  let a = Infinity, b = Infinity, c = -Infinity, e = -Infinity;
  for (let i = 0; i < nums.length; i += 2) { a = Math.min(a, nums[i]); c = Math.max(c, nums[i]); b = Math.min(b, nums[i + 1]); e = Math.max(e, nums[i + 1]); }
  return [a, b, c, e];
})();
const bw = maxX - minX, bh = maxY - minY;
const pad = Math.max(PAD * Math.max(bw, bh), 8);
let vx = minX - pad, vy = minY - pad, vw = bw + 2 * pad, vh = bh + 2 * pad;
const RATIO = 1.5; // panel map area: wider than 4:3 so coastal frames waste less water
if (vw / vh < RATIO) { const w = vh * RATIO; vx -= (w - vw) / 2; vw = w; }
else { const h = vw / RATIO; vy -= (h - vh) / 2; vh = h; }
const inView = (x, y, m = 0) => x > vx - m && x < vx + vw + m && y > vy - m && y < vy + vh + m;
const inSubjectBox = (x, y) => x >= minX - 0.5 && x <= maxX + 0.5 && y >= minY - 0.5 && y <= maxY + 0.5;

// --- points: shared layer verbatim; tier from the href ---
const all = roman
  .map((p) => ({ ...p, state: p.group, tier: p.href?.startsWith("/parishes/") ? "canonical" : "registry" }))
  .filter((p) => inView(p.x, p.y));
// same-coordinate-cell groups (city-centroid records ~a mile apart pile at
// zoom) fan in a small ring, the subject staying put.
{
  const groups = new Map();
  for (const p of all) {
    const k = `${Math.round(p.x / 0.6)}|${Math.round(p.y / 0.6)}`;
    (groups.get(k) ?? groups.set(k, []).get(k)).push(p);
  }
  const RING = (vw / 45) * 1.35;
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    g.sort((a, b) => (a.slug === SLUG ? -1 : b.slug === SLUG ? 1 : 0));
    const start = g[0].slug === SLUG ? 1 : 0;
    const fan = g.slice(start);
    fan.forEach((p, i) => {
      const a = (2 * Math.PI * i) / fan.length - Math.PI / 2;
      p.x += RING * Math.cos(a); p.y += RING * Math.sin(a);
    });
  }
}

// --- greedy collision-free label placement ---
const S = vw / 45;
const FS = { subject: 1.55 * S, subjectSub: 1.12 * S, small: 1.18 * S, minor: 0.95 * S };
const boxes = [];
const collides = (b) => boxes.some((o) => b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
const dotBox = (p, r) => ({ x: p.x - r, y: p.y - r, w: 2 * r, h: 2 * r });
const textW = (t, fs) => t.length * fs * 0.56;
function place(p, text, fs, priority) {
  const w = textW(text, fs), h = fs * 1.25, g = 1.0 * S;
  const cand = [
    [p.x + g, p.y - h / 2, "start"], [p.x - g - w, p.y - h / 2, "end"],
    [p.x - w / 2, p.y - g - h, "middle"], [p.x - w / 2, p.y + g, "middle"],
    [p.x + g, p.y - g - h, "start"], [p.x + g, p.y + g, "start"],
    [p.x - g - w, p.y - g - h, "end"], [p.x - g - w, p.y + g, "end"],
    [p.x + 2.6 * g, p.y - h / 2, "start"], [p.x - 2.6 * g - w, p.y - h / 2, "end"],
    [p.x - w / 2, p.y - 2.6 * g - h, "middle"], [p.x - w / 2, p.y + 2.6 * g, "middle"],
    [p.x + 4.5 * g, p.y - h / 2, "start"], [p.x - 4.5 * g - w, p.y - h / 2, "end"],
    [p.x + 3 * g, p.y + 2.2 * g, "start"], [p.x - 3 * g - w, p.y + 2.2 * g, "end"],
    [p.x + 3 * g, p.y - 2.2 * g - h, "start"], [p.x - 3 * g - w, p.y - 2.2 * g - h, "end"],
  ];
  for (const [bx, by, anchor] of cand) {
    const b = { x: bx, y: by, w, h };
    if (bx < vx + 0.5 || bx + w > vx + vw - 0.5 || by < vy + 0.5 || by + h > vy + vh - 0.5) continue;
    if (collides(b)) continue;
    boxes.push(b);
    const tx = anchor === "start" ? bx : anchor === "end" ? bx + w : bx + w / 2;
    return { tx, ty: by + h * 0.78, anchor, box: b };
  }
  if (priority) {
    const b = { x: p.x + g, y: p.y - 0.5 * S - h * 0.78, w, h };
    boxes.push(b);
    return { tx: p.x + g, ty: p.y - 0.5 * S, anchor: "start", forced: true, box: b };
  }
  return null;
}

// --- panel geometry: header band + footer measured before the viewBox ---
const deckLines = [];
{
  const words = DECK.split(/\s+/).filter(Boolean);
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > 78) { deckLines.push(line.trim()); line = w; }
    else line = (line + " " + w).trim();
  }
  if (line) deckLines.push(line.trim());
}
const BAND = (KICKER || TITLE || DECK) ? (1.6 + 2.4 + deckLines.length * 1.55 + 1.5) * S : 0;
const LEGEND_FS = 1.0 * S;
const legendMeasure = (label) => 0.8 * S + label.length * 0.62 * S + 1.9 * S;
const FOOT_BASE = 3.4 * S;
const legendPresent = new Set(all.map((p) => p.state));
const LEGEND_ITEMS = GROUP_ORDER.filter((g) => legendPresent.has(g)).map((g) => [
  SITE_LABEL[g], COLOR[g], g === "active_parish" || g === "mass_continues" ? "open" : "solid",
]);
const LEGEND_ROWS = [[]];
{
  let lx = vx + 0.9 * S;
  for (const it of LEGEND_ITEMS) {
    const w = legendMeasure(it[0]);
    if (lx + w > vx + vw - 0.9 * S && LEGEND_ROWS[LEGEND_ROWS.length - 1].length) { LEGEND_ROWS.push([]); lx = vx + 0.9 * S; }
    LEGEND_ROWS[LEGEND_ROWS.length - 1].push(it);
    lx += w;
  }
}
const LEGEND_ROW_H = 1.7 * S;
const FOOT = FOOT_BASE + LEGEND_ROWS.length * LEGEND_ROW_H;

// --- svg ---
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const HALO = (fs) => `paint-order="stroke" stroke="#ffffff" stroke-width="${(0.22 * fs).toFixed(2)}" stroke-linejoin="round"`;
const headerParts = [];
if (BAND > 0) {
  let ty = vy - BAND + 1.5 * S;
  if (KICKER) headerParts.push(`<text x="${vx + 0.9 * S}" y="${ty}" fill="#666666" font-size="${0.95 * S}" letter-spacing="${0.14 * S}">${esc(KICKER.toUpperCase())}</text>`);
  ty += 2.3 * S;
  if (TITLE) {
    // auto-fit: the Georgia bold title must never clip at the frame edge
    const tfs = Math.min(1.9 * S, (vw - 1.8 * S) / Math.max(1, TITLE.length * 0.56));
    headerParts.push(`<text x="${vx + 0.9 * S}" y="${ty}" fill="#151515" font-size="${tfs}" font-weight="bold">${esc(TITLE)}</text>`);
  }
  ty += 1.9 * S;
  for (const dl of deckLines) { headerParts.push(`<text x="${vx + 0.9 * S}" y="${ty}" fill="#222222" font-size="${1.12 * S}">${esc(dl)}</text>`); ty += 1.55 * S; }
  headerParts.push(`<rect x="${vx + 0.9 * S}" y="${(vy - 0.55 * S).toFixed(2)}" width="${vw - 1.8 * S}" height="${0.09 * S}" fill="#222222"/>`);
}
const head = [];
head.push(
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx.toFixed(1)} ${(vy - BAND).toFixed(1)} ${vw.toFixed(1)} ${(vh + BAND + FOOT).toFixed(1)}" font-family="Georgia, serif">`,
  `<rect x="${vx}" y="${(vy - BAND).toFixed(1)}" width="${vw}" height="${(vh + BAND + FOOT).toFixed(1)}" fill="#ffffff"/>`,
  `<clipPath id="maparea"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}"/></clipPath>`,
  `<g clip-path="url(#maparea)">`,
);
for (const d of overlay.dioceses)
  head.push(`<path d="${d.path}" fill="${d.name === dioShort ? "#f0ece2" : "#f9f8f5"}"/>`);
head.push(`<path d="${overlay.borders}" fill="none" stroke="#c9c3b8" stroke-width="${0.12 * S}"/>`);
head.push(`<path d="${dio.path}" fill="none" stroke="${INK}" stroke-width="${0.3 * S}"/>`);
for (const d of overlay.dioceses)
  if (d.name !== dioShort && inView(d.cx, d.cy, -2)) {
    const w = d.name.length * 0.8 * S + d.name.length * 0.12 * S;
    if (d.cx - w / 2 < vx + 0.4 * S || d.cx + w / 2 > vx + vw - 0.4 * S) continue; // never clip a diocese name at the frame edge
    head.push(`<text x="${d.cx}" y="${d.cy}" text-anchor="middle" fill="${DIO}" font-size="${1.0 * S}" letter-spacing="${0.12 * S}">${esc(d.name.toUpperCase())}</text>`);
    boxes.push({ x: d.cx - w / 2, y: d.cy - 1.1 * S, w, h: 1.4 * S }); // parish labels route around diocese names
  }
{
  const fy = Math.min(maxY + 1.6 * S, vy + vh - S);
  const fw = dioceseFull.length * 0.92 * S;
  head.push(`<text x="${dio.cx}" y="${fy}" text-anchor="middle" fill="${DIO}" font-size="${1.0 * S}" letter-spacing="${0.14 * S}">${esc(dioceseFull.toUpperCase())}</text>`);
  boxes.push({ x: dio.cx - fw / 2, y: fy - 1.1 * S, w: fw, h: 1.4 * S });
}

const dots = [], labels = [];
// subject first: dot, halo ring, label — reserves space before neighbors
const sp = all.find((q) => q.slug === SLUG);
if (!sp) { console.error(`subject '${SLUG}' fell outside its own frame — check data`); process.exit(1); }
const sCol = COLOR[subject.group];
boxes.push(dotBox(sp, 2.2 * S));
dots.push(
  `<circle cx="${sp.x}" cy="${sp.y}" r="${1.25 * S}" fill="${sCol}" stroke="#fff" stroke-width="${0.22 * S}"/>`,
  `<circle cx="${sp.x}" cy="${sp.y}" r="${2.0 * S}" fill="none" stroke="${sCol}" stroke-width="${0.18 * S}" stroke-dasharray="${0.5 * S} ${0.35 * S}"/>`,
);
{
  const line1 = subject.name, line2 = `${subject.city} · ${STATE_WORD[subject.group]}`;
  const pos = place({ x: sp.x + 1.9 * S, y: sp.y }, line1, FS.subject, true);
  labels.push(
    `<text x="${pos.tx}" y="${pos.ty - 0.1 * S}" text-anchor="${pos.anchor}" fill="${INK}" font-size="${FS.subject}" font-weight="bold" ${HALO(FS.subject)}>${esc(line1)}</text>`,
    `<text x="${pos.tx}" y="${pos.ty + 1.25 * S}" text-anchor="${pos.anchor}" fill="${SEC}" font-size="${FS.subjectSub}" font-style="italic" ${HALO(FS.subjectSub)}>${esc(line2)}</text>`,
  );
  boxes.push({ x: pos.anchor === "end" ? pos.tx - textW(line2, FS.subjectSub) : pos.tx, y: pos.ty + 0.3 * S, w: textW(line2, FS.subjectSub), h: FS.subjectSub * 1.3 });
}
// neighbors: dots always; labels per policy, collision-free.
// Placement order decides who wins scarce space: canonical unresolved first
// (a second ink dot must never go unexplained), then canonical, then registry.
// every dot is an obstacle BEFORE any label is placed — otherwise an early
// label can sit on top of a later point's dot
for (const p of all) if (p.slug !== SLUG) boxes.push(dotBox(p, 0.77 * S));
const labelOrder = [...all].sort((a, b) => {
  const rank = (p) => (p.slug === SLUG ? 0 : p.tier === "canonical" && p.state === "unresolved" ? 1 : p.tier === "canonical" ? 2 : 3);
  return rank(a) - rank(b);
});
for (const p of labelOrder) {
  if (p.slug === SLUG) continue;
  const col = COLOR[p.state];
  const r = 0.62 * S;
  const open = p.state === "active_parish" || p.state === "mass_continues";
  dots.push(
    open
      ? `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="#fff" stroke="${col}" stroke-width="${0.28 * S}"/>`
      : `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${col}" stroke="#fff" stroke-width="${0.12 * S}"/>`,
  );
  // a fanned dot can land at (or beyond) the clip edge — never label what
  // the reader can't see; the sliver stays as context
  if (!inView(p.x, p.y, -0.8 * S)) continue;
  const inside = inSubjectBox(p.x, p.y);
  const unresolvedPt = p.state === "unresolved";
  // Label hierarchy (readability over completeness — the interactive site map
  // carries every name): inside the subject diocese, everything is named;
  // outside it, only canonical parishes (small, quiet) and unresolved cases
  // (bold, never dropped). Out-of-diocese registry points stay context dots.
  if (!inside && p.tier !== "canonical" && !unresolvedPt) continue;
  const cleanName = p.name.replace(new RegExp(`\\s*\\(${p.city}\\)$`), "");
  if (/\(unnamed\)|\(record\)/i.test(cleanName)) continue; // a nameless record orients nobody — dot only
  const text = `${cleanName}${p.city && !cleanName.includes(p.city) ? ` · ${p.city}` : ""}`;
  const major = inside || unresolvedPt;
  let fs = major ? FS.small : FS.minor;
  let pos = place(p, text, fs, false);
  if (!pos && unresolvedPt) {
    fs = 0.85 * fs;
    pos = place(p, text, fs, false) ?? place(p, text, fs, true);
  }
  if (pos) {
    if (pos.box) {
      const lx = Math.max(pos.box.x, Math.min(p.x, pos.box.x + pos.box.w));
      const ly = Math.max(pos.box.y, Math.min(p.y, pos.box.y + pos.box.h));
      const d = Math.hypot(lx - p.x, ly - p.y);
      if (d > 1.7 * S)
        labels.push(`<line x1="${p.x}" y1="${p.y}" x2="${lx}" y2="${ly}" stroke="${SEC}" stroke-width="${0.07 * S}" opacity="0.55"/>`);
    }
    labels.push(`<text x="${pos.tx}" y="${pos.ty}" text-anchor="${pos.anchor}" fill="${major ? INK : "#4a4844"}" font-size="${fs}"${major ? ' font-weight="bold"' : ''} ${HALO(fs)}>${esc(text)}</text>`);
  }
}

// footer: legend (precomputed wrapping rows) + source lines, below the map
const footerParts = [];
{
  let ly = vy + vh + 1.9 * S;
  for (const row of LEGEND_ROWS) {
    let x = vx + 0.9 * S;
    for (const [label, col, kind] of row) {
      footerParts.push(kind === "open"
        ? `<circle cx="${x}" cy="${ly - 0.34 * S}" r="${0.44 * S}" fill="#fff" stroke="${col}" stroke-width="${0.2 * S}"/>`
        : `<circle cx="${x}" cy="${ly - 0.34 * S}" r="${0.44 * S}" fill="${col}"/>`);
      footerParts.push(`<text x="${x + 0.8 * S}" y="${ly}" fill="#151515" font-size="${LEGEND_FS}">${label}</text>`);
      x += legendMeasure(label);
    }
    ly += LEGEND_ROW_H;
  }
  footerParts.push(`<text x="${vx + 0.9 * S}" y="${(ly + 0.2 * S).toFixed(2)}" fill="#777" font-size="${0.85 * S}">SaveOurLithuanianParishes.org unified registry · diocese boundaries from US Census county geometry</text>`);
  footerParts.push(`<text x="${vx + 0.9 * S}" y="${(ly + 1.4 * S).toFixed(2)}" fill="#777" font-size="${0.85 * S}">Some points sit at city center · the full interactive map: saveourlithuanianparishes.org</text>`);
}

writeFileSync(OUT, [...head, ...dots, ...labels, "</g>", ...headerParts, ...footerParts, "</svg>"].join("\n"));
console.log(`OK: ${OUT} (${dioceseFull}; viewBox ${vw.toFixed(0)}x${vh.toFixed(0)} units; ${all.length} points from context-points.json)`);
