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
  title: "Parish Profiles",
  description:
    "A searchable directory of every published U.S. Lithuanian parish, mission, and congregation profile, separated by religious tradition.",
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
    <div className="mx-auto max-w-[1180px] pb-10 pt-[22px]">
      <div className="px-4 sm:px-11">
        <p className="text-ui-label font-semibold uppercase tracking-[0.14em] text-muted">
          Profile directory
        </p>
        <h1 className="mt-1.5 font-serif text-page-title font-semibold leading-[1.15]">
          Every parish, mission, and congregation
        </h1>
        <p className="mt-2 max-w-[860px] text-body-copy leading-[1.55] text-[#57534e] dark:text-muted">
          All {rows.length} published U.S. profiles, separated into Roman
          Catholic, National Catholic, Independent Catholic, and Protestant
          traditions. Search by name or place, or regroup the directory by
          outcome or alphabetically.
        </p>
      </div>

      <AllProfilesDirectory rows={rows} />

      <p className="mx-4 mt-2 max-w-[700px] border-t border-rule pt-[14px] text-directory-footnote text-muted sm:mx-11">
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
