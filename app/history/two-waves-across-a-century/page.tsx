import type { Metadata } from "next";
import Link from "next/link";
import HistoryChapterNav from "@/components/HistoryChapterNav";
import HistoryTwoWaves from "@/components/HistoryTwoWaves";
import { historyProjection } from "@/lib/history-projection";

export const metadata: Metadata = {
  title: "Two Waves Across a Century",
  description:
    "Dated foundations and formal closures across the history of America’s Lithuanian Roman Catholic parishes.",
};

function Stat({
  value,
  children,
  red = false,
}: {
  value: number;
  children: React.ReactNode;
  red?: boolean;
}) {
  return (
    <div className="border-r border-rule px-3 py-3 last:border-r-0">
      <p
        className={`font-serif text-page-title font-semibold ${
          red ? "text-[var(--es-closed)]" : ""
        }`}
      >
        {value}
      </p>
      <p className="mt-1 font-sans text-small-copy leading-snug text-muted">
        {children}
      </p>
    </div>
  );
}

export default function TwoWavesAcrossACenturyPage() {
  const { counts, decades, peakFoundedDecade, peakClosedDecade } =
    historyProjection;

  return (
    <article className="mx-auto max-w-5xl px-4 pb-0 pt-8">
      <HistoryChapterNav current="/history/two-waves-across-a-century" />
      <header className="max-w-4xl">
        <p className="font-sans text-small-copy uppercase tracking-widest text-muted">
          Chapter II · Growth and closure
        </p>
        <h1 className="mt-1 font-serif text-outcomes-title font-semibold tracking-tight">
          Two Waves Across a Century
        </h1>
        <div className="mt-3 max-w-3xl space-y-3 font-serif text-lead-copy leading-[1.7] text-muted">
          <p>
            This chart places the founding and formal closure of America&rsquo;s
            Lithuanian Roman Catholic parishes on the same timeline. Read from
            left to right, the black squares show when parish institutions were
            founded; the red squares show when formal closures took effect. A
            parish with both dates appears once in each row, allowing its
            beginning and ending to be seen within the larger national story.
          </p>
          <p>
            Seeing the two rows together reveals why the history cannot be
            reduced to a single total. Lithuanian communities built a broad
            parish network in an early wave, sustained much of it for decades,
            and then experienced a second, prolonged wave of closures. The
            chart shows when each movement gathered force and which individual
            parishes formed it. Select any square to open that parish&rsquo;s full
            profile.
          </p>
        </div>
      </header>

      <div className="mt-7 grid grid-cols-2 border-y border-rule sm:grid-cols-4">
        <Stat value={peakFoundedDecade.founded.length}>
          {`founded in the ${peakFoundedDecade.decade}s`}
        </Stat>
        <Stat value={peakClosedDecade.closed.length} red>
          {`closed in the ${peakClosedDecade.decade}s`}
        </Stat>
        <Stat value={counts.closedSince1990}>
          formal closures dated since 1990
        </Stat>
        <Stat value={counts.closedSince2020}>
          formal closures dated since 2020
        </Stat>
      </div>

      <div className="mt-6">
        <HistoryTwoWaves decades={decades} />
      </div>
      <p className="mt-4 border-t border-rule pt-3 font-sans text-small-copy text-muted">
        {counts.foundedUndated} parish founding years and{" "}
        {counts.formalClosureUndated} formal-closure years are not established
        and therefore do not appear as dated squares.
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
          href="/history/parishes-alive-year-by-year"
          className="font-medium text-foreground underline hover:text-accent"
        >
          Next: parishes alive, year by year
        </Link>
      </footer>
    </article>
  );
}
