import type { Metadata } from "next";
import Link from "next/link";
import { historyProjection } from "@/lib/history-projection";

export const metadata: Metadata = {
  title: "The Rise and Loss of America’s Lithuanian Parishes",
  description:
    "Four chapters tracing the beginning, expansion, endurance, and diocesan loss of America’s Lithuanian Roman Catholic parishes.",
};

export default function HistoryPage() {
  const { counts, peakYear, peakRange } = historyProjection;

  const chapters = [
    {
      numeral: "I",
      href: "/pennsylvania-coal-region",
      id: "beginning",
      kicker: "The beginning",
      title: "Pennsylvania Coal Country",
      description: `${counts.pennsylvania} of the ${counts.total} documented Roman Catholic Lithuanian parishes were founded in Pennsylvania. The complete regional chapter follows the first foundations and every parish in the northeastern coal-region comparison.`,
    },
    {
      numeral: "II",
      href: "/history/two-waves-across-a-century",
      id: "two-waves",
      kicker: "Growth and closure",
      title: "Two Waves Across a Century",
      description:
        "One dated mark for every documented parish foundation and formal closure reveals the national building wave and the later wave of loss.",
    },
    {
      numeral: "III",
      href: "/history/parishes-alive-year-by-year",
      id: "century-arc",
      kicker: "The century arc",
      title: "Lithuanian Parishes Alive, Year by Year",
      description: `The dated parish record reaches its high plateau of ${peakYear.alive} living institutions from ${peakRange.start} through ${peakRange.end}. Open any year to see the complete parish roster.`,
    },
    {
      numeral: "IV",
      href: "/history/loss-by-diocese",
      id: "loss-by-diocese",
      kicker: "The geography of loss",
      title: "The Loss, Diocese by Diocese",
      description: `${counts.diocesesWithoutActive} of the ${counts.namedDioceses} dioceses that once held a Lithuanian parish now have no active Lithuanian parish left. Follow that change over time and inspect every diocese.`,
    },
  ];

  return (
    <article className="mx-auto max-w-5xl px-4 pb-0 pt-8">
      <header className="max-w-4xl">
        <p className="font-sans text-small-copy uppercase tracking-widest text-muted">
          A four-part history · 1880s to today
        </p>
        <h1 className="mt-1 font-serif text-outcomes-title font-semibold tracking-tight">
          The Rise and Loss of America&rsquo;s Lithuanian Parishes
        </h1>
        <p className="mt-3 max-w-3xl font-serif text-lead-copy leading-relaxed text-muted">
          From Pennsylvania coal towns to the industrial cities of the Midwest
          and Northeast, {counts.total} Roman Catholic parishes formed a
          national Lithuanian network. Read the story in four chapters: where
          it began, how it expanded, how long it endured, and where the losses
          fell.
        </p>
        <p className="mt-3 font-sans text-support-copy text-muted">
          This history follows {counts.total} Roman Catholic parishes. Missions
          and individual church buildings are presented separately.
        </p>
      </header>

      <ol className="mt-9 border-b border-rule">
        {chapters.map((chapter) => (
          <li
            key={chapter.href}
            id={chapter.id}
            className="scroll-mt-8 border-t border-rule"
          >
            <Link
              href={chapter.href}
              className="group grid gap-3 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start"
            >
              <span className="font-mono text-small-copy font-semibold text-muted">
                {chapter.numeral}
              </span>
              <span>
                <span className="block font-sans text-ui-label font-semibold uppercase tracking-[0.15em] text-muted">
                  {chapter.kicker}
                </span>
                <span className="mt-1 block font-serif text-section-title font-semibold group-hover:text-accent">
                  {chapter.title}
                </span>
                <span className="mt-2 block max-w-3xl font-sans text-body-copy leading-relaxed text-muted">
                  {chapter.description}
                </span>
              </span>
              <span className="font-sans text-body-copy font-semibold text-foreground group-hover:text-accent">
                Read chapter →
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <footer className="mt-10 border-t border-rule pt-5 font-sans text-support-copy text-muted">
        <Link
          href="/where-every-parish-ended-up"
          className="font-medium text-foreground underline hover:text-accent"
        >
          Explore parish and mission status
        </Link>
        {" · "}
        <Link
          href="/parishes"
          className="font-medium text-foreground underline hover:text-accent"
        >
          Open all profiles
        </Link>
      </footer>
    </article>
  );
}
