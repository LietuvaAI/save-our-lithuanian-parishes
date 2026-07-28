"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { type Ownership, OWNERSHIP_SHORT } from "@/lib/parishes";
import {
  type IdentityStatus,
  type AlertStatus,
  type FateStatus,
  IDENTITY_LABEL,
  IDENTITY_ORDER,
  ALERT_LABEL,
  ALERT_ORDER,
  FATE_LABEL,
  FATE_ORDER,
} from "@/lib/unified-status";
import { IdentityPill, AlertPill, FatePill } from "@/components/StatusPills";

/** One serializable row of the full research registry (built server-side). */
export interface RegistryRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  country: "US" | "CA";
  comparator: boolean;
  // Three unified dimensions
  identity: IdentityStatus;
  alert: AlertStatus;
  fate: FateStatus;
  // Additional fields
  ownership: Ownership | null;
  diocese: string | null;
  founded: string | null;
  closed: string | null;
  depth: "case-filed" | "multi-source" | "single-source";
  congregationClass:
    | "roman_catholic"
    | "national_catholic_pncc"
    | "non_catholic_christian"
    | "independent_catholic"
    | null;
  profileHref: string | null;
}

const ALL = "all";

// Compact ownership labels for table cells
const OWNERSHIP_CELL: Record<Ownership, string> = {
  diocese_rc: "Diocese",
  national_catholic: "Nat. Catholic",
  other_self_owned: "Lutheran",
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
  const [identity, setIdentity] = useState<IdentityStatus | typeof ALL>(ALL);
  const [alert, setAlert] = useState<AlertStatus | typeof ALL>(ALL);
  const [fate, setFate] = useState<FateStatus | typeof ALL>(ALL);
  const [ownership, setOwnership] = useState<Ownership | typeof ALL>(ALL);
  const [diocese, setDiocese] = useState<string>(ALL);

  const dioceseOptions = useMemo(() => {
    const present = [...new Set(rows.map((r) => r.diocese).filter(Boolean) as string[])].sort();
    return present.map((d) => ({ value: d, label: d.replace(/^(Arch)?diocese of /i, "") }));
  }, [rows]);

  // Only show filter options that exist in the data
  const identityOptions = useMemo(() => {
    const present = new Set(rows.map((r) => r.identity));
    return IDENTITY_ORDER.filter((v) => present.has(v)).map((v) => ({
      value: v,
      label: IDENTITY_LABEL[v],
    }));
  }, [rows]);

  const alertOptions = useMemo(() => {
    const present = new Set(rows.map((r) => r.alert));
    return ALERT_ORDER.filter((v) => present.has(v)).map((v) => ({
      value: v,
      label: ALERT_LABEL[v],
    }));
  }, [rows]);

  const fateOptions = useMemo(() => {
    const present = new Set(rows.map((r) => r.fate));
    return FATE_ORDER.filter((v) => present.has(v)).map((v) => ({
      value: v,
      label: FATE_LABEL[v],
    }));
  }, [rows]);

  const ownershipOptions = useMemo(() => {
    const present = new Set(rows.map((r) => r.ownership).filter(Boolean));
    const order: Ownership[] = [
      "diocese_rc",
      "national_catholic",
      "other_self_owned",
    ];
    return order
      .filter((o) => present.has(o))
      .map((o) => ({ value: o, label: OWNERSHIP_SHORT[o] }));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (identity === ALL || r.identity === identity) &&
        (alert === ALL || r.alert === alert) &&
        (fate === ALL || r.fate === fate) &&
        (ownership === ALL || r.ownership === ownership) &&
        (diocese === ALL || r.diocese === diocese) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q) ||
          (r.diocese?.toLowerCase().includes(q) ?? false))
    );
  }, [rows, query, identity, alert, fate, ownership, diocese]);

  const sc =
    "rounded-md border border-rule bg-background px-2 py-1.5 text-sm";

  const activeFilters = [
    identity !== ALL,
    alert !== ALL,
    fate !== ALL,
    ownership !== ALL,
    diocese !== ALL,
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
                setIdentity(ALL);
                setAlert(ALL);
                setFate(ALL);
                setOwnership(ALL);
                setDiocese(ALL);
              }}
              className="ml-2 underline text-accent cursor-pointer"
            >
              clear filters
            </button>
          )}
        </span>
      </div>

      <div className="overflow-x-auto border border-rule rounded-lg">
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[14%]" />
            <col className="w-[5%]" />
            <col className="w-[5%]" />
            <col className="w-[13%]" />
            <col className="w-[14%]" />
            <col className="w-[15%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="text-left border-b border-rule">
              <th className="px-2 py-2 font-medium text-xs uppercase tracking-wide text-muted">
                Parish
              </th>
              <th className="px-2 py-2">
                <HeaderFilter
                  label="Diocese"
                  value={diocese}
                  onChange={(v) => setDiocese(v)}
                  options={dioceseOptions}
                  allLabel="All dioceses"
                />
              </th>
              <th className="px-2 py-2 font-medium text-xs uppercase tracking-wide text-muted">
                Est.
              </th>
              <th className="px-2 py-2 font-medium text-xs uppercase tracking-wide text-muted">
                Cl.
              </th>
              <th className="px-2 py-2">
                <HeaderFilter
                  label="Identity"
                  value={identity}
                  onChange={(v) => setIdentity(v)}
                  options={identityOptions}
                />
              </th>
              <th className="px-2 py-2">
                <HeaderFilter
                  label="Alert"
                  value={alert}
                  onChange={(v) => setAlert(v)}
                  options={alertOptions}
                  allLabel="All (no filter)"
                />
              </th>
              <th className="px-2 py-2">
                <HeaderFilter
                  label="Building"
                  value={fate}
                  onChange={(v) => setFate(v)}
                  options={fateOptions}
                />
              </th>
              <th className="px-2 py-2">
                <HeaderFilter
                  label="Ownership"
                  value={ownership}
                  onChange={(v) => setOwnership(v)}
                  options={ownershipOptions}
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
                <td className="px-2 py-2 overflow-hidden">
                  <div className="font-medium truncate">
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
                  <span className="text-xs text-muted truncate block">
                    {r.city}, {r.state}
                  </span>
                  {r.comparator && (
                    <span className="ml-1 text-xs text-muted">(CA)</span>
                  )}
                </td>
                {/* Diocese */}
                <td className="px-2 py-2 text-xs text-muted truncate">
                  {r.diocese?.replace(/^(Arch)?diocese of /i, "") ?? "—"}
                </td>
                {/* Founded */}
                <td className="px-2 py-2 text-xs text-muted">
                  {r.founded ?? "—"}
                </td>
                {/* Closed */}
                <td className="px-2 py-2 text-xs text-muted">
                  {r.closed ?? "—"}
                </td>
                {/* Lithuanian Identity */}
                <td className="px-2 py-2">
                  <IdentityPill value={r.identity} />
                </td>
                {/* Alert Status */}
                <td className="px-2 py-2">
                  <AlertPill value={r.alert} />
                </td>
                {/* Building Fate */}
                <td className="px-2 py-2">
                  <FatePill value={r.fate} />
                </td>
                {/* Ownership */}
                <td className="px-2 py-2 text-xs text-muted truncate">
                  {r.ownership ? OWNERSHIP_CELL[r.ownership] : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
