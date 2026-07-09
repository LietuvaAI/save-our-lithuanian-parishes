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
          Not faith. Not money. Not the fight. Every mark below is a parish —
          and its shape is{" "}
          <strong className="text-foreground">who decided its ending</strong>.
        </p>
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

      <section className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          href="/who-does-the-parish-belong-to"
          className="rounded-md bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-85 transition-opacity"
        >
          Read the article
        </Link>
        <Link
          href="/parishes"
          className="rounded-md border border-rule px-5 py-2.5 text-sm font-medium hover:border-foreground transition-colors"
        >
          Browse the record
        </Link>
        <Link
          href="/data"
          className="rounded-md border border-rule px-5 py-2.5 text-sm font-medium hover:border-foreground transition-colors"
        >
          See the data
        </Link>
        <Link
          href="/report"
          className="rounded-md border border-rule px-5 py-2.5 text-sm font-medium hover:border-foreground transition-colors"
        >
          Report from your parish
        </Link>
      </section>

      <section className="py-16 max-w-2xl mx-auto">
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
          record: every entry traces to a dated, published source, open for
          anyone to verify. Three Canadian parishes are documented as
          comparators and appear in{" "}
          <Link href="/parishes" className="underline hover:text-accent">
            the record
          </Link>
          , not on the U.S. map.
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
