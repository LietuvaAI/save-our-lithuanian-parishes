import Link from "next/link";
import { figures } from "@/lib/parishes";

const STATS = [
  {
    value: String(figures.usTotal),
    label: "U.S. Lithuanian parishes documented across 18 years of the Draugas archive",
  },
  {
    value: String(figures.endingMode.diocese_closed),
    label: "closed, merged away, suppressed, or demolished by diocesan decision",
  },
  {
    value: `${figures.endingMode.diocese_closed} of ${figures.endingMode.diocese_closed}`,
    label: "of those closed parishes were diocese-owned. No exception.",
  },
  {
    value: String(figures.communityOwned.closedByOutsideAuthority),
    label: "community-owned parishes were ever closed by an outside authority",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-16 sm:py-24">
        <p className="text-sm uppercase tracking-widest text-muted mb-4">
          The record of America&rsquo;s Lithuanian parishes
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight max-w-3xl">
          Who decides whether a Lithuanian parish survives?
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">
          Not faith. Not money. Not how many people fill the pews, and not how
          hard the community fights. Eighteen years of the <em>Draugas</em>{" "}
          archive show that one thing decides a parish&rsquo;s fate:{" "}
          <strong>who holds the ownership of the parish</strong>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/data"
            className="rounded-md bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-85 transition-opacity"
          >
            See the data
          </Link>
          <Link
            href="/parishes"
            className="rounded-md border border-rule px-5 py-2.5 text-sm font-medium hover:border-foreground transition-colors"
          >
            Browse the record
          </Link>
          <Link
            href="/report"
            className="rounded-md border border-rule px-5 py-2.5 text-sm font-medium hover:border-foreground transition-colors"
          >
            Report from your parish
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule rounded-lg overflow-hidden">
        {STATS.map((s) => (
          <div key={s.label} className="bg-background p-6">
            <div className="font-serif text-4xl font-semibold text-accent">
              {s.value}
            </div>
            <p className="mt-2 text-sm text-muted leading-snug">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="py-16 max-w-2xl">
        <h2 className="font-serif text-2xl font-semibold">
          The communities built them
        </h2>
        <p className="mt-4 leading-relaxed">
          Lithuanian immigrants raised these churches with their own hands and
          their own wages — and, since 1884, the deed to nearly every Roman
          Catholic parish has rested not with the community that built it, but
          with the diocese. When a diocese decides to close a parish, the
          record shows that neither solvency, nor petitions, nor lawsuits, nor
          appeals to the Vatican has ever reversed the decision.
        </p>
        <p className="mt-4 leading-relaxed">
          The only parishes never closed by an outside authority are the ones
          the community itself controlled. That is not an argument — it is the
          record, and every entry in it traces to a dated issue of{" "}
          <em>Draugas</em>, the Lithuanian-American newspaper of record.
        </p>
        <p className="mt-6 space-x-6">
          <Link
            href="/who-does-the-parish-belong-to"
            className="underline hover:text-accent"
          >
            Read the article: Who does the parish belong to? →
          </Link>
        </p>
        <p className="mt-3">
          <Link href="/network" className="underline hover:text-accent">
            Why we keep this record — and how you can help →
          </Link>
        </p>
      </section>
    </div>
  );
}
