import {
  currentPastoralNetwork,
  type CurrentPastoralDirectoryEntry,
} from "@/lib/infographic-projection";
import {
  widerCatholicLifeBySlug,
  widerCatholicLifeRecords,
  type WiderCatholicLifeRecord,
} from "@/lib/wider-catholic-life";

export type CatholicLifeProfileRecord = {
  slug: string;
  href: string;
  nameLt: string;
  nameEn: string;
  city: string;
  state: string;
  address: string;
  classificationLabel: string;
  currentStatus: string;
  explanation: string;
  identityNote: string | null;
  populationNote: string;
  officialSite: string | null;
  hostName?: string;
  hostSite?: string;
  latestDocumentedMass?: string;
  observedAt: string;
  portraitKey: string;
  directoryEntry: CurrentPastoralDirectoryEntry | null;
  widerRecord: WiderCatholicLifeRecord | null;
};

function slugFromProfile(profile: string) {
  const match = profile.match(/^\/catholic-life\/([^/]+)$/);
  if (!match) throw new Error(`${profile}: unsupported Catholic-life profile path`);
  return match[1];
}

function classificationLabel(entry: CurrentPastoralDirectoryEntry) {
  if (entry.networkClass === "mass_continues") return "Hosted Lithuanian Mass";
  if (entry.networkClass === "religious_house") return "Religious house";
  return "Sielovada directory listing";
}

function currentStatus(entry: CurrentPastoralDirectoryEntry) {
  if (entry.networkClass === "mass_continues") {
    return "Regular Lithuanian worship continues";
  }
  if (entry.networkClass === "religious_house") return "Current religious house";
  return "Mass listed in English only";
}

function populationNote(entry: CurrentPastoralDirectoryEntry) {
  if (entry.networkClass === "mass_continues") {
    return "This hosted community is one of the 14 current places of regular Lithuanian Catholic worship. It is not a separate historical Lithuanian parish or mission, so it does not increase the 155-institution census or the 137 Roman Catholic histories.";
  }
  if (entry.networkClass === "religious_house") {
    return "This religious house belongs to the wider record of Lithuanian Catholic life. It is not a parish or mission and is therefore outside the 155-institution census, the 137 Roman Catholic histories, and the 14-place regular worship network.";
  }
  return "This is one of the 20 places in Sielovada’s U.S. directory, but it is not part of the 14-place regular Lithuanian-worship network. It has not been joined to a distinct row in the 155-institution historical census, so publishing this directory profile does not change the historical totals.";
}

const directoryProfileEntries = currentPastoralNetwork.directory.entries.filter(
  (entry) => entry.publicProfile.startsWith("/catholic-life/"),
);

const directoryProfiles: CatholicLifeProfileRecord[] = directoryProfileEntries.map(
  (entry) => {
    const slug = slugFromProfile(entry.publicProfile);
    const wider = widerCatholicLifeBySlug.get(slug) ?? null;
    return {
      slug,
      href: entry.publicProfile,
      nameLt: entry.nameLt,
      nameEn: entry.nameEn,
      city: entry.city,
      state: entry.state,
      address: entry.address,
      classificationLabel: classificationLabel(entry),
      currentStatus: currentStatus(entry),
      explanation: wider?.explanation ?? entry.ministry,
      identityNote: entry.note ?? null,
      populationNote: populationNote(entry),
      officialSite: entry.officialSite ?? wider?.officialSite ?? null,
      hostName: wider?.hostName,
      hostSite: wider?.hostSite,
      latestDocumentedMass: wider?.latestDocumentedMass,
      observedAt: String(currentPastoralNetwork.directory.source.checked),
      portraitKey: `${entry.id}-line-drawing`,
      directoryEntry: entry,
      widerRecord: wider,
    };
  },
);

const directorySlugs = new Set(directoryProfiles.map((record) => record.slug));
const widerOnlyProfiles: CatholicLifeProfileRecord[] = widerCatholicLifeRecords
  .filter((record) => !directorySlugs.has(record.slug))
  .map((record) => ({
    slug: record.slug,
    href: record.href,
    nameLt: record.nameLt,
    nameEn: record.nameEn,
    city: record.city,
    state: record.state,
    address: record.address,
    classificationLabel: record.classificationLabel,
    currentStatus: record.currentStatus,
    explanation: record.explanation,
    identityNote: null,
    populationNote:
      "This record broadens the documented view of Lithuanian Catholic life without changing the 155-institution census, the 137 Roman Catholic histories, or the 14-place regular worship network.",
    officialSite: record.officialSite,
    hostName: record.hostName,
    hostSite: record.hostSite,
    latestDocumentedMass: record.latestDocumentedMass,
    observedAt: record.observedAt,
    portraitKey: `${record.slug}-line-drawing`,
    directoryEntry: null,
    widerRecord: record,
  }));

export const catholicLifeProfileRecords = [
  ...directoryProfiles,
  ...widerOnlyProfiles,
];

export const catholicLifeProfileBySlug = new Map(
  catholicLifeProfileRecords.map((record) => [record.slug, record]),
);

if (
  directoryProfiles.length !== 4 ||
  catholicLifeProfileRecords.length !== 6 ||
  new Set(catholicLifeProfileRecords.map((record) => record.href)).size !== 6
) {
  throw new Error("Catholic-life profile projection is incomplete or duplicated.");
}
