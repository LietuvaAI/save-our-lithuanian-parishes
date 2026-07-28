import type { Metadata } from "next";
import Link from "next/link";
import AboutNav from "@/components/AboutNav";
import { figures } from "@/lib/parishes";
import { usRegistryParishes } from "@/lib/registry-scope";

const documentedUSRecords = usRegistryParishes().length;

export const metadata: Metadata = {
  title: "About the Project",
  description:
    "Why Save Our Lithuanian Parishes keeps the complete, sourced public record of America's Lithuanian parishes.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">About</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        About the Project
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Save Our Lithuanian Parishes keeps the complete public record of the
        communities Lithuanian immigrants built across America: how each parish
        began, what sustained it, what changed, where the community and church
        stand today, and what one parish can learn from another.
      </p>

      <AboutNav current="project" />

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          One parish, one connected story
        </h2>
        <div className="mt-3 space-y-4 leading-relaxed">
          <p>
            The record currently contains{" "}
            <strong>{documentedUSRecords} documented U.S. parish and congregation records</strong>.
            Each profile is meant to hold the whole story together: founding,
            Lithuanian identity, liturgical life, governance, turning points,
            canonical status, building fate, current use, and the evidence
            behind every claim.
          </p>
          <p>
            Historical research and current intelligence meet in the same
            record. The archives explain how a community arrived at the present;
            parish, diocesan, civil, and community sources show what is happening
            now. Active campaigns and sustainability concerns remain separate
            from the parish&rsquo;s canonical status so a current alert never
            silently rewrites the historical record.
          </p>
        </div>
      </section>

      <section id="ownership" className="mt-12 scroll-mt-20">
        <h2 className="font-serif text-2xl font-semibold">
          Ownership is one part of the story
        </h2>
        <div
          className="mt-4 border-l-4 py-1 pl-4"
          style={{ borderColor: "var(--mark-closed)" }}
        >
          <p className="font-medium">Know who holds the deed.</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Find your parish among the documented parishes. See its ownership,
            its outcome, and how its story compares with the rest of the record.
          </p>
        </div>
        <div className="mt-4 space-y-4 leading-relaxed">
          <p>
            That remains a necessary question because ownership can shape who
            has authority over parish property and what options a community has.
            It is not, however, the whole purpose of this project. Ownership now
            sits beside the parish&rsquo;s faith, people, institutions, memory,
            canonical life, and present condition.
          </p>
          <p>
            In the locked 83-parish <em>Draugas</em> case-filed core,{" "}
            <strong>{figures.endingMode.diocese_closed}</strong> parishes were
            closed by diocesan decision; all were diocese-owned. None of the{" "}
            <strong>{figures.communityOwned.total}</strong> community-owned
            cases was closed by an outside authority. That is a documented
            pattern within a specifically bounded corpus, not a substitute for
            the individual evidence and circumstances in each parish profile.
          </p>
          <p className="text-sm text-muted">
            The scope, definitions, and safeguards behind those figures are
            explained in{" "}
            <Link
              href="/about-the-data"
              className="underline hover:text-foreground"
            >
              About the Data
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          What this record does not argue
        </h2>
        <p className="mt-3 leading-relaxed">
          This project documents what happened and helps communities understand
          the processes around them. It does not propose that any parish leave
          the Roman Catholic Church. Lithuanian National Catholic and Protestant
          congregations appear as historical witness and comparative evidence,
          not as recommendations. The guidance pages summarize public law and
          precedent; they are not legal or canonical advice.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Why we keep the record
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
            This project works in that tradition. Decisions about parish futures
            are often made inside processes that are difficult for communities
            to see as a whole. We keep the record ourselves: open, sourced, and
            growing backward through the archives and forward through current
            reports, campaigns, and corrections.
          </p>
          <p className="text-muted">
            The parish record is Lithuanian. The procedural guidance is
            universal and is written for any community facing the same kind of
            decision.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          From record to action
        </h2>
        <div className="mt-4 divide-y divide-rule border-y border-rule">
          <Link
            href="/record"
            className="block py-3.5 hover:text-accent"
          >
            <span className="font-medium">Find a parish</span>
            <span className="ml-2 text-sm text-muted">
              Read its profile and evidence ledger
            </span>
          </Link>
          <Link
            href="/under-threat"
            className="block py-3.5 hover:text-accent"
          >
            <span className="font-medium">See what is happening now</span>
            <span className="ml-2 text-sm text-muted">
              Current alerts and active campaigns
            </span>
          </Link>
          <Link
            href="/start-here"
            className="block py-3.5 hover:text-accent"
          >
            <span className="font-medium">Facing a closure</span>
            <span className="ml-2 text-sm text-muted">
              Deadlines, questions, and documented precedents
            </span>
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">
          Who keeps the record
        </h2>
        <p className="mt-3 leading-relaxed">
          Save Our Lithuanian Parishes is an independent documentation and
          advocacy initiative powered by{" "}
          <a
            href="https://lietuva.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent"
          >
            Lietuva.AI
          </a>
          , supported by the Žiburio Foundation, with archive work made possible
          by{" "}
          <a
            href="https://archyvas.ziburioltmokykla.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent"
          >
            Skaitmeniniai Knygnešiai
          </a>
          , student interns from Detroit. Formal independence, copyright, data
          use, and correction policies are set out in{" "}
          <Link href="/legal" className="underline hover:text-accent">
            Legal, attribution &amp; data use
          </Link>
          .
        </p>
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
