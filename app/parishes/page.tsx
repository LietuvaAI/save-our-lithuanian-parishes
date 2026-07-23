import type { Metadata } from "next";
import Link from "next/link";
import { readdirSync } from "fs";
import { join } from "path";
import ParishFilters, { type FilterableParish } from "@/components/ParishFilters";
import { usParishes, type LithuanianIdentity } from "@/lib/parishes";

export const metadata: Metadata = {
  title: "Parish Profiles",
  description:
    "A profile for every documented U.S. Lithuanian parish — its history, its ownership, its ending or its survival, and the sources behind every fact.",
};

/** Slugs that have a researched present-day case record on disk. */
function caseRecordSlugs(): Set<string> {
  try {
    return new Set(
      readdirSync(join(process.cwd(), "data", "case-records"))
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(/\.json$/, ""))
    );
  } catch {
    return new Set();
  }
}

export default function ParishProfilesPage() {
  const withRecord = caseRecordSlugs();

  const filterData: FilterableParish[] = usParishes.map((p) => ({
    slug: p.slug,
    nameLt: p.nameLt,
    city: p.city,
    state: p.state,
    endingMode: p.endingMode,
    ownership: p.ownership,
    lithuanianIdentity: p.lithuanianIdentity as LithuanianIdentity | null,
    institutionType: p.institutionType,
    yearFounded: p.yearFounded,
    yearClosed: p.yearClosed,
    coalRegion: p.coalRegion,
    hasRecord: withRecord.has(p.slug),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">Parish Profiles</h1>
      <p className="mt-3 max-w-2xl text-muted leading-relaxed">
        A profile for each of the {usParishes.length} documented U.S.
        Lithuanian parishes: who built it, who owned it, what happened to it —
        with every fact traced to its published source. Profiles grow as the
        research does; if you know one of these parishes,{" "}
        <Link href="/report" className="underline hover:text-foreground">
          add what you know
        </Link>
        .
      </p>

      <div className="mt-8">
        <ParishFilters parishes={filterData} />
      </div>
    </div>
  );
}
