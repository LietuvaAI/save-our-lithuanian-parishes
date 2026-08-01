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
          No secure sequence of dated events is established for this record.
        </p>
      ) : (
        <ol className="max-w-[40em]">
          {items.map((item) => (
            <li
              key={`${item.date}-${item.title}`}
              className="grid gap-x-[22px] pb-[18px] md:grid-cols-[104px_minmax(0,1fr)]"
            >
              <span
                className={`pt-0.5 font-mono text-[11px] font-medium tabular-nums tracking-wider [white-space:nowrap] ${
                  item.loss ? "text-accent" : "text-muted"
                }`}
              >
                {item.date}
              </span>
              <div>
                {item.kind === "building" && (
                  <span className="mb-1.5 block font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-muted">
                    Worship site
                  </span>
                )}
                <p className="text-sm font-semibold leading-snug">{item.title}</p>
                {item.detail && (
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
                    {item.detail}
                  </p>
                )}
                {item.sources.length > 0 && (
                  <p className="mt-1 font-mono text-[10.5px] leading-normal text-muted">
                    {item.sources.join(" \u00b7 ")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </ProfileSection>
  );
}
