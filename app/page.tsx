import Image from "next/image";
import Link from "next/link";
import ParishMap from "@/components/ParishMap";
import ChurchProcession from "@/components/ChurchProcession";
import {
  DiocesePill,
  DiocesanLeaderLink,
} from "@/components/DiocesePill";
import { EndStatePill } from "@/components/EndStatePill";
import alertsData from "@/data/alerts.json";
import { getClearedPhoto } from "@/lib/photos";
import {
  currentPastoralNetwork,
  infographicCounts,
  institutionHistory,
  romanCatholicInstitutionHistory,
  romanCatholicMissionHistory,
  romanCatholicParishHistory,
} from "@/lib/infographic-projection";
import type { EndState } from "@/lib/end-state";

// The homepage index names three distinct canonical populations. They are
// linked, never added together or treated as interchangeable denominators.
const PUBLIC_INSTITUTIONS = infographicCounts.public_us_institutions;
const ROMAN_CATHOLIC_INSTITUTIONS = romanCatholicInstitutionHistory.length;
const ROMAN_CATHOLIC_PARISHES = romanCatholicParishHistory.length;
const ROMAN_CATHOLIC_MISSIONS = romanCatholicMissionHistory.length;
const CLOSED_ROMAN_CATHOLIC_INSTITUTIONS =
  romanCatholicInstitutionHistory.filter(
    (institution) => institution.status_group === "closed",
  ).length;
const PHYSICAL_WORSHIP_SITES = infographicCounts.physical_worship_sites;
const CURRENT_WORSHIP_CLASSES = new Set([
  "active_parish",
  "active_mission",
  "mass_continues",
]);
const currentWorshipEntries =
  currentPastoralNetwork.directory.entries.filter((entry) =>
    CURRENT_WORSHIP_CLASSES.has(entry.networkClass),
  );
const currentPastoralCounts = currentPastoralNetwork.counts;
const CURRENT_WORSHIP_COUNT =
  currentPastoralCounts.active_parish +
  currentPastoralCounts.active_mission +
  currentPastoralCounts.mass_continues;

if (
  institutionHistory.length !== PUBLIC_INSTITUTIONS ||
  ROMAN_CATHOLIC_INSTITUTIONS !==
    ROMAN_CATHOLIC_PARISHES + ROMAN_CATHOLIC_MISSIONS ||
  currentWorshipEntries.length !== CURRENT_WORSHIP_COUNT
) {
  throw new Error("Homepage populations do not match canonical projections");
}

type CurrentAlert = {
  id: string;
  kind: string;
  entity: string;
  place: string;
  diocese: string;
  parishLink?: string;
  relatedProfileLink?: string;
  relatedProfileLabel?: string;
  status?: EndState;
  caveat?: string;
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
const activeCampaigns = (alertsData.campaigns as CurrentCampaign[])
  .map((campaign) => ({
    ...campaign,
    alert: currentAlerts.find(
      (alert) =>
        alert.kind === "active" && alert.parishLink === campaign.parishLink,
    ),
  }))
  .filter((campaign) => campaign.alert)
  .slice(0, 4);
const statusByLink = new Map(
  institutionHistory.map((institution) => [
    institution.public_profile,
    institution.status_group as EndState,
  ]),
);

function statusForLink(link: string): EndState {
  return statusByLink.get(link) ?? "unverified";
}

function lineDrawingForLink(link: string) {
  const slug = link.replace(/^\/(?:parishes|registry)\//, "");
  return getClearedPhoto(`${slug}-line-drawing`);
}

const CAMPAIGN_ART: Record<
  string,
  {
    src: string;
    alt: string;
    attribution: string;
    sourceUrl?: string;
  }
> = {
  "/parishes/dievo-apvaizdos-southfield-mi": {
    src: "/images/parishes/southfield-divine-providence-current-line-drawing.png",
    alt: "Line drawing of Divine Providence Lithuanian Catholic Church in Southfield.",
    attribution: "Current photograph supplied by Vilija Jurgutis",
  },
  "/parishes/svc-trejybes-hartford-ct": {
    src: "/images/parishes/hartford-holy-trinity-line-drawing.png",
    alt: "Line drawing of Holy Trinity Lithuanian church in Hartford.",
    attribution: "After Litnet / Wikimedia Commons · CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Hartford_Holy_Trinity_Roman_Catholic_Church,_2000.jpg",
  },
  "/parishes/sv-juozapo-waterbury-ct": {
    src: "/images/parishes/waterbury-st-joseph-line-drawing.png",
    alt: "Line drawing of St. Joseph Lithuanian church in Waterbury.",
    attribution: "After Farragutful / Wikimedia Commons · CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:St._Joseph%27s_Church_-_Waterbury,_Connecticut_01.jpg",
  },
  "/parishes/kristaus-atsimainymo-maspeth-ny": {
    src: "/images/parishes/maspeth-transfiguration-line-drawing.png",
    alt: "Line drawing of Transfiguration Lithuanian church in Maspeth.",
    attribution: "After Renata3 / Wikimedia Commons · CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Transfiguration_Roman_Catholic_Church_20201114_154344.jpg",
  },
};

const SECONDARY_DOORS = [
  {
    title: "The History",
    body: "See the rise and contraction of the parish network over time.",
    href: "/history",
  },
  {
    title: "All Parish Profiles",
    body: `Search all ${PUBLIC_INSTITUTIONS} published U.S. institution profiles.`,
    href: "/parishes",
  },
  {
    title: "Church Buildings Through Time",
    body: `Follow ${PHYSICAL_WORSHIP_SITES} physical worship sites separately.`,
    href: "/church-buildings-through-time",
  },
  {
    title: "Lithuanian Catholic Life Today",
    body: `Find the ${CURRENT_WORSHIP_COUNT} current places of Lithuanian worship.`,
    href: "/lithuanian-catholic-life-today",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="pt-2 sm:pt-3">
        <ChurchProcession />
      </section>

      <section className="mx-auto max-w-4xl py-6 text-center sm:py-8">
        <h1 className="font-serif text-[1.75rem] font-semibold leading-tight sm:text-[2.625rem]">
          The Living Record of America&rsquo;s Lithuanian Parishes
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
          From their immigrant-era foundations to the communities carrying
          Lithuanian religious life forward today, this project documents how
          America&rsquo;s Lithuanian parishes, missions, and congregations
          began, changed, and where they stand now.
        </p>
        <p className="mx-auto mt-4 max-w-4xl text-sm leading-relaxed">
          One public record, three populations: {" "}
          <Link
            href="/parishes"
            className="font-semibold underline decoration-rule underline-offset-4 hover:text-accent"
          >
            {PUBLIC_INSTITUTIONS} institutions
          </Link>
          {" · "}
          <Link
            href="/where-every-parish-ended-up"
            className="font-semibold underline decoration-rule underline-offset-4 hover:text-accent"
          >
            {ROMAN_CATHOLIC_INSTITUTIONS} Roman Catholic ({ROMAN_CATHOLIC_PARISHES} parishes +{" "}
            {ROMAN_CATHOLIC_MISSIONS} missions)
          </Link>
          {" · "}
          <Link
            href="/church-buildings-through-time"
            className="font-semibold underline decoration-rule underline-offset-4 hover:text-accent"
          >
            {PHYSICAL_WORSHIP_SITES} worship sites
          </Link>
          .
        </p>
      </section>

      <section aria-label="Explore the national parish map">
        <ParishMap />
      </section>

      <section className="mt-8 rounded-lg bg-band px-6 py-7 sm:mt-10 sm:px-8 lg:grid lg:grid-cols-[minmax(18rem,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Start with the outcomes
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold sm:text-3xl">
            Parish &amp; Mission Outcomes
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Follow all {ROMAN_CATHOLIC_INSTITUTIONS} Roman Catholic
            institutions — {ROMAN_CATHOLIC_PARISHES} parishes and {" "}
            {ROMAN_CATHOLIC_MISSIONS} missions — from founding to where each
            one ended up. {CLOSED_ROMAN_CATHOLIC_INSTITUTIONS} have closed.
          </p>
          <Link
            href="/where-every-parish-ended-up"
            className="mt-4 inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Explore parish and mission outcomes →
          </Link>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-rule pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {SECONDARY_DOORS.map((door) => (
              <Link
                key={door.href}
                href={door.href}
                className="group text-sm leading-relaxed"
              >
                <strong className="font-semibold underline decoration-rule underline-offset-4 group-hover:text-accent">
                  {door.title}
                </strong>
                <span className="text-muted"> — {door.body}</span>
              </Link>
            ))}
        </div>
      </section>

      <section
        id="happening-now"
        className="mt-10 scroll-mt-24 border-y border-rule py-5 sm:py-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted">
              Happening now
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">
              Active campaigns
            </h2>
          </div>
          <span className="text-sm text-muted">
            {activeCampaigns.length} communities organizing
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          These communities are acting while their futures are still being
          decided. Read the current situation, understand the parish record,
          and respond to the campaign itself.
        </p>

        <div className="mt-4 divide-y divide-rule border-y border-rule">
          {activeCampaigns.map((campaign) => {
            const art = CAMPAIGN_ART[campaign.parishLink];
            if (!art) {
              throw new Error(`Missing campaign art for ${campaign.parishLink}`);
            }

            return (
              <article
                key={campaign.id}
                className="grid gap-4 py-5 first:pt-4 last:pb-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center md:grid-cols-[13rem_minmax(0,1fr)] md:gap-6"
              >
                <Link
                  href={campaign.parishLink}
                  aria-label={`See the parish profile for ${campaign.entity}`}
                  className="group mx-auto block w-full max-w-[15rem] sm:mx-0"
                >
                  <span className="relative block aspect-[4/3] w-full">
                    <Image
                      src={art.src}
                      alt={art.alt}
                      fill
                      sizes="(max-width: 639px) 240px, 208px"
                      className="object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                  </span>
                </Link>
                <div className="text-center sm:text-left">
                  <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 sm:justify-between">
                    <h3 className="font-serif text-lg font-semibold">
                      {campaign.entity}
                    </h3>
                    <span className="text-sm text-muted">{campaign.place}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <EndStatePill
                      value={statusForLink(campaign.parishLink)}
                    />
                    {campaign.alert && (
                      <DiocesePill name={campaign.alert.diocese} />
                    )}
                  </div>
                  {campaign.alert && (
                    <p className="mt-1">
                      <DiocesanLeaderLink
                        diocese={campaign.alert.diocese}
                      />
                    </p>
                  )}
                  <p className="mt-1 max-w-4xl text-sm leading-relaxed text-muted">
                    {campaign.alert?.whatChanged}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:justify-start">
                    <Link
                      href={campaign.parishLink}
                      className="font-medium underline decoration-rule underline-offset-4 hover:text-accent"
                    >
                      See parish profile
                    </Link>
                    <a
                      href={campaign.hearthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline decoration-rule underline-offset-4 hover:text-accent"
                    >
                      Read what&rsquo;s happening now
                    </a>
                    <a
                      href={campaign.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-md border border-accent px-3 py-1.5 font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
                    >
                      {campaign.actionLabel} &rarr;
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="watch-list" className="mt-12 scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted">
              Current signals
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">
              On the watch list
            </h2>
          </div>
          <span className="text-sm text-muted">
            {watchAlerts.length + buildingAlerts.length} records to monitor
          </span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {[
            {
              title: "Developments to monitor",
              alerts: watchAlerts,
              description:
                "Diocesan or parish developments without a documented public campaign.",
            },
            {
              title: "Buildings at risk",
              alerts: buildingAlerts,
              description:
                "Former parish buildings whose sale, demolition, or physical future remains at stake.",
            },
          ].map((group) => (
            <section key={group.title}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-xl font-semibold">
                  {group.title}
                </h3>
                <span className="text-sm text-muted">
                  {group.alerts.length}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {group.description}
              </p>
              <div className="mt-3 divide-y divide-rule border-y border-rule">
                {group.alerts.map((alert) => {
                  const art = alert.parishLink
                    ? lineDrawingForLink(alert.parishLink)
                    : null;
                  return (
                    <article
                      key={alert.id}
                      className={`py-3 ${art ? "grid grid-cols-[4.75rem_minmax(0,1fr)] gap-3" : ""}`}
                    >
                      {art && alert.parishLink && (
                        <Link
                          href={alert.parishLink}
                          aria-label={`Open ${alert.entity} parish profile`}
                          className="relative block aspect-square self-start overflow-hidden border border-rule bg-white p-1.5 hover:border-accent"
                          title={art.attribution}
                        >
                          <Image
                            src={art.src}
                            alt=""
                            fill
                            sizes="76px"
                            className="object-contain mix-blend-multiply"
                          />
                        </Link>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          {alert.parishLink ? (
                            <Link
                              href={alert.parishLink}
                              className="font-serif font-semibold underline decoration-rule underline-offset-2 hover:text-accent"
                            >
                              {alert.entity}
                            </Link>
                          ) : (
                            <h4 className="font-serif font-semibold">
                              {alert.entity}
                            </h4>
                          )}
                          <span className="text-sm text-muted">
                            {alert.place}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <EndStatePill
                            value={
                              alert.status ??
                              (alert.parishLink
                                ? statusForLink(alert.parishLink)
                                : "unverified")
                            }
                          />
                          <DiocesePill name={alert.diocese} />
                        </div>
                        <p className="mt-1">
                          <DiocesanLeaderLink diocese={alert.diocese} />
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {alert.whatChanged}
                        </p>
                        {alert.caveat && (
                          <p className="mt-2 text-sm leading-relaxed text-foreground">
                            {alert.caveat}
                          </p>
                        )}
                        <p className="mt-2 text-xs leading-relaxed text-muted">
                          {(alert.parishLink || alert.relatedProfileLink) && (
                            <>
                              <Link
                                href={
                                  alert.parishLink ?? alert.relatedProfileLink!
                                }
                                className="font-medium underline hover:text-foreground"
                              >
                                {alert.parishLink
                                  ? "Parish profile"
                                  : alert.relatedProfileLabel ??
                                    "Related parish record"}
                              </Link>
                              {" · "}
                            </>
                          )}
                          {"Sources: "}
                          {alert.sources.map((source, index) => (
                            <span key={source.url}>
                              {index > 0 && " · "}
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-foreground"
                              >
                                {source.publisher}
                              </a>
                            </span>
                          ))}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-5 text-sm text-muted">
          Current snapshot: {alertsData.snapshot}.{" "}
          <Link
            href="/report"
            className="font-medium underline underline-offset-4 hover:text-accent"
          >
            Report a current change &rarr;
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-2xl py-14">
        <h2 className="font-serif text-2xl font-semibold">
          The communities built them
        </h2>
        <p className="mt-4 leading-relaxed">
          Lithuanian immigrants raised these churches with their own hands
          and their own wages — and around each one grew a world: a school, a
          choir, a cemetery, and a language kept alive an ocean from home.
          This project keeps each community&rsquo;s history, present condition,
          and evidence connected so that parishes can learn from one another.
        </p>
        <p className="mt-6">
          <Link href="/about" className="underline hover:text-accent">
            About the project →
          </Link>
        </p>
      </section>

      <section className="rounded-lg border border-rule p-6 text-center sm:p-8">
        <h2 className="font-serif text-2xl font-semibold">
          Follow the record as it grows
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Dispatches from the record — closure alerts, parish case files, and
          what communities are doing about it — arrive by email.
        </p>
        <p className="mt-4">
          <a
            href="https://blog.saveourlithuanianparishes.org/subscribe"
            className="inline-block rounded-md border border-accent px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
          >
            Subscribe to our blog: Židinys (The Hearth)
          </a>
        </p>
      </section>
    </div>
  );
}
