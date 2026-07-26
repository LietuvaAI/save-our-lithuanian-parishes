import type { Metadata } from "next";
import TimelineChart, {
  type TimelineRow,
  type TimelineOutcome,
  type UndatedRow,
} from "@/components/TimelineChart";
import HistoryGrid, {
  type HistoryParish,
  type EndState,
} from "@/components/HistoryGrid";
import registry from "@/data/registry-unified.json";
import {
  parishes as libParishes,
  type EndingMode,
  BUILDING_FATE_LABEL,
  type BuildingFate,
  type LithuanianIdentity,
} from "@/lib/parishes";

export const metadata: Metadata = {
  title: "The History",
  description:
    "A timeline of every Lithuanian parish in the United States — from the first founding in 1874 to the present day.",
};

// ---------------------------------------------------------------------------
// Data types from registry-unified.json
// ---------------------------------------------------------------------------

interface RegParish {
  slug: string;
  names: { lt: string | null; en: string | null };
  city: string;
  state: string;
  country: "US" | "CA";
  comparator: boolean;
  in_locked_scope: boolean;
  c83_row: number | null;
  locked?: {
    ending_mode?: string;
    year_founded?: string;
    year_closed?: string;
  };
  years?: {
    founded?: { value: string }[];
    closed?: { value: string }[];
  };
  sources?: { ethnic_status?: string }[];
  congregation_class?: string;
  diocese?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeDiocese(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Strip parenthetical annotations
  let d = raw.replace(/\s*\(.*\)$/, "").replace(/\s*\/.*$/, "").trim();
  // Fix known variants
  if (/bellevue/i.test(d)) d = "Diocese of Belleville";
  if (/unspecified/i.test(raw)) return null;
  return d || null;
}

function asYear(v: string | undefined | null): number | null {
  const m = (v ?? "").match(/\b(1[89]\d{2}|20[0-2]\d)\b/);
  return m ? parseInt(m[1]) : null;
}

function yearOf(
  lockedVal: string | undefined,
  arr: { value: string }[] | undefined,
): number | null {
  return asYear(lockedVal) ?? asYear(arr?.[0]?.value) ?? null;
}

function resolveOutcome(
  endingMode: EndingMode | null,
  hasClosed: boolean,
  isStanding: boolean,
): TimelineOutcome {
  if (isStanding) return "standing";
  if (endingMode === "diocese_closed") return "lost";
  if (endingMode === "community_decided") return "community";
  if (endingMode === "undecided") return "undecided";
  if (hasClosed) return "lost";
  return "unknown";
}

function fateDetail(buildingFate: string | undefined): string {
  if (
    buildingFate &&
    buildingFate !== "unknown" &&
    buildingFate !== "standing"
  ) {
    const label = BUILDING_FATE_LABEL[buildingFate as BuildingFate];
    return label ? `Building ${label.toLowerCase()}` : "";
  }
  return "";
}

function resolveEndState(
  identity: LithuanianIdentity | null,
  buildingFate: BuildingFate | null,
  hasClosed: boolean,
  isStanding: boolean,
): EndState {
  // Active parishes
  if (isStanding && identity === "active_parish") return "active_parish";
  if (isStanding && identity === "mass_continues") return "mass_continues";
  if (isStanding) return "active_parish"; // standing without identity detail

  // Ethnically transferred (identity lost but community/building continues)
  if (identity === "ethnically_transferred") return "transferred";

  // Demolished building
  if (buildingFate === "demolished") return "demolished";

  // Repurposed (secular or religious)
  if (
    buildingFate === "repurposed_secular" ||
    buildingFate === "repurposed_religious"
  )
    return "repurposed";

  // Closed with known identity loss
  if (identity === "lost") return "lost";

  // Closed but no detailed classification yet
  if (hasClosed) return "lost";

  // No data
  return "unverified";
}

// ---------------------------------------------------------------------------
// Data builder (runs server-side at build/render time)
// ---------------------------------------------------------------------------

function buildData(): {
  dated: TimelineRow[];
  undated: UndatedRow[];
  grid: HistoryParish[];
  standing: number;
  lost: number;
  total: number;
} {
  const regs = (
    registry as { parishes: RegParish[] }
  ).parishes.filter(
    (p) =>
      p.country !== "CA" &&
      p.congregation_class === "roman_catholic" &&
      !/buenos aires|argentin|rosario/i.test(p.city ?? ""),
  );

  const dated: TimelineRow[] = [];
  const undated: UndatedRow[] = [];
  const grid: HistoryParish[] = [];

  for (const p of regs) {
    const lib =
      p.c83_row != null ? libParishes[p.c83_row - 1] : undefined;
    const libOk = lib && lib.city === p.city;

    const founded = yearOf(p.locked?.year_founded, p.years?.founded);
    const closed = yearOf(p.locked?.year_closed, p.years?.closed);

    const slug = libOk ? lib.slug : p.slug;
    const endingMode = libOk ? (lib.endingMode as EndingMode) : null;

    const isStanding = !!(
      (endingMode === "standing" && !closed) ||
      (!closed &&
        libOk &&
        (lib.lithuanianIdentity === "active_parish" ||
          lib.lithuanianIdentity === "mass_continues"))
    );

    const outcome = resolveOutcome(endingMode, !!closed, isStanding);

    const detail = libOk
      ? fateDetail(lib.buildingFate ?? undefined)
      : "";

    const profileHref = libOk
      ? `/parishes/${lib.slug}`
      : p.c83_row == null
        ? `/registry/${p.slug}`
        : null;

    const name = p.names.lt || p.names.en || p.slug;
    const city = p.city.replace(/\s*[(;].*$/, "");

    const identity = libOk
      ? (lib.lithuanianIdentity as LithuanianIdentity | null)
      : null;
    const buildingFate = libOk
      ? (lib.buildingFate as BuildingFate | null)
      : null;

    const endState = resolveEndState(
      identity,
      buildingFate,
      !!closed,
      isStanding,
    );

    // HistoryGrid data
    grid.push({
      slug,
      name,
      city,
      state: p.state,
      diocese: normalizeDiocese(p.diocese),
      founded,
      closed,
      endState,
      profileHref,
    });

    if (founded) {
      dated.push({
        slug,
        name,
        city,
        state: p.state,
        founded,
        closed,
        outcome,
        detail,
        profileHref,
      });
    } else {
      undated.push({
        slug,
        name,
        city,
        state: p.state,
        closed,
        outcome,
        profileHref,
      });
    }
  }

  const standing =
    dated.filter((r) => r.outcome === "standing").length +
    undated.filter((r) => r.outcome === "standing").length;
  const lost =
    dated.filter(
      (r) => r.outcome === "lost" || r.outcome === "community",
    ).length +
    undated.filter(
      (r) => r.outcome === "lost" || r.outcome === "community",
    ).length;

  return {
    dated,
    undated,
    grid,
    standing,
    lost,
    total: dated.length + undated.length,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HistoryPage() {
  const { dated, undated, grid, standing, lost, total } = buildData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">The History</h1>
      <div className="mt-3 space-y-4 leading-relaxed max-w-3xl">
        <p>
          Between the 1870s and 1960, Lithuanian immigrants founded over{" "}
          {total}{" "}Catholic parishes across the United States &mdash; in
          coal towns, factory cities, and urban neighborhoods from
          Shenandoah to Chicago. Each line below is one parish. Where it
          ends, it was closed. Where it reaches the right edge, it
          survives.
        </p>
        <p
          className="font-serif text-lg"
          style={{ color: "var(--mark-standing)" }}
        >
          {standing} still stand as Lithuanian parishes today.
        </p>
      </div>

      {/* ── The First Parish ── */}
      <aside className="mt-8 max-w-3xl border-l-4 pl-5 py-3 space-y-2 text-sm leading-relaxed" style={{ borderColor: "var(--mark-ink)" }}>
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

      <div className="mt-10">
        <TimelineChart rows={dated} undated={undated} />
      </div>

      <section className="mt-12 max-w-3xl space-y-3 text-sm text-muted leading-relaxed">
        <p>
          {dated.length} parishes with known founding dates are shown in
          the timeline; {undated.length} more without a known founding date
          are shown as individual marks below it. Of the total {total}, at
          least {lost} have been confirmed closed and {standing} survive as
          Lithuanian parishes today.
        </p>
        <p>
          The peak decade of founding was the 1910s, when 58 Lithuanian
          parishes were established across America. The peak decade of
          closing was the 2000s, when 27 were closed. The pattern is not
          slowing &mdash; it is the ongoing elimination of an ethnic
          community&rsquo;s institutional infrastructure, one parish at a
          time.
        </p>
      </section>

      {/* ── By Diocese: End-State Grid ── */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl font-semibold mb-2">
          Where Every Parish Ended Up
        </h2>
        <p className="text-muted leading-relaxed max-w-3xl mb-8">
          The same {total} parishes, grouped by diocese and colored by what
          happened to them. Click any parish to see its full record.
        </p>
        <HistoryGrid parishes={grid} />
      </section>
    </div>
  );
}
