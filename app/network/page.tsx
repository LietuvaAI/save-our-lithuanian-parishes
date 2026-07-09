import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Network",
  description:
    "Why we keep this record: an information network for the communities that built America's Lithuanian parishes.",
};

export default function NetworkPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">The Network</h1>
      <div className="mt-4 max-w-2xl space-y-4 leading-relaxed">
        <p>
          When the Lithuanian press was banned under the Tsars, Bishop Motiejus
          Valančius organized a network — the <em>knygnešiai</em>, the book
          carriers — that moved the printed word hand to hand across the
          border, because the institutions that should have carried it would
          not. Lithuanian identity survived forty years of that ban because
          ordinary people built their own information network.
        </p>
        <p>
          This project works the same way. Decisions about parish closures are
          made inside diocesan processes; the communities that built the
          parishes are often the last to understand what is coming. So we keep
          the record ourselves: what happened to every documented Lithuanian
          parish in America, traced to dated issues of <em>Draugas</em>, open
          for anyone to verify — and growing, backward through the archives
          and forward through{" "}
          <Link href="/report" className="underline hover:text-accent">
            reports from parishes
          </Link>{" "}
          today.
        </p>
        <p className="text-muted">
          To be clear about what this record does and does not argue: it
          documents that ownership decided survival. It does not propose that
          any parish leave the Roman Catholic Church — the National Catholic
          parishes appear here as historical witness, not as a recommendation.
        </p>
        <div className="rounded-lg border border-rule p-5">
          <p className="font-medium">Dispatches are coming.</p>
          <p className="mt-1 text-sm text-muted">
            A companion publication — closure alerts, parish case files, and
            updates from the record — is in preparation. Until then, the{" "}
            <Link href="/parishes" className="underline hover:text-foreground">
              record
            </Link>{" "}
            and the{" "}
            <Link href="/data" className="underline hover:text-foreground">
              data
            </Link>{" "}
            are open.
          </p>
        </div>
      </div>
    </div>
  );
}
