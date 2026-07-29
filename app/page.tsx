import Link from "next/link";
import ParishMap from "@/components/ParishMap";
import { figures } from "@/lib/parishes";
import alertsData from "@/data/alerts.json";
import { scopedParishes, usRegistryParishes } from "@/lib/registry-scope";
import { toGroup } from "@/lib/end-state";

// Homepage figures use the same U.S. register scope as The History and map.
const romanCatholicParishes = scopedParishes();
const REG_ETHNIC = romanCatholicParishes.length;
const REG_CLOSED = romanCatholicParishes.filter(
  (p) => toGroup(p.endState) === "closed",
).length;
const REG_NATCATH = usRegistryParishes().filter(
  (p) =>
    p.record_type === "parish" &&
    (p.congregation_class === "national_catholic_pncc" ||
      p.congregation_class === "independent_catholic"),
).length;
const WATCH_COUNT = (alertsData as { sustainabilityWatch: unknown[] }).sustainabilityWatch.length;

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

const STATS = [
  {
    value: String(REG_ETHNIC),
    label: "Roman Catholic Lithuanian parishes in the full U.S. record.",
    tone: "ink",
  },
  {
    value: String(REG_CLOSED),
    label:
      "Closed in the full U.S. Roman Catholic parish record — all years and all documented endings.",
    tone: "red",
  },
  {
    value: String(figures.endingMode.diocese_closed),
    label:
      "Closed by diocesan decision in the original Draugas case-filed core: 83 source rows, 82 canonical parish identities, 2008–2026.",
    tone: "red",
  },
  {
    value: String(REG_NATCATH),
    label:
      "Lithuanian National and independent Catholic parishes, documented separately as historical witness.",
    tone: "ink",
  },
];

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
        <p className="mx-auto mt-2.5 max-w-4xl text-sm leading-relaxed text-muted sm:text-[15px]">
          The past is a torch to the present. America&rsquo;s Lithuanian
          parishes have long been the <em>židiniai</em>{" "}of our
          communities&mdash;the hearths where faith was lived, language was
          spoken, memory was preserved, and identity was formed. Together, they
          form an unbroken current connecting the Lithuanian past to the present
          and lighting the road ahead. This project traces the complete history
          of America&rsquo;s Lithuanian parishes&mdash;from their earliest
          foundations to the communities discerning their future today. Seen
          together, the experience of America&rsquo;s Lithuanian parishes helps
          illuminate the path ahead, because no individual parish should have
          to find its way in darkness.
        </p>
      </section>

      <section className="mt-5 sm:mt-6">
        <ParishMap />
      </section>


<section className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-background p-6">
            <div
              className="font-serif text-4xl font-semibold"
              style={{
                color: s.tone === "red" ? "var(--mark-closed)" : "var(--foreground)",
              }}
            >
              {s.value}
            </div>
            <p className="mt-2 text-sm text-muted leading-snug">{s.label}</p>
          </div>
        ))}
      </section>

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
            See all current alerts and campaign evidence &rarr;
          </Link>
        </p>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-xl font-semibold">Parish Sustainability</h2>
          <span className="text-sm text-muted">
            {WATCH_COUNT} parishes
          </span>
        </div>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          Parishes that survived — or were never directly threatened — but face slow-burn erosion:
          clergy shortages, financial strain, post-merger fragility. Clergy situation, Lithuanian Mass
          schedule, and governance sourced for each.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/sustainability-watch" className="underline hover:text-accent font-medium">
            See all parish sustainability profiles &rarr;
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
