import type { Metadata } from "next";
import Link from "next/link";
import registry from "@/data/registry-unified.json";
import alertsData from "@/data/alerts.json";
import {
  parishes as libParishes,
  type LithuanianIdentity,
  type BuildingFate,
} from "@/lib/parishes";
import { END_STATE_LABEL, type EndState } from "@/components/HistoryGrid";

export const metadata: Metadata = {
  title: "By Diocese",
  description:
    "Lithuanian parishes grouped by Catholic diocese — which dioceses preserved their Lithuanian heritage and which did not.",
};

// ── Data types ──────────────────────────────────────────────────────────────

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

// ── EndState colors (same palette as HistoryGrid) ───────────────────────────

const COLOR: Record<EndState, string> = {
  active_parish: "var(--mark-standing)",
  mass_continues: "var(--mark-ink)",
  transferred: "var(--mark-community)",
  demolished: "var(--mark-building)",
  repurposed: "var(--mark-ink)",
  lost: "var(--mark-closed)",
  unverified: "var(--muted)",
};

const TEXT_COLOR: Record<EndState, string> = {
  active_parish: "#fff",
  mass_continues: "var(--background)",
  transferred: "#1c1917",
  demolished: "#fff",
  repurposed: "var(--background)",
  lost: "#fff",
  unverified: "var(--foreground)",
};

const END_STATE_ORDER: EndState[] = [
  "active_parish",
  "mass_continues",
  "transferred",
  "demolished",
  "repurposed",
  "lost",
  "unverified",
];

// ── Helpers ─────────────────────────────────────────────────────────────────

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

function resolveEndState(
  identity: LithuanianIdentity | null,
  buildingFate: BuildingFate | null,
  hasClosed: boolean,
  isStanding: boolean,
): EndState {
  if (isStanding && identity === "active_parish") return "active_parish";
  if (isStanding && identity === "mass_continues") return "mass_continues";
  if (isStanding) return "active_parish";
  if (identity === "ethnically_transferred") return "transferred";
  if (buildingFate === "demolished") return "demolished";
  if (buildingFate === "repurposed_secular" || buildingFate === "repurposed_religious")
    return "repurposed";
  if (identity === "lost") return "lost";
  if (hasClosed) return "lost";
  return "unverified";
}

// ── Alert lookups ───────────────────────────────────────────────────────────

const alertBySlug = new Map<string, string>();
for (const a of alertsData.alerts as { parishLink: string; kind: string }[]) {
  const slug = a.parishLink.replace(/^\/(parishes|registry)\//, "");
  alertBySlug.set(slug, a.kind);
}

const sustainBySlug = new Set<string>();
for (const sw of (
  (alertsData as Record<string, unknown>).sustainabilityWatch as
    | { parishLink: string }[]
    | undefined
) ?? []) {
  sustainBySlug.add(sw.parishLink.replace(/^\/(parishes|registry)\//, ""));
}

// ── Build data ──────────────────────────────────────────────────────────────

interface ParishRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  endState: EndState;
  hasAlert: boolean;
  onWatch: boolean;
  profileHref: string | null;
}

interface DioceseSummary {
  name: string;
  shortName: string;
  parishes: ParishRow[];
  total: number;
  counts: Record<EndState, number>;
  hasAlerts: boolean;
}

function buildDioceses(): DioceseSummary[] {
  const regs = (registry as { parishes: RegParish[] }).parishes.filter(
    (p) =>
      !(p.sources ?? []).some((s) =>
        /no parish/i.test(s.ethnic_status ?? "")
      ) &&
      p.country !== "CA" &&
      p.congregation_class === "roman_catholic" &&
      !/buenos aires|argentin|rosario/i.test(p.city ?? ""),
  );

  const byDiocese = new Map<string, ParishRow[]>();

  for (const p of regs) {
    const dioceseName = p.diocese ?? "Unassigned";
    const lib =
      p.c83_row != null ? libParishes[p.c83_row - 1] : undefined;
    const libOk = lib && lib.city === p.city;
    const slug = libOk ? lib.slug : p.slug;

    const closed = yearOf(p.locked?.year_closed, p.years?.closed);
    const endingMode = libOk ? lib.endingMode : null;
    const identity = libOk
      ? (lib.lithuanianIdentity as LithuanianIdentity | null)
      : null;
    const buildingFate = libOk
      ? (lib.buildingFate as BuildingFate | null)
      : null;

    const isStanding = !!(
      (endingMode === "standing" && !closed) ||
      (!closed &&
        libOk &&
        (lib.lithuanianIdentity === "active_parish" ||
          lib.lithuanianIdentity === "mass_continues"))
    );

    const endState = resolveEndState(identity, buildingFate, !!closed, isStanding);
    const hasAlert = alertBySlug.has(slug);
    const onWatch = sustainBySlug.has(slug);

    const row: ParishRow = {
      slug,
      name: p.names.lt || p.names.en || p.slug,
      city: p.city.replace(/\s*[(;].*$/, ""),
      state: p.state,
      endState,
      hasAlert,
      onWatch,
      profileHref: libOk
        ? `/parishes/${lib.slug}`
        : p.c83_row == null
          ? `/registry/${p.slug}`
          : null,
    };

    const list = byDiocese.get(dioceseName) ?? [];
    list.push(row);
    byDiocese.set(dioceseName, list);
  }

  const summaries: DioceseSummary[] = [];

  for (const [name, parishes] of byDiocese) {
    const counts = {} as Record<EndState, number>;
    for (const s of END_STATE_ORDER) counts[s] = 0;
    for (const p of parishes) counts[p.endState]++;

    summaries.push({
      name,
      shortName: name
        .replace(/^Archdiocese of /, "")
        .replace(/^Diocese of /, ""),
      parishes: parishes.sort((a, b) => a.name.localeCompare(b.name)),
      total: parishes.length,
      counts,
      hasAlerts: parishes.some((p) => p.hasAlert),
    });
  }

  summaries.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  return summaries;
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ByDiocesePage() {
  const dioceses = buildDioceses();
  const totalParishes = dioceses.reduce((s, d) => s + d.total, 0);
  const totalDioceses = dioceses.filter((d) => d.name !== "Unassigned").length;

  // Top-level aggregates
  const totalActive = dioceses.reduce(
    (s, d) => s + (d.counts.active_parish ?? 0) + (d.counts.mass_continues ?? 0),
    0,
  );
  const totalClosed = dioceses.reduce(
    (s, d) =>
      s +
      (d.counts.lost ?? 0) +
      (d.counts.demolished ?? 0) +
      (d.counts.repurposed ?? 0),
    0,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">By Diocese</h1>
      <div className="mt-3 space-y-4 leading-relaxed max-w-3xl">
        <p>
          {totalParishes} Lithuanian parishes across {totalDioceses} Catholic
          dioceses in the United States. Each colored bar shows what happened
          to the Lithuanian parishes in that diocese. Click any parish to see
          its full record.
        </p>
      </div>

      {/* Summary stats */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-rule p-4 text-center">
          <p className="font-serif text-3xl font-semibold">{totalDioceses}</p>
          <p className="mt-1 text-sm text-muted">Dioceses</p>
        </div>
        <div className="rounded-lg border border-rule p-4 text-center">
          <p
            className="font-serif text-3xl font-semibold"
            style={{ color: "var(--mark-standing)" }}
          >
            {totalActive}
          </p>
          <p className="mt-1 text-sm text-muted">Still active</p>
        </div>
        <div className="rounded-lg border border-rule p-4 text-center">
          <p
            className="font-serif text-3xl font-semibold"
            style={{ color: "var(--mark-closed)" }}
          >
            {totalClosed}
          </p>
          <p className="mt-1 text-sm text-muted">Closed</p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        {END_STATE_ORDER.filter((s) =>
          dioceses.some((d) => (d.counts[s] ?? 0) > 0),
        ).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: COLOR[s] }}
            />
            {END_STATE_LABEL[s]}
          </span>
        ))}
      </div>

      {/* Diocese cards */}
      <div className="mt-8 space-y-5">
        {dioceses.map((d) => (
          <section
            key={d.name}
            className="rounded-lg border border-rule overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-rule bg-foreground/[0.02]">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h2 className="font-serif text-lg font-semibold">
                  {d.shortName}
                </h2>
                <span className="text-sm text-muted">
                  {d.total} {d.total === 1 ? "parish" : "parishes"}
                </span>
              </div>

              {/* Single bar */}
              <div
                className="mt-2 flex rounded-md overflow-hidden h-5"
                title={END_STATE_ORDER.filter((s) => (d.counts[s] ?? 0) > 0)
                  .map((s) => `${END_STATE_LABEL[s]}: ${d.counts[s]}`)
                  .join(", ")}
              >
                {END_STATE_ORDER.map((s) => {
                  const n = d.counts[s] ?? 0;
                  if (n === 0) return null;
                  const pct = (n / d.total) * 100;
                  return (
                    <div
                      key={s}
                      className="flex items-center justify-center text-[10px] font-medium leading-none"
                      style={{
                        width: `${pct}%`,
                        minWidth: "14px",
                        background: COLOR[s],
                        color: TEXT_COLOR[s],
                      }}
                    >
                      {pct >= 14 ? n : ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Parish list */}
            <div className="divide-y divide-rule">
              {d.parishes.map((p) => (
                <div
                  key={p.slug}
                  className="px-4 py-2 flex items-center gap-3 text-sm"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: COLOR[p.endState] }}
                    title={END_STATE_LABEL[p.endState]}
                  />
                  <div className="flex-1 min-w-0">
                    {p.profileHref ? (
                      <Link
                        href={p.profileHref}
                        className="font-medium underline decoration-rule underline-offset-2 hover:decoration-inherit"
                      >
                        {p.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{p.name}</span>
                    )}
                    <span className="ml-2 text-xs text-muted">
                      {p.city}, {p.state}
                    </span>
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap hidden sm:inline">
                    {END_STATE_LABEL[p.endState]}
                  </span>
                  {p.hasAlert && (
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: "var(--mark-closed)" }}
                    >
                      Alert
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-10 text-sm text-muted border-t border-rule pt-4">
        Diocese assignments are resolved from historical source entries
        (Wolkovich, Michelsonas) and geographic city–diocese lookup.{" "}
        <Link href="/record" className="underline hover:text-foreground">
          See the full record
        </Link>
        .
      </p>
    </div>
  );
}
