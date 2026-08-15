import type { Metadata } from "next";
import Link from "next/link";
import AboutNav from "@/components/AboutNav";
import siteFigures from "@/data/site-figures.json";
import { currentPastoralNetwork } from "@/lib/infographic-projection";

const CURRENT_WORSHIP_PLACES =
  currentPastoralNetwork.counts.active_parish +
  currentPastoralNetwork.counts.active_mission +
  currentPastoralNetwork.counts.mass_continues;

export const metadata: Metadata = {
  title: "About the Data",
  description:
    "How parish evidence moves from the Draugas archive and current official sources through adjudication into the unified registry.",
};

export default function AboutTheDataPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-small-copy uppercase tracking-widest text-muted">About</p>
      <h1 className="mt-1 font-serif text-page-title font-semibold leading-tight">
        About the Data
      </h1>
      <p className="mt-4 text-subsection-title text-muted leading-relaxed">
        The archive reconstructs each parish&rsquo;s history. Current and
        official sources establish what exists now. The two records are
        compared claim by claim before a finding enters the registry that
        powers this site.
      </p>

      <AboutNav current="data" />

      <section className="mt-10">
        <h2 className="font-serif text-section-title font-semibold">
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
        <h2 className="font-serif text-section-title font-semibold">
          2. Evidence and adjudication
        </h2>
        <p className="mt-2 leading-relaxed">
          Parish records are established through the synthesis of archival,
          institutional, legal, and contemporary evidence. Claims are evaluated
          for identity, chronology, continuity, governance, and present status.
          The registry preserves the distinction between established findings
          and secondary, provisional, conflicting, or unresolved readings.
        </p>
        <p className="mt-2 leading-relaxed">
          The published census currently contains{" "}
          <strong>{siteFigures.publicUS.records} distinct U.S. institutions</strong>.
          Of these, {siteFigures.publicUS.independentlySupported} have a
          completed two-pass case file or support from multiple source
          families; the remaining {siteFigures.publicUS.singleSourceAttested}
          {" "}are explicitly marked for corroboration.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-section-title font-semibold">
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
        <h2 className="font-serif text-section-title font-semibold">
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
        <h2 className="font-serif text-section-title font-semibold">
          5. The published registry
        </h2>
        <p className="mt-2 leading-relaxed">
          A single registry governs the map, aggregate figures, and parish
          profiles. It distinguishes documented institutions from provisional
          leads and contextual references, which remain in the research record
          without entering public institutional totals.
        </p>
        <p className="mt-2 leading-relaxed">
          Each published record carries its evidentiary status and source
          ledger. Site figures are derived from the registry and validated
          against it before publication.
        </p>
        <div className="mt-4 overflow-x-auto border-y border-rule">
          <table className="w-full min-w-[34rem] text-left text-body-copy">
            <thead className="text-small-copy uppercase text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Public surface</th>
                <th className="py-2 font-medium">Population counted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              <tr>
                <th className="py-3 pr-4 font-semibold">Profile directory</th>
                <td className="py-3">
                  {siteFigures.publicUS.records} public U.S. institutions: {" "}
                  {siteFigures.publicUS.romanCatholicParishes} Roman Catholic
                  parishes, {siteFigures.publicUS.romanCatholicMissions} Roman
                  Catholic missions, {" "}
                  {siteFigures.publicUS.nationalIndependentCatholicCommunities}{" "}
                  National or independent Catholic communities, and {" "}
                  {siteFigures.publicUS.protestantCommunities} Protestant
                  communities.
                </td>
              </tr>
              <tr>
                <th className="py-3 pr-4 font-semibold">The History</th>
                <td className="py-3">
                  {siteFigures.history.parishes} U.S. Roman Catholic parishes;
                  missions and other traditions are outside this historical
                  comparison.
                </td>
              </tr>
              <tr>
                <th className="py-3 pr-4 font-semibold">
                  Buildings mode in Parish &amp; Mission Status
                </th>
                <td className="py-3">
                  {siteFigures.physicalSites.worshipSites} documented physical
                  worship sites. Buildings are never added to the public
                  institution count.
                </td>
              </tr>
              <tr>
                <th className="py-3 pr-4 font-semibold">
                  How Parish Histories Connect
                </th>
                <td className="py-3">
                  {siteFigures.continuity.relationships} typed relationships,
                  separated into institutional changes, community or worship
                  destinations, identity history, and future plans. Records
                  custody is tracked independently.
                </td>
              </tr>
              <tr>
                <th className="py-3 pr-4 font-semibold">
                  Catholic Life Today
                </th>
                <td className="py-3">
                  {CURRENT_WORSHIP_PLACES} places with
                  current Lithuanian Catholic worship, from {" "}
                  {Number(currentPastoralNetwork.directory.counts.listed)}{" "}
                  official network listings.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-section-title font-semibold">
          Canonical release
        </h2>
        <p className="mt-2 leading-relaxed">
          The current site was generated from CultureNet Brain publication
          release <code>{siteFigures.generatedFrom.canonicalPublicationRevision}</code>
          {" "}and infographic release{" "}
          <code>{siteFigures.generatedFrom.canonicalInfographicRevision}</code>.
          Their content hashes are checked during every build, so a copied or
          independently edited site snapshot cannot silently replace them.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-section-title font-semibold">
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
        <h2 className="font-serif text-section-title font-semibold">
          7. The geographic data — basemap, boundaries, coordinates
        </h2>
        <p className="mt-2 leading-relaxed">
          The maps are built entirely from openly licensed geography. The
          basemap — state and county outlines — is US Census TIGER geometry
          (public domain, via the us-atlas distribution). The{" "}
          <Link
            href="/history/loss-by-diocese"
            className="underline hover:text-accent"
          >
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
        <h2 className="font-serif text-section-title font-semibold">
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

      <p className="mt-10 border-t border-rule pt-4 text-body-copy text-muted">
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
        .
      </p>
    </article>
  );
}
