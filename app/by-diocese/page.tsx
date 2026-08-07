import type { Metadata } from "next";
import Link from "next/link";
import siteFigures from "@/data/site-figures.json";
import DioceseExplorer, {
  type DioceseExplorerEntry,
} from "@/components/DioceseExplorer";
import DioceseClosureRanking from "@/components/DioceseClosureRanking";
import {
  romanCatholicParishHistory,
  type InstitutionHistoryRow,
} from "@/lib/infographic-projection";
import type { EndState } from "@/lib/end-state";

export const metadata: Metadata = {
  title: "By Diocese",
  description:
    "Lithuanian parishes grouped by Catholic diocese — which dioceses preserved their Lithuanian heritage and which did not.",
};

function buildDioceses(): DioceseExplorerEntry[] {
  const byDiocese = new Map<string, InstitutionHistoryRow[]>();
  for (const parish of romanCatholicParishHistory) {
    const key = parish.diocese ?? "Diocese unassigned";
    if (!byDiocese.has(key)) byDiocese.set(key, []);
    byDiocese.get(key)!.push(parish);
  }

  return [...byDiocese.entries()]
    .map(([name, parishes]) => {
      const groups = parishes.map((parish) => parish.status_group);
      return {
        name,
        shortName: name.replace(/^(Arch)?diocese of /i, ""),
        total: parishes.length,
        ended: groups.filter(
          (group) => group === "closed" || group === "transferred",
        ).length,
        formalClosed: groups.filter((group) => group === "closed").length,
        transferred: groups.filter((group) => group === "transferred").length,
        active: groups.filter((group) => group === "active_parish").length,
        unresolved: groups.filter((group) => group === "unresolved").length,
        parishes: parishes
          .sort(
            (a, b) =>
              (a.founded.year ?? 9999) - (b.founded.year ?? 9999) ||
              a.name.localeCompare(b.name),
          )
          .map((parish) => ({
            slug: parish.registry_slug,
            name: parish.name,
            city: parish.city,
            state: parish.state,
            founded: parish.founded.year,
            closed: parish.closed.year,
            endState: parish.status_group as EndState,
            profileHref: parish.public_profile,
          })),
      };
    })
    .sort(
      (a, b) => b.total - a.total || a.name.localeCompare(b.name),
    );
}

export default function ByDiocesePage() {
  const dioceses = buildDioceses();
  const named = dioceses.filter(
    (diocese) => diocese.name !== "Diocese unassigned",
  );
  const totalParishes = dioceses.reduce(
    (sum, diocese) => sum + diocese.total,
    0,
  );
  const totalEnded = dioceses.reduce(
    (sum, diocese) => sum + diocese.ended,
    0,
  );
  const emptied = named.filter((diocese) => diocese.active === 0).length;
  const unassigned =
    dioceses.find((diocese) => diocese.name === "Diocese unassigned")?.total ??
    0;

  if (totalParishes !== siteFigures.history.parishes) {
    throw new Error("By Diocese population does not match site-figures.json");
  }

  return (
    <article className="mx-auto max-w-5xl px-4 pb-4 pt-8">
      <p className="text-xs uppercase text-muted">
        Institutional view
      </p>
      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        By Diocese
      </h1>
      <p className="mt-2 max-w-3xl font-serif text-lg leading-relaxed sm:text-xl">
        Which dioceses preserved Lithuanian parish life, and where did it end?
      </p>

      <section className="mt-6 border-y border-rule py-5">
        <DioceseExplorer dioceses={named} />
        <div className="mt-4 grid gap-3 border-t border-rule pt-4 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)]">
          <div>
            <p className="font-serif text-xl font-semibold leading-tight">
              {emptied} of {named.length} dioceses have no active Lithuanian
              parish left.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              Lithuanian parish life has formally closed or transferred to
              another community at {totalEnded} of {totalParishes} Roman
              Catholic parishes.
            </p>
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Scope: {totalParishes} U.S. Roman Catholic parishes across{" "}
            {named.length} named dioceses
            {unassigned > 0 ? `; ${unassigned} remain unassigned` : ""}
            {" · "}
            <Link
              href="/about-the-data"
              className="underline hover:text-accent"
            >
              About the data
            </Link>
          </p>
        </div>
      </section>

      <DioceseClosureRanking dioceses={named} />
    </article>
  );
}
