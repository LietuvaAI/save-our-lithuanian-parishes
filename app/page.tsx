import Image from "next/image";
import Link from "next/link";
import ParishMap from "@/components/ParishMap";
import NationalRecordGraphic from "@/components/NationalRecordGraphic";
import ChurchProcession from "@/components/ChurchProcession";
import {
  DiocesePill,
  DiocesanLeaderLink,
} from "@/components/DiocesePill";
import { EndStatePill } from "@/components/EndStatePill";
import alertsData from "@/data/alerts.json";
import networkData from "@/data/sielovada-us-network.json";
import siteFigures from "@/data/site-figures.json";
import { getClearedPhoto } from "@/lib/photos";
import { romanCatholicParishHistory } from "@/lib/infographic-projection";
import type { EndState } from "@/lib/end-state";

// Homepage figures come from the build-validated public figure contract.
const REG_ETHNIC = siteFigures.history.parishes;
const REG_CLOSED = siteFigures.history.closed;
const REG_CLOSED_SINCE_1990 = siteFigures.history.closedSince1990;
const TOP_LOSS_DIOCESES = siteFigures.history.topClosureDioceses.map(
  ({ diocese, closed }) => [diocese, closed] as const,
);
const TOP_TWO_LOSS_COUNT = TOP_LOSS_DIOCESES.reduce(
  (total, [, count]) => total + count,
  0,
);
const CURRENT_WORSHIP_CLASSES = new Set([
  "active_parish",
  "active_mission",
  "mass_continues",
]);
const currentWorshipEntries = networkData.entries.filter((entry) =>
  CURRENT_WORSHIP_CLASSES.has(entry.networkClass),
);
const CURRENT_WORSHIP_STATES = siteFigures.currentCatholicLife.states;

if (
  romanCatholicParishHistory.length !== siteFigures.history.parishes ||
  currentWorshipEntries.length !== siteFigures.currentCatholicLife.worshipPlaces
) {
  throw new Error("Homepage populations do not match data/site-figures.json");
}

type CurrentAlert = {
  id: string;
  kind: string;
  entity: string;
  place: string;
  diocese: string;
  parishLink: string;
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
  romanCatholicParishHistory.map((parish) => [
    parish.public_profile,
    parish.status_group as EndState,
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
    src: "/images/parishes/southfield-divine-providence-line-drawing.png",
    alt: "Line drawing of Divine Providence Lithuanian Catholic Church in Southfield.",
    attribution: "Divine Providence Parish archive",
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

const ACTIONS = [
  {
    title: "Something happening at your parish?",
    body: "A restructuring letter, a listening session, a building listed for sale, a merger notice — document it while it is happening, not after. Reports are reviewed before anything is published.",
    cta: "Report it",
    href: "/report",
    primary: true,
  },
  {
    title: "Find your parish's story",
    body: "See how it began, how the community changed, where the parish and church stand today, and the sources behind the record.",
    cta: "Find your parish",
    href: "/record",
    primary: false,
  },
  {
    title: "Arm your community with the facts",
    body: `The deadlines, the seven reasons that don't count, the procedural rights that have reversed closures, and ${siteFigures.reversals.documented} precedents — assembled for your parish council.`,
    cta: "Start here",
    href: "/start-here",
    primary: false,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="pt-3 text-center sm:pt-4">
        <h1 className="mx-auto max-w-3xl font-serif text-2xl font-semibold leading-tight sm:text-3xl">
          The public record of America&rsquo;s Lithuanian parishes
        </h1>
        <p className="mx-auto mt-1.5 max-w-4xl text-sm leading-relaxed text-muted sm:text-[15px]">
          This project traces the complete history of America&rsquo;s
          Lithuanian parishes&mdash;from their earliest foundations to the
          communities discerning their future today.
        </p>
        <ChurchProcession />
      </section>

      <section className="mt-4 sm:mt-5">
        <ParishMap />
      </section>


      <NationalRecordGraphic
        total={REG_ETHNIC}
        closed={REG_CLOSED}
        closedSince1990={REG_CLOSED_SINCE_1990}
        concentratedLosses={TOP_TWO_LOSS_COUNT}
        firstDiocese={TOP_LOSS_DIOCESES[0]?.[0] ?? ""}
        firstDioceseLosses={TOP_LOSS_DIOCESES[0]?.[1] ?? 0}
        secondDiocese={TOP_LOSS_DIOCESES[1]?.[0] ?? ""}
        secondDioceseLosses={TOP_LOSS_DIOCESES[1]?.[1] ?? 0}
      />

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
                      className="inline-flex rounded-md px-3 py-1.5 font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: "var(--mark-closed)" }}
                    >
                      {campaign.actionLabel} &rarr;
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
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
                  const art = lineDrawingForLink(alert.parishLink);
                  return (
                    <article
                      key={alert.id}
                      className={`py-3 ${art ? "grid grid-cols-[4.75rem_minmax(0,1fr)] gap-3" : ""}`}
                    >
                      {art && (
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
                          <Link
                            href={alert.parishLink}
                            className="font-serif font-semibold underline decoration-rule underline-offset-2 hover:text-accent"
                          >
                            {alert.entity}
                          </Link>
                          <span className="text-sm text-muted">
                            {alert.place}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <EndStatePill
                            value={statusForLink(alert.parishLink)}
                          />
                          <DiocesePill name={alert.diocese} />
                        </div>
                        <p className="mt-1">
                          <DiocesanLeaderLink diocese={alert.diocese} />
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {alert.whatChanged}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-muted">
                          <Link
                            href={alert.parishLink}
                            className="font-medium underline hover:text-foreground"
                          >
                            Parish profile
                          </Link>
                          {" · Sources: "}
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

      <section className="mt-8">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-xl font-semibold">
            Lithuanian Catholic life today
          </h2>
          <span className="text-sm text-muted">
            {siteFigures.currentCatholicLife.worshipPlaces} places
          </span>
        </div>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          Current Lithuanian Catholic worship gathers at{" "}
          {siteFigures.currentCatholicLife.activeParishes} parishes,{" "}
          {siteFigures.currentCatholicLife.activeMissions} missions, and{" "}
          {siteFigures.currentCatholicLife.hostedMasses} hosted Masses across{" "}
          {CURRENT_WORSHIP_STATES} states.
        </p>
        <p className="mt-2 text-sm">
          <Link
            href="/lithuanian-catholic-life-today"
            className="underline hover:text-accent font-medium"
          >
            Explore the living network &rarr;
          </Link>
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold text-center">
          What you can do
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {ACTIONS.map((a) => (
            <div
              key={a.title}
              className="rounded-lg border border-rule p-5 flex flex-col"
            >
              <h3 className="font-serif text-lg font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed flex-1">
                {a.body}
              </p>
              <p className="mt-4">
                <Link
                  href={a.href}
                  className={
                    a.primary
                      ? "inline-block rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                      : "inline-block rounded-md border border-rule px-4 py-2 text-sm font-medium hover:border-foreground transition-colors"
                  }
                  style={a.primary ? { background: "var(--mark-closed)" } : undefined}
                >
                  {a.cta}
                </Link>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-lg border border-rule p-6 sm:p-8 text-center">
        <h2 className="font-serif text-2xl font-semibold">
          Follow the record as it grows
        </h2>
        <p className="mt-2 max-w-xl mx-auto text-sm text-muted leading-relaxed">
          Dispatches from the record — closure alerts, parish case files, and
          what communities are doing about it — arrive by email.
        </p>
        <p className="mt-4">
          <a
            href="https://blog.saveourlithuanianparishes.org/subscribe"
            className="inline-block rounded-md px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "var(--mark-closed)" }}
          >
            Subscribe to our blog: Židinys (The Hearth)
          </a>
        </p>
      </section>

      <section className="py-14 max-w-2xl mx-auto">
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
    </div>
  );
}
