import type { ParishProfileChronologyItem } from "@/lib/parish-profile-view";

export function ParishProfileChronology({
  items,
}: {
  items: ParishProfileChronologyItem[];
}) {
  return (
    <section
      id="parish-chronology"
      className="mt-10 scroll-mt-8"
      aria-labelledby="parish-chronology-heading"
    >
      <h2
        id="parish-chronology-heading"
        className="font-serif text-2xl font-semibold"
      >
        Parish chronology
      </h2>

      {items.length === 0 ? (
        <p className="mt-4 border-y border-rule py-4 leading-relaxed text-muted">
          No secure sequence of dated events is established for this record.
        </p>
      ) : (
        <ol className="mt-4 divide-y divide-rule border-y border-rule">
          {items.map((item) => (
            <li
              key={`${item.date}-${item.title}`}
              className="grid gap-1 py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-5"
            >
              <p className="text-sm font-semibold text-muted">{item.date}</p>
              <div>
                <h3 className="font-serif text-lg font-semibold leading-tight">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {item.detail}
                </p>
                {item.sources.length > 0 && (
                  <p className="mt-1.5 text-xs text-muted">
                    Sources: {item.sources.join(", ")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
