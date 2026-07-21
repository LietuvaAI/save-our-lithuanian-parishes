import type { Metadata } from "next";
import Link from "next/link";
import RegistryTable, { type RegistryRow } from "@/components/RegistryTable";
import registry from "@/data/registry-unified.json";
import { parishes as libParishes, type EndingMode } from "@/lib/parishes";

export const metadata: Metadata = {
  title: "The Record",
  description:
    "Every Lithuanian parish in the research record — the verified Draugas 2008–2026 core plus the wider registry across the U.S. and Canada.",
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
  record_depth: RegistryRow["depth"];
}

function buildRows(): RegistryRow[] {
  const regs = (registry as { parishes: RegParish[] }).parishes;
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
    return {
      slug: libOk ? lib.slug : p.slug,
      name: p.names.lt || p.names.en || p.slug,
      // Registry city fields can carry long parenthetical neighborhood or
      // street detail — keep the city proper; detail stays in the registry.
      city: p.city.replace(/\s*[(;].*$/, ""),
      state: p.state,
      country: p.country,
      comparator: p.comparator,
      endingMode:
        p.locked?.ending_mode && (p.in_locked_scope || p.comparator)
          ? (p.locked.ending_mode as EndingMode)
          : null,
      founded: yearOf(p.locked?.year_founded, p.years?.founded),
      closed: yearOf(p.locked?.year_closed, p.years?.closed),
      depth: p.record_depth,
      hasProfile: Boolean(libOk),
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
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        Every Lithuanian parish in the research record — {total} across the
        U.S. and Canada. {caseFiled} are documented in full depth
        (case-filed): verified in the locked <em>Draugas</em> 2008–2026 core
        — 2,768 issues read straight through — each with a researched
        present-day case file. The rest are attested by the wider registry
        (the 1909–2007 <em>Draugas</em>{" "}
        run, published parish histories, and
        contemporary sources) and are being verified toward that same
        standard. The documentation column marks each parish&rsquo;s depth.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        The locked core is the data behind every figure on the site —
        validated against the research figure set at every build. For the
        national precedent record — closures reversed on the Church&rsquo;s
        own procedures — see{" "}
        <Link href="/reversals" className="underline hover:text-foreground">
          Reversals
        </Link>
        .
      </p>

      <div className="mt-8">
        <RegistryTable rows={rows} />
      </div>

      <p className="mt-16 text-sm text-muted">
        Šaltinis: „Draugo&ldquo; archyvas nuo 1909 m. The dataset is open —
        every figure re-derives from the parish record at build time, and the
        build fails if anything drifts. How the whole record was collected:{" "}
        <Link
          href="/about-the-data"
          className="underline hover:text-foreground"
        >
          About the data
        </Link>
        .
      </p>
    </div>
  );
}
