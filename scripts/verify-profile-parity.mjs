import { readFileSync } from "node:fs";

const readData = (name) =>
  JSON.parse(
    readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"),
  );

const registry = readData("registry-unified.json").parishes;
const core = readData("parishes.json").filter((parish) => !parish.mergedInto);
const contextPoints = readData("context-points.json").points;
const registryMap = readData("registry-map.json").points;
const alerts = readData("alerts.json");

const fail = (message) => {
  throw new Error(`Profile parity failed: ${message}`);
};

const coreByRow = new Map();
for (const parish of core) {
  for (const row of parish.c83Rows ?? []) {
    const existing = coreByRow.get(row);
    if (existing && existing.slug !== parish.slug) {
      fail(
        `c83 row ${row} maps to both ${existing.slug} and ${parish.slug}`,
      );
    }
    coreByRow.set(row, parish);
  }
}

const routeByRegistrySlug = new Map();
const registrySlugSet = new Set();
const routeSlugSet = new Set();

for (const entry of registry) {
  if (registrySlugSet.has(entry.slug)) {
    fail(`duplicate registry slug ${entry.slug}`);
  }
  registrySlugSet.add(entry.slug);

  const mappedCore =
    entry.c83_row == null ? null : coreByRow.get(entry.c83_row) ?? null;
  if (entry.c83_row != null && !mappedCore) {
    fail(`${entry.slug} has unmapped c83 row ${entry.c83_row}`);
  }
  if (mappedCore && mappedCore.city !== entry.city) {
    fail(
      `${entry.slug} c83 row ${entry.c83_row} points to ${mappedCore.slug} in ${mappedCore.city}, not ${entry.city}`,
    );
  }

  const routeSlug = mappedCore?.slug ?? entry.slug;
  if (routeSlugSet.has(routeSlug)) {
    fail(`canonical /parishes/${routeSlug} is claimed by multiple records`);
  }
  routeSlugSet.add(routeSlug);
  const href = `/parishes/${routeSlug}`;
  for (const registrySlug of [entry.slug, ...(entry.aliases ?? [])]) {
    const existing = routeByRegistrySlug.get(registrySlug);
    if (existing && existing !== href) {
      fail(
        `registry alias ${registrySlug} points to both ${existing} and ${href}`,
      );
    }
    routeByRegistrySlug.set(registrySlug, href);
  }
}

if (routeSlugSet.size !== registry.length) {
  fail(
    `${registry.length} registry records produced ${routeSlugSet.size} canonical routes`,
  );
}

for (const parish of core) {
  if (!routeSlugSet.has(parish.slug)) {
    fail(`deep profile ${parish.slug} has no canonical registry-backed route`);
  }
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
  if (!routeByRegistrySlug.has(point.slug)) {
    fail(`registry map parish ${point.slug} has no canonical profile`);
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
    if (!routeSlugSet.has(slug)) fail(`alert points to missing ${link}`);
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
  `OK: profile parity — ${registry.length} registry records, ${routeSlugSet.size} unique canonical profiles, ${contextPoints.length} context links.`,
);
