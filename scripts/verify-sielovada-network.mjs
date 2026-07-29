import { readFileSync } from "node:fs";

const read = (name) =>
  JSON.parse(
    readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"),
  );

const network = read("sielovada-us-network.json");
const registry = read("registry-unified.json").parishes;
const registryBySlug = new Map(registry.map((record) => [record.slug, record]));
const errors = [];

const allowedDirectoryTypes = new Set([
  "parish",
  "mission",
  "mission_community",
  "church",
  "religious_house",
]);
const allowedNetworkClasses = new Set([
  "active_parish",
  "active_mission",
  "mass_continues",
  "unresolved",
  "no_lithuanian_liturgy",
  "directory_conflict",
  "religious_house",
]);
const publicRegistryTypes = new Set(["parish", "misija", "congregation"]);
const ids = new Set();
const registrySlugs = new Set();

for (const entry of network.entries) {
  if (ids.has(entry.id)) errors.push(`${entry.id}: duplicate network id`);
  ids.add(entry.id);

  if (!allowedDirectoryTypes.has(entry.directoryType)) {
    errors.push(`${entry.id}: unsupported directoryType ${entry.directoryType}`);
  }
  if (!allowedNetworkClasses.has(entry.networkClass)) {
    errors.push(`${entry.id}: unsupported networkClass ${entry.networkClass}`);
  }
  if (
    !entry.sourceRefs?.includes(network.source.id) ||
    !entry.nameLt ||
    !entry.nameEn ||
    !entry.city ||
    !entry.state ||
    !entry.ministry
  ) {
    errors.push(`${entry.id}: incomplete sourced public record`);
  }

  if (entry.registrySlug) {
    if (registrySlugs.has(entry.registrySlug)) {
      errors.push(`${entry.id}: duplicate registry match ${entry.registrySlug}`);
    }
    registrySlugs.add(entry.registrySlug);
    const match = registryBySlug.get(entry.registrySlug);
    if (!match) {
      errors.push(`${entry.id}: registry match ${entry.registrySlug} is missing`);
    } else if (
      !publicRegistryTypes.has(match.record_type) ||
      match.country === "CA" ||
      match.congregation_class !== "roman_catholic"
    ) {
      errors.push(
        `${entry.id}: registry match ${entry.registrySlug} is not a public U.S. Roman Catholic institution`,
      );
    }
  }

  if (
    entry.directoryType === "religious_house" &&
    (entry.registrySlug || entry.networkClass !== "religious_house")
  ) {
    errors.push(
      `${entry.id}: a religious house must remain outside parish counts`,
    );
  }
  if (entry.networkClass === "active_parish" && !entry.registrySlug) {
    errors.push(`${entry.id}: active parish lacks a canonical registry match`);
  }
}

const countBy = (value) =>
  network.entries.filter((entry) => entry.networkClass === value).length;
const expectedCounts = {
  listed: network.entries.length,
  activeParishes: countBy("active_parish"),
  activeMissions: countBy("active_mission"),
  massContinues: countBy("mass_continues"),
  unresolved: countBy("unresolved"),
  noLithuanianLiturgy: countBy("no_lithuanian_liturgy"),
  directoryConflict: countBy("directory_conflict"),
  religiousHouse: countBy("religious_house"),
  registryMatches: network.entries.filter((entry) => entry.registrySlug).length,
  networkOnly: network.entries.filter((entry) => !entry.registrySlug).length,
};

for (const [field, expected] of Object.entries(expectedCounts)) {
  if (network.counts[field] !== expected) {
    errors.push(
      `counts.${field}=${network.counts[field]}, expected ${expected}`,
    );
  }
}

if (network.counts.activeParishes !== 7) {
  errors.push(
    `active parish canon changed: expected 7, found ${network.counts.activeParishes}`,
  );
}
if (network.counts.listed !== 20) {
  errors.push(
    `Sielovada U.S. crosswalk is incomplete: expected 20, found ${network.counts.listed}`,
  );
}

if (errors.length) {
  console.error(`SIELOVADA NETWORK VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  `OK: Sielovada U.S. network — ${network.counts.listed} listings, ${network.counts.activeParishes} active parishes, ${network.counts.activeMissions} active missions, ${network.counts.registryMatches} canonical profile matches.`,
);
