import { ProfileSection } from "@/components/ProfileSection";
import type { DraugasReference } from "@/lib/draugas-references";

export function ProfileDraugasReferences({
  references,
}: {
  references: DraugasReference[];
}) {
  if (references.length === 0) return null;

  return (
    <ProfileSection
      id="press-archive"
      label="In the press archive"
      note={"Reviewed page\nreferences"}
    >
      <ol className="max-w-[40em] border-t border-rule">
        {references.map((reference) => (
          <li
            key={reference.reference_id}
            className="grid gap-x-[22px] border-b border-rule py-4 md:grid-cols-[104px_minmax(0,1fr)]"
          >
            <time
              dateTime={reference.issue_date}
              className="pt-0.5 font-mono text-ui-label font-medium uppercase tracking-wider text-muted"
            >
              {reference.issue_date}
            </time>
            <div>
              <p className="text-body-copy font-semibold leading-snug">
                {reference.display_label}
              </p>
              <p className="mt-1 text-small-copy leading-normal text-muted">
                <a
                  href={reference.page_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline decoration-1 underline-offset-2 hover:text-foreground"
                >
                  {reference.citation_label}
                </a>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </ProfileSection>
  );
}
