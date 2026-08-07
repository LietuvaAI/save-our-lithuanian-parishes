import Link from "next/link";
import { ProfileSection } from "@/components/ProfileSection";
import type { RelatedRecordRow } from "@/lib/parish-record-graph";

/**
 * Predecessors, successors, and continuations, each linked to its own profile.
 * A predecessor is never absorbed into the survivor's record.
 */
export function ProfileRelatedRecords({
  records,
}: {
  records: RelatedRecordRow[];
}) {
  if (records.length === 0) return null;
  return (
    <ProfileSection
      id="related-records"
      label="Related records"
      note={"Each is its own\ninstitution record"}
    >
      <ol className="max-w-[40em]">
        {records.map((record) => (
          <li
            key={record.id}
            className="grid gap-x-[22px] pb-5 md:grid-cols-[104px_minmax(0,1fr)]"
          >
            <span className="pt-0.5 font-mono text-ui-label font-medium uppercase tracking-wider text-muted">
              {record.kind}
            </span>
            <div>
              <p className="text-body-copy font-semibold leading-snug">
                {record.href ? (
                  <Link
                    href={record.href}
                    className="text-accent underline decoration-1 underline-offset-2 hover:text-foreground"
                  >
                    {record.name}
                  </Link>
                ) : (
                  record.name
                )}
              </p>
              {(record.linkQualifier || record.meta) && (
                <p className="mt-1 font-mono text-small-copy leading-normal text-muted">
                  {[record.linkQualifier, record.meta]
                    .filter(Boolean)
                    .join(" \u00b7 ")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </ProfileSection>
  );
}
