import type { Metadata } from "next";
import Link from "next/link";
import RegistryTable, { type RegistryRow } from "@/components/RegistryTable";
import { toScopedParish, usRegistryParishes } from "@/lib/registry-scope";
import { resolveAlertStatus, resolveIdentity, resolveFate } from "@/lib/unified-status";

export const metadata: Metadata = {
  title: "The Record",
  description:
    "Every Lithuanian parish in the U.S. research record — the verified Draugas 2008–2026 core plus the wider registry.",
};

function buildRows(): RegistryRow[] {
  return usRegistryParishes().map((p) => {
    const scoped = toScopedParish(p);
    return {
      slug: scoped.slug,
      name: scoped.name,
      city: scoped.city,
      state: scoped.state,
      country: scoped.country,
      comparator: scoped.comparator,
      identity: resolveIdentity(scoped.identity),
      alert: resolveAlertStatus(scoped.alertKind, scoped.onWatch),
      fate: resolveFate(scoped.buildingFate),
      founded: scoped.founded == null ? null : String(scoped.founded),
      closed: scoped.closed == null ? null : String(scoped.closed),
      depth: scoped.recordDepth,
      congregationClass: scoped.congregationClass,
      ownership: scoped.ownership,
      diocese: scoped.diocese,
      profileHref: scoped.profileHref,
    };
  });
}

export default function RecordPage() {
  const rows = buildRows();
  const total = rows.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">The Record</h1>
      <div className="mt-3 space-y-4 leading-relaxed max-w-3xl">
        <p>
          {total} records of Lithuanian parish life across the United States — Roman
          Catholic ethnic parishes, National Catholic congregations, and
          Protestant communities. The information comes from
          Lithuanian-language newspapers going back to 1909, out-of-print
          parish histories, diocesan archives, and community memory.
        </p>
        <p className="text-muted">
          The record extends backward through the archives toward the first
          parishes of the 1880s and forward through{" "}
          <Link href="/report" className="underline hover:text-accent">
            reports from parish communities
          </Link>{" "}
          today.
        </p>
      </div>

      <div className="mt-8">
        <RegistryTable rows={rows} />
      </div>

      <section className="mt-14 max-w-2xl space-y-4 leading-relaxed">
        <h2 className="font-serif text-2xl font-semibold">The sources</h2>
        <p>
          <strong>
            <a
              href="https://www.draugas.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-accent"
            >
              Draugas
            </a>
          </strong>{" "}
          (&ldquo;The Friend&rdquo;) is the Lithuanian-American newspaper of
          record — a Catholic daily founded in 1909, published in Chicago
          continuously ever since, and for over a century the paper that
          reported every parish founding, jubilee, and closing in the
          Lithuanian diaspora. It is the backbone of this record. The
          2008–2026 run — all 2,768 issues — has been read straight through,
          and every parish it mentions entered the record with dated
          citations; that verified core is the source of every locked figure
          on this site. The 1909–2007 run is now being read the same way,
          issue by issue.
        </p>
        <p>
          <strong>The parish histories.</strong> Father William
          Wolkovich-Valkavičius&rsquo;s{" "}
          <a
            href="https://archyvas.ziburioltmokykla.org/item/20260722_1784749031073"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent"
          >
            <em>Lithuanian Religious Life in America</em>, Vol. 3
          </a>{" "}
          — the Midwest and beyond — documents roughly 150 parishes,
          in a small print run long out of print. Stasys Michelsonas&rsquo;s{" "}
          <a
            href="https://archyvas.ziburioltmokykla.org/item/20260225_lietuviu_iseivija_amerikoje"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent"
          >
            <em>Lietuvių Išeivija Amerikoje</em> (1961)
          </a>{" "}
          provides an independent secular counterpoint. Both are now in the
          Žiburio archive; parish-by-parish facts are read into the record
          with page citations.
        </p>
        <p>
          <strong>Contemporary sources.</strong> For every case-filed
          parish, a present-day record: diocesan announcements, local press,
          property records, and parish websites — what the building is
          today, who holds it, and what has happened since the archives fall
          silent. And the{" "}
          <Link href="/reversals" className="underline hover:text-accent">
            national reversal research
          </Link>
          : every U.S. parish closure we can verify that was reversed on the
          Church&rsquo;s own procedures — the precedent record.
        </p>
        <p className="text-sm text-muted">
          None of the numbers on this site are typed in by hand. They are
          recalculated automatically from this record every time the site is
          updated — and if a number ever disagrees with the verified
          research, the update is blocked until the discrepancy is resolved.
          The dataset is open —{" "}
          <a
            href="https://github.com/LietuvaAI/save-our-lithuanian-parishes"
            className="underline hover:text-foreground"
          >
            check our numbers
          </a>
          . Full methods, copyright handling, and what is deliberately held
          back:{" "}
          <Link
            href="/about-the-data"
            className="underline hover:text-foreground"
          >
            About the data
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
