import type {
  ParishTimeline,
  ParishTimelineKind,
} from "@/lib/parish-timelines";

const KIND_LABEL: Record<ParishTimelineKind, string> = {
  parish: "Parish",
  building_lost: "Church sites",
  decision: "Canonical decision",
  building_current: "Present church",
  current: "Current chapter",
};

const KIND_COLOR: Record<ParishTimelineKind, string> = {
  parish: "var(--mark-ink)",
  building_lost: "var(--es-closed)",
  decision: "var(--es-transferred)",
  building_current: "var(--es-active)",
  current: "var(--es-unresolved)",
};

export function ParishLifeTimeline({
  timeline,
}: {
  timeline: ParishTimeline;
}) {
  return (
    <section className="mt-10">
      <p className="text-small-copy uppercase tracking-wide text-muted">
        Parish and church through time
      </p>
      <h2 className="mt-1 font-serif text-section-title font-semibold">
        {timeline.title}
      </h2>
      <p className="mt-2 max-w-2xl leading-relaxed text-muted">
        {timeline.intro}
      </p>

      <ol
        className="mt-6 ml-1 border-l-2 border-rule sm:ml-0 sm:grid sm:border-l-0 sm:border-t-2"
        style={{
          gridTemplateColumns: `repeat(${timeline.events.length}, minmax(0, 1fr))`,
        }}
      >
        {timeline.events.map((event) => (
          <li
            key={`${event.sortYear}-${event.title}`}
            className="relative pb-7 pl-6 last:pb-0 sm:min-w-0 sm:pb-0 sm:pl-0 sm:pr-4"
          >
            <span
              className="absolute left-[-0.45rem] top-1.5 h-3 w-3 rounded-full border-2 border-background sm:-top-[0.45rem] sm:left-0"
              style={{ background: KIND_COLOR[event.kind] }}
              aria-hidden
            />
            <p className="text-small-copy font-semibold uppercase text-muted sm:mt-5">
              {event.date}
            </p>
            <p
              className="mt-1 text-[10px] font-semibold uppercase"
              style={{ color: KIND_COLOR[event.kind] }}
            >
              {KIND_LABEL[event.kind]}
            </p>
            <h3 className="mt-1 font-serif text-subsection-title font-semibold leading-tight">
              {event.title}
            </h3>
            <p className="mt-1.5 text-body-copy leading-relaxed text-muted">
              {event.detail}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-5 border-t border-rule pt-3 text-small-copy leading-relaxed text-muted">
        The line follows one parish institution across successive church
        buildings. Dates are shown only as precisely as the cited evidence
        allows · record checked {timeline.asOf} ·{" "}
        <a
          href="#evidence-sources"
          className="font-medium underline decoration-rule underline-offset-2 hover:decoration-foreground"
        >
          evidence and full links
        </a>
        .
      </p>
    </section>
  );
}
