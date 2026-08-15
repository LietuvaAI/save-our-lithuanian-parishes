import type { Metadata } from "next";
import Link from "next/link";
import HistoryAliveCurve from "@/components/HistoryAliveCurve";
import HistoryNav from "@/components/HistoryNav";
import { historyProjection } from "@/lib/history-projection";

export const metadata: Metadata = {
  title: "Lithuanian Parishes Alive, Year by Year",
  description:
    "A year-by-year count and complete roster of America’s Lithuanian Roman Catholic parishes with dated institutional lives.",
};

function Era({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:px-5 first:pl-0 last:pr-0">
      <h2 className="font-serif text-subsection-title font-semibold">{title}</h2>
      <p className="mt-2 font-sans text-body-copy leading-relaxed text-muted">
        {children}
      </p>
    </div>
  );
}

export default function ParishesAliveYearByYearPage() {
  const { counts, years, peakYear, peakRange, currentYearPoint } =
    historyProjection;

  return (
    <article className="mx-auto max-w-5xl px-4 pb-0 pt-8">
      <HistoryNav current="/history/parishes-alive-year-by-year" />
      <header className="max-w-4xl">
        <p className="font-sans text-small-copy uppercase tracking-widest text-muted">
          Institutional life over time
        </p>
        <h1 className="mt-1 font-serif text-outcomes-title font-semibold tracking-tight">
          Lithuanian Parishes Alive, Year by Year
        </h1>
        <div className="mt-3 max-w-3xl space-y-3 font-serif text-lead-copy leading-[1.7] text-muted">
          <p>
            This chart reconstructs the size of America&rsquo;s Lithuanian Roman
            Catholic parish network one year at a time. A parish enters the
            count in its documented founding year and leaves after its dated
            institutional ending. The line therefore follows parish
            institutions across time&mdash;not individual church buildings,
            missions, or the number of places offering Lithuanian Mass today.
          </p>
          <p>
            The rising line shows the creation of a national network as new
            Lithuanian parishes opened in mining towns, industrial cities, and
            immigrant neighborhoods. That network reaches its documented high
            plateau of {peakYear.alive} parish institutions from{" "}
            {peakRange.start} through {peakRange.end}. The downward arc records
            the later accumulation of dated institutional endings rather than
            one sudden moment of disappearance.
          </p>
          <p>
            The endpoint requires special care. In {currentYearPoint.year}, the
            chart still counts {currentYearPoint.alive} parishes with a dated
            beginning and no dated institutional ending. That does not mean
            there are {currentYearPoint.alive} active Lithuanian-led parishes
            today: some institutions now continue in another community or no
            longer have Lithuanian leadership, while other records still lack
            an established ending date. Select any marked year to see its
            foundations and endings, then open the full list of every parish
            included in that year&rsquo;s total.
          </p>
        </div>
      </header>

      <div className="mt-7">
        <HistoryAliveCurve
          years={years}
          parishes={historyProjection.parishes}
        />
      </div>

      <div className="mt-8 grid gap-5 border-y border-rule py-5 md:grid-cols-3 md:divide-x md:divide-rule">
        <Era title="The building wave">
          By the end of the 1920s, {counts.foundedBy1929} parish institutions
          had a dated foundation. Migration, mines, mills, and urban
          neighborhoods produced the dense national network.
        </Era>
        <Era title="War and renewal">
          The middle decades added fewer foundations, but the parish network
          remained near its greatest extent through the postwar period.
        </Era>
        <Era title="The long contraction">
          Formal closures accelerated late in the century:{" "}
          {counts.closedSince1990} of today&rsquo;s closed parishes have closure
          dates in 1990 or later.
        </Era>
      </div>

      <p className="mt-4 font-sans text-small-copy leading-relaxed text-muted">
        At the end of each year, the curve counts parish institutions with a
        dated foundation on or before that year and no dated institutional
        ending by that year. The {counts.foundedUndated} undated founding years
        cannot enter the curve; {counts.formalClosureUndated} formal closures
        have no dated position. The {counts.datedEndingsOutsideCurve} dated
        ending events attached to records without a dated foundation remain
        visible as events but do not change the curve. Each parish&rsquo;s
        current status appears on its profile and in Parish &amp; Mission Status.
      </p>

      <footer className="mt-10 border-t border-rule pt-5 font-sans text-support-copy text-muted">
        <Link
          href="/history"
          className="font-medium text-foreground underline hover:text-accent"
        >
          History overview
        </Link>
        {" · "}
        <Link
          href="/history/loss-by-diocese"
          className="font-medium text-foreground underline hover:text-accent"
        >
          The loss, diocese by diocese
        </Link>
      </footer>
    </article>
  );
}
