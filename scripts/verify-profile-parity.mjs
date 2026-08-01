import { readFileSync } from "node:fs";

const readData = (name) =>
  JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"));

const registry = readData("registry-unified.json").parishes;
const projection = readData("canonical-publication-projection.json");
const core = readData("parishes.json").filter((parish) => !parish.mergedInto);
const comparators = core.filter((parish) => parish.comparator);
const contextPoints = readData("context-points.json").points;
const registryMap = readData("registry-map.json").points;
const alerts = readData("alerts.json");

const fail = (message) => {
  throw new Error(`Profile parity failed: ${message}`);
};

const registryBySlug = new Map();
for (const entry of registry) {
  if (registryBySlug.has(entry.slug)) fail(`duplicate registry slug ${entry.slug}`);
  registryBySlug.set(entry.slug, entry);
}

const routeByRegistrySlug = new Map();
const routeSlugSet = new Set();
const legacyRouteSlugSet = new Set();
for (const institution of projection.public_institutions) {
  const entry = registryBySlug.get(institution.registry_slug);
  if (!entry) fail(`${institution.registry_slug} has no display record`);
  if (!entry.public_census?.included) {
    fail(`${institution.registry_slug} is canonical but not public in the display registry`);
  }
  const routeSlug = institution.public_profile.replace(/^\/parishes\//, "");
  if (!routeSlug || routeSlug === institution.public_profile) {
    fail(`${institution.registry_slug} has invalid route ${institution.public_profile}`);
  }
  if (routeSlugSet.has(routeSlug)) fail(`duplicate route ${institution.public_profile}`);
  routeSlugSet.add(routeSlug);
  for (const registrySlug of [entry.slug, ...(entry.aliases ?? [])]) {
    const existing = routeByRegistrySlug.get(registrySlug);
    if (existing && existing !== institution.public_profile) {
      fail(`${registrySlug} points to both ${existing} and ${institution.public_profile}`);
    }
    routeByRegistrySlug.set(registrySlug, institution.public_profile);
  }
}

for (const comparator of comparators) {
  const entry = registry.find(
    (candidate) =>
      candidate.c83_row != null &&
      comparator.c83Rows.includes(candidate.c83_row) &&
      candidate.city === comparator.city,
  );
  if (!entry) fail(`${comparator.slug} comparator has no display record`);
  if (routeSlugSet.has(comparator.slug)) fail(`duplicate comparator route ${comparator.slug}`);
  routeSlugSet.add(comparator.slug);
  const href = `/parishes/${comparator.slug}`;
  routeByRegistrySlug.set(entry.slug, href);
  for (const alias of entry.aliases ?? []) routeByRegistrySlug.set(alias, href);
}

const expectedProfiles =
  projection.counts.public_us_institutions + comparators.length;
if (routeSlugSet.size !== expectedProfiles) {
  fail(`${routeSlugSet.size} public profiles; expected ${expectedProfiles}`);
}

for (const parish of core) {
  const entry = registry.find(
    (candidate) =>
      candidate.c83_row != null &&
      parish.c83Rows.includes(candidate.c83_row) &&
      candidate.city === parish.city,
  );
  if (!entry || !routeByRegistrySlug.has(entry.slug)) {
    fail(`established deep profile ${parish.slug} has no canonical route`);
  }
  legacyRouteSlugSet.add(parish.slug);
}

for (const point of contextPoints) {
  if (!point.href?.startsWith("/parishes/")) {
    fail(`context point ${point.slug} has non-canonical href ${point.href}`);
  }
  if (!routeSlugSet.has(point.href.slice("/parishes/".length))) {
    fail(`context point ${point.slug} links to missing ${point.href}`);
  }
}

for (const point of registryMap) {
  if (point.kind !== "parish") continue;
  if (point.country === "US" && !routeByRegistrySlug.has(point.slug)) {
    fail(`U.S. registry map parish ${point.slug} has no canonical profile`);
  }
}

const linkedEntries = [
  ...(alerts.alerts ?? []),
  ...(alerts.campaigns ?? []),
  ...(alerts.sustainabilityWatch ?? []),
];
for (const entry of linkedEntries) {
  const link = entry.parishLink;
  if (link.startsWith("/parishes/")) {
    const slug = link.slice("/parishes/".length);
    if (!routeSlugSet.has(slug) && !legacyRouteSlugSet.has(slug)) {
      fail(`alert points to missing ${link}`);
    }
    continue;
  }
  if (link.startsWith("/registry/")) {
    const registrySlug = link.slice("/registry/".length);
    if (!routeByRegistrySlug.has(registrySlug)) {
      fail(`legacy alert points to unknown ${link}`);
    }
    continue;
  }
  fail(`unsupported parish link ${link}`);
}

console.log(
  `OK: profile parity — ${projection.counts.public_us_institutions} canonical U.S. institution profiles + ${comparators.length} Canadian comparator profiles; ${contextPoints.length} U.S. context links.`,
);
