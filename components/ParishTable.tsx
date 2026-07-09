"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MarkIcon } from "@/components/marks";
import {
  type Parish,
  type EndingMode,
  type Ownership,
  ENDING_MODE_LABEL,
  OWNERSHIP_SHORT,
  STATUS_LABEL,
} from "@/lib/parishes";

const ALL = "all";

export default function ParishTable({ parishes }: { parishes: Parish[] }) {
  const [query, setQuery] = useState("");
  const [ownership, setOwnership] = useState<Ownership | typeof ALL>(ALL);
  const [endingMode, setEndingMode] = useState<EndingMode | typeof ALL>(ALL);
  const [state, setState] = useState<string>(ALL);

  const states = useMemo(
    () => [...new Set(parishes.map((p) => p.state))].sort(),
    [parishes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parishes.filter(
      (p) =>
        (ownership === ALL || p.ownership === ownership) &&
        (endingMode === ALL || p.endingMode === endingMode) &&
        (state === ALL || p.state === state) &&
        (!q ||
          p.nameLt.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q))
    );
  }, [parishes, query, ownership, endingMode, state]);

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
          Ownership
          <select
            value={ownership}
            onChange={(e) => setOwnership(e.target.value as Ownership | typeof ALL)}
            className={selectClass}
          >
            <option value={ALL}>All</option>
            <option value="diocese_rc">Diocese-owned</option>
            <option value="national_catholic">National Catholic</option>
            <option value="other_self_owned">Lutheran, self-owned</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Outcome
          <select
            value={endingMode}
            onChange={(e) => setEndingMode(e.target.value as EndingMode | typeof ALL)}
            className={selectClass}
          >
            <option value={ALL}>All</option>
            <option value="diocese_closed">Closed by the diocese</option>
            <option value="standing">Still standing</option>
            <option value="community_decided">Community&rsquo;s own decision</option>
            <option value="undecided">Unresolved</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          State
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
        <span className="text-sm text-muted pb-1.5">
          {filtered.length} of {parishes.length} parishes
        </span>
      </div>

      <div className="overflow-x-auto border border-rule rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-rule">
              <th className="px-3 py-2 font-medium">Parish</th>
              <th className="px-3 py-2 font-medium">City</th>
              <th className="px-3 py-2 font-medium">St.</th>
              <th className="px-3 py-2 font-medium">Ownership</th>
              <th className="px-3 py-2 font-medium">Outcome</th>
              <th className="px-3 py-2 font-medium">Founded</th>
              <th className="px-3 py-2 font-medium">Closed</th>
              <th className="px-3 py-2 font-medium">Sources (Draugas)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.slug} className="border-b border-rule last:border-0 align-top">
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  <Link
                    href={`/parishes/${p.slug}`}
                    className="underline decoration-rule underline-offset-2 hover:decoration-inherit"
                  >
                    {p.nameLt}
                  </Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{p.city}</td>
                <td className="px-3 py-2">{p.state}</td>
                <td className="px-3 py-2">{OWNERSHIP_SHORT[p.ownership]}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <MarkIcon mode={p.endingMode} size={12} />
                    {ENDING_MODE_LABEL[p.endingMode]}
                  </span>
                  {p.endingMode === "diocese_closed" && p.status !== "closed" && (
                    <span className="block text-xs text-muted mt-0.5">
                      {STATUS_LABEL[p.status]}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">{p.yearFounded ?? "—"}</td>
                <td className="px-3 py-2">{p.yearClosed ?? "—"}</td>
                <td className="px-3 py-2 text-xs text-muted max-w-56">
                  {p.citations.map((c) => c.date).join(" · ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
