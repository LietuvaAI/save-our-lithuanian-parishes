import type { Metadata } from "next";
import Link from "next/link";
import alertsData from "@/data/alerts.json";
import contextPointsData from "@/data/context-points.json";
import networkData from "@/data/sielovada-us-network.json";
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

export const metadata: Metadata = {
  title: "Lithuanian Catholic Life Today",
  description:
    "Where Lithuanian Catholic life still gathers in the United States: active parishes, missions, and Lithuanian Masses hosted within other churches.",
};

type NetworkClass =
  | "active_parish"
  | "active_mission"
  | "mass_continues"
  | "unresolved"
  | "no_lithuanian_liturgy"
  | "directory_conflict"
  | "religious_house";

type NetworkEntry = {
  id: string;
  nameLt: string;
  nameEn: string;
  city: string;
  state: string;
  networkClass: NetworkClass;
  ministry: string;
  clergy?: string;
  registrySlug?: string;
  officialSite?: string;
};

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

const entries = networkData.entries as NetworkEntry[];
const worshipEntries = entries.filter((entry) =>
  (
    ["active_parish", "active_mission", "mass_continues"] as NetworkClass[]
  ).includes(entry.networkClass),
);
const activeCommunityEntries = worshipEntries.filter((entry) =>
  (["active_parish", "active_mission"] as NetworkClass[]).includes(
    entry.networkClass,
  ),
);
const hostedMassEntries = worshipEntries.filter(
  (entry) => entry.networkClass === "mass_continues",
);
const otherEntries = entries.filter(
  (entry) => !worshipEntries.includes(entry),
);
const sustainabilityEntries =
  alertsData.sustainabilityWatch as SustainabilityEntry[];

const CLASS_LABEL: Record<NetworkClass, string> = {
  active_parish: "Active parish",
  active_mission: "Active mission",
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
const networkClassByHref = new Map(
  worshipEntries.flatMap((entry) => {
    const href = profileHrefForEntry(entry);
    return href ? [[href, entry.networkClass] as const] : [];
  }),
);
const currentLifeSustainabilityEntries = sustainabilityEntries.filter(
  (entry) => worshipProfileHrefs.has(entry.parishLink),
);
const lemontProfile = sustainabilityEntries.find(
  (entry) => entry.id === "lemont-matulaitis-mission-watch",
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

const worshipStateCount = new Set(
  worshipEntries.map((entry) => entry.state),
).size;

function NetworkClassPill({ value }: { value: NetworkClass }) {
  return (
    <span className="inline-flex shrink-0 rounded-full border border-rule px-2 py-0.5 text-[11px] font-semibold leading-4 text-muted">
      {CLASS_LABEL[value]}
    </span>
  );
}

function NetworkEntryRow({ entry }: { entry: NetworkEntry }) {
  const profileHref = profileHrefForEntry(entry);

  return (
    <article className="border-t border-rule py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif font-semibold leading-snug">
            {entry.nameLt}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {entry.city}, {entry.state}
          </p>
        </div>
        <NetworkClassPill value={entry.networkClass} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {profileHref ? (
          <Link
            href={profileHref}
            className="font-medium underline underline-offset-2 hover:text-accent"
          >
            Full community record
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
      </div>
    </article>
  );
}

function SustainabilityProfiles() {
  return (
    <section className="mt-14" aria-labelledby="parish-health-heading">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase text-muted">
          Pastoral conditions
        </p>
        <h2
          id="parish-health-heading"
          className="mt-1 font-serif text-2xl font-semibold"
        >
          What sustains the living network?
        </h2>
        <p className="mt-2 leading-relaxed text-muted">
          Across the {currentLifeSustainabilityEntries.length} current worship
          communities shown below:
        </p>
      </div>

      <div className="mt-5 grid border-y border-rule sm:grid-cols-3 sm:divide-x sm:divide-rule">
        <div className="py-4 sm:px-5 sm:first:pl-0">
          <p className="font-serif text-4xl font-semibold">
            {lithuanianKlebonasCount}
          </p>
          <p className="mt-1 text-sm leading-snug text-muted">
            have a Lithuanian-speaking klebonas
          </p>
        </div>
        <div className="border-t border-rule py-4 sm:border-t-0 sm:px-5">
          <p className="font-serif text-4xl font-semibold">
            {weeklyProfileCount}
          </p>
          <p className="mt-1 text-sm leading-snug text-muted">
            celebrate a weekly Lithuanian Mass
          </p>
        </div>
        <div className="border-t border-rule py-4 sm:border-t-0 sm:px-5 sm:last:pr-0">
          <p className="font-serif text-4xl font-semibold">
            {standaloneProfileCount}
          </p>
          <p className="mt-1 text-sm leading-snug text-muted">
            retain standalone governance
          </p>
        </div>
      </div>

      <details className="mt-5 border-y border-rule">
        <summary className="cursor-pointer py-4 font-medium">
          Inspect the {currentLifeSustainabilityEntries.length} communities
        </summary>
        <div className="divide-y divide-rule border-t border-rule">
          {currentLifeSustainabilityEntries.map((entry) => {
            const networkClass = networkClassByHref.get(entry.parishLink);

            return (
              <article key={entry.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={entry.parishLink}
                      className="font-serif text-lg font-semibold hover:underline"
                    >
                      {entry.entity}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted">{entry.place}</p>
                  </div>
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {networkClass ? (
                        <NetworkClassPill value={networkClass} />
                      ) : (
                        <EndStatePill
                          value={
                            statusByHref.get(entry.parishLink) ?? "unverified"
                          }
                        />
                      )}
                      <DiocesePill name={entry.diocese} />
                    </div>
                    <DiocesanLeaderLink diocese={entry.diocese} />
                  </div>
                </div>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase text-muted">Clergy</dt>
                    <dd className="mt-0.5 font-medium">
                      {CLERGY_LABEL[entry.clergy.arrangement] ??
                        entry.clergy.arrangement}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-muted">
                      Lithuanian Mass
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {FREQUENCY_SHORT[entry.liturgy.frequency] ??
                        entry.liturgy.frequency}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-muted">
                      Governance
                    </dt>
                    <dd className="mt-0.5 font-medium">
                      {GOVERNANCE_LABEL[entry.governance] ?? entry.governance}
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  <Link
                    href={entry.parishLink}
                    className="font-medium underline underline-offset-2 hover:text-accent"
                  >
                    Profile and full evidence
                  </Link>
                  <span className="text-muted">
                    Checked {entry.dateObserved}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </details>
    </section>
  );
}

export default function LithuanianCatholicLifeTodayPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase text-muted">
        Current U.S. view
      </p>
      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Lithuanian Catholic life today
      </h1>
      <p className="mt-4 max-w-3xl font-serif text-xl leading-relaxed sm:text-2xl">
        Where does Lithuanian Catholic worship still gather in the United
        States?
      </p>

      <section className="mt-10 border-y border-rule py-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
          <RecordLensMap
            points={worshipMapPoints}
            initialSelection="southfield-divine-providence"
            ariaLabel={`${worshipEntries.length} places with confirmed current Lithuanian Catholic worship across ${worshipStateCount} states`}
            legend={[
              {
                label: `Parish · ${networkData.counts.activeParishes}`,
                color: "var(--es-active)",
                shape: "circle",
              },
              {
                label: `Mission · ${networkData.counts.activeMissions}`,
                color: "var(--es-active)",
                shape: "circle",
                hollow: true,
              },
              {
                label: `Hosted Mass · ${networkData.counts.massContinues}`,
                color: "var(--es-mass)",
                shape: "circle",
                hollow: true,
              },
              {
                label: "Current campaign",
                color: SIGNAL_RING_COLOR.active,
                shape: "ring",
              },
            ]}
          />
          <div>
            <p className="font-serif text-6xl font-semibold leading-none">
              {activeCommunityEntries.length}
            </p>
            <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight">
              active Lithuanian Catholic communities
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              {networkData.counts.activeParishes} are Lithuanian parishes,{" "}
              and {networkData.counts.activeMissions} are Lithuanian missions.
              Another {networkData.counts.massContinues} communities host a
              Lithuanian Mass, bringing the living worship network to{" "}
              {worshipEntries.length} places across {worshipStateCount} states.
            </p>
          </div>
        </div>
        <p className="mt-5 border-t border-rule pt-3 text-xs leading-relaxed text-muted">
          Scope: {networkData.counts.listed} official U.S. network
          listings; map population: {worshipEntries.length} places with current
          worship · Checked {networkData.source.checked} · Source:{" "}
          <a
            href={networkData.source.url}
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

      {lemontProfile ? (
        <section className="mt-9 grid gap-4 border-l-4 border-[var(--es-active)] pl-5 sm:grid-cols-[minmax(12rem,0.55fr)_minmax(0,1.45fr)] sm:gap-8">
          <div>
            <p className="text-xs font-medium uppercase text-muted">
              Mission does not mean minor
            </p>
            <h2 className="mt-1 font-serif text-xl font-semibold leading-snug">
              Blessed Jurgis Matulaitis Mission, Lemont
            </h2>
          </div>
          <div>
            <p className="leading-relaxed text-muted">
              {lemontProfile.situation}
            </p>
            <Link
              href={lemontProfile.parishLink}
              className="mt-3 inline-block text-sm font-medium underline underline-offset-4 hover:text-accent"
            >
              See the Lemont community record
            </Link>
          </div>
        </section>
      ) : null}

      <CurrentLifeFactSheet
        places={worshipEntries.length}
        parishes={networkData.counts.activeParishes}
        missions={networkData.counts.activeMissions}
        hostedMasses={networkData.counts.massContinues}
        states={worshipStateCount}
        profiledCommunities={currentLifeSustainabilityEntries.length}
        lithuanianPastors={lithuanianKlebonasCount}
        weeklyMasses={weeklyProfileCount}
        standaloneGovernance={standaloneProfileCount}
        checked={networkData.source.checked}
      />

      <section className="mt-12" aria-labelledby="worship-network-heading">
        <h2
          id="worship-network-heading"
          className="font-serif text-2xl font-semibold"
        >
          Inspect the living network
        </h2>
        <div className="mt-4 grid gap-x-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold">
              Active Lithuanian communities · {activeCommunityEntries.length}
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
              Parish and mission name the community&rsquo;s canonical form, not
              the strength or scale of its Lithuanian life.
            </p>
            <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
              {activeCommunityEntries.map((entry) => (
                <NetworkEntryRow key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              Hosted Lithuanian Masses · {hostedMassEntries.length}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Lithuanian worship continues inside another parish or worship
              site.
            </p>
            <div className="mt-2">
              {hostedMassEntries.map((entry) => (
                <NetworkEntryRow key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <SustainabilityProfiles />

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

      <p className="mt-10 text-sm text-muted">
        <Link href="/record" className="underline hover:text-foreground">
          The complete historical Record
        </Link>
        {" · "}
        <Link href="/under-threat" className="underline hover:text-foreground">
          What&rsquo;s Happening Now
        </Link>
      </p>
    </article>
  );
}
