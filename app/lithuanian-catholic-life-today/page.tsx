import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LivingNetworkMap from "@/components/LivingNetworkMap";
import { getClearedPhoto } from "@/lib/photos";
import {
  livingNetworkView,
  type LivingNetworkCard as LivingNetworkCardType,
  type LivingNetworkSituation,
  type TrackedCard as TrackedCardType,
  type WiderLifeCard,
} from "@/lib/living-network-view";

export const metadata: Metadata = {
  title: "The Living Network",
  description:
    "The current network of Lithuanian Catholic parishes, missions, hosted Masses, religious houses, and other documented communities in the United States.",
};

function SectionHeader({
  title,
  count,
  children,
}: {
  title: string;
  count: string | number;
  children: React.ReactNode;
}) {
  return (
    <header>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-foreground pb-2">
        <h2 className="font-serif text-directory-empty font-semibold leading-tight">
          {title}
        </h2>
        <span className="font-sans text-directory-control font-semibold tabular-nums text-muted">
          {count}
        </span>
      </div>
      <p className="mt-2 max-w-[76ch] text-directory-description leading-[1.55] text-[#57534e]">
        {children}
      </p>
    </header>
  );
}

function DrawingFrame({
  portraitKey,
  href,
  label,
}: {
  portraitKey: string | null;
  href: string | null;
  label: string;
}) {
  const portrait = portraitKey ? getClearedPhoto(portraitKey) : null;
  const frame = (
    <span
      className="relative block aspect-[3/2] overflow-hidden border border-[#efece6] bg-[#faf7f1]"
      title={portrait?.attribution}
    >
      {portrait ? (
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          sizes="(max-width: 640px) 100vw, 240px"
          className="object-contain mix-blend-multiply"
        />
      ) : null}
    </span>
  );

  return href ? (
    <Link href={href} aria-label={`Open ${label}`} className="block">
      {frame}
    </Link>
  ) : (
    frame
  );
}

function SituationFlag({ situation }: { situation: LivingNetworkSituation }) {
  const box =
    situation.kind === "active"
      ? "bg-[#f8efef]"
      : situation.kind === "building"
        ? "bg-[#f5edda]"
        : "bg-[#f1efeb]";
  const tagColor =
    situation.kind === "watch" ? "text-muted" : "text-accent";

  return (
    <aside className={`mt-2 px-2.5 py-2 ${box}`}>
      <p
        className={`font-sans text-ui-label font-bold uppercase tracking-[0.07em] ${tagColor}`}
      >
        {situation.tag}
      </p>
      <p className="mt-1 text-directory-footnote leading-[1.55] text-[#57534e]">
        {situation.text}
      </p>
      {situation.hearthUrl || situation.actionUrl ? (
        <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-directory-footnote font-semibold">
          {situation.hearthUrl ? (
            <a
              href={situation.hearthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 hover:text-foreground"
            >
              What&rsquo;s happening
            </a>
          ) : null}
          {situation.actionUrl ? (
            <a
              href={situation.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 hover:text-foreground"
            >
              {situation.actionLabel} →
            </a>
          ) : null}
        </p>
      ) : null}
    </aside>
  );
}

function NetworkCard({ card }: { card: LivingNetworkCardType }) {
  const portrait = getClearedPhoto(card.portraitKey);
  if (
    ["active_parish", "active_mission", "mass_continues"].includes(
      card.networkClass,
    ) &&
    !portrait
  ) {
    throw new Error(`${card.id}: current-worship card lacks cleared line art`);
  }
  const tagColor =
    card.networkClass === "active_parish" ||
    card.networkClass === "active_mission"
      ? "text-[#2d6a4f]"
      : card.networkClass === "mass_continues"
        ? "text-[#8a7a4e]"
        : "text-muted";
  const draugasPage = card.draugasEvidence.page?.match(
    /\bp(?:p)?\.\s*(\d+)\b/i,
  )?.[1];
  const draugasUrl = draugasPage
    ? `${card.draugasEvidence.url.split("#")[0]}#page=${draugasPage}`
    : card.draugasEvidence.url;

  return (
    <article id={card.anchor} className="min-w-0 scroll-mt-5">
      <DrawingFrame
        portraitKey={card.portraitKey}
        href={card.profileHref}
        label={`${card.nameEn} profile`}
      />
      <p
        className={`mt-2 font-sans text-ui-label font-bold uppercase tracking-[0.06em] ${tagColor}`}
      >
        {card.typeLabel}
      </p>
      <h3 className="mt-1 font-serif text-card-title font-semibold leading-tight">
        {card.profileHref ? (
          <Link href={card.profileHref} className="hover:text-accent">
            {card.nameEn}
          </Link>
        ) : (
          card.nameEn
        )}
      </h3>
      <p className="mt-0.5 text-directory-footnote italic leading-snug text-muted">
        {card.nameLt}
      </p>
      <p className="mt-1 text-support-copy leading-snug text-muted">
        {card.city}, {card.state}
        {card.founded ? ` · est. ${card.founded}` : ""}
      </p>
      <p className="mt-1.5 text-support-copy leading-relaxed text-[#57534e]">
        {card.ministry}
      </p>
      {card.clergy ? (
        <p className="mt-1 text-directory-footnote leading-relaxed text-muted">
          {card.clergy}
        </p>
      ) : null}
      {card.massCadence ? (
        <p className="text-directory-footnote leading-relaxed text-muted">
          {card.massCadence}
        </p>
      ) : null}
      {card.checked ? (
        <p className="mt-1 text-ui-label tabular-nums text-muted">
          Checked {card.checked}
        </p>
      ) : null}
      {card.officialSite ? (
        <p className="mt-1 text-directory-footnote">
          <a
            href={card.officialSite}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:text-foreground"
          >
            Official website
          </a>
        </p>
      ) : null}
      <details className="mt-2 border-l border-[#d6c8ad] pl-2 text-directory-footnote text-muted">
        <summary className="cursor-pointer list-none font-semibold text-foreground marker:hidden">
          Draugas source · {card.draugasEvidence.date}
          {card.draugasEvidence.page
            ? ` · ${card.draugasEvidence.page}`
            : " · public article"}
          {card.draugasEvidence.access === "subscriber"
            ? " · subscriber archive"
            : ""}
        </summary>
        <p className="mt-1 leading-snug">
          <a
            href={draugasUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:text-foreground"
          >
            {card.draugasEvidence.title} ↗
          </a>
        </p>
        {card.draugasEvidence.excerpt ? (
          <blockquote className="mt-1 border-l border-rule pl-2 italic leading-relaxed text-[#57534e]">
            “{card.draugasEvidence.excerpt}”
          </blockquote>
        ) : null}
        <p className="mt-1 leading-relaxed">
          <span className="font-semibold text-foreground">What it supports:</span>{" "}
          {card.draugasEvidence.supports}
        </p>
      </details>
      {card.situation ? <SituationFlag situation={card.situation} /> : null}
    </article>
  );
}

function WiderCard({ card }: { card: WiderLifeCard }) {
  if (!getClearedPhoto(card.portraitKey)) {
    throw new Error(`${card.id}: wider Catholic-life card lacks cleared line art`);
  }

  return (
    <article id={card.anchor} className="min-w-0 scroll-mt-5">
      <DrawingFrame
        portraitKey={card.portraitKey}
        href={card.profileHref}
        label={`${card.nameEn} record`}
      />
      <p className="mt-2 font-sans text-ui-label font-bold uppercase tracking-[0.06em] text-[#2d6a4f]">
        {card.typeLabel}
      </p>
      <h3 className="mt-1 font-serif text-card-title font-semibold leading-tight">
        <Link href={card.profileHref} className="hover:text-accent">
          {card.nameEn}
        </Link>
      </h3>
      <p className="mt-0.5 text-directory-footnote italic leading-snug text-muted">
        {card.nameLt}
      </p>
      <p className="mt-1 text-support-copy text-muted">
        {card.city}, {card.state}
      </p>
      <p className="mt-1.5 text-support-copy leading-relaxed text-[#57534e]">
        {card.explanation}
      </p>
      <p className="mt-1 text-directory-footnote">
        <a
          href={card.officialSite}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 hover:text-foreground"
        >
          Official website
        </a>
      </p>
    </article>
  );
}

function TrackedCard({ card }: { card: TrackedCardType }) {
  return (
    <article id={card.anchor} className="min-w-0 scroll-mt-5">
      <DrawingFrame
        portraitKey={card.portraitKey}
        href={card.profileHref}
        label={`${card.name} profile`}
      />
      <h3 className="mt-2 font-serif text-card-title font-semibold leading-tight">
        {card.profileHref ? (
          <Link href={card.profileHref} className="hover:text-accent">
            {card.name}
          </Link>
        ) : (
          card.name
        )}
      </h3>
      <p className="mt-1 text-support-copy leading-snug text-muted">
        {card.place} · {card.situation.diocese}
      </p>
      <SituationFlag situation={card.situation} />
    </article>
  );
}

function StatMark({ kind }: { kind: "parish" | "mission" | "hosted" | "state" }) {
  const classes =
    kind === "parish"
      ? "rounded-full bg-[#2d6a4f]"
      : kind === "mission"
        ? "rounded-full border-2 border-[#2d6a4f] bg-background"
        : kind === "hosted"
          ? "rounded-full border border-[#8a7a4e] bg-[#d5c28b]"
          : "rounded-full border border-dashed border-muted";
  return <span aria-hidden className={`inline-block size-3 ${classes}`} />;
}

export default function LithuanianCatholicLifeTodayPage() {
  const view = livingNetworkView;

  return (
    <article className="mx-auto max-w-[1080px] px-4 pb-20 pt-7 sm:px-6">
      <p className="font-sans text-ui-label font-semibold uppercase tracking-[0.09em] text-muted">
        Lithuanian Catholic life today · checked {view.observed}
      </p>
      <h1 className="mt-3 max-w-[30ch] font-serif text-outcomes-title font-semibold leading-[1.16] tracking-[-0.015em]">
        The living network
      </h1>
      <p className="mt-2 max-w-[66ch] font-serif text-directory-section leading-[1.4] text-[#57534e]">
        Of the {view.institutionCount} Lithuanian Catholic parishes and missions
        ever founded in America, worship still gathers regularly in{" "}
        <strong className="font-semibold text-foreground">
          {view.counts.places} places
        </strong>{" "}
        across {view.counts.states} states — {view.counts.parishes} parishes,{" "}
        {view.counts.missions} missions, and {view.counts.hosted} Lithuanian
        Masses hosted inside other parishes.
      </p>

      <section className="mt-7 border-t border-foreground pt-5">
        <div className="flex flex-wrap items-start gap-x-8 gap-y-7">
          <div className="min-w-0 flex-[1.6_1_420px]">
            <LivingNetworkMap
              regularPoints={view.regularMapPoints}
              widerPoints={view.widerMapPoints}
              placeCount={view.counts.places}
              stateCount={view.counts.states}
            />
          </div>
          <div className="min-w-0 flex-[1_1_280px]">
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <div className="col-span-2 border-b border-rule pb-3">
                <p className="font-serif text-network-stat font-bold leading-none tabular-nums">
                  {view.counts.places}
                </p>
                <p className="mt-1 text-directory-description leading-snug text-[#57534e]">
                  places still gather for regular Lithuanian worship
                </p>
              </div>
              {[
                ["parish", view.counts.parishes, "Lithuanian parishes"],
                ["mission", view.counts.missions, "Lithuanian missions"],
                ["hosted", view.counts.hosted, "hosted Lithuanian Masses"],
                ["state", view.counts.states, "states, coast to coast"],
              ].map(([kind, number, label]) => (
                <div key={String(kind)}>
                  <p className="flex items-baseline gap-2">
                    <StatMark kind={kind as "parish" | "mission" | "hosted" | "state"} />
                    <span className="font-serif text-masthead-title font-bold leading-none tabular-nums">
                      {number}
                    </span>
                  </p>
                  <p className="mt-1 text-directory-footnote leading-snug text-[#57534e]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-directory-footnote leading-[1.6] text-muted">
              “Lithuanian parish” and “Lithuanian mission” mean a community
              listed on{" "}
              <a
                href={view.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-accent"
              >
                Sielovada
              </a>{" "}
              — the Lithuanian Bishops&rsquo; Conference directory of Lithuanian
              pastoral care abroad — with verified current Lithuanian ministry.
              A parish can remain open without being part of this network.
            </p>
            <p className="mt-2 text-directory-footnote leading-relaxed text-muted">
              Source:{" "}
              <a
                href={view.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-accent"
              >
                {view.sourceTitle}
              </a>{" "}
              ·{" "}
              <Link href="/about-the-data" className="underline hover:text-accent">
                About the data
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          title="Active Lithuanian parishes and missions"
          count={`${view.counts.parishes} parishes + ${view.counts.missions} missions`}
        >
          These {view.counts.parishes} parishes and {view.counts.missions}{" "}
          missions are Lithuanian-led and hold regular Lithuanian worship.
          Missions use a hollow map mark.
        </SectionHeader>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-x-[18px] gap-y-5">
          {view.activeCards.map((card) => (
            <NetworkCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          title="Lithuanian Masses hosted by other parishes"
          count={view.counts.hosted}
        >
          In these places the Lithuanian parish itself is gone, but a Lithuanian
          Mass continues inside a parish that is no longer Lithuanian-led —
          never counted as an active Lithuanian parish.
        </SectionHeader>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-x-[18px] gap-y-5">
          {view.hostedCards.map((card) => (
            <NetworkCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader title="Wider Lithuanian Catholic life" count={view.counts.wider}>
          Beyond the parish network, Lithuanian Catholic life continues at the
          Franciscan friary in Kennebunk, the Immaculate Conception convent and
          center in Putnam, and through occasional Lithuanian Masses in Atlanta.
          Together they show forms of Catholic life that remain active outside
          the regular parish-and-mission network.
        </SectionHeader>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-x-[18px] gap-y-5">
          {view.widerCards.map((card) => (
            <WiderCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          title="Listed by Sielovada, without regular Lithuanian worship"
          count={view.counts.otherDirectory}
        >
          Sielovada lists {view.counts.directory} U.S. entries: the{" "}
          {view.counts.places} regular-worship places above, the Kennebunk
          Franciscan house shown in the wider-life section, and these{" "}
          {view.counts.otherDirectory} remaining entries. One is a contested
          closure; four have no verified regular Lithuanian Mass. Those absences
          are part of the record too.
        </SectionHeader>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-x-[18px] gap-y-5">
          {view.otherDirectoryCards.map((card) => (
            <NetworkCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader title="Also being tracked" count={view.counts.tracked}>
          These communities and buildings sit outside the current Sielovada
          listing, but their futures remain active questions: closure appeals,
          diocesan planning, buildings on the market, and proposed demolition.
        </SectionHeader>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-x-[18px] gap-y-5">
          {view.trackedCards.map((card) => (
            <TrackedCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-rule pt-4 text-directory-footnote leading-relaxed text-muted">
        Every community name links to its full record where one exists. Map
        positions come from the project&rsquo;s shared geographic layer;
        Washington is placed at city level. Network checked {view.observed}.
        Data revision {view.generated} · {view.revision}.
      </footer>
    </article>
  );
}
