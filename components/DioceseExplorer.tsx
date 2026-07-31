"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DioceseMap, {
  type DioceseMapCounts,
} from "@/components/DioceseMap";
import { EndStateDot } from "@/components/EndStatePill";
import {
  END_STATE_SHORT,
  type EndState,
} from "@/lib/end-state";

export type DioceseExplorerParish = {
  slug: string;
  name: string;
  city: string;
  state: string;
  founded: number | null;
  closed: number | null;
  endState: EndState;
  profileHref: string | null;
};

export type DioceseExplorerEntry = {
  name: string;
  shortName: string;
  total: number;
  ended: number;
  formalClosed: number;
  transferred: number;
  active: number;
  unresolved: number;
  parishes: DioceseExplorerParish[];
};

export default function DioceseExplorer({
  dioceses,
}: {
  dioceses: DioceseExplorerEntry[];
}) {
  const [selectedName, setSelectedName] = useState(
    dioceses[0]?.shortName ?? "",
  );
  const selected = useMemo(
    () =>
      dioceses.find((diocese) => diocese.shortName === selectedName) ??
      dioceses[0],
    [dioceses, selectedName],
  );
  const counts = useMemo(
    () =>
      Object.fromEntries(
        dioceses.map((diocese) => [
          diocese.shortName,
          {
            total: diocese.total,
            ended: diocese.ended,
            formalClosed: diocese.formalClosed,
            transferred: diocese.transferred,
            alive: diocese.active,
          },
        ]),
      ) as DioceseMapCounts,
    [dioceses],
  );

  if (!selected) return null;

  return (
    <div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.65fr)]">
        <DioceseMap
          counts={counts}
          selected={selected.shortName}
          onSelect={setSelectedName}
        />

        <aside
          className="border-t border-rule pt-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0"
          aria-label="Diocese navigator"
        >
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="diocese-select"
              className="text-[11px] font-medium uppercase tracking-widest text-muted"
            >
              Diocese navigator
            </label>
            <span className="text-[11px] text-muted">
              {selected.total} parish records
            </span>
          </div>
          <select
            id="diocese-select"
            value={selected.shortName}
            onChange={(event) => setSelectedName(event.target.value)}
            className="mt-2 w-full rounded-md border border-rule bg-background px-2.5 py-1.5 text-xs"
          >
            {dioceses.map((diocese) => (
              <option key={diocese.name} value={diocese.shortName}>
                {diocese.shortName} · {diocese.total}
              </option>
            ))}
          </select>

          <div className="mt-3 border-y border-rule py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              {selected.name}
            </p>
            <div className="mt-1 flex items-end justify-between gap-3">
              <h2 className="max-w-[12rem] text-sm font-semibold leading-snug">
                Lithuanian parish life ended
              </h2>
              <p className="shrink-0 font-serif text-2xl font-semibold leading-none">
                {selected.ended}
                <span className="ml-1 font-sans text-[11px] font-normal text-muted">
                  of {selected.total}
                </span>
              </p>
            </div>
          </div>

          <div
            className="mt-2 grid grid-cols-2 gap-1 text-[11px]"
            aria-label={`${selected.shortName} outcome summary`}
          >
            {[
              {
                label: "Formally closed",
                count: selected.formalClosed,
                color: "var(--es-closed)",
              },
              {
                label: "Lives on",
                count: selected.transferred,
                color: "var(--es-transferred)",
              },
              {
                label: "Active",
                count: selected.active,
                color: "var(--es-active)",
              },
              {
                label: "Unresolved",
                count: selected.unresolved,
                color: "var(--mark-ink)",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex min-h-7 items-center justify-between gap-2 rounded-md border-l-2 bg-band px-2 py-1"
                style={{ borderColor: item.color }}
              >
                <span className="leading-tight text-muted">{item.label}</span>
                <span className="font-semibold text-foreground">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Parish records
            </p>
            <span className="text-[10px] text-muted">Select to open</span>
          </div>
          <div className="mt-1 max-h-[23rem] divide-y divide-rule overflow-y-auto border-y border-rule">
            {selected.parishes.map((parish) => (
              <div key={parish.slug} className="py-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {parish.profileHref ? (
                      <Link
                        href={parish.profileHref}
                        className="text-xs font-medium leading-snug underline underline-offset-2 hover:text-accent"
                      >
                        {parish.name}
                      </Link>
                    ) : (
                      <span className="text-xs font-medium leading-snug">
                        {parish.name}
                      </span>
                    )}
                    <p className="mt-0.5 text-[10px] text-muted">
                      {parish.city}, {parish.state}
                    </p>
                  </div>
                  <span className="inline-flex max-w-[7rem] shrink-0 items-center gap-1 text-right text-[10px] leading-tight text-muted">
                    <EndStateDot value={parish.endState} />
                    {END_STATE_SHORT[parish.endState]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
