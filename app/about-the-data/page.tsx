import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
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
    "How historical and current evidence is checked, organized, and published in the Lithuanian parish record.",
};

type ArchiveFeatureProps = {
  image: string;
  imageAlt: string;
  imageCredit: string;
  imageFit?: "cover" | "contain";
  eyebrow: string;
  title: string;
  href: string;
  children: ReactNode;
};

function ArchiveFeature({
  image,
  imageAlt,
  imageCredit,
  imageFit = "cover",
  eyebrow,
  title,
  href,
  children,
}: ArchiveFeatureProps) {
  return (
    <article className="overflow-hidden border border-rule bg-white">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block border-b border-rule bg-[#f5f2eb]"
      >
        <div className="relative h-40 sm:h-48">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(min-width: 768px) 352px, 100vw"
            className={imageFit === "contain" ? "object-contain" : "object-cover"}
          />
        </div>
        <span className="block border-t border-rule px-3 py-2 text-small-copy text-muted">
          {imageCredit}
        </span>
      </a>
      <div className="p-5">
        <p className="text-small-copy font-medium uppercase tracking-widest text-muted">
          {eyebrow}
        </p>
        <h3 className="mt-1 font-serif text-subsection-title font-semibold">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-rule underline-offset-4 hover:decoration-foreground"
          >
            {title} ↗
          </a>
        </h3>
        <div className="mt-3 space-y-3 text-body-copy leading-relaxed text-muted">
          {children}
        </div>
      </div>
    </article>
  );
}

export default function AboutTheDataPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-small-copy uppercase tracking-widest text-muted">About</p>
      <h1 className="mt-1 font-serif text-page-title font-semibold leading-tight">
        About the Data
      </h1>
      <p className="mt-4 max-w-3xl text-subsection-title leading-relaxed text-muted">
        Every profile begins with historical evidence and ends with a check of
        the parish, community, or church as it exists today. Sources are kept
        visible so readers can distinguish a published history, a newspaper
        report, an official church record, and a present-day observation.
      </p>

      <AboutNav current="data" />

      <section className="mt-10">
        <h2 className="font-serif text-section-title font-semibold">
          Where the record begins
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          Three public digital collections make a large part of this work
          possible. They remain independent projects: Save Our Lithuanian
          Parishes does not own or republish their collections. We use their
          public materials as evidence and link readers back to the original
          archive.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ArchiveFeature
            image="/images/sources/ziburio-archive.png"
            imageAlt="Žiburio Archive — Lithuanian Diaspora Materials"
            imageCredit="Visual supplied by the Žiburio Archive."
            eyebrow="Books, periodicals, and documents"
            title="Žiburio Archive"
            href="https://archyvas.ziburioltmokykla.org/"
          >
            <p>
              The Žiburio Archive is a public digital repository created within
              Žiburio Lituanistinė Mokykla in Detroit, with students serving as
              archivists and contributors. Its growing collection preserves
              Lithuanian diaspora books, periodicals, and documents from the
              nineteenth and twentieth centuries.
            </p>
            <p>
              It gives this project direct access to many parish histories and
              documentary volumes—not only two books. Parish profiles link to
              the relevant archive item whenever a public record is available.
            </p>
          </ArchiveFeature>

          <ArchiveFeature
            image="/images/sources/draugas-archive.jpg"
            imageAlt="Draugas newspaper and Kultūra supplement mastheads"
            imageCredit="Draugas and Kultūra mastheads from draugas.org."
            imageFit="contain"
            eyebrow="Lithuanian-American newspaper"
            title="Draugas digital archive"
            href="https://www.draugas.org/archyvas-pdf/"
          >
            <p>
              <em>Draugas</em> has reported on Lithuanian parishes since 1909.
              The 2008–May 2026 run—2,768 issues—was read issue by issue. The
              earlier digital run was searched systematically for parish names,
              dates, disputes, jubilees, closures, and community response.
            </p>
            <p>
              Search results are only leads. A newspaper item appears as a
              finished public source only after the parish identity, headline,
              date, page, and link have been reviewed. Verified issue and page
              links appear on the relevant parish profile. This review is
              continuing.
            </p>
          </ArchiveFeature>

          <ArchiveFeature
            image="/images/sources/spauda-org.jpg"
            imageAlt="Historic Lithuanian diaspora newspaper mastheads from Spauda.org"
            imageCredit="Diaspora newspaper banner from Spauda.org."
            imageFit="contain"
            eyebrow="Digitized diaspora press"
            title="Spauda.org"
            href="https://www.spauda.org/"
          >
            <p>
              Spauda.org is a public digitization project for Lithuanian-language
              newspapers published in the diaspora. It is directed by Dr. Jonas
              Daugirdas under the auspices of the Lithuanian Research and Studies
              Center; Kristina Lapienytė is project coordinator and Dr. Indre
              Antanaitis-Jacobs is Director of Archives.
            </p>
            <p>
              We search this collection for corroborating parish evidence and
              link directly to public issues when a reference has been reviewed.
              The newspapers and scans remain the work and property of their
              publishers, libraries, and the Spauda.org project.
            </p>
          </ArchiveFeature>

          <article className="border border-rule bg-[#faf7f0] p-5">
            <p className="text-small-copy font-medium uppercase tracking-widest text-muted">
              Current and official evidence
            </p>
            <h3 className="mt-1 font-serif text-subsection-title font-semibold">
              Parish, diocesan, civil, and public records
            </h3>
            <div className="mt-3 space-y-3 text-body-copy leading-relaxed text-muted">
              <p>
                Official parish and diocesan pages, bulletins, decrees, Mass
                schedules, property records, preservation records, public
                filings, local reporting, and field observations establish what
                happened after the historical sources end and what exists now.
              </p>
              <p>
                Each profile names and links the particular source used. A
                directory can establish that a community is listed; a decree is
                required to establish a formal canonical act; a photograph can
                establish a visible building condition on the date it was taken.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          How evidence becomes a parish profile
        </h2>
        <ol className="mt-5 grid gap-px border border-rule bg-rule sm:grid-cols-2">
          {[
            [
              "1",
              "Identify the institution",
              "Names are matched with city, jurisdiction, dates, addresses, clergy, and community context so two parishes with the same saint’s name are not confused.",
            ],
            [
              "2",
              "Build the chronology",
              "Founding, building, merger, closure, relocation, and present-day claims are separated and tied to the sources that support them.",
            ],
            [
              "3",
              "Resolve or show disagreements",
              "Conflicting dates and interpretations are compared. When the evidence does not settle a question, the uncertainty remains visible instead of being converted into a fact.",
            ],
            [
              "4",
              "Publish and keep checking",
              "The profile, map, and aggregate views are generated from the same reviewed record. Source dates and unresolved questions are monitored, and new evidence is reviewed before publication.",
            ],
          ].map(([number, title, copy]) => (
            <li key={number} className="bg-background p-5">
              <p className="font-mono text-small-copy text-muted">{number}</p>
              <h3 className="mt-1 font-serif text-subsection-title font-semibold">
                {title}
              </h3>
              <p className="mt-2 text-body-copy leading-relaxed text-muted">{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          One record, several different populations
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          Institutions, historical Roman Catholic parishes, physical worship
          sites, and current places of Lithuanian worship answer different
          questions. They are not added together or substituted for one another.
        </p>
        <div className="mt-5 overflow-x-auto border-y border-rule">
          <table className="w-full min-w-[36rem] text-left text-body-copy">
            <thead className="text-small-copy uppercase text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Public view</th>
                <th className="py-2 font-medium">What it counts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              <tr>
                <th className="py-3 pr-4 font-semibold">All Profiles</th>
                <td className="py-3">
                  {siteFigures.publicUS.records} published U.S. institutions
                  across Catholic, National or independent Catholic, and
                  Protestant traditions.
                </td>
              </tr>
              <tr>
                <th className="py-3 pr-4 font-semibold">The History</th>
                <td className="py-3">
                  {siteFigures.history.parishes} Roman Catholic parish
                  institutions. Missions and other traditions remain outside
                  this historical comparison.
                </td>
              </tr>
              <tr>
                <th className="py-3 pr-4 font-semibold">Church buildings</th>
                <td className="py-3">
                  {siteFigures.physicalSites.worshipSites} documented physical
                  worship sites. One institution may have used more than one
                  church over time.
                </td>
              </tr>
              <tr>
                <th className="py-3 pr-4 font-semibold">The Living Network</th>
                <td className="py-3">
                  {CURRENT_WORSHIP_PLACES} current places of regular Lithuanian
                  Catholic worship: active parishes, active missions, and
                  Lithuanian Masses hosted by other parishes.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Corrections and continuing updates
        </h2>
        <p className="mt-3 leading-relaxed">
          Parish life and building ownership continue to change. The research
          system records when current sources were checked, flags conflicts and
          older observations for review, and tests the figures against the
          underlying parish records before the site is published. Those tools
          help manage the work; people still review the evidence and decide what
          the public record can responsibly say.
        </p>
        <p className="mt-3 leading-relaxed">
          Community reports, photographs, documents, and corrections submitted
          through the{" "}
          <Link href="/report" className="underline underline-offset-4">
            report page
          </Link>{" "}
          are reviewed before publication. When a claim cannot be confirmed, it
          stays unresolved; when a published claim is shown to be wrong, it is
          corrected rather than silently preserved.
        </p>
      </section>

      <section className="mt-12 border-t border-rule pt-5">
        <h2 className="font-serif text-subsection-title font-semibold">
          Looking for the full bibliography?
        </h2>
        <p className="mt-2 text-body-copy leading-relaxed text-muted">
          The named archives, published histories, official directories,
          discovery resources, geography, and image sources are listed on{" "}
          <Link
            href="/about/sources-and-archives"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sources &amp; Archives
          </Link>
          . Copyright practice and reuse terms are on the{" "}
          <Link
            href="/legal"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Legal, attribution &amp; data use
          </Link>{" "}
          page.
        </p>
      </section>
    </article>
  );
}
