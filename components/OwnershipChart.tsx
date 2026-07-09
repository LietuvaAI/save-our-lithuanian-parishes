"use client";

import { useState } from "react";
import { MarkShape, MarkIcon } from "@/components/marks";
import {
  type Parish,
  ENDING_MODE_ORDER,
  ENDING_MODE_LABEL,
  OWNERSHIP_LABEL,
  STATUS_LABEL,
} from "@/lib/parishes";

/**
 * Panel A of the „Kam priklauso bažnyčia?" infographic, interactive:
 * every U.S. parish as one mark, grouped by who holds the deed, in the
 * infographic's shape language. Community-owned marks are drawn larger,
 * as in the original — six parishes carry the counter-case.
 */

// Direct-label the named cases, per the infographic brief.
const LABELED = new Set([
  "sv-jurgio-shenandoah-pa",
  "ausros-vartu-manhattan-ny",
  "sv-petro-boston-ma",
  "dievo-apvaizdos-scranton-pa",
]);

function sortKey(p: Parish) {
  return [ENDING_MODE_ORDER.indexOf(p.endingMode), p.state, p.city].join("|");
}

const CELL = 34;
const COLS = 11;

function UnitGrid({
  parishes,
  markR,
  cols,
  onHover,
  hovered,
}: {
  parishes: Parish[];
  markR: number;
  cols: number;
  onHover: (p: Parish | null) => void;
  hovered: Parish | null;
}) {
  const rows = Math.ceil(parishes.length / cols);
  const cell = markR * 2.9;
  return (
    <svg
      viewBox={`0 0 ${cols * cell} ${rows * cell}`}
      className="h-auto"
      style={{ width: `${cols * CELL}px`, maxWidth: "100%" }}
      role="group"
    >
      {parishes.map((p, i) => {
        const x = (i % cols) * cell + cell / 2;
        const y = Math.floor(i / cols) * cell + cell / 2;
        const active = hovered?.slug === p.slug;
        const labeled = LABELED.has(p.slug);
        return (
          <g key={p.slug}>
            {labeled && (
              <circle
                cx={x}
                cy={y}
                r={markR * 1.4}
                fill="none"
                stroke="var(--foreground)"
                strokeWidth={1.4}
              />
            )}
            <MarkShape
              mode={p.endingMode}
              x={x}
              y={y}
              r={active ? markR * 1.25 : markR}
              tabIndex={0}
              role="button"
              aria-label={`${p.nameLt}, ${p.city} ${p.state} — ${ENDING_MODE_LABEL[p.endingMode]}`}
              onMouseEnter={() => onHover(p)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(p)}
              onBlur={() => onHover(null)}
              className="cursor-pointer focus:outline-none"
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function OwnershipChart({ parishes }: { parishes: Parish[] }) {
  const [hovered, setHovered] = useState<Parish | null>(null);

  const diocese = parishes
    .filter((p) => p.ownership === "diocese_rc")
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const community = parishes
    .filter((p) => p.ownership !== "diocese_rc")
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

  const dioceseClosed = diocese.filter((p) => p.endingMode === "diocese_closed").length;
  const communityClosed = community.filter((p) => p.endingMode === "diocese_closed").length;

  return (
    <div>
      <div className="grid gap-10 sm:grid-cols-[3fr_1fr]">
        <section>
          <h3 className="font-serif text-lg font-semibold">
            Diocese-owned <span className="text-muted font-normal">— {diocese.length} parishes</span>
          </h3>
          <p className="text-sm mt-1" style={{ color: "var(--mark-closed)" }}>
            {dioceseClosed} closed by the diocese
          </p>
          <div className="mt-3">
            <UnitGrid
              parishes={diocese}
              markR={10}
              cols={COLS}
              onHover={setHovered}
              hovered={hovered}
            />
          </div>
        </section>

        <section>
          <h3 className="font-serif text-lg font-semibold">
            Community-owned <span className="text-muted font-normal">— {community.length}</span>
          </h3>
          <p className="text-sm mt-1">
            {communityClosed} closed by any outside authority
          </p>
          <div className="mt-3">
            <UnitGrid
              parishes={community}
              markR={14}
              cols={3}
              onHover={setHovered}
              hovered={hovered}
            />
          </div>
        </section>
      </div>

      <div
        className="mt-8 min-h-16 rounded-lg border border-rule px-4 py-3 text-sm"
        aria-live="polite"
      >
        {hovered ? (
          <div>
            <span className="font-serif font-semibold text-base">
              {hovered.nameLt}
            </span>{" "}
            <span className="text-muted">
              — {hovered.city}, {hovered.state}
            </span>
            <div className="text-muted mt-0.5">
              {OWNERSHIP_LABEL[hovered.ownership]} ·{" "}
              {ENDING_MODE_LABEL[hovered.endingMode]}
              {hovered.endingMode === "diocese_closed" &&
                hovered.status !== "closed" &&
                ` (${STATUS_LABEL[hovered.status].toLowerCase()})`}
              {hovered.yearClosed ? ` · ${hovered.yearClosed}` : ""}
            </div>
          </div>
        ) : (
          <span className="text-muted">
            Hover over a parish. Ringed marks: Šv. Jurgio (Shenandoah), Aušros
            Vartų (Manhattan), Šv. Petro (Boston) — money did not save them —
            and Dievo Apvaizdos (Scranton), the community-owned parish no
            bishop can close.
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {ENDING_MODE_ORDER.map((mode) => (
          <span key={mode} className="inline-flex items-center gap-1.5">
            <MarkIcon mode={mode} />
            {ENDING_MODE_LABEL[mode]}
          </span>
        ))}
      </div>
    </div>
  );
}
