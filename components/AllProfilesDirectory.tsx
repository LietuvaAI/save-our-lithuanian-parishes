"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  END_STATE_COLOR,
  GROUP_DESCRIPTION,
  GROUP_LABEL,
  GROUP_ORDER,
  type EndStateGroup,
} from "@/lib/end-state";
import type {
  PublicationInstitutionClass,
  PublicationRecordType,
} from "@/lib/publication-projection";

export type AllProfilesDirectoryRow = {
  slug: string;
  canonicalName: string;
  lithuanianName: string;
  city: string;
  state: string;
  jurisdiction: string | null;
  founded: number | null;
  closed: number | null;
  statusGroup: EndStateGroup;
  recordType: PublicationRecordType;
  institutionClass: PublicationInstitutionClass;
  profileHref: string;
};

type DirectoryView = "outcome" | "az";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const collator = new Intl.Collator("lt", {
  sensitivity: "base",
  numeric: true,
});
const DIRECTORY_GROUP_DESCRIPTION: Record<EndStateGroup, string> = {
  ...GROUP_DESCRIPTION,
  active_parish:
    "The institution remains active in its Lithuanian identity. Roman Catholic parishes and missions, and Protestant congregations, share this canonical status group.",
  closed:
    "The Lithuanian institution has closed. Its former church may be standing, repurposed, demolished, or not yet established; physical outcomes are tracked separately in the building record.",
};

function rowLetter(row: AllProfilesDirectoryRow) {
  const letter = row.canonicalName.normalize("NFD").match(/[A-Za-z]/)?.[0];
  return letter?.toUpperCase() ?? "#";
}

function shortJurisdiction(value: string | null) {
  if (!value) return null;
  return value
    .replace(/^Roman Catholic Archdiocese of /, "Archdiocese of ")
    .replace(/^Roman Catholic Diocese of /, "Diocese of ");
}

function institutionLabel(row: AllProfilesDirectoryRow) {
  const recordType =
    row.recordType === "misija"
      ? "mission"
      : row.recordType === "congregation"
        ? "congregation"
        : "parish";

  if (row.institutionClass === "roman_catholic") {
    return `Roman Catholic ${recordType}`;
  }
  if (row.institutionClass === "national_catholic_pncc") {
    return `National Catholic (PNCC) ${recordType}`;
  }
  if (row.institutionClass === "independent_catholic") {
    return `Independent Catholic ${recordType}`;
  }
  return `Protestant ${recordType}`;
}

function yearLabel(row: AllProfilesDirectoryRow) {
  if (row.founded === null) return "undated";
  return `${row.founded}–${row.closed ?? ""}`;
}

function DirectoryEntry({ row }: { row: AllProfilesDirectoryRow }) {
  const jurisdiction = shortJurisdiction(row.jurisdiction);

  return (
    <li>
      <Link
        href={row.profileHref}
        className="group grid h-full grid-cols-[10px_minmax(0,1fr)] gap-2.5 border-t border-rule py-3 pr-3 hover:bg-band/45"
      >
        <span
          className={`mt-[5px] size-2.5 rounded-full ${
            row.statusGroup === "unverified" ? "border-2 bg-background" : ""
          }`}
          style={
            row.statusGroup === "unverified"
              ? { borderColor: END_STATE_COLOR.unverified }
              : { background: END_STATE_COLOR[row.statusGroup] }
          }
          aria-hidden
        />
        <span className="min-w-0">
          <span className="block font-serif text-card-title font-semibold leading-tight group-hover:text-accent">
            {row.canonicalName}
          </span>
          {row.lithuanianName !== row.canonicalName && (
            <span className="mt-0.5 block text-support-copy leading-tight text-muted">
              {row.lithuanianName}
            </span>
          )}
          <span className="mt-1.5 block text-support-copy leading-snug text-muted">
            {row.city}, {row.state}
            {jurisdiction ? ` · ${jurisdiction}` : ""}
          </span>
          <span className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-small-copy text-muted">
              {institutionLabel(row)}
            </span>
            <span className="font-mono text-small-copy text-foreground">
              {yearLabel(row)}
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

export default function AllProfilesDirectory({
  rows,
}: {
  rows: AllProfilesDirectoryRow[];
}) {
  const [view, setView] = useState<DirectoryView>("outcome");
  const [query, setQuery] = useState("");
  const [state, setState] = useState("all");
  const [jurisdiction, setJurisdiction] = useState("all");

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) =>
        collator.compare(a.canonicalName, b.canonicalName),
      ),
    [rows],
  );
  const states = useMemo(
    () => [...new Set(rows.map((row) => row.state))].sort(collator.compare),
    [rows],
  );
  const jurisdictions = useMemo(
    () =>
      [
        ...new Set(
          rows
            .map((row) => row.jurisdiction)
            .filter((value): value is string => Boolean(value)),
        ),
      ].sort(collator.compare),
    [rows],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return sortedRows.filter(
      (row) =>
        (state === "all" || row.state === state) &&
        (jurisdiction === "all" || row.jurisdiction === jurisdiction) &&
        (!normalizedQuery ||
          row.canonicalName.toLocaleLowerCase().includes(normalizedQuery) ||
          row.lithuanianName.toLocaleLowerCase().includes(normalizedQuery) ||
          row.city.toLocaleLowerCase().includes(normalizedQuery) ||
          row.state.toLocaleLowerCase().includes(normalizedQuery) ||
          row.jurisdiction?.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [jurisdiction, query, sortedRows, state]);

  const availableLetters = useMemo(
    () => new Set(filtered.map((row) => rowLetter(row))),
    [filtered],
  );
  const filtersActive =
    query.trim() !== "" || state !== "all" || jurisdiction !== "all";

  const clearFilters = () => {
    setQuery("");
    setState("all");
    setJurisdiction("all");
  };

  const goToLetter = (letter: string) => {
    setView("az");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document
          .getElementById(`profiles-letter-${letter}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const selectClass =
    "rounded-md border border-rule bg-background px-2.5 py-2 text-support-copy";

  return (
    <div>
      <section
        className="sticky top-0 z-30 border-y border-rule bg-background/95 py-[9px] backdrop-blur"
        aria-label="Profile directory controls"
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
          <div
            className="inline-flex rounded-md border border-rule bg-background p-0.5 text-support-copy font-semibold"
            role="group"
            aria-label="Choose directory view"
          >
            <button
              type="button"
              onClick={() => setView("outcome")}
              aria-pressed={view === "outcome"}
              className={`rounded px-3 py-1.5 ${
                view === "outcome"
                  ? "bg-foreground text-background"
                  : "text-muted hover:bg-band hover:text-foreground"
              }`}
            >
              By outcome
            </button>
            <button
              type="button"
              onClick={() => setView("az")}
              aria-pressed={view === "az"}
              className={`rounded px-3 py-1.5 ${
                view === "az"
                  ? "bg-foreground text-background"
                  : "text-muted hover:bg-band hover:text-foreground"
              }`}
            >
              A–Z
            </button>
          </div>
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
            className={`${selectClass} max-w-full`}
          >
            <option value="all">All dioceses</option>
            {jurisdictions.map((option) => (
              <option key={option} value={option}>
                {shortJurisdiction(option)}
              </option>
            ))}
          </select>
          <span className="ml-auto font-mono text-small-copy text-muted">
            {filtersActive
              ? `${filtered.length} / ${rows.length}`
              : `${rows.length}`}
          </span>
          {filtersActive && (
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
          aria-label="A to Z quick index"
        >
          <span className="mr-2 shrink-0 text-ui-label font-semibold uppercase tracking-[0.15em] text-muted">
            A–Z
          </span>
          {LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              disabled={!availableLetters.has(letter)}
              onClick={() => goToLetter(letter)}
              className="size-6 shrink-0 rounded font-mono text-small-copy font-semibold enabled:hover:bg-band enabled:hover:text-accent disabled:opacity-25"
              aria-label={`Go to profiles beginning with ${letter}`}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="border-b border-rule py-12 text-center">
          <h2 className="font-serif text-subsection-title font-semibold">
            No matching profiles
          </h2>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 text-support-copy font-semibold text-accent underline underline-offset-4"
          >
            Clear search and filters
          </button>
        </section>
      ) : view === "outcome" ? (
        <div>
          {GROUP_ORDER.map((group) => {
            const sectionRows = filtered.filter(
              (row) => row.statusGroup === group,
            );
            if (sectionRows.length === 0) return null;
            return (
              <section
                key={group}
                id={`profiles-outcome-${group}`}
                className="scroll-mt-40 pt-8"
              >
                <div className="flex items-baseline gap-2 border-b border-rule pb-2">
                  <span
                    className={`size-2.5 rounded-full ${
                      group === "unverified" ? "border-2 bg-background" : ""
                    }`}
                    style={
                      group === "unverified"
                        ? { borderColor: END_STATE_COLOR.unverified }
                        : { background: END_STATE_COLOR[group] }
                    }
                    aria-hidden
                  />
                  <h2 className="font-serif text-section-title font-semibold">
                    {GROUP_LABEL[group]}
                  </h2>
                  <span className="font-mono text-support-copy text-muted">
                    {sectionRows.length}
                  </span>
                </div>
                <p className="mt-2 max-w-[88ch] text-body-copy leading-relaxed text-muted">
                  {DIRECTORY_GROUP_DESCRIPTION[group]}
                </p>
                <ol className="mt-3 grid gap-x-5 lg:grid-cols-3">
                  {sectionRows.map((row) => (
                    <DirectoryEntry key={row.slug} row={row} />
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      ) : (
        <div>
          {LETTERS.map((letter) => {
            const sectionRows = filtered.filter(
              (row) => rowLetter(row) === letter,
            );
            if (sectionRows.length === 0) return null;
            return (
              <section
                key={letter}
                id={`profiles-letter-${letter}`}
                className="scroll-mt-40 pt-8"
              >
                <div className="flex items-baseline gap-3 border-b border-rule pb-2">
                  <h2 className="font-serif text-section-title font-semibold">
                    {letter}
                  </h2>
                  <span className="font-mono text-support-copy text-muted">
                    {sectionRows.length}
                  </span>
                </div>
                <ol className="mt-3 grid gap-x-5 lg:grid-cols-3">
                  {sectionRows.map((row) => (
                    <DirectoryEntry key={row.slug} row={row} />
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
