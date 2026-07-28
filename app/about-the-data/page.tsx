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
    "How parish evidence moves from the Draugas archive and current official sources through adjudication into the unified registry.",
};

export default function AboutTheDataPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">About</p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        About the Data
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        The archive reconstructs each parish&rsquo;s history. Current and
        official sources establish what exists now. The two records are
        compared claim by claim before a finding enters the registry that
        powers this site.
      </p>

      <AboutNav current="data" />

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          1. The source archive — <em>Draugas</em>, 1909–present
        </h2>
        <p className="mt-2 leading-relaxed">
          <em>Draugas</em> is the project&rsquo;s main historical source. Every
          issue from January 2008 through May 2026 —{" "}
          <strong>2,768 issues</strong> — was read straight through. The
          1909–2007 run was systematically mined for parish names, milestones,
          disputes, closures, and community response. Together, the two passes
          cover the full digital archive.
        </p>
        <p className="mt-2 leading-relaxed">
          This sweep locates the evidence. It is not, by itself, a completed
          history of every parish.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          2. How a parish becomes part of the record
        </h2>
        <p className="mt-2 leading-relaxed">
          Each deep dive is completed in two evidence passes, followed by a
          separate decision about what the sources actually establish.
        </p>
        <div className="mt-5 border-y border-rule divide-y divide-rule">
          <div className="py-4 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-5">
            <h3 className="font-semibold">Archive pass</h3>
            <p className="mt-1 sm:mt-0 leading-relaxed text-muted">
              The full <em>Draugas</em> run and page-cited parish histories
              reconstruct names, identities, events, and timelines.
            </p>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-5">
            <h3 className="font-semibold">Current record</h3>
            <p className="mt-1 sm:mt-0 leading-relaxed text-muted">
              Official parish and diocesan records, legal and property
              documents, current schedules, and reliable local reporting
              establish the present congregation, governance, ownership, and
              use of the building.
            </p>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-[9rem_1fr] sm:gap-5">
            <h3 className="font-semibold">Adjudication</h3>
            <p className="mt-1 sm:mt-0 leading-relaxed text-muted">
              The two evidence packets are compared field by field. Established
              facts enter the registry; secondary, provisional, conflicting,
              and unresolved readings remain labeled as such.
            </p>
          </div>
        </div>
        <p className="mt-2 leading-relaxed">
          All <strong>83 U.S. parishes</strong> in the original group now have
          case files. Additional registry records are being researched in the
          same way, in bounded tranches.
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
          4. Continuing updates
        </h2>
        <p className="mt-2 leading-relaxed">
          Parish life keeps changing, so current claims carry a source date and
          are checked again when new evidence appears. Community reports
          arriving through{" "}
          <Link href="/report" className="underline hover:text-accent">
            the report page
          </Link>{" "}
          are reviewed before publication and remain labeled
          community-reported until independently verified. Failed claims are
          recorded and excluded rather than quietly absorbed into the record.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          5. The published record — one registry
        </h2>
        <p className="mt-2 leading-relaxed">
          The registry powers the map, counts, and parish pages. It currently
          brings together{" "}
          <strong>{REGISTRY_TOTAL} parishes and congregations</strong> across
          the U.S. and Canada.
        </p>
        <p className="mt-2 leading-relaxed">
          The labels <em>case-filed</em>, <em>multi-source</em>, and{" "}
          <em>single-source</em> show how much research supports each entry. As
          new case files are completed, the registry and site figures update
          automatically; protected counts cannot publish if they drift from the
          parish records.
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
