"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EndStatePill } from "@/components/EndStatePill";
import type { EndState } from "@/lib/end-state";

export type CoalMatrixParish = {
  slug: string;
  profileHref: string;
  name: string;
  city: string;
  endState: EndState;
};

export type CoalMatrixCell = {
  id: string;
  ownership: string;
  outcome: "Ended" | "Standing" | "Unresolved";
  color: string;
  textColor?: string;
  parishes: CoalMatrixParish[];
};

export default function CoalRegionMatrix({
  cells,
}: {
  cells: CoalMatrixCell[];
}) {
  const [selectedId, setSelectedId] = useState(
    cells.find((cell) => cell.parishes.length > 0)?.id ?? cells[0]?.id ?? "",
  );
  const selected = useMemo(
    () => cells.find((cell) => cell.id === selectedId) ?? cells[0],
    [cells, selectedId],
  );
  const ownershipRows = [...new Set(cells.map((cell) => cell.ownership))];
  const outcomes: CoalMatrixCell["outcome"][] = [
    "Ended",
    "Standing",
    "Unresolved",
  ];

  if (!selected) return null;

  return (
    <div>
      <div
        className="grid grid-cols-[minmax(6.5rem,1fr)_repeat(3,minmax(3.5rem,0.7fr))] gap-2"
        role="group"
        aria-label="Coal-region parish ownership by institutional outcome"
      >
        <div />
        {outcomes.map((outcome) => (
          <div
            key={outcome}
            className="pb-1 text-center text-ui-label font-medium uppercase text-muted sm:text-small-copy"
          >
            {outcome}
          </div>
        ))}
        {ownershipRows.map((ownership) => (
          <div key={ownership} className="contents">
            <div className="flex items-center text-body-copy font-semibold">
              {ownership}
            </div>
            {outcomes.map((outcome) => {
              const cell = cells.find(
                (candidate) =>
                  candidate.ownership === ownership &&
                  candidate.outcome === outcome,
              )!;
              const selectedCell = selected.id === cell.id;
              return (
                <button
                  key={cell.id}
                  type="button"
                  aria-pressed={selectedCell}
                  onClick={() => setSelectedId(cell.id)}
                  className="min-h-20 rounded-md border px-2 py-3 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-foreground"
                  style={{
                    borderColor: selectedCell
                      ? "var(--foreground)"
                      : "var(--rule)",
                    backgroundColor:
                      cell.parishes.length > 0
                        ? cell.color
                        : "var(--band)",
                    color:
                      cell.parishes.length > 0
                        ? (cell.textColor ?? "var(--background)")
                        : "var(--muted)",
                    opacity:
                      cell.parishes.length > 0
                        ? selectedCell
                          ? 1
                          : 0.76
                        : 1,
                  }}
                >
                  <span className="block font-serif text-page-title font-semibold">
                    {cell.parishes.length}
                  </span>
                  <span className="mt-1 block text-ui-label">
                    {selectedCell ? "Selected" : "Inspect"}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-rule pt-4">
        <h3 className="font-serif text-subsection-title font-semibold">
          {selected.ownership} · {selected.outcome.toLowerCase()} ·{" "}
          {selected.parishes.length}
        </h3>
        {selected.parishes.length > 0 ? (
          <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
            {selected.parishes.map((parish) => (
              <div
                key={parish.slug}
                className="flex items-start justify-between gap-3 border-t border-rule py-3"
              >
                <div>
                  <Link
                    href={parish.profileHref}
                    className="font-medium underline underline-offset-2 hover:text-accent"
                  >
                    {parish.name}
                  </Link>
                  <p className="mt-0.5 text-small-copy text-muted">{parish.city}, PA</p>
                </div>
                <EndStatePill value={parish.endState} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-body-copy text-muted">No parish is in this cell.</p>
        )}
      </div>
    </div>
  );
}
