import type { Metadata } from "next";
import Link from "next/link";
import AllProfilesDirectory, {
  type AllProfilesDirectoryRow,
} from "@/components/AllProfilesDirectory";
import {
  infographicCounts,
  institutionHistory,
} from "@/lib/infographic-projection";

export const metadata: Metadata = {
  title: "All Parish Profiles",
  description:
    "A searchable directory of every published U.S. Lithuanian parish, mission, and congregation profile, grouped by canonical outcome.",
};

function buildRows(): AllProfilesDirectoryRow[] {
  return institutionHistory.map((institution) => ({
    slug: institution.registry_slug,
    canonicalName:
      institution.canonical_name.split(",", 1)[0]?.trim() ||
      institution.canonical_name,
    lithuanianName: institution.name,
    city: institution.city,
    state: institution.state,
    jurisdiction: institution.jurisdiction?.canonical_name ?? null,
    founded: institution.founded.year,
    closed: institution.closed.year,
    statusGroup: institution.status_group,
    recordType: institution.record_type,
    institutionClass: institution.institution_class,
    profileHref: institution.public_profile,
  }));
}

export default function ParishProfilesPage() {
  const rows = buildRows();

  if (
    rows.length !== infographicCounts.public_us_institutions ||
    new Set(rows.map((row) => row.profileHref)).size !== rows.length
  ) {
    throw new Error(
      "The All Profiles directory does not match the canonical publication projection.",
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-[22px]">
      <p className="text-ui-label font-semibold uppercase tracking-[0.15em] text-muted">
        All profiles · categorized directory
      </p>
      <h1 className="mt-1 font-serif text-page-title font-semibold">
        Every parish, mission, and congregation
      </h1>
      <p className="mt-2 max-w-[90ch] text-body-copy text-muted">
        Browse all {rows.length} published U.S. parish, mission, and
        congregation profiles by canonical outcome or alphabetically, then
        open any record for its full history and sources.
      </p>

      <div className="mt-4">
        <AllProfilesDirectory rows={rows} />
      </div>

      <p className="mt-8 max-w-3xl border-t border-rule pt-5 text-support-copy text-muted">
        This directory lists institutions: parishes, missions, and
        congregations. Physical churches are counted separately in the {" "}
        <Link
          href="/where-every-parish-ended-up?view=buildings"
          className="font-medium text-foreground underline underline-offset-4 hover:text-accent"
        >
          building view
        </Link>
        ; one institution may have used more than one building, and one
        building may have served more than one institution.
      </p>
    </div>
  );
}
