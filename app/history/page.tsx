import type { Metadata } from "next";
import Link from "next/link";
import TimelineChart, {
  type TimelineRow,
  type UndatedRow,
} from "@/components/TimelineChart";
import EndStateFlow, {
  type FlowCounts,
  type FlowMember,
} from "@/components/EndStateFlow";
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
  const closedFates: FlowCounts["closedFates"] = {
    demolished: 0,
    religious: 0,
    secular: 0,
    derelict: 0,
    standing: 0,
    unrecorded: 0,
  };

  const fateBySlug = new Map(
    libParishes.map((p) => [p.slug, p.buildingFate as BuildingFate | null]),
  );

  const members: Record<string, FlowMember[]> = {};
  const addMember = (key: string, p: (typeof all)[number]) => {
    (members[key] ??= []).push({
      name: p.name,
      city: p.city,
      state: p.state,
      founded: p.founded,
      closed: p.closed,
      href: p.profileHref,
    });
  };

  for (const p of all) {
    counts[toGroup(p.endState)]++;

    // The closed family's building fates — the flow chart's third stage —
    // and the member lists behind each clickable flow.
    if (p.endState === "demolished") {
      closedFates.demolished++;
      addMember("fate:demolished", p);
      addMember("g:closed", p);
    } else if (p.endState === "repurposed") {
      if (p.buildingFate === "repurposed_secular") {
        closedFates.secular++;
        addMember("fate:secular", p);
      } else {
        closedFates.religious++;
        addMember("fate:religious", p);
      }
      addMember("g:closed", p);
    } else if (p.endState === "closed") {
      if (p.buildingFate === "standing") {
        closedFates.standing++;
        addMember("fate:standing", p);
      } else if (p.buildingFate === "derelict") {
        closedFates.derelict++;
        addMember("fate:derelict", p);
      } else {
        closedFates.unrecorded++;
        addMember("fate:unrecorded", p);
      }
      addMember("g:closed", p);
    } else {
      addMember(`g:${toGroup(p.endState)}`, p);
    }

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

  const standing = all.filter((p) => isAlive(p.endState) && !p.closed).length;
  const lost = all.filter((p) => isLoss(p.endState)).length;

  // Member lists sorted for the click-through panels
  for (const key of Object.keys(members)) {
    members[key].sort(
      (a, b) => a.name.localeCompare(b.name) || a.city.localeCompare(b.city),
    );
  }

  return {
    dated,
    undated,
    counts,
    closedFates,
    members,
    standing,
    lost,
    total: all.length,
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
    members,
    standing,
    lost,
    total,
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
          Between the 1870s and 1960, Lithuanian immigrants founded the
          {` ${total} `}Catholic parishes documented so far in this record
          &mdash; in coal towns, factory cities, and urban neighborhoods from
          Shenandoah to Chicago. Of them, at least {lost} have been closed.
        </p>
        <p
          className="font-serif text-lg"
          style={{ color: "var(--es-active)" }}
        >
          {standing} still stand as Lithuanian parishes today.
        </p>
      </div>

      {/* ── The flow: the whole record at a glance, every category ── */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          Where every parish ended up
        </h2>
        <p className="mt-1 text-muted leading-relaxed max-w-3xl mb-6">
          All {total} documented parishes flow to where they stand today
          &mdash; and the closed flow on to what became of their buildings.
          Click any flow to see the parishes inside it.
        </p>
        <EndStateFlow counts={{ groups: counts, closedFates, members }} />
        <p className="mt-5 text-sm leading-relaxed max-w-3xl">
          Of the {total} parishes documented so far, {lost} are closed.{" "}
          {closedFates.demolished} of their churches have been demolished;{" "}
          {closedFates.religious + closedFates.secular} were sold on &mdash;{" "}
          {closedFates.religious} to other congregations,{" "}
          {closedFates.secular} to secular use. {standing} parishes still
          stand as Lithuanian parishes today.
        </p>
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
        <p className="mt-1 text-muted leading-relaxed max-w-3xl mb-6">
          Above the line, parishes founded each decade; below it, in red,
          parishes closed. Then every parish as one bar, from its founding
          to its closure &mdash; or to today. Bars that fade out mark
          parishes whose fate the record has not yet established.
        </p>
        <TimelineChart rows={dated} undated={undated} />
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
