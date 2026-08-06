// Image-rights guard: no photograph ships without traced, cleared rights.
// Born 2026-07-26 ("legit across the board" — Vilija): the site must never
// display or distribute an image whose permission chain is not documented.
//
// Rules (all block `npm run data` on violation):
//   1. Every data/photos.json entry carries rights ∈ {permission_granted,
//      public_domain, open_license, own_work, pending_permission} and a
//      rightsNote tracing the holder/evidence. Anything else fails.
//   2. Entries with cleared rights must have their image file present in
//      public/; entries still pending must NOT — a pending image sitting in
//      the public repo is distribution before permission.
//   3. current-events photo objects without cleared rights are counted as held
//      (the render gate in lib/photos.ts already skips them) — reported,
//      not fatal, since absence of the field is the safe state.
import { readFileSync, existsSync } from "node:fs";

const read = (p) =>
  JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), "utf8"));

const CLEARED = new Set(["permission_granted", "public_domain", "open_license", "own_work"]);
const VALID = new Set([...CLEARED, "pending_permission"]);

const photos = read("photos.json").parishes;
const alerts = read("canonical-current-events-projection.json");

const errors = [];
let cleared = 0;
let held = 0;

for (const [slug, e] of Object.entries(photos)) {
  if (!VALID.has(e.rights))
    errors.push(`${slug}: rights "${e.rights}" is not a valid status`);
  if (!e.rightsNote)
    errors.push(`${slug}: missing rightsNote — the trace is mandatory`);
  const onDisk = existsSync(new URL(`../public${e.src}`, import.meta.url));
  if (CLEARED.has(e.rights)) {
    cleared++;
    if (!onDisk) errors.push(`${slug}: rights cleared but image missing at public${e.src}`);
  } else {
    held++;
    if (onDisk)
      errors.push(
        `${slug}: rights are ${e.rights} but public${e.src} exists in the repo — remove it until permission is granted`,
      );
  }
}

let watchHeld = 0;
for (const e of alerts.sustainabilityWatch ?? []) {
  if (e.photo && !CLEARED.has(e.photo.rights ?? "")) watchHeld++;
}

if (errors.length) {
  console.error(`PHOTO RIGHTS VIOLATIONS (${errors.length}) — fix before shipping:`);
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}
console.log(
  `OK: ${Object.keys(photos).length} photo entries traced — ${cleared} cleared and rendering, ${held} held pending permission; ${watchHeld} watch-entry photos held by the render gate.`,
);
