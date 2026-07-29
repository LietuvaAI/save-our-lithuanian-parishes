import type { Metadata } from "next";
import Link from "next/link";
import networkData from "@/data/sielovada-us-network.json";
import { canonicalProfileHrefForRegistrySlug } from "@/lib/parish-profile";

export const metadata: Metadata = {
  title: "Lithuanian Catholic Life Today",
  description:
    "The complete current U.S. Lithuanian Catholic pastoral network listed by Sielovada, separated into parishes, missions, hosted Masses, communities, and religious houses.",
};

type DirectoryType =
  | "parish"
  | "mission"
  | "mission_community"
  | "church"
  | "religious_house";

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
  address: string;
  directoryType: DirectoryType;
  networkClass: NetworkClass;
  ministry: string;
  clergy?: string;
  registrySlug?: string;
  officialSite?: string;
  note?: string;
};

const entries = networkData.entries as NetworkEntry[];

const DIRECTORY_LABEL: Record<DirectoryType, string> = {
  parish: "Parish",
  mission: "Mission",
  mission_community: "Mission community",
  church: "Church / host site",
  religious_house: "Religious house",
};

const CLASS_LABEL: Record<NetworkClass, string> = {
  active_parish: "Active Lithuanian parish",
  active_mission: "Active Lithuanian mission",
  mass_continues: "Lithuanian Mass continues",
  unresolved: "Unresolved",
  no_lithuanian_liturgy: "No Lithuanian Mass listed",
  directory_conflict: "Directory needs updating",
  religious_house: "Friary — not a parish",
};

const CLASS_COLOR: Record<NetworkClass, string> = {
  active_parish: "var(--es-active)",
  active_mission: "var(--es-active)",
  mass_continues: "var(--es-mass)",
  unresolved: "var(--es-transferred)",
  no_lithuanian_liturgy: "var(--es-unverified)",
  directory_conflict: "var(--es-closed)",
  religious_house: "var(--muted)",
};

const GROUPS: Array<{
  classes: NetworkClass[];
  title: string;
  description: string;
}> = [
  {
    classes: ["active_parish"],
    title: "Active Lithuanian parishes",
    description:
      "Formally Lithuanian parishes with living Lithuanian worship and community life. This is the seven-parish headline count.",
  },
  {
    classes: ["active_mission"],
    title: "Active Lithuanian missions",
    description:
      "Living Catholic communities identified by Sielovada as missions. They belong to the pastoral network but are counted separately from parishes.",
  },
  {
    classes: ["mass_continues"],
    title: "Lithuanian Mass within another structure",
    description:
      "Lithuanian worship continues in a merged parish, mission community, worship site, or territorial host church.",
  },
  {
    classes: [
      "unresolved",
      "directory_conflict",
      "no_lithuanian_liturgy",
      "religious_house",
    ],
    title: "Listed places that need qualification",
    description:
      "These entries remain part of the official pastoral directory, but they cannot be presented as active Lithuanian parishes.",
  },
];

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <div className="py-4">
      <p className="font-serif text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-snug text-muted">{label}</p>
    </div>
  );
}

function EntryRow({ entry }: { entry: NetworkEntry }) {
  const profileHref = entry.registrySlug
    ? canonicalProfileHrefForRegistrySlug(entry.registrySlug)
    : null;

  return (
    <article className="py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-semibold leading-snug">
            {entry.nameLt}
          </h3>
          <p className="mt-0.5 text-sm text-muted">
            {entry.nameEn} · {entry.city}, {entry.state}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rule px-2.5 py-1 text-xs font-medium">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: CLASS_COLOR[entry.networkClass] }}
          />
          {CLASS_LABEL[entry.networkClass]}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed">{entry.ministry}</p>
      <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs leading-relaxed text-muted sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-foreground">
            Directory type:{" "}
          </dt>
          <dd className="inline">{DIRECTORY_LABEL[entry.directoryType]}</dd>
        </div>
        {entry.clergy ? (
          <div>
            <dt className="inline font-medium text-foreground">Clergy: </dt>
            <dd className="inline">{entry.clergy}</dd>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <dt className="inline font-medium text-foreground">Address: </dt>
          <dd className="inline">{entry.address}</dd>
        </div>
      </dl>

      {entry.note ? (
        <p className="mt-2 border-l-2 border-rule pl-3 text-xs leading-relaxed text-muted">
          {entry.note}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {profileHref ? (
          <Link
            href={profileHref}
            className="underline underline-offset-2 hover:text-accent"
          >
            See profile and sources
          </Link>
        ) : null}
        {entry.officialSite ? (
          <a
            href={entry.officialSite}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-accent"
          >
            Community website
          </a>
        ) : null}
        <a
          href={networkData.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-accent"
        >
          Sielovada listing
        </a>
      </div>
    </article>
  );
}

export default function LithuanianCatholicLifeTodayPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        Current pastoral network
      </p>
      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Lithuanian Catholic life today
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">
        Sielovada lists {networkData.counts.listed} Catholic places in the
        United States connected to Lithuanian pastoral life. They are not all
        parishes. This view keeps the complete official network while
        distinguishing parishes, missions, hosted Masses, mission communities,
        and the Franciscan friary.
      </p>

      <section
        aria-label="Current pastoral network figures"
        className="mt-8 grid grid-cols-2 divide-x divide-y divide-rule border-y border-rule sm:grid-cols-4 sm:divide-y-0"
      >
        <div className="pr-3">
          <Figure
            value={networkData.counts.listed}
            label="U.S. directory listings"
          />
        </div>
        <div className="pl-3 sm:px-3">
          <Figure
            value={networkData.counts.activeParishes}
            label="active Lithuanian parishes"
          />
        </div>
        <div className="pr-3 sm:px-3">
          <Figure
            value={networkData.counts.activeMissions}
            label="active Lithuanian missions"
          />
        </div>
        <div className="pl-3">
          <Figure
            value={networkData.counts.massContinues}
            label="other places with Lithuanian Mass"
          />
        </div>
      </section>

      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">
        Sielovada is the canonical baseline for membership in the living
        Lithuanian Catholic pastoral network. The local diocese and parish
        remain authoritative for juridic parish status, governance, and formal
        closure. That distinction explains why Hartford remains listed here
        while its profile records the end of regular Masses in May 2026.
      </p>

      {GROUPS.map((group) => {
        const groupEntries = entries.filter((entry) =>
          group.classes.includes(entry.networkClass),
        );
        return (
          <section key={group.title} className="mt-12">
            <h2 className="font-serif text-2xl font-semibold">
              {group.title} · {groupEntries.length}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              {group.description}
            </p>
            <div className="mt-4 divide-y divide-rule border-y border-rule">
              {groupEntries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-12 border-t border-rule pt-5 text-sm leading-relaxed text-muted">
        Directory checked {networkData.source.checked}. All{" "}
        {networkData.counts.listed} U.S. entries are represented;{" "}
        {networkData.counts.registryMatches} link to canonical parish profiles
        and {networkData.counts.networkOnly} remain current-network-only records
        until a distinct historical identity is established or because their
        institution type does not belong in the parish register.{" "}
        <Link
          href="/about/sources-and-archives"
          className="underline underline-offset-2 hover:text-accent"
        >
          How the sources are weighted
        </Link>
        .
      </p>
    </article>
  );
}
