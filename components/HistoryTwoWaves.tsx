import Link from "next/link";
import type { HistoryDecade } from "@/lib/history-projection";

function ParishSquare({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: "founded" | "closed";
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={`block size-2.5 rounded-[1px] transition-transform hover:scale-150 focus:scale-150 focus:outline-none focus:ring-2 focus:ring-foreground ${
        tone === "founded" ? "bg-foreground" : "bg-[var(--es-closed)]"
      }`}
    />
  );
}

export default function HistoryTwoWaves({
  decades,
}: {
  decades: readonly HistoryDecade[];
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[4.5rem_repeat(15,minmax(0,1fr))] items-end gap-x-2">
          <p className="pb-2 text-right font-sans text-ui-label font-semibold uppercase tracking-widest text-muted">
            Founded
          </p>
          {decades.map((decade) => (
            <div
              key={`founded-${decade.decade}`}
              className="flex min-h-32 content-end items-end justify-center"
            >
              <div className="grid grid-cols-4 gap-1">
                {decade.founded.map((parish) => (
                  <ParishSquare
                    key={parish.slug}
                    href={parish.profileHref}
                    label={`${parish.canonicalName}, founded ${parish.foundedYear}`}
                    tone="founded"
                  />
                ))}
              </div>
            </div>
          ))}

          <div />
          {decades.map((decade) => (
            <div
              key={`year-${decade.decade}`}
              className="border-t border-foreground pt-2 text-center font-mono text-ui-label text-muted"
            >
              {decade.decade}s
            </div>
          ))}

          <p className="pt-2 text-right font-sans text-ui-label font-semibold uppercase tracking-widest text-muted">
            Closed
          </p>
          {decades.map((decade) => (
            <div
              key={`closed-${decade.decade}`}
              className="flex min-h-24 content-start items-start justify-center pt-2"
            >
              <div className="grid grid-cols-4 gap-1">
                {decade.closed.map((parish) => (
                  <ParishSquare
                    key={parish.slug}
                    href={parish.profileHref}
                    label={`${parish.canonicalName}, closed ${parish.endedYear}`}
                    tone="closed"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="ml-[5.5rem] mt-3 grid grid-cols-[5fr_3fr_7fr] border-t border-rule text-center font-sans text-ui-label uppercase tracking-widest text-muted">
          <span className="bg-[var(--band)] py-2">The building wave</span>
          <span className="py-2">War and renewal</span>
          <span className="bg-[color-mix(in_srgb,var(--es-closed)_8%,transparent)] py-2">
            The long contraction
          </span>
        </div>
      </div>
    </div>
  );
}
