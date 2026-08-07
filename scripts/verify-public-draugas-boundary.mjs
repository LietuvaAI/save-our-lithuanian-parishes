import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const errors = [];

for (const relativePath of [
  "app/parishes/[slug]/draugas/page.tsx",
  "data/canonical-draugas-mention-projection.json",
  "lib/draugas-mentions.ts",
  "scripts/verify-draugas-mention-projection.mjs",
]) {
  if (existsSync(join(root, relativePath))) {
    errors.push(`${relativePath}: unreviewed Draugas ledger surface remains public`);
  }
}

for (const relativePath of [
  "app/parishes/[slug]/page.tsx",
  "components/ProfileSourceLedger.tsx",
]) {
  const source = readFileSync(join(root, relativePath), "utf8");
  for (const forbidden of [
    "canonical-draugas-mention-projection",
    "getDraugasProfileLedger",
    "draugasLedger",
    "/draugas",
  ]) {
    if (source.includes(forbidden)) {
      errors.push(`${relativePath}: forbidden public ledger token ${forbidden}`);
    }
  }
}

const importer = readFileSync(
  join(root, "scripts/import-brain-projections.mjs"),
  "utf8",
);
if (importer.includes("canonical-draugas-mention-projection")) {
  errors.push(
    "scripts/import-brain-projections.mjs: unreviewed Draugas ledger projection is imported",
  );
}

const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
for (const required of [
  'source: "/parishes/:slug/draugas"',
  'destination: "/parishes/:slug"',
  "permanent: true",
]) {
  if (!nextConfig.includes(required)) {
    errors.push(`next.config.ts: retired Draugas route redirect is missing ${required}`);
  }
}

const redirectRoutePath = "app/parishes/[slug]/draugas/route.ts";
if (!existsSync(join(root, redirectRoutePath))) {
  errors.push(`${redirectRoutePath}: deployment-safe redirect endpoint is missing`);
} else {
  const redirectRoute = readFileSync(join(root, redirectRoutePath), "utf8");
  for (const required of ["NextResponse.redirect", "308", "/parishes/"]) {
    if (!redirectRoute.includes(required)) {
      errors.push(`${redirectRoutePath}: redirect requirement is missing ${required}`);
    }
  }
  for (const forbidden of ["canonical-draugas", "indexedOccurrences", "issues"]) {
    if (redirectRoute.includes(forbidden)) {
      errors.push(`${redirectRoutePath}: retired ledger content token remains ${forbidden}`);
    }
  }
}

const profileSources = readFileSync(join(root, "lib/profile-sources.ts"), "utf8");
const historicalRegistryBlock = profileSources.match(
  /if \(axis === "draugas-registry-1909-2007"\) \{([\s\S]*?)\n\s*\}/,
);
if (!historicalRegistryBlock) {
  errors.push("lib/profile-sources.ts: historical Draugas registry boundary is missing");
} else if (!historicalRegistryBlock[1].includes("continue;")) {
  errors.push("lib/profile-sources.ts: historical Draugas registry candidates are not suppressed");
} else {
  for (const forbidden of ["draugasSource(", "source.total_mentions", "drafts.push("]) {
    if (historicalRegistryBlock[1].includes(forbidden)) {
      errors.push(
        `lib/profile-sources.ts: historical Draugas registry block publishes ${forbidden}`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  "OK: unreviewed 1909-2007 Draugas index remains research-only; reviewed case citations may publish.",
);
