import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AboutBuildingFlow from "@/components/AboutBuildingFlow";
import AboutChurchStrip from "@/components/AboutChurchStrip";
import {
  currentPastoralNetwork,
  romanCatholicInstitutionHistory,
} from "@/lib/infographic-projection";
import { physicalSiteOutcomeProjection } from "@/lib/physical-site-outcome-projection";
import { getClearedPhoto } from "@/lib/photos";

export const metadata: Metadata = {
  title: "About Save Our Lithuanian Parishes",
  description:
    "Why Save Our Lithuanian Parishes reconstructs the history of Lithuanian parish life in America and keeps its evidence connected.",
};

const linkClass =
  "underline decoration-[#a8a29e] underline-offset-[3px] transition-colors hover:text-[#7d1f1f] hover:decoration-[#7d1f1f]";
const proseClass =
  "mx-auto max-w-[780px] space-y-6 text-about-body leading-[1.62]";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-[#1c1917] pb-3 text-about-section font-semibold leading-[1.08] tracking-[-0.018em]">
      {children}
    </h2>
  );
}

export default function AboutPage() {
  const activeParishes = currentPastoralNetwork.counts.active_parish;
  const activeMissions = currentPastoralNetwork.counts.active_mission;
  const hostedCommunities = currentPastoralNetwork.counts.mass_continues;
  const regularWorshipPlaces =
    activeParishes + activeMissions + hostedCommunities;
  const romanCatholicParishes = romanCatholicInstitutionHistory.filter(
    (row) => row.record_type === "parish",
  ).length;
  const romanCatholicMissions = romanCatholicInstitutionHistory.filter(
    (row) => row.record_type === "misija",
  ).length;
  const closedInstitutions = romanCatholicInstitutionHistory.filter(
    (row) => row.status_group === "closed",
  );
  const terminalChurchDemolished = closedInstitutions.filter(
    (row) => row.building_fate === "demolished",
  ).length;
  const siteCounts = {
    standing: physicalSiteOutcomeProjection.stateCounts.standing ?? 0,
    repurposed: physicalSiteOutcomeProjection.stateCounts.repurposed ?? 0,
    demolished: physicalSiteOutcomeProjection.stateCounts.demolished ?? 0,
    listed_for_sale:
      physicalSiteOutcomeProjection.stateCounts.listed_for_sale ?? 0,
    not_established:
      physicalSiteOutcomeProjection.stateCounts.not_established ?? 0,
  };
  const jonynasWindow = getClearedPhoto(
    "about-jonynas-stained-glass-divine-providence",
  );
  const manhattanDemolition = getClearedPhoto(
    "about-our-lady-of-vilnius-demolition-2015",
  );
  const sigitaArchivist = getClearedPhoto(
    "about-sigita-jurgutis-student-archivist",
  );

  return (
    <article className="bg-[#fffdf9] font-serif text-[#1c1917]">
      <header className="mx-auto max-w-[1180px] px-4 pb-11 pt-10 sm:px-7 sm:pb-14 sm:pt-14">
        <p className="text-support-copy font-semibold uppercase tracking-[0.16em] text-[#78716c]">
          About · Apie projektą
        </p>
        <h1 className="mt-3 max-w-[1000px] text-about-hero font-semibold leading-[0.98] tracking-[-0.035em]">
          About Save Our Lithuanian Parishes
        </h1>
        <p className="mt-5 max-w-[800px] text-about-lede leading-[1.42] text-[#44403c]">
          A connected public record of the parishes, people, buildings, and
          sources that shaped Lithuanian Catholic life in America.
        </p>
        <AboutChurchStrip />
      </header>

      <main>
        <section className="mx-auto max-w-[980px] px-4 py-12 sm:px-7 sm:py-16">
          <SectionHeading>Why this project exists</SectionHeading>
          <div className={`${proseClass} mt-8`}>
            <p>
              Across more than a century, Lithuanian immigrants and their
              descendants established a nationwide Catholic network. Save Our
              Lithuanian Parishes currently documents{" "}
              <Link href="/parishes" className={linkClass}>
                {romanCatholicParishes} Roman Catholic parishes and{" "}
                {romanCatholicMissions} missions
              </Link>{" "}
              in the United States.
            </p>
            <h3 className="pt-5 text-about-subheading font-semibold leading-tight">
              The network
            </h3>
            <p>
              The first great wave of Lithuanian immigrants arrived during the
              late nineteenth and early twentieth centuries. Many settled near
              coal mines, mills, factories, and stockyards in Pennsylvania,
              New England, New York, New Jersey, Baltimore, Chicago, Cleveland,
              and other industrial centers. They formed benefit societies,
              contributed money from workers&rsquo; wages, sought
              Lithuanian-speaking priests, purchased land, and built churches.
              Around those churches grew schools, choirs, newspapers,
              cemeteries, parish halls, charitable societies, and organizations
              that helped new arrivals establish themselves in America.
            </p>
            <p>
              After the Second World War, Lithuanians displaced by war and
              Soviet occupation entered communities built by the earlier
              immigrants. They strengthened older parishes and established
              heritage schools, scout groups, Catholic youth organizations,
              choirs, dance ensembles, libraries, museums, and cultural
              centers. As Lithuanian families moved from urban neighborhoods
              into the suburbs, some communities followed them, building new
              churches and parish-cultural-center complexes in places such as{" "}
              <Link
                href="/parishes/dievo-apvaizdos-southfield-mi"
                className={linkClass}
              >
                Southfield, Michigan
              </Link>
              , and Lemont, Illinois.
            </p>
          </div>

          <div className="mt-11 grid gap-5 md:grid-cols-2">
            <article className="border border-[#e4dfd6] bg-[#faf7f1] p-5 sm:p-6">
              <p className="text-directory-footnote font-semibold uppercase tracking-[0.15em] text-[#78716c]">
                First wave
              </p>
              <div className="mt-4 grid grid-cols-[112px_1fr] gap-4 sm:grid-cols-[150px_1fr]">
                <div className="relative aspect-[4/5] bg-[#fffdf9]">
                  <Image
                    src="/images/parishes/shenandoah-st-george-line-drawing.png"
                    alt="Line drawing of St. George Lithuanian church in Shenandoah."
                    fill
                    sizes="150px"
                    className="object-contain mix-blend-multiply"
                  />
                </div>
                <div>
                  <h3 className="text-section-title font-semibold leading-tight">
                    <Link
                      href="/parishes/sv-jurgio-shenandoah-pa"
                      className={linkClass}
                    >
                      St. George, Shenandoah
                    </Link>
                  </h3>
                  <p className="mt-3 text-card-title leading-[1.48]">
                    A parish of the coal-region settlements, and the oldest
                    Lithuanian Catholic church in America. Its towers were the
                    tallest peaks in the Shenandoah skyline.
                  </p>
                  <p className="mt-3 text-body-copy font-semibold leading-snug text-[#7d1f1f]">
                    Parish closed 2006; church demolished 2009.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-support-copy leading-relaxed text-[#78716c]">
                <a
                  href="https://www.pbase.com/dbperez/demolition"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Photographs of its demolition, by Dave Perez
                </a>{" "}
                — linked, not reproduced; rights reserved by the photographer.
              </p>
            </article>

            <article className="border border-[#e4dfd6] bg-[#faf7f1] p-5 sm:p-6">
              <p className="text-directory-footnote font-semibold uppercase tracking-[0.15em] text-[#78716c]">
                Second wave
              </p>
              <div className="mt-4 grid grid-cols-[112px_1fr] gap-4 sm:grid-cols-[150px_1fr]">
                <div className="relative aspect-[4/5] bg-[#fffdf9]">
                  <Image
                    src="/images/parishes/southfield-divine-providence-current-line-drawing.png"
                    alt="Line drawing of Divine Providence Lithuanian Parish in Southfield."
                    fill
                    sizes="150px"
                    className="object-contain mix-blend-multiply"
                  />
                </div>
                <div>
                  <h3 className="text-section-title font-semibold leading-tight">
                    <Link
                      href="/parishes/dievo-apvaizdos-southfield-mi"
                      className={linkClass}
                    >
                      Divine Providence, Southfield
                    </Link>
                  </h3>
                  <p className="mt-3 text-card-title leading-[1.48]">
                    A postwar suburban parish-cultural-center complex.
                  </p>
                  <p className="mt-3 text-body-copy font-semibold leading-snug text-[#7d1f1f]">
                    Under threat: in Planning Area 8 of the Archdiocese of
                    Detroit&rsquo;s 2025–2027 restructuring; no final decisions
                    announced.
                  </p>
                </div>
              </div>
            </article>
          </div>

          <div className={`${proseClass} mt-10`}>
            <p>
              The two waves arrived under different circumstances, but they
              shared an understanding of the parish. It was not simply a church
              building or an administrative unit of the Catholic Church. It was
              the smallest institution that contained the whole of Lithuanian
              communal life: worship, education, language, music, social
              organization, public memory, and care for the dead.
            </p>
          </div>
        </section>

        <section className="bg-[#1c1917] text-[#e7e2d8]">
          <div className="mx-auto grid max-w-[1120px] gap-8 px-4 py-12 sm:px-7 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,.95fr)] lg:items-center">
            <div>
              <p className="text-directory-footnote font-semibold uppercase tracking-[0.16em] text-[#d5c28b]">
                Malda ir tauta
              </p>
              <p className="mt-5 text-about-feature leading-[1.32]">
                The Lithuanian idea of <em>malda ir tauta</em>—prayer and
                nation—expresses this understanding. Prayer directed a person
                toward God, truth, and eternity. Here, nation meant a people
                joined by family, language, history, and community. In exile,
                prayer and nation met in the parish. Lithuanian communal life
                did not exist beside the Catholic faith as something separate
                from it. It was lived through the faith and through the parish.
              </p>
              <p className="mt-6 text-body-copy leading-relaxed text-[#cfc9bd]">
                Prayer and nation (<em>malda ir tauta</em>) in a single pane. In
                the Divine Providence church window created by Vytautas K.
                Jonynas, St. Casimir is surrounded by figures from Lithuanian
                history and national symbols, with the Vytis shining above.
              </p>
            </div>
            {jonynasWindow ? (
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden border border-[#4c4842] bg-black">
                  <Image
                    src={jonynasWindow.src}
                    alt={jonynasWindow.alt}
                    fill
                    sizes="(max-width: 1023px) 100vw, 520px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-support-copy leading-relaxed text-[#d5c28b]">
                  Vytautas K. Jonynas stained-glass window at Divine Providence
                  Lithuanian Parish. {jonynasWindow.attribution}.
                </figcaption>
              </figure>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-[980px] px-4 py-12 sm:px-7 sm:py-16">
          <div className={proseClass}>
            <p>
              No parish stood alone. Priests, teachers, families, organizations,
              publications, money, and ideas moved between communities. Each
              parish served a particular place, but together they formed the
              institutional structure of Lithuanian life in America.
            </p>
          </div>

          <p className="mt-14 whitespace-nowrap text-center text-about-display font-semibold leading-none tracking-[-0.025em]">
            Most of that structure is now gone.
          </p>

          <div className="mt-12 border border-[#e4dfd6] bg-[#faf7f1] p-5 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-directory-footnote font-semibold uppercase tracking-[0.15em] text-[#78716c]">
                  The buildings
                </p>
                <h3 className="mt-1 text-about-subheading font-semibold leading-tight">
                  Church buildings through time
                </h3>
              </div>
              <Link
                href="/church-buildings-through-time"
                className={`text-home-action font-semibold ${linkClass}`}
              >
                Open the full flow, building by building →
              </Link>
            </div>
            <AboutBuildingFlow counts={siteCounts} />
            <p className="mt-5 border-t border-[#e4dfd6] pt-4 text-body-copy leading-relaxed text-[#57534e]">
              A different measure from the paragraph below: this counts every
              documented worship site—earlier and replacement churches
              included—not the final church site of each institution.
            </p>
          </div>

          <div className={`${proseClass} mt-10`}>
            <p>
              Of the {romanCatholicInstitutionHistory.length} Roman Catholic
              institutions documented here, {activeParishes} parishes and{" "}
              {activeMissions} missions remain active Lithuanian institutions.{" "}
              <Link href="/lithuanian-catholic-life-today" className={linkClass}>
                Lithuanian worship also continues in {hostedCommunities} hosted
                communities, for {regularWorshipPlaces} regular worship places
                in all.
              </Link>{" "}
              <Link href="/where-every-parish-ended-up" className={linkClass}>
                {closedInstitutions.length} of the{" "}
                {romanCatholicInstitutionHistory.length} historical institutions
                are classified as closed.
              </Link>{" "}
              Among those closed institutions, the last-used church is
              documented as demolished in {terminalChurchDemolished} cases.
            </p>
            <h3 className="pt-6 text-about-subheading font-semibold leading-tight">
              The dismantling
            </h3>
            <p>
              Many of these parishes did not disappear because their
              communities abandoned them. Parishioners{" "}
              <Link href="/history" className={linkClass}>
                organized committees, raised money for repairs, petitioned
                bishops, appealed through canon law, sought Vatican review,
                held vigils, and went to court
              </Link>
              . In many cases, their dioceses or archdioceses{" "}
              <Link href="/where-every-parish-ended-up" className={linkClass}>
                closed the parishes anyway
              </Link>
              .
            </p>
            <p>
              A Lithuanian national parish was not the same as an ordinary
              neighborhood parish. It was established to serve a people joined
              by language and origin, not only Catholics living within a fixed
              territorial boundary. Its parishioners might be spread across an
              entire metropolitan area or several states. Its schools,
              archives, organizations, cemeteries, and cultural life could serve
              many more people than appeared on its membership rolls.
            </p>
            <p>
              Yet dioceses and archdioceses often evaluated these parishes as
              local congregations. Declining neighborhood populations or
              registered membership could therefore be treated as evidence that
              a parish no longer served a purpose, even when it remained
              important to a much larger and geographically dispersed
              community.
            </p>
            <p>
              Lithuanian immigrants built and financed this network within the
              American Catholic Church. The communities raised the money,
              founded the institutions, maintained the buildings, and passed
              them to the next generation. Final authority over their survival,
              however, rested with the dioceses and archdioceses. Those
              authorities have since presided over the dismantling of most of
              the network, often despite organized resistance from the people
              who built, supported, and inherited it.
            </p>

            {manhattanDemolition ? (
              <figure className="my-9 sm:float-right sm:ml-8 sm:w-[42%]">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#ede8df]">
                  <Image
                    src={manhattanDemolition.src}
                    alt={manhattanDemolition.alt}
                    fill
                    sizes="(max-width: 639px) 100vw, 330px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-support-copy leading-relaxed text-[#57534e]">
                  Demolition of Our Lady of Vilnius church, Manhattan, 2015.
                  Despite years of struggle by the Lithuanian community, the
                  church was torn down. {manhattanDemolition.attribution}.{" "}
                  <a
                    href="https://www.draugas.org/kam-priklauso-parapijos/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    Read “Kam priklauso parapijos?”
                  </a>
                </figcaption>
              </figure>
            ) : null}

            <p>
              The loss is not only architectural. The network was built
              collectively, but its history was recorded separately—by
              individual parishes, dioceses, organizations, cities, and
              families. As institutions closed, their records were divided,
              relocated, absorbed into other archives, or removed from the
              circumstances that gave them meaning. The relationships between
              communities became increasingly difficult to recover.
            </p>
            <h3 className="clear-both pt-6 text-about-subheading font-semibold leading-tight">
              For the Record
            </h3>
            <p>
              Save Our Lithuanian Parishes seeks to reconstruct the history of
              the Lithuanian Catholic diaspora and its continuing relationship
              with Lithuania. The present record is only a beginning. It is
              being built{" "}
              <Link href="/parishes" className={linkClass}>
                parish by parish
              </Link>
              , but the parish is the point of entry, not the final subject.
            </p>
            <p>
              The Lithuanian diaspora was never a self-contained American
              world. It was formed through relationships that crossed the
              Atlantic. Priests came from Lithuanian towns, dioceses,
              seminaries, and religious orders. Immigrants and displaced
              persons brought devotional practices, books, music, political
              commitments, family histories, and memories of particular places.
              Artists and craftspeople carried Lithuanian religious and national
              imagery into American churches. Publications, money,
              institutional support, and ideas also moved in the other
              direction, from diaspora communities back to Lithuania.
            </p>
            <p>
              The project seeks to make those relationships visible. It will
              identify the priests who served each parish and trace their
              birthplaces, education, religious formation, and assignments. It
              will document artists, architects, and craftspeople; identify
              paintings, sculpture, stained glass, altars, and other objects;
              and examine how people and objects moved between Lithuania and
              the United States. It will connect parishes to schools, societies,
              newspapers, religious orders, cemeteries, political organizations,
              and other institutions of Lithuanian life.
            </p>
            <p>
              The dismantling of the parish network is part of this history,
              but it is not the whole of it. The project is an effort to
              understand how a diaspora created a Lithuanian religious and
              communal world in the United States, how that world remained
              connected to Lithuania, and what those connections made possible
              across generations.
            </p>
          </div>
        </section>

        <section className="border-y border-[#e4dfd6] bg-[#faf7f1]">
          <div className="mx-auto max-w-[980px] px-4 py-12 sm:px-7 sm:py-16">
            <SectionHeading>How the research is done</SectionHeading>
            <div className={`${proseClass} mt-8`}>
              {sigitaArchivist ? (
                <figure className="mb-7 sm:float-right sm:mb-5 sm:ml-8 sm:w-[43%]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e7e2d8]">
                    <Image
                      src={sigitaArchivist.src}
                      alt={sigitaArchivist.alt}
                      fill
                      sizes="(max-width: 639px) 100vw, 340px"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-support-copy leading-relaxed text-[#57534e]">
                    Sigita Jurgutis, student archivist, preparing archival
                    documentation at Divine Providence Lithuanian Parish,
                    Southfield, Michigan—where the archive and this record both
                    begin. {sigitaArchivist.attribution}.
                  </figcaption>
                </figure>
              ) : null}
              <p>
                Save Our Lithuanian Parishes is researched and produced through{" "}
                <a
                  href="https://lietuva.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Lietuva.ai
                </a>
                , a system for studying Lithuanian cultural memory without
                separating historical claims from the sources and relationships
                that give them meaning.
              </p>
              <p>
                The work follows the principle set out by Pope Leo XIV in{" "}
                <a
                  href="https://www.vatican.va/content/leo-xiv/en/encyclicals/documents/20260515-magnifica-humanitas.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <em>Magnifica Humanitas</em>
                </a>
                : artificial intelligence must serve humanity, not take its
                place. AI helps navigate dispersed collections, compare records,
                trace relationships between people and institutions, and
                organize evidence. Its findings remain bounded by the historical
                record and traceable to their sources.
              </p>
              <p>
                The research is also conducted in coordination with{" "}
                <a
                  href="https://archyvas.ziburioltmokykla.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Skaitmeniniai Knygnešiai student archive program
                </a>
                —“Digital Book Carriers.” Its high school researchers are
                graduates of Žiburio Lithuanian Heritage School, located in{" "}
                <Link
                  href="/parishes/dievo-apvaizdos-southfield-mi"
                  className={linkClass}
                >
                  Divine Providence Lithuanian Church
                </Link>
                . They digitize, describe, and catalogue Lithuanian diaspora
                books, parish publications, school records, and other historical
                materials, bringing sources long kept on parish and school
                shelves into an accessible and connected record.
              </p>
              <p>
                Save Our Lithuanian Parishes is the first major public record
                being built through this approach. It brings dispersed sources
                into relation to document what Lithuanian Americans built, what
                happened to their parishes, what was lost with them, and what
                can still be preserved.
              </p>
              <div className="clear-both flex flex-wrap gap-3 pt-3">
                <a
                  href="https://archyvas.ziburioltmokykla.org/internship"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#1c1917] bg-[#1c1917] px-4 py-2.5 text-home-action font-semibold text-white transition-colors hover:bg-[#7d1f1f]"
                >
                  Explore the internship
                </a>
                <a
                  href="https://archyvas.ziburioltmokykla.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#1c1917] px-4 py-2.5 text-home-action font-semibold transition-colors hover:bg-[#1c1917] hover:text-white"
                >
                  Visit the public archive
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#1c1917] text-[#e7e2d8]">
          <div className="mx-auto max-w-[980px] px-4 py-12 sm:px-7 sm:py-16">
            <p className="text-directory-footnote font-semibold uppercase tracking-[0.16em] text-[#d5c28b]">
              The tradition
            </p>
            <h2 className="mt-3 max-w-[760px] text-about-section font-semibold leading-[1.08] tracking-[-0.018em]">
              In the tradition of the book carriers
            </h2>
            <div className="mt-7 max-w-[780px] space-y-5 text-about-body leading-[1.62] text-[#d8d2c7]">
              <p>
                When the Lithuanian press was banned under the Tsars, Bishop
                Motiejus Valančius organized the <em>knygnešiai</em>—the book
                carriers, who moved the printed word hand to hand across the
                border at real risk. Lithuanian identity survived because
                ordinary people built an information network when the
                institutions around them would not.
              </p>
              <p>
                This project works in that tradition: keeping memory in
                circulation, making knowledge public, and carrying the
                experience of one community to the next.
              </p>
            </div>
          </div>
        </section>
      </main>
    </article>
  );
}
