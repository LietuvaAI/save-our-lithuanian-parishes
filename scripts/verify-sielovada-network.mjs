import { existsSync, readFileSync } from "node:fs";

const legacySideFile = new URL(
  "../data/sielovada-us-network.json",
  import.meta.url,
);
if (existsSync(legacySideFile)) {
  throw new Error(
    "Legacy pastoral-network side file must not exist; read current_pastoral_network from the Brain infographic projection",
  );
}

const read = (name) =>
  JSON.parse(
    readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"),
  );

const infographic = read("canonical-infographic-projection.json");
const canonicalPastoral = infographic.current_pastoral_network;
if (!canonicalPastoral?.directory) {
  throw new Error(
    "Brain projection lacks current_pastoral_network.directory",
  );
}
const network = canonicalPastoral.directory;
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
const publicProfiles = new Set();

for (const entry of network.entries) {
  if (ids.has(entry.id)) errors.push(`${entry.id}: duplicate network id`);
  ids.add(entry.id);

  if (!entry.publicProfile || publicProfiles.has(entry.publicProfile)) {
    errors.push(`${entry.id}: missing or duplicate public profile`);
  }
  publicProfiles.add(entry.publicProfile);

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
      match.country !== "US" ||
      match.congregation_class !== "roman_catholic"
    ) {
      errors.push(
        `${entry.id}: registry match ${entry.registrySlug} is not a public U.S. Roman Catholic institution`,
      );
    }
    if (entry.publicProfile !== match?.public_census?.canonical_profile) {
      errors.push(`${entry.id}: historical profile route disagrees with registry`);
    }
  } else if (!entry.publicProfile?.startsWith("/catholic-life/")) {
    errors.push(`${entry.id}: non-census listing lacks a Catholic-life profile`);
  }

  if (
    entry.directoryType === "religious_house" &&
    (entry.registrySlug || entry.networkClass !== "religious_house")
  ) {
    errors.push(
      `${entry.id}: a religious house must remain outside parish counts`,
    );
  }
  if (
    ["active_parish", "active_mission"].includes(entry.networkClass) &&
    !entry.registrySlug
  ) {
    errors.push(
      `${entry.id}: active parish or mission lacks a canonical registry match`,
    );
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

if (network.counts.activeParishes !== 6) {
  errors.push(
    `active parish canon changed: expected 6, found ${network.counts.activeParishes}`,
  );
}
if (network.counts.activeMissions !== 2) {
  errors.push(
    `active mission canon changed: expected 2, found ${network.counts.activeMissions}`,
  );
}
if (network.counts.massContinues !== 6) {
  errors.push(
    `hosted Lithuanian Mass canon changed: expected 6, found ${network.counts.massContinues}`,
  );
}
if (network.counts.listed !== 20) {
  errors.push(
    `Sielovada U.S. crosswalk is incomplete: expected 20, found ${network.counts.listed}`,
  );
}

const expectedActiveParishSlugs = [
  "andrew-philadelphia-pa",
  "casimir-cleveland-oh",
  "casimir-los-angeles-ca",
  "nativity-chicago-il",
  "peter-boston-ma",
  "providence-southfield-mi",
];
const expectedActiveMissionSlugs = [
  "george-lemont-il",
  "our-lady-of-siluva-mission-mundelein-il",
];
const activeSlugs = (networkClass) =>
  network.entries
    .filter((entry) => entry.networkClass === networkClass)
    .map((entry) => entry.registrySlug)
    .sort();
for (const [label, actual, expected] of [
  ["active parish membership", activeSlugs("active_parish"), expectedActiveParishSlugs],
  ["active mission membership", activeSlugs("active_mission"), expectedActiveMissionSlugs],
]) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`${label} changed: ${actual.join(", ")}`);
  }
}

const directoryMembership = network.entries
  .filter((entry) =>
    ["active_parish", "active_mission", "mass_continues"].includes(
      entry.networkClass,
    ),
  )
  .map((entry) =>
    `${entry.networkClass}:${entry.registrySlug ?? entry.canonicalEntityId ?? entry.id}`,
  )
  .sort();
const canonicalMembership = canonicalPastoral.members
  .map(
    (entry) =>
      `${entry.network_class}:${entry.registry_slug ?? entry.entity_id}`,
  )
  .sort();
if (
  JSON.stringify(directoryMembership) !== JSON.stringify(canonicalMembership)
) {
  errors.push(
    `canonical pastoral directory/member mismatch: directory=${directoryMembership.join(", ")} members=${canonicalMembership.join(", ")}`,
  );
}

const southfield = network.entries.find(
  (entry) => entry.id === "southfield-divine-providence",
);
if (!southfield) {
  errors.push("Southfield Divine Providence is missing from the current network");
} else {
  if (southfield.clergy?.includes("Tomas Miliauskas")) {
    errors.push(
      "Southfield still names Fr. Tomas Miliauskas as current clergy after his May 2026 departure",
    );
  }
  if (!southfield.ministry.includes("departed in May 2026")) {
    errors.push(
      "Southfield current-life summary lost the May 2026 pastor-departure correction",
    );
  }
}

if (errors.length) {
  console.error(`SIELOVADA NETWORK VIOLATIONS (${errors.length}):`);
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(
  `OK: Sielovada U.S. network — ${network.counts.listed} listings and ${publicProfiles.size} public profiles (${network.counts.registryMatches} historical, ${network.counts.networkOnly} Catholic-life).`,
);
