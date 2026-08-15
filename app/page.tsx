import Image from "next/image";
import Link from "next/link";
import ChurchProcession from "@/components/ChurchProcession";
import { EndStatePill } from "@/components/EndStatePill";
import ParishMap from "@/components/ParishMap";
import alertsData from "@/data/canonical-current-events-projection.json";
import { dioceseOfficialUrl } from "@/lib/diocese-links";
import { splitStory } from "@/lib/dek";
import {
  currentPastoralNetwork,
  infographicCounts,
  institutionHistory,
  romanCatholicInstitutionHistory,
  romanCatholicMissionHistory,
  romanCatholicParishHistory,
} from "@/lib/infographic-projection";
import type { EndState } from "@/lib/end-state";
import { getClearedPhoto } from "@/lib/photos";

const PUBLIC_INSTITUTIONS = infographicCounts.public_us_institutions;
const ROMAN_CATHOLIC_INSTITUTIONS = romanCatholicInstitutionHistory.length;
const ROMAN_CATHOLIC_PARISHES = romanCatholicParishHistory.length;
const ROMAN_CATHOLIC_MISSIONS = romanCatholicMissionHistory.length;
const PHYSICAL_WORSHIP_SITES = infographicCounts.physical_worship_sites;
const CURRENT_WORSHIP_COUNT =
  currentPastoralNetwork.counts.active_parish +
  currentPastoralNetwork.counts.active_mission +
  currentPastoralNetwork.counts.mass_continues;

type CurrentAlert = {
  id: string;
  kind: "active" | "watch" | "building";
  entity: string;
  place: string;
  diocese: string;
  parishLink?: string;
  relatedProfileLink?: string;
  relatedProfileLabel?: string;
  status?: EndState;
  statusLabel?: string;
  context?: string;
  whatChanged: string;
  sources: { title: string; publisher: string; url: string }[];
};

type CurrentCampaign = {
  id: string;
  entity: string;
  place: string;
  parishLink: string;
  hearthUrl: string;
  actionUrl: string;
  actionLabel: string;
};

const currentAlerts = alertsData.alerts as CurrentAlert[];
const watchAlerts = currentAlerts.filter((alert) => alert.kind === "watch");
const buildingAlerts = currentAlerts.filter(
  (alert) => alert.kind === "building",
);
const monitoredAlerts = [...watchAlerts, ...buildingAlerts];
const activeCampaigns = (alertsData.campaigns as CurrentCampaign[])
  .map((campaign) => ({
    ...campaign,
    alert: currentAlerts.find(
      (alert) =>
        alert.kind === "active" && alert.parishLink === campaign.parishLink,
    ),
  }))
  .filter(
    (
      campaign,
    ): campaign is CurrentCampaign & { alert: CurrentAlert } =>
      Boolean(campaign.alert),
  );
const activeCampaignCountLabel =
  activeCampaigns.length === 4 ? "Four" : String(activeCampaigns.length);

const statusByLink = new Map(
  institutionHistory.map((institution) => [
    institution.public_profile,
    institution.status_group as EndState,
  ]),
);

function profileStatusForAlert(alert: CurrentAlert): {
  value: EndState;
  label?: string;
} {
  if (alert.status) {
    return { value: alert.status, label: alert.statusLabel };
  }

  const profileLink = alert.parishLink ?? alert.relatedProfileLink;
  const value = profileLink ? statusByLink.get(profileLink) : undefined;
  if (!value) {
    throw new Error(
      `${alert.id}: watch-list entry has no canonical profile status`,
    );
  }
  return { value };
}

function profileSlug(link: string) {
  return link.split("/").filter(Boolean).at(-1) ?? "";
}

function twoSentences(text: string) {
  const first = splitStory(text);
  if (!first.rest) return first.dek;
  const second = splitStory(first.rest);
  return `${first.dek} ${second.dek}`;
}

function lineDrawingForAlert(alert: CurrentAlert) {
  const link = alert.parishLink ?? alert.relatedProfileLink;
  const key =
    alert.id === "freeland-2026-07"
      ? "our-lady-immaculate-conception-freeland-pa-line-drawing"
      : link
        ? `${profileSlug(link)}-line-drawing`
        : null;
  return key ? getClearedPhoto(key) : null;
}

const campaignByLink = new Map(
  activeCampaigns.map((campaign) => [campaign.parishLink, campaign]),
);
const activeAlertOrder = new Map(
  activeCampaigns.map((campaign, index) => [campaign.parishLink, index]),
);
const crossroadsAlerts = [...currentAlerts].sort((a, b) => {
  if (a.kind === "active" && b.kind !== "active") return -1;
  if (a.kind !== "active" && b.kind === "active") return 1;
  if (a.kind === "active" && b.kind === "active") {
    return (
      (activeAlertOrder.get(a.parishLink ?? "") ?? 99) -
      (activeAlertOrder.get(b.parishLink ?? "") ?? 99)
    );
  }
  return a.entity.localeCompare(b.entity);
});

if (
  institutionHistory.length !== PUBLIC_INSTITUTIONS ||
  ROMAN_CATHOLIC_INSTITUTIONS !==
    ROMAN_CATHOLIC_PARISHES + ROMAN_CATHOLIC_MISSIONS ||
  CURRENT_WORSHIP_COUNT !==
    currentPastoralNetwork.directory.entries.filter((entry) =>
      ["active_parish", "active_mission", "mass_continues"].includes(
        entry.networkClass,
      ),
    ).length ||
  currentPastoralNetwork.directory.entries.filter((entry) =>
    ["active_parish", "active_mission"].includes(entry.networkClass),
  ).length !==
    currentPastoralNetwork.counts.active_parish +
      currentPastoralNetwork.counts.active_mission ||
  activeCampaigns.length !== alertsData.counts.campaigns ||
  monitoredAlerts.length !==
    currentAlerts.filter(
      (alert) => alert.kind === "watch" || alert.kind === "building",
    ).length
) {
  throw new Error("Homepage populations do not match Brain projections");
}

const STAT_CARDS = [
  {
    value: PUBLIC_INSTITUTIONS,
    label: "communities — all public profiles",
    detail: "Browse",
    href: "/parishes",
  },
  {
    value: ROMAN_CATHOLIC_INSTITUTIONS,
    label: "RC parishes & missions",
    detail: "Outcomes",
    href: "/where-every-parish-ended-up",
  },
  {
    value: PHYSICAL_WORSHIP_SITES,
    label: "church buildings",
    detail: "Buildings",
    href: "/where-every-parish-ended-up?view=buildings",
  },
  {
    value: CURRENT_WORSHIP_COUNT,
    label: "places of Lithuanian worship today",
    detail: "Network",
    href: "/lithuanian-catholic-life-today",
  },
];

export default function Home() {
  return (
    <div className="home-page mx-auto max-w-6xl px-4">
      <section className="pt-2 sm:pt-3" aria-label="Lithuanian parish portraits">
        <ChurchProcession />
      </section>

      <section className="mx-auto max-w-4xl py-6 text-center sm:py-8">
        <p className="font-serif text-small-copy font-medium uppercase tracking-[0.22em] text-muted">
          Amerikos lietuvių parapijos
        </p>
        <h1 className="mt-2 font-serif text-home-hero font-semibold uppercase tracking-[0.12em]">
          America&rsquo;s Lithuanian Parishes
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-home-intro text-muted">
          America&rsquo;s Lithuanian parishes have long been the {" "}
          <em>židiniai</em> of our communities&mdash;the hearths where faith was
          lived, language was spoken, memory was preserved, and identity was
          formed. Together, they form an unbroken current connecting the
          Lithuanian past to the present. This project traces the complete
          history of America&rsquo;s Lithuanian parishes&mdash;from their earliest
          foundations to the communities discerning their future today.
        </p>
        <p className="mt-3 text-body-copy">
          <Link
            href="/about"
            className="font-semibold text-accent underline decoration-rule underline-offset-4 hover:text-foreground"
          >
            About the project →
          </Link>
        </p>
      </section>

      <section aria-label="Explore the national parish map">
        <ParishMap />
      </section>

      <nav
        aria-label="The record at a glance"
        className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-rule py-5 sm:grid-cols-4 sm:gap-x-8"
      >
        {STAT_CARDS.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="group text-foreground"
          >
            <span className="flex items-baseline gap-2">
              <span className="font-serif text-masthead-title font-semibold leading-none tabular-nums">
                {stat.value}
              </span>
              <span className="text-small-copy font-semibold text-accent">
                {stat.detail} →
              </span>
            </span>
            <span className="mt-1 block text-left text-small-copy leading-[1.35] text-muted">
              {stat.label}
            </span>
          </Link>
        ))}
      </nav>

      <section
        id="happening-now"
        className="mt-[52px] scroll-mt-6"
        aria-labelledby="crossroads-heading"
      >
        <div className="border-b border-foreground pb-[9px]">
          <h2 id="crossroads-heading" className="font-serif text-home-section font-semibold uppercase tracking-[0.1em]">
            Parishes at a crossroads
          </h2>
        </div>
        <p className="mt-2.5 max-w-[76ch] text-directory-description text-muted">
          {activeCampaignCountLabel} parishes face decisions about their future
          right now, and {monitoredAlerts.length} more situations are being
          followed — planned consolidations, churches on the market, and
          buildings facing demolition. Each entry says what changed and how to
          learn more or help.
        </p>

        <div className="mt-1.5 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          {crossroadsAlerts.map((alert) => {
            const href = alert.parishLink ?? alert.relatedProfileLink ?? null;
            const status = profileStatusForAlert(alert);
            const art = lineDrawingForAlert(alert);
            const campaign = alert.parishLink
              ? campaignByLink.get(alert.parishLink)
              : undefined;
            const dioceseHref = dioceseOfficialUrl(alert.diocese);
            const tag =
              alert.kind === "active"
                ? "Active campaign"
                : alert.kind === "building"
                  ? "Building at risk"
                  : "Development to monitor";
            const situationClass =
              alert.kind === "active"
                ? "bg-[#f8efef]"
                : alert.kind === "building"
                  ? "bg-[#f5edda]"
                  : "bg-[#f1efeb]";

            return (
              <article key={alert.id} className="border-b border-[#efece6] py-4">
                {href ? (
                  <Link
                    href={href}
                    className="relative block aspect-[3/2] overflow-hidden border border-rule bg-[#faf7f0]"
                    aria-label={`Open ${alert.entity} profile`}
                  >
                    {art && (
                      <Image
                        src={art.src}
                        alt={art.alt}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 260px"
                        className="object-contain mix-blend-multiply"
                      />
                    )}
                  </Link>
                ) : (
                  <div className="relative aspect-[3/2] overflow-hidden border border-rule bg-[#faf7f0]">
                    {art && (
                      <Image
                        src={art.src}
                        alt={art.alt}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 260px"
                        className="object-contain mix-blend-multiply"
                      />
                    )}
                  </div>
                )}
                <div className="mt-2.5 min-w-0">
                  {href ? (
                    <Link href={href} className="font-serif text-compact-heading font-semibold leading-[1.3] text-foreground hover:text-accent">
                      {alert.entity}
                    </Link>
                  ) : (
                    <h3 className="font-serif text-compact-heading font-semibold leading-[1.3]">
                      {alert.entity}
                    </h3>
                  )}
                  <p className="mt-1 text-support-copy leading-[1.5] text-muted">
                    {alert.place} ·{" "}
                    {dioceseHref ? (
                      <a href={dioceseHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:text-foreground">
                        {alert.diocese} ↗
                      </a>
                    ) : (
                      alert.diocese
                    )}
                  </p>
                  <p className="mt-2">
                    <EndStatePill value={status.value} label={status.label} />
                  </p>
                  <div className={`mt-2.5 p-3 ${situationClass}`}>
                    <p className="text-site-nav font-bold uppercase tracking-[0.07em] text-foreground">
                      {tag}
                    </p>
                    <p className="mt-1 text-home-card-copy text-muted">
                      {twoSentences(alert.whatChanged)}
                    </p>
                    <p className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1 text-home-card-copy font-semibold text-accent">
                      {href && <Link href={href}>Profile</Link>}
                      {campaign?.hearthUrl && (
                        <a href={campaign.hearthUrl} target="_blank" rel="noopener noreferrer">What&rsquo;s happening</a>
                      )}
                      {campaign?.actionUrl && (
                        <a href={campaign.actionUrl} target="_blank" rel="noopener noreferrer">{campaign.actionLabel} →</a>
                      )}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-[52px] flex flex-wrap items-center gap-4 pb-6 sm:gap-10">
        <div className="min-w-0 flex-1 basis-[380px]">
        <p className="text-ui-label font-bold uppercase tracking-[0.08em] text-muted">
          Židinys · The Hearth
        </p>
        <h2 className="mt-1.5 font-serif text-home-hearth-title font-semibold">
          Follow new findings and developments
        </h2>
        <p className="mt-1.5 max-w-[60ch] text-directory-description text-muted">
          Židinys (The Hearth) follows the history — and the unfinished story —
          of America&rsquo;s Lithuanian parishes. It publishes new findings from the
          archives, accounts of what happened to individual parishes, and
          updates from communities working to protect what remains. Subscribe
          to receive each article by email.
        </p>
        </div>
        <p className="mt-4">
          <a
            href="https://blog.saveourlithuanianparishes.org/subscribe"
            className="inline-block bg-accent px-[22px] py-[11px] text-body-copy font-bold text-white transition-colors hover:bg-foreground"
          >
            Subscribe to Židinys
          </a>
        </p>
      </section>
    </div>
  );
}
