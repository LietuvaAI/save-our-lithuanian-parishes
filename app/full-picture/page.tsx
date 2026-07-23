import type { Metadata } from "next";
import Link from "next/link";
import { MarkIcon } from "@/components/marks";
import {
  parishes,
  usParishes,
  comparatorParishes,
  figures,
  getParishSituation,
  ENDING_MODE_LABEL,
  BUILDING_FATE_LABEL,
  LITHUANIAN_IDENTITY_LABEL,
  OWNERSHIP_SHORT,
  STATUS_LABEL,
  type BuildingFate,
  type LithuanianIdentity,
  type Parish,
  type ParishSituation,
} from "@/lib/parishes";

export const metadata: Metadata = {
  title: "The Full Picture",
  description:
    "What happened to America's Lithuanian parishes — every building, every community, every ending and every survival — and why it matters now.",
};

// ---------------------------------------------------------------------------
// Computed data from the situation overlay
// ---------------------------------------------------------------------------

interface ParishWithSituation {
  parish: Parish;
  situation: ParishSituation;
}

function loadAll(): ParishWithSituation[] {
  return parishes
    .map((p) => ({ parish: p, situation: getParishSituation(p.slug)! }))
    .filter((x) => x.situation != null);
}

function countBy<K extends string>(
  list: ParishWithSituation[],
  key: (x: ParishWithSituation) => K
): Record<K, number> {
  const out = {} as Record<K, number>;
  for (const x of list) {
    const k = key(x);
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="text-center">
      <p className="font-serif text-4xl font-semibold">{n}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

function ParishLine({ pw }: { pw: ParishWithSituation }) {
  const { parish: p, situation: s } = pw;
  return (
    <li>
      <Link
        href={`/parishes/${p.slug}`}
        className="group block rounded-lg border border-rule px-4 py-3 hover:border-foreground/40 transition-colors"
      >
        <div className="flex items-baseline gap-2">
          <MarkIcon mode={p.endingMode} size={10} />
          <span className="font-medium group-hover:underline">{p.nameLt}</span>
          <span className="text-sm text-muted">
            {p.city}, {p.state}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          {s.situation}
        </p>
        {s.current_use && s.current_use !== "Unknown" && (
          <p className="mt-0.5 text-xs text-muted">
            Now: {s.current_use}
          </p>
        )}
      </Link>
    </li>
  );
}

function SectionAnchor({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-serif text-2xl font-semibold scroll-mt-20">
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FullPicturePage() {
  const all = loadAll();
  const us = all.filter((x) => !x.parish.comparator);
  const ca = all.filter((x) => x.parish.comparator);

  // Building fate
  const byFate = countBy(us, (x) => x.situation.building_fate);
  const fateOrder: BuildingFate[] = [
    "demolished",
    "repurposed_religious",
    "repurposed_secular",
    "derelict",
    "standing",
    "unknown",
  ];

  // Lithuanian identity
  const byIdentity = countBy(us, (x) => x.situation.lithuanian_identity);
  const identityOrder: LithuanianIdentity[] = [
    "active_parish",
    "mass_continues",
    "ethnically_transferred",
    "lost",
  ];

  // Standing parishes (the survivors)
  const standing = us
    .filter((x) => x.situation.lithuanian_identity === "active_parish")
    .sort((a, b) => a.parish.city.localeCompare(b.parish.city));

  // Mass-continues (partial survival)
  const massContinues = us
    .filter((x) => x.situation.lithuanian_identity === "mass_continues")
    .sort((a, b) => a.parish.city.localeCompare(b.parish.city));

  // Demolished
  const demolished = us
    .filter((x) => x.situation.building_fate === "demolished")
    .sort((a, b) => a.parish.city.localeCompare(b.parish.city));

  // Ethnically transferred
  const transferred = us
    .filter((x) => x.situation.lithuanian_identity === "ethnically_transferred")
    .sort((a, b) => a.parish.city.localeCompare(b.parish.city));

  // Diocese-owned vs community-owned survival
  const dioceseOwned = us.filter((x) => x.parish.ownership === "diocese_rc");
  const communityOwned = us.filter((x) => x.parish.ownership !== "diocese_rc");
  const dioceseStanding = dioceseOwned.filter(
    (x) => x.parish.endingMode === "standing"
  );
  const communityStanding = communityOwned.filter(
    (x) => x.parish.endingMode === "standing"
  );

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* ----------------------------------------------------------------- */}
      {/* HERO                                                               */}
      {/* ----------------------------------------------------------------- */}
      <p className="text-xs uppercase tracking-widest text-muted">
        The full picture
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        What happened to our parishes
      </h1>

      {/* PLACEHOLDER: Vilija's flagship article text goes here */}
      <div className="mt-6 space-y-4 leading-relaxed">
        <p className="text-lg text-muted">
          The record of every Lithuanian parish we can document in the United
          States — what happened to it, where it stands now, and what the
          communities still deciding their future can learn from those that were
          lost and from those that fought and won.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* THE NUMBERS                                                        */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-12">
        <SectionAnchor id="numbers">By the numbers</SectionAnchor>
        <p className="mt-2 text-sm text-muted">
          {us.length} U.S. parishes case-filed so far, plus{" "}
          {ca.length} Canadian comparators. These figures are computed
          automatically from the parish record — none are typed in by hand.
        </p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Stat n={figures.endingMode.diocese_closed} label="Closed by the diocese" />
          <Stat
            n={figures.endingMode.standing}
            label="Still standing"
          />
          <Stat n={figures.endingMode.community_decided} label="Ended on community terms" />
          <Stat n={figures.endingMode.undecided} label="Unresolved" />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* WHAT HAPPENED TO THE BUILDINGS                                     */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionAnchor id="buildings">What happened to the buildings</SectionAnchor>
        <p className="mt-2 text-sm text-muted">
          A parish closure is an administrative act. What happens to the
          building afterwards is a separate, often worse, story.
        </p>
        <dl className="mt-6 space-y-3">
          {fateOrder.map((fate) => {
            const n = byFate[fate] || 0;
            if (n === 0) return null;
            const pct = Math.round((n / us.length) * 100);
            return (
              <div key={fate} className="flex items-baseline gap-3">
                <dd className="font-serif text-2xl font-semibold w-10 text-right shrink-0">
                  {n}
                </dd>
                <div className="flex-1">
                  <dt className="font-medium">{BUILDING_FATE_LABEL[fate]}</dt>
                  <div className="mt-1 h-2 rounded-full bg-rule overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background:
                          fate === "demolished"
                            ? "var(--mark-closed)"
                            : fate === "standing"
                              ? "var(--mark-standing)"
                              : "var(--foreground)",
                        opacity: fate === "standing" || fate === "demolished" ? 1 : 0.4,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </dl>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* LITHUANIAN IDENTITY                                                */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionAnchor id="identity">Lithuanian identity today</SectionAnchor>
        <p className="mt-2 text-sm text-muted">
          Closure is not the only way to lose a Lithuanian parish. Some
          buildings survive — but the Lithuanian community inside them does
          not.
        </p>
        <dl className="mt-6 space-y-3">
          {identityOrder.map((id) => {
            const n = byIdentity[id] || 0;
            if (n === 0) return null;
            const pct = Math.round((n / us.length) * 100);
            return (
              <div key={id} className="flex items-baseline gap-3">
                <dd className="font-serif text-2xl font-semibold w-10 text-right shrink-0">
                  {n}
                </dd>
                <div className="flex-1">
                  <dt className="font-medium">
                    {LITHUANIAN_IDENTITY_LABEL[id]}
                  </dt>
                  <div className="mt-1 h-2 rounded-full bg-rule overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background:
                          id === "active_parish"
                            ? "var(--mark-standing)"
                            : id === "lost"
                              ? "var(--mark-closed)"
                              : "var(--foreground)",
                        opacity:
                          id === "active_parish" || id === "lost" ? 1 : 0.4,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </dl>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* OWNERSHIP AND SURVIVAL                                             */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionAnchor id="ownership">Ownership and survival</SectionAnchor>
        <p className="mt-2 text-sm text-muted">
          The single strongest pattern in the record.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-lg border border-rule p-5">
            <p className="text-xs uppercase tracking-wide text-muted">
              Diocese-owned (Roman Catholic)
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold">
              {dioceseOwned.length}
            </p>
            <p className="mt-1 text-sm text-muted">
              {dioceseStanding.length} still standing ·{" "}
              {dioceseOwned.length - dioceseStanding.length} lost
            </p>
            <p className="mt-2 text-sm">
              {Math.round(
                ((dioceseOwned.length - dioceseStanding.length) /
                  dioceseOwned.length) *
                  100
              )}
              % closure rate
            </p>
          </div>
          <div className="rounded-lg border border-rule p-5">
            <p className="text-xs uppercase tracking-wide text-muted">
              Community-owned
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold">
              {communityOwned.length}
            </p>
            <p className="mt-1 text-sm text-muted">
              {communityStanding.length} still standing ·{" "}
              {communityOwned.length - communityStanding.length} closed on
              their own terms
            </p>
            <p className="mt-2 text-sm">
              0% closed by outside authority
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted leading-relaxed">
          Of the {communityOwned.length} community-owned parishes in the
          record — National Catholic and Lutheran — not one was closed by an
          outside authority. Every ending was the community&rsquo;s own
          decision. Among the {dioceseOwned.length} diocese-owned parishes,{" "}
          {figures.endingMode.diocese_closed} were closed by the diocese.
        </p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* THE STANDING PARISHES                                              */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionAnchor id="standing">
          The standing parishes
        </SectionAnchor>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {standing.length} parishes where Lithuanian identity is still
          active — the ones that survived.
        </p>
        <ul className="mt-5 space-y-3">
          {standing.map((pw) => (
            <ParishLine key={pw.parish.slug} pw={pw} />
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* WHERE THE MASS CONTINUES                                           */}
      {/* ----------------------------------------------------------------- */}
      {massContinues.length > 0 && (
        <section className="mt-14">
          <SectionAnchor id="mass-continues">
            Where Lithuanian Mass continues
          </SectionAnchor>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            {massContinues.length} parishes where the Lithuanian Mass still
            exists in some form — shared, transferred, or diminished — but
            not yet gone.
          </p>
          <ul className="mt-5 space-y-3">
            {massContinues.map((pw) => (
              <ParishLine key={pw.parish.slug} pw={pw} />
            ))}
          </ul>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* ETHNICALLY TRANSFERRED                                             */}
      {/* ----------------------------------------------------------------- */}
      {transferred.length > 0 && (
        <section className="mt-14">
          <SectionAnchor id="transferred">
            Ethnically transferred
          </SectionAnchor>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            {transferred.length} parishes where the building survives but
            the Lithuanian community does not — transferred to another
            ethnic or denominational group.
          </p>
          <ul className="mt-5 space-y-3">
            {transferred.map((pw) => (
              <ParishLine key={pw.parish.slug} pw={pw} />
            ))}
          </ul>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* DEMOLISHED                                                         */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionAnchor id="demolished">Demolished</SectionAnchor>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {demolished.length} churches demolished. Some of these were among
          the largest and most beautiful Lithuanian churches in the country.
        </p>
        <ul className="mt-5 space-y-3">
          {demolished.map((pw) => (
            <ParishLine key={pw.parish.slug} pw={pw} />
          ))}
        </ul>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* COAL REGION                                                        */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionAnchor id="coal-region">
          The Pennsylvania coal region
        </SectionAnchor>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {figures.coalRegion.total} Lithuanian parishes in the
          northeastern Pennsylvania coal region — once the densest
          Lithuanian settlement in America.{" "}
          {figures.coalRegion.dioceseOwnedClosed} of the{" "}
          {figures.coalRegion.dioceseOwned} diocese-owned ones are now
          closed. Only {figures.coalRegion.dioceseOwnedStanding} survived
          under diocesan ownership.
        </p>
        <ul className="mt-5 space-y-3">
          {us
            .filter((x) => x.parish.coalRegion)
            .sort((a, b) => a.parish.city.localeCompare(b.parish.city))
            .map((pw) => (
              <ParishLine key={pw.parish.slug} pw={pw} />
            ))}
        </ul>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* THE CANADIAN COMPARATORS                                           */}
      {/* ----------------------------------------------------------------- */}
      {ca.length > 0 && (
        <section className="mt-14">
          <SectionAnchor id="comparators">
            The Canadian comparators
          </SectionAnchor>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            {ca.length} Canadian Lithuanian parishes, documented for
            contrast. In Quebec, civil law gives parishes — not the diocese
            — juridical ownership of their own property. The diocese cannot
            act unilaterally. These parishes survived.
          </p>
          <ul className="mt-5 space-y-3">
            {ca
              .sort((a, b) => a.parish.city.localeCompare(b.parish.city))
              .map((pw) => (
                <ParishLine key={pw.parish.slug} pw={pw} />
              ))}
          </ul>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* WHAT CAN BE DONE                                                   */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionAnchor id="what-can-be-done">
          What communities can do
        </SectionAnchor>
        <p className="mt-2 leading-relaxed">
          The record is not only a memorial. Across the United States,
          parish closures have been reversed —{" "}
          <Link href="/reversals" className="underline hover:text-foreground">
            {(figures as Record<string, unknown>).survivedReviewThenClosed
              ? "documented cases"
              : "26 documented cases"}
          </Link>{" "}
          in three diocesan waves — not by protest alone, and never by
          leaving the Church, but by the Church&rsquo;s own law applied in
          time.
        </p>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/start-here"
            className="rounded-lg border border-rule p-4 hover:border-foreground/40 transition-colors"
          >
            <p className="font-medium">Start Here</p>
            <p className="mt-1 text-sm text-muted">
              Deadlines, rights, and what to do first
            </p>
          </Link>
          <Link
            href="/reversals"
            className="rounded-lg border border-rule p-4 hover:border-foreground/40 transition-colors"
          >
            <p className="font-medium">Where Rome Said No</p>
            <p className="mt-1 text-sm text-muted">
              26 verified closure reversals
            </p>
          </Link>
          <Link
            href="/what-canon-law-says"
            className="rounded-lg border border-rule p-4 hover:border-foreground/40 transition-colors"
          >
            <p className="font-medium">What Canon Law Says</p>
            <p className="mt-1 text-sm text-muted">
              The law that applies — in plain language
            </p>
          </Link>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* WHY WE DO THIS — merged from About                                 */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionAnchor id="why">Why we keep this record</SectionAnchor>
        <div className="mt-3 space-y-4 leading-relaxed">
          <p>
            When the Lithuanian press was banned under the Tsars, Bishop
            Motiejus Valančius organized a network — the{" "}
            <em>knygnešiai</em>, the book carriers — that moved the printed
            word hand to hand across the border, because the institutions
            that should have carried it would not. Lithuanian identity
            survived forty years of that ban because ordinary people built
            their own information network.
          </p>
          <p>
            This project works the same way. Decisions about parish closures
            are made inside diocesan processes; the communities that built
            the parishes are often the last to understand what is coming. So
            we keep the record ourselves — open, sourced, and growing:
            backward through the archives, and forward through{" "}
            <Link href="/report" className="underline hover:text-foreground">
              reports from parishes
            </Link>{" "}
            today.
          </p>
          {/* PLACEHOLDER: "The Hearth and the Deed" flagship article excerpt */}
          <p className="text-muted">
            This site does two things. It keeps the record: what happened to
            the parishes, and who decided it. And it arms the communities
            still deciding — deadlines, procedural rights, and the
            precedents that have{" "}
            <Link
              href="/reversals"
              className="underline hover:text-foreground"
            >
              reversed closures
            </Link>{" "}
            in other dioceses. The record is Lithuanian. The law is
            universal — those pages are written for any parish, of any
            heritage, facing the same process.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* THE RECORD LINK                                                    */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-14">
        <SectionAnchor id="record">Explore the record</SectionAnchor>
        <div className="mt-4">
          <Link
            href="/record"
            className="rounded-lg border border-rule p-5 hover:border-foreground/40 transition-colors inline-block w-full sm:w-auto"
          >
            <p className="font-medium">The Record</p>
            <p className="mt-1 text-sm text-muted">
              Every parish in the research — searchable table with individual
              profiles for each case-filed parish
            </p>
          </Link>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* REPORT CTA                                                         */}
      {/* ----------------------------------------------------------------- */}
      <section className="mt-14 rounded-lg border border-rule p-6">
        <p className="font-serif text-xl font-semibold">
          The record grows through people who were there.
        </p>
        <p className="mt-2 text-muted leading-relaxed">
          Corrections, documents, news from a parish facing a decision now
          — everything strengthens the record.
        </p>
        <p className="mt-4">
          <Link
            href="/report"
            className="inline-block rounded-md px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "var(--mark-closed)" }}
          >
            Report from your parish
          </Link>
        </p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* PROVENANCE                                                         */}
      {/* ----------------------------------------------------------------- */}
      <p className="mt-10 text-sm text-muted border-t border-rule pt-4">
        All figures on this page are computed from the verified parish record
        ({figures.corpusScope}). The dataset is open —{" "}
        <a
          href="https://github.com/LietuvaAI/save-our-lithuanian-parishes"
          className="underline hover:text-foreground"
        >
          check our numbers
        </a>
        . Dispatches and campaigns:{" "}
        <a
          href="https://blog.saveourlithuanianparishes.org"
          className="underline hover:text-foreground"
        >
          the blog
        </a>
        .
      </p>
    </article>
  );
}
