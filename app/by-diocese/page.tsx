import type { Metadata } from "next";
import Link from "next/link";
import registry from "@/data/registry-unified.json";
import alertsData from "@/data/alerts.json";
import {
  parishes as libParishes,
  type Ownership,
  type LithuanianIdentity,
  type BuildingFate,
} from "@/lib/parishes";
import {
  type IdentityStatus,
  type AlertStatus,
  type FateStatus,
  resolveAlertStatus,
  resolveIdentity,
  resolveFate,
  IDENTITY_LABEL,
  IDENTITY_COLOR,
  IDENTITY_TEXT,
  IDENTITY_ORDER,
  ALERT_LABEL,
  ALERT_COLOR,
  ALERT_TEXT,
  FATE_LABEL,
  FATE_COLOR,
  FATE_TEXT,
  FATE_ORDER,
} from "@/lib/unified-status";
import { StatusPills } from "@/components/StatusPills";

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
  record_depth: "case-filed" | "multi-source" | "single-source";
}

interface ParishRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  identity: IdentityStatus;
  alert: AlertStatus;
  fate: FateStatus;
  ownership: Ownership | null;
  profileHref: string | null;
}

interface DioceseSummary {
  name: string;
  shortName: string;
  parishes: ParishRow[];
  total: number;
  identityCounts: Record<IdentityStatus, number>;
  alertCounts: Record<AlertStatus, number>;
  fateCounts: Record<FateStatus, number>;
  identityLostCount: number;
  demolishedCount: number;
  standingCount: number;
  activeParishCount: number;
  hasAlerts: boolean;
}

// ── Build data ──────────────────────────────────────────────────────────────

// Alert lookups
const alertBySlug = new Map<string, "active" | "watch" | "building">();
for (const a of alertsData.alerts as { parishLink: string; kind: string }[]) {
  const slug = a.parishLink.replace(/^\/(parishes|registry)\//, "");
  alertBySlug.set(slug, a.kind as "active" | "watch" | "building");
}

const sustainBySlug = new Set<string>();
for (const sw of (
  (alertsData as Record<string, unknown>).sustainabilityWatch as
    | { parishLink: string }[]
    | undefined
) ?? []) {
  sustainBySlug.add(sw.parishLink.replace(/^\/(parishes|registry)\//, ""));
}

function buildDioceses(): DioceseSummary[] {
  const regs = (registry as { parishes: RegParish[] }).parishes.filter(
    (p) =>
      !(p.sources ?? []).some((s) =>
        /no parish/i.test(s.ethnic_status ?? "")
      ) &&
      p.country !== "CA" &&
      !/buenos aires|argentin|rosario/i.test(p.city ?? "")
  );

  // Group by diocese
  const byDiocese = new Map<string, ParishRow[]>();

  for (const p of regs) {
    const dioceseName = p.diocese ?? "Unassigned";
    const lib =
      p.c83_row != null ? libParishes[p.c83_row - 1] : undefined;
    const libOk = lib && lib.city === p.city;
    const slug = libOk ? lib.slug : p.slug;
    const alertKind = alertBySlug.get(slug) ?? null;
    const onSustWatch = sustainBySlug.has(slug);

    const row: ParishRow = {
      slug,
      name: p.names.lt || p.names.en || p.slug,
      city: p.city.replace(/\s*[(;].*$/, ""),
      state: p.state,
      identity: resolveIdentity(
        libOk ? (lib.lithuanianIdentity as LithuanianIdentity | null) : null
      ),
      alert: resolveAlertStatus(alertKind, onSustWatch),
      fate: resolveFate(
        libOk ? (lib.buildingFate as BuildingFate | null) : null
      ),
      ownership: libOk ? (lib.ownership as Ownership) : null,
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

  // Build summaries
  const summaries: DioceseSummary[] = [];

  for (const [name, parishes] of byDiocese) {
    const identityCounts = {} as Record<IdentityStatus, number>;
    const alertCounts = {} as Record<AlertStatus, number>;
    const fateCounts = {} as Record<FateStatus, number>;

    for (const s of IDENTITY_ORDER) identityCounts[s] = 0;
    identityCounts.unknown = identityCounts.unknown ?? 0;
    for (const s of FATE_ORDER) fateCounts[s] = 0;
    for (const s of [...FATE_ORDER, "unknown"] as FateStatus[])
      fateCounts[s] = fateCounts[s] ?? 0;
    alertCounts.active_campaign = 0;
    alertCounts.watched = 0;
    alertCounts.building_at_risk = 0;
    alertCounts.sustainability = 0;
    alertCounts.none = 0;

    for (const p of parishes) {
      identityCounts[p.identity]++;
      alertCounts[p.alert]++;
      fateCounts[p.fate]++;
    }

    summaries.push({
      name,
      shortName: name
        .replace(/^Archdiocese of /, "")
        .replace(/^Diocese of /, ""),
      parishes: parishes.sort((a, b) => a.name.localeCompare(b.name)),
      total: parishes.length,
      identityCounts,
      alertCounts,
      fateCounts,
      identityLostCount: identityCounts.lost ?? 0,
      demolishedCount: fateCounts.demolished ?? 0,
      standingCount: fateCounts.standing ?? 0,
      activeParishCount: identityCounts.active_parish ?? 0,
      hasAlerts:
        (alertCounts.active_campaign ?? 0) > 0 ||
        (alertCounts.watched ?? 0) > 0 ||
        (alertCounts.building_at_risk ?? 0) > 0,
    });
  }

  // Sort: most parishes first, then alphabetical
  summaries.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  return summaries;
}

// ── Micro bar ───────────────────────────────────────────────────────────────

function MicroBar({
  counts,
  labels,
  colors,
  textColors,
  order,
  total,
}: {
  counts: Record<string, number>;
  labels: Record<string, string>;
  colors: Record<string, string>;
  textColors: Record<string, string>;
  order: string[];
  total: number;
}) {
  if (total === 0) return null;
  return (
    <div className="flex rounded-md overflow-hidden h-5" title={
      order
        .filter((k) => (counts[k] ?? 0) > 0)
        .map((k) => `${labels[k]}: ${counts[k]}`)
        .join(", ")
    }>
      {order.map((k) => {
        const n = counts[k] ?? 0;
        if (n === 0) return null;
        const pct = (n / total) * 100;
        return (
          <div
            key={k}
            className="flex items-center justify-center text-[10px] font-medium leading-none"
            style={{
              width: `${pct}%`,
              minWidth: n > 0 ? "14px" : 0,
              background: colors[k],
              color: textColors[k],
            }}
          >
            {pct >= 12 ? n : ""}
          </div>
        );
      })}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function ByDiocesePage() {
  const dioceses = buildDioceses();
  const totalParishes = dioceses.reduce((s, d) => s + d.total, 0);
  const totalDioceses = dioceses.filter((d) => d.name !== "Unassigned").length;

  // Top-level aggregates
  const totalLost = dioceses.reduce((s, d) => s + d.identityLostCount, 0);
  const totalDemolished = dioceses.reduce((s, d) => s + d.demolishedCount, 0);
  const totalActive = dioceses.reduce((s, d) => s + d.activeParishCount, 0);
  const totalStanding = dioceses.reduce((s, d) => s + d.standingCount, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">By Diocese</h1>
      <div className="mt-3 space-y-4 leading-relaxed max-w-3xl">
        <p>
          {totalParishes} Lithuanian parishes across {totalDioceses} Catholic
          dioceses in the United States. This view shows which dioceses
          preserved their Lithuanian heritage parishes and which did not —
          and where active campaigns and sustainability concerns remain.
        </p>
        <p className="text-muted">
          Each diocese card shows the breakdown of Lithuanian identity (is the
          parish still culturally Lithuanian?) and building fate (what happened
          to the physical church?). The colored bars summarize the three
          dimensions from{" "}
          <Link href="/record" className="underline hover:text-foreground">
            the record
          </Link>
          .
        </p>
      </div>

      {/* Summary stats */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-rule p-4 text-center">
          <p className="font-serif text-3xl font-semibold">{totalDioceses}</p>
          <p className="mt-1 text-sm text-muted">Dioceses</p>
        </div>
        <div className="rounded-lg border border-rule p-4 text-center">
          <p className="font-serif text-3xl font-semibold">{totalActive}</p>
          <p className="mt-1 text-sm text-muted">Identity active</p>
        </div>
        <div className="rounded-lg border border-rule p-4 text-center">
          <p className="font-serif text-3xl font-semibold">{totalLost}</p>
          <p className="mt-1 text-sm text-muted">Identity lost</p>
        </div>
        <div className="rounded-lg border border-rule p-4 text-center">
          <p className="font-serif text-3xl font-semibold">{totalDemolished}</p>
          <p className="mt-1 text-sm text-muted">Buildings demolished</p>
        </div>
      </div>

      {/* Diocese cards */}
      <div className="mt-10 space-y-6">
        {dioceses.map((d) => (
          <section
            key={d.name}
            className="rounded-lg border border-rule overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-rule bg-foreground/[0.02]">
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <h2 className="font-serif text-lg font-semibold">
                  {d.name}
                </h2>
                <span className="text-sm text-muted">
                  {d.total} {d.total === 1 ? "parish" : "parishes"}
                </span>
              </div>

              {/* Mini stat row */}
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                {d.activeParishCount > 0 && (
                  <span>
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1"
                      style={{ background: "var(--mark-standing)" }}
                    />
                    {d.activeParishCount} identity active
                  </span>
                )}
                {d.identityLostCount > 0 && (
                  <span>
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1"
                      style={{ background: "var(--mark-closed)" }}
                    />
                    {d.identityLostCount} identity lost
                  </span>
                )}
                {d.demolishedCount > 0 && (
                  <span>{d.demolishedCount} demolished</span>
                )}
                {d.standingCount > 0 && (
                  <span>{d.standingCount} standing</span>
                )}
                {d.hasAlerts && (
                  <span className="font-medium" style={{ color: "var(--mark-closed)" }}>
                    Active alerts
                  </span>
                )}
              </div>

              {/* Micro bars */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted mb-0.5">
                    Lithuanian Identity
                  </p>
                  <MicroBar
                    counts={d.identityCounts}
                    labels={IDENTITY_LABEL}
                    colors={IDENTITY_COLOR}
                    textColors={IDENTITY_TEXT}
                    order={IDENTITY_ORDER}
                    total={d.total}
                  />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted mb-0.5">
                    Building Fate
                  </p>
                  <MicroBar
                    counts={d.fateCounts}
                    labels={FATE_LABEL}
                    colors={FATE_COLOR}
                    textColors={FATE_TEXT}
                    order={FATE_ORDER}
                    total={d.total}
                  />
                </div>
              </div>
            </div>

            {/* Parish list */}
            <div className="divide-y divide-rule">
              {d.parishes.map((p) => (
                <div
                  key={p.slug}
                  className="px-4 py-2 flex items-center gap-3 text-sm"
                >
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
                  <StatusPills
                    identity={p.identity}
                    alert={p.alert}
                    fate={p.fate}
                    compact
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-10 text-sm text-muted border-t border-rule pt-4">
        Diocese assignments are resolved from alerts data, historical source
        entries (Wolkovich, Michelsonas), and geographic city–diocese lookup.
        Every city falls in exactly one Catholic diocese.{" "}
        <Link href="/record" className="underline hover:text-foreground">
          See the full record
        </Link>
        .
      </p>
    </div>
  );
}
