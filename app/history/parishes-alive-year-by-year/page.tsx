import type { Metadata } from "next";
import Link from "next/link";
import HistoryAliveCurve from "@/components/HistoryAliveCurve";
import HistoryChapterNav from "@/components/HistoryChapterNav";
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
      <HistoryChapterNav current="/history/parishes-alive-year-by-year" />
      <header className="max-w-4xl">
        <p className="font-sans text-small-copy uppercase tracking-widest text-muted">
          Chapter III · The century arc
        </p>
        <h1 className="mt-1 font-serif text-outcomes-title font-semibold tracking-tight">
          Lithuanian Parishes Alive, Year by Year
        </h1>
        <p className="mt-3 max-w-3xl font-serif text-lead-copy leading-[1.7] text-muted">
          The dated record reaches a high plateau of {peakYear.alive} living
          parish institutions from {peakRange.start} through {peakRange.end}. By{" "}
          {currentYearPoint.year}, {currentYearPoint.alive} have a dated
          beginning without a dated institutional ending. This is a historical
          measure, not the count of active Lithuanian-led parishes today.
        </p>
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
          All four history chapters
        </Link>
        {" · "}
        <Link
          href="/history/loss-by-diocese"
          className="font-medium text-foreground underline hover:text-accent"
        >
          Next: the loss, diocese by diocese
        </Link>
      </footer>
    </article>
  );
}
