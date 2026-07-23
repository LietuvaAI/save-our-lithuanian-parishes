import type { Metadata } from "next";
import Link from "next/link";
import alerts from "@/data/alerts.json";

export const metadata: Metadata = {
  title: "Happening now — current alerts",
  description:
    "What is happening at America's Lithuanian parishes right now: closures, consolidations, property motions, and open windows, from the Parish Watch sweep — every item sourced.",
};

/* The alerts surface: a snapshot of the Parish Watch sweep (refreshed by PR
   on the sweep cadence). Editorial guardrails are baked into the snapshot
   wording itself — unresolved cases are stated as unresolved, never as
   completed closures. */

type Alert = (typeof alerts.alerts)[number] & { caveat?: string; eventDate?: string | null };

const LEVEL_LABEL: Record<string, { title: string; blurb: string }> = {
  red: {
    title: "Red — recent events and active clocks",
    blurb:
      "A decree, a completed consolidation, or an actively contested case with events in recent months.",
  },
  amber: {
    title: "Amber — named in a current proposal",
    blurb:
      "The parish or its building is specifically named in a live diocesan plan, listing, or review — not yet a decree.",
  },
};

function AlertCard({ a }: { a: Alert }) {
  return (
    <div className="rounded-lg border border-rule px-4 py-3.5">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span
          className={
            "inline-block h-2.5 w-2.5 rounded-full " +
            (a.level === "red" ? "bg-accent" : "bg-amber-600")
          }
          aria-hidden
        />
        <Link href={a.parishLink} className="font-semibold hover:underline">
          {a.entity}
        </Link>
        <span className="text-muted">— {a.place}</span>
        <span className="ml-auto text-xs text-muted">{a.diocese}</span>
      </div>
      <p className="mt-2 leading-relaxed">{a.whatChanged}</p>
      {a.caveat && (
        <p className="mt-2 text-sm text-muted italic">{a.caveat}</p>
      )}
      <p className="mt-2 text-xs text-muted">
        Sources:{" "}
        {a.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && " · "}
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              {s.publisher}
            </a>
          </span>
        ))}
        {" · "}
        <Link href={a.parishLink} className="underline hover:text-foreground">
          full record →
        </Link>
      </p>
    </div>
  );
}

export default function NowPage() {
  const reds = (alerts.alerts as Alert[]).filter((a) => a.level === "red");
  const ambers = (alerts.alerts as Alert[]).filter((a) => a.level === "amber");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        Happening now
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold">
        Current alerts
      </h1>
      <p className="mt-3 text-muted leading-relaxed">
        The record looks backward; this page looks forward. Each item below is
        a current event at a watched parish — a closure, a consolidation, a
        property motion, an open process — found by the systematic Parish
        Watch sweep and stated with its sources. Snapshot of{" "}
        {alerts.snapshot}; red items are re-checked weekly, amber biweekly.
      </p>

      <section className="mt-8 rounded-lg border-2 border-accent/60 px-4 py-3.5">
        <p className="text-xs uppercase tracking-widest text-muted">
          The open window
        </p>
        <p className="mt-1 leading-relaxed">
          <strong>Divine Providence, Southfield, Michigan</strong> — the
          Archdiocese of Detroit&rsquo;s one Lithuanian parish — is inside the
          archdiocese&rsquo;s restructuring. The parish survey closes{" "}
          <strong>July 31, 2026</strong>; discernment follows this fall, with
          decisions announced in early 2027. The record shows the window that
          matters is <em>before</em> a decision arrives — and it is open now.{" "}
          <Link href="/start-here" className="font-semibold underline hover:text-accent">
            Start here →
          </Link>{" "}
          <a
            href="https://blog.saveourlithuanianparishes.org/p/who-the-archdioceses-ethnic-parishes"
            className="underline hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            · The full analysis →
          </a>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          Active campaigns — where communities are organizing
        </h2>
        <p className="mt-1 text-sm text-muted">
          Not every alert has a campaign behind it. These do — documented
          organizing, stated in its own words and cited.
        </p>
        <div className="mt-4 space-y-4">
          {(alerts as any).campaigns?.map((c: any) => (
            <div key={c.id} className="rounded-lg border border-rule px-4 py-3.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <Link href={c.parishLink} className="font-semibold hover:underline">
                  {c.entity}
                </Link>
                <span className="text-muted">— {c.place}</span>
                <span className="ml-auto text-xs text-muted">since {c.since}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">
                <span className="font-medium">Who:</span> {c.who}.{" "}
                <span className="font-medium">What form:</span> {c.form}.
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.state}</p>
              <p className="mt-2 text-xs text-muted">
                Sources:{" "}
                {c.sources.map((s: any, i: number) => (
                  <span key={s.url}>
                    {i > 0 && " · "}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      {s.publisher}
                    </a>
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          {LEVEL_LABEL.red.title}
        </h2>
        <p className="mt-1 text-sm text-muted">{LEVEL_LABEL.red.blurb}</p>
        <div className="mt-4 space-y-4">
          {reds.map((a) => (
            <AlertCard key={a.id} a={a} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          {LEVEL_LABEL.amber.title}
        </h2>
        <p className="mt-1 text-sm text-muted">{LEVEL_LABEL.amber.blurb}</p>
        <div className="mt-4 space-y-4">
          {ambers.map((a) => (
            <AlertCard key={a.id} a={a} />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-rule px-4 py-3.5 text-sm text-muted leading-relaxed">
        <p>
          <span className="font-medium text-foreground">How this list is built.</span>{" "}
          The watch layer systematically monitors 155 parishes and sites drawn
          from the wider research record — a broader net than the{" "}
          <Link href="/parishes" className="underline hover:text-foreground">
            case-filed parishes
          </Link>{" "}
          with researched case files, which remain the core record. A parish
          appearing here is not a verdict: unresolved cases stay unresolved
          until the record says otherwise. Method and sources:{" "}
          <Link href="/about-the-data" className="underline hover:text-foreground">
            About the data
          </Link>
          . Know something we don&rsquo;t?{" "}
          <Link href="/report" className="underline hover:text-foreground">
            Tell us
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
