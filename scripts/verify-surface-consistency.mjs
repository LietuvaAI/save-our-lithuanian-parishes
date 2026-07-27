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
import { readFileSync } from "node:fs";

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

const errors = [];

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
  if (
    /active lithuanian parish/i.test(e.current_use ?? "") &&
    e.lithuanian_identity !== "active_parish"
  )
    errors.push(
      `${slug}: current_use claims "Active Lithuanian parish" but identity is "${e.lithuanian_identity}"`,
    );
}

if (errors.length) {
  console.error(`SURFACE CONSISTENCY VIOLATIONS (${errors.length}):`);
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}
console.log(
  `OK: all canonical map groups match the resolver; no overlay claims an active parish its identity denies.`,
);
