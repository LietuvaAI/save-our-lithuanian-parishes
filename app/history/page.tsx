import type { Metadata } from "next";
import Link from "next/link";
import TimelineChart, {
  type TimelineRow,
  type UndatedRow,
} from "@/components/TimelineChart";
import ParishThreads, {
  type ThreadParish,
  type FateKey,
} from "@/components/ParishThreads";
import { scopedParishes } from "@/lib/registry-scope";
import {
  GROUP_ORDER,
  toGroup,
  isAlive,
  isLoss,
  type EndStateGroup,
} from "@/lib/end-state";
import { BUILDING_FATE_LABEL, type BuildingFate, parishes as libParishes } from "@/lib/parishes";

export const metadata: Metadata = {
  title: "The History",
  description:
    "A timeline of every documented Lithuanian parish in the United States — from the first founding in the 1870s to the present day.",
};

// ---------------------------------------------------------------------------
// Data builder (server-side; every figure derives from the shared scope)
// ---------------------------------------------------------------------------

function buildData() {
  const all = scopedParishes();

  const dated: TimelineRow[] = [];
  const undated: UndatedRow[] = [];
  const counts = {} as Record<EndStateGroup, number>;
  for (const g of GROUP_ORDER) counts[g] = 0;
  const closedFates: Record<FateKey, number> = {
    demolished: 0,
    religious: 0,
    secular: 0,
    derelict: 0,
    standing: 0,
    unrecorded: 0,
  };
  const threads: ThreadParish[] = [];

  const fateBySlug = new Map(
    libParishes.map((p) => [p.slug, p.buildingFate as BuildingFate | null]),
  );

  for (const p of all) {
    counts[toGroup(p.endState)]++;

    // The closed family's building fates — each parish's thread terminal.
    let fateKey: FateKey | null = null;
    if (p.endState === "demolished") fateKey = "demolished";
    else if (p.endState === "repurposed")
      fateKey =
        p.buildingFate === "repurposed_secular" ? "secular" : "religious";
    else if (p.endState === "closed") {
      if (p.buildingFate === "standing") fateKey = "standing";
      else if (p.buildingFate === "derelict") fateKey = "derelict";
      else fateKey = "unrecorded";
    }
    if (fateKey) closedFates[fateKey]++;

    threads.push({
      slug: p.slug,
      name: p.name,
      city: p.city,
      state: p.state,
      founded: p.founded,
      closed: p.closed,
      endState: p.endState,
      fateKey,
      href: p.profileHref,
    });

    const fate = fateBySlug.get(p.slug);
    const detail =
      fate && fate !== "unknown" && fate !== "standing"
        ? `Building ${BUILDING_FATE_LABEL[fate].toLowerCase()}`
        : "";

    if (p.founded) {
      dated.push({
        slug: p.slug,
        name: p.name,
        city: p.city,
        state: p.state,
        founded: p.founded,
        closed: p.closed,
        endState: p.endState,
        detail,
        profileHref: p.profileHref,
      });
    } else {
      undated.push({
        slug: p.slug,
        name: p.name,
        city: p.city,
        state: p.state,
        closed: p.closed,
        endState: p.endState,
        profileHref: p.profileHref,
      });
    }
  }

  const standing = all.filter(
    (p) => toGroup(p.endState) === "active_parish" && !p.closed,
  ).length;
  const hostedMass = all.filter(
    (p) => toGroup(p.endState) === "mass_continues" && !p.closed,
  ).length;
  const lost = all.filter((p) => isLoss(p.endState)).length;

  // ── Narrative figures for the timeline section (all record-derived) ──
  const foundedByDecade = new Map<number, number>();
  const closedByDecade = new Map<number, number>();
  for (const p of all) {
    if (p.founded)
      foundedByDecade.set(
        Math.floor(p.founded / 10) * 10,
        (foundedByDecade.get(Math.floor(p.founded / 10) * 10) ?? 0) + 1,
      );
    if (p.closed)
      closedByDecade.set(
        Math.floor(p.closed / 10) * 10,
        (closedByDecade.get(Math.floor(p.closed / 10) * 10) ?? 0) + 1,
      );
  }
  const peak = (m: Map<number, number>) =>
    [...m.entries()].sort((a, b) => b[1] - a[1])[0] ?? [0, 0];
  const [peakFoundDecade, peakFoundN] = peak(foundedByDecade);
  const [peakClosedDecade, peakClosedN] = peak(closedByDecade);
  const closedSince1990 = all.filter(
    (p) => p.closed && p.closed >= 1990,
  ).length;
  const closedSince2020 = all.filter(
    (p) => p.closed && p.closed >= 2020,
  ).length;
  const lifespans = all
    .filter((p) => isLoss(p.endState) && p.founded && p.closed)
    .map((p) => p.closed! - p.founded!)
    .sort((a, b) => a - b);
  const medianLifespan = lifespans.length
    ? lifespans[Math.floor(lifespans.length / 2)]
    : null;
  const oldestAlive = all
    .filter((p) => isAlive(p.endState) && !p.closed && p.founded)
    .sort((a, b) => a.founded! - b.founded!)[0] ?? null;

  return {
    dated,
    undated,
    counts,
    closedFates,
    threads,
    standing,
    hostedMass,
    lost,
    total: all.length,
    narrative: {
      peakFoundDecade,
      peakFoundN,
      peakClosedDecade,
      peakClosedN,
      closedSince1990,
      closedSince2020,
      medianLifespan,
      oldestAlive,
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HistoryPage() {
  const {
    dated,
    undated,
    counts,
    closedFates,
    threads,
    standing,
    hostedMass,
    lost,
    total,
    narrative,
  } = buildData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        The record · 1870s to today
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        The History
      </h1>
      <div className="mt-3 space-y-4 leading-relaxed max-w-3xl">
        <p>
          Lithuanian immigrants founded the{` ${total} `}Catholic parishes
          documented so far in this record &mdash; most between the 1870s and
          1960, in coal towns, factory cities, and urban neighborhoods from
          Shenandoah to Chicago, with the latest as recent as the 1990s.
        </p>
        <p>
          Of the {total}, {lost} are closed. {closedFates.demolished} of
          their churches have been demolished;{" "}
          {closedFates.religious + closedFates.secular} were sold on &mdash;{" "}
          {closedFates.religious} to other congregations, {closedFates.secular}{" "}
          to secular use.
        </p>
        <p
          className="font-serif text-lg"
          style={{ color: "var(--es-active)" }}
        >
          {standing} still stand as Lithuanian parishes today
          <span className="text-muted font-sans text-base">
            {" "}&mdash; and at {hostedMass} more churches, a Lithuanian Mass
            continues within a parish that is no longer Lithuanian.
          </span>
        </p>
      </div>

      {/* ── The flow: the whole record at a glance, every category ── */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          Where every parish ended up
        </h2>
        <p className="mt-1 text-muted leading-relaxed max-w-3xl mb-6">
          Each thread is one parish, from its founding decade to where it
          stands today &mdash; and, for the closed, on to what became of the
          building. Hover a thread to trace one parish; click it to open the
          record; click a band to list its parishes.
        </p>
        <ParishThreads parishes={threads} />
      </section>

      {/* ── The First Parish ── */}
      <aside
        className="mt-12 max-w-3xl border-l-4 pl-5 py-3 space-y-2 text-sm leading-relaxed"
        style={{ borderColor: "var(--mark-ink)" }}
      >
        <p className="font-serif text-base font-semibold">
          The first Lithuanian parish in America
        </p>
        <p>
          St. George&rsquo;s (Šv. Jurgio) in Shenandoah, Pennsylvania
          &mdash; organized by Father Andrius Strupinskas, SJ, a Jesuit
          who fled Lithuania in 1869. The founding date is contested:
          sources cite 1872, 1874, 1886, and 1891, reflecting the
          parish&rsquo;s complicated origins as a joint Polish-Lithuanian
          congregation that reorganized as Lithuanian. The church building
          dates to 1893. It was closed in 2006 and demolished in
          2009&ndash;2010 &mdash; the diocese took approximately $1M in
          parish savings despite a credible $360K repair estimate,
          landmark status, and a community treaty.
        </p>
        <p className="text-muted text-xs">
          Sources: <em>Lietuvių Kultūrinis Paveldas Amerikoje</em> (Lukas,
          2009); Draugas archive 2008&ndash;2026; parish case file.
        </p>
      </aside>

      {/* ── The exhibit: decade pulse + timeline (one title system) ── */}
      <section className="mt-14">
        <h2 className="font-serif text-2xl font-semibold">
          A half-century of building; a half-century of closing
        </h2>
        <div className="mt-3 space-y-4 leading-relaxed max-w-3xl">
          <p>
            The founding wave crested in the {narrative.peakFoundDecade}s,
            when the immigrant generation raised {narrative.peakFoundN}{" "}
            parishes in a single decade &mdash; churches built from
            miners&rsquo; and factory workers&rsquo; wages, with a smaller
            wave after the Second World War as the Displaced Persons
            generation arrived. Then the direction reversed. Since 1990 the
            record logs {narrative.closedSince1990} closures,{" "}
            {narrative.peakClosedN} of them in the{" "}
            {narrative.peakClosedDecade}s alone &mdash; the heaviest decade
            of loss &mdash; and {narrative.closedSince2020} more since 2020.
            The pattern is not history; it is still moving.
          </p>
        </div>
        <p className="mt-4 text-sm text-muted leading-relaxed max-w-3xl mb-6">
          How to read it: above the line, parishes founded each decade;
          below it, in red, parishes closed. Then every parish as one bar,
          from its founding to its closure &mdash; or to today. Bars that
          fade out mark parishes whose fate the record has not yet
          established; an &times; marks a church that no longer exists.
        </p>
        <TimelineChart rows={dated} undated={undated} />

        {/* Selective takeaways, computed from the record */}
        <ul className="mt-6 max-w-3xl space-y-2 text-sm leading-relaxed">
          {narrative.medianLifespan != null && (
            <li className="flex gap-2">
              <span aria-hidden style={{ color: "var(--es-closed)" }}>■</span>
              <span>
                The median closed parish stood for{" "}
                <strong>{narrative.medianLifespan} years</strong> &mdash;
                institutions built to outlive their founders, dismantled in a
                generation&rsquo;s time.
              </span>
            </li>
          )}
          {narrative.oldestAlive && (
            <li className="flex gap-2">
              <span aria-hidden style={{ color: "var(--es-active)" }}>■</span>
              <span>
                The longest-standing parish still active is{" "}
                <strong>
                  {narrative.oldestAlive.profileHref ? (
                    <Link
                      href={narrative.oldestAlive.profileHref}
                      className="underline hover:text-accent"
                    >
                      {narrative.oldestAlive.name}
                    </Link>
                  ) : (
                    narrative.oldestAlive.name
                  )}
                </strong>{" "}
                in {narrative.oldestAlive.city},{" "}
                {narrative.oldestAlive.state} &mdash; since{" "}
                {narrative.oldestAlive.founded}.
              </span>
            </li>
          )}
          <li className="flex gap-2">
            <span aria-hidden style={{ color: "var(--mark-ink)" }}>■</span>
            <span>
              {undated.length} parishes appear as squares below the timeline
              &mdash; attested in the record, founding dates still being
              researched.
            </span>
          </li>
        </ul>

        <p className="mt-4 text-xs text-muted border-t border-rule pt-3">
          Source: the unified parish registry &mdash; Draugas 1909&ndash;2026,
          Wolkovich-Valkavičius (1998), Michelsonas (1961), Lukas (2009), and
          the contemporary web survey. Dates resolve from locked figures
          first, then earliest sourced reading.{" "}
          <Link href="/about-the-data" className="underline hover:text-foreground">
            About the data
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl space-y-3 text-sm text-muted leading-relaxed">
        <p>
          The diocese-by-diocese picture &mdash; every parish, every diocese,
          and the map of the dioceses &mdash; is on{" "}
          <Link href="/by-diocese" className="underline hover:text-foreground">
            By Diocese
          </Link>
          . Every parish links to its full record.
        </p>
        <p>
          {dated.length} parishes with known founding dates are shown in the
          timeline; {undated.length} more without a known founding date are
          shown as individual marks below it. The peak decades are computed
          from the record and labeled directly on the chart. The pattern is
          not slowing &mdash; it is the ongoing elimination of an ethnic
          community&rsquo;s institutional infrastructure, one parish at a
          time.
        </p>
      </section>
    </div>
  );
}
