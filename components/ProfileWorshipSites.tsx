import { ProfileSection } from "@/components/ProfileSection";
import {
  worshipSiteAddressDetail,
  type WorshipSiteRow,
} from "@/lib/parish-record-graph";

/**
 * Buildings, not institutions. A site's dedication, replacement, demolition,
 * sale, or reuse belongs here and never reads as a parish founding or ending.
 */
export function ProfileWorshipSites({ sites }: { sites: WorshipSiteRow[] }) {
  if (sites.length === 0) return null;
  return (
    <ProfileSection
      id="worship-sites"
      label="Worship sites"
      note={`${sites.length} recorded\nBuildings, not\ninstitutions`}
    >
      <ol className="max-w-[40em]">
        {sites.map((site) => (
          <li
            key={site.entityId}
            className="grid min-w-0 gap-x-[22px] pb-5 md:grid-cols-[104px_minmax(0,1fr)]"
          >
            <span className="min-w-0 pt-0.5 font-mono text-ui-label font-medium leading-normal tabular-nums tracking-wider text-muted">
              {site.range ?? "Undated"}
            </span>
            <div className="min-w-0">
              <p className="text-body-copy font-semibold leading-snug [overflow-wrap:anywhere]">
                {site.name}
              </p>
              <p className="mt-1.5 font-mono text-ui-label font-medium uppercase tracking-wider text-muted">
                Outcome &middot;{" "}
                <span className="text-foreground">{site.outcome}</span>
              </p>
              <p className="mt-1.5 text-small-copy leading-relaxed text-muted">
                {worshipSiteAddressDetail(site.address)}
              </p>
              {site.milestones.length > 0 && (
                <ol className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {site.milestones.map((milestone) => (
                    <li
                      key={milestone.id}
                      className="grid gap-x-3 text-small-copy leading-relaxed sm:grid-cols-[88px_minmax(0,1fr)]"
                    >
                      <time className="font-mono text-ui-label font-medium tabular-nums text-muted">
                        {milestone.date}
                      </time>
                      <span>{milestone.label}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </li>
        ))}
      </ol>
    </ProfileSection>
  );
}
