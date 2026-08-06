import { readFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const projection = readJson("data/canonical-draugas-mention-projection.json");
const publication = readJson("data/canonical-publication-projection.json");

if (projection.schema !== "culturenet-parish-draugas-mention-projection.v1") {
  throw new Error(`Unsupported Draugas projection: ${projection.schema}`);
}
if (projection.authority?.repository !== "LietuvaAI/culturenet-brain") {
  throw new Error("Draugas projection is not Brain-authoritative");
}

const serialized = JSON.stringify(projection).toLowerCase();
for (const forbidden of ['"context"', '"snippet"', "/volumes/", "file://"]) {
  if (serialized.includes(forbidden)) {
    throw new Error(`Draugas projection exposes forbidden material: ${forbidden}`);
  }
}

const publicationByRoute = new Map(
  publication.public_institutions.map((row) => [row.public_profile, row]),
);
const profileByRoute = new Map();
let occurrences = 0;
let issueFiles = 0;

for (const profile of projection.profiles) {
  if (profileByRoute.has(profile.public_profile)) {
    throw new Error(`Duplicate Draugas profile route: ${profile.public_profile}`);
  }
  profileByRoute.set(profile.public_profile, profile);
  const institution = publicationByRoute.get(profile.public_profile);
  if (!institution) {
    throw new Error(`Draugas route is outside canonical publication: ${profile.public_profile}`);
  }
  if (
    institution.registry_slug !== profile.registry_slug ||
    institution.culturenet_entity_id !== profile.culturenet_entity_id
  ) {
    throw new Error(`${profile.public_profile}: canonical identity drift`);
  }
  if (profile.series[0]?.role !== "primary") {
    throw new Error(`${profile.public_profile}: primary series must be first`);
  }

  const keys = new Set();
  for (const series of profile.series) {
    if (keys.has(series.parish_key)) {
      throw new Error(`${profile.public_profile}: duplicate series ${series.parish_key}`);
    }
    keys.add(series.parish_key);
    const ids = new Set();
    const datedOccurrences = series.issues.reduce((total, issue) => {
      if (ids.has(issue.id)) throw new Error(`${series.parish_key}: duplicate ${issue.id}`);
      ids.add(issue.id);
      const url = new URL(issue.public_url);
      if (url.hostname !== "www.draugas.org") {
        throw new Error(`${series.parish_key}: non-Draugas issue URL`);
      }
      if (decodeURIComponent(url.pathname.split("/").at(-1)) !== issue.file) {
        throw new Error(`${series.parish_key}: issue filename URL drift`);
      }
      return total + issue.indexed_occurrences;
    }, 0);
    if (
      datedOccurrences !== series.dated_occurrences ||
      series.issues.length !== series.dated_issue_files ||
      datedOccurrences + series.undated_occurrences !== series.indexed_occurrences
    ) {
      throw new Error(`${series.parish_key}: projected count drift`);
    }
    occurrences += series.indexed_occurrences;
    issueFiles += series.dated_issue_files;
  }
}

if (
  occurrences !== projection.counts.indexed_occurrences_across_series ||
  issueFiles !== projection.counts.dated_issue_files_across_series ||
  profileByRoute.size !== projection.counts.public_profiles_with_ledgers
) {
  throw new Error("Draugas projection aggregate drift");
}

const expectedCampaigns = new Map([
  ["/parishes/dievo-apvaizdos-southfield-mi", 211],
  ["/parishes/kristaus-atsimainymo-maspeth-ny", 297],
  ["/parishes/sv-juozapo-waterbury-ct", 93],
  ["/parishes/svc-trejybes-hartford-ct", 556],
]);
for (const [route, expected] of expectedCampaigns) {
  const actual = profileByRoute.get(route)?.series[0]?.indexed_occurrences;
  if (actual !== expected) {
    throw new Error(`${route}: expected ${expected} primary references, found ${actual}`);
  }
}

const waterbury = profileByRoute.get("/parishes/sv-juozapo-waterbury-ct");
if (
  waterbury.series[0].dated_issue_files !== 77 ||
  waterbury.series[0].first_issue_date !== "1909-09-30" ||
  waterbury.series[0].last_issue_date !== "2007-07-20"
) {
  throw new Error("Waterbury Draugas ledger contract drift");
}

console.log(
  `OK: ${profileByRoute.size} canonical Draugas profile ledgers; ` +
    `${occurrences} indexed occurrences across ${issueFiles} dated issue files.`,
);
