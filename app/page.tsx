import Link from "next/link";
import ParishMap from "@/components/ParishMap";
import { figures } from "@/lib/parishes";
import alertsData from "@/data/alerts.json";
import registry from "@/data/registry-unified.json";

// Record-level figures derive from the unified registry (never hand-typed).
const regParishes = (
  registry as {
    parishes: {
      locked?: { year_founded?: string };
      years?: { founded?: { value: string }[] };
    }[];
  }
).parishes;
const asYear = (v?: string | null) => {
  const m = v?.match(/\b(1[89]\d{2}|20[0-2]\d)\b/);
  return m ? Number(m[1]) : null;
};
const foundedYears = regParishes
  .flatMap((p) => [
    asYear(p.locked?.year_founded),
    ...(p.years?.founded ?? []).map((f) => asYear(f.value)),
  ])
  .filter((y): y is number => y != null);
const REG_TOTAL = regParishes.length;
const EARLIEST = Math.min(...foundedYears);

const STATS = [
  {
    value: String(REG_TOTAL),
    label: `Lithuanian parishes and congregations documented across the U.S. and Canada — the record reaches back to ${EARLIEST}`,
    tone: "ink",
  },
  {
    value: String(figures.usTotal),
    label:
      "verified in depth in the Draugas 2008–2026 core — every fact traced to a dated, published issue",
    tone: "ink",
  },
  {
    value: String(figures.endingMode.diocese_closed),
    label:
      "closed, merged away, suppressed, or demolished by diocesan decision since 2008",
    tone: "red",
  },
  {
    value: `${figures.endingMode.diocese_closed} of ${figures.endingMode.diocese_closed}`,
    label: "of those closed parishes were diocese-owned. No exception.",
    tone: "red",
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
    title: "Know who holds the deed",
    body: "Find your parish among the documented parishes. See its ownership, its outcome, and how its story compares to the rest of the record.",
    cta: "Find your parish",
    href: "/parishes",
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
      <section className="pt-12 sm:pt-16 text-center">
        <p className="text-sm uppercase tracking-widest text-muted mb-3">
          Every parish, from the very beginning
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold leading-tight max-w-3xl mx-auto">
          The public record of America&rsquo;s Lithuanian parishes
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg leading-relaxed text-muted">
          Lithuanian immigrants built more than two hundred parishes across
          America — churches and schools, choirs and cemeteries: our
          historical, cultural, and spiritual inheritance. No one kept their
          record. Now it is kept here — every parish we can document, from
          the very first foundings to the communities deciding their future
          today. And we stand for one goal:{" "}
          <strong className="text-foreground">
            that what Lithuanian communities built stays in their hands
          </strong>{" "}
          — as{" "}
          <Link
            href="/what-canon-law-says"
            className="underline hover:text-accent"
          >
            even the Church&rsquo;s own law provides
          </Link>
          .
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link
            href="/report"
            className="rounded-md px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "var(--mark-closed)" }}
          >
            Report from your parish
          </Link>
          <Link
            href="/parishes"
            className="rounded-md border border-rule px-5 py-2.5 text-sm font-medium hover:border-foreground transition-colors"
          >
            Find your parish in the record
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <ParishMap />
      </section>

      <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule rounded-lg overflow-hidden">
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
        className="mt-10 rounded-lg border border-rule p-5 sm:p-6"
        style={{ borderLeft: "4px solid var(--mark-closed)" }}
      >
        <p className="text-sm uppercase tracking-widest text-muted">
          Happening now
        </p>
        <p className="mt-2 leading-relaxed max-w-3xl">
          Detroit&rsquo;s <strong>Divine Providence</strong>{" "}&mdash; the
          last Lithuanian Catholic parish in the city &mdash; is inside the
          Archdiocese
          of Detroit&rsquo;s restructuring. The record shows that the only
          window that ever mattered is <em>before</em> the closure letter
          arrives. That window is open now.{" "}
          <Link
            href="/start-here"
            className="font-semibold underline hover:text-accent whitespace-nowrap"
          >
            Start here →
          </Link>{" "}
          <Link
            href="/who-does-the-parish-belong-to"
            className="underline hover:text-accent whitespace-nowrap"
          >
            · Why this moment matters →
          </Link>
        </p>
        <ul className="mt-4 space-y-1.5 border-t border-rule pt-3 text-sm leading-relaxed max-w-3xl">
          {(alertsData.alerts as { id: string; level: string; entity: string; place: string; parishLink: string; whatChanged: string }[])
            .filter((a) => a.level === "red")
            .map((a) => (
              <li key={a.id}>
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full bg-accent"
                  aria-hidden
                />
                <Link href={a.parishLink} className="font-medium hover:underline">
                  {a.entity}
                </Link>
                <span className="text-muted">
                  {" "}&mdash; {a.place}: {a.whatChanged.split(". ")[0].replace(/\.$/, "")}.
                </span>
              </li>
            ))}
          <li className="pt-1">
            <Link href="/now" className="underline hover:text-accent text-sm">
              All current alerts →
            </Link>{" "}
            <a
              href="https://blog.saveourlithuanianparishes.org/p/active-campaigns"
              className="underline hover:text-accent text-sm font-medium"
            >
              · Active campaigns — how to help each parish →
            </a>
          </li>
        </ul>
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
            Subscribe to the blog
          </a>
        </p>
      </section>

      <section className="py-16 max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-semibold">
          The communities built them
        </h2>
        <p className="mt-4 leading-relaxed">
          Lithuanian immigrants raised these churches with their own hands and
          their own wages — and, since 1884, the deed to nearly every Roman
          Catholic parish has rested not with the community that built it, but
          with the diocese. Within these 83 parishes, the record shows that
          neither solvency, nor petitions, nor lawsuits, nor appeals filed
          after the decree ever reversed a closure — the only parishes never
          closed by an outside authority are the ones the community itself
          controlled.
        </p>
        <p className="mt-4 leading-relaxed">
          Nationally, Rome <em>has</em> reversed closures —{" "}
          <Link href="/reversals" className="underline hover:text-accent">
            twenty-six documented times
          </Link>
          , when parishioners moved on procedure before and during the window,
          not after. Both lessons are this site&rsquo;s work: ownership decides
          endings, and procedure, in time, is the only fight that has ever won.
        </p>
        <p className="mt-4 leading-relaxed">
          That is not an argument — it is the record: every entry traces to a
          dated, published source, open for anyone to verify. It grows
          backward through the archives and forward through reports from
          people like you.
        </p>
        <p className="mt-6">
          <Link href="/about" className="underline hover:text-accent">
            Why we keep this record — and how you can help →
          </Link>
        </p>
      </section>
    </div>
  );
}
