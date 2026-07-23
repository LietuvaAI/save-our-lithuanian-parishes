"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MarkIcon } from "@/components/marks";
import {
  ENDING_MODE_LABEL,
  LITHUANIAN_IDENTITY_LABEL,
  OWNERSHIP_SHORT,
  type EndingMode,
  type LithuanianIdentity,
  type Ownership,
} from "@/lib/parishes";

export interface FilterableParish {
  slug: string;
  nameLt: string;
  city: string;
  state: string;
  endingMode: EndingMode;
  ownership: Ownership;
  lithuanianIdentity: LithuanianIdentity | null;
  institutionType: string;
  yearFounded: number | null;
  yearClosed: number | null;
  coalRegion: boolean;
  hasRecord: boolean;
}

const ALL = "all";

const STATE_NAME: Record<string, string> = {
  CA: "California",
  CT: "Connecticut",
  IA: "Iowa",
  IL: "Illinois",
  IN: "Indiana",
  MA: "Massachusetts",
  MD: "Maryland",
  MI: "Michigan",
  MO: "Missouri",
  NE: "Nebraska",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NY: "New York",
  OH: "Ohio",
  PA: "Pennsylvania",
  RI: "Rhode Island",
};

export default function ParishFilters({
  parishes,
}: {
  parishes: FilterableParish[];
}) {
  const [query, setQuery] = useState("");
  const [identity, setIdentity] = useState<LithuanianIdentity | typeof ALL>(
    ALL
  );
  const [ownership, setOwnership] = useState<Ownership | typeof ALL>(ALL);
  const [ending, setEnding] = useState<EndingMode | typeof ALL>(ALL);
  const [state, setState] = useState<string>(ALL);

  const states = useMemo(
    () => [...new Set(parishes.map((p) => p.state))].sort(),
    [parishes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parishes.filter(
      (p) =>
        (identity === ALL || p.lithuanianIdentity === identity) &&
        (ownership === ALL || p.ownership === ownership) &&
        (ending === ALL || p.endingMode === ending) &&
        (state === ALL || p.state === state) &&
        (!q ||
          p.nameLt.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q))
    );
  }, [parishes, query, identity, ownership, ending, state]);

  // Group by state for display
  const byState = useMemo(() => {
    const map = new Map<string, FilterableParish[]>();
    for (const p of filtered) {
      const list = map.get(p.state) ?? [];
      list.push(p);
      map.set(p.state, list);
    }
    return map;
  }, [filtered]);

  const sortedStates = [...byState.keys()].sort();

  const selectClass =
    "rounded-md border border-rule bg-background px-2 py-1.5 text-sm";

  const activeFilters =
    identity !== ALL || ownership !== ALL || ending !== ALL || state !== ALL || query;

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-end mb-6">
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
          Lithuanian identity
          <select
            value={identity}
            onChange={(e) =>
              setIdentity(e.target.value as LithuanianIdentity | typeof ALL)
            }
            className={selectClass}
          >
            <option value={ALL}>All</option>
            <option value="active_parish">
              {LITHUANIAN_IDENTITY_LABEL.active_parish}
            </option>
            <option value="mass_continues">
              {LITHUANIAN_IDENTITY_LABEL.mass_continues}
            </option>
            <option value="ethnically_transferred">
              {LITHUANIAN_IDENTITY_LABEL.ethnically_transferred}
            </option>
            <option value="lost">{LITHUANIAN_IDENTITY_LABEL.lost}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Ownership
          <select
            value={ownership}
            onChange={(e) =>
              setOwnership(e.target.value as Ownership | typeof ALL)
            }
            className={selectClass}
          >
            <option value={ALL}>All</option>
            <option value="diocese_rc">{OWNERSHIP_SHORT.diocese_rc}</option>
            <option value="national_catholic">
              {OWNERSHIP_SHORT.national_catholic}
            </option>
            <option value="other_self_owned">
              {OWNERSHIP_SHORT.other_self_owned}
            </option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Outcome
          <select
            value={ending}
            onChange={(e) =>
              setEnding(e.target.value as EndingMode | typeof ALL)
            }
            className={selectClass}
          >
            <option value={ALL}>All</option>
            <option value="diocese_closed">
              {ENDING_MODE_LABEL.diocese_closed}
            </option>
            <option value="standing">{ENDING_MODE_LABEL.standing}</option>
            <option value="community_decided">
              {ENDING_MODE_LABEL.community_decided}
            </option>
            <option value="undecided">{ENDING_MODE_LABEL.undecided}</option>
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
                {STATE_NAME[s] ?? s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-muted mb-4">
        {filtered.length} of {parishes.length} parishes
        {activeFilters ? " match" : ""}
      </p>

      <div className="space-y-10">
        {sortedStates.map((st) => {
          const list = [...byState.get(st)!].sort((a, b) =>
            a.city.localeCompare(b.city)
          );
          return (
            <section key={st}>
              <h2 className="font-serif text-xl font-semibold border-b border-rule pb-2">
                {STATE_NAME[st] ?? st}{" "}
                <span className="text-muted text-sm font-normal">
                  · {list.length}{" "}
                  {list.length === 1 ? "parish" : "parishes"}
                </span>
              </h2>
              <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {list.map((p) => {
                  const showIdentity =
                    p.lithuanianIdentity &&
                    p.lithuanianIdentity !== "active_parish" &&
                    p.lithuanianIdentity !== "lost";
                  return (
                    <li key={p.slug}>
                      <Link
                        href={`/parishes/${p.slug}`}
                        className="group flex items-baseline gap-2 py-1"
                      >
                        <span className="shrink-0 translate-y-px">
                          <MarkIcon mode={p.endingMode} />
                        </span>
                        <span>
                          <span className="font-medium group-hover:underline">
                            {p.nameLt}
                          </span>{" "}
                          <span className="text-sm text-muted">
                            — {p.city} ·{" "}
                            {ENDING_MODE_LABEL[p.endingMode]}
                            {p.yearFounded && p.yearClosed
                              ? ` · ${p.yearFounded}–${p.yearClosed}`
                              : p.yearFounded
                                ? ` · founded ${p.yearFounded}`
                                : p.yearClosed
                                  ? ` · lost ${p.yearClosed}`
                                  : ""}
                          </span>
                          {showIdentity && (
                            <span className="ml-1.5 rounded border border-rule px-1.5 py-px text-xs text-muted">
                              {LITHUANIAN_IDENTITY_LABEL[p.lithuanianIdentity!]}
                            </span>
                          )}
                          {p.hasRecord && (
                            <span className="ml-1.5 rounded border border-rule px-1.5 py-px text-xs text-muted">
                              present record
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
