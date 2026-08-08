"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  END_STATE_COLOR,
  GROUP_LABEL,
  GROUP_ORDER,
  type EndStateGroup,
} from "@/lib/end-state";
import {
  type RecordSignal,
} from "@/lib/record-mark";

export type AllProfilesTimelineRow = {
  slug: string;
  canonicalName: string;
  lithuanianName: string;
  city: string;
  state: string;
  jurisdiction: string | null;
  founded: number | null;
  closed: number | null;
  statusGroup: EndStateGroup;
  recordType: "parish" | "misija" | "congregation";
  profileHref: string;
  signal: RecordSignal | null;
};

type SortMode = "az" | "earliest" | "latest-ending";

const START_YEAR = 1880;
const END_YEAR = 2026;
const YEAR_SPAN = END_YEAR - START_YEAR;
const AXIS_TICKS = Array.from(
  { length: Math.floor((END_YEAR - START_YEAR) / 20) + 1 },
  (_, index) => START_YEAR + index * 20,
);
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const rowLetter = (row: AllProfilesTimelineRow) => {
  const letter = row.canonicalName.normalize("NFD").match(/[A-Za-z]/)?.[0];
  return letter?.toUpperCase() ?? "#";
};

const yearPosition = (year: number) =>
  `${((Math.min(END_YEAR, Math.max(START_YEAR, year)) - START_YEAR) / YEAR_SPAN) * 100}%`;

const recordTypeSuffix = (recordType: AllProfilesTimelineRow["recordType"]) => {
  if (recordType === "misija") return "mission";
  if (recordType === "congregation") return "congregation";
  return null;
};

const signalLabel: Record<RecordSignal, string> = {
  active: "Active campaign",
  watch: "Current watch signal",
  building: "Building at risk",
};

const statusLabelForRow = (row: AllProfilesTimelineRow) => {
  if (row.statusGroup !== "active_parish") {
    return GROUP_LABEL[row.statusGroup];
  }
  if (row.recordType === "misija") return "Active Lithuanian mission";
  if (row.recordType === "congregation") {
    return "Active Lithuanian congregation";
  }
  return GROUP_LABEL.active_parish;
};

function TimelineGrid() {
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden>
      {AXIS_TICKS.map((year) => (
        <span
          key={year}
          className="absolute inset-y-0 border-l border-rule/70"
          style={{ left: yearPosition(year) }}
        />
      ))}
    </span>
  );
}

function TimelineAxis() {
  return (
    <div className="relative h-8">
      <TimelineGrid />
      {AXIS_TICKS.map((year) => (
        <span
          key={year}
          className={`timeline-year absolute bottom-1.5 text-ui-label text-muted ${
            year === START_YEAR ? "" : "-translate-x-1/2"
          }`}
          style={{ left: yearPosition(year) }}
        >
          {year}
        </span>
      ))}
    </div>
  );
}

function TimelineMark({ row }: { row: AllProfilesTimelineRow }) {
  const color = END_STATE_COLOR[row.statusGroup];
  const statusLabel = statusLabelForRow(row);
  const live =
    row.closed === null &&
    (row.statusGroup === "active_parish" ||
      row.statusGroup === "mass_continues");

  if (row.founded === null) {
    return (
      <>
        <span className="absolute inset-x-0 top-1/2 border-t border-rule" aria-hidden />
        <span
          className="absolute right-0 top-1/2 size-2.5 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-dashed bg-background"
          style={{ borderColor: color }}
          title="Founding year not established"
          aria-label="Founding year not established"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-ui-label text-muted">
          undated
        </span>
        {row.signal && (
          <span
            className="absolute right-0 top-1/2 size-2 -translate-x-3 -translate-y-1/2 rounded-full bg-accent"
            style={{ boxShadow: "0 0 0 3px rgba(125,31,31,0.18)" }}
            title={signalLabel[row.signal]}
            aria-label={signalLabel[row.signal]}
          />
        )}
      </>
    );
  }

  const end = row.closed ?? END_YEAR;
  const left = yearPosition(row.founded);
  const right = yearPosition(end);
  const startPercent = Number.parseFloat(left);
  const endPercent = Number.parseFloat(right);
  const width = `${Math.max(endPercent - startPercent, 0.7)}%`;

  return (
    <>
      <span className="absolute inset-x-0 top-1/2 border-t border-rule" aria-hidden />
      <span
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
        style={{ left, width, background: color }}
        title={`${row.founded}–${row.closed ?? "present"}: ${statusLabel}`}
      />
      <span
        className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ left, background: color }}
        aria-hidden
      />
      <span
        className="absolute top-1/2 -translate-x-full -translate-y-1/2 pr-1.5 font-mono text-ui-label text-muted"
        style={{ left }}
      >
        {row.founded}
      </span>
      <span
        className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${live ? "size-2.5 border-2 bg-background" : "size-1.5"}`}
        style={
          live
            ? { left: right, borderColor: color }
            : { left: right, background: color }
        }
        aria-hidden
      />
      {row.closed !== null ? (
        <span
          className="absolute top-1/2 -translate-y-1/2 pl-1.5 font-mono text-ui-label text-muted"
          style={{ left: right }}
        >
          {row.closed}
        </span>
      ) : null}
      {row.signal && (
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          style={{
            left: right,
            boxShadow: "0 0 0 3px rgba(125,31,31,0.18)",
          }}
          title={signalLabel[row.signal]}
          aria-label={signalLabel[row.signal]}
        />
      )}
    </>
  );
}

export default function AllProfilesTimeline({
  rows,
}: {
  rows: AllProfilesTimelineRow[];
}) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState("all");
  const [state, setState] = useState("all");
  const [jurisdiction, setJurisdiction] = useState("all");
  const [sort, setSort] = useState<SortMode>("az");

  const states = useMemo(
    () => [...new Set(rows.map((row) => row.state))].sort(),
    [rows],
  );
  const jurisdictions = useMemo(
    () =>
      [...new Set(rows.map((row) => row.jurisdiction).filter(Boolean) as string[])].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const result = rows.filter(
      (row) =>
        (letter === "all" || rowLetter(row) === letter) &&
        (state === "all" || row.state === state) &&
        (jurisdiction === "all" || row.jurisdiction === jurisdiction) &&
        (!normalizedQuery ||
          row.canonicalName.toLocaleLowerCase().includes(normalizedQuery) ||
          row.lithuanianName.toLocaleLowerCase().includes(normalizedQuery) ||
          row.city.toLocaleLowerCase().includes(normalizedQuery) ||
          row.state.toLocaleLowerCase().includes(normalizedQuery) ||
          row.jurisdiction?.toLocaleLowerCase().includes(normalizedQuery)),
    );

    return result.sort((a, b) => {
      if (sort === "earliest") {
        return (
          (a.founded ?? Number.POSITIVE_INFINITY) -
            (b.founded ?? Number.POSITIVE_INFINITY) ||
          a.canonicalName.localeCompare(b.canonicalName)
        );
      }
      if (sort === "latest-ending") {
        return (
          (b.closed ?? Number.NEGATIVE_INFINITY) -
            (a.closed ?? Number.NEGATIVE_INFINITY) ||
          a.canonicalName.localeCompare(b.canonicalName)
        );
      }
      return a.canonicalName.localeCompare(b.canonicalName, "en", {
        sensitivity: "base",
      });
    });
  }, [jurisdiction, letter, query, rows, sort, state]);

  const availableLetters = useMemo(
    () => new Set(rows.map((row) => rowLetter(row))),
    [rows],
  );

  const selectClass =
    "rounded-md border border-rule bg-background px-2.5 py-2 text-support-copy";
  const anyFilter =
    query.trim() !== "" ||
    letter !== "all" ||
    state !== "all" ||
    jurisdiction !== "all";
  const clearFilters = () => {
    setQuery("");
    setLetter("all");
    setState("all");
    setJurisdiction("all");
  };

  return (
    <div>
      <section
        className="sticky top-0 z-30 border-y border-rule bg-background/95 py-[9px] backdrop-blur"
        aria-label="Profile filters"
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, place, state, or diocese…"
            aria-label="Search all institution profiles"
            className={`${selectClass} w-full sm:w-72`}
          />
          <select
            value={state}
            onChange={(event) => setState(event.target.value)}
            aria-label="Filter by state"
            className={selectClass}
          >
            <option value="all">All states</option>
            {states.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={jurisdiction}
            onChange={(event) => setJurisdiction(event.target.value)}
            aria-label="Filter by diocese or archdiocese"
            className={selectClass}
          >
            <option value="all">All dioceses</option>
            {jurisdictions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            aria-label="Sort profiles"
            className={selectClass}
          >
            <option value="az">Sort: A–Z</option>
            <option value="earliest">Sort: Earliest</option>
            <option value="latest-ending">Sort: Latest ending</option>
          </select>
          {anyFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-support-copy font-semibold underline underline-offset-4 hover:text-accent"
            >
              Clear all
            </button>
          )}
        </div>

        <div
          className="mt-2 flex flex-nowrap items-center gap-1 overflow-x-auto sm:flex-wrap sm:overflow-visible"
          aria-label="A to Z profile index"
        >
          <span className="mr-2 shrink-0 text-ui-label font-semibold uppercase tracking-[0.15em] text-muted">
            A–Z
          </span>
          {LETTERS.map((optionLetter) => {
            const enabled = availableLetters.has(optionLetter);
            const selected = letter === optionLetter;
            return (
              <button
                key={optionLetter}
                type="button"
                disabled={!enabled}
                aria-pressed={selected}
                onClick={() => setLetter(selected ? "all" : optionLetter)}
                className={`size-6 shrink-0 rounded font-mono text-small-copy font-semibold disabled:opacity-25 ${
                  selected
                    ? "bg-accent text-white"
                    : "enabled:hover:bg-band enabled:hover:text-accent"
                }`}
              >
                {optionLetter}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-small-copy">
          <span className="font-medium">
            {filtered.length === rows.length
              ? `${rows.length} institutions`
              : `${filtered.length} of ${rows.length} institutions`}
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-small-copy text-muted" aria-label="Status colors">
            {GROUP_ORDER.map((group) => (
              <span key={group} className="inline-flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: END_STATE_COLOR[group] }}
                  aria-hidden
                />
                {group === "active_parish"
                  ? "Active Lithuanian community"
                  : GROUP_LABEL[group]}
              </span>
            ))}
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="border-b border-rule py-12 text-center">
          <h2 className="font-serif text-subsection-title font-semibold">No matching profiles</h2>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 text-support-copy font-semibold text-accent underline underline-offset-4"
          >
            Clear search and filters
          </button>
        </section>
      ) : (
        <div className="mt-3 overflow-x-auto border-y border-rule">
          <div className="min-w-[58rem]">
            <div className="grid grid-cols-[15rem_minmax(42rem,1fr)] border-b border-rule bg-background sm:grid-cols-[18.75rem_minmax(42rem,1fr)]">
              <div className="sticky left-0 z-20 flex items-end border-r border-rule bg-background px-2 pb-1.5 text-ui-label font-semibold uppercase tracking-[0.15em] text-muted">
                Institution
              </div>
              <TimelineAxis />
            </div>

            <ol className="divide-y divide-rule">
              {filtered.map((row) => {
                const suffix = recordTypeSuffix(row.recordType);
                const statusLabel = statusLabelForRow(row);
                return (
                  <li
                    key={row.slug}
                    id={`profile-${row.slug}`}
                    className="group grid min-h-11 scroll-mt-24 grid-cols-[15rem_minmax(42rem,1fr)] hover:bg-foreground/[0.025] sm:grid-cols-[18.75rem_minmax(42rem,1fr)]"
                  >
                    <div className="sticky left-0 z-20 border-r border-rule bg-background px-2 py-1.5 group-hover:bg-[color-mix(in_srgb,var(--background)_97%,var(--foreground))]">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`size-2 shrink-0 rounded-full ${
                            row.statusGroup === "unverified"
                              ? "border-2 bg-background"
                              : ""
                          }`}
                          style={
                            row.statusGroup === "unverified"
                              ? { borderColor: END_STATE_COLOR.unverified }
                              : { background: END_STATE_COLOR[row.statusGroup] }
                          }
                          title={statusLabel}
                          aria-label={statusLabel}
                        />
                        <div className="min-w-0">
                          <Link
                            href={row.profileHref}
                            title={row.canonicalName}
                            className="block truncate font-serif text-body-copy font-semibold leading-tight hover:text-accent"
                          >
                            {row.canonicalName}
                          </Link>
                          <span
                            title={`${row.lithuanianName} · ${row.city}, ${row.state}${suffix ? ` · ${suffix}` : ""}${row.jurisdiction ? ` · ${row.jurisdiction}` : ""}`}
                            className="mt-0.5 block truncate text-small-copy leading-tight text-muted"
                          >
                            {row.lithuanianName} · {row.city}, {row.state}
                            {suffix ? ` · ${suffix}` : ""}
                            {row.jurisdiction ? ` · ${row.jurisdiction}` : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={row.profileHref}
                      aria-label={`Open ${row.canonicalName} profile`}
                      className="relative block min-h-11 px-4"
                    >
                      <TimelineGrid />
                      <span className="absolute inset-x-4 top-1/2 h-0">
                        <TimelineMark row={row} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
