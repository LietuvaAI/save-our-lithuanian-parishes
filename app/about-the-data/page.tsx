import type { Metadata } from "next";
import Link from "next/link";
import AboutNav from "@/components/AboutNav";
import registry from "@/data/registry-unified.json";
import { isSettlement, isUS, type RegParish } from "@/lib/registry-scope";

const REGISTRY_TOTAL = (registry as { parishes: RegParish[] }).parishes.filter(
  (p) => !isSettlement(p) && (p.country === "CA" || isUS(p))
).length;

export const metadata: Metadata = {
  title: "About the Data",
  description:
    "How this record was collected: the full Draugas run, the parish histories, the unified registry, the reversal database — and how every figure is verified.",
};

export default function AboutTheDataPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">About</p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        About the Data
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        Three different things work together here: the source archive, the
        parish case files, and the registry. They are connected, but they are
        not interchangeable. This page explains how evidence moves from one to
        the next and how the published results are checked.
      </p>

      <AboutNav current="data" />

      <dl className="mt-8 grid gap-4 border-y border-rule py-5 sm:grid-cols-3">
        <div>
          <dt className="font-medium">The archive</dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted">
            The source material we search and read.
          </dd>
        </div>
        <div>
          <dt className="font-medium">The case files</dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted">
            The deep research assembled for one parish at a time.
          </dd>
        </div>
        <div>
          <dt className="font-medium">The registry</dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted">
            The shared structured record that carries the current findings.
          </dd>
        </div>
      </dl>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          1. Find the evidence — the full <em>Draugas</em> archive
        </h2>
        <p className="mt-2 leading-relaxed">
          <em>Draugas</em> is the main historical source collection behind this
          project. We search its complete digital archive, from 1909 to the
          present, for evidence about Lithuanian parishes. That work has taken
          place in two passes. Every issue from January 2008 through May 2026 —{" "}
          <strong>2,768 issues</strong> — was read straight through. The
          1909–2007 run was mined issue by issue in a systematic sweep for
          parish names, founding notices, jubilees, property disputes, closures,
          and community response.
        </p>
        <p className="mt-2 leading-relaxed">
          The two passes cover the full archive. Their purpose is to identify
          parishes and locate the articles that document what happened. This
          archive-wide search tells us where the evidence is; it does not, by
          itself, complete the research story of every parish.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          2. Research each parish — the case files
        </h2>
        <p className="mt-2 leading-relaxed">
          A parish case file is the deep research record for one parish.
          Researchers return to every relevant <em>Draugas</em> issue across the
          full archive, put the evidence in chronological order, and reconcile
          names, dates, mergers, and conflicting accounts. They then compare the
          newspaper record with published histories, official documents,
          present-day parish sources, and evidence about the building and
          community.
        </p>
        <p className="mt-2 leading-relaxed">
          The original group of <strong>83 U.S. parishes</strong> now has a case
          file for every parish. The wider registry contains additional
          parishes and congregations found in the archive and other sources.
          We are now working through that larger group and building the same
          kind of case file for each one.
        </p>
        <p className="mt-2 leading-relaxed">
          In short: the archive search finds the evidence; the case file
          evaluates it parish by parish; and the registry carries the current
          conclusion. As new case files are completed, the registry is updated
          without hiding older source conflicts or unresolved questions.
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
          5. Publish the findings — one registry
        </h2>
        <p className="mt-2 leading-relaxed">
          The registry is the single structured list that powers the map,
          counts, and parish pages. It brings together the current findings for{" "}
          <strong>{REGISTRY_TOTAL} parishes and congregations</strong> across
          the U.S. and Canada, matching the same parish across Lithuanian and
          English names.
        </p>
        <p className="mt-2 leading-relaxed">
          Each entry says how much research has been completed.{" "}
          <em>Case-filed</em> means the parish has a full case file.{" "}
          <em>Multi-source</em> means more than one independent source supports
          the entry, but the full parish deep dive is not finished.{" "}
          <em>Single-source</em> means the parish is documented in one source
          and still needs corroboration. When sources disagree about a name,
          date, or status, the registry preserves each reading and its citation.
        </p>
        <p className="mt-2 leading-relaxed">
          Not everything is published yet. Cemeteries, schools, monasteries,
          convents, and other non-parish sites — and 169 research leads —
          are held back until they meet the standard above. The{" "}
          <Link href="/" className="underline hover:text-accent">
            map
          </Link>{" "}
          separates the layers honestly: shape-coded marks are the case-filed core, solid
          dots the wider research record, squares the non-Catholic
          congregations shown as historical witness.
        </p>
        <p className="mt-2 leading-relaxed">
          As the remaining deep dives are completed, those records move to the{" "}
          <em>case-filed</em> standard. The commitment is that{" "}
          <strong>
            every parish in the registry will ultimately have its own researched
            case file
          </strong>
          . Site figures are recalculated from the registry, and automated
          checks block publication when a protected count no longer agrees with
          the underlying parish records.
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
          7. The geographic data — basemap, boundaries, coordinates
        </h2>
        <p className="mt-2 leading-relaxed">
          The maps are built entirely from openly licensed geography. The
          basemap — state and county outlines — is US Census TIGER geometry
          (public domain, via the us-atlas distribution). The{" "}
          <Link href="/by-diocese" className="underline hover:text-accent">
            diocese boundaries
          </Link>{" "}
          are those same public-domain counties merged diocese by diocese
          using a county-to-diocese crosswalk released into the public domain
          by its author (the <em>us_diocese_mapper</em> project); US Catholic
          dioceses are defined as unions of counties, so diocese lines follow
          county lines, and the few counties split between two dioceses
          follow the crosswalk&rsquo;s primary assignment. Parish coordinates
          come from exact building locations where the field survey recorded
          them, and otherwise from geocoding city locations
          (&copy;&nbsp;OpenStreetMap contributors, via Nominatim) with a
          gazetteer check so a parish never lands in the wrong county. A
          record without usable coordinates is skipped and counted — never
          placed by guess.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          8. Corrections
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
        The complete evidence ecosystem and the role of each source:{" "}
        <Link
          href="/about/sources-and-archives"
          className="underline hover:text-foreground"
        >
          Sources &amp; Archives
        </Link>
        . Formal copyright practice and how to reuse our data:{" "}
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
