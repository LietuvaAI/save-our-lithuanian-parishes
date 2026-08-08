import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import HistoryAliveCurve from "@/components/HistoryAliveCurve";
import HistoryDioceseLoss from "@/components/HistoryDioceseLoss";
import HistoryTwoWaves from "@/components/HistoryTwoWaves";
import photosData from "@/data/photos.json";
import { historyProjection } from "@/lib/history-projection";

export const metadata: Metadata = {
  title: "The Rise and Loss of America’s Lithuanian Parishes",
  description:
    "A chronological, regional, and diocesan history of America’s Lithuanian Roman Catholic parishes from the 1880s to today.",
};

const shenandoahSlug = "sv-jurgio-shenandoah-pa";
const shenandoahDrawing =
  photosData.parishes["sv-jurgio-shenandoah-pa-line-drawing"];

function Divider({ numeral, children }: { numeral: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-rule pb-2 font-sans text-ui-label font-semibold uppercase tracking-widest text-muted">
      <span className="font-mono text-foreground">{numeral}</span>
      <span>{children}</span>
    </div>
  );
}

function Stat({ value, children, red = false }: { value: number; children: React.ReactNode; red?: boolean }) {
  return (
    <div className="border-r border-rule px-4 py-4 last:border-r-0">
      <p className={`font-serif text-page-title font-semibold ${red ? "text-[var(--es-closed)]" : ""}`}>{value}</p>
      <p className="mt-1 font-sans text-small-copy leading-snug text-muted">{children}</p>
    </div>
  );
}

export default function HistoryPage() {
  const { counts, decades, years, dioceses, peakYear, currentYearPoint, peakFoundedDecade, peakClosedDecade } = historyProjection;
  const scranton = dioceses.find((diocese) => diocese.key === "Scranton")!;
  const chicago = dioceses.find((diocese) => diocese.key === "Chicago")!;
  const pittsburgh = dioceses.find((diocese) => diocese.key === "Pittsburgh")!;

  return (
    <article className="mx-auto max-w-5xl px-4 pb-12 pt-8">
      <header className="max-w-4xl">
        <p className="font-sans text-small-copy uppercase tracking-widest text-muted">
          A chronological view · 1880s to today
        </p>
        <h1 className="mt-1 font-serif text-outcomes-title font-semibold tracking-tight">
          The Rise and Loss of America&rsquo;s Lithuanian Parishes
        </h1>
        <p className="mt-3 max-w-3xl font-serif text-lead-copy leading-relaxed text-muted">
          From Pennsylvania coal towns to the industrial cities of the Midwest
          and Northeast, {counts.total} Roman Catholic parish institutions
          formed a national Lithuanian network. This is how that network grew,
          reached its height, and contracted.
        </p>
        <p className="mt-3 font-sans text-support-copy text-muted">
          Parish-only history: missions and physical church sites are counted
          in their own canonical populations. Every figure below is derived
          from projection <span className="font-mono">{historyProjection.revision}</span>.
        </p>
      </header>

      <section id="beginning" className="scroll-mt-8 pt-12">
        <Divider numeral="I">The beginning</Divider>
        <h2 className="font-serif text-section-title font-semibold">
          It began in Pennsylvania coal country
        </h2>
        <div className="mt-6 grid items-start gap-8 md:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)]">
          <figure>
            <div className="relative aspect-[4/5] overflow-hidden bg-band">
              <Image
                src={shenandoahDrawing.src}
                alt={shenandoahDrawing.alt}
                fill
                className="object-contain p-3"
                sizes="(min-width: 768px) 34vw, 100vw"
                priority
                unoptimized
              />
            </div>
            <figcaption className="mt-2 font-sans text-small-copy leading-relaxed text-muted">
              {shenandoahDrawing.attribution}
            </figcaption>
          </figure>
          <div className="space-y-4 font-serif text-lead-copy leading-relaxed">
            <p>
              Pennsylvania contains {counts.pennsylvania} of the {counts.total}{" "}
              documented Roman Catholic Lithuanian parishes. The earliest dated
              foundations in the state appear at Mount Carmel in 1886, Plymouth
              and Mahanoy City in 1888, and Pittston in 1890.
            </p>
            <p>
              St. George in Shenandoah followed in 1891. Its Lithuanian church
              was dedicated in 1893, and the parish became a central symbol of
              the first large Lithuanian settlement in the United States. The
              parish closed in 2006; the church was demolished in 2009.
            </p>
            <p>
              The regional comparison makes the later pattern visible. Of the
              {` ${counts.coalRegion.diocese_owned} `}diocese-owned parish
              institutions in the canonical northeastern Pennsylvania coal-region
              set, {counts.coalRegion.diocese_ended} ended; three remain in other
              documented outcomes. The set&rsquo;s one community-owned comparison
              remains standing.
            </p>
            <p className="font-sans text-support-copy text-muted">
              This is an institutional and ownership comparison, not a claim
              that ownership alone caused an outcome.
            </p>
            <Link href={`/parishes/${shenandoahSlug}`} className="inline-block font-sans text-body-copy font-semibold underline hover:text-accent">
              Read the St. George parish history and its cited evidence
            </Link>
            <p className="border-t border-rule pt-3 font-sans text-small-copy text-muted">
              Source image: Jonas Žilius, <em>Lietuviai Amerikoj</em> (1899),
              public domain. Regional figures and parish dates follow the
              canonical projection; detailed evidence remains attached to each
              parish profile.
            </p>
          </div>
        </div>
      </section>

      <section id="two-waves" className="scroll-mt-8 pt-14">
        <Divider numeral="II">Two waves across a century</Divider>
        <h2 className="font-serif text-section-title font-semibold">
          A half-century of building; a half-century of closing
        </h2>
        <p className="mt-3 max-w-3xl font-serif text-lead-copy leading-relaxed text-muted">
          Each square is one parish institution. Black marks record dated
          foundations; red marks record dated formal closures. Select any mark
          to open the corresponding parish profile.
        </p>
        <div className="mt-6 grid grid-cols-2 border-y border-rule sm:grid-cols-4">
          <Stat value={peakFoundedDecade.founded.length}>{`founded in the ${peakFoundedDecade.decade}s`}</Stat>
          <Stat value={peakClosedDecade.closed.length} red>{`closed in the ${peakClosedDecade.decade}s`}</Stat>
          <Stat value={counts.closedSince1990}>formal closures dated since 1990</Stat>
          <Stat value={counts.closedSince2020}>formal closures dated since 2020</Stat>
        </div>
        <div className="mt-7"><HistoryTwoWaves decades={decades} /></div>
        <p className="mt-4 border-t border-rule pt-3 font-sans text-small-copy text-muted">
          {counts.foundedUndated} parish founding years and {counts.formalClosureUndated} formal-closure years are not established and therefore do not appear as dated squares.
        </p>
      </section>

      <section id="century-arc" className="scroll-mt-8 pt-14">
        <Divider numeral="III">The arc of the century</Divider>
        <h2 className="font-serif text-section-title font-semibold">
          From expansion to long contraction
        </h2>
        <p className="mt-3 max-w-3xl font-serif text-lead-copy leading-relaxed text-muted">
          The dated record reaches a high point of {peakYear.alive} living
          parish institutions in {peakYear.year}. By {currentYearPoint.year},
          {` ${currentYearPoint.alive} `}have a dated beginning without a dated
          institutional ending. That is a historical-life measure—not the count
          of active Lithuanian-led parishes today.
        </p>
        <div className="mt-7"><HistoryAliveCurve years={years} /></div>
        <div className="mt-8 grid gap-5 border-y border-rule py-5 md:grid-cols-3 md:divide-x md:divide-rule">
          <Era title="The building wave">
            By the end of the 1920s, {counts.foundedBy1929} parish institutions
            had a dated foundation. Migration, mines, mills, and urban
            neighborhoods produced the dense national network.
          </Era>
          <Era title="War and renewal">
            The middle decades added fewer foundations, but the parish network
            remained near its greatest extent through the postwar period.
          </Era>
          <Era title="The long contraction">
            Formal closures accelerated late in the century: {counts.closedSince1990}
            of today&rsquo;s closed parishes have closure dates in 1990 or later.
          </Era>
        </div>
        <p className="mt-4 font-sans text-small-copy leading-relaxed text-muted">
          Method: for each year, the curve subtracts every dated institutional
          ending from every dated foundation. The {counts.foundedUndated}
          undated founding years cannot enter the curve; {counts.formalClosureUndated}
          formal closures have no dated position. Current canonical status is
          shown on parish profiles and the Outcomes view.
        </p>
      </section>

      <section id="loss-by-diocese" className="scroll-mt-8 pt-14">
        <Divider numeral="IV">The loss, diocese by diocese</Divider>
        <h2 className="font-serif text-section-title font-semibold">
          The national contraction was administered locally
        </h2>
        <div className="mt-3 max-w-4xl space-y-3 font-serif text-lead-copy leading-relaxed text-muted">
          <p>
            The canonical jurisdiction field places these parishes in {counts.namedDioceses}{" "}
            named dioceses and archdioceses. {counts.diocesesWithoutActive} now
            have no active Lithuanian parish. Across the full parish population,
            {` ${counts.endedOrTransferred} of ${counts.total} `}are formally
            closed or live on through another community.
          </p>
          <p>
            The Diocese of Scranton has {scranton.total} documented Lithuanian
            parishes and none active; the Archdiocese of Chicago has one active
            parish among {chicago.total}; and all {pittsburgh.total} documented
            parishes in the Diocese of Pittsburgh are closed or transferred.
          </p>
        </div>
        <div className="mt-7"><HistoryDioceseLoss dioceses={dioceses} currentYear={historyProjection.currentYear} /></div>
      </section>

      <footer className="mt-14 border-t border-rule pt-5 font-sans text-support-copy text-muted">
        <Link href="/about-the-data" className="font-medium text-foreground underline hover:text-accent">Read the methodology and source policy</Link>
        {" · "}
        <Link href="/where-every-parish-ended-up" className="font-medium text-foreground underline hover:text-accent">Explore current institutional outcomes</Link>
        {" · "}
        <Link href="/parishes" className="font-medium text-foreground underline hover:text-accent">Open all profiles</Link>
      </footer>
    </article>
  );
}

function Era({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="md:px-5 first:pl-0 last:pr-0">
      <h3 className="font-serif text-subsection-title font-semibold">{title}</h3>
      <p className="mt-2 font-sans text-body-copy leading-relaxed text-muted">{children}</p>
    </div>
  );
}
