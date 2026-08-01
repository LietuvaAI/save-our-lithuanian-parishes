// Cross-surface status consistency guard. Born 2026-07-27, after the
// homepage map shipped its own private status derivation and labeled 30+
// standing buildings "Active today" while The History said 11 — "nothing
// matches across the site" (Vilija). Every surface must derive status from
// lib/end-state.ts resolveEndState; this guard proves the generated layers
// agree with it and blocks the build when any surface drifts.
//
// Checks:
//   1. context-points.json group (shared by profile context maps, the
//      homepage map's registry dots, and the Hearth dispatch renderer)
//      must equal toGroup(resolveEndState(...)) for every canonical slug.
//   2. No situation-overlay current_use may claim "Active Lithuanian
//      parish" unless that record's identity is active_parish.
//   3. Overlay classifier enum values must stay inside the public status
//      vocabulary used by lib/parishes.ts and lib/unified-status.ts.
//   4. Map parity must use the same U.S. real-parish scope as /record.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const read = (p) =>
  JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), "utf8"));

// Mirror of lib/end-state.ts resolveEndState + toGroup (scripts can't import TS).
function resolveGroup(identity, buildingFate, hasClosed, isStanding, endingMode) {
  if (endingMode === "undecided") return "unresolved";
  if (isStanding && identity === "lost") return "closed";
  if (isStanding && !identity) return "unverified";
  if (isStanding)
    return identity === "mass_continues" ? "mass_continues"
      : identity === "ethnically_transferred" ? "transferred" : "active_parish";
  if (identity === "ethnically_transferred") return "transferred";
  if (buildingFate === "demolished") return "closed";
  if (buildingFate === "repurposed_secular" || buildingFate === "repurposed_religious") return "closed";
  if (identity === "lost") return "closed";
  if (hasClosed) return "closed";
  return "unverified";
}

const lib = read("parishes.json");
const ctx = new Map(read("context-points.json").points.map((p) => [p.slug, p.group]));
const situations = read("parish-situation.json").parishes;
const registry = read("registry-unified.json").parishes;
const publication = read("canonical-publication-projection.json");
const siteFigures = read("site-figures.json");

const errors = [];

// Research-registry totals are operational inventory, not public census
// figures. Keep them out of the public figure contract and page components so
// profile, lead, phase, context, and international counts cannot be mistaken
// for U.S. institutions again.
if ("researchRegistry" in siteFigures || "canonicalCore" in siteFigures) {
  errors.push("site-figures.json exposes the internal research-registry total");
}
if (siteFigures.publicUS?.records !== publication.counts.public_us_institutions) {
  errors.push(
    `site figures publish ${siteFigures.publicUS?.records} U.S. institutions; canonical projection requires ${publication.counts.public_us_institutions}`,
  );
}
if (
  siteFigures.generatedFrom?.canonicalPublicationHash !==
  publication.content_hash
) {
  errors.push("site figures are not tied to the canonical publication hash");
}

function publicSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return publicSourceFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

for (const root of ["app", "components"]) {
  const directory = fileURLToPath(new URL(`../${root}/`, import.meta.url));
  for (const path of publicSourceFiles(directory)) {
    const source = readFileSync(path, "utf8");
    if (
      /\bresearchRegistry\b|\.registryRecords\b|\.publicUSRecords\b/.test(
        source,
      )
    ) {
      errors.push(
        `${path}: public source binds an internal or superseded registry total`,
      );
    }
  }
}

const allowedIdentities = new Set([
  "active_parish",
  "mass_continues",
  "ethnically_transferred",
  "lost",
  "unknown",
]);
const allowedFates = new Set([
  "demolished",
  "standing",
  "repurposed_religious",
  "repurposed_secular",
  "derelict",
  "unknown",
]);

function isUSRecord(r) {
  return r.public_census?.included === true;
}

for (const p of lib) {
  const g = ctx.get(p.slug);
  if (!g) continue; // no coordinates — not on any map
  const isStanding = p.status === "standing";
  const want = resolveGroup(
    p.lithuanianIdentity, p.buildingFate,
    p.yearClosed != null || !isStanding, isStanding, p.endingMode,
  );
  if (g !== want)
    errors.push(`${p.slug}: context-points group "${g}" != resolver "${want}"`);
}

for (const [slug, e] of Object.entries(situations)) {
  if (!allowedIdentities.has(e.lithuanian_identity))
    errors.push(`${slug}: invalid lithuanian_identity "${e.lithuanian_identity}"`);
  if (!allowedFates.has(e.building_fate))
    errors.push(`${slug}: invalid building_fate "${e.building_fate}"`);
  if (
    /active lithuanian parish/i.test(e.current_use ?? "") &&
    e.lithuanian_identity !== "active_parish"
  )
    errors.push(
      `${slug}: current_use claims "Active Lithuanian parish" but identity is "${e.lithuanian_identity}"`,
    );
}

// One dot per record: canonical map points + US registry-map points must
// equal the US registry record count (The Record's headline number).
{
  const usRecords = publication.counts.public_us_institutions;
  const registryPublic = registry.filter(isUSRecord).length;
  if (registryPublic !== usRecords) {
    errors.push(
      `display registry publishes ${registryPublic} U.S. rows; canonical projection requires ${usRecords}`,
    );
  }
  const mapPts = read("map.json").points.length;
  const regPts = read("registry-map.json").points.filter((p) => p.country === "US").length;
  if (mapPts + regPts !== usRecords)
    errors.push(
      `map parity: ${mapPts} canonical + ${regPts} registry dots = ${mapPts + regPts}, but The Record counts ${usRecords} US records`,
    );
}

if (errors.length) {
  console.error(`SURFACE CONSISTENCY VIOLATIONS (${errors.length}):`);
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}
console.log(
  `OK: canonical map groups, overlay classifiers, active-claim guard, and /record map parity are consistent.`,
);
