import type { Metadata } from "next";
import Link from "next/link";
import HistoryNav from "@/components/HistoryNav";
import HistoryDioceseLoss from "@/components/HistoryDioceseLoss";
import { historyProjection } from "@/lib/history-projection";

export const metadata: Metadata = {
  title: "The Loss, Diocese by Diocese",
  description:
    "How the decline of America’s Lithuanian Roman Catholic parish network unfolded across dioceses and over time.",
};

export default function LossByDiocesePage() {
  const { counts, dioceses } = historyProjection;
  const scranton = dioceses.find((diocese) => diocese.key === "Scranton")!;
  const chicago = dioceses.find((diocese) => diocese.key === "Chicago")!;
  const pittsburgh = dioceses.find((diocese) => diocese.key === "Pittsburgh")!;

  return (
    <article className="mx-auto max-w-5xl px-4 pb-0 pt-8">
      <HistoryNav current="/history/loss-by-diocese" />
      <header className="max-w-4xl">
        <p className="font-sans text-small-copy uppercase tracking-widest text-muted">
          Geography of loss
        </p>
        <h1 className="mt-1 font-serif text-outcomes-title font-semibold tracking-tight">
          The Loss, Diocese by Diocese
        </h1>
        <h2 className="mt-3 font-serif text-section-title font-semibold text-[var(--es-closed)]">
          {counts.diocesesWithoutActive} of {counts.namedDioceses} dioceses have
          no active Lithuanian parish left
        </h2>
      </header>

      <div className="mt-4 max-w-4xl space-y-3 font-serif text-lead-copy leading-[1.7]">
        <p>
          The loss was not evenly spread—it followed the geography of the
          founding. The dioceses that held the most Lithuanian parish life lost
          the most of it: Scranton, which once held {scranton.total} parishes,
          kept none active; Chicago kept one of {chicago.total}; Pittsburgh
          lost all {pittsburgh.total}. Of the {counts.namedDioceses} dioceses
          that ever held a Lithuanian parish, {counts.diocesesWithoutActive} now
          have none—and at {counts.endedOrTransferred} of the {counts.total}
          parishes, Lithuanian parish life has formally closed or continued in
          another community.
        </p>
        <p>
          Each diocese below is shaded by how much of its Lithuanian parish life
          is gone. Drag the year slider to watch the map turn from green to red
          as parish endings accumulate, and select any diocese for its full
          count and parish list.
        </p>
      </div>

      <div className="mt-7">
        <HistoryDioceseLoss
          dioceses={dioceses}
          currentYear={historyProjection.currentYear}
        />
      </div>

      <footer className="mt-10 border-t border-rule pt-5 font-sans text-support-copy text-muted">
        <Link
          href="/history"
          className="font-medium text-foreground underline hover:text-accent"
        >
          History overview
        </Link>
        {" · "}
        <Link
          href="/where-every-parish-ended-up"
          className="font-medium text-foreground underline hover:text-accent"
        >
          Explore parish and mission status today
        </Link>
      </footer>
    </article>
  );
}
