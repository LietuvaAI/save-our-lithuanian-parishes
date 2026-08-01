import { ProfileSection } from "@/components/ProfileSection";
import type { WorshipSiteRow } from "@/lib/parish-record-graph";

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
            className="grid gap-x-[22px] pb-5 md:grid-cols-[104px_minmax(0,1fr)]"
          >
            <span className="pt-0.5 font-mono text-[11px] font-medium tabular-nums tracking-wider text-muted [white-space:nowrap]">
              {site.range ?? "Undated"}
            </span>
            <div>
              <p className="text-sm font-semibold leading-snug">{site.name}</p>
              <p className="mt-1.5 font-mono text-[10.5px] font-medium uppercase tracking-wider text-muted">
                Outcome &middot;{" "}
                <span className="text-foreground">{site.outcome}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </ProfileSection>
  );
}
