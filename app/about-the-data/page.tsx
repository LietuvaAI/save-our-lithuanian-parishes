import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About the data",
  description:
    "How this record was collected: the full Draugas run, the parish histories, the unified registry, the reversal database — and how every figure is verified.",
};

export default function AboutTheDataPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        The methodology
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        About the data
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        Every figure on this site traces to a dated, published source, and the
        site refuses to build if a number drifts from the verified research.
        This page is the full chain: where the data comes from, how it was
        collected, and how it is checked.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          1. The core record — <em>Draugas</em>, 2008–2026
        </h2>
        <p className="mt-2 leading-relaxed">
          The spine of the record is the archive of <em>Draugas</em>, the
          Lithuanian-American newspaper. Every issue from January 2008 through
          May 2026 — <strong>2,768 issues</strong> — was read and searched,
          and every U.S. Lithuanian parish mentioned in them entered one
          dataset: <strong>83 parishes</strong>, 58 of them documented in
          depth in per-parish case files. The headline figures — 83
          documented, 55 closed by diocesan decision, 55 of 55 diocese-owned,
          0 community-owned parishes closed by an outside authority — are{" "}
          <em>locked</em>: they are re-derived from the parish record at every
          build, and if a derived figure ever disagrees with the verified
          research, the build fails and the site does not publish.
        </p>
        <p className="mt-2 leading-relaxed">
          Citations link to the dated issue wherever the digitized archive
          allows, and a verification script checks those deep links against
          both eras of the <em>Draugas</em> digital archive.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          2. The full canon — <em>Draugas</em> back to 1909
        </h2>
        <p className="mt-2 leading-relaxed">
          The record does not stop at 2008. The full historical run of{" "}
          <em>Draugas</em> — from its first issues in 1909 through 2007 —
          has been read in a systematic archive sweep: parish registries,
          founding notices, jubilee articles that imply founding years,
          closure coverage, and a gazetteer of the places Lithuanians built.
          The sweep&rsquo;s completion brief states its own limits honestly
          — detection is comprehensive, not exhaustive transcription — and
          its full results are joined into the registry below. This work
          recovers the parishes that closed before living memory and the
          events the modern record only inherits secondhand.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          3. The books — published parish histories
        </h2>
        <p className="mt-2 leading-relaxed">
          Two published histories anchor the record from opposite vantage
          points. William Wolkovich-Valkavičius&rsquo;s three-volume{" "}
          <em>Lithuanian Religious Life in America</em> (1991–1998) is the
          Catholic-institutional compendium; its Volume 3 (the Midwest and
          beyond) has been extracted page by page. Stasys Michelsonas&rsquo;s{" "}
          <em>Lietuvių Išeivija Amerikoje</em> (Keleivis, 1961) is the
          secular counterpoint — the longtime editor of a freethinker
          newspaper documenting the same communities, including the
          &ldquo;church fights&rdquo; over property from the 1880s onward;
          its extraction is complete and joined into the registry. Where a
          Catholic historian and a
          socialist editor agree on a fact, that agreement is the strongest
          corroboration this record can offer. Where they diverge, we keep
          both readings.
        </p>
        <p className="mt-2 leading-relaxed">
          Both books remain in copyright. We never republish their text:
          only structured, page-cited facts enter the dataset, with
          quotations held under 25 words. To read the books themselves, seek
          them through a library catalog — they are worth finding.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          4. Contemporary sources
        </h2>
        <p className="mt-2 leading-relaxed">
          A structured web sweep of present-day sources adds building
          coordinates, post-2008 status changes, and the only systematic
          coverage of Canadian Lithuanian parishes. These sources are used
          within known limits — they contribute locations and status flags,
          and where one of their narratives failed verification against
          primary sources, that failure is recorded and the claim excluded.
          Community reports arriving through{" "}
          <Link href="/report" className="underline hover:text-accent">
            the report page
          </Link>{" "}
          are reviewed before anything is published and are always marked
          community-reported, distinct from the archive-verified record.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          5. One registry, honest depth
        </h2>
        <p className="mt-2 leading-relaxed">
          The sources join into a single research registry —{" "}
          <strong>220 parishes</strong> across the U.S. and Canada — matched
          by city and patron saint across Lithuanian and English spellings.
          Every parish carries a record-depth label rather than a
          verified/unverified caste: <em>case-filed</em> (the 83 with full
          case files), <em>multi-source</em> (documented independently in
          more than one source), or <em>single-source</em> (documented in
          one, awaiting corroboration). Where sources conflict — a founding
          year, a titular, a status — the registry keeps every reading with
          its citation. Conflicts are data; we do not average them away.
        </p>
        <p className="mt-2 leading-relaxed">
          Not everything is published yet. Cemeteries, schools, monasteries,
          convents, and other non-parish sites — and 169 research leads —
          are held back until they meet the standard above. The{" "}
          <Link href="/" className="underline hover:text-accent">
            map
          </Link>{" "}
          separates the layers honestly: shape-coded marks are the 83, solid
          dots the wider research record, squares the non-Catholic
          congregations shown as historical witness.
        </p>
        <p className="mt-2 leading-relaxed">
          The depth labels are a ladder, not a caste. The commitment is
          this: <strong>every parish in this record will, in time, carry
          its own researched case file</strong> — the deep dives proceed
          parish by parish, and each one moves its parish up the ladder
          until the whole record stands at the standard of the 83.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          6. The reversal database
        </h2>
        <p className="mt-2 leading-relaxed">
          The{" "}
          <Link href="/reversals" className="underline hover:text-accent">
            database of reversed closures
          </Link>{" "}
          was researched from contemporary sources, then challenged by
          independent adversarial review — dozens of verification votes, none
          of which produced a refutation. Cases whose verification panel has
          not finished are labeled <em>case filed — verification pending</em>{" "}
          on the page itself, and two candidate cases that turned out{" "}
          <em>not</em> to be reversals are listed publicly. Keeping our
          misses visible is part of the method.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          7. Corrections
        </h2>
        <p className="mt-2 leading-relaxed">
          The dataset is open —{" "}
          <a
            href="https://github.com/LietuvaAI/save-our-lithuanian-parishes"
            className="underline hover:text-accent"
          >
            check our numbers
          </a>{" "}
          — and the record is corrected in public: when a claim fails
          verification, it is removed or relabeled, not quietly rewritten.
          If you know one of these parishes and see an error,{" "}
          <Link href="/report" className="underline hover:text-accent">
            tell us
          </Link>
          . A record that cannot be challenged cannot be trusted.
        </p>
      </section>

      <p className="mt-10 text-sm text-muted border-t border-rule pt-4">
        Formal citations for every source, copyright practice, and how to
        reuse our data:{" "}
        <Link href="/legal" className="underline hover:text-foreground">
          Legal, attribution &amp; data use
        </Link>
        . See also:{" "}
        <Link href="/record" className="underline hover:text-foreground">
          the record
        </Link>{" "}
        ·{" "}
        <Link href="/about" className="underline hover:text-foreground">
          about the project
        </Link>{" "}
        ·{" "}
        <Link href="/reversals" className="underline hover:text-foreground">
          where Rome said no
        </Link>
      </p>
    </article>
  );
}
