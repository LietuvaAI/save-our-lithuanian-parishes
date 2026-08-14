import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { geoAlbersUsa } from "d3-geo";
import alertsData from "@/data/canonical-current-events-projection.json";
import contextPointsData from "@/data/context-points.json";
import {
  DiocesePill,
  DiocesanLeaderLink,
} from "@/components/DiocesePill";
import { EndStatePill } from "@/components/EndStatePill";
import RecordLensMap, {
  type RecordLensPoint,
} from "@/components/RecordLensMap";
import CurrentLifeFactSheet from "@/components/CurrentLifeFactSheet";
import { canonicalProfileHrefForRegistrySlug } from "@/lib/parish-profile";
import { getClearedPhoto } from "@/lib/photos";
import type { EndState, EndStateGroup } from "@/lib/end-state";
import {
  isHollowRecordMark,
  recordMarkColor,
  SIGNAL_RING_COLOR,
} from "@/lib/record-mark";
import {
  CLERGY_LABEL,
  FREQUENCY_SHORT,
  GOVERNANCE_LABEL,
} from "@/lib/watch-labels";
import {
  currentPastoralNetwork,
  type CurrentPastoralDirectoryEntry,
} from "@/lib/infographic-projection";
import {
  widerCatholicLifeRecords,
  type WiderCatholicLifeRecord,
} from "@/lib/wider-catholic-life";

export const metadata: Metadata = {
  title: "Lithuanian Catholic Life Today",
  description:
    "Where Lithuanian Catholic life still gathers in the United States: active parishes, missions, and Lithuanian Masses hosted within other churches.",
};

type NetworkClass = CurrentPastoralDirectoryEntry["networkClass"];
type NetworkEntry = CurrentPastoralDirectoryEntry;

type SustainabilityEntry = {
  id: string;
  entity: string;
  place: string;
  diocese: string;
  parishLink: string;
  dateObserved: string;
  situation: string;
  clergy: { arrangement: string };
  liturgy: { frequency: string };
  governance: string;
  sources: { title: string; publisher: string; url: string }[];
};

type ContextPoint = {
  slug: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
  group: EndStateGroup;
  href: string | null;
};

const networkDirectory = currentPastoralNetwork.directory;
const pastoralCounts = currentPastoralNetwork.counts;
const entries = networkDirectory.entries;
const worshipEntries = entries.filter((entry) =>
  (
    ["active_parish", "active_mission", "mass_continues"] as NetworkClass[]
  ).includes(entry.networkClass),
);
const otherEntries = entries.filter(
  (entry) =>
    !worshipEntries.includes(entry) && entry.networkClass !== "religious_house",
);
const sustainabilityEntries =
  alertsData.sustainabilityWatch as SustainabilityEntry[];

const CLASS_LABEL: Record<NetworkClass, string> = {
  active_parish: "Lithuanian parish",
  active_mission: "Lithuanian mission",
  mass_continues: "Hosted Lithuanian Mass",
  unresolved: "Future unresolved",
  no_lithuanian_liturgy: "No current Lithuanian Mass",
  directory_conflict: "Regular worship ended",
  religious_house: "Franciscan friary",
};

const activeCampaignLinks = new Set(
  (
    alertsData.alerts as Array<{
      kind?: string;
      parishLink: string;
    }>
  )
    .filter((alert) => alert.kind === "active")
    .map((alert) => alert.parishLink),
);
const contextPoints = contextPointsData.points as ContextPoint[];
const contextByHref = new Map(
  contextPoints
    .filter((point) => point.href)
    .map((point) => [point.href!, point]),
);
const statusByHref = new Map(
  contextPoints
    .filter((point) => point.href)
    .map((point) => [point.href!, point.group as EndState]),
);

const NETWORK_ONLY_COORDS: Record<string, { x: number; y: number }> = {
  "mundelein-our-lady-of-siluva-mission": { x: 631.2, y: 217.9 },
  "washington-epiphany": { x: 826.8, y: 267.4 },
};

function profileHrefForEntry(entry: NetworkEntry) {
  return entry.registrySlug
    ? canonicalProfileHrefForRegistrySlug(entry.registrySlug)
    : null;
}

const worshipProfileHrefs = new Set(
  worshipEntries
    .map(profileHrefForEntry)
    .filter((href): href is string => !!href),
);
const currentLifeSustainabilityEntries = sustainabilityEntries.filter(
  (entry) => worshipProfileHrefs.has(entry.parishLink),
);
const sustainabilityByHref = new Map(
  currentLifeSustainabilityEntries.map((entry) => [entry.parishLink, entry]),
);
const weeklyProfileCount = currentLifeSustainabilityEntries.filter(
  (entry) => entry.liturgy.frequency === "weekly",
).length;
const lithuanianKlebonasCount = currentLifeSustainabilityEntries.filter(
  (entry) => entry.clergy.arrangement === "lithuanian_klebonas",
).length;
const standaloneProfileCount = currentLifeSustainabilityEntries.filter(
  (entry) => entry.governance === "standalone",
).length;

function groupForEntry(entry: NetworkEntry): EndStateGroup {
  return entry.networkClass === "mass_continues"
    ? "mass_continues"
    : "active_parish";
}

const worshipMapPoints = worshipEntries.flatMap(
  (entry): RecordLensPoint[] => {
    const href = profileHrefForEntry(entry);
    const context = href ? contextByHref.get(href) : null;
    const coords = context ?? NETWORK_ONLY_COORDS[entry.id];
    if (!coords) return [];
    const group = groupForEntry(entry);

    return [
      {
        slug: entry.id,
        name: entry.nameLt,
        city: entry.city,
        state: entry.state,
        x: coords.x,
        y: coords.y,
        href,
        color: recordMarkColor(group),
        shape: "circle",
        hollow: isHollowRecordMark({
          group,
          networkClass: entry.networkClass,
        }),
        ringColor:
          href && activeCampaignLinks.has(href)
            ? SIGNAL_RING_COLOR.active
            : undefined,
        detail: CLASS_LABEL[entry.networkClass],
      },
    ];
  },
);

const mapProjection = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const widerMapPoints = widerCatholicLifeRecords.flatMap(
  (record): RecordLensPoint[] => {
    const projected = mapProjection([record.geo.lon, record.geo.lat]);
    if (!projected) return [];
    return [
      {
        slug: record.slug,
        name: record.nameLt,
        city: record.city,
        state: record.state,
        x: projected[0],
        y: projected[1],
        href: record.href,
        color:
          record.classification === "religious_house"
            ? "var(--foreground)"
            : "var(--mark-community)",
        shape: "triangle",
        hollow: record.classification === "occasional_worship_community",
        detail: record.classificationLabel,
      },
    ];
  },
);
const currentCatholicLifeMapPoints = [
  ...worshipMapPoints,
  ...widerMapPoints,
];

const worshipStateCount = new Set(
  worshipEntries.map((entry) => entry.state),
).size;

if (
  entries.length !== Number(networkDirectory.counts.listed) ||
  worshipEntries.length !==
    pastoralCounts.active_parish +
      pastoralCounts.active_mission +
      pastoralCounts.mass_continues
) {
  throw new Error(
    "Current Catholic life figures do not match the canonical pastoral projection",
  );
}
if (widerMapPoints.length !== widerCatholicLifeRecords.length) {
  throw new Error("A wider Catholic-life record could not be projected on the map");
}

function NetworkEntryRow({ entry }: { entry: NetworkEntry }) {
  const profileHref = profileHrefForEntry(entry);
  const isActiveInstitution =
    entry.networkClass === "active_parish" ||
    entry.networkClass === "active_mission";
  const profileSlug = profileHref?.replace(/^\/parishes\//, "") ?? null;
  const shouldShowPortrait =
    Boolean(profileSlug) &&
    (isActiveInstitution || entry.networkClass === "mass_continues");
  const portrait =
    shouldShowPortrait && profileSlug
      ? getClearedPhoto(`${profileSlug}-line-drawing`)
      : null;
  if (shouldShowPortrait && !portrait) {
    throw new Error(`Missing current-worship line drawing for ${entry.id}`);
  }
  const sustainability = profileHref
    ? sustainabilityByHref.get(profileHref)
    : null;

  return (
    <article
      className={`border-t border-rule py-3 ${portrait ? "grid grid-cols-[4.75rem_minmax(0,1fr)] gap-3" : ""}`}
    >
      {portrait && profileHref ? (
        <Link
          href={profileHref}
          aria-label={`Open the parish profile for ${entry.nameLt}`}
          className="relative block aspect-square self-start overflow-hidden border border-rule bg-white p-1.5 hover:border-accent"
          title={portrait.attribution}
        >
          <Image
            src={portrait.src}
            alt=""
            fill
            sizes="76px"
            className="object-contain mix-blend-multiply"
          />
        </Link>
      ) : null}
      <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif font-semibold leading-snug">
            {entry.nameLt}
          </h3>
          <p className="mt-0.5 text-small-copy text-muted">
            {entry.city}, {entry.state}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-small-copy font-medium text-muted">
            {CLASS_LABEL[entry.networkClass]}
          </span>
          {sustainability ? (
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <EndStatePill
                value={
                  statusByHref.get(sustainability.parishLink) ?? "unverified"
                }
              />
              <DiocesePill name={sustainability.diocese} />
            </div>
          ) : null}
        </div>
      </div>
      {sustainability ? (
        <>
          <p className="mt-1">
            <DiocesanLeaderLink diocese={sustainability.diocese} />
          </p>
          <dl className="mt-2 grid gap-x-3 gap-y-1 text-small-copy sm:grid-cols-3">
            <div>
              <dt className="inline text-muted">Clergy: </dt>
              <dd className="inline font-medium">
                {CLERGY_LABEL[sustainability.clergy.arrangement] ??
                  sustainability.clergy.arrangement}
              </dd>
            </div>
            <div>
              <dt className="inline text-muted">Lithuanian Mass: </dt>
              <dd className="inline font-medium">
                {FREQUENCY_SHORT[sustainability.liturgy.frequency] ??
                  sustainability.liturgy.frequency}
              </dd>
            </div>
            <div>
              <dt className="inline text-muted">Governance: </dt>
              <dd className="inline font-medium">
                {GOVERNANCE_LABEL[sustainability.governance] ??
                  sustainability.governance}
              </dd>
            </div>
          </dl>
        </>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-small-copy">
        {profileHref ? (
          <Link
            href={profileHref}
            className="font-medium underline underline-offset-2 hover:text-accent"
          >
            Parish profile
          </Link>
        ) : null}
        {entry.officialSite ? (
          <a
            href={entry.officialSite}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-accent"
          >
            Official website
          </a>
        ) : null}
        {sustainability ? (
          <span className="text-muted">
            Checked {sustainability.dateObserved}
          </span>
        ) : null}
      </div>
      </div>
    </article>
  );
}

function WiderCatholicLifeRow({
  record,
}: {
  record: WiderCatholicLifeRecord;
}) {
  return (
    <article className="border-t border-rule py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-card-title font-semibold leading-snug">
            <Link href={record.href} className="hover:text-accent">
              {record.nameLt}
            </Link>
          </h3>
          <p className="mt-0.5 text-small-copy text-muted">
            {record.city}, {record.state} · {record.classificationLabel}
          </p>
        </div>
        <span className="text-small-copy font-medium text-muted">
          {record.currentStatus}
        </span>
      </div>
      <p className="mt-2 text-body-copy leading-relaxed text-muted">
        {record.explanation}
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-small-copy">
        <Link
          href={record.href}
          className="font-medium underline underline-offset-2 hover:text-accent"
        >
          Record and sources
        </Link>
        <a
          href={record.officialSite}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-accent"
        >
          Official website
        </a>
      </div>
    </article>
  );
}

export default function LithuanianCatholicLifeTodayPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 pt-12 pb-2">
      <p className="text-small-copy uppercase text-muted">
        Current U.S. view
      </p>
      <h1 className="mt-1 font-serif text-page-title font-semibold leading-tight">
        Lithuanian Catholic life today
      </h1>
      <p className="mt-4 max-w-3xl font-serif text-section-title leading-relaxed sm:text-section-title">
        Where does Lithuanian Catholic worship still gather in the United
        States?
      </p>

      <section className="mt-10 border-y border-rule py-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
          <RecordLensMap
            points={currentCatholicLifeMapPoints}
            initialSelection="southfield-divine-providence"
            ariaLabel={`${worshipEntries.length} regular places of current Lithuanian Catholic worship, plus two documented religious houses and one additional occasional-worship community`}
            legend={[
              {
                label:
                  `Parish · ${pastoralCounts.active_parish}`,
                color: "var(--es-active)",
                shape: "circle",
              },
              {
                label:
                  `Mission · ${pastoralCounts.active_mission}`,
                color: "var(--es-active)",
                shape: "circle",
                hollow: true,
              },
              {
                label:
                  `Hosted Mass · ${pastoralCounts.mass_continues}`,
                color: "var(--es-mass)",
                shape: "circle",
                hollow: true,
              },
              {
                label: "Current campaign",
                color: SIGNAL_RING_COLOR.active,
                shape: "ring",
              },
              {
                label: "Religious house · 2",
                color: "var(--foreground)",
                shape: "triangle",
              },
              {
                label: "Occasional community · 1",
                color: "var(--mark-community)",
                shape: "triangle",
                hollow: true,
              },
            ]}
          />
          <div>
            <p className="font-serif text-page-title font-semibold leading-none">
              {worshipEntries.length}
            </p>
            <h2 className="mt-3 font-serif text-section-title font-semibold leading-tight">
              places still gather for Lithuanian Catholic worship
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              {pastoralCounts.active_parish} are Lithuanian parishes,{" "}
              {pastoralCounts.active_mission} are missions, and{" "}
              {pastoralCounts.mass_continues} are
              Lithuanian Masses hosted
              by another parish. The surviving network reaches{" "}
              {worshipStateCount} states.
            </p>
            <p className="mt-3 text-small-copy leading-relaxed text-muted">
              “Lithuanian parish” and “Lithuanian mission” here mean a
              Sielovada-listed community with verified current Lithuanian
              pastoral ministry. A Catholic parish may remain juridically open
              without being counted in this active Lithuanian pastoral network.
            </p>
          </div>
        </div>
        <p className="mt-5 border-t border-rule pt-3 text-small-copy leading-relaxed text-muted">
          Scope: {Number(networkDirectory.counts.listed)} official
          U.S. network listings; map population: {worshipEntries.length} places
          with regular current worship, plus {widerCatholicLifeRecords.length}
          {" "}wider Catholic-life records · Checked{" "}
          {String(networkDirectory.source.checked)} · Source:{" "}
          <a
            href={String(networkDirectory.source.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-accent"
          >
            Sielovada: North America
          </a>
          {" · "}
          <Link href="/about-the-data" className="underline hover:text-accent">
            About the data
          </Link>
        </p>
      </section>

      <CurrentLifeFactSheet
        places={worshipEntries.length}
        parishes={pastoralCounts.active_parish}
        missions={pastoralCounts.active_mission}
        hostedMasses={pastoralCounts.mass_continues}
        states={worshipStateCount}
        profiledCommunities={currentLifeSustainabilityEntries.length}
        lithuanianPastors={lithuanianKlebonasCount}
        weeklyMasses={weeklyProfileCount}
        standaloneGovernance={standaloneProfileCount}
        checked={String(networkDirectory.source.checked)}
      />

      <section className="mt-12" aria-labelledby="worship-network-heading">
        <h2
          id="worship-network-heading"
          className="font-serif text-section-title font-semibold"
        >
          Inspect the living network
        </h2>
        <div className="mt-4 grid gap-x-8 md:grid-cols-3">
          {(
            [
              ["active_parish", "Parishes"],
              ["active_mission", "Missions"],
              ["mass_continues", "Hosted Masses"],
            ] as const
          ).map(([networkClass, label]) => {
            const group = worshipEntries.filter(
              (entry) => entry.networkClass === networkClass,
            );
            return (
              <div key={networkClass}>
                <h3 className="font-sans text-card-title font-semibold">
                  {label} · {group.length}
                </h3>
                <div className="mt-2">
                  {group.map((entry) => (
                    <NetworkEntryRow key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="wider-life-heading">
        <h2
          id="wider-life-heading"
          className="font-serif text-section-title font-semibold"
        >
          Wider Lithuanian Catholic life · {widerCatholicLifeRecords.length}
        </h2>
        <p className="mt-2 max-w-3xl text-body-copy leading-relaxed text-muted">
          Two current religious houses and one additional occasional-worship
          community are documented separately. They appear on the map and have
          their own records, but they do not change the 155-institution census,
          the 137 Roman Catholic parish-and-mission histories, or the 14-place
          regular worship network.
        </p>
        <div className="mt-4 grid gap-x-8 md:grid-cols-2">
          {widerCatholicLifeRecords.map((record) => (
            <WiderCatholicLifeRow key={record.entityId} record={record} />
          ))}
        </div>
      </section>

      <details className="mt-12 border-y border-rule">
        <summary className="cursor-pointer py-4 font-medium">
          Other official network listings · {otherEntries.length}
        </summary>
        <div className="grid gap-x-8 border-t border-rule md:grid-cols-2">
          {otherEntries.map((entry) => (
            <NetworkEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      </details>

    </article>
  );
}
