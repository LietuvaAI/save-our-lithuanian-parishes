import { readFileSync } from "node:fs";

const readText = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const readJson = (path) => JSON.parse(readText(path));

const projection = readJson("data/canonical-infographic-projection.json");
const events = readJson("data/canonical-current-events-projection.json");
const photos = readJson("data/photos.json").parishes;
const viewSource = readText("lib/living-network-view.ts");
const pageSource = readText("app/lithuanian-catholic-life-today/page.tsx");
const profilePageSource = readText("app/parishes/[slug]/page.tsx");
const catholicLifeProfileSource = readText("app/catholic-life/[slug]/page.tsx");
const catholicLifeProjectionSource = readText("lib/catholic-life-profiles.ts");
const mapSource = readText("components/LivingNetworkMap.tsx");
const errors = [];

const directory = projection.current_pastoral_network?.directory;
const counts = projection.current_pastoral_network?.counts;
const wider = projection.wider_catholic_life;
const regularCount = directory?.entries?.filter((entry) =>
  ["active_parish", "active_mission", "mass_continues"].includes(
    entry.networkClass,
  ),
).length;
const widerCount =
  (wider?.documented_religious_houses?.houses?.length ?? 0) +
  (wider?.additional_pastoral_communities?.communities?.length ?? 0);

if (
  directory?.entries?.length !== 20 ||
  regularCount !== 14 ||
  counts?.active_parish !== 6 ||
  counts?.active_mission !== 2 ||
  counts?.mass_continues !== 6 ||
  widerCount !== 3
) {
  errors.push("canonical Living Network population drifted");
}

const directoryProfiles = directory?.entries?.map((entry) => entry.publicProfile);
if (
  new Set(directoryProfiles).size !== 20 ||
  directoryProfiles.filter((path) => path?.startsWith("/parishes/")).length !== 16 ||
  directoryProfiles.filter((path) => path?.startsWith("/catholic-life/")).length !== 4
) {
  errors.push("all 20 Sielovada entries must resolve to 16 historical and 4 Catholic-life profiles");
}

const reviewedDraugas = directory?.entries?.filter(
  (entry) =>
    entry.draugasEvidence?.publisher === "Draugas" &&
    /^https:\/\/(?:www\.)?draugas\.org\//.test(entry.draugasEvidence.url) &&
    ["page_context_verified", "public_web_article_verified"].includes(
      entry.draugasReviewStatus,
    ),
);
if (
  reviewedDraugas?.length !== 20 ||
  directory?.draugasEvidenceRevision !== "draugas-sielovada-20-2026-08-15"
) {
  errors.push("reviewed Draugas evidence is incomplete for the 20 directory entries");
}

if (events.alerts?.length !== 10 || events.campaigns?.length !== 4) {
  errors.push("current-event population drifted from 10 alerts / 4 campaigns");
}
if (events.alerts?.some((alert) => alert.id === "cleveland-st-casimir-watch")) {
  errors.push("retired Cleveland St. Casimir watch alert returned");
}

for (const [label, source] of [
  ["page", pageSource],
  ["view model", viewSource],
  ["map", mapSource],
]) {
  if (/design\/handoff\/living-network|today-network\.json|watch-list\.json|pastoral-conditions\.json|line-drawings\.json/.test(source)) {
    errors.push(`${label} reads a non-production design fixture`);
  }
}

for (const required of [
  "canonical-current-events-projection.json",
  "currentPastoralNetwork",
  "romanCatholicInstitutionHistory",
  "widerCatholicLifeRecords",
]) {
  if (!viewSource.includes(required)) {
    errors.push(`typed Living Network view is missing ${required}`);
  }
}

if (!viewSource.includes('"washington-epiphany": { x: 828, y: 267.5 }')) {
  errors.push("Washington city-level map correction is missing");
}
if (!pageSource.includes("getClearedPhoto")) {
  errors.push("Living Network page no longer enforces cleared image rights");
}
if (
  !profilePageSource.includes("pastoralDirectoryEntry?.draugasEvidence") ||
  !profilePageSource.includes("registrySourcesForProfile") ||
  !profilePageSource.includes("core && !pastoralDirectoryEntry?.draugasEvidence")
) {
  errors.push("reviewed Draugas evidence does not replace weaker date-only sources on profile surfaces");
}
if (
  pageSource.includes("card.draugasEvidence") ||
  pageSource.includes("Checked {card.checked}") ||
  pageSource.includes(">Official website<") ||
  pageSource.includes("view.observed") ||
  pageSource.includes("view.generated") ||
  pageSource.includes("view.revision")
) {
  errors.push("Living Network overview leaks profile-level provenance or internal revision metadata");
}
if (
  !viewSource.includes("entry.publicProfile") ||
  !catholicLifeProjectionSource.includes("directoryProfiles.length !== 4") ||
  !catholicLifeProfileSource.includes("record.directoryEntry.draugasEvidence") ||
  !catholicLifeProfileSource.includes("ProfileSourceLedger")
) {
  errors.push("the four non-census Sielovada profiles are not fully published from canon");
}
if (
  photos["our-lady-immaculate-conception-freeland-pa-line-drawing"]?.rights !==
    "own_work" ||
  !viewSource.includes("canonicalSubjectId")
) {
  errors.push("Freeland current-parish portrait join is missing or uncleared");
}
if (photos["sv-mykolo-scranton-pa-line-drawing"]?.rights !== "own_work") {
  errors.push("Scranton St. Michael watch portrait is missing or uncleared");
}

if (errors.length) {
  throw new Error(`Living Network verification failed:\n- ${errors.join("\n- ")}`);
}

console.log(
  "OK: Living Network reads current canon (14 regular places, 20 directory entries with 20 profiles, 3 wider-life records, 10 current situations) and no design snapshots.",
);
