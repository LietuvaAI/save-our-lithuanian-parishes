import type { Metadata } from "next";
import Link from "next/link";
import alertsData from "@/data/alerts.json";

export const metadata: Metadata = {
  title: "Parishes under threat — SaveOurLithuanianParishes.org",
  description:
    "All ten watched Lithuanian parishes: closures, consolidations, property motions, open windows, and active community campaigns — every item sourced.",
};

type Alert = {
  id: string;
  level: string;
  kind: string;
  entity: string;
  place: string;
  diocese: string;
  whatChanged: string;
  parishLink: string;
  caveat?: string;
  sources: { title: string; publisher: string; url: string }[];
};

type Campaign = {
  id: string;
  entity: string;
  place: string;
  parishLink: string;
  hearthUrl?: string;
  since: string;
  who: string;
  form: string;
  state: string;
  sources: { title: string; publisher: string; url: string }[];
};

const alerts = alertsData.alerts as Alert[];
const campaigns = alertsData.campaigns as Campaign[];

// Active campaigns = campaigns whose parish also has a kind=active alert
const activeCampaignIds = new Set(
  alerts.filter((a) => a.kind === "active").map((a) =>
    a.parishLink.replace(/^\/(parishes|registry)\//, "")
  )
);
const activeCampaigns = campaigns.filter((c) => {
  const slug = c.parishLink.replace(/^\/(parishes|registry)\//, "");
  return activeCampaignIds.has(slug);
});

// Monitored: all alerts, grouped by kind
const activeAlerts = alerts.filter((a) => a.kind === "active");
const watchAlerts = alerts.filter((a) => a.kind === "watch");
const buildingAlerts = alerts.filter((a) => a.kind === "building");

// Substack base for fallback links
const SUBSTACK = "https://blog.saveourlithuanianparishes.org";

function slugFromLink(link: string) {
  return link.replace(/^\/(parishes|registry)\//, "");
}

export default function UnderThreatPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">Happening now</p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold">
        Parishes under threat
      </h1>
      <p className="mt-3 text-muted leading-relaxed">
        Each item below is a current event at a watched parish — a closure, a
        consolidation, a property motion, an open process — found by the
        systematic Parish Watch sweep and stated with its sources. Snapshot
        of {alertsData.snapshot}; red items are re-checked weekly, amber
        biweekly. Parishes that survived but face slow-burn sustainability
        challenges are on the{" "}
        <Link href="/sustainability-watch" className="underline hover:text-foreground">
          The Vigil
        </Link>
        .
      </p>

      {/* ── Open window callout ── */}
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
            Start here &rarr;
          </Link>{" "}
          <a
            href={`${SUBSTACK}/p/who-the-archdioceses-ethnic-parishes`}
            className="underline hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            &middot; The full analysis &rarr;
          </a>
        </p>
      </section>

      {/* ── Active campaigns ── */}
      <section className="mt-10">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-2xl font-semibold">Active campaigns</h2>
          <span className="text-sm text-muted">
            {activeCampaigns.length} parishes
          </span>
        </div>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          Communities are organizing. Each one has a specific ask you can act on
          today — survey, petition, donation, documentation.
        </p>

        <div className="mt-5 space-y-5">
          {activeCampaigns.map((c) => {
            const slug = slugFromLink(c.parishLink);
            const substackUrl = c.hearthUrl ?? `${SUBSTACK}/p/active-campaigns`;
            const alert = activeAlerts.find(
              (a) => slugFromLink(a.parishLink) === slug
            );
            return (
              <div
                key={c.id}
                className="rounded-lg border-2 border-rule px-5 py-4"
                style={{ borderLeftColor: "var(--mark-community)", borderLeftWidth: 4 }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <div>
                    <Link href={c.parishLink} className="font-serif text-lg font-semibold hover:underline">
                      {c.entity}
                    </Link>
                    <span className="ml-2 text-muted text-sm">{c.place}</span>
                  </div>
                  <span className="text-xs text-muted">since {c.since}</span>
                </div>

                {alert && (
                  <p className="mt-2 text-sm leading-relaxed">{alert.whatChanged}</p>
                )}

                <div className="mt-3 text-sm leading-relaxed space-y-1">
                  <p>
                    <span className="font-medium">Who is organizing:</span>{" "}
                    {c.who}.
                  </p>
                  <p>
                    <span className="font-medium">What form:</span> {c.form}.
                  </p>
                  <p className="text-muted">{c.state}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <a
                    href={substackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "var(--mark-community)", color: "#1c1917" }}
                  >
                    How to help &rarr;
                  </a>
                  <Link
                    href={c.parishLink}
                    className="inline-flex items-center gap-1 rounded-md border border-rule px-3 py-1.5 text-sm font-medium hover:border-foreground transition-colors"
                  >
                    Parish record &rarr;
                  </Link>
                </div>

                <p className="mt-2 text-xs text-muted">
                  Sources:{" "}
                  {c.sources.map((s, i) => (
                    <span key={s.url}>
                      {i > 0 && " \u00b7 "}
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                        {s.publisher}
                      </a>
                    </span>
                  ))}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Monitored: watch ── */}
      <section className="mt-12">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-2xl font-semibold">Being watched</h2>
          <span className="text-sm text-muted">{watchAlerts.length} parishes</span>
        </div>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          Named in a diocesan plan, recently closed, or in an unresolved
          situation — no documented community campaign yet. If you know of
          organizing at any of these, <Link href="/report" className="underline hover:text-foreground">tell us</Link>.
        </p>
        <div className="mt-4 divide-y divide-rule border border-rule rounded-lg overflow-hidden">
          {watchAlerts.map((a) => (
            <div key={a.id} className="px-4 py-3.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span
                  className={"inline-block h-2 w-2 rounded-full flex-shrink-0 " + (a.level === "red" ? "bg-accent" : "bg-amber-600")}
                  aria-hidden
                />
                <Link href={a.parishLink} className="font-semibold hover:underline">
                  {a.entity}
                </Link>
                <span className="text-muted text-sm">— {a.place}</span>
                <span className="ml-auto text-xs text-muted">{a.diocese}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{a.whatChanged}</p>
              {a.caveat && (
                <p className="mt-1 text-xs text-muted italic">{a.caveat}</p>
              )}
              <p className="mt-1.5 text-xs text-muted">
                Sources:{" "}
                {a.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && " \u00b7 "}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {s.publisher}
                    </a>
                  </span>
                ))}
                {" \u00b7 "}
                <Link href={a.parishLink} className="underline hover:text-foreground">
                  full record &rarr;
                </Link>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Buildings at risk ── */}
      <section className="mt-12">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-2xl font-semibold">Buildings at risk</h2>
          <span className="text-sm text-muted">{buildingAlerts.length} buildings</span>
        </div>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          The parish itself has closed or relocated, but the building faces
          demolition or sale. The physical inheritance is still at stake.
        </p>
        <div className="mt-4 divide-y divide-rule border border-rule rounded-lg overflow-hidden">
          {buildingAlerts.map((a) => (
            <div key={a.id} className="px-4 py-3.5">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: "var(--mark-building)" }}
                  aria-hidden
                />
                <Link href={a.parishLink} className="font-semibold hover:underline">
                  {a.entity}
                </Link>
                <span className="text-muted text-sm">— {a.place}</span>
                <span className="ml-auto text-xs text-muted">{a.diocese}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{a.whatChanged}</p>
              <p className="mt-1.5 text-xs text-muted">
                Sources:{" "}
                {a.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && " \u00b7 "}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {s.publisher}
                    </a>
                  </span>
                ))}
                {" \u00b7 "}
                <Link href={a.parishLink} className="underline hover:text-foreground">
                  full record &rarr;
                </Link>
              </p>
            </div>
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
          until the record says otherwise. All active campaigns are also
          published on{" "}
          <a
            href={`${SUBSTACK}/p/active-campaigns`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            The Hearth
          </a>
          . Method and sources:{" "}
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
