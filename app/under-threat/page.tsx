import type { Metadata } from "next";
import Link from "next/link";
import alertsData from "@/data/alerts.json";
import contextPointsData from "@/data/context-points.json";
import {
  DiocesePill,
  DiocesanLeaderLink,
} from "@/components/DiocesePill";
import { EndStatePill } from "@/components/EndStatePill";
import RecordLensMap, {
  type RecordLensPoint,
} from "@/components/RecordLensMap";
import { scopedParishes } from "@/lib/registry-scope";
import type { EndState, EndStateGroup } from "@/lib/end-state";
import { DIOCESAN_LEADERSHIP_VERIFIED } from "@/lib/diocese-links";
import {
  isHollowRecordMark,
  recordMarkColor,
  recordMarkShape,
  SIGNAL_RING_COLOR,
  type RecordSignal,
} from "@/lib/record-mark";

export const metadata: Metadata = {
  title: "What’s Happening Now",
  description:
    "Current Lithuanian parish campaigns, diocesan developments, and buildings at risk — every item sourced.",
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

type ContextPoint = {
  slug: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
  group: EndStateGroup;
  recordType: string | null;
  congregationClass: string | null;
  href: string | null;
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
const contextPoints = contextPointsData.points as ContextPoint[];

const alertMapPoints = alerts.flatMap((alert): RecordLensPoint[] => {
  const slug = alert.parishLink.replace(/^\/(parishes|registry)\//, "");
  const point = contextPoints.find(
    (candidate) =>
      candidate.href === alert.parishLink || candidate.slug === slug,
  );

  if (!point) return [];
  return [
    {
      ...point,
      slug: alert.id,
      href: alert.parishLink,
      color: recordMarkColor(point.group),
      shape: recordMarkShape(point.congregationClass),
      hollow: isHollowRecordMark({
        group: point.group,
        recordType: point.recordType,
      }),
      ringColor:
        SIGNAL_RING_COLOR[alert.kind as RecordSignal] ??
        SIGNAL_RING_COLOR.watch,
      detail:
        alert.kind === "active"
          ? "active campaign"
          : alert.kind === "building"
            ? "building at risk"
            : "development to monitor",
    },
  ];
});
const unmappedAlertCount = alerts.length - alertMapPoints.length;
const alertStateCount = new Set(alertMapPoints.map((point) => point.state)).size;

// Substack base for fallback links
const SUBSTACK = "https://blog.saveourlithuanianparishes.org";
const statusByLink = new Map(
  scopedParishes()
    .filter((parish) => parish.profileHref)
    .map((parish) => [parish.profileHref!, parish.endState]),
);

function slugFromLink(link: string) {
  return link.replace(/^\/(parishes|registry)\//, "");
}

function statusForLink(link: string): EndState {
  return statusByLink.get(link) ?? "unverified";
}

export default function UnderThreatPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase text-muted">Happening now</p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold">
        What&rsquo;s Happening Now
      </h1>
      <p className="mt-4 max-w-3xl font-serif text-xl leading-relaxed sm:text-2xl">
        Where is a decision, campaign, or building future at stake now?
      </p>

      <section className="mt-10 border-y border-rule py-8">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
          <RecordLensMap
            points={alertMapPoints}
            ariaLabel={`${alerts.length} current parish situations across ${alertStateCount} states`}
            legend={[
              {
                label: `Active campaign · ${activeAlerts.length}`,
                color: SIGNAL_RING_COLOR.active,
                shape: "ring",
              },
              {
                label: `Development · ${watchAlerts.length}`,
                color: SIGNAL_RING_COLOR.watch,
                shape: "ring",
              },
              {
                label: `Building at risk · ${buildingAlerts.length}`,
                color: SIGNAL_RING_COLOR.building,
                shape: "ring",
              },
            ]}
          />
          <div>
            <p className="font-serif text-6xl font-semibold leading-none">
              {alerts.length}
            </p>
            <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight">
              current situations across {alertStateCount} states
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              {activeAlerts.length} have active community campaigns.{" "}
              {watchAlerts.length} more are diocesan or parish developments to
              monitor. {buildingAlerts.length} concern former parish buildings
              whose physical future is still at stake.
            </p>
            <p className="mt-4 text-xs text-muted">
              Canonical fill color shows each parish&rsquo;s status; the outer
              ring shows why it appears in this current-action view.
            </p>
          </div>
        </div>
        <p className="mt-5 border-t border-rule pt-3 text-xs leading-relaxed text-muted">
          Scope: {alerts.length} current action signals across {alertStateCount}{" "}
          states · Snapshot {alertsData.snapshot} · Every item cites its current
          sources
          {unmappedAlertCount > 0
            ? ` · ${unmappedAlertCount} signal${
                unmappedAlertCount === 1 ? "" : "s"
              } could not be placed on the map`
            : ""}
          {" · "}
          <Link href="/about-the-data" className="underline hover:text-accent">
            About the data
          </Link>
        </p>
      </section>

      <nav
        aria-label="Sections on this page"
        className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-b border-rule pb-3 text-sm"
      >
        <a href="#active-campaigns" className="font-medium underline hover:text-accent">
          Active campaigns · {activeCampaigns.length}
        </a>
        <a href="#developments" className="font-medium underline hover:text-accent">
          Developments · {watchAlerts.length}
        </a>
        <a href="#buildings" className="font-medium underline hover:text-accent">
          Buildings · {buildingAlerts.length}
        </a>
        <Link
          href="/lithuanian-catholic-life-today#parish-health-heading"
          className="font-medium underline hover:text-accent"
        >
          Parish health profiles
        </Link>
      </nav>
      <p className="mt-2 text-xs text-muted">
        Diocesan leadership current as of {DIOCESAN_LEADERSHIP_VERIFIED}.
      </p>

      {/* ── Open window callout ── */}
      <section className="mt-8 rounded-lg border-2 border-accent/60 px-4 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase text-muted">
            The open window
          </p>
          <EndStatePill
            value={statusForLink("/parishes/dievo-apvaizdos-southfield-mi")}
          />
        </div>
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
      <section id="active-campaigns" className="mt-10 scroll-mt-24">
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
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <div className="flex flex-wrap items-center gap-2">
                      <EndStatePill value={statusForLink(c.parishLink)} />
                      {alert && <DiocesePill name={alert.diocese} />}
                      <span className="text-xs text-muted">since {c.since}</span>
                    </div>
                    {alert && <DiocesanLeaderLink diocese={alert.diocese} />}
                  </div>
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
      <section id="developments" className="mt-12 scroll-mt-24">
        <div className="flex items-baseline gap-3">
          <h2 className="font-serif text-2xl font-semibold">Developments to monitor</h2>
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
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: "var(--mark-community)" }}
                  aria-hidden
                />
                <Link href={a.parishLink} className="font-semibold hover:underline">
                  {a.entity}
                </Link>
                <span className="text-muted text-sm">— {a.place}</span>
                <span className="ml-auto">
                  <DiocesePill name={a.diocese} />
                </span>
                <EndStatePill value={statusForLink(a.parishLink)} />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{a.whatChanged}</p>
              <p className="mt-1">
                <DiocesanLeaderLink diocese={a.diocese} />
              </p>
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
      <section id="buildings" className="mt-12 scroll-mt-24">
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
                <span className="ml-auto">
                  <DiocesePill name={a.diocese} />
                </span>
                <EndStatePill value={statusForLink(a.parishLink)} />
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{a.whatChanged}</p>
              <p className="mt-1">
                <DiocesanLeaderLink diocese={a.diocese} />
              </p>
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

    </div>
  );
}
