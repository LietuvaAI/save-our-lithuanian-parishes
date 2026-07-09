import Link from "next/link";
import ParishMap from "@/components/ParishMap";
import { figures } from "@/lib/parishes";

const STATS = [
  {
    value: String(figures.usTotal),
    label: "Lithuanian parishes across America, documented over eighteen years",
    tone: "ink",
  },
  {
    value: String(figures.endingMode.diocese_closed),
    label: "closed, merged away, suppressed, or demolished by diocesan decision",
    tone: "red",
  },
  {
    value: `${figures.endingMode.diocese_closed} of ${figures.endingMode.diocese_closed}`,
    label: "of those closed parishes were diocese-owned. No exception.",
    tone: "red",
  },
  {
    value: String(figures.communityOwned.closedByOutsideAuthority),
    label: "community-owned parishes were ever closed by an outside authority",
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
    title: "Know who holds the deed",
    body: "Find your parish among the documented parishes. See its ownership, its outcome, and how its story compares to the rest of the record.",
    cta: "Search the record",
    href: "/parishes",
    primary: false,
  },
  {
    title: "Arm your community with the facts",
    body: "The full argument, traced claim by claim to published sources. Read it, print it, and put it in front of your parish council.",
    cta: "Read the article",
    href: "/who-does-the-parish-belong-to",
    primary: false,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="pt-12 sm:pt-16 text-center">
        <p className="text-sm uppercase tracking-widest text-muted mb-3">
          The record of America&rsquo;s Lithuanian parishes
        </p>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold leading-tight max-w-3xl mx-auto">
          Who decides whether a Lithuanian parish survives?
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg leading-relaxed text-muted">
          Not faith. Not money. Not the fight —{" "}
          <strong className="text-foreground">ownership</strong>. Know the
          record. Watch your parish. Act while the community still decides.
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
            href="/who-does-the-parish-belong-to"
            className="underline hover:text-accent whitespace-nowrap"
          >
            Why this moment matters →
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

      <section className="py-16 max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-semibold">
          The communities built them
        </h2>
        <p className="mt-4 leading-relaxed">
          Lithuanian immigrants raised these churches with their own hands and
          their own wages — and, since 1884, the deed to nearly every Roman
          Catholic parish has rested not with the community that built it, but
          with the diocese. The record shows that neither solvency, nor
          petitions, nor lawsuits, nor appeals to the Vatican has ever
          reversed a closure decision. The only parishes never closed by an
          outside authority are the ones the community itself controlled.
        </p>
        <p className="mt-4 leading-relaxed">
          That is not an argument — it is the record: every entry traces to a
          dated, published source, open for anyone to verify. It grows
          backward through the archives and forward through reports from
          people like you.
        </p>
        <p className="mt-6">
          <Link href="/network" className="underline hover:text-accent">
            Why we keep this record — and how you can help →
          </Link>
        </p>
      </section>
    </div>
  );
}
