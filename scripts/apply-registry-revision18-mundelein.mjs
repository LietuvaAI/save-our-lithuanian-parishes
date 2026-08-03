// Apply the current-institution research admitted by CultureNet Registry
// Revision 18 before synchronizing the canonical publication projection.
import { readFileSync, writeFileSync } from "node:fs";

const read = (name) =>
  JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"));
const write = (name, value) =>
  writeFileSync(
    new URL(`../data/${name}`, import.meta.url),
    `${JSON.stringify(value, null, 2)}\n`,
  );

const registry = read("registry-unified.json");
const situations = read("parish-situation.json");
const network = read("sielovada-us-network.json");

const mundelein = {
  slug: "our-lady-of-siluva-mission-mundelein-il",
  names: {
    lt: "Šiluvos Mergelės Marijos lietuvių katalikų misija",
    en: "Our Lady of Siluva Lithuanian Mission",
    variants: [
      "Our Lady of Siluva Lithuanian Catholic Mission",
      "Waukegan-Lake County Lithuanian Catholic Mission",
    ],
  },
  city: "Mundelein",
  state: "IL",
  country: "US",
  record_type: "misija",
  comparator: false,
  in_locked_scope: false,
  sources: [
    {
      axis: "official-current",
      kind: "archdiocesan-directory",
      ref: "Our Lady of Siluva Lithuanian Mission",
      sourceUrl: "https://www.archchicago.org/about-us/parish-directory",
    },
    {
      axis: "official-current",
      kind: "archdiocesan-reporting",
      ref: "Lithuanians have new option for worshipping",
      sourceUrl:
        "https://www.chicagocatholic.com/chicagoland/-/article/2014/02/09/lithuanians-have-new-option-for-worshipping",
    },
    {
      axis: "sielovada",
      kind: "pastoral-directory",
      ref: "Šiaurės Amerika",
      sourceUrl: "https://sielovada.org/siaures-amerika/",
    },
    {
      axis: "sielovada",
      kind: "pastoral-visit-report",
      ref: "LVK delegato užsienio lietuvių sielovadai viešnagė pas Amerikos lietuvius",
      sourceUrl:
        "https://sielovada.org/lvk-delegato-uzsienio-lietuviu-sielovadai-viesnage-pas-amerikos-lietuvius/",
    },
  ],
  years: {
    founded: [
      {
        value: "2013",
        source: "official-current",
        cite: "Archdiocesan decree in December 2013; first Mass 2013-12-15",
      },
    ],
    closed: [],
  },
  conflicts: [],
  related_sites: [
    {
      name: "Santa Maria del Popolo Church",
      address: "116 N Lake St, Mundelein, IL 60060",
      relationship: "hosted_monthly_lithuanian_mass",
    },
  ],
  events_refs: [],
  geo: {
    lat: 42.26441,
    lon: -88.00341,
    precision: "address-geocode",
    source: "Santa Maria del Popolo host-site address",
  },
  congregation_class: "roman_catholic",
  axes_count: 2,
  record_depth: "multi-source",
  diocese: "Archdiocese of Chicago",
  description:
    "Archdiocesan Lithuanian mission established in 2013 for the Waukegan and Lake County area, with monthly Lithuanian Mass at Santa Maria del Popolo in Mundelein.",
  city_history: [],
  public_census: {
    included: true,
    scope: "public_us_institution",
    reason:
      "Official archdiocesan and Lithuanian pastoral records establish a distinct current mission.",
    identity_support: "multi_source_corroborated",
  },
};

const existingIndex = registry.parishes.findIndex(
  (record) => record.slug === mundelein.slug,
);
if (existingIndex >= 0) registry.parishes[existingIndex] = mundelein;
else registry.parishes.push(mundelein);

situations.parishes[mundelein.slug] = {
  registry_slug: mundelein.slug,
  canonical_status: "standing",
  building_fate: "standing",
  current_use:
    "Active Lithuanian Catholic mission celebrating monthly Mass at Santa Maria del Popolo Church, 116 N Lake St., Mundelein",
  lithuanian_identity: "active_parish",
  pastoral_status: "visiting_priest",
  situation:
    "The Archdiocese of Chicago established Our Lady of Siluva Lithuanian Mission by decree in December 2013. Its first Mass was celebrated on December 15, 2013, and Lithuanian Mass continues monthly at Santa Maria del Popolo Church for the Waukegan and Lake County community.",
  current_record_as_of: "2026-08-02",
  sources: mundelein.sources.map((source) => ({
    title: source.ref,
    publisher:
      source.axis === "official-current"
        ? "Archdiocese of Chicago"
        : "Užsienio lietuvių sielovada",
    date: "accessed 2026-08-02",
    url: source.sourceUrl,
  })),
};

const mundeleinNetwork = network.entries.find(
  (entry) => entry.id === "mundelein-our-lady-of-siluva-mission",
);
if (!mundeleinNetwork) throw new Error("Mundelein is missing from Sielovada network.");
mundeleinNetwork.registrySlug = mundelein.slug;
mundeleinNetwork.ministry =
  "Active Lithuanian Catholic mission with monthly Lithuanian Mass at Santa Maria del Popolo Church.";
mundeleinNetwork.note =
  "Distinct mission established by Archdiocese of Chicago decree in December 2013; admitted to the canonical registry on 2026-08-02.";

const brooklyn = network.entries.find((entry) => entry.id === "brooklyn-annunciation");
if (!brooklyn) throw new Error("Brooklyn Annunciation is missing from Sielovada network.");
brooklyn.networkClass = "mass_continues";
brooklyn.ministry =
  "The Lithuanian parish institution merged in 2019; weekly Lithuanian Mass continues at Annunciation Church within the successor parish.";

const maspeth = network.entries.find((entry) => entry.id === "maspeth-transfiguration");
if (!maspeth) throw new Error("Maspeth Transfiguration is missing from Sielovada network.");
maspeth.networkClass = "no_lithuanian_liturgy";
maspeth.ministry =
  "Lithuanian parish life ended at this church in 2019; its Lithuanian Mass moved to Annunciation Church in Brooklyn.";

const countBy = (networkClass) =>
  network.entries.filter((entry) => entry.networkClass === networkClass).length;
network.networkRevision = {
  version: 2,
  date: "2026-08-02",
  basis:
    "Complete United States listing on the Lithuanian Bishops' Conference diaspora pastoral-care directory, reconciled to the canonical CultureNet institution projection and current juridic status evidence.",
};
network.source.checked = "2026-08-02";
network.counts = {
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

write("registry-unified.json", registry);
write("parish-situation.json", situations);
write("sielovada-us-network.json", network);

console.log(
  `OK: staged Mundelein mission and reconciled Sielovada network (${network.counts.activeParishes} parishes, ${network.counts.activeMissions} missions, ${network.counts.massContinues} hosted Masses).`,
);
