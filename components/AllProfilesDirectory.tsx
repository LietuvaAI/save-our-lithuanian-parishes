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

type DirectoryView = "tradition" | "outcome" | "az";

type TraditionGroup = {
  value: PublicationInstitutionClass;
  label: string;
  description: string;
};

const TRADITION_GROUPS: TraditionGroup[] = [
  {
    value: "roman_catholic",
    label: "Roman Catholic parishes and missions",
    description:
      "Roman Catholic parishes and missions form the historical institution census used by the Parish & Mission Status view.",
  },
  {
    value: "national_catholic_pncc",
    label: "National Catholic (PNCC) communities",
    description:
      "Lithuanian communities affiliated with the Polish National Catholic Church are listed separately from Roman Catholic institutions.",
  },
  {
    value: "independent_catholic",
    label: "Independent Catholic communities",
    description:
      "Catholic communities outside the Roman Catholic and PNCC jurisdictions are preserved as their own tradition.",
  },
  {
    value: "non_catholic_christian",
    label: "Protestant congregations",
    description:
      "Lithuanian Protestant congregations are part of the 155-profile public record but not the Roman Catholic outcome population.",
  },
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const collator = new Intl.Collator("lt", {
  sensitivity: "base",
  numeric: true,
});
const DIRECTORY_GROUP_DESCRIPTION: Record<EndStateGroup, string> = {
  ...GROUP_DESCRIPTION,
  active_parish:
    "The institution remains active in its Lithuanian identity. Roman Catholic parishes and missions, and Protestant congregations, share this status group.",
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
        className="group flex h-full items-start gap-[9px] rounded border-b border-[#f4f1ea] px-2 py-2 hover:bg-band/45 dark:border-rule"
      >
        <span
          className={`mt-[5px] size-2 shrink-0 rounded-full ${
            row.statusGroup === "unverified" ? "border bg-background" : ""
          }`}
          style={
            row.statusGroup === "unverified"
              ? { borderColor: END_STATE_COLOR.unverified }
              : { background: END_STATE_COLOR[row.statusGroup] }
          }
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block text-body-copy font-semibold leading-[1.3] group-hover:text-accent">
            {row.canonicalName}
          </span>
          <span className="block text-small-copy leading-[1.4] text-muted">
            {row.city}, {row.state}
            {jurisdiction ? ` · ${jurisdiction}` : ""}
          </span>
          <span className="block text-ui-label leading-[1.4] text-muted">
            {institutionLabel(row)}
          </span>
        </span>
        <span className="mt-0.5 shrink-0 whitespace-nowrap font-mono text-ui-label leading-[1.4] text-muted">
          {yearLabel(row)}
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
  const [view, setView] = useState<DirectoryView>("tradition");
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
    "h-[37px] rounded-md border border-rule bg-background px-3 text-body-copy font-medium";

  return (
    <div>
      <section
        className="sticky top-0 z-30 mt-[14px] border-y border-rule bg-background/95 px-4 pb-[9px] pt-[10px] backdrop-blur sm:px-11"
        aria-label="Profile directory controls"
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search parish, city, state, or diocese…"
            aria-label="Search all institution profiles"
            className="w-full rounded-md border border-rule bg-background px-3 py-[9px] text-directory-control sm:w-[280px]"
          />
          <div
            className="inline-flex overflow-hidden rounded-md border border-rule bg-background text-support-copy font-medium"
            role="group"
            aria-label="Choose directory view"
          >
            <button
              type="button"
              onClick={() => setView("tradition")}
              aria-pressed={view === "tradition"}
              className={`px-[14px] py-2 ${
                view === "tradition"
                  ? "bg-foreground text-background"
                  : "text-muted hover:bg-band hover:text-foreground"
              }`}
            >
              By tradition
            </button>
            <button
              type="button"
              onClick={() => setView("outcome")}
              aria-pressed={view === "outcome"}
              className={`border-l border-rule px-[14px] py-2 ${
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
              className={`border-l border-rule px-[14px] py-2 ${
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
          <span className="font-mono text-directory-description text-muted">
            {filtersActive
              ? `${filtered.length} / ${rows.length}`
              : `${rows.length} institutions`}
          </span>
          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-body-copy font-medium underline underline-offset-2 hover:text-accent"
            >
              Clear all
            </button>
          )}
        </div>

        <div
          className="mt-2 flex flex-nowrap items-center gap-0.5 overflow-x-auto sm:flex-wrap sm:overflow-visible"
          aria-label="A to Z quick index"
        >
          {LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              disabled={!availableLetters.has(letter)}
              onClick={() => goToLetter(letter)}
              className="size-[23px] shrink-0 rounded-[5px] font-mono text-directory-footnote enabled:hover:bg-band enabled:hover:text-accent disabled:opacity-25"
              aria-label={`Go to profiles beginning with ${letter}`}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>

      <div className="px-4 pb-3 pt-2 sm:px-11">
        {filtered.length === 0 ? (
          <section className="py-11 text-center">
            <h2 className="font-serif text-directory-empty font-semibold">
              No matching profiles
            </h2>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 text-directory-control font-medium text-accent underline underline-offset-2"
            >
              Clear search and filters
            </button>
          </section>
        ) : view === "tradition" ? (
          <div>
            {TRADITION_GROUPS.map((group) => {
              const sectionRows = filtered.filter(
                (row) => row.institutionClass === group.value,
              );
              if (sectionRows.length === 0) return null;
              return (
                <section
                  key={group.value}
                  id={`profiles-tradition-${group.value}`}
                  className="scroll-mt-40 pb-1.5 pt-[22px]"
                >
                  <div className="flex items-baseline gap-2.5 border-b-2 border-foreground pb-2">
                    <h2 className="font-serif text-directory-section font-semibold">
                      {group.label}
                    </h2>
                    <span className="font-mono text-support-copy text-muted">
                      {sectionRows.length}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[760px] text-directory-description text-[#57534e] dark:text-muted">
                    {group.description}
                  </p>
                  <ol className="grid gap-x-7 pt-1.5 lg:grid-cols-3">
                    {sectionRows.map((row) => (
                      <DirectoryEntry key={row.slug} row={row} />
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
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
                  className="scroll-mt-40 pb-1.5 pt-[22px]"
                >
                  <div className="flex items-baseline gap-2.5 border-b-2 border-foreground pb-2">
                    <span
                      className={`size-2.5 rounded-full ${
                        group === "unverified"
                          ? "border-2 bg-background"
                          : ""
                      }`}
                      style={
                        group === "unverified"
                          ? { borderColor: END_STATE_COLOR.unverified }
                          : { background: END_STATE_COLOR[group] }
                      }
                      aria-hidden
                    />
                    <h2 className="font-serif text-directory-section font-semibold">
                      {GROUP_LABEL[group]}
                    </h2>
                    <span className="font-mono text-support-copy text-muted">
                      {sectionRows.length}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[760px] text-directory-description text-[#57534e] dark:text-muted">
                    {DIRECTORY_GROUP_DESCRIPTION[group]}
                  </p>
                  <ol className="grid gap-x-7 pt-1.5 lg:grid-cols-3">
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
                  className="scroll-mt-40 pb-1.5 pt-[22px]"
                >
                  <div className="flex items-baseline gap-2.5 border-b-2 border-foreground pb-2">
                    <h2 className="font-serif text-directory-section font-semibold">
                      {letter}
                    </h2>
                    <span className="font-mono text-support-copy text-muted">
                      {sectionRows.length}
                    </span>
                  </div>
                  <ol className="grid gap-x-7 pt-1.5 lg:grid-cols-3">
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
    </div>
  );
}
