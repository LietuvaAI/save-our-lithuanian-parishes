import { readFileSync } from "node:fs";

const projection = JSON.parse(
  readFileSync(
    new URL("../data/canonical-infographic-projection.json", import.meta.url),
    "utf8",
  ),
);

const wider = projection.wider_catholic_life;
if (!wider) throw new Error("Brain projection has no wider_catholic_life layer");

const houses = wider.documented_religious_houses?.houses ?? [];
const communities =
  wider.additional_pastoral_communities?.communities ?? [];
const records = [...houses, ...communities];
const expectedIds = new Set([
  "cn:organization:kennebunk-lithuanian-franciscan-friary",
  "cn:organization:putnam-immaculate-conception-sisters",
  "cn:organization:atlanta-lithuanian-catholic-worship-community",
]);

if (
  wider.documented_religious_houses.population !== 2 ||
  houses.length !== 2 ||
  wider.additional_pastoral_communities.population !== 1 ||
  communities.length !== 1 ||
  records.length !== expectedIds.size
) {
  throw new Error("Wider Catholic-life population must remain 2 houses + 1 community");
}

const institutionIds = new Set(
  projection.institution_history.map((row) => row.culturenet_entity_id),
);
const regularNetworkIds = new Set(
  projection.current_pastoral_network.members.map((row) => row.entity_id),
);

for (const record of records) {
  if (!expectedIds.delete(record.entity_id)) {
    throw new Error(`Unexpected or duplicate wider Catholic-life record: ${record.entity_id}`);
  }
  if (
    !Number.isFinite(record.geo?.lat) ||
    !Number.isFinite(record.geo?.lon) ||
    record.geo.precision !== "address_geocode"
  ) {
    throw new Error(`${record.entity_id}: canonical address geocode missing`);
  }
  if (institutionIds.has(record.entity_id)) {
    throw new Error(`${record.entity_id}: leaked into the 155-institution census`);
  }
  if (regularNetworkIds.has(record.entity_id)) {
    throw new Error(`${record.entity_id}: leaked into the regular current-worship network`);
  }
}

if (expectedIds.size) {
  throw new Error(`Missing wider Catholic-life IDs: ${[...expectedIds].join(", ")}`);
}

if (
  projection.counts.public_us_institutions !== 155 ||
  projection.current_pastoral_network.counts.active_parish !== 6 ||
  projection.current_pastoral_network.counts.active_mission !== 2 ||
  projection.current_pastoral_network.counts.mass_continues !== 6
) {
  throw new Error("Core institution or current-worship counts drifted");
}

console.log(
  "OK: wider Catholic life is 2 religious houses + 1 occasional community, geocoded and excluded from 155/137/14.",
);
