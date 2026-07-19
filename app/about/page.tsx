import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why we keep the record of America's Lithuanian parishes — who we are, what the data is, and what we stand for.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">About</h1>
      <div className="mt-4 max-w-2xl space-y-4 leading-relaxed">
        <p>
          Save Our Lithuanian Parishes keeps the public record of America&rsquo;s
          Lithuanian parishes: who built them, who owned them, and who decided
          which ones survived. We stand for one goal —{" "}
          <strong>
            that what Lithuanian communities built stays in their hands
          </strong>
          , as{" "}
          <Link
            href="/what-canon-law-says"
            className="underline hover:text-accent"
          >
            even the Church&rsquo;s own law provides
          </Link>
          .
        </p>

        <h2 className="font-serif text-2xl font-semibold pt-4">
          Why a network
        </h2>
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
          the record ourselves — open, sourced, and growing: backward through
          the archives, and forward through{" "}
          <Link href="/report" className="underline hover:text-accent">
            reports from parishes
          </Link>{" "}
          today.
        </p>

        <h2 className="font-serif text-2xl font-semibold pt-4">The data</h2>
        <p>
          The record draws on the full run of the <em>Draugas</em> archive
          since 1909, published parish histories, and contemporary sources.
          Its core — the corpus behind every locked figure on this site — is
          the 2008–2026 archive: 2,768 issues, searched in full. Every fact in{" "}
          <Link href="/record" className="underline hover:text-accent">
            the record
          </Link>{" "}
          traces to a dated, published issue, and every figure on this site is
          re-derived from the parish record at build time — if a number ever
          drifts from the verified research, the site refuses to publish. The
          dataset is open:{" "}
          <a
            href="https://github.com/LietuvaAI/save-our-lithuanian-parishes"
            className="underline hover:text-accent"
          >
            check our numbers
          </a>
          .
        </p>
        <p>
          The record is growing backward toward the first parishes of the
          1880s–1900s — and that growth has begun to land. A unified research
          registry now joins the <em>Draugas</em> core with four further
          source axes: the 1909–2007 <em>Draugas</em> archive, being read
          issue by issue; William Wolkovich-Valkavičius&rsquo;s three-volume{" "}
          <em>Lithuanian Religious Life in America</em>; contemporary
          status sources; and the national closure-reversal research. Beyond
          the core 83, it documents{" "}
          <strong>137 more parishes</strong> across the U.S. and Canada — 119
          of them already on the home-page map, each marked by how deeply it
          is documented so far. And each{" "}
          <Link href="/parishes" className="underline hover:text-accent">
            parish profile
          </Link>{" "}
          is growing a researched present-day case record of where the
          building, the community, and the property stand now. The full
          story of how all of this was collected — sources, methods,
          copyright handling, and what is deliberately held back — is on{" "}
          <Link
            href="/about-the-data"
            className="underline hover:text-accent"
          >
            About the data
          </Link>
          .
        </p>

        <h2 className="font-serif text-2xl font-semibold pt-4">
          The record — and the armory
        </h2>
        <p>
          This site does two things. It keeps the record: what happened to
          the parishes, and who decided it. And it arms the communities still
          deciding:{" "}
          <Link href="/start-here" className="underline hover:text-accent">
            Start Here
          </Link>{" "}
          assembles the deadlines, the seven reasons that don&rsquo;t count
          under canon law, and the procedural rights that have{" "}
          <Link href="/reversals" className="underline hover:text-accent">
            reversed twenty-six closures
          </Link>{" "}
          in other dioceses. The record is Lithuanian. The law is universal —
          those pages are written for any parish, of any heritage, facing
          the same process.
        </p>

        <h2 className="font-serif text-2xl font-semibold pt-4">
          What this record does not argue
        </h2>
        <p className="text-muted">
          It documents that ownership decided survival. It does not propose
          that any parish leave the Roman Catholic Church — the National
          Catholic parishes appear here as historical witness, not as a
          recommendation. Our case rests on the Church&rsquo;s own law:{" "}
          <Link
            href="/what-canon-law-says"
            className="underline hover:text-foreground"
          >
            what canon law says
          </Link>
          .
        </p>

        <div className="rounded-lg border border-rule p-5 mt-6">
          <p className="font-medium">Follow the record as it grows.</p>
          <p className="mt-1 text-sm text-muted">
            Closure alerts, parish case files, and updates from the record —
            on{" "}
            <a
              href="https://blog.saveourlithuanianparishes.org"
              className="underline hover:text-foreground"
            >
              the blog
            </a>
            .
          </p>
          <p className="mt-3">
            <a
              href="https://blog.saveourlithuanianparishes.org/subscribe"
              className="inline-block rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "var(--mark-closed)" }}
            >
              Subscribe
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
