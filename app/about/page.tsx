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
      <p className="text-xs uppercase tracking-widest text-muted">About</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        About the Project
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Save Our Lithuanian Parishes is a public record and living-memory
        project devoted to the communities Lithuanian immigrants built across
        America. It keeps each parish&rsquo;s past and present connected so
        communities can understand what came before, see what is happening now,
        and learn from one another.
      </p>
      <p className="mt-3 text-sm font-medium">
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
        <h2 className="font-serif text-2xl font-semibold">Why it exists</h2>
        <div className="mt-3 space-y-4 leading-relaxed">
          <p>
            Lithuanian parishes have long been the <em>židiniai</em> of their
            communities: hearths of faith, language, memory, education, mutual
            aid, and identity. A parish story is therefore never only the story
            of a church building. It is the story of the people and institutions
            gathered around it.
          </p>
          <p>
            When those stories are scattered across archives, diocesan records,
            private collections, local memory, and current news, each community
            is left to understand its situation alone. This project brings the
            record together and keeps it public.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">What we are building</h2>
        <div className="mt-4 divide-y divide-rule border-y border-rule">
          <div className="py-4">
            <h3 className="font-medium">A connected parish record</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Each parish profile is meant to tell one coherent story across
              founding, worship, community life, governance, turning points,
              present condition, and the evidence behind the record.
            </p>
          </div>
          <div className="py-4">
            <h3 className="font-medium">A bridge between archive and present</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Historical research explains how a community arrived here.
              Current parish, diocesan, civil, and community sources show what
              is happening now.
            </p>
          </div>
          <div className="py-4">
            <h3 className="font-medium">Shared knowledge communities can use</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              The record connects communities facing similar questions while
              keeping documented history, present-day alerts, interpretation,
              and advocacy visibly distinct.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 border-y border-rule py-8">
        <p className="text-xs uppercase tracking-widest text-muted">
          The next generation
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold">
          Built by the next generation
        </h2>
        <div className="mt-4 space-y-4 leading-relaxed">
          <p className="text-lg">
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
            className="inline-block rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--mark-closed)" }}
          >
            Explore the student internship
          </a>
          <a
            href="https://archyvas.ziburioltmokykla.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-md border border-rule px-4 py-2 text-sm font-medium transition-colors hover:border-foreground"
          >
            Visit the public archive
          </a>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Principles of the project
        </h2>
        <div className="mt-4 space-y-4 leading-relaxed">
          <p>
            <strong>One parish, one canonical record.</strong> Public pages
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
        <p className="mt-4 text-sm leading-relaxed text-muted">
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
        <h2 className="font-serif text-2xl font-semibold">
          In the tradition of the book carriers
        </h2>
        <div className="mt-3 space-y-4 leading-relaxed">
          <p>
            When the Lithuanian press was banned under the Tsars, Bishop
            Motiejus Valančius organized the <em>knygnešiai</em>, the book
            carriers who moved the printed word hand to hand across the border.
            Lithuanian identity survived because ordinary people built an
            information network when the institutions around them would not.
          </p>
          <p>
            This project works in that tradition: keeping memory in circulation,
            making knowledge public, and carrying the experience of one
            community to the next.
          </p>
          <p className="text-muted">
            The parish record is Lithuanian. The procedural guidance is
            universal and is written for any community facing the same kind of
            decision.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t border-rule pt-6">
        <h2 className="font-serif text-xl font-semibold">
          Help the record grow
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Corrections, documents, parish news, photographs, and memories are
          welcome. Reports are reviewed before publication.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/report"
            className="inline-block rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--mark-closed)" }}
          >
            Report from your parish
          </Link>
          <a
            href="https://blog.saveourlithuanianparishes.org/subscribe"
            className="inline-block rounded-md border border-rule px-4 py-2 text-sm font-medium transition-colors hover:border-foreground"
          >
            Follow Židinys
          </a>
        </div>
      </section>
    </article>
  );
}
