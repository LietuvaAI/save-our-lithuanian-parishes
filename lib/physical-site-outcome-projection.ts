import {
  infographicCounts,
  physicalWorshipSiteHistory,
  resolvePhysicalSiteCondition,
} from "@/lib/infographic-projection";

export type PhysicalSiteState =
  | "demolished"
  | "repurposed"
  | "listed_for_sale"
  | "standing"
  | "not_established";

export type PhysicalSiteTimelineRow = {
  slug: string;
  name: string;
  firstYear: number | null;
  endYear: number | null;
  state: PhysicalSiteState;
  profileHref: string | null;
};

const sites: PhysicalSiteTimelineRow[] = physicalWorshipSiteHistory.map(
  (site) => {
    const directProfiles = site.institution_use_periods
      .map((period) => period.institution_profile)
      .filter((profile): profile is string => profile != null);
    const profiles =
      directProfiles.length > 0
        ? directProfiles
        : site.related_public_profiles;

    return {
      slug: site.slug,
      name: site.name,
      firstYear: site.first_documented_year,
      endYear: site.demolished_year,
      state: resolvePhysicalSiteCondition(site.condition_relationships),
      profileHref: profiles.at(-1) ?? null,
    };
  },
);

const stateCounts = Object.fromEntries(
  sites.reduce((counts, site) => {
    counts.set(site.state, (counts.get(site.state) ?? 0) + 1);
    return counts;
  }, new Map<PhysicalSiteState, number>()),
) as Partial<Record<PhysicalSiteState, number>>;

if (sites.length !== infographicCounts.physical_worship_sites) {
  throw new Error("Physical worship-site population drifted.");
}

/**
 * The one public projection for Buildings mode in Parish & Mission Outcomes.
 * Public surfaces consume this adapter rather than interpreting raw site
 * relationships.
 */
export const physicalSiteOutcomeProjection = {
  sites,
  stateCounts,
};
