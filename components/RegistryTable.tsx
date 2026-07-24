"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MarkIcon } from "@/components/marks";
import { type EndingMode, ENDING_MODE_LABEL } from "@/lib/parishes";

/** Compact outcome labels so the table fits without horizontal cutoff. */
const ENDING_SHORT: Record<EndingMode, string> = {
  diocese_closed: "Diocese-closed",
  community_decided: "Community decision",
  standing: "Standing",
  undecided: "Unresolved",
};

export type ParishStatus = "open" | "threat" | "closed" | "unverified";

/** One serializable row of the full research registry (built server-side). */
export interface RegistryRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  country: "US" | "CA";
  comparator: boolean;
  status: ParishStatus;
  /** Verified ending from the locked core; null for registry-tier rows. */
  endingMode: EndingMode | null;
  founded: string | null;
  closed: string | null;
  depth: "case-filed" | "multi-source" | "single-source";
  congregationClass: "roman_catholic" | "national_catholic_pncc" | "non_catholic_christian" | null;
  /** URL to the parish profile page, or null if no profile page exists. */
  profileHref: string | null;
}

const ALL = "all";

const DEPTH_LABEL: Record<RegistryRow["depth"], string> = {
  "case-filed": "Case-filed",
  "multi-source": "Multi-source",
  "single-source": "Single-source",
};

const STATUS_DOT_COLOR: Record<ParishStatus, string> = {
  open: "var(--foreground)",
  threat: "var(--mark-community)",
  closed: "var(--mark-closed)",
  unverified: "var(--muted)",
};

function StatusDot({ status }: { status: ParishStatus }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: STATUS_DOT_COLOR[status],
        flexShrink: 0,
      }}
    />
  );
}

function DepthBadge({ depth }: { depth: RegistryRow["depth"] }) {
  const core = depth === "case-filed";
  return (
    <span
      className={`inline-block rounded px-1.5 py-px text-xs whitespace-nowrap ${
        core ? "font-semibold text-white" : "border border-rule text-muted"
      }`}
      style={core ? { background: "var(--mark-closed)" } : undefined}
      title={
        core
          ? "Full case file: verified in the locked Draugas 2008–2026 core, with a researched present-day record"
          : depth === "multi-source"
            ? "Attested by two or more independent research sources; being verified toward the core standard"
            : "Attested by one research source so far"
      }
    >
      {DEPTH_LABEL[depth]}
    </span>
  );
}

type CongClass = RegistryRow["congregationClass"] | typeof ALL;

const CONG_LABEL: Record<string, string> = {
  roman_catholic: "Catholic (Roman)",
  national_catholic_pncc: "National Catholic",
  non_catholic_christian: "Protestant",
};

export default function RegistryTable({ rows }: { rows: RegistryRow[] }) {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<RegistryRow["depth"] | typeof ALL>(ALL);
  const [state, setState] = useState<string>(ALL);
  const [status, setStatus] = useState<ParishStatus | typeof ALL>(ALL);
  const [congClass, setCongClass] = useState<CongClass>(ALL);

  const states = useMemo(
    () => [...new Set(rows.map((r) => r.state))].sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (depth === ALL || r.depth === depth) &&
        (state === ALL || r.state === state) &&
        (status === ALL || r.status === status) &&
        (congClass === ALL || (r.congregationClass ?? "roman_catholic") === congClass) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q))
    );
  }, [rows, query, depth, state, status, congClass]);

  const selectClass =
    "rounded-md border border-rule bg-background px-2 py-1.5 text-sm";

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <label className="flex flex-col gap-1 text-xs text-muted">
          Search
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Parish or city…"
            className={`${selectClass} w-44`}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Documentation
          <select
            value={depth}
            onChange={(e) =>
              setDepth(e.target.value as RegistryRow["depth"] | typeof ALL)
            }
            className={selectClass}
          >
            <option value={ALL}>All depths</option>
            <option value="case-filed">Case-filed (full depth)</option>
            <option value="multi-source">Multi-source</option>
            <option value="single-source">Single-source</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          State/Prov.
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={selectClass}
          >
            <option value={ALL}>All</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Status
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as ParishStatus | typeof ALL)
            }
            className={selectClass}
          >
            <option value={ALL}>All statuses</option>
            <option value="open">Open · standing</option>
            <option value="threat">Under threat</option>
            <option value="closed">Closed</option>
            <option value="unverified">Being verified</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Congregation
          <select
            value={congClass ?? ALL}
            onChange={(e) => setCongClass(e.target.value as CongClass)}
            className={selectClass}
          >
            <option value={ALL}>All types</option>
            <option value="roman_catholic">Catholic (Roman)</option>
            <option value="national_catholic_pncc">National Catholic</option>
            <option value="non_catholic_christian">Protestant</option>
          </select>
        </label>
        <span className="text-sm text-muted pb-1.5">
          {filtered.length} of {rows.length} parishes
        </span>
      </div>

      <div className="overflow-x-auto border border-rule rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-rule">
              <th className="px-2 py-2 font-medium">Parish</th>
              <th className="px-2 py-2 font-medium">City</th>
              <th className="px-2 py-2 font-medium">St.</th>
              <th className="px-2 py-2 font-medium">Outcome</th>
              <th className="px-2 py-2 font-medium">Founded</th>
              <th className="px-2 py-2 font-medium">Closed</th>
              <th className="px-2 py-2 font-medium">Depth</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.slug}
                className="border-b border-rule last:border-0 align-top"
              >
                <td className="px-2 py-2 font-medium">
                  {r.profileHref !== null ? (
                    <Link
                      href={r.profileHref}
                      className="underline decoration-rule underline-offset-2 hover:decoration-inherit"
                    >
                      {r.name}
                    </Link>
                  ) : (
                    r.name
                  )}
                  {r.comparator && (
                    <span className="block text-xs text-muted">
                      Canadian comparator
                    </span>
                  )}
                </td>
                <td className="px-2 py-2">{r.city}</td>
                <td className="px-2 py-2">{r.state}</td>
                <td className="px-2 py-2">
                  {r.endingMode ? (
                    <span
                      className="inline-flex items-center gap-1.5 whitespace-nowrap"
                      title={ENDING_MODE_LABEL[r.endingMode]}
                    >
                      <StatusDot status={r.status} />
                      <MarkIcon mode={r.endingMode} size={12} />
                      {ENDING_SHORT[r.endingMode]}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-muted">
                      <StatusDot status={r.status} />
                      being verified
                    </span>
                  )}
                </td>
                <td className="px-2 py-2">{r.founded ?? "—"}</td>
                <td className="px-2 py-2">{r.closed ?? "—"}</td>
                <td className="px-2 py-2">
                  <DepthBadge depth={r.depth} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
