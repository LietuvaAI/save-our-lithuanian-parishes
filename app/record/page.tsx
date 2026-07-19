import type { Metadata } from "next";
import Link from "next/link";
import ParishTable from "@/components/ParishTable";
import {
  usParishes,
  comparatorParishes,
  ENDING_MODE_LABEL,
  OWNERSHIP_SHORT,
} from "@/lib/parishes";

export const metadata: Metadata = {
  title: "The Record",
  description:
    "The survival ledger: every U.S. Lithuanian parish documented in the Draugas archive, 2008–2026 — the data behind the site.",
};

export default function RecordPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">The Record</h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Every U.S. Lithuanian parish documented in the <em>Draugas</em> archive
        between January 2008 and May 2026 — {usParishes.length}{" "}
        parishes. Each
        row&rsquo;s sources are the dated <em>Draugas</em> issues in which the
        facts appear. 58 of the {usParishes.length} are documented in depth in
        per-parish case files; the rest are tracked at ledger level. This is
        the data behind every figure on the site — validated against the
        locked research figure set at every build.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        This ledger is the core corpus of a canon that reaches back to{" "}
        <em>Draugas</em>&rsquo;s first issues in 1909. The wider research
        registry documents
        137 more parishes across the U.S. and Canada (92 already on the{" "}
        <Link href="/" className="underline hover:text-foreground">
          home-page map
        </Link>
        ), each being verified toward this ledger&rsquo;s standard — the
        aim is a deep-researched case file behind every parish in the
        record. For the national precedent record — closures reversed on
        the Church&rsquo;s own procedures — see{" "}
        <Link href="/reversals" className="underline hover:text-foreground">
          Reversals
        </Link>
        .
      </p>

      <div className="mt-8">
        <ParishTable parishes={usParishes} />
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-semibold">
          Canadian comparators
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted leading-relaxed">
          Three Canadian parishes are documented for contrast and are not part
          of the U.S. figures. In Quebec, provincial law vests parish property
          in the parish itself — and both Montreal parishes survived.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {comparatorParishes.map((p) => (
            <li key={p.slug} className="flex flex-wrap gap-x-2">
              <span className="font-medium">{p.nameLt}</span>
              <span className="text-muted">
                {p.city}, {p.state} · {OWNERSHIP_SHORT[p.ownership]} ·{" "}
                {ENDING_MODE_LABEL[p.endingMode]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-16 text-sm text-muted">
        Šaltinis: „Draugo&ldquo; archyvas, 2008–2026 m. The dataset is open —
        every figure re-derives from the parish record at build time, and the
        build fails if anything drifts. How the whole record was collected:{" "}
        <Link
          href="/about-the-data"
          className="underline hover:text-foreground"
        >
          About the data
        </Link>
        .
      </p>
    </div>
  );
}
