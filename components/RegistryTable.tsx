"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  type EndingMode,
  type Ownership,
  type LithuanianIdentity,
  type BuildingFate,
  OWNERSHIP_SHORT,
  LITHUANIAN_IDENTITY_LABEL,
  BUILDING_FATE_LABEL,
} from "@/lib/parishes";

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
  endingMode: EndingMode | null;
  founded: string | null;
  closed: string | null;
  depth: "case-filed" | "multi-source" | "single-source";
  congregationClass:
    | "roman_catholic"
    | "national_catholic_pncc"
    | "non_catholic_christian"
    | null;
  ownership: Ownership | null;
  lithuanianIdentity: LithuanianIdentity | null;
  buildingFate: BuildingFate | null;
  profileHref: string | null;
}

const ALL = "all";

// Compact labels for table cells
const OWNERSHIP_CELL: Record<Ownership, string> = {
  diocese_rc: "Diocese",
  national_catholic: "Nat. Catholic",
  other_self_owned: "Lutheran",
};

const IDENTITY_CELL: Record<LithuanianIdentity, string> = {
  active_parish: "Active",
  mass_continues: "Mass continues",
  ethnically_transferred: "Transferred",
  lost: "Lost",
};

const FATE_CELL: Record<BuildingFate, string> = {
  demolished: "Demolished",
  standing: "Standing",
  repurposed_religious: "Repurposed (rel.)",
  repurposed_secular: "Repurposed (sec.)",
  derelict: "Derelict",
  unknown: "Unknown",
};

const STATUS_CELL: Record<ParishStatus, string> = {
  open: "Open",
  threat: "Under threat",
  closed: "Closed",
  unverified: "Unverified",
};

const STATUS_DOT_COLOR: Record<ParishStatus, string> = {
  open: "var(--mark-standing, var(--foreground))",
  threat: "var(--mark-community)",
  closed: "var(--mark-closed)",
  unverified: "var(--muted)",
};

// ── Dropdown filter in column header ──

function HeaderFilter<T extends string>({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: T | typeof ALL;
  onChange: (v: T | typeof ALL) => void;
  options: { value: T; label: string }[];
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = value !== ALL;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-xs uppercase tracking-wide font-medium cursor-pointer whitespace-nowrap ${
          active ? "text-accent" : "text-muted"
        }`}
      >
        {label}
        <span className="text-[10px]">{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-background border border-rule rounded-md shadow-md py-1 min-w-max">
          <button
            type="button"
            onClick={() => {
              onChange(ALL as T | typeof ALL);
              setOpen(false);
            }}
            className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-foreground/5 ${
              !active ? "font-semibold" : ""
            }`}
          >
            {allLabel ?? "All"}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-foreground/5 ${
                value === opt.value ? "font-semibold" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main table ──

export default function RegistryTable({ rows }: { rows: RegistryRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ParishStatus | typeof ALL>(ALL);
  const [congClass, setCongClass] = useState<
    RegistryRow["congregationClass"] | typeof ALL
  >(ALL);
  const [ownership, setOwnership] = useState<Ownership | typeof ALL>(ALL);
  const [litId, setLitId] = useState<LithuanianIdentity | typeof ALL>(ALL);
  const [buildingFate, setBuildingFate] = useState<BuildingFate | typeof ALL>(
    ALL
  );
  const [state, setState] = useState<string>(ALL);

  const states = useMemo(
    () => [...new Set(rows.map((r) => r.state))].sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (status === ALL || r.status === status) &&
        (congClass === ALL ||
          (r.congregationClass ?? "roman_catholic") === congClass) &&
        (ownership === ALL || r.ownership === ownership) &&
        (litId === ALL || r.lithuanianIdentity === litId) &&
        (buildingFate === ALL || r.buildingFate === buildingFate) &&
        (state === ALL || r.state === state) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q))
    );
  }, [rows, query, status, congClass, ownership, litId, buildingFate, state]);

  const sc =
    "rounded-md border border-rule bg-background px-2 py-1.5 text-sm";

  const activeFilters = [
    status !== ALL,
    congClass !== ALL,
    ownership !== ALL,
    litId !== ALL,
    buildingFate !== ALL,
    state !== ALL,
    query.trim() !== "",
  ].filter(Boolean).length;

  return (
    <div>
      {/* Search + count bar */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parish, city, or state…"
          className={`${sc} w-64`}
        />
        <span className="text-sm text-muted">
          {filtered.length} of {rows.length}
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus(ALL);
                setCongClass(ALL);
                setOwnership(ALL);
                setLitId(ALL);
                setBuildingFate(ALL);
                setState(ALL);
              }}
              className="ml-2 underline text-accent cursor-pointer"
            >
              clear filters
            </button>
          )}
        </span>
      </div>

      <div className="overflow-x-auto border border-rule rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-rule">
              <th className="px-2 py-2 font-medium text-xs uppercase tracking-wide text-muted">
                Parish
              </th>
              <th className="px-2 py-2">
                <HeaderFilter
                  label="St."
                  value={state}
                  onChange={(v) => setState(v)}
                  options={states.map((s) => ({ value: s, label: s }))}
                  allLabel="All states"
                />
              </th>
              <th className="px-2 py-2 font-medium text-xs uppercase tracking-wide text-muted">
                Est.
              </th>
              <th className="px-2 py-2 font-medium text-xs uppercase tracking-wide text-muted">
                Closed
              </th>
              <th className="px-2 py-2">
                <HeaderFilter
                  label="Status"
                  value={status}
                  onChange={(v) => setStatus(v)}
                  options={[
                    { value: "open" as ParishStatus, label: "Open" },
                    { value: "threat" as ParishStatus, label: "Under threat" },
                    { value: "closed" as ParishStatus, label: "Closed" },
                    {
                      value: "unverified" as ParishStatus,
                      label: "Being verified",
                    },
                  ]}
                />
              </th>
              <th className="px-2 py-2">
                <HeaderFilter
                  label="Ownership"
                  value={ownership}
                  onChange={(v) => setOwnership(v)}
                  options={[
                    {
                      value: "diocese_rc" as Ownership,
                      label: OWNERSHIP_SHORT.diocese_rc,
                    },
                    {
                      value: "national_catholic" as Ownership,
                      label: OWNERSHIP_SHORT.national_catholic,
                    },
                    {
                      value: "other_self_owned" as Ownership,
                      label: OWNERSHIP_SHORT.other_self_owned,
                    },
                  ]}
                />
              </th>
              <th className="px-2 py-2">
                <HeaderFilter
                  label="Identity"
                  value={litId}
                  onChange={(v) => setLitId(v)}
                  options={[
                    {
                      value: "active_parish" as LithuanianIdentity,
                      label: LITHUANIAN_IDENTITY_LABEL.active_parish,
                    },
                    {
                      value: "mass_continues" as LithuanianIdentity,
                      label: LITHUANIAN_IDENTITY_LABEL.mass_continues,
                    },
                    {
                      value: "ethnically_transferred" as LithuanianIdentity,
                      label: LITHUANIAN_IDENTITY_LABEL.ethnically_transferred,
                    },
                    {
                      value: "lost" as LithuanianIdentity,
                      label: LITHUANIAN_IDENTITY_LABEL.lost,
                    },
                  ]}
                />
              </th>
              <th className="px-2 py-2">
                <HeaderFilter
                  label="Building"
                  value={buildingFate}
                  onChange={(v) => setBuildingFate(v)}
                  options={[
                    {
                      value: "standing" as BuildingFate,
                      label: BUILDING_FATE_LABEL.standing,
                    },
                    {
                      value: "demolished" as BuildingFate,
                      label: BUILDING_FATE_LABEL.demolished,
                    },
                    {
                      value: "repurposed_religious" as BuildingFate,
                      label: BUILDING_FATE_LABEL.repurposed_religious,
                    },
                    {
                      value: "repurposed_secular" as BuildingFate,
                      label: BUILDING_FATE_LABEL.repurposed_secular,
                    },
                    {
                      value: "derelict" as BuildingFate,
                      label: BUILDING_FATE_LABEL.derelict,
                    },
                    {
                      value: "unknown" as BuildingFate,
                      label: BUILDING_FATE_LABEL.unknown,
                    },
                  ]}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.slug}
                className="border-b border-rule last:border-0 align-top"
              >
                {/* Parish + City */}
                <td className="px-2 py-2">
                  <div className="font-medium">
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
                  </div>
                  <span className="text-xs text-muted">{r.city}</span>
                  {r.comparator && (
                    <span className="ml-1 text-xs text-muted">(CA)</span>
                  )}
                </td>
                {/* State */}
                <td className="px-2 py-2">{r.state}</td>
                {/* Founded */}
                <td className="px-2 py-2 text-muted">
                  {r.founded ?? "—"}
                </td>
                {/* Closed */}
                <td className="px-2 py-2 text-muted">
                  {r.closed ?? "—"}
                </td>
                {/* Status */}
                <td className="px-2 py-2">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: STATUS_DOT_COLOR[r.status],
                        flexShrink: 0,
                      }}
                    />
                    <span className="text-xs">{STATUS_CELL[r.status]}</span>
                  </span>
                </td>
                {/* Ownership */}
                <td className="px-2 py-2 text-xs text-muted whitespace-nowrap">
                  {r.ownership ? OWNERSHIP_CELL[r.ownership] : "—"}
                </td>
                {/* Lithuanian Identity */}
                <td className="px-2 py-2 text-xs whitespace-nowrap">
                  {r.lithuanianIdentity ? (
                    <span
                      style={{
                        color:
                          r.lithuanianIdentity === "active_parish"
                            ? "var(--mark-standing, var(--foreground))"
                            : r.lithuanianIdentity === "lost"
                              ? "var(--mark-closed)"
                              : "var(--muted)",
                      }}
                    >
                      {IDENTITY_CELL[r.lithuanianIdentity]}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                {/* Building Fate */}
                <td className="px-2 py-2 text-xs whitespace-nowrap">
                  {r.buildingFate ? (
                    <span
                      style={{
                        color:
                          r.buildingFate === "demolished"
                            ? "var(--mark-closed)"
                            : r.buildingFate === "standing"
                              ? "var(--mark-standing, var(--foreground))"
                              : "var(--muted)",
                      }}
                    >
                      {FATE_CELL[r.buildingFate]}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
