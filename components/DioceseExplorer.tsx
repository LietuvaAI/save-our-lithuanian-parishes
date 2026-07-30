"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DioceseMap, {
  type DioceseMapCounts,
} from "@/components/DioceseMap";
import { EndStatePill } from "@/components/EndStatePill";
import type { EndState } from "@/lib/end-state";

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
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
        <DioceseMap
          counts={counts}
          selected={selected.shortName}
          onSelect={setSelectedName}
        />

        <aside className="border-l-4 border-rule pl-4">
          <label
            htmlFor="diocese-select"
            className="text-xs font-medium uppercase text-muted"
          >
            Inspect a diocese
          </label>
          <select
            id="diocese-select"
            value={selected.shortName}
            onChange={(event) => setSelectedName(event.target.value)}
            className="mt-1 w-full rounded-md border border-rule bg-background px-3 py-2 text-sm"
          >
            {dioceses.map((diocese) => (
              <option key={diocese.name} value={diocese.shortName}>
                {diocese.shortName} · {diocese.total}
              </option>
            ))}
          </select>

          <p className="mt-5 font-serif text-5xl font-semibold leading-none">
            {selected.ended} of {selected.total}
          </p>
          <h2 className="mt-2 font-serif text-xl font-semibold leading-tight">
            ended as Lithuanian parish life
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {selected.formalClosed} formally closed; {selected.transferred} live
            on in another community. {selected.active} remain active Lithuanian
            parishes
            {selected.unresolved > 0
              ? `; ${selected.unresolved} remain unresolved`
              : ""}
            .
          </p>

          <div className="mt-4 max-h-[25rem] divide-y divide-rule overflow-y-auto border-y border-rule">
            {selected.parishes.map((parish) => (
              <div key={parish.slug} className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {parish.profileHref ? (
                      <Link
                        href={parish.profileHref}
                        className="font-medium underline underline-offset-2 hover:text-accent"
                      >
                        {parish.name}
                      </Link>
                    ) : (
                      <span className="font-medium">{parish.name}</span>
                    )}
                    <p className="mt-0.5 text-xs text-muted">
                      {parish.city}, {parish.state}
                    </p>
                  </div>
                  <EndStatePill value={parish.endState} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
