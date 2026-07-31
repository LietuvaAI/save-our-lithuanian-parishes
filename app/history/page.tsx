import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TimelineChart, {
  type TimelineRow,
  type UndatedRow,
} from "@/components/TimelineChart";
import type { FateKey } from "@/components/ParishThreads";
import { scopedParishes, usRegistryParishes } from "@/lib/registry-scope";
import {
  toGroup,
  isAlive,
  isLoss,
} from "@/lib/end-state";
import { BUILDING_FATE_LABEL, type BuildingFate, parishes as libParishes } from "@/lib/parishes";
import mapData from "@/data/map.json";
import photosData from "@/data/photos.json";

export const metadata: Metadata = {
  title: "The History",
  description:
    "A chronological view of the Roman Catholic Lithuanian parish record in the United States, from the first foundations to today.",
};

const firstParishSlug = "sv-jurgio-shenandoah-pa";
const firstParishPhoto = photosData.parishes[firstParishSlug];
const firstParishPoint = mapData.points.find(
  (point) => point.slug === firstParishSlug,
);
const firstParishDraugasIssues = [
  {
    date: "March 27, 2008",
    href: "https://draugas.org/key/2008_reg/2008-03-27-DRAUGASo.pdf",
  },
  {
    date: "October 27, 2009",
    href: "https://draugas.org/key/2009_reg/2009-10-27-DRAUGASo.pdf",
  },
  {
    date: "May 30, 2020",
    href: "https://draugas.org/key/2020_reg/2020-05-30-DRAUGAS.pdf",
  },
  {
    date: "November 1, 2025",
    href: "https://draugas.org/key/2025_reg/2025-11-01-DRAUGASo.pdf",
  },
];

function FirstParishLocatorMap() {
  return (
    <svg
      viewBox="690 105 235 175"
      role="img"
      aria-label="Locator map for St. George Lithuanian parish in Shenandoah, Pennsylvania."
      className="h-auto w-full"
    >
      {mapData.statePaths.map((path, index) => (
        <path
          key={index}
          d={path}
          fill="var(--band)"
          stroke="var(--foreground)"
          strokeOpacity={0.22}
          strokeWidth={0.8}
        />
      ))}
      <path
        d={mapData.stateBorders}
        fill="none"
        stroke="var(--foreground)"
        strokeOpacity={0.22}
        strokeWidth={0.8}
      />
      {firstParishPoint ? (
        <>
          <circle
            cx={firstParishPoint.x}
            cy={firstParishPoint.y}
            r="11"
            fill="none"
            stroke="var(--es-closed)"
            strokeWidth="3"
          />
          <circle
            cx={firstParishPoint.x}
            cy={firstParishPoint.y}
            r="5"
            fill="var(--es-closed)"
            stroke="var(--background)"
            strokeWidth="2"
          />
        </>
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Data builder (server-side; every figure derives from the shared scope)
// ---------------------------------------------------------------------------

function buildData() {
  const all = scopedParishes();

  const dated: TimelineRow[] = [];
  const undated: UndatedRow[] = [];
  const closedFates: Record<FateKey, number> = {
    demolished: 0,
    religious: 0,
    secular: 0,
    derelict: 0,
    standing: 0,
    unrecorded: 0,
  };

  const fateBySlug = new Map(
    libParishes.map((p) => [p.slug, p.buildingFate as BuildingFate | null]),
  );

  for (const p of all) {
    // The closed family's building fates — each parish's thread terminal.
    let fateKey: FateKey | null = null;
    if (p.endState === "demolished") fateKey = "demolished";
    else if (p.endState === "repurposed")
      fateKey =
        p.buildingFate === "repurposed_secular" ? "secular" : "religious";
    else if (p.endState === "closed") {
      if (p.buildingFate === "standing") fateKey = "standing";
      else if (p.buildingFate === "derelict") fateKey = "derelict";
      else fateKey = "unrecorded";
    }
    if (fateKey) closedFates[fateKey]++;

    const fate = fateBySlug.get(p.slug);
    const detail =
      fate && fate !== "unknown" && fate !== "standing"
        ? `Building ${BUILDING_FATE_LABEL[fate].toLowerCase()}`
        : "";

    if (p.founded) {
      dated.push({
        slug: p.slug,
        name: p.name,
        city: p.city,
        state: p.state,
        founded: p.founded,
        closed: p.closed,
        endState: p.endState,
        detail,
        profileHref: p.profileHref,
      });
    } else {
      undated.push({
        slug: p.slug,
        name: p.name,
        city: p.city,
        state: p.state,
        closed: p.closed,
        endState: p.endState,
        profileHref: p.profileHref,
      });
    }
  }

  const standing = all.filter(
    (p) => toGroup(p.endState) === "active_parish" && !p.closed,
  ).length;
  const hostedMass = all.filter(
    (p) => toGroup(p.endState) === "mass_continues" && !p.closed,
  ).length;
  const lost = all.filter((p) => isLoss(p.endState)).length;

  // ── Narrative figures for the timeline section (all record-derived) ──
  const foundedByDecade = new Map<number, number>();
  const closedByDecade = new Map<number, number>();
  for (const p of all) {
    if (p.founded)
      foundedByDecade.set(
        Math.floor(p.founded / 10) * 10,
        (foundedByDecade.get(Math.floor(p.founded / 10) * 10) ?? 0) + 1,
      );
    if (p.closed)
      closedByDecade.set(
        Math.floor(p.closed / 10) * 10,
        (closedByDecade.get(Math.floor(p.closed / 10) * 10) ?? 0) + 1,
      );
  }
  const peak = (m: Map<number, number>) =>
    [...m.entries()].sort((a, b) => b[1] - a[1])[0] ?? [0, 0];
  const [peakFoundDecade, peakFoundN] = peak(foundedByDecade);
  const [peakClosedDecade, peakClosedN] = peak(closedByDecade);
  const closedSince1990 = all.filter(
    (p) => p.closed && p.closed >= 1990,
  ).length;
  const closedSince2020 = all.filter(
    (p) => p.closed && p.closed >= 2020,
  ).length;
  const lifespans = all
    .filter((p) => isLoss(p.endState) && p.founded && p.closed)
    .map((p) => p.closed! - p.founded!)
    .sort((a, b) => a - b);
  const medianLifespan = lifespans.length
    ? lifespans[Math.floor(lifespans.length / 2)]
    : null;
  const oldestAlive = all
    .filter((p) => isAlive(p.endState) && !p.closed && p.founded)
    .sort((a, b) => a.founded! - b.founded!)[0] ?? null;

  return {
    dated,
    undated,
    closedFates,
    standing,
    hostedMass,
    lost,
    total: all.length,
    narrative: {
      peakFoundDecade,
      peakFoundN,
      peakClosedDecade,
      peakClosedN,
      closedSince1990,
      closedSince2020,
      medianLifespan,
      oldestAlive,
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HistoryPage() {
  const {
    dated,
    undated,
    closedFates,
    standing,
    hostedMass,
    lost,
    total,
    narrative,
  } = buildData();
  const fullRecord = usRegistryParishes();
  const fullRecordTotal = fullRecord.length;
  const romanCatholicMissions = fullRecord.filter(
    (entry) =>
      entry.congregation_class === "roman_catholic" &&
      entry.record_type === "misija",
  ).length;
  const otherCommunities = fullRecordTotal - total - romanCatholicMissions;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        A chronological view · 1870s to today
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        The History
      </h1>
      <div className="mt-3 space-y-4 leading-relaxed max-w-3xl">
        <p>
          This history follows the{` ${total} `}Roman Catholic Lithuanian
          parishes documented in{" "}
          <Link href="/record" className="underline hover:text-accent">
            The Record
          </Link>
          . Most were founded between the 1870s and 1960, in coal towns,
          factory cities, and urban neighborhoods from Shenandoah to Chicago,
          with the latest as recent as the 1990s.
        </p>
        <p className="text-sm text-muted">
          The complete Record contains {fullRecordTotal} entries. Its other{" "}
          {fullRecordTotal - total} entries are {romanCatholicMissions} Roman
          Catholic missions and {otherCommunities} National, independent, or
          Protestant communities, which are counted separately from this
          parish history.
        </p>
        <p>
          Of the {total}, {lost} are closed. {closedFates.demolished} of
          their churches have been demolished;{" "}
          {closedFates.religious + closedFates.secular} were sold on &mdash;{" "}
          {closedFates.religious} to other congregations, {closedFates.secular}{" "}
          to secular use.
        </p>
        <p
          className="font-serif text-lg"
          style={{ color: "var(--es-active)" }}
        >
          {standing} still stand as Lithuanian parishes today
          <span className="text-muted font-sans text-base">
            {" "}&mdash; and at {hostedMass} more churches, a Lithuanian Mass
            continues within a parish that is no longer Lithuanian.
          </span>
        </p>
        <p className="text-sm text-muted">
          For the present-day pastoral network &mdash; including missions,
          hosted Lithuanian Masses, communities, and religious houses &mdash;
          see{" "}
          <Link
            href="/lithuanian-catholic-life-today"
            className="font-medium text-foreground underline hover:text-accent"
          >
            Lithuanian Catholic Life Today
          </Link>
          .
        </p>
      </div>

      {/* ── The First Parish ── */}
      <aside className="mt-10 border-y border-rule py-7">
        <div className="grid gap-7 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.35fr)] md:items-center">
          <figure className="min-w-0">
            <div className="relative aspect-[4/5] overflow-hidden bg-band">
              <Image
                src={firstParishPhoto.src}
                alt={firstParishPhoto.alt}
                fill
                className="object-contain"
                sizes="(min-width: 768px) 36vw, 100vw"
                priority
                unoptimized
              />
            </div>
            <figcaption className="mt-2 text-xs leading-relaxed text-muted">
              <a
                href={firstParishPhoto.evidenceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground"
              >
                {firstParishPhoto.attribution}
              </a>
            </figcaption>
          </figure>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-muted">
              The beginning
            </p>
            <h2 className="mt-1 font-serif text-2xl font-semibold leading-tight sm:text-3xl">
              The first Lithuanian parish in America
            </h2>
            <div className="mt-4 grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-4 border-y border-rule py-3">
              <FirstParishLocatorMap />
              <div>
                <p className="text-xs font-semibold uppercase text-muted">
                  Where the record begins
                </p>
                <p className="mt-1 font-serif text-lg font-semibold">
                  Shenandoah, Pennsylvania
                </p>
              </div>
            </div>
            <p className="mt-4 leading-relaxed">
              St. George&rsquo;s (Šv. Jurgio) in Shenandoah, Pennsylvania
              &mdash; organized by Father Andrius Strupinskas, SJ, a Jesuit
              who fled Lithuania in 1869. The founding date is contested:
              sources cite 1872, 1874, 1886, and 1891, reflecting the
              parish&rsquo;s complicated origins as a joint Polish-Lithuanian
              congregation that reorganized as Lithuanian. The church building
              dates to 1893. It was closed in 2006 and demolished in
              2009&ndash;2010 &mdash; the diocese took approximately $1M in
              parish savings despite a credible $360K repair estimate,
              landmark status, and a community treaty.
            </p>

            <Link
              href={`/parishes/${firstParishSlug}`}
              className="mt-4 inline-block font-semibold underline hover:text-accent"
            >
              Read the full St. George parish record
            </Link>

            <div className="mt-5 border-t border-rule pt-4 text-xs leading-relaxed text-muted">
              <p className="font-semibold text-foreground">Sources</p>
              <p className="mt-1">
                <a
                  href="https://archyvas.ziburioltmokykla.org/item/20260725_1785004329786"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-foreground"
                >
                  Algis Lukas, <em>Lietuvių Kultūrinis Paveldas Amerikoje</em>{" "}
                  (2009)
                </a>
                {" · "}
                {firstParishDraugasIssues.map((issue, index) => (
                  <span key={issue.href}>
                    {index === 0 ? "Draugas: " : ", "}
                    <a
                      href={issue.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-foreground"
                    >
                      {issue.date}
                    </a>
                  </span>
                ))}
                {" · "}
                <Link
                  href={`/parishes/${firstParishSlug}`}
                  className="underline hover:text-foreground"
                >
                  Parish case file and citations
                </Link>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── The exhibit: decade pulse + timeline (one title system) ── */}
      <section className="mt-14">
        <p className="text-xs font-semibold uppercase text-muted">
          Two waves in one record
        </p>
        <h2 className="font-serif text-2xl font-semibold">
          A half-century of building; a half-century of closing
        </h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted">
          The same parish population rises through the immigrant building
          wave, then turns downward through successive decades of closure.
          The pattern is not past tense.
        </p>

        <div className="mt-6 grid grid-cols-2 border-y border-rule sm:grid-cols-4">
          <div className="border-b border-r border-rule px-3 py-4 sm:border-b-0">
            <p className="font-serif text-3xl font-semibold">
              {narrative.peakFoundN}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted">
              founded in the {narrative.peakFoundDecade}s
            </p>
          </div>
          <div className="border-b border-rule px-3 py-4 sm:border-b-0 sm:border-r">
            <p
              className="font-serif text-3xl font-semibold"
              style={{ color: "var(--es-closed)" }}
            >
              {narrative.peakClosedN}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted">
              closed in the {narrative.peakClosedDecade}s
            </p>
          </div>
          <div className="border-r border-rule px-3 py-4">
            <p className="font-serif text-3xl font-semibold">
              {narrative.closedSince1990}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted">
              closures dated since 1990
            </p>
          </div>
          <div className="px-3 py-4">
            <p className="font-serif text-3xl font-semibold">
              {narrative.closedSince2020}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted">
              closures dated since 2020
            </p>
          </div>
        </div>

        <div className="mt-6 grid border-y border-rule text-xs leading-snug text-muted sm:grid-cols-4 sm:divide-x sm:divide-rule">
          <p className="border-b border-rule px-3 py-3 sm:border-b-0">
            <span className="mr-2 font-semibold text-foreground">↑</span>
            Above the line: parishes founded
          </p>
          <p className="border-b border-rule px-3 py-3 sm:border-b-0">
            <span
              className="mr-2 font-semibold"
              style={{ color: "var(--es-closed)" }}
            >
              ↓
            </span>
            Below the line: parishes closed
          </p>
          <p className="border-b border-rule px-3 py-3 sm:border-b-0">
            <span className="mr-2 font-semibold text-foreground">→</span>
            Each bar: one parish through time
          </p>
          <p className="px-3 py-3">
            <span className="mr-2 font-semibold text-foreground">×</span>
            Church demolished; a fade means status unknown
          </p>
        </div>

        <div className="mt-6">
          <TimelineChart rows={dated} undated={undated} />
        </div>

        <div className="mt-6 grid border-y border-rule sm:grid-cols-3 sm:divide-x sm:divide-rule">
          {narrative.medianLifespan != null && (
            <div className="border-b border-rule px-3 py-4 sm:border-b-0">
              <p
                className="font-serif text-3xl font-semibold"
                style={{ color: "var(--es-closed)" }}
              >
                {narrative.medianLifespan} years
              </p>
              <p className="mt-1 text-xs leading-snug text-muted">
                median lifespan among closed parishes
              </p>
            </div>
          )}
          {narrative.oldestAlive && (
            <div className="border-b border-rule px-3 py-4 sm:border-b-0">
              <p
                className="font-serif text-3xl font-semibold"
                style={{ color: "var(--es-active)" }}
              >
                {narrative.oldestAlive.founded}
              </p>
              <p className="mt-1 text-xs leading-snug text-muted">
                oldest active parish:{" "}
                {narrative.oldestAlive.profileHref ? (
                  <Link
                    href={narrative.oldestAlive.profileHref}
                    className="font-medium text-foreground underline hover:text-accent"
                  >
                    {narrative.oldestAlive.name}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">
                    {narrative.oldestAlive.name}
                  </span>
                )}
                , {narrative.oldestAlive.city}, {narrative.oldestAlive.state}
              </p>
            </div>
          )}
          <div className="px-3 py-4">
            <p className="font-serif text-3xl font-semibold">
              {undated.length}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted">
              parish founding dates still unresolved
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted border-t border-rule pt-3">
          Source: the unified parish registry &mdash; Draugas 1909&ndash;2026,
          Wolkovich-Valkavičius (1998), Michelsonas (1961), Lukas (2009), and
          contemporary parish, diocesan, and public records.{" "}
          <Link href="/about-the-data" className="underline hover:text-foreground">
            How the record is built and cited
          </Link>
          .
        </p>
      </section>

      <nav
        aria-label="Related history views"
        className="mt-12 border-y border-rule py-5"
      >
        <p className="text-xs font-semibold uppercase text-muted">
          Continue exploring
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 sm:divide-x sm:divide-rule">
          <div className="sm:pr-5">
            <Link
              href="/where-every-parish-ended-up"
              className="font-serif text-lg font-semibold underline hover:text-accent"
            >
              Lithuanian Churches Through Time
            </Link>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Follow each church community from its documented building or
              parish baseline to its present condition.
            </p>
          </div>
          <div className="sm:pl-5">
            <Link
              href="/by-diocese"
              className="font-serif text-lg font-semibold underline hover:text-accent"
            >
              By Diocese
            </Link>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Compare the parish record, closure outcomes, and present
              holdings diocese by diocese.
            </p>
          </div>
        </div>
      </nav>
    </div>
  );
}
