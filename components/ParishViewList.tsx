import Link from "next/link";
import { EndStatePill } from "@/components/EndStatePill";
import {
  OWNERSHIP_SHORT,
  type Parish,
} from "@/lib/parishes";
import { resolveEndState } from "@/lib/end-state";

function endStateFor(parish: Parish) {
  const identity = parish.lithuanianIdentity;
  const isStanding =
    (parish.endingMode === "standing" && !parish.yearClosed) ||
    (!parish.yearClosed &&
      (identity === "active_parish" || identity === "mass_continues"));

  return resolveEndState(
    identity,
    parish.buildingFate,
    !!parish.yearClosed,
    isStanding,
    parish.endingMode,
  );
}

export default function ParishViewList({
  parishes,
  ownershipLabel,
}: {
  parishes: Parish[];
  ownershipLabel?: (parish: Parish) => string;
}) {
  return (
    <div className="mt-4 divide-y divide-rule border-y border-rule">
      {parishes.map((parish) => (
        <article key={parish.slug} className="py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link
                href={`/parishes/${parish.slug}`}
                className="font-serif text-lg font-semibold hover:underline"
              >
                {parish.nameLt}
              </Link>
              <p className="mt-0.5 text-sm text-muted">
                {parish.city}, {parish.state}
                {parish.yearFounded ? ` · Founded ${parish.yearFounded}` : ""}
                {parish.yearClosed ? ` · Closed ${parish.yearClosed}` : ""}
              </p>
            </div>
            <EndStatePill value={endStateFor(parish)} />
          </div>

          {parish.situation && (
            <p className="mt-2 text-sm leading-relaxed">{parish.situation}</p>
          )}

          <dl className="mt-2 grid gap-x-5 gap-y-1 text-xs text-muted sm:grid-cols-2">
            <div>
              <dt className="inline font-medium text-foreground">Ownership: </dt>
              <dd className="inline">
                {ownershipLabel?.(parish) ??
                  OWNERSHIP_SHORT[parish.ownership]}
              </dd>
            </div>
            {parish.currentUse && parish.currentUse !== "Unknown" && (
              <div>
                <dt className="inline font-medium text-foreground">Today: </dt>
                <dd className="inline">{parish.currentUse}</dd>
              </div>
            )}
          </dl>

          <Link
            href={`/parishes/${parish.slug}`}
            className="mt-2 inline-block text-xs underline underline-offset-2 hover:text-foreground"
          >
            See parish profile and sources →
          </Link>
        </article>
      ))}
    </div>
  );
}
