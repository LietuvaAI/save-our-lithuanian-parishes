import type { Metadata } from "next";
import Link from "next/link";
import CompositionBar from "@/components/CompositionBar";
import DioceseGrid from "@/components/DioceseGrid";
import DioceseMap, { type DioceseMapCounts } from "@/components/DioceseMap";
import { scopedParishes, type ScopedParish } from "@/lib/registry-scope";
import {
  GROUP_ORDER,
  toGroup,
  isAlive,
  isLoss,
  type EndStateGroup,
} from "@/lib/end-state";

export const metadata: Metadata = {
  title: "By Diocese",
  description:
    "Lithuanian parishes grouped by Catholic diocese — which dioceses preserved their Lithuanian heritage and which did not.",
};

export interface DioceseSummary {
  name: string;
  shortName: string;
  parishes: ScopedParish[];
  counts: Record<EndStateGroup, number>;
  closedCount: number;
  aliveCount: number;
}

function buildDioceses(): DioceseSummary[] {
  const byDiocese = new Map<string, ScopedParish[]>();
  for (const p of scopedParishes()) {
    const key = p.diocese ?? "Diocese unassigned";
    if (!byDiocese.has(key)) byDiocese.set(key, []);
    byDiocese.get(key)!.push(p);
  }

  const summaries: DioceseSummary[] = [];
  for (const [name, parishes] of byDiocese) {
    const counts = {} as Record<EndStateGroup, number>;
    for (const g of GROUP_ORDER) counts[g] = 0;
    for (const p of parishes) counts[toGroup(p.endState)]++;
    summaries.push({
      name,
      shortName: name.replace(/^(Arch)?diocese of /i, ""),
      parishes: parishes.sort(
        (a, b) =>
          (a.founded ?? 9999) - (b.founded ?? 9999) ||
          a.name.localeCompare(b.name),
      ),
      counts,
      closedCount: parishes.filter((p) => isLoss(p.endState)).length,
      aliveCount: parishes.filter((p) => isAlive(p.endState)).length,
    });
  }
  summaries.sort(
    (a, b) => b.parishes.length - a.parishes.length || a.name.localeCompare(b.name),
  );
  return summaries;
}

export default function ByDiocesePage() {
  const dioceses = buildDioceses();
  const named = dioceses.filter((d) => d.name !== "Diocese unassigned");
  const totalParishes = dioceses.reduce((s, d) => s + d.parishes.length, 0);
  const totalAlive = dioceses.reduce((s, d) => s + d.aliveCount, 0);
  const totalClosed = dioceses.reduce((s, d) => s + d.closedCount, 0);
  const emptied = named.filter((d) => d.aliveCount === 0).length;

  const totals = {} as Record<EndStateGroup, number>;
  for (const g of GROUP_ORDER) totals[g] = 0;
  for (const d of dioceses)
    for (const g of GROUP_ORDER) totals[g] += d.counts[g];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        The record · by place
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        By Diocese
      </h1>
      <div className="mt-3 space-y-4 leading-relaxed max-w-3xl">
        <p>
          {`${named.length} Catholic dioceses held the ${totalParishes} documented
          Lithuanian parishes of the United States. In ${emptied} of them, no
          Lithuanian parish remains active today.`}{" "}
          Each bar below shows what happened to one diocese&rsquo;s
          Lithuanian parishes; every parish links to its full record.
        </p>
      </div>

      {/* Summary stats */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl">
        <div className="rounded-lg border border-rule p-4 text-center">
          <p className="font-serif text-3xl font-semibold">{named.length}</p>
          <p className="mt-1 text-sm text-muted">Dioceses</p>
        </div>
        <div className="rounded-lg border border-rule p-4 text-center">
          <p
            className="font-serif text-3xl font-semibold"
            style={{ color: "var(--es-active)" }}
          >
            {totalAlive}
          </p>
          <p className="mt-1 text-sm text-muted">Still active</p>
        </div>
        <div className="rounded-lg border border-rule p-4 text-center">
          <p
            className="font-serif text-3xl font-semibold"
            style={{ color: "var(--es-closed)" }}
          >
            {totalClosed}
          </p>
          <p className="mt-1 text-sm text-muted">Closed</p>
        </div>
      </div>

      {/* The whole record in one bar */}
      <section className="mt-10 max-w-3xl">
        <CompositionBar counts={totals} height={36} />
      </section>

      {/* The geography of the loss */}
      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          The map of the dioceses
        </h2>
        <p className="mt-1 text-muted leading-relaxed max-w-3xl mb-5">
          Every Catholic diocese in the United States, shaded by the share of
          its documented Lithuanian parishes now closed.
        </p>
        <DioceseMap
          counts={Object.fromEntries(
            named.map((d) => [
              d.shortName,
              {
                total: d.parishes.length,
                closed: d.closedCount,
                alive: d.aliveCount,
              },
            ]),
          ) as DioceseMapCounts}
        />
        <p className="mt-3 text-xs text-muted border-t border-rule pt-3 max-w-3xl">
          Boundaries: US Census county geometry (public domain) merged per
          diocese via the public-domain county&ndash;diocese crosswalk
          (kburchfiel/us_diocese_mapper). Diocese lines follow county lines;
          the few counties split between dioceses follow the crosswalk&rsquo;s
          primary assignment.
        </p>
      </section>

      {/* Diocese cards */}
      <div className="mt-10">
        <DioceseGrid dioceses={dioceses} />
      </div>

      {/* Footer note */}
      <p className="mt-10 text-sm text-muted border-t border-rule pt-4">
        Diocese assignments are resolved from historical source entries
        (Wolkovich, Michelsonas) and geographic city&ndash;diocese lookup.{" "}
        <Link href="/record" className="underline hover:text-foreground">
          See the full record
        </Link>
        .
      </p>
    </div>
  );
}
