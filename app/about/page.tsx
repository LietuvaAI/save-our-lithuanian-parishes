import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import registry from "@/data/registry-unified.json";
import alertsData from "@/data/alerts.json";
import {
  parishes,
  figures,
  getParishSituation,
  type Parish,
  type ParishSituation,
} from "@/lib/parishes";

// ---------------------------------------------------------------------------
// Registry-level totals (full documented universe)
// ---------------------------------------------------------------------------
const regParishes = (
  registry as {
    parishes: {
      country?: string;
      city?: string;
      congregation_class?: string;
      sources?: { ethnic_status?: string }[];
    }[];
  }
).parishes;

const isRealParish = (p: (typeof regParishes)[number]) =>
  !(p.sources ?? []).some((s) => /no parish/i.test(s.ethnic_status ?? ""));
const isUS = (p: (typeof regParishes)[number]) =>
  p.country !== "CA" &&
  !/buenos aires|argentin|rosario/i.test(p.city ?? "");

const usParishesAll = regParishes.filter((p) => isRealParish(p) && isUS(p));
const REG_TOTAL = usParishesAll.length;
const REG_ETHNIC = usParishesAll.filter(
  (p) => p.congregation_class === "roman_catholic"
).length;
const REG_NATCATH = usParishesAll.filter(
  (p) => p.congregation_class === "national_catholic_pncc"
).length;
const REG_PROTESTANT = usParishesAll.filter(
  (p) => p.congregation_class === "non_catholic_christian"
).length;
const REG_INDEP = usParishesAll.filter(
  (p) => p.congregation_class === "independent_catholic"
).length;
const REG_INDEP_LABEL =
  REG_INDEP === 1
    ? "1 independent Catholic record"
    : `${REG_INDEP} independent Catholic records`;

export const metadata: Metadata = {
  title: "About",
  description:
    "What happened to America's Lithuanian parishes — every building, every community, every ending and every survival.",
};

// ---------------------------------------------------------------------------
// Photo lookup from sustainability-watch entries
// ---------------------------------------------------------------------------
type WatchPhotoEntry = {
  parishLink?: string;
  photo?: {
    url?: string;
    alt?: string;
  };
};

type AlertsPayload = {
  sustainabilityWatch?: WatchPhotoEntry[];
};

const photoBySlug = new Map<string, { url: string; alt: string }>();
for (const entry of (alertsData as AlertsPayload).sustainabilityWatch ?? []) {
  if (entry.photo?.url && entry.parishLink) {
    const slug = entry.parishLink.replace(/^\/parishes\//, "");
    photoBySlug.set(slug, {
      url: entry.photo.url,
      alt: entry.photo.alt ?? "Parish photo",
    });
  }
}

// ---------------------------------------------------------------------------
// Data helpers
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

function ParishLine({ pw }: { pw: ParishWithSituation }) {
  const { parish: p, situation: s } = pw;
  const photo = photoBySlug.get(p.slug);
  return (
    <li>
      <Link
        href={`/parishes/${p.slug}`}
        className="group flex gap-3 rounded-lg border border-rule px-4 py-3 hover:border-foreground/40 transition-colors"
      >
        {photo && (
          <div className="w-16 h-12 shrink-0 overflow-hidden rounded mt-0.5">
            <Image
              src={photo.url}
              alt={photo.alt}
              width={64}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-medium group-hover:underline">{p.nameLt}</span>
            <span className="text-sm text-muted">
              {p.city}, {p.state}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted leading-relaxed">{s.situation}</p>
          {s.current_use && s.current_use !== "Unknown" && (
            <p className="mt-0.5 text-xs text-muted">Now: {s.current_use}</p>
          )}
        </div>
      </Link>
    </li>
  );
}

function SectionAnchor({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="font-serif text-2xl font-semibold scroll-mt-20">
      {children}
    </h2>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AboutPage() {
  const all = loadAll();
  const us = all.filter((x) => !x.parish.comparator);
  const ca = all.filter((x) => x.parish.comparator);

  // ── Ownership data ──
  const dioceseOwned = us.filter((x) => x.parish.ownership === "diocese_rc");
  const communityOwned = us.filter((x) => x.parish.ownership !== "diocese_rc");
  const dioceseStanding = dioceseOwned.filter(
    (x) => x.parish.endingMode === "standing"
  );
  const dioceseClosed = dioceseOwned.filter(
    (x) => x.parish.endingMode === "diocese_closed"
  );
  const dioceseUnresolved = dioceseOwned.filter(
    (x) => x.parish.endingMode === "undecided"
  );
  const communityStanding = communityOwned.filter(
    (x) => x.parish.endingMode === "standing"
  );
  const communityDecided = communityOwned.filter(
    (x) => x.parish.endingMode === "community_decided"
  );
  const coalRegion = us.filter((x) => x.parish.coalRegion);
  const coalDioceseOwned = coalRegion.filter(
    (x) => x.parish.ownership === "diocese_rc"
  );
  const coalDioceseClosed = coalDioceseOwned.filter(
    (x) => x.parish.endingMode === "diocese_closed"
  );
  const coalDioceseStanding = coalDioceseOwned.filter(
    (x) => x.parish.endingMode === "standing"
  );
  const coalDioceseUnresolved = coalDioceseOwned.filter(
    (x) => x.parish.endingMode === "undecided"
  );

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Hero */}
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        About
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        Lithuanian immigrants built and sustained {REG_TOTAL} documented
        parish and congregation records across the United States — schools,
        choirs, cemeteries, and communities around each one. This is why we
        keep the record of what happened to them.
      </p>

      {/* ── The data ── */}
      <section className="mt-8">
        <SectionAnchor id="the-data">The data</SectionAnchor>
        <div className="mt-3 space-y-4 leading-relaxed text-sm text-muted">
          <p>
            The record draws on the full run of the <em>Draugas</em> archive
            since 1909, published parish histories, and contemporary sources. Its
            core is the 2008–2026 archive: 2,768 issues, searched in full. Every
            fact in{" "}
            <Link href="/record" className="underline hover:text-foreground">
              the record
            </Link>{" "}
            traces to a dated, published issue. All figures are recalculated
            automatically from the parish record at every update — if a number
            disagrees with the verified research, the update is blocked until the
            discrepancy is resolved. The dataset is open:{" "}
            <a
              href="https://github.com/LietuvaAI/save-our-lithuanian-parishes"
              className="underline hover:text-foreground"
            >
              check our numbers
            </a>
            .
          </p>
          <p>
            A unified research registry joins the <em>Draugas</em> core with
            four further source axes: the 1909–2007 <em>Draugas</em> archive,
            read issue by issue; William
            Wolkovich-Valkavičius&rsquo;s three-volume{" "}
            <em>Lithuanian Religious Life in America</em>; contemporary status
            sources; and the national closure-reversal research. Full
            methods, copyright handling, and what is deliberately held back:{" "}
            <Link href="/about-the-data" className="underline hover:text-foreground">
              About the data
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── What this record does not argue ── */}
      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">
          What this record does not argue
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          This record documents what happened. It does not propose that any
          parish leave the Roman Catholic Church — the National Catholic
          parishes appear here as historical witness, not as a recommendation.{" "}
          <Link
            href="/what-canon-law-says"
            className="underline hover:text-foreground"
          >
            What canon law says
          </Link>
          .
        </p>
      </section>

      {/* ── The data at a glance ── */}
      <section className="mt-12">
        <SectionAnchor id="numbers">The data at a glance</SectionAnchor>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {REG_TOTAL} U.S. Lithuanian parish and congregation records documented
          — {REG_ETHNIC} Roman Catholic ethnic (national) parishes,{" "}
          {REG_NATCATH} Lithuanian National Catholic parishes,{" "}
          {REG_PROTESTANT} Protestant or non-Catholic Christian congregations,
          and {REG_INDEP_LABEL}. The full dataset — every
          record, its Lithuanian identity, building fate, and alert status — is
          in{" "}
          <Link href="/record" className="underline hover:text-foreground">
            the record
          </Link>
          , filterable by every dimension. The{" "}
          <Link href="/by-diocese" className="underline hover:text-foreground">
            diocesan view
          </Link>{" "}
          groups parishes by the Catholic diocese responsible for each one.
        </p>
      </section>

      {/* ── Ownership and survival ── */}
      <section className="mt-14">
        <SectionAnchor id="ownership">Ownership and survival</SectionAnchor>
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
              {dioceseClosed.length} closed by diocese
            </p>
            {dioceseUnresolved.length > 0 && (
              <p className="mt-1 text-xs text-muted">
                {dioceseUnresolved.length} unresolved
              </p>
            )}
            <p className="mt-2 text-sm">
              {Math.round(
                (dioceseClosed.length / dioceseOwned.length) *
                  100
              )}
              % closed by diocese
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
              {communityDecided.length} ended on their own terms
            </p>
            <p className="mt-2 text-sm">0% closed by outside authority</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted leading-relaxed">
          Of the {communityOwned.length} community-owned parishes in the record —
          National Catholic and Lutheran — not one was closed by an outside
          authority. Every ending was the community&rsquo;s own decision. Among
          the {dioceseOwned.length} diocese-owned parishes,{" "}
          {dioceseClosed.length} were closed by the diocese and{" "}
          {dioceseUnresolved.length} remain unresolved.
        </p>
      </section>

      {/* ── Coal region ── */}
      <section className="mt-14">
        <SectionAnchor id="coal-region">
          The Pennsylvania coal region
        </SectionAnchor>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          {coalRegion.length} Lithuanian parishes in the northeastern
          Pennsylvania coal region — the densest Lithuanian settlement in
          America. {coalDioceseClosed.length} of the{" "}
          {coalDioceseOwned.length} diocese-owned ones are now closed by the
          diocese, {coalDioceseStanding.length} remain standing under diocesan
          ownership, and {coalDioceseUnresolved.length}{" "}
          {coalDioceseUnresolved.length === 1 ? "remains" : "remain"} unresolved.
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

      {/* ── Canadian comparators ── */}
      {ca.length > 0 && (
        <section className="mt-14">
          <SectionAnchor id="comparators">
            The Canadian comparators
          </SectionAnchor>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            {ca.length} Canadian Lithuanian parishes, documented for contrast. In
            Quebec, civil law gives parishes — not the diocese — juridical
            ownership of their own property. The diocese cannot act unilaterally.
            These parishes survived.
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

      {/* ── What communities can do ── */}
      <section className="mt-14">
        <SectionAnchor id="what-can-be-done">What communities can do</SectionAnchor>
        <p className="mt-2 leading-relaxed">
          Across the United States, parish closures have been reversed —{" "}
          <Link href="/reversals" className="underline hover:text-foreground">
            26 documented cases
          </Link>{" "}
          — by the Church&rsquo;s own law applied in time. None of these were
          Lithuanian parishes. They are documented here as precedent for every
          community facing the same process.
        </p>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/start-here"
            className="rounded-lg border border-rule p-4 hover:border-foreground/40 transition-colors"
          >
            <p className="font-medium">Facing a Closure</p>
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
              26 reversed closures — none Lithuanian
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

      {/* ── Why we keep this record ── */}
      <section className="mt-14">
        <SectionAnchor id="why">Why we keep this record</SectionAnchor>
        <div className="mt-3 space-y-4 leading-relaxed">
          <p>
            When the Lithuanian press was banned under the Tsars, Bishop Motiejus
            Valančius organized a network — the <em>knygnešiai</em>, the book
            carriers — that moved the printed word hand to hand across the border,
            because the institutions that should have carried it would not.
            Lithuanian identity survived forty years of that ban because ordinary
            people built their own information network.
          </p>
          <p>
            This project works the same way. Decisions about parish closures are
            made inside diocesan processes; the communities that built the
            parishes are often the last to understand what is coming. So we keep
            the record ourselves — open, sourced, and growing: backward through
            the archives, and forward through{" "}
            <Link href="/report" className="underline hover:text-foreground">
              reports from parishes
            </Link>{" "}
            today.
          </p>
          <p className="text-muted">
            The record is Lithuanian. The legal guidance is universal —
            those pages are written for any parish, of any heritage, facing the
            same process.
          </p>
        </div>
      </section>

      {/* ── Subscribe + Report ── */}
      <div className="mt-14 rounded-lg border border-rule p-5">
        <p className="font-medium">Follow the record</p>
        <p className="mt-1 text-sm text-muted">
          Closure alerts, parish case files, and updates — on{" "}
          <a
            href="https://blog.saveourlithuanianparishes.org"
            className="underline hover:text-foreground"
          >
            Židinys (The Hearth)
          </a>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href="https://blog.saveourlithuanianparishes.org/subscribe"
            className="inline-block rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "var(--mark-closed)" }}
          >
            Subscribe
          </a>
          <Link
            href="/report"
            className="inline-block rounded-md border border-rule px-4 py-2 text-sm font-medium hover:border-foreground transition-colors"
          >
            Report from your parish
          </Link>
        </div>
      </div>

      {/* ── Provenance ── */}
      <p className="mt-10 text-sm text-muted border-t border-rule pt-4">
        All figures on this page are computed from the parish record (
        {figures.corpusScope}). The dataset is open —{" "}
        <a
          href="https://github.com/LietuvaAI/save-our-lithuanian-parishes"
          className="underline hover:text-foreground"
        >
          check our numbers
        </a>
        .
      </p>
    </article>
  );
}
