// Renders the diocese-level zoom map for a Hearth dispatch — the parish in
// its diocese, with every recorded Lithuanian parish around it, in the site's
// one status language. Approved direction (Vilija, 2026-07-25): every parish
// dispatch carries this map so readers have a reference point.
//
// Usage: node scripts/render-dispatch-map.mjs <canonical-slug> [out.svg] [--pad=0.35]
//
// Data: data/diocese-overlay.json (geoAlbersUsa 975x610 pre-projected diocese
// paths + interior-border mesh), data/map.json (canonical parish points, same
// frame), data/registry-map.json (registry-layer points, same frame),
// data/parishes.json (classifier fields), data/parish-situation.json
// (canonical -> registry slug), data/registry-unified.json (diocese names).
//
// Status colors are read from app/globals.css (--es-* light-mode values) so
// the graphic can never drift from the site. The end-state mapping below
// mirrors lib/end-state.ts resolveEndState — keep the two in sync. The
// binding guardrail holds here as everywhere: endingMode "undecided"
// (Maspeth, Elizabeth NJ) renders as unresolved ink, never closed red.
//
// Chart discipline (docs/design + dispatch practice): no internal titles —
// the dispatch's caption carries the framing; direct labels only. Label
// policy: the subject is always named; canonical parishes are named when a
// collision-free spot exists; registry-layer points are named only inside
// the subject diocese (elsewhere they stay context dots). Registry points
// whose state cannot belong in the view are dropped with a warning — each
// warning is an upstream geocoding lead.
import { readFileSync, writeFileSync } from "node:fs";
import { geoAlbersUsa } from "d3-geo";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => a.replace(/^--/, "").split("=")),
);
const SLUG = args[0];
const OUT = args[1] ?? `dispatch-map-${SLUG}.svg`;
const PAD = Number(flags.pad ?? 0.35);
if (!SLUG) {
  console.error("usage: node scripts/render-dispatch-map.mjs <canonical-slug> [out.svg] [--pad=0.35]");
  process.exit(1);
}

const read = (p) => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), "utf8"));
// Same projection as build-map.mjs / build-diocese-overlay.mjs (975x610 frame).
const PROJ = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const overlay = read("diocese-overlay.json");
const mapData = read("map.json");
const registryMap = read("registry-map.json");
const parishes = read("parishes.json");
const situation = read("parish-situation.json");
const registry = read("registry-unified.json");

// Records the unified registry itself flags as guardrail-binding duplicates —
// never drawn (see the record's conflicts block).
const EXCLUDE = new Set(["annunciation-maspeth-ny"]);

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
const STATE_WORD = {
  active_parish: "active Lithuanian parish", mass_continues: "Lithuanian Mass continues",
  transferred: "ethnically transferred", unresolved: "unresolved",
  closed: "closed", unverified: "record",
};

// Mirrors lib/end-state.ts resolveEndState (loss sub-fates collapsed to closed).
function endState({ identity, buildingFate, hasClosed, isStanding, endingMode }) {
  if (endingMode === "undecided") return "unresolved";
  if (isStanding && identity === "mass_continues") return "mass_continues";
  if (isStanding && identity === "ethnically_transferred") return "transferred";
  if (isStanding) return "active_parish";
  if (identity === "ethnically_transferred") return "transferred";
  if (buildingFate === "demolished") return "closed";
  if (buildingFate === "repurposed_secular" || buildingFate === "repurposed_religious") return "closed";
  if (identity === "lost") return "closed";
  if (hasClosed) return "closed";
  return "unverified";
}
const canonicalState = (c) =>
  endState({
    identity: c.lithuanianIdentity, buildingFate: c.buildingFate,
    hasClosed: !!c.yearClosed || ["closed", "demolished"].includes(c.status),
    isStanding: c.status === "standing", endingMode: c.endingMode,
  });

// --- subject parish, its diocese ---
const canonical = (Array.isArray(parishes) ? parishes : parishes.parishes).filter((p) => p.slug);
const subject = canonical.find((p) => p.slug === SLUG);
if (!subject) { console.error(`no canonical parish '${SLUG}'`); process.exit(1); }
const registrySlug = situation.parishes?.[SLUG]?.registry_slug ?? subject.registrySlug;
const regRow = registry.parishes.find((r) => r.slug === registrySlug || r.slug === SLUG);
const dioceseFull = regRow?.diocese;
if (!dioceseFull) { console.error(`no diocese on registry record for '${SLUG}'`); process.exit(1); }
const dioShort = dioceseFull.replace(/^(Arch)?[Dd]iocese of /, "");
const dio = overlay.dioceses.find((d) => d.name === dioShort);
if (!dio) { console.error(`diocese '${dioShort}' not in overlay`); process.exit(1); }

// --- viewBox: diocese bbox padded; small dioceses get a floor so neighbors show ---
const nums = dio.path.match(/-?\d+(\.\d+)?/g).map(Number);
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (let i = 0; i < nums.length; i += 2) {
  minX = Math.min(minX, nums[i]); maxX = Math.max(maxX, nums[i]);
  minY = Math.min(minY, nums[i + 1]); maxY = Math.max(maxY, nums[i + 1]);
}
const bw = maxX - minX, bh = maxY - minY;
const pad = Math.max(PAD * Math.max(bw, bh), 8);
let vx = minX - pad, vy = minY - pad, vw = bw + 2 * pad, vh = bh + 2 * pad;
if (vw / vh < 4 / 3) { const w = vh * (4 / 3); vx -= (w - vw) / 2; vw = w; }
else { const h = vw * (3 / 4); vy -= (h - vh) / 2; vh = h; }
const inView = (x, y, m = 0) => x > vx - m && x < vx + vw + m && y > vy - m && y < vy + vh + m;
const inSubjectBox = (x, y) => x >= minX - 0.5 && x <= maxX + 0.5 && y >= minY - 0.5 && y <= maxY + 0.5;

// --- points ---
// map.json coords are the national-view DISPLAY coords (same-city fanning
// applied at build); at diocese zoom we want geography, so re-derive each
// point from the truest coordinates available: registry-record geo, then the
// city gazetteer, then the display coord as a last resort.
const geoGaz = read("geo.json");
const regSlugOf = {};
for (const [slug, v] of Object.entries(situation.parishes ?? {}))
  if (v.registry_slug) regSlugOf[slug] = v.registry_slug;
function truePoint(slug, city, st, fallback) {
  const row = registry.parishes.find((r) => r.slug === (regSlugOf[slug] ?? slug) || r.slug === slug);
  if (row?.geo?.lat != null && row?.geo?.lon != null) {
    const pr = PROJ([row.geo.lon, row.geo.lat]);
    if (pr) return { x: pr[0], y: pr[1] };
  }
  const g = geoGaz[`${city}|${st}`];
  if (g?.lat != null) {
    const pr = PROJ([g.lon, g.lat]);
    if (pr) return { x: pr[0], y: pr[1] };
  }
  return fallback;
}
const canonicalPts = mapData.points
  .filter((p) => !EXCLUDE.has(p.slug))
  .map((p) => {
    const c = canonical.find((q) => q.slug === p.slug) ?? {};
    const t = truePoint(p.slug, c.city, c.state, p);
    return { ...p, ...t, name: c.nameLt ?? p.slug, city: c.city ?? "", st: c.state, state: canonicalState(c), tier: "canonical" };
  })
  .filter((p) => inView(p.x, p.y));
const allowedStates = new Set([subject.state, ...canonicalPts.map((p) => p.st)]);
const registryPts = registryMap.points
  .filter((p) => (p.kind ?? "parish") === "parish" && !EXCLUDE.has(p.slug))
  .map((p) => ({
    ...p,
    ...truePoint(p.slug, p.city, p.state, p),
    st: p.state,
    name: p.name === p.slug ? "Lithuanian parish (record)" : p.name,
    state: endState({
      identity: p.identity, buildingFate: null,
      hasClosed: !!p.closedYear, isStanding: !!p.lockedStanding, endingMode: null,
    }),
    tier: "registry",
  }))
  .filter((p) => inView(p.x, p.y))
  .filter((p) => {
    if (p.st && !allowedStates.has(p.st)) {
      console.warn(`warn: dropped ${p.slug} (${p.city}, ${p.st}) — in view but state does not belong here; upstream geocoding lead`);
      return false;
    }
    return true;
  });
const all = [...canonicalPts, ...registryPts];
// same-coordinate groups (city-centroid records) fan in a small ring, the
// subject staying put; disclosed in the dispatch caption.
{
  const groups = new Map();
  for (const p of all) {
    const k = `${p.x.toFixed(1)}|${p.y.toFixed(1)}`;
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
const FS = { subject: 1.5 * S, subjectSub: 1.05 * S, small: 0.95 * S };
const boxes = []; // occupied label/dot rectangles
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
  ];
  for (const [bx, by, anchor] of cand) {
    const b = { x: bx, y: by, w, h };
    if (bx < vx + 0.5 || bx + w > vx + vw - 0.5 || by < vy + 0.5 || by + h > vy + vh - 0.5) continue;
    if (collides(b)) continue;
    boxes.push(b);
    const tx = anchor === "start" ? bx : anchor === "end" ? bx + w : bx + w / 2;
    return { tx, ty: by + h * 0.78, anchor, box: b };
  }
  return priority ? { tx: p.x + g, ty: p.y - 0.5 * S, anchor: "start", forced: true } : null;
}

// --- svg ---
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const HALO = (fs) => `paint-order="stroke" stroke="#ffffff" stroke-width="${(0.22 * fs).toFixed(2)}" stroke-linejoin="round"`;
const head = [];
head.push(
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}" font-family="Georgia, serif">`,
  `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#ffffff"/>`,
);
for (const d of overlay.dioceses)
  head.push(`<path d="${d.path}" fill="${d.name === dioShort ? "#f0ece2" : "#f9f8f5"}"/>`);
head.push(`<path d="${overlay.borders}" fill="none" stroke="#c9c3b8" stroke-width="${0.12 * S}"/>`);
head.push(`<path d="${dio.path}" fill="none" stroke="${INK}" stroke-width="${0.3 * S}"/>`);
// neighbor diocese names (subject diocese labeled below its shape)
for (const d of overlay.dioceses)
  if (d.name !== dioShort && inView(d.cx, d.cy, -2))
    head.push(`<text x="${d.cx}" y="${d.cy}" text-anchor="middle" fill="${DIO}" font-size="${1.0 * S}" letter-spacing="${0.12 * S}">${esc(d.name.toUpperCase())}</text>`);
head.push(`<text x="${dio.cx}" y="${Math.min(maxY + 1.6 * S, vy + vh - S)}" text-anchor="middle" fill="${DIO}" font-size="${1.0 * S}" letter-spacing="${0.14 * S}">${esc(dioceseFull.toUpperCase())}</text>`);

const dots = [], labels = [];
// subject first: dot, halo ring, label — labels reserve space before neighbors
const sp = all.find((q) => q.slug === SLUG);
if (!sp) { console.error(`subject '${SLUG}' has no point in map.json`); process.exit(1); }
const sCol = COLOR[canonicalState(subject)];
boxes.push(dotBox(sp, 2.2 * S));
dots.push(
  `<circle cx="${sp.x}" cy="${sp.y}" r="${1.25 * S}" fill="${sCol}" stroke="#fff" stroke-width="${0.22 * S}"/>`,
  `<circle cx="${sp.x}" cy="${sp.y}" r="${2.0 * S}" fill="none" stroke="${sCol}" stroke-width="${0.18 * S}" stroke-dasharray="${0.5 * S} ${0.35 * S}"/>`,
);
{
  const line1 = subject.nameLt, line2 = `${subject.city} · ${STATE_WORD[canonicalState(subject)]}`;
  const pos = place({ x: sp.x + 1.9 * S, y: sp.y }, line1, FS.subject, true);
  labels.push(
    `<text x="${pos.tx}" y="${pos.ty - 0.1 * S}" text-anchor="${pos.anchor}" fill="${INK}" font-size="${FS.subject}" font-weight="bold" ${HALO(FS.subject)}>${esc(line1)}</text>`,
    `<text x="${pos.tx}" y="${pos.ty + 1.25 * S}" text-anchor="${pos.anchor}" fill="${SEC}" font-size="${FS.subjectSub}" font-style="italic" ${HALO(FS.subjectSub)}>${esc(line2)}</text>`,
  );
  boxes.push({ x: pos.anchor === "end" ? pos.tx - textW(line2, FS.subjectSub) : pos.tx, y: pos.ty + 0.3 * S, w: textW(line2, FS.subjectSub), h: FS.subjectSub * 1.3 });
}
// neighbors: dots always; labels per policy, collision-free
for (const p of all) {
  if (p.slug === SLUG) continue;
  const col = COLOR[p.state];
  const r = 0.62 * S;
  const open = p.state === "active_parish" || p.state === "mass_continues";
  boxes.push(dotBox(p, r + 0.15 * S));
  dots.push(
    open
      ? `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="#fff" stroke="${col}" stroke-width="${0.28 * S}"/>`
      : `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${col}" stroke="#fff" stroke-width="${0.12 * S}"/>`,
  );
  const wantLabel = p.tier === "canonical" || inSubjectBox(p.x, p.y);
  if (!wantLabel) continue;
  const cleanName = p.name.replace(new RegExp(`\\s*\\(${p.city}\\)$`), "");
  const text = `${cleanName}${p.city && !cleanName.includes(p.city) ? ` · ${p.city}` : ""}`;
  const pos = place(p, text, FS.small, false);
  if (pos) {
    if (pos.box) {
      const lx = Math.max(pos.box.x, Math.min(p.x, pos.box.x + pos.box.w));
      const ly = Math.max(pos.box.y, Math.min(p.y, pos.box.y + pos.box.h));
      const d = Math.hypot(lx - p.x, ly - p.y);
      if (d > 1.7 * S)
        labels.push(`<line x1="${p.x}" y1="${p.y}" x2="${lx}" y2="${ly}" stroke="${SEC}" stroke-width="${0.07 * S}" opacity="0.55"/>`);
    }
    labels.push(`<text x="${pos.tx}" y="${pos.ty}" text-anchor="${pos.anchor}" fill="${p.tier === "canonical" ? INK : SEC}" font-size="${FS.small}" ${HALO(FS.small)}>${esc(text)}</text>`);
  }
}

writeFileSync(OUT, [...head, ...dots, ...labels, "</svg>"].join("\n"));
console.log(`OK: ${OUT} (${dioceseFull}; viewBox ${vw.toFixed(0)}x${vh.toFixed(0)} units; ${all.length} parish points)`);
