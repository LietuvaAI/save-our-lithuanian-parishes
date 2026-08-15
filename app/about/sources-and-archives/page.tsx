import type { Metadata } from "next";
import Link from "next/link";
import AboutNav from "@/components/AboutNav";

export const metadata: Metadata = {
  title: "Sources & Archives",
  description:
    "The newspapers, archive books, official records, directories, field surveys, and current sources behind the parish record.",
};

type SourceRowProps = {
  title: string;
  href?: string;
  role: string;
  limits: string;
  checkedLinks?: Array<{ label: string; href: string }>;
};

function SourceRow({
  title,
  href,
  role,
  limits,
  checkedLinks,
}: SourceRowProps) {
  return (
    <li className="py-4">
      <p className="font-medium">
        {href?.startsWith("/") ? (
          <Link
            href={href}
            className="underline underline-offset-4 hover:text-accent"
          >
            {title}
          </Link>
        ) : href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-accent"
          >
            {title}
          </a>
        ) : (
          title
        )}
      </p>
      <p className="mt-1 text-body-copy leading-relaxed text-muted">{role}</p>
      <p className="mt-1 text-small-copy leading-relaxed text-muted">
        How it is used: {limits}
      </p>
      {checkedLinks && checkedLinks.length > 0 ? (
        <div className="mt-3">
          <p className="text-small-copy font-medium uppercase tracking-widest text-muted">
            ELIP pages checked
          </p>
          <ul className="mt-2 grid gap-x-5 gap-y-1 text-body-copy sm:grid-cols-2">
            {checkedLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

export default function SourcesAndArchivesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-small-copy uppercase tracking-widest text-muted">About</p>
      <h1 className="mt-1 font-serif text-page-title font-semibold leading-tight">
        Sources &amp; Archives
      </h1>
      <p className="mt-4 text-subsection-title leading-relaxed text-muted">
        This record joins historical archives, published scholarship, official
        institutional records, contemporary reporting, field surveys, and
        community knowledge. Their roles are not interchangeable: each claim is
        weighted according to what its source can actually establish.
      </p>

      <AboutNav current="sources" />

      <section className="mt-10">
        <h2 className="font-serif text-section-title font-semibold">
          How source authority works
        </h2>
        <div className="mt-4 divide-y divide-rule border-y border-rule">
          <div className="py-4">
            <p className="font-medium">Direct and institutional evidence</p>
            <p className="mt-1 text-body-copy leading-relaxed text-muted">
              Decrees, parish and diocesan notices, bulletins, civil records,
              property records, public filings, and photographs of the object
              itself are used for the acts or conditions they directly record.
            </p>
          </div>
          <div className="py-4">
            <p className="font-medium">Contemporary newspaper evidence</p>
            <p className="mt-1 text-body-copy leading-relaxed text-muted">
              A dated <em>Draugas</em> issue or local news report is evidence of
              what was reported at that moment. It may be contemporaneous
              without being the primary legal record of a canonical act.
            </p>
          </div>
          <div className="py-4">
            <p className="font-medium">Published histories and field research</p>
            <p className="mt-1 text-body-copy leading-relaxed text-muted">
              Books, heritage surveys, encyclopedias, and community histories
              supply context, identity leads, architectural detail, and
              competing readings. Important claims are cross-checked before
              they enter the published record.
            </p>
          </div>
          <div className="py-4">
            <p className="font-medium">Directories and discovery sources</p>
            <p className="mt-1 text-body-copy leading-relaxed text-muted">
              Directories help locate parishes, clergy, organizations, and
              possible continuities. They are excellent discovery
              infrastructure, but an identity match is verified before it
              changes a published parish record.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Core archives and published works
        </h2>
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          <SourceRow
            title="Draugas digital archive, 1909–present"
            href="https://www.draugas.org/archyvas-pdf/"
            role="Draugas (“The Friend”) is the Lithuanian-American newspaper of record, a Catholic newspaper founded in 1909 and published in Chicago continuously ever since. For more than a century it reported parish foundings, jubilees, disputes, closures, campaigns, and community response across the Lithuanian diaspora. It is the historical spine of this record."
            limits="The 2008–2026 run—all 2,768 issues—was read straight through, and every parish it mentions was entered with dated citations. The 1909–2007 digital run has been systematically mined for parish identities, dates, and events. Deep case files are now being backfilled parish by parish across that earlier period. A dated newspaper report establishes what was reported at that moment; it does not replace a decree, deed, or other primary institutional record when the claim concerns a canonical or legal act."
          />
          <SourceRow
            title="Skaitmeniniai Knygnešiai / Žiburio digital archive"
            href="https://archyvas.ziburioltmokykla.org"
            role="Public access to digitized books and documentary volumes used in parish research, created through the work of student interns from Detroit."
            limits="Profile evidence ledgers link to the public archive item for a book when that item exists."
          />
          <SourceRow
            title="William Wolkovich-Valkavičius, Lithuanian Religious Life in America"
            href="https://archyvas.ziburioltmokykla.org/item/20260722_1784749031073"
            role="Father William Wolkovich-Valkavičius’s multi-volume Catholic-institutional history is the most extensive published compendium of Lithuanian parishes and religious institutions in the United States. Volume 3, covering the Midwest and beyond, documents roughly 150 parishes from a small print run that has long been difficult to obtain."
            limits="Parish facts are extracted with page citations and checked against the wider record. The public evidence ledger links to the Žiburio archive item; the in-copyright book text is not republished."
          />
          <SourceRow
            title="Stasys Michelsonas, Lietuvių Išeivija Amerikoje"
            href="https://archyvas.ziburioltmokykla.org/item/20260225_lietuviu_iseivija_amerikoje"
            role="Michelsonas’s 1961 history provides an independent secular account of Lithuanian-American settlement, community formation, and early church and property conflicts. It is an important counterpoint to the Catholic-institutional parish histories."
            limits="Facts and short quotations are page-cited to the public Žiburio archive item. When Michelsonas and an institutional source give different readings, the disagreement is preserved for adjudication rather than silently flattened."
          />
          <SourceRow
            title="Algis Lukas, Lietuvių kultūrinis paveldas Amerikoje"
            href="https://archyvas.ziburioltmokykla.org/item/20260725_1785004329786"
            role="Architectural descriptions and photographs of Lithuanian built heritage in the United States."
            limits="Page-cited facts and object identification; image rights are checked separately before publication."
          />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Current and official evidence
        </h2>
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          <SourceRow
            title="Parish, diocesan, and religious-community records"
            role="For every case-filed parish, the research seeks a present-day institutional record: parish and diocesan notices, bulletins, clergy assignments, Mass schedules, merger or suppression decrees, restructuring plans, and property announcements. These sources establish what the parish and building are today and what happened after the historical archive fell silent."
            limits="The specific page or document is linked on the parish profile and dated when available. A current schedule or directory supports current activity; a decree or official notice is required when the claim concerns a formal canonical act."
          />
          <SourceRow
            title="Vatican and canon-law documents"
            href="https://www.vatican.va"
            role="The law and procedural framework used on the guidance and reversal pages."
            limits="Official texts establish the rule; reporting and case records establish how it was applied in a particular dispute."
          />
          <SourceRow
            title="Civil, preservation, and property records"
            href="https://www.nps.gov/subjects/nationalregister/index.htm"
            role="Ownership transfers, assessed use, landmark status, National Register recognition, sale proposals, and building disposition."
            limits="A designation, deed, or public filing is used only for the fact it records; absence from one index is not treated as proof of nonexistence."
          />
          <SourceRow
            title="Contemporary local and national reporting"
            role="Local and national reporting documents closure announcements, community campaigns, financial context, litigation, preservation efforts, and events still unfolding. It also records how parishioners and public institutions understood and responded to a decision at the time."
            limits="Current claims carry a publication URL and observation date; active alerts are refreshed on their stated cadence. Reporting is cross-checked against official records when it describes a decree, ownership transfer, court ruling, or other formal act."
          />
          <SourceRow
            title="National parish-closure reversal record"
            href="/reversals"
            role="A separate national research program documents every U.S. parish closure we can verify was reversed through the Catholic Church’s own procedures. It supplies the precedent record used by the guidance pages."
            limits="Each candidate is checked against contemporary reporting and the strongest available official case record. Cases still awaiting verification remain visibly labeled, and rejected candidates remain documented rather than disappearing from the research history."
          />
          <SourceRow
            title="Community reports"
            role="Corrections, documents, photographs, memories, and current parish news from people who know the communities."
            limits="Reviewed before publication and labeled as community-reported until independently corroborated."
          />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Research and discovery networks
        </h2>
        <p className="mt-2 text-body-copy leading-relaxed text-muted">
          These sources are especially valuable for finding leads, alternate
          names, institutions, clergy, and heritage sites. They do not write
          directly into the registry without identity checking and
          corroboration.
        </p>
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          <SourceRow
            title="Global True Lithuania"
            href="https://global.truelithuania.com"
            role="Field observations, exact heritage locations, visible building features, Canadian comparators, and present-use leads."
            limits="Used as field and discovery evidence; claims that conflict with stronger records are held or explicitly adjudicated."
          />
          <SourceRow
            title="ELIP / Enciklopedija Lietuvai ir pasauliui"
            href="https://lietuvai.lt/wiki/JAV_lietuvi%C5%B3_katalik%C5%B3_ba%C5%BEny%C4%8Dios"
            role="Information and links shared with the project by Edvinas. This broad Lithuanian encyclopedia connects churches, communities, schools, organizations, biographies, and downloadable historical works."
            limits="Used for registry cross-checks, alternate names, parish leads, and attributed secondary readings. Page identity and dates are verified against primary or stronger contemporary sources before registry changes."
            checkedLinks={[
              {
                label: "ELIP home",
                href: "https://lietuvai.lt/",
              },
              {
                label: "ELIP support foundation",
                href: "https://lietuvai.lt/wiki/Enciklopedijos_Lietuvai_ir_pasauliui_paramos_fondas",
              },
              {
                label: "JAV lietuviai",
                href: "https://lietuvai.lt/wiki/JAV_lietuviai",
              },
              {
                label: "U.S. Lithuanian Catholic churches",
                href: "https://lietuvai.lt/wiki/JAV_lietuvi%C5%B3_katalik%C5%B3_ba%C5%BEny%C4%8Dios",
              },
              {
                label: "Hartford Holy Trinity (Lithuanian)",
                href: "https://lietuvai.lt/wiki/Hartford_Holy_Trinity_Church",
              },
              {
                label: "Hartford Holy Trinity (English)",
                href: "https://lietuvai.lt/wiki/Holy_Trinity_Church_Hartford",
              },
              {
                label: "Rochester St. George",
                href: "https://lietuvai.lt/wiki/Rochester_St._George_Church",
              },
              {
                label: "U.S. Lithuanian schools, 2022–2023",
                href: "https://lietuvai.lt/wiki/Lituanistin%C4%97s_mokyklos_JAV_2022-2023_m.",
              },
              {
                label: "U.S. Lithuanian community districts",
                href: "https://lietuvai.lt/wiki/JAV_lietuvi%C5%B3_apylink%C4%97s",
              },
              {
                label: "Downloadable U.S. Lithuanian history books",
                href: "https://lietuvai.lt/wiki/JAV_lietuvi%C5%B3_istorija._Knygos",
              },
              {
                label: "BALTICS in USA",
                href: "https://lietuvai.lt/wiki/BALTICS_in_USA",
              },
            ]}
          />
          <SourceRow
            title="Litua Lithuanian church directory"
            href="https://www.litua.com/lt/zinynas/baznycios#CA"
            role="Lithuanian and English parish names, city groupings, and a legacy directory baseline useful for measuring what has changed."
            limits="A baseline and lead source, not proof of current activity by itself."
          />
          <SourceRow
            title="Lithuanian Bishops’ Conference diaspora pastoral-care directory"
            href="https://sielovada.org/siaures-amerika/"
            role="The canonical baseline for the current Lithuanian Catholic pastoral network in the United States: parishes, missions, hosted communities, clergy, and liturgical notices."
            limits="Every U.S. listing is preserved in the Lithuanian Catholic Life Today crosswalk. The directory establishes membership in the Lithuanian pastoral network; parish and diocesan records remain authoritative for juridic status, governance, and formal closure."
          />
          <SourceRow
            title="USCCB Catholic organizations directory"
            href="https://www.usccb.org/committees/pastoral-care-migrants-refugees-travelers/catholic-organizations"
            role="A national gateway to ethnic, migrant, refugee, and traveler Catholic organizations, useful both for Lithuanian research and future work on other communities."
            limits="Used to locate organizations and research pathways; each organization remains responsible for its own current information."
          />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Geography, images, and technical sources
        </h2>
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          <SourceRow
            title="U.S. Census TIGER geometry"
            href="https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html"
            role="Public-domain state and county geometry underlying the maps and diocesan boundary construction."
            limits="Geographic shape only; it does not supply parish facts."
          />
          <SourceRow
            title="OpenStreetMap and Nominatim"
            href="https://www.openstreetmap.org/copyright"
            role="Geocoding where an exact building coordinate has not yet been established."
            limits="Coordinates are checked against the expected city, county, and state; records without usable coordinates are skipped rather than guessed."
          />
          <SourceRow
            title="Parish photographs and object records"
            role="Images of buildings, interiors, stained glass, monuments, documents, and other physical evidence."
            limits="Every displayed image carries attribution and a rights basis; unclear permissions remain behind the publication gate."
          />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          What appears on a parish profile
        </h2>
        <p className="mt-3 leading-relaxed">
          Each parish profile ends with a public evidence ledger. It separates
          contemporary and institutional evidence, secondary sources, and this
          project&rsquo;s own publications. Full URLs are printed as well as
          linked. <em>Draugas</em> citations point to the dated issue; archive
          books point to their public Žiburio item when available. Missing
          public links remain visible as missing rather than being silently
          omitted.
        </p>
      </section>

      <p className="mt-12 border-t border-rule pt-5 text-body-copy leading-relaxed text-muted">
        For copyright practice, formal attribution, correction policy, and
        reuse terms, see{" "}
        <Link href="/legal" className="underline hover:text-foreground">
          Legal, attribution &amp; data use
        </Link>
        .
      </p>
    </article>
  );
}
