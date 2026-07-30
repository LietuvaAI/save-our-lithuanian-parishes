import Link from "next/link";
import ParishMap from "@/components/ParishMap";
import NationalRecordGraphic from "@/components/NationalRecordGraphic";
import alertsData from "@/data/alerts.json";
import networkData from "@/data/sielovada-us-network.json";
import registryData from "@/data/registry-unified.json";
import { scopedParishes } from "@/lib/registry-scope";
import { toGroup } from "@/lib/end-state";

// Homepage figures use the same U.S. register scope as The History and map.
const romanCatholicParishes = scopedParishes();
const REG_ETHNIC = romanCatholicParishes.length;
const REG_CLOSED = romanCatholicParishes.filter(
  (p) => toGroup(p.endState) === "closed",
).length;
const REG_CLOSED_SINCE_1990 = romanCatholicParishes.filter(
  (p) =>
    toGroup(p.endState) === "closed" &&
    p.closed != null &&
    p.closed >= 1990,
).length;
const lossesByDiocese = new Map<string, number>();
for (const parish of romanCatholicParishes) {
  if (toGroup(parish.endState) !== "closed" || !parish.diocese) continue;
  lossesByDiocese.set(
    parish.diocese,
    (lossesByDiocese.get(parish.diocese) ?? 0) + 1,
  );
}
const TOP_LOSS_DIOCESES = [...lossesByDiocese.entries()].sort(
  ([nameA, countA], [nameB, countB]) =>
    countB - countA || nameA.localeCompare(nameB),
).slice(0, 2);
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
const CURRENT_WORSHIP_STATES = new Set(
  currentWorshipEntries.map((entry) => entry.state),
).size;

type CurrentAlert = {
  kind: string;
  parishLink: string;
  whatChanged: string;
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
    body: "The deadlines, the seven reasons that don't count, the procedural rights that have reversed closures, and 26 precedents — assembled for your parish council.",
    cta: "Start here",
    href: "/start-here",
    primary: false,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="pt-5 text-center sm:pt-6">
        <p className="mb-1.5 text-xs uppercase tracking-widest text-muted">
          Every parish, from the very beginning
        </p>
        <h1 className="mx-auto max-w-3xl font-serif text-2xl font-semibold leading-tight sm:text-3xl">
          The public record of America&rsquo;s Lithuanian parishes
        </h1>
        <p className="mx-auto mt-2.5 max-w-3xl text-sm leading-relaxed text-muted sm:text-[15px]">
          The past is a torch to the present. Explore the complete record of
          America&rsquo;s Lithuanian parishes, from their earliest foundations
          to the communities discerning their future today.
        </p>
      </section>

      <section className="mt-5 sm:mt-6">
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
        revision={String(registryData.registryRevision.version)}
        revisionDate={registryData.registryRevision.date}
      />

      <section
        className="mt-10 border-y border-rule py-5 sm:py-6"
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
          {activeCampaigns.map((campaign) => (
            <article key={campaign.id} className="py-4 first:pt-3 last:pb-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="font-serif text-lg font-semibold">
                  {campaign.entity}
                </h3>
                <span className="text-sm text-muted">{campaign.place}</span>
              </div>
              <p className="mt-1 max-w-4xl text-sm leading-relaxed text-muted">
                {campaign.alert?.whatChanged}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
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
            </article>
          ))}
        </div>

        <p className="mt-3 text-sm">
          <Link
            href="/under-threat"
            className="font-medium underline underline-offset-4 hover:text-accent"
          >
            See everything happening now &rarr;
          </Link>
        </p>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-xl font-semibold">
            Lithuanian Catholic life today
          </h2>
          <span className="text-sm text-muted">
            {currentWorshipEntries.length} places
          </span>
        </div>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          Current Lithuanian Catholic worship gathers at{" "}
          {networkData.counts.activeParishes} parishes,{" "}
          {networkData.counts.activeMissions} missions, and{" "}
          {networkData.counts.massContinues} hosted Masses across{" "}
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
