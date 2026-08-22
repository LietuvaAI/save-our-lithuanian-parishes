import type { Metadata } from "next";
import Link from "next/link";
import AboutNav from "@/components/AboutNav";

export const metadata: Metadata = {
  title: "About the Project",
  description:
    "Why Save Our Lithuanian Parishes keeps a connected, sourced public record of Lithuanian parish life in America.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-small-copy uppercase tracking-widest text-muted">About</p>
      <h1 className="mt-1 font-serif text-page-title font-semibold leading-tight">
        About the Project
      </h1>
      <p className="mt-4 font-serif text-section-title leading-relaxed sm:text-section-title">
        The past is a torch to the present. America&rsquo;s Lithuanian parishes
        have long been the <em>židiniai</em>{" "}of our
        communities&mdash;the hearths where faith was lived, language was
        spoken, memory was preserved, and identity was formed. Together, they
        form an unbroken current connecting the Lithuanian past to the present
        and lighting the road ahead. This project traces the complete history
        of America&rsquo;s Lithuanian parishes&mdash;from their earliest
        foundations to the communities discerning their future today. Seen
        together, the experience of America&rsquo;s Lithuanian parishes helps
        illuminate the path ahead, because no individual parish should have to
        find its way in darkness.
      </p>
      <p className="mt-3 text-body-copy font-medium">
        This record is powered by books scanned and catalogued at{" "}
        <Link
          href="/parishes/dievo-apvaizdos-southfield-mi"
          className="underline underline-offset-4 hover:text-accent"
        >
          Divine Providence Lithuanian Parish
        </Link>{" "}
        by the young archivists of{" "}
        <a
          href="https://archyvas.ziburioltmokykla.org/internship"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-accent"
        >
          Skaitmeniniai Knygnešiai
        </a>
        .
      </p>

      <AboutNav current="project" />

      <section className="mt-10">
        <h2 className="font-serif text-section-title font-semibold">Why it exists</h2>
        <div className="mt-3 space-y-4 leading-relaxed">
          <p>
            No parish should have to understand its past or face its future
            alone. Yet the record of Lithuanian parish life is scattered across
            archives, diocesan files, family collections, community memory, and
            current reporting. This project brings those fragments together as
            a shared public record, so communities can learn from one another
            and see their own experience as part of a larger story.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">What we are building</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="font-medium">A connected parish record</h3>
            <p className="mt-1 text-body-copy leading-relaxed text-muted">
              Each parish profile is meant to tell one coherent story across
              founding, worship, community life, governance, turning points,
              present condition, and the evidence behind the record.
            </p>
          </div>
          <div>
            <h3 className="font-medium">A bridge between archive and present</h3>
            <p className="mt-1 text-body-copy leading-relaxed text-muted">
              Historical research explains how a community arrived here.
              Current parish, diocesan, civil, and community sources show what
              is happening now.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Shared knowledge communities can use</h3>
            <p className="mt-1 text-body-copy leading-relaxed text-muted">
              The record connects communities facing similar questions while
              keeping documented history, present-day alerts, interpretation,
              and advocacy visibly distinct.
            </p>
          </div>
        </div>
      </section>

      <section className="-mx-4 mt-12 bg-band px-4 py-8 sm:-mx-6 sm:px-6">
        <p className="text-small-copy uppercase tracking-widest text-muted">
          The next generation
        </p>
        <h2 className="mt-1 font-serif text-section-title font-semibold">
          Built by the next generation
        </h2>
        <div className="mt-4 space-y-4 leading-relaxed">
          <p className="text-subsection-title">
            <a
              href="https://archyvas.ziburioltmokykla.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-accent"
            >
              Skaitmeniniai Knygnešiai
            </a>
            , the Žiburio Lithuanian School&rsquo;s student archive internship
            in Detroit, is rooted in the students&rsquo; own{" "}
            <Link
              href="/parishes/dievo-apvaizdos-southfield-mi"
              className="font-medium underline underline-offset-4 hover:text-accent"
            >
              Divine Providence parish
            </Link>
            . They are helping promote and preserve it as a living Lithuanian
            community, not simply studying it from a distance.
          </p>
          <p>
            The students scanned the parish&rsquo;s books page by page,
            catalogued the collection, preserved and organized the digital
            files, and made the sources available to communities and
            researchers. Those digitized books form the archival foundation for
            this research and the parish data built from it.
          </p>
          <p>
            The work continues. As the students scan and catalogue more parish
            material, they expand the public record while gaining a real role
            as researchers, archivists, advocates, and future custodians of
            Lithuanian parish life.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="https://archyvas.ziburioltmokykla.org/internship"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md px-4 py-2 text-body-copy font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--mark-closed)" }}
          >
            Explore the student internship
          </a>
          <a
            href="https://archyvas.ziburioltmokykla.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md border border-rule px-4 py-2 text-body-copy font-medium transition-colors hover:border-foreground"
          >
            Visit the public archive
          </a>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Principles of the project
        </h2>
        <div className="mt-4 space-y-4 leading-relaxed">
          <p>
            <strong>One parish, one shared record.</strong> Public pages
            should read from the same underlying identity, chronology, status,
            and evidence rather than accumulating competing overlays.
          </p>
          <p>
            <strong>Evidence stays attached.</strong> Readers should be able to
            follow a claim back to the newspaper issue, archive book, official
            notice, public record, or current source that supports it.
          </p>
          <p>
            <strong>Uncertainty remains visible.</strong> Conflicting dates,
            incomplete matches, unresolved status, and missing evidence are
            named rather than silently converted into certainty.
          </p>
          <p>
            <strong>The record can be corrected.</strong> New evidence is
            welcomed, reviewed, and incorporated without erasing the reasoning
            behind a change.
          </p>
        </div>
        <p className="mt-4 text-body-copy leading-relaxed text-muted">
          The detailed rules live in{" "}
          <Link href="/about-the-data" className="underline hover:text-foreground">
            About the Data
          </Link>
          ; the evidence ecosystem lives in{" "}
          <Link
            href="/about/sources-and-archives"
            className="underline hover:text-foreground"
          >
            Sources &amp; Archives
          </Link>
          .
        </p>
      </section>

      <section className="mt-12">
        <p className="text-small-copy uppercase tracking-widest text-muted">
          A connected record
        </p>
        <h2 className="mt-1 font-serif text-section-title font-semibold">
          A digital <em>tinklas</em> for Lithuanian parish history
        </h2>
        <div className="mt-3 space-y-4 leading-relaxed">
          <p>
            This project stands on work already done by historians,
            archivists, librarians, field researchers, journalists, clergy,
            and community volunteers. Heritage maps have located and
            photographed Lithuanian places. Books have assembled parish
            histories. Libraries and digital archives have preserved the
            newspapers, documents, and images on which new research depends.
            Each has made a lasting part of the record easier to find.
          </p>
          <p>
            Save Our Lithuanian Parishes does not replace those resources. It
            connects them. The registry brings each institution&rsquo;s
            identity, history, present condition, and supporting evidence into
            one public path. A reader can move from the national record to a
            parish profile and then to the exact book page, newspaper page,
            decree, official notice, or public record behind a statement.
          </p>
          <p>
            In that sense, SOLP is a digital <em>tinklas</em>&mdash;a network
            that helps archives, scholarship, institutions, and communities
            work together. The idea has deep roots. Bishop Motiejus Valančius
            built a broad network of parish schools and, during the Lithuanian
            press ban, organized the printing of Lithuanian texts in Prussia
            and their secret transport across the border. The circumstances
            today are different, but the connective principle remains: shared
            knowledge becomes more useful when people can find it, trace it,
            and carry it from one community to another.
          </p>
          <p>
            To our knowledge, no earlier public resource has joined a
            comprehensive record of Lithuanian parishes and missions in the
            United States with full institutional histories, present-day
            conditions, and direct paths into the supporting sources. The
            project&rsquo;s contribution is that connection: existing
            scholarship and archives remain visible, credited, and easier to
            use together.
          </p>
        </div>

        <h3 className="mt-8 font-serif text-subsection-title font-semibold">
          Work this record builds on
        </h3>
        <ul className="mt-3 divide-y divide-rule border-y border-rule text-body-copy leading-relaxed">
          <li className="py-4">
            <a
              href="https://map.truelithuania.com/en/explanations-of-the-map2/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              <em>Tikslas &ndash; Amerika / Destination Lithuanian America</em>
            </a>{" "}
            is the interactive, bilingual map created by the Global True
            Lithuania team led by Augustinas Žemaitis. Field expeditions,
            photographs, interviews, and local collaboration document hundreds
            of Lithuanian heritage sites in the United States and Canada. Its
            unit is the heritage place; SOLP&rsquo;s unit is the institution
            and its evidence record. See also the project&rsquo;s{" "}
            <a
              href="https://map.truelithuania.com/en/authors-of-the-map-2023/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              authors and acknowledgements
            </a>
            ,{" "}
            <a
              href="https://global.truelithuania.com/maps-of-lithuanian-heritage-abroad/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Global True Lithuania&rsquo;s map guide
            </a>
            , and the{" "}
            <a
              href="https://en.wikipedia.org/wiki/Destination_Lithuanian_America"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              project history on Wikipedia
            </a>
            .
          </li>
          <li className="py-4">
            William Wolkovich-Valkavičius, <em>Lithuanian Religious Life in
            America: A Compendium of 150 Roman Catholic Parishes and
            Institutions</em>, 3 vols. (Norwood, Mass.: Lithuanian Religious
            Life in America, 1991, 1996, 1998), remains the foundational print
            survey: Volume 1 covers the Eastern United States, Volume 2
            Pennsylvania, and Volume 3 the Midwest and beyond. Read the{" "}
            <a
              href="https://bpl.bibliocommons.com/v2/record/S75C524973"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Boston Public Library catalog record
            </a>{" "}
            or the{" "}
            <a
              href="https://archyvas.ziburioltmokykla.org/item/20260722_1784749031073"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Žiburio Archive record for Volume 3
            </a>
            .
          </li>
          <li className="py-4">
            The{" "}
            <a
              href="https://lithuanianresearch.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Lithuanian Research Center
            </a>{" "}
            preserves extensive Lithuanian archival, library, museum, and
            periodical collections outside Lithuania. Its{" "}
            <a
              href="https://lithuanianresearch.org/periodicals/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              periodicals collection
            </a>{" "}
            supports the separate{" "}
            <a
              href="https://www.spauda.org/apie-projekta-about-this-project/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Spauda.org digitization project
            </a>
            , directed by Dr. Jonas Daugirdas under the Center&rsquo;s
            auspices, with Kristina Lapienytė as project coordinator and Dr.
            Indre Antanaitis-Jacobs as Director of Archives.
          </li>
          <li className="py-4">
            The{" "}
            <a
              href="https://www.epaveldas.lt/about"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              ePaveldas digital cultural heritage portal
            </a>{" "}
            brings together digitized books, diaspora periodicals, maps,
            church registers, and other cultural objects contributed by
            Lithuanian libraries, museums, and archives. The{" "}
            <a
              href="https://lkbkronika.lt/index.php/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Chronicle of the Catholic Church in Lithuania digital archive
            </a>{" "}
            preserves and presents the underground publication&rsquo;s record
            of religious life and repression under Soviet rule.
          </li>
          <li className="py-4">
            Earlier reference works remain useful points of orientation. The{" "}
            <a
              href="https://www.newadvent.org/cathen/16054a.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              1913 <em>Catholic Encyclopedia</em> article &ldquo;Lithuanians in
              the United States&rdquo;
            </a>{" "}
            offers a contemporary institutional overview, while collaborative
            references such as{" "}
            <a
              href="https://en.wikipedia.org/wiki/Category:Lithuanian-American_history"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Wikipedia&rsquo;s Lithuanian-American history pages
            </a>{" "}
            make individual people, places, and subjects discoverable. They are
            starting points rather than substitutes for the cited source path
            attached to each SOLP profile.
          </li>
          <li className="py-4">
            The student-built{" "}
            <a
              href="https://archyvas.ziburioltmokykla.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Žiburio Archive
            </a>{" "}
            makes Lithuanian diaspora books and documents publicly accessible
            and supplies the archival foundation for much of SOLP&rsquo;s
            page-cited parish research. Its young archivists are not merely
            preserving a collection; they are helping the record remain usable
            by the next generation.
          </li>
          <li className="py-4">
            The Valančius comparison is grounded in the{" "}
            <a
              href="https://www.vle.lt/straipsnis/motiejus-valancius/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Visuotinė lietuvių enciklopedija biography of Motiejus Valančius
            </a>
            , which documents his parish-school network and his organization of
            Lithuanian printing in Prussia and secret cross-border
            distribution during the press ban.
          </li>
        </ul>
        <p className="mt-4 text-small-copy leading-relaxed text-muted">
          These links identify the projects and works discussed here. The
          source list for a specific historical statement remains attached to
          the relevant parish profile; a fuller bibliography appears in{" "}
          <Link
            href="/about/sources-and-archives"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sources &amp; Archives
          </Link>
          .
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-subsection-title font-semibold">
          Help the record grow
        </h2>
        <p className="mt-2 text-body-copy leading-relaxed text-muted">
          Corrections, documents, parish news, photographs, and memories are
          welcome. Reports are reviewed before publication.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/report"
            className="inline-block rounded-md px-4 py-2 text-body-copy font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--mark-closed)" }}
          >
            Report from your parish
          </Link>
          <a
            href="https://blog.saveourlithuanianparishes.org/subscribe"
            className="inline-block rounded-md border border-rule px-4 py-2 text-body-copy font-medium transition-colors hover:border-foreground"
          >
            Follow Židinys
          </a>
        </div>
      </section>
    </article>
  );
}
