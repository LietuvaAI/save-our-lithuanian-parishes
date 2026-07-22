import type { Metadata } from "next";
import Link from "next/link";
import alertsData from "@/data/alerts.json";

export const metadata: Metadata = {
  title: "Parishes under threat — SaveOurLithuanianParishes.org",
  description:
    "All ten watched Lithuanian parishes: four with active community campaigns and six under institutional or building-level risk. Situations, actions, and Substack campaign links.",
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

// Substack base for campaign links
const SUBSTACK = "https://blog.saveourlithuanianparishes.org";

// Map parishLink slug → Substack campaign anchor (from the active-campaigns post)
const SUBSTACK_CAMPAIGN_ANCHORS: Record<string, string> = {
  "dievo-apvaizdos-southfield-mi": `${SUBSTACK}/i/207579337/divine-providence-lithuanian-catholic-church-southfield-michigan`,
  "svc-trejybes-hartford-ct": `${SUBSTACK}/i/207579337/holy-trinity-church-hartford-connecticut`,
  "sv-juozapo-waterbury-ct": `${SUBSTACK}/i/207579337/st-josephs-church-waterbury-connecticut`,
  "kristaus-atsimainymo-maspeth-ny": `${SUBSTACK}/i/207579337/church-of-the-transfiguration-maspeth-queens-new-york`,
};

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
        Ten Lithuanian parishes and buildings are currently being watched. Four
        have active community campaigns — parishioners organizing, funds raised,
        canon lawyers retained. The others are named in diocesan plans, face
        building-level risks, or were recently closed with situations still
        developing.
      </p>

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
            const substackUrl = SUBSTACK_CAMPAIGN_ANCHORS[slug] ?? `${SUBSTACK}/p/active-campaigns`;
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
                    How to help →
                  </a>
                  <Link
                    href={c.parishLink}
                    className="inline-flex items-center gap-1 rounded-md border border-rule px-3 py-1.5 text-sm font-medium hover:border-foreground transition-colors"
                  >
                    Parish record →
                  </Link>
                </div>

                <p className="mt-2 text-xs text-muted">
                  Sources:{" "}
                  {c.sources.map((s, i) => (
                    <span key={s.url}>
                      {i > 0 && " · "}
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
                    {i > 0 && " · "}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
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
                    {i > 0 && " · "}
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
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
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-rule px-4 py-3.5 text-sm text-muted leading-relaxed">
        <p>
          <span className="font-medium text-foreground">Know something we don&rsquo;t?</span>{" "}
          A listening session, a letter, a listing, a campaign that should be
          here —{" "}
          <Link href="/report" className="underline hover:text-foreground">
            tell us
          </Link>
          . All active campaigns are also published on{" "}
          <a
            href={`${SUBSTACK}/p/active-campaigns`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            The Hearth
          </a>
          . Full alert methodology:{" "}
          <Link href="/about-the-data" className="underline hover:text-foreground">
            About the data
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
