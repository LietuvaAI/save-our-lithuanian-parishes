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
    <div className="relative mb-6 flex items-center justify-center">
      <div className="absolute inset-x-0 top-1/2 border-t border-rule" aria-hidden="true" />
      <div className="relative flex items-center gap-2 bg-background px-3 font-sans text-ui-label font-semibold uppercase tracking-[0.15em] text-muted">
        <span className="font-mono text-foreground">{numeral}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}

function Stat({ value, children, red = false }: { value: number; children: React.ReactNode; red?: boolean }) {
  return (
    <div className="border-r border-rule px-3 py-3 last:border-r-0">
      <p className={`font-serif text-page-title font-semibold ${red ? "text-[var(--es-closed)]" : ""}`}>{value}</p>
      <p className="mt-1 font-sans text-small-copy leading-snug text-muted">{children}</p>
    </div>
  );
}

export default function HistoryPage() {
  const { counts, decades, years, dioceses, peakYear, peakRange, currentYearPoint, peakFoundedDecade, peakClosedDecade } = historyProjection;
  const scranton = dioceses.find((diocese) => diocese.key === "Scranton")!;
  const chicago = dioceses.find((diocese) => diocese.key === "Chicago")!;
  const pittsburgh = dioceses.find((diocese) => diocese.key === "Pittsburgh")!;

  return (
    <article className="mx-auto max-w-5xl px-4 pb-0 pt-8">
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
        <div className="mt-5 grid items-start gap-8 md:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)]">
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
          <div className="space-y-4 font-serif text-lead-copy leading-[1.7]">
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

      <section id="two-waves" className="scroll-mt-8 pt-12">
        <Divider numeral="II">Two waves across a century</Divider>
        <p className="font-serif text-lead-copy leading-[1.7]">
          Each square is one parish institution. Black marks record dated
          foundations; red marks record dated formal closures. Select any mark
          to open the corresponding parish profile.
        </p>
        <div className="mt-5 grid grid-cols-2 border-y border-rule sm:grid-cols-4">
          <Stat value={peakFoundedDecade.founded.length}>{`founded in the ${peakFoundedDecade.decade}s`}</Stat>
          <Stat value={peakClosedDecade.closed.length} red>{`closed in the ${peakClosedDecade.decade}s`}</Stat>
          <Stat value={counts.closedSince1990}>formal closures dated since 1990</Stat>
          <Stat value={counts.closedSince2020}>formal closures dated since 2020</Stat>
        </div>
        <div className="mt-5"><HistoryTwoWaves decades={decades} /></div>
        <p className="mt-4 border-t border-rule pt-3 font-sans text-small-copy text-muted">
          {counts.foundedUndated} parish founding years and {counts.formalClosureUndated} formal-closure years are not established and therefore do not appear as dated squares.
        </p>
      </section>

      <section id="century-arc" className="scroll-mt-8 pt-12">
        <Divider numeral="III">The arc of the century</Divider>
        <h2 className="font-serif text-section-title font-semibold">
          Lithuanian parishes alive, year by year
        </h2>
        <p className="mt-3 font-serif text-lead-copy leading-[1.7]">
          The dated record reaches a high plateau of {peakYear.alive} living
          parish institutions from {peakRange.start} through {peakRange.end}. By{" "}
          {currentYearPoint.year},
          {` ${currentYearPoint.alive} `}have a dated beginning without a dated
          institutional ending. That is a historical-life measure—not the count
          of active Lithuanian-led parishes today.
        </p>
        <div className="mt-7">
          <HistoryAliveCurve years={years} parishes={historyProjection.parishes} />
        </div>
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
          Method: at the end of each year, the curve counts parish institutions
          with a dated foundation on or before that year and no dated
          institutional ending by that year. The {counts.foundedUndated} undated
          founding years cannot enter the curve; {counts.formalClosureUndated} formal
          closures have no dated position. The {counts.datedEndingsOutsideCurve} dated
          ending events attached to records without a dated foundation remain visible
          as events but do not change the curve. Current canonical status is shown on
          parish profiles and the Parish &amp; Mission Status view.
        </p>
      </section>

      <section id="loss-by-diocese" className="scroll-mt-8 pt-12">
        <Divider numeral="IV">The loss, diocese by diocese</Divider>
        <h2 className="font-serif text-section-title font-semibold text-[var(--es-closed)]">
          {counts.diocesesWithoutActive} of {counts.namedDioceses} dioceses have no active Lithuanian parish left
        </h2>
        <div className="mt-3 space-y-3 font-serif text-lead-copy leading-[1.7]">
          <p>
            The loss was not evenly spread — it followed the geography of the
            founding. The dioceses that held the most Lithuanian parish life
            lost the most of it: Scranton, which once held {scranton.total}{" "}
            parishes, kept none active; Chicago kept one of {chicago.total};
            Pittsburgh lost all {pittsburgh.total}. Of the {counts.namedDioceses}{" "}
            dioceses that ever held a Lithuanian parish, {counts.diocesesWithoutActive}{" "}
            now have none — and at {counts.endedOrTransferred} of the {counts.total}{" "}
            parishes, Lithuanian parish life has formally closed or been
            transferred to another community.
          </p>
          <p>
            Each diocese below is shaded by how much of its Lithuanian parish
            life is gone — drag the year slider to watch the map turn from green
            to red as the closures accumulate, and hover any diocese for its full
            count.
          </p>
        </div>
        <div className="mt-7"><HistoryDioceseLoss dioceses={dioceses} currentYear={historyProjection.currentYear} /></div>
      </section>

      <footer className="mt-14 border-t border-rule pt-5 font-sans text-support-copy text-muted">
        <Link href="/about-the-data" className="font-medium text-foreground underline hover:text-accent">Read the methodology and source policy</Link>
        {" · "}
        <Link href="/where-every-parish-ended-up" className="font-medium text-foreground underline hover:text-accent">Explore parish and mission status</Link>
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
