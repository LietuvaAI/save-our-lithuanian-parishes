"use client";

import { useState } from "react";
import {
  type Parish,
  type EndingMode,
  ENDING_MODE_LABEL,
  ENDING_MODE_COLOR,
  OWNERSHIP_LABEL,
  STATUS_LABEL,
} from "@/lib/parishes";

/**
 * Panel A of the „Kam priklauso bažnyčia?" infographic, interactive:
 * every U.S. parish as one mark, grouped by who holds the deed,
 * encoded by who decided its ending (ending_mode — three states, not
 * closed-vs-standing).
 */

const MODE_ORDER: EndingMode[] = [
  "diocese_closed",
  "undecided",
  "community_decided",
  "standing",
];

// Direct-label the named cases, per the infographic brief.
const LABELED = new Set([
  "sv-jurgio-shenandoah-pa",
  "ausros-vartu-manhattan-ny",
  "sv-petro-boston-ma",
  "dievo-apvaizdos-scranton-pa",
]);

function sortKey(p: Parish) {
  return [MODE_ORDER.indexOf(p.endingMode), p.state, p.city].join("|");
}

function Dot({
  parish,
  onHover,
}: {
  parish: Parish;
  onHover: (p: Parish | null) => void;
}) {
  const labeled = LABELED.has(parish.slug);
  return (
    <button
      type="button"
      aria-label={`${parish.nameLt}, ${parish.city} ${parish.state} — ${ENDING_MODE_LABEL[parish.endingMode]}`}
      onMouseEnter={() => onHover(parish)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(parish)}
      onBlur={() => onHover(null)}
      className="relative size-5 rounded-full transition-transform hover:scale-125 focus:scale-125 focus:outline-none"
      style={{
        background: ENDING_MODE_COLOR[parish.endingMode],
        boxShadow: labeled ? "0 0 0 2px var(--background), 0 0 0 3.5px var(--foreground)" : undefined,
      }}
    />
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
          <p className="text-sm text-accent mt-1">
            {dioceseClosed} closed by the diocese
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5 max-w-md">
            {diocese.map((p) => (
              <Dot key={p.slug} parish={p} onHover={setHovered} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-serif text-lg font-semibold">
            Community-owned <span className="text-muted font-normal">— {community.length}</span>
          </h3>
          <p className="text-sm mt-1" style={{ color: "var(--mode-standing)" }}>
            {communityClosed} closed by any outside authority
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5 max-w-40">
            {community.map((p) => (
              <Dot key={p.slug} parish={p} onHover={setHovered} />
            ))}
          </div>
        </section>
      </div>

      <div
        className="mt-8 min-h-16 rounded-lg border border-rule px-4 py-3 text-sm"
        aria-live="polite"
      >
        {hovered ? (
          <div>
            <span className="font-medium">{hovered.nameLt}</span>{" "}
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
        {MODE_ORDER.map((mode) => (
          <span key={mode} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block size-3 rounded-full"
              style={{ background: ENDING_MODE_COLOR[mode] }}
            />
            {ENDING_MODE_LABEL[mode]}
          </span>
        ))}
      </div>
    </div>
  );
}
