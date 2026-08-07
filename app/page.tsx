import Image from "next/image";
import Link from "next/link";
import ChurchProcession from "@/components/ChurchProcession";
import { DiocesePill } from "@/components/DiocesePill";
import { EndStatePill } from "@/components/EndStatePill";
import ParishMap from "@/components/ParishMap";
import alertsData from "@/data/canonical-current-events-projection.json";
import {
  currentPastoralNetwork,
  infographicCounts,
  institutionHistory,
  romanCatholicInstitutionHistory,
  romanCatholicMissionHistory,
  romanCatholicParishHistory,
} from "@/lib/infographic-projection";
import type { EndState } from "@/lib/end-state";
import { getClearedPhoto } from "@/lib/photos";

const PUBLIC_INSTITUTIONS = infographicCounts.public_us_institutions;
const ROMAN_CATHOLIC_INSTITUTIONS = romanCatholicInstitutionHistory.length;
const ROMAN_CATHOLIC_PARISHES = romanCatholicParishHistory.length;
const ROMAN_CATHOLIC_MISSIONS = romanCatholicMissionHistory.length;
const PHYSICAL_WORSHIP_SITES = infographicCounts.physical_worship_sites;
const CURRENT_WORSHIP_COUNT =
  currentPastoralNetwork.counts.active_parish +
  currentPastoralNetwork.counts.active_mission +
  currentPastoralNetwork.counts.mass_continues;
const ACTIVE_NETWORK_COUNT =
  currentPastoralNetwork.counts.active_parish +
  currentPastoralNetwork.counts.active_mission;

type CurrentAlert = {
  id: string;
  kind: "active" | "watch" | "building";
  entity: string;
  place: string;
  diocese: string;
  parishLink?: string;
  relatedProfileLink?: string;
  relatedProfileLabel?: string;
  status?: EndState;
  statusLabel?: string;
  context?: string;
  whatChanged: string;
  sources: { title: string; publisher: string; url: string }[];
};

type CurrentCampaign = {
  id: string;
  entity: string;
  place: string;
  parishLink: string;
  hearthUrl: string;
  actionUrl: string;
  actionLabel: string;
};

const currentAlerts = alertsData.alerts as CurrentAlert[];
const watchAlerts = currentAlerts.filter((alert) => alert.kind === "watch");
const buildingAlerts = currentAlerts.filter(
  (alert) => alert.kind === "building",
);
const monitoredAlerts = [...watchAlerts, ...buildingAlerts];
const activeCampaigns = (alertsData.campaigns as CurrentCampaign[])
  .map((campaign) => ({
    ...campaign,
    alert: currentAlerts.find(
      (alert) =>
        alert.kind === "active" && alert.parishLink === campaign.parishLink,
    ),
  }))
  .filter(
    (
      campaign,
    ): campaign is CurrentCampaign & { alert: CurrentAlert } =>
      Boolean(campaign.alert),
  );

const statusByLink = new Map(
  institutionHistory.map((institution) => [
    institution.public_profile,
    institution.status_group as EndState,
  ]),
);

function statusForLink(link: string): EndState {
  return statusByLink.get(link) ?? "unverified";
}

function profileSlug(link: string) {
  return link.split("/").filter(Boolean).at(-1) ?? "";
}

function lineDrawingForLink(link: string) {
  return getClearedPhoto(`${profileSlug(link)}-line-drawing`);
}

function firstSentence(text: string) {
  const match = text.match(/^.*?[.!?](?:\s|$)/);
  return match?.[0].trim() ?? text;
}

const campaignLinks = new Set(
  activeCampaigns.map((campaign) => campaign.parishLink),
);
const activeNetwork = currentPastoralNetwork.directory.entries
  .filter(
    (entry) =>
      entry.networkClass === "active_parish" ||
      entry.networkClass === "active_mission",
  )
  .map((entry) => {
    const institution = institutionHistory.find(
      (candidate) => candidate.registry_slug === entry.registrySlug,
    );
    if (!institution) {
      throw new Error(
        `${entry.id}: active pastoral-network entry has no canonical institution`,
      );
    }
    const art = lineDrawingForLink(institution.public_profile);
    if (!art) {
      throw new Error(
        `${institution.registry_slug}: active pastoral-network entry has no cleared line drawing`,
      );
    }
    return {
      id: entry.id,
      nameEn: entry.nameEn,
      nameLt: entry.nameLt,
      city: institution.city,
      state: institution.state,
      founded: institution.founded,
      profileHref: institution.public_profile,
      description: firstSentence(entry.ministry),
      mission: entry.networkClass === "active_mission",
      campaign: campaignLinks.has(institution.public_profile),
      art,
    };
  })
  .sort(
    (a, b) =>
      (a.founded.year ?? Number.POSITIVE_INFINITY) -
        (b.founded.year ?? Number.POSITIVE_INFINITY) ||
      a.nameEn.localeCompare(b.nameEn),
  );

if (
  institutionHistory.length !== PUBLIC_INSTITUTIONS ||
  ROMAN_CATHOLIC_INSTITUTIONS !==
    ROMAN_CATHOLIC_PARISHES + ROMAN_CATHOLIC_MISSIONS ||
  CURRENT_WORSHIP_COUNT !==
    currentPastoralNetwork.directory.entries.filter((entry) =>
      ["active_parish", "active_mission", "mass_continues"].includes(
        entry.networkClass,
      ),
    ).length ||
  activeNetwork.length !== ACTIVE_NETWORK_COUNT ||
  activeCampaigns.length !== alertsData.counts.campaigns ||
  monitoredAlerts.length !==
    currentAlerts.filter(
      (alert) => alert.kind === "watch" || alert.kind === "building",
    ).length
) {
  throw new Error("Homepage populations do not match Brain projections");
}

const STAT_CARDS = [
  {
    value: PUBLIC_INSTITUTIONS,
    label: "communities",
    detail: "All public profiles",
    href: "/parishes",
  },
  {
    value: ROMAN_CATHOLIC_INSTITUTIONS,
    label: "RC parishes & missions",
    detail: `${ROMAN_CATHOLIC_PARISHES} parishes + ${ROMAN_CATHOLIC_MISSIONS} missions`,
    href: "/where-every-parish-ended-up",
  },
  {
    value: PHYSICAL_WORSHIP_SITES,
    label: "church buildings",
    detail: "Physical worship sites",
    href: "/church-buildings-through-time",
  },
  {
    value: CURRENT_WORSHIP_COUNT,
    label: "places of Catholic worship",
    detail: "Lithuanian worship today",
    href: "/lithuanian-catholic-life-today",
  },
  {
    value: activeCampaigns.length,
    label: "communities organizing now",
    detail: "Current campaigns",
    href: "/#active-campaigns",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="pt-2 sm:pt-3">
        <ChurchProcession />
      </section>

      <section className="mx-auto max-w-4xl py-5 text-center sm:py-7">
        <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          The Record of America&rsquo;s Lithuanian Parishes
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-[15px] leading-relaxed text-muted sm:text-base">
          From their immigrant-era foundations to the present day, this project
          documents how America&rsquo;s Lithuanian parishes, missions, and
          congregations were established, how they changed, and what became of
          their communities and churches.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/about"
            className="font-semibold underline decoration-rule underline-offset-4 hover:text-accent"
          >
            About the project →
          </Link>
        </p>
      </section>

      <section aria-label="Explore the national parish map">
        <ParishMap />
      </section>

      <nav
        aria-label="The record at a glance"
        className="mt-5 grid divide-y divide-rule border-y border-rule sm:grid-cols-5 sm:divide-x sm:divide-y-0"
      >
        {STAT_CARDS.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="group px-3 py-4 text-center hover:bg-band/60"
          >
            <span className="block font-serif text-2xl font-semibold text-foreground group-hover:text-accent">
              {stat.value}
            </span>
            <span className="mt-0.5 block text-[12px] font-semibold leading-tight">
              {stat.label}
            </span>
            <span className="mt-1 block text-[10px] leading-tight text-muted">
              {stat.detail}
            </span>
          </Link>
        ))}
      </nav>

      <section className="mt-12" aria-labelledby="living-network-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Lithuanian Catholic life today
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-3">
          <div>
            <h2
              id="living-network-heading"
              className="font-serif text-3xl font-semibold"
            >
              The living network
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
              Six active parishes and two active missions remain Lithuanian-led.
              Six additional host communities celebrate Lithuanian Mass.
            </p>
          </div>
          <Link
            href="/lithuanian-catholic-life-today"
            className="text-sm font-semibold underline decoration-rule underline-offset-4 hover:text-accent"
          >
            See all {CURRENT_WORSHIP_COUNT} places →
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-serif text-2xl font-semibold">
            Still standing <span className="text-muted">· {activeNetwork.length}</span>
          </h3>
          <span className="text-sm text-muted">
            {currentPastoralNetwork.counts.active_parish} parishes + {" "}
            {currentPastoralNetwork.counts.active_mission} missions
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {activeNetwork.map((entry) => (
            <Link
              key={entry.id}
              href={entry.profileHref}
              className="group grid min-h-[116px] grid-cols-[104px_minmax(0,1fr)] gap-4 rounded-lg border border-rule bg-background p-3 hover:border-foreground"
            >
              <span
                className="relative block h-[92px] w-[104px] overflow-hidden bg-white"
                title={entry.art.attribution}
              >
                <Image
                  src={entry.art.src}
                  alt={entry.art.alt}
                  fill
                  sizes="104px"
                  className="object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-[1.03]"
                />
              </span>
              <span className="min-w-0 self-center">
                <span className="block font-serif text-[15.5px] font-semibold leading-tight group-hover:text-accent">
                  {entry.nameEn}
                </span>
                <span className="mt-0.5 block text-[12px] leading-tight text-muted">
                  {entry.nameLt}
                </span>
                <span className="mt-1.5 block text-[12px] leading-tight text-muted">
                  {entry.city}, {entry.state}
                  {entry.founded.year ? ` · est. ${entry.founded.year}` : ""}
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-rule px-2 py-0.5 text-[10px] font-semibold">
                    <span
                      className={`size-2 rounded-full border border-[var(--es-active)] ${
                        entry.mission ? "bg-background" : "bg-[var(--es-active)]"
                      }`}
                      aria-hidden
                    />
                    {entry.mission ? "Mission" : "Parish"}
                  </span>
                  {entry.campaign && (
                    <span className="rounded-full bg-[var(--mark-community)] px-2 py-0.5 text-[10px] font-semibold text-foreground">
                      Active campaign
                    </span>
                  )}
                </span>
                <span className="mt-1.5 block text-[13px] leading-snug text-muted">
                  {entry.description}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section
            id="active-campaigns"
            className="scroll-mt-24 overflow-hidden rounded-lg border border-rule"
          >
            <header className="flex items-baseline justify-between gap-3 bg-accent px-5 py-3 text-white">
              <h3 className="font-serif text-xl font-semibold">
                Active campaigns
              </h3>
              <span className="text-sm">
                {activeCampaigns.length} organizing
              </span>
            </header>
            <p className="bg-[#faf7f0] px-5 py-3 text-[13px] leading-relaxed text-muted">
              Communities organizing while parish, ministry, or building
              decisions remain active.
            </p>
            <div className="divide-y divide-rule">
              {activeCampaigns.map((campaign) => {
                const art = lineDrawingForLink(campaign.parishLink);
                if (!art) {
                  throw new Error(
                    `Missing cleared campaign art for ${campaign.parishLink}`,
                  );
                }
                return (
                  <article
                    key={campaign.id}
                    className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 p-4"
                  >
                    <Link
                      href={campaign.parishLink}
                      className="relative block h-[82px] w-[88px] bg-white"
                      title={art.attribution}
                      aria-label={`Open ${campaign.entity} profile`}
                    >
                      <Image
                        src={art.src}
                        alt=""
                        fill
                        sizes="88px"
                        className="object-contain mix-blend-multiply"
                      />
                    </Link>
                    <div className="min-w-0">
                      <h4 className="font-serif text-[15.5px] font-semibold leading-tight">
                        <Link
                          href={campaign.parishLink}
                          className="hover:text-accent"
                        >
                          {campaign.entity}
                        </Link>
                      </h4>
                      <p className="mt-1 text-[12px] leading-tight text-muted">
                        {campaign.place} · {campaign.alert.diocese}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <EndStatePill
                          value={statusForLink(campaign.parishLink)}
                        />
                        <DiocesePill name={campaign.alert.diocese} />
                      </div>
                      <p className="mt-2 text-[13px] leading-relaxed text-muted">
                        {campaign.alert.whatChanged}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold">
                        <Link
                          href={campaign.parishLink}
                          className="underline decoration-rule underline-offset-4 hover:text-accent"
                        >
                          Profile
                        </Link>
                        <a
                          href={campaign.hearthUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-rule underline-offset-4 hover:text-accent"
                        >
                          What&rsquo;s happening
                        </a>
                        <a
                          href={campaign.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent underline decoration-rule underline-offset-4"
                        >
                          {campaign.actionLabel} →
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-rule">
            <header className="flex items-baseline justify-between gap-3 bg-[#292524] px-5 py-3 text-white">
              <h3 className="font-serif text-xl font-semibold">
                On the watch list
              </h3>
              <span className="text-sm">
                {monitoredAlerts.length} monitored
              </span>
            </header>
            <p className="bg-[#faf7f0] px-5 py-3 text-[13px] leading-relaxed text-muted">
              Current developments without a documented public campaign,
              including former church buildings at risk.
            </p>
            <div className="divide-y divide-rule">
              {monitoredAlerts.map((alert) => (
                <article key={alert.id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    {alert.parishLink ? (
                      <Link
                        href={alert.parishLink}
                        className="font-serif text-[15.5px] font-semibold hover:text-accent"
                      >
                        {alert.entity}
                      </Link>
                    ) : (
                      <h4 className="font-serif text-[15.5px] font-semibold">
                        {alert.entity}
                      </h4>
                    )}
                    <span className="text-[12px] text-muted">
                      {alert.place}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    {alert.whatChanged}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-rule px-2 py-0.5 text-[10px] font-semibold">
                      {alert.kind === "building"
                        ? "Building at risk"
                        : "Development to monitor"}
                    </span>
                    <DiocesePill name={alert.diocese} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="mx-auto my-14 max-w-3xl rounded-lg border border-rule bg-band/50 p-6 text-center sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Židinys · The Hearth
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold">
          Follow new findings and developments
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Closure alerts, parish histories, and news from communities working
          to protect their churches arrive by email.
        </p>
        <p className="mt-4">
          <a
            href="https://blog.saveourlithuanianparishes.org/subscribe"
            className="inline-block rounded-md border border-accent px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
          >
            Subscribe to Židinys (The Hearth)
          </a>
        </p>
      </section>
    </div>
  );
}
