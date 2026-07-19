import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal, attribution & data use",
  description:
    "Who runs this site, what it is and is not, formal citations for every source, copyright and fair-use practice, and how to reuse our data.",
};

export default function LegalPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        Legal, attribution &amp; data use
      </h1>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">Who we are</h2>
        <p className="mt-2 leading-relaxed">
          SaveOurLithuanianParishes.org is an independent documentation and
          advocacy initiative, powered by <strong>Lietuva.AI</strong>. It is
          not affiliated with, endorsed by, or speaking for the Roman
          Catholic Church, any diocese or archdiocese, the Polish National
          Catholic Church, <em>Draugas</em>, or any parish, publisher, or
          organization documented here. The views expressed are the
          project&rsquo;s own; the facts are cited to their sources.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">
          Not legal or canonical advice
        </h2>
        <p className="mt-2 leading-relaxed">
          Nothing on this site is legal advice or canonical advice. Pages
          such as{" "}
          <Link href="/start-here" className="underline hover:text-accent">
            Start Here
          </Link>{" "}
          and{" "}
          <Link
            href="/what-canon-law-says"
            className="underline hover:text-accent"
          >
            What canon law says
          </Link>{" "}
          summarize public documents and reporting to help communities ask
          the right questions in time. Canonical deadlines are short and
          fact-specific: a community facing a closure should engage a canon
          lawyer, and where civil property questions arise, a civil
          attorney, without delay.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">
          Accuracy &amp; corrections
        </h2>
        <p className="mt-2 leading-relaxed">
          The record is compiled in good faith from the sources cited on{" "}
          <Link href="/about-the-data" className="underline hover:text-accent">
            About the data
          </Link>
          , with every load-bearing fact traced to a dated, published
          source, and figures re-validated at every build. Where sources
          conflict, we show the conflict; where a claim fails verification,
          we remove or relabel it publicly. If you believe anything here is
          wrong,{" "}
          <Link href="/report" className="underline hover:text-accent">
            tell us
          </Link>{" "}
          or write to{" "}
          <a
            href="mailto:info@saveourlithuanianparishes.org"
            className="underline hover:text-accent"
          >
            info@saveourlithuanianparishes.org
          </a>{" "}
          — corrections are made promptly and visibly.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">
          Sources &amp; attribution
        </h2>
        <p className="mt-2 leading-relaxed">
          The record stands on the work of others, credited per fact
          throughout the site and formally here:
        </p>
        <ul className="mt-3 list-disc pl-6 space-y-2 leading-relaxed">
          <li>
            <em>Draugas</em>, the Lithuanian-American newspaper (Chicago,
            1909– ). Facts are cited to dated issues and, where the
            digitized archive allows, deep-linked to{" "}
            <a
              href="https://www.draugas.org"
              className="underline hover:text-accent"
            >
              draugas.org
            </a>
            . The archive is the spine of this record, and we are grateful
            for its digitization.
          </li>
          <li>
            William Wolkovich-Valkavičius, <em>Lithuanian Religious Life in
            America: A Compendium of 150 Roman Catholic Parishes and
            Institutions</em>, 3 vols. (1991–1998). Facts cited by volume
            and page; text never republished.
          </li>
          <li>
            Stasys Michelsonas, <em>Lietuvių Išeivija Amerikoje
            (1868–1961)</em> (South Boston, Mass.: &ldquo;Keleivis,&rdquo;
            1961). Facts cited by page; text never republished.
          </li>
          <li>
            The Global True Lithuania map of Lithuanian heritage sites
            (map.truelithuania.com), used for building locations and status
            flags, cited per fact.
          </li>
          <li>
            The <em>Code of Canon Law</em> and Vatican procedural documents,
            via{" "}
            <a
              href="https://www.vatican.va"
              className="underline hover:text-accent"
            >
              vatican.va
            </a>
            ; contemporary press and diocesan documents behind the{" "}
            <Link href="/reversals" className="underline hover:text-accent">
              reversal database
            </Link>
            , cited per case.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">
          Copyright &amp; fair use
        </h2>
        <p className="mt-2 leading-relaxed">
          Works still in copyright are used the way scholarship uses them:
          structured facts with page citations and quotations kept short (in
          our practice, under 25 words, attributed). We never republish full
          texts, scans, or transcriptions of in-copyright works — to read
          the books, seek them through a library catalog. If you hold rights
          in something quoted here and believe our use exceeds fair use,
          contact{" "}
          <a
            href="mailto:info@saveourlithuanianparishes.org"
            className="underline hover:text-accent"
          >
            info@saveourlithuanianparishes.org
          </a>{" "}
          and we will respond promptly. Names and trademarks belong to their
          owners.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">Using our data</h2>
        <p className="mt-2 leading-relaxed">
          Our dataset and the site&rsquo;s original text are formally
          licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="underline hover:text-accent"
          >
            Creative Commons Attribution 4.0 (CC BY 4.0)
          </a>
          : journalists, researchers, parish committees, and anyone else may
          reuse them <strong>with attribution</strong> to
          SaveOurLithuanianParishes.org (and, for facts, to the underlying
          source we cite). The site&rsquo;s code is MIT-licensed. Two
          carve-outs: bylined essays remain © their authors, and facts
          extracted from in-copyright works never carry our license — see
          the{" "}
          <a
            href="https://github.com/LietuvaAI/save-our-lithuanian-parishes/blob/main/LICENSE.md"
            className="underline hover:text-accent"
          >
            full license
          </a>{" "}
          on GitHub, where the dataset lives. Suggested citation:
        </p>
        <p className="mt-3 rounded-md border border-rule px-4 py-3 text-sm leading-relaxed">
          Save Our Lithuanian Parishes, <em>The Record of America&rsquo;s
          Lithuanian Parishes</em> (2026), saveourlithuanianparishes.org —
          an initiative powered by Lietuva.AI. Underlying sources as cited
          per fact.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">Privacy</h2>
        <p className="mt-2 leading-relaxed">
          This site runs no ads, sets no marketing cookies, and asks for no
          accounts. Standard technical logs are kept by our hosting
          provider. Community reports sent to us are reviewed privately and
          published only as described on the{" "}
          <Link href="/report" className="underline hover:text-accent">
            report page
          </Link>
          . The blog,{" "}
          <a
            href="https://blog.saveourlithuanianparishes.org"
            className="underline hover:text-accent"
          >
            The Hearth (Židinys)
          </a>
          , is hosted on Substack under Substack&rsquo;s own terms and
          privacy policy.
        </p>
      </section>

      <p className="mt-10 text-sm text-muted border-t border-rule pt-4">
        © 2026 Save Our Lithuanian Parishes · an initiative powered by
        Lietuva.AI ·{" "}
        <Link href="/about-the-data" className="underline hover:text-foreground">
          About the data
        </Link>{" "}
        ·{" "}
        <a
          href="mailto:info@saveourlithuanianparishes.org"
          className="underline hover:text-foreground"
        >
          info@saveourlithuanianparishes.org
        </a>
      </p>
    </article>
  );
}
