import {
  additionalPastoralCommunities,
  documentedReligiousHouses,
  widerCatholicLife,
} from "@/lib/infographic-projection";

const ROUTE_BY_ENTITY_ID: Record<string, string> = {
  "cn:organization:kennebunk-lithuanian-franciscan-friary":
    "kennebunk-lithuanian-franciscan-friary",
  "cn:organization:putnam-immaculate-conception-sisters":
    "putnam-immaculate-conception-sisters",
  "cn:organization:atlanta-lithuanian-catholic-worship-community":
    "atlanta-lithuanian-catholic-community",
};

function routeSlugFor(entityId: string) {
  const slug = ROUTE_BY_ENTITY_ID[entityId];
  if (!slug) throw new Error(`${entityId}: wider Catholic-life route is missing`);
  return slug;
}

export type WiderCatholicLifeRecord = {
  entityId: string;
  slug: string;
  href: string;
  nameLt: string;
  nameEn: string;
  city: string;
  state: string;
  address: string;
  classification: "religious_house" | "occasional_worship_community";
  classificationLabel: string;
  currentStatus: string;
  explanation: string;
  officialSite: string;
  hostName?: string;
  hostSite?: string;
  latestDocumentedMass?: string;
  geo: { lat: number; lon: number };
  observedAt: string;
};

const religiousHouseRecords: WiderCatholicLifeRecord[] =
  documentedReligiousHouses.map((house) => {
    const slug = routeSlugFor(house.entity_id);
    const explanation =
      house.community_type === "women_religious_house"
        ? "The Sisters’ convent and Immaculate Conception Center remain current at their Putnam address."
        : "The Lithuanian Franciscan friary remains current at its Kennebunk address, according to the Franciscan order’s official directory.";

    return {
      entityId: house.entity_id,
      slug,
      href: `/catholic-life/${slug}`,
      nameLt: house.name_lt,
      nameEn: house.name_en,
      city: house.city,
      state: house.state,
      address: house.address,
      classification: "religious_house",
      classificationLabel: "Religious house",
      currentStatus: "Current",
      explanation,
      officialSite: house.official_site,
      geo: house.geo,
      observedAt:
        widerCatholicLife.documented_religious_houses.observed_at,
    };
  });

const additionalCommunityRecords: WiderCatholicLifeRecord[] =
  additionalPastoralCommunities.map((community) => {
    const slug = routeSlugFor(community.entity_id);
    return {
      entityId: community.entity_id,
      slug,
      href: `/catholic-life/${slug}`,
      nameLt: community.name_lt,
      nameEn: community.name_en,
      city: community.city,
      state: community.state,
      address: community.host_address,
      classification: "occasional_worship_community",
      classificationLabel: "Occasional Lithuanian Mass community",
      currentStatus: "Occasional worship documented",
      explanation: community.explanation,
      officialSite: community.official_community_site,
      hostName: community.host_name,
      hostSite: community.host_site,
      latestDocumentedMass: community.latest_documented_lithuanian_mass,
      geo: community.geo,
      observedAt:
        widerCatholicLife.additional_pastoral_communities.observed_at,
    };
  });

export const widerCatholicLifeRecords = [
  ...religiousHouseRecords,
  ...additionalCommunityRecords,
];

export const widerCatholicLifeBySlug = new Map(
  widerCatholicLifeRecords.map((record) => [record.slug, record]),
);

if (
  widerCatholicLifeRecords.length !== 3 ||
  new Set(widerCatholicLifeRecords.map((record) => record.entityId)).size !== 3 ||
  widerCatholicLifeRecords.some(
    (record) =>
      !record.href ||
      record.geo.lat == null ||
      record.geo.lon == null,
  )
) {
  throw new Error("Wider Catholic-life page projection is incomplete.");
}
