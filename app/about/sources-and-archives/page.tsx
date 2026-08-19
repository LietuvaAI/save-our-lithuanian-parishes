import type { Metadata } from "next";
import Link from "next/link";
import AboutNav from "@/components/AboutNav";

export const metadata: Metadata = {
  title: "Sources & Archives",
  description:
    "Archive attribution, published works, newspaper collections, official records, and research resources used in the Lithuanian parish record.",
};

type SourceRowProps = {
  title: string;
  href?: string;
  credit: string;
  use: string;
};

function SourceRow({ title, href, credit, use }: SourceRowProps) {
  const titleNode = href?.startsWith("/") ? (
    <Link href={href} className="underline underline-offset-4">
      {title}
    </Link>
  ) : href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-4"
    >
      {title} ↗
    </a>
  ) : (
    title
  );

  return (
    <li className="py-5">
      <h3 className="font-serif text-subsection-title font-semibold">{titleNode}</h3>
      <p className="mt-2 text-body-copy leading-relaxed">{credit}</p>
      <p className="mt-2 text-small-copy leading-relaxed text-muted">
        <span className="font-medium text-foreground">Used here:</span> {use}
      </p>
    </li>
  );
}

export default function SourcesAndArchivesPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-small-copy uppercase tracking-widest text-muted">About</p>
      <h1 className="mt-1 font-serif text-page-title font-semibold leading-tight">
        Sources &amp; Archives
      </h1>
      <p className="mt-4 max-w-3xl text-subsection-title leading-relaxed text-muted">
        This is the bibliography and attribution guide for the parish record.
        It identifies the archives, books, newspapers, directories, official
        records, and public research resources used across the site.
      </p>

      <AboutNav current="sources" />

      <div className="mt-8 border-l-2 border-foreground bg-[#faf7f0] px-5 py-4 text-body-copy leading-relaxed">
        Looking for an explanation of how evidence is checked and turned into a
        profile? Read{" "}
        <Link href="/about-the-data" className="font-medium underline underline-offset-4">
          About the Data
        </Link>
        . This page concentrates on source ownership, access, attribution, and
        the role of each collection.
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Žiburio Archive
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          The{" "}
          <a
            href="https://archyvas.ziburioltmokykla.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Žiburio Archive
          </a>{" "}
          is a structured public repository of Lithuanian diaspora books,
          periodicals, and documents formed within Žiburio Lituanistinė Mokykla
          in Detroit. Students participate as archivists and contributors. The
          collection spans far more than the titles used on this site; SOLP
          links to its records but does not own or reproduce the archive.
        </p>

        <h3 className="mt-7 font-serif text-subsection-title font-semibold">
          Published works currently used in the public record
        </h3>
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          <SourceRow
            title="William Wolkovich-Valkavičius, Lithuanian Religious Life in America, Volume 3: The Midwest and Beyond"
            href="https://archyvas.ziburioltmokykla.org/item/20260722_1784749031073"
            credit="Published in 1998 in Norwood, Massachusetts. This Catholic-institutional compendium documents Lithuanian Roman Catholic parishes and institutions across the Midwest and western United States."
            use="Page-cited parish chronology, institutional identity, clergy, and building history. The archive currently provides Volume 3; Volumes 1 and 2 are not represented as completed extractions."
          />
          <SourceRow
            title="Stasys Michelsonas, Lietuvių Išeivija Amerikoje (1868–1961)"
            href="https://archyvas.ziburioltmokykla.org/item/20260225_lietuviu_iseivija_amerikoje"
            credit="Published by Keleivis in South Boston in 1961. Michelsonas records Lithuanian settlement, community institutions, and early church and property disputes from a secular Lithuanian-American perspective."
            use="Page-cited historical context and an independent reading of early parish formation. Differences from institutional histories remain visible until resolved."
          />
          <SourceRow
            title="Vladas Būtėnas, Pennsylvanijos Angliakasių Lietuva"
            href="https://archyvas.ziburioltmokykla.org/item/20260802_1785700061361"
            credit="Text by Vladas Būtėnas; photographs by Algimantas Kezys, S.J.; portfolios by Elena Bradūnaitė and Jurgis Bradūnas. Published in Chicago by Lithuanian Library Press in 1977."
            use="Parish, school, labor, and community history in Pennsylvania’s anthracite coal region, with exact page references on the profiles that draw from it."
          />
          <SourceRow
            title="Algis Lukas, ed., Lithuanian Cultural Legacy in America / Lietuvių Kultūrinis Paveldas Amerikoje"
            href="https://archyvas.ziburioltmokykla.org/item/20260725_1785004329786"
            credit="Published by the Lithuanian American Community, Cultural Affairs Council, in 2009. The bilingual volume documents churches, cultural institutions, monuments, cemeteries, and other Lithuanian-American built heritage."
            use="Architectural identification, heritage context, and the source reference for permission-cleared line-art adaptations. Original book photographs are not republished by SOLP."
          />
          <SourceRow
            title="Divine Providence Lithuanian Parish, 1908–1973"
            href="https://archyvas.ziburioltmokykla.org/item/20260331_1774920079895"
            credit="A parish-produced history preserved and made publicly accessible through the Žiburio Archive."
            use="The Detroit and Southfield Divine Providence chronology, read alongside current parish and Archdiocese of Detroit records."
          />
          <SourceRow
            title="Jonas Žilius, Lietuviai Amerikoj"
            href="https://commons.wikimedia.org/wiki/Category:Lietuviai_Amerikoj"
            credit="Published in 1899 by Jonas Žilius under the name Jonas, Jr. Public-domain scans are available through Wikimedia Commons and the British Library’s digitization record."
            use="Early visual and historical evidence for Lithuanian communities and churches. Each displayed image identifies the church and carries its own credit."
          />
        </ul>
        <p className="mt-4 text-body-copy leading-relaxed text-muted">
          Local jubilee books, parish histories, diocesan directories, and other
          published works are also cited where used. Their exact titles, pages,
          and access links appear in the Evidence &amp; sources section of the
          relevant parish profile.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Newspapers and periodicals
        </h2>
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          <SourceRow
            title="Draugas digital archive, 1909–present"
            href="https://www.draugas.org/archyvas-pdf/"
            credit="Draugas is a Lithuanian-American Catholic newspaper founded in 1909 and published in Chicago. Its scanned digital archive is maintained and published by Draugas. SOLP does not own the newspaper or its archive."
            use="The 2008–May 2026 run—2,768 issues—was read issue by issue; the 1909–2007 run was searched systematically for parish evidence. Only identity-checked, page/title-reviewed references are presented as finished newspaper sources. They link to the relevant issue and page from the parish profile. Some recent material may require subscriber access."
          />
          <SourceRow
            title="Spauda.org — digitized Lithuanian diaspora newspapers"
            href="https://www.spauda.org/apie-projekta-about-this-project/"
            credit="Spauda.org is directed by Dr. Jonas Daugirdas under the auspices of the Lithuanian Research and Studies Center. The project coordinator is LRSC President Kristina Lapienytė, and the Director of Archives is Dr. Indre Antanaitis-Jacobs. Participating libraries, archives, foundations, and donors are credited on the project’s About page."
            use="Publicly accessible diaspora newspaper issues are searched for parish evidence and linked from the relevant profile after review. Public access does not transfer copyright or ownership: SOLP links to the source and does not present the newspaper scans as its own collection."
          />
          <SourceRow
            title="Other contemporary newspapers and periodicals"
            credit="Lithuanian and English-language reporting from local newspapers, diocesan publications, Bridges, LRT, Catholic press, and other publications documents events as they were reported."
            use="Closure announcements, anniversaries, community campaigns, litigation, preservation work, and later building use. Formal legal or canonical claims are checked against official records when those records are available."
          />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Current and official records
        </h2>
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          <SourceRow
            title="Parish, diocesan, and religious-community records"
            credit="Official websites, bulletins, Mass schedules, clergy assignments, decrees, restructuring plans, and property announcements from the responsible institution."
            use="Present activity, governance, formal canonical actions, and current plans. The specific document or page and its checked date appear on the parish profile."
          />
          <SourceRow
            title="Lithuanian Bishops’ Conference diaspora pastoral-care directory"
            href="https://sielovada.org/siaures-amerika/"
            credit="The Sielovada directory lists the current Lithuanian Catholic pastoral network in North America, including parishes, missions, hosted communities, clergy, and liturgical notices."
            use="Membership in the current Lithuanian pastoral network. Parish and diocesan records remain authoritative for juridic status, formal closure, and governance."
          />
          <SourceRow
            title="Civil, property, preservation, and court records"
            href="https://www.nps.gov/subjects/nationalregister/index.htm"
            credit="Deeds and assessment records, public sale listings, court decisions, landmark records, and National Register documentation."
            use="Ownership, sale, designated historic status, litigation, and documented building use. Absence from one index is never treated as proof that a building or designation does not exist."
          />
          <SourceRow
            title="Community reports and field observations"
            href="/report"
            credit="Photographs, documents, corrections, memories, and current news submitted by people who know the communities, together with on-site observation."
            use="Leads and direct observations. Community reports are reviewed before publication and remain identified as community-reported until corroborated."
          />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Research and discovery resources
        </h2>
        <p className="mt-3 max-w-3xl text-body-copy leading-relaxed text-muted">
          These resources help locate institutions, alternate names, buildings,
          clergy, and present uses. They do not change a parish record without
          identity checking and supporting evidence.
        </p>
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          <SourceRow
            title="Global True Lithuania"
            href="https://global.truelithuania.com"
            credit="A field-based guide to Lithuanian heritage locations, buildings, monuments, cemeteries, and community sites."
            use="Exact-location and present-use leads, field observations, and heritage context."
          />
          <SourceRow
            title="ELIP / Enciklopedija Lietuvai ir pasauliui"
            href="https://lietuvai.lt/wiki/JAV_lietuvi%C5%B3_katalik%C5%B3_ba%C5%BEny%C4%8Dios"
            credit="A broad Lithuanian encyclopedia connecting churches, communities, organizations, schools, biographies, and digitized historical works."
            use="Alternate names, identity leads, registry cross-checks, and access to further sources. Material claims are checked against primary or stronger contemporary evidence."
          />
          <SourceRow
            title="Litua Lithuanian church directory"
            href="https://www.litua.com/lt/zinynas/baznycios#CA"
            credit="A legacy directory of Lithuanian and English parish names and city groupings."
            use="A historical baseline and discovery source, not proof of current activity by itself."
          />
          <SourceRow
            title="USCCB Catholic organizations directory"
            href="https://www.usccb.org/committees/pastoral-care-migrants-refugees-travelers/catholic-organizations"
            credit="A national gateway to Catholic ethnic, migrant, refugee, and traveler organizations."
            use="Locating organizations and research pathways; each organization remains responsible for its own current information."
          />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-section-title font-semibold">
          Geography and images
        </h2>
        <ul className="mt-4 divide-y divide-rule border-y border-rule">
          <SourceRow
            title="U.S. Census TIGER geometry"
            href="https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html"
            credit="Public-domain state and county geometry from the U.S. Census Bureau underlies the maps and the county-based diocesan boundary construction."
            use="Geographic shape only; it does not supply parish facts."
          />
          <SourceRow
            title="OpenStreetMap and Nominatim"
            href="https://www.openstreetmap.org/copyright"
            credit="Open geographic data and geocoding used where a verified building coordinate is not yet available."
            use="Coordinates are checked against the expected city, county, and state. A record without a usable location is omitted from the map rather than placed by guess."
          />
          <SourceRow
            title="Parish photographs and object records"
            credit="Historic photographs, community-supplied images, present-day photographs, and documented physical objects such as stained glass, monuments, and parish books."
            use="Every displayed image carries an attribution and rights basis. Images without a clear publication basis remain unpublished."
          />
        </ul>
      </section>

      <p className="mt-12 border-t border-rule pt-5 text-body-copy leading-relaxed text-muted">
        The Evidence &amp; sources section on each parish profile is the most
        specific bibliography: it shows the exact documents, articles, pages,
        and links used for that institution. For copyright practice and reuse
        terms, see{" "}
        <Link href="/legal" className="font-medium text-foreground underline underline-offset-4">
          Legal, attribution &amp; data use
        </Link>
        .
      </p>
    </article>
  );
}
