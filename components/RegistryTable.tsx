"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { type Ownership, OWNERSHIP_SHORT } from "@/lib/parishes";
import {
  type AlertStatus,
  type FateStatus,
  ALERT_LABEL,
  ALERT_ORDER,
  FATE_LABEL,
  FATE_ORDER,
} from "@/lib/unified-status";
import { AlertPill, FatePill } from "@/components/StatusPills";
import { EndStatePill } from "@/components/EndStatePill";
import {
  GROUP_LABEL,
  GROUP_ORDER,
  type EndState,
  type EndStateGroup,
} from "@/lib/end-state";

/** One serializable row of the canonical public profile directory. */
export interface RegistryRow {
  slug: string;
  name: string;
  city: string;
  state: string;
  country: "US" | "CA" | "AR";
  recordType: string;
  comparator: boolean;
  // Canonical institutional status plus two independent current/property axes.
  endState: EndState;
  statusGroup: EndStateGroup;
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

function dateSummary(row: RegistryRow) {
  if (row.founded && row.closed) return `${row.founded}–${row.closed}`;
  if (row.founded) return `Founded ${row.founded}`;
  if (row.closed) return `Closed ${row.closed}`;
  return "Not yet verified";
}

function recordTypeSuffix(row: RegistryRow) {
  if (row.recordType === "misija") return " · mission";
  if (row.recordType === "congregation") return " · congregation";
  return "";
}

// ── Dropdown filter ──

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
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex h-9 items-center gap-2 rounded-md border px-3 text-body-copy font-medium cursor-pointer whitespace-nowrap transition-colors ${
          active
            ? "border-accent bg-accent/5 text-accent"
            : "border-rule bg-background text-foreground hover:border-muted"
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${
            active ? "bg-accent" : "bg-muted/40"
          }`}
        />
        {label}
        <span aria-hidden="true" className="text-[10px] text-muted">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1 z-50 max-h-72 min-w-52 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-md border border-rule bg-background py-1 shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onChange(ALL as T | typeof ALL);
              setOpen(false);
            }}
            className={`block w-full text-left px-3 py-1.5 text-body-copy hover:bg-foreground/5 ${
              !active ? "font-semibold" : ""
            }`}
          >
            {allLabel ?? "All"}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="menuitem"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-1.5 text-body-copy hover:bg-foreground/5 ${
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

export default function RegistryTable({
  rows,
  noun = "records",
}: {
  rows: RegistryRow[];
  noun?: "records" | "profiles";
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EndStateGroup | typeof ALL>(ALL);
  const [alert, setAlert] = useState<AlertStatus | typeof ALL>(ALL);
  const [fate, setFate] = useState<FateStatus | typeof ALL>(ALL);
  const [ownership, setOwnership] = useState<Ownership | typeof ALL>(ALL);
  const [diocese, setDiocese] = useState<string>(ALL);

  const dioceseOptions = useMemo(() => {
    const present = [...new Set(rows.map((r) => r.diocese).filter(Boolean) as string[])].sort();
    return present.map((d) => ({ value: d, label: d.replace(/^(Arch)?diocese of /i, "") }));
  }, [rows]);

  // Only show filter options that exist in the data
  const statusOptions = useMemo(() => {
    const present = new Set(rows.map((r) => r.statusGroup));
    return GROUP_ORDER.filter((v) => present.has(v)).map((v) => ({
      value: v,
      label: GROUP_LABEL[v],
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
        (status === ALL || r.statusGroup === status) &&
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
  }, [rows, query, status, alert, fate, ownership, diocese]);

  const sc =
    "rounded-md border border-rule bg-background px-2 py-1.5 text-body-copy";

  const activeFilters = [
    status !== ALL,
    alert !== ALL,
    fate !== ALL,
    ownership !== ALL,
    diocese !== ALL,
    query.trim() !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setQuery("");
    setStatus(ALL);
    setAlert(ALL);
    setFate(ALL);
    setOwnership(ALL);
    setDiocese(ALL);
  };

  return (
    <div>
      <div className="border-y border-rule py-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parish, city, state, or diocese…"
            aria-label="Search the profile directory"
            className={`${sc} w-full sm:w-80`}
          />
          <span className="text-body-copy font-medium">
            {activeFilters > 0
              ? `${filtered.length} of ${rows.length} ${noun}`
              : `${rows.length} ${noun}`}
          </span>
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-body-copy font-medium text-accent underline underline-offset-2 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2.5 sm:justify-between lg:justify-start">
          <HeaderFilter
            label="Status"
            value={status}
            onChange={(v) => setStatus(v)}
            options={statusOptions}
          />
          <HeaderFilter
            label="Current signal"
            value={alert}
            onChange={(v) => setAlert(v)}
            options={alertOptions}
            allLabel="All (no filter)"
          />
          <HeaderFilter
            label="Building"
            value={fate}
            onChange={(v) => setFate(v)}
            options={fateOptions}
          />
          <HeaderFilter
            label="Ownership"
            value={ownership}
            onChange={(v) => setOwnership(v)}
            options={ownershipOptions}
          />
          <HeaderFilter
            label="Diocese"
            value={diocese}
            onChange={(v) => setDiocese(v)}
            options={dioceseOptions}
            allLabel="All dioceses"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 border-y border-rule py-10 text-center">
          <p className="font-serif text-section-title font-semibold">No matching records</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 text-body-copy font-medium text-accent underline underline-offset-2 cursor-pointer"
          >
            Clear search and filters
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 hidden overflow-hidden rounded-md border border-rule lg:block">
            <table className="w-full table-fixed text-body-copy">
              <colgroup>
                <col className="w-[26%]" />
                <col className="w-[15%]" />
                <col className="w-[12%]" />
                <col className="w-[26%]" />
                <col className="w-[21%]" />
              </colgroup>
              <thead className="bg-[var(--band)]">
                <tr className="border-b border-rule text-left">
                  <th className="px-4 py-3 text-small-copy font-semibold uppercase tracking-wide text-muted">
                    Profile
                  </th>
                  <th className="px-4 py-3 text-small-copy font-semibold uppercase tracking-wide text-muted">
                    Diocese
                  </th>
                  <th className="px-4 py-3 text-small-copy font-semibold uppercase tracking-wide text-muted">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-small-copy font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>
                  <th className="px-4 py-3 text-small-copy font-semibold uppercase tracking-wide text-muted">
                    Property
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.slug}
                    className="border-b border-rule align-top transition-colors last:border-0 hover:bg-foreground/[0.025]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold leading-snug">
                        {r.profileHref !== null ? (
                          <Link
                            href={r.profileHref}
                            className="underline decoration-rule underline-offset-3 hover:text-accent hover:decoration-accent"
                          >
                            {r.name}
                          </Link>
                        ) : (
                          r.name
                        )}
                      </div>
                      <span className="mt-0.5 block text-small-copy text-muted">
                        {r.city}, {r.state}
                        {r.comparator ? " · Canada" : ""}
                        {recordTypeSuffix(r)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-small-copy leading-relaxed text-muted">
                      {r.diocese?.replace(/^(Arch)?diocese of /i, "") ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-small-copy text-muted">
                      {dateSummary(r)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-2">
                        <EndStatePill
                          value={r.endState}
                          label={
                            r.recordType === "misija" &&
                            r.endState === "active_parish"
                              ? "Active Lithuanian mission"
                              : undefined
                          }
                        />
                        <AlertPill value={r.alert} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-2">
                        <FatePill value={r.fate} />
                        <span className="text-small-copy text-muted">
                          {r.ownership
                            ? OWNERSHIP_CELL[r.ownership]
                            : "Ownership unverified"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-5 divide-y divide-rule border-y border-rule lg:hidden">
            {filtered.map((r) => (
              <li key={r.slug} className="py-4">
                <div className="font-semibold leading-snug">
                  {r.profileHref !== null ? (
                    <Link
                      href={r.profileHref}
                      className="underline decoration-rule underline-offset-3 hover:text-accent hover:decoration-accent"
                    >
                      {r.name}
                    </Link>
                  ) : (
                    r.name
                  )}
                </div>
                <div className="mt-0.5 text-body-copy text-muted">
                  {r.city}, {r.state}
                  {r.comparator ? " · Canada" : ""}
                  {recordTypeSuffix(r)}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <EndStatePill
                    value={r.endState}
                    label={
                      r.recordType === "misija" &&
                      r.endState === "active_parish"
                        ? "Active Lithuanian mission"
                        : undefined
                    }
                  />
                  <AlertPill value={r.alert} />
                  <FatePill value={r.fate} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-small-copy min-[520px]:grid-cols-3">
                  <div>
                    <dt className="text-muted">Diocese</dt>
                    <dd className="mt-0.5">
                      {r.diocese?.replace(/^(Arch)?diocese of /i, "") ??
                        "Not verified"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Dates</dt>
                    <dd className="mt-0.5">{dateSummary(r)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Ownership</dt>
                    <dd className="mt-0.5">
                      {r.ownership
                        ? OWNERSHIP_CELL[r.ownership]
                        : "Not verified"}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
