import type { Metadata } from "next";
import Link from "next/link";
import RegistryTable, { type RegistryRow, type ParishStatus } from "@/components/RegistryTable";
import registry from "@/data/registry-unified.json";
import { parishes as libParishes, type EndingMode } from "@/lib/parishes";

export const metadata: Metadata = {
  title: "The Record",
  description:
    "Every Lithuanian parish in the U.S. research record — the verified Draugas 2008–2026 core plus the wider registry.",
};

interface RegParish {
  slug: string;
  names: { lt: string | null; en: string | null };
  city: string;
  state: string;
  country: "US" | "CA";
  comparator: boolean;
  in_locked_scope: boolean;
  c83_row: number | null;
  locked?: {
    ending_mode?: string;
    year_founded?: string;
    year_closed?: string;
  };
  years?: {
    founded?: { value: string }[];
    closed?: { value: string }[];
  };
  sources?: { ethnic_status?: string }[];
  congregation_class?: string;
  record_depth: RegistryRow["depth"];
}

function endingModeToStatus(mode: EndingMode | null): ParishStatus {
  if (!mode) return "unverified";
  if (mode === "standing") return "open";
  if (mode === "undecided") return "threat";
  return "closed";
}

function buildRows(): RegistryRow[] {
  const regs = (registry as { parishes: RegParish[] }).parishes
    // Settlements/memorial associations whose own sources say "no parish"
    // are documented history, but this is the parish record — parishes only.
    .filter(
      (p) =>
        !(p.sources ?? []).some((s) => /no parish/i.test(s.ethnic_status ?? "")) &&
        // Scope: U.S. only. Canada is documented as comparator but excluded
        // from the main U.S. record. Argentina entries also excluded (upstream fix filed).
        p.country !== "CA" &&
        !/buenos aires|argentin|rosario/i.test(p.city ?? "")
    );
  return regs.map((p) => {
    // c83_row is the 1-based row in the canonical CSV = lib parishes order;
    // sanity-check by city so a misalignment can never link the wrong profile.
    const lib =
      p.c83_row != null ? libParishes[p.c83_row - 1] : undefined;
    const libOk = lib && lib.city === p.city;
    // Registry year entries can hold narrative text; display only a real year.
    const asYear = (v: string | undefined | null) => {
      const m = v?.match(/\b(1[89]\d{2}|20[0-2]\d)\b/);
      return m ? m[1] : null;
    };
    const yearOf = (
      lockedVal: string | undefined,
      arr: { value: string }[] | undefined
    ) => asYear(lockedVal) ?? asYear(arr?.[0]?.value);
    const endingMode =
      p.locked?.ending_mode && (p.in_locked_scope || p.comparator)
        ? (p.locked.ending_mode as EndingMode)
        : null;
    return {
      slug: libOk ? lib.slug : p.slug,
      name: p.names.lt || p.names.en || p.slug,
      // Registry city fields can carry long parenthetical neighborhood or
      // street detail — keep the city proper; detail stays in the registry.
      city: p.city.replace(/\s*[(;].*$/, ""),
      state: p.state,
      country: p.country,
      comparator: p.comparator,
      endingMode,
      status: endingModeToStatus(endingMode),
      founded: yearOf(p.locked?.year_founded, p.years?.founded),
      closed: yearOf(p.locked?.year_closed, p.years?.closed),
      depth: p.record_depth,
      congregationClass: (p.congregation_class as RegistryRow["congregationClass"]) ?? null,
      profileHref: libOk
        ? `/parishes/${lib.slug}`
        : p.c83_row == null
          ? `/registry/${p.slug}`
          : null,
    };
  });
}

export default function RecordPage() {
  const rows = buildRows();
  const total = rows.length;
  const caseFiled = rows.filter((r) => r.depth === "case-filed").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">The Record</h1>
      <div className="mt-3 space-y-4 leading-relaxed max-w-3xl">
        <p>
          This is the record of America&rsquo;s Lithuanian parishes —{" "}
          {total} of them across the United States. Until now, no
          such record existed. The story of these parishes is scattered
          across a century of Lithuanian-language newspapers, out-of-print
          books, diocesan archives, and the memories of the people who built
          and lost them. No diocese keeps it. No archive holds all of it.
          When a community faces a closure decision today, it cannot see the
          pattern — because the pattern has never been assembled in one
          place. That is what this table is.
        </p>
        <p className="text-muted">
          {caseFiled} of the {total} are documented in full depth —
          case-filed: every fact verified against dated published sources,
          with a researched present-day record of where the building, the
          community, and the property stand now. The rest are attested by
          the wider research and are being verified toward that same
          standard, parish by parish. The <strong>Depth</strong> column
          marks how far each one has come. The record grows in both
          directions: backward through the archives toward the first
          parishes of the 1880s, and forward through{" "}
          <Link href="/report" className="underline hover:text-accent">
            reports from parish communities
          </Link>{" "}
          today — because closure decisions are being made right now, and a
          record that stops updating stops protecting anyone.
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
