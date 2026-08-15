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
        <p className="mt-3 max-w-3xl font-serif text-lead-copy leading-[1.7] text-muted">
          Each square is one parish institution. Black marks record dated
          foundations; red marks record dated formal closures. Select any mark
          to open the corresponding parish profile.
        </p>
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
