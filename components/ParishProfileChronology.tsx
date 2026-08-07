import { ProfileSection } from "@/components/ProfileSection";
import type { ParishProfileChronologyItem } from "@/lib/parish-profile-view";

/**
 * Newest first. Institution and building events tell one story, but a building
 * event is always tagged, and a red date always means a loss or a documented
 * threat of one. docs/design-system-profile.md §7.
 */
export function ParishProfileChronology({
  items,
}: {
  items: ParishProfileChronologyItem[];
}) {
  return (
    <ProfileSection
      id="parish-chronology"
      label="Chronology"
      note="Most recent first"
      accentNote={
        items.some((item) => item.loss)
          ? "Red marks a loss\nor a threat of one"
          : undefined
      }
    >
      {items.length === 0 ? (
        <p className="max-w-[40em] text-sm leading-relaxed text-muted">
          No secure sequence of dated events has yet been established.
        </p>
      ) : (
        <ol className="max-w-[40em] divide-y divide-rule border-b border-rule">
          {items.map((item) => (
            <li
              key={`${item.date}-${item.title}`}
              className="min-w-0"
            >
              <details className="group">
                <summary className="grid cursor-pointer list-none grid-cols-[88px_minmax(0,1fr)_18px] gap-x-3 py-3.5 marker:content-none md:grid-cols-[104px_minmax(0,1fr)_18px] md:gap-x-[22px] [&::-webkit-details-marker]:hidden">
                  <span
                    className={`pt-0.5 font-mono text-[11px] font-medium tabular-nums tracking-wider [white-space:nowrap] ${
                      item.loss ? "text-accent" : "text-muted"
                    }`}
                  >
                    {item.date}
                  </span>
                  <span className="min-w-0">
                    {item.kind === "building" && (
                      <span className="mb-1 block font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-muted">
                        Worship site
                      </span>
                    )}
                    <span className="block text-sm font-semibold leading-snug">
                      {item.title}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-right text-base leading-none text-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="pb-4 pl-0 md:pl-[126px]">
                  {item.detail && (
                    <p className="text-[13.5px] leading-relaxed text-muted">
                      {item.detail}
                    </p>
                  )}
                  {item.sources.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {item.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[12.5px] underline decoration-1 underline-offset-2 hover:text-accent"
                          >
                            {source.label} &rarr;
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ol>
      )}
    </ProfileSection>
  );
}
