import type { Metadata } from "next";
import OwnershipChart from "@/components/OwnershipChart";
import { usParishes, figures } from "@/lib/parishes";

export const metadata: Metadata = {
  title: "The Data",
  description:
    "Ownership decides survival: every U.S. Lithuanian parish in the Draugas 2008–2026 corpus, by who holds the deed and who decided its ending.",
};

export default function DataPage() {
  const seven = usParishes.filter((p) => p.survivedReviewThenClosed);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">
        Ownership decides survival
      </h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Each mark is one of the {figures.usTotal} U.S. Lithuanian parishes
        documented in the <em>Draugas</em> archive, 2008–2026, grouped by who
        holds the deed. The color is not whether the parish closed — it is{" "}
        <strong className="text-foreground">who decided its ending</strong>.
      </p>

      <div className="mt-10">
        <OwnershipChart parishes={usParishes} />
      </div>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-serif text-2xl font-semibold">
          Surviving one review is not safety
        </h2>
        <p className="mt-3 text-muted leading-relaxed">
          Seven parishes survived one diocesan review or restructuring wave —
          and were closed at the next. Inside a diocese, reorganization buys
          time, not safety: the review clock only has to win once, and it never
          stops.
        </p>
        <ul className="mt-5 space-y-2 text-sm">
          {seven.map((p) => (
            <li key={p.slug} className="flex flex-wrap gap-x-2">
              <span className="font-medium">
                {p.nameLt} — {p.city}, {p.state}
              </span>
              <span className="text-muted">
                {p.endingMode === "undecided"
                  ? "unresolved"
                  : p.yearClosed
                    ? `closed ${p.yearClosed}`
                    : "closed"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-serif text-2xl font-semibold">
          The Pennsylvania coal region
        </h2>
        <p className="mt-3 text-muted leading-relaxed">
          The dataset individually documents {figures.coalRegion.total}{" "}
          coal-region parishes: of the {figures.coalRegion.dioceseOwned}{" "}
          diocese-owned, {figures.coalRegion.dioceseOwnedClosed} were closed
          and {figures.coalRegion.dioceseOwnedStanding} still stand. The one
          National Catholic parish — Dievo Apvaizdos in Scranton, owned by its
          own people — still stands: the last Lithuanian parish in the region
          that no bishop can close. <em>Draugas</em> itself has put the wider
          toll at 31 Lithuanian parishes in the region, with all 29 Roman
          Catholic ones closed (Draugas, 2017-12-28; 2024-01-20).
        </p>
      </section>

      <p className="mt-16 text-sm text-muted">
        Šaltinis: „Draugo&ldquo; archyvas, 2008–2026 m. Figures validated
        against the locked research figure set at every build.
      </p>
    </div>
  );
}
