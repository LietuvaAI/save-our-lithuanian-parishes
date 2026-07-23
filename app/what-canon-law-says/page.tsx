import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What canon law actually says",
  description:
    "Under the Church's own law, a parish's property belongs to the parish — canons 515 §3 and 1256. The deed problem is a civil-law arrangement, and fixing it is not separation.",
};

function Src({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-accent"
    >
      {children}
    </a>
  );
}

export default function CanonLawPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        What canon law actually says
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        The surprise at the bottom of the parish ownership question: the
        Church&rsquo;s own law is not the obstacle. Standing for community
        ownership is not standing against the Church.
      </p>

      <div className="prose prose-lg dark:prose-invert max-w-none mt-8 prose-headings:font-serif">
        <h2>The parish owns its property</h2>
        <p>
          Under the Code of Canon Law, every legitimately established parish
          is a <em>juridic person</em> — its own legal entity within the
          Church (
          <Src href="https://www.ewtn.com/catholicism/library/rights-of-parishes-1251">
            canon 515 §3
          </Src>
          ). And canon 1256 states that ownership of goods belongs to the
          juridic person that lawfully acquired them (
          <Src href="https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib5-cann1254-1310_en.html">
            Code of Canon Law, Book V
          </Src>
          ). In plain words: <strong>canonically, a parish&rsquo;s property
          belongs to the parish — not to the diocese.</strong>
        </p>
        <p>
          This is not a fringe reading. American dioceses have argued exactly
          this in federal bankruptcy courts — that parish assets are not
          diocesan assets and cannot be used to pay diocesan debts (
          <Src href="https://www.chausa.org/news-and-publications/publications/health-progress/archives/january-february-2009/canon-law---ownership-defined-differently-in-civil-canon-law">
            Catholic Health Association analysis
          </Src>
          ;{" "}
          <Src href="https://scholarship.shu.edu/cgi/viewcontent.cgi?article=1824&context=shlj">
            Seton Hall Law Journal
          </Src>
          ).
        </p>

        <h2>Then how were 55 parishes closed over their communities&rsquo; objections?</h2>
        <p>
          Two mechanisms, and neither is ownership in the ordinary sense.
          First, the bishop holds the canonical authority to{" "}
          <em>suppress or merge the parish itself</em> — and when a parish
          ceases to exist as a juridic person, its property passes to the
          successor entity the bishop designates. The community never sold
          anything; the owner simply ceased to exist.
        </p>
        <p>
          Second, in much of the United States the <em>civil</em> title is
          held through arrangements like the <em>corporation sole</em> — the
          bishop, incorporated under state law, holds legal title to parish
          property (
          <Src href="https://www.catholicworldreport.com/2024/11/18/cause-for-conflict-the-catholic-church-and-property-rights-in-american-law/">
            Catholic World Report
          </Src>
          ). That arrangement is an American choice from the era after the
          1884 Plenary Council of Baltimore — not divine law, and not the only
          faithful option. New York&rsquo;s parishes are separate civil
          corporations whose boards include lay trustees. The Ordinariate of
          the Chair of St. Peter incorporates each parish separately,
          precisely because, in its own words, that better reflects the
          Church&rsquo;s understanding that each parish is its own juridic
          person (
          <Src href="https://ordinariate.net/parish-property-ownership">
            Ordinariate on parish property
          </Src>
          ).
        </p>

        <h2>Communities have won inside the system</h2>
        <p>
          In 2012, the Vatican&rsquo;s Congregation for the Clergy overturned
          the Diocese of Cleveland&rsquo;s closure decrees: of fourteen
          parishes that appealed, twelve were ordered reopened — the first
          time Rome reversed closures at that scale — and the bishop complied
          (
          <Src href="https://www.npr.org/2012/03/07/148170076/vatican-orders-cleveland-parishes-reopened">
            NPR
          </Src>
          ;{" "}
          <Src href="https://www.ncronline.org/news/parish/bishop-reopen-12-closed-cleveland-parishes">
            National Catholic Reporter
          </Src>
          ). And Cleveland is not alone. Our research now documents{" "}
          <Link href="/reversals">twenty-six reversed closures</Link>
          {" "}in three diocesan waves — Allentown in 2011, Cleveland in
          2012, Buffalo in 2025 — every one won not by protest alone, and
          never by
          leaving the Church, but by the Church&rsquo;s own procedures,
          applied in time.
        </p>
        <p>
          The timing is the hard lesson. In{" "}
          <Link href="/record">our own case-filed record</Link>, no appeal
          filed after the decree ever reversed a closure — the national
          reversals were won by communities that moved before the decree or
          within the appeal window after it, a window measured in{" "}
          <em>days</em>, not months. Time inside the structure is real, but
          it runs on the Church&rsquo;s clock.
        </p>
        <p>
          This page covers the <em>ownership</em> half of the argument. The{" "}
          <em>procedure</em> half — the deadlines, the seven reasons canon
          law does not accept for closing a church, and the questions that
          have made closure decrees void — is on{" "}
          <Link href="/start-here">Start Here</Link>, with every precedent
          documented on{" "}
          <Link href="/reversals">Where Rome said no</Link> and the fuller
          argument in our essay{" "}
          <Src href="https://blog.saveourlithuanianparishes.org/p/a-closure-done-wrong-is-not-a-closure">
            Closed by the Diocese, Reopened by Rome
          </Src>
          .
        </p>

        <h2>What we stand for</h2>
        <p>
          Alignment, not separation. Our goal is that the civil paperwork —
          the deed — reflects what the Church&rsquo;s own law already says:
          the parish&rsquo;s property belongs to the parish, the community of
          the faithful who built and sustain it. That is a position argued{" "}
          <em>from</em> canon law, not against it. This site does not propose
          that any parish leave the Catholic Church; the independent parishes
          in <Link href="/record">the record</Link> appear as historical
          witness, not as a recommendation.
        </p>
        <p className="text-sm">
          <em>
            This page summarizes public sources and is not canonical or legal
            advice. We are seeking review by a canon lawyer; corrections are
            welcome —{" "}
            <Link href="/report">tell us what we got wrong</Link>.
          </em>
        </p>
      </div>
    </article>
  );
}
