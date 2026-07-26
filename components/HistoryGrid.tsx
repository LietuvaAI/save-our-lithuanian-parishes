"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// End-state classification — combines identity + building fate into a single
// human-readable category answering "what happened to this parish?"
// ---------------------------------------------------------------------------

export type EndState =
  | "active_parish"
  | "mass_continues"
  | "transferred"
  | "demolished"
  | "repurposed"
  | "lost"
  | "unverified";

export interface HistoryParish {
  slug: string;
  name: string;
  city: string;
  state: string;
  diocese: string | null;
  founded: number | null;
  closed: number | null;
  endState: EndState;
  profileHref: string | null;
}

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

export const END_STATE_LABEL: Record<EndState, string> = {
  active_parish: "Active Lithuanian parish",
  mass_continues: "Lithuanian Mass continues",
  transferred: "Ethnically transferred",
  demolished: "Closed — demolished",
  repurposed: "Closed — repurposed",
  lost: "Closed",
  unverified: "Not yet verified",
};

const END_STATE_SHORT: Record<EndState, string> = {
  active_parish: "Active",
  mass_continues: "Mass continues",
  transferred: "Transferred",
  demolished: "Demolished",
  repurposed: "Repurposed",
  lost: "Closed",
  unverified: "Unverified",
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HistoryGrid({
  parishes,
}: {
  parishes: HistoryParish[];
}) {
  const router = useRouter();

  // Group by diocese, sorted by parish count (most first)
  const groups = useMemo(() => {
    const map = new Map<string, HistoryParish[]>();
    for (const p of parishes) {
      const key = p.diocese ?? "Diocese unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([diocese, ps]) => ({
        diocese,
        parishes: ps.sort(
          (a, b) =>
            (a.founded ?? 9999) - (b.founded ?? 9999) ||
            a.name.localeCompare(b.name),
        ),
      }));
  }, [parishes]);

  // Summary counts
  const counts = useMemo(() => {
    const c: Record<EndState, number> = {
      active_parish: 0,
      mass_continues: 0,
      transferred: 0,
      demolished: 0,
      repurposed: 0,
      lost: 0,
      unverified: 0,
    };
    for (const p of parishes) c[p.endState]++;
    return c;
  }, [parishes]);

  return (
    <div>
      {/* ── Summary bar ── */}
      <div className="flex rounded-lg overflow-hidden h-8 mb-6">
        {END_STATE_ORDER.filter((s) => counts[s] > 0).map((s) => (
          <div
            key={s}
            className="flex items-center justify-center text-xs font-medium"
            style={{
              flex: counts[s],
              background: COLOR[s],
              color: TEXT_COLOR[s],
            }}
            title={`${END_STATE_LABEL[s]}: ${counts[s]}`}
          >
            {counts[s] >= 8 && counts[s]}
          </div>
        ))}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm mb-8">
        {END_STATE_ORDER.filter((s) => counts[s] > 0).map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1.5"
          >
            <span
              className="inline-block w-3.5 h-3.5 rounded-sm"
              style={{ background: COLOR[s] }}
            />
            {END_STATE_LABEL[s]}{" "}
            <span className="text-muted">({counts[s]})</span>
          </span>
        ))}
      </div>

      {/* ── Diocese groups ── */}
      <div className="space-y-6">
        {groups.map(({ diocese, parishes: ps }) => {
          const shortName = diocese.replace(
            /^(Arch)?diocese of /i,
            "",
          );
          return (
            <section key={diocese}>
              <h3 className="font-serif text-base font-semibold mb-1.5 flex items-baseline gap-2">
                {shortName}
                <span className="text-sm font-normal text-muted">
                  &mdash; {ps.length}
                </span>
              </h3>
              <div className="space-y-px">
                {ps.map((p) => {
                  const opacity =
                    p.endState === "unverified" ? 0.45 : 0.85;
                  return (
                    <div
                      key={p.slug}
                      className="flex items-center gap-3 rounded px-3 py-1.5 cursor-pointer transition-opacity hover:opacity-100"
                      style={{
                        background: COLOR[p.endState],
                        color: TEXT_COLOR[p.endState],
                        opacity,
                      }}
                      onClick={() =>
                        p.profileHref &&
                        router.push(p.profileHref)
                      }
                      title={`${p.name} — ${p.city}, ${p.state}`}
                    >
                      <span className="font-medium truncate min-w-0 flex-1 text-sm">
                        {p.name}
                      </span>
                      <span className="tabular-nums whitespace-nowrap text-xs opacity-80">
                        {p.founded ?? "?"}
                        &ndash;
                        {p.closed ?? "present"}
                      </span>
                      <span className="text-xs whitespace-nowrap opacity-70 hidden sm:inline w-24 text-right">
                        {END_STATE_SHORT[p.endState]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
