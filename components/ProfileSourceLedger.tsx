import type {
  ProfileSource,
  ProfileSourceGroup,
} from "@/lib/profile-sources";
import {
  isDraugasProfileSource,
  isPublicProfileSourceEligible,
} from "@/lib/public-source-eligibility";

const GROUP_ORDER: ProfileSourceGroup[] = [
  "current",
  "newspaper",
  "books",
  "field",
  "project",
  "visual",
];

const GROUP_META: Record<
  ProfileSourceGroup,
  { label: string; description: string }
> = {
  current: {
    label: "Official and current records",
    description:
      "Parish, diocesan, municipal, and other institutional records used to establish present conditions and formal actions.",
  },
  newspaper: {
    label: "Newspapers and periodicals",
    description:
      "Dated reporting and contemporary accounts, including reviewed Draugas issues.",
  },
  books: {
    label: "Books and archival volumes",
    description:
      "Published histories, reference books, and digitized archival volumes.",
  },
  field: {
    label: "Field surveys and research",
    description:
      "Heritage inventories, field observations, and research sources used to corroborate the record.",
  },
  project: {
    label: "Project publications",
    description:
      "Related Save Our Lithuanian Parishes and Židinys reporting, kept distinct from independent evidence.",
  },
  visual: {
    label: "Images and object records",
    description:
      "Photographs, drawings, and object records with documented attribution or provenance.",
  },
};

function recordedDate(value: string | null | undefined) {
  return value?.match(/\b(18|19|20)\d{2}(?:-\d{2}(?:-\d{2})?)?\b/)?.[0];
}

function sourceDateValue(source: ProfileSource) {
  return (
    recordedDate(source.date) ??
    recordedDate(source.citation) ??
    source.additionalCitations.map(recordedDate).find(Boolean) ??
    recordedDate(source.title) ??
    recordedDate(source.url)
  );
}

function sourceDateLabel(source: ProfileSource) {
  const explicit = source.date?.trim();
  if (explicit && explicit.toLowerCase() !== "undefined") {
    const accessedAtEnd = explicit.match(
      /^(\d{4}(?:-\d{2}(?:-\d{2})?)?)\s*\(accessed\)$/i,
    );
    if (accessedAtEnd) return `Accessed ${accessedAtEnd[1]}`;
    return explicit.replace(/^accessed\b/i, "Accessed");
  }
  return sourceDateValue(source) ?? "Date not recorded";
}

function dateSortKey(source: ProfileSource) {
  const date = sourceDateValue(source);
  if (!date) return "0000-00-00";
  const [year, month = "00", day = "00"] = date.split("-");
  return `${year}-${month}-${day}`;
}

function dateRange(sources: ProfileSource[]) {
  const years = sources
    .map((source) => sourceDateValue(source)?.slice(0, 4))
    .filter((year): year is string => !!year)
    .sort();
  if (years.length === 0) return "dates not recorded";
  if (years[0] === years.at(-1)) return years[0];
  return `${years[0]}–${years.at(-1)}`;
}

function sourceDomain(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function sourceCitations(source: ProfileSource) {
  const metadataCitation = [source.publisher, source.date]
    .filter(Boolean)
    .join(", ");
  return [source.citation, ...source.additionalCitations].filter(
    (citation): citation is string =>
      !!citation && citation !== metadataCitation,
  );
}

function supplementalReasonLabel(reason: string) {
  return reason.replaceAll("_", " ");
}

function sourceTitleStateLabel(
  state: NonNullable<ProfileSource["sourceTitleState"]>,
) {
  if (state === "reviewed_section_heading") return "Reviewed section heading";
  if (state === "untitled_item") return "Untitled item";
  return null;
}

export function ProfileSourceLedger({
  sources,
}: {
  sources: ProfileSource[];
}) {
  const publicSources = sources.filter(isPublicProfileSourceEligible);
  const linkedCount = publicSources.filter((source) => source.url).length;
  const missingCount = publicSources.length - linkedCount;
  const groupedSources = GROUP_ORDER.flatMap((group) => {
    const entries = publicSources
      .filter((source) => source.group === group)
      .sort((left, right) => {
        const classDelta =
          Number(left.referenceClass === "supplemental_reference") -
          Number(right.referenceClass === "supplemental_reference");
        if (classDelta) return classDelta;
        const dateDelta = dateSortKey(right).localeCompare(dateSortKey(left));
        return dateDelta || left.title.localeCompare(right.title);
      });
    return entries.length > 0 ? [{ group, entries }] : [];
  });

  return (
    <section
      id="evidence-sources"
      className="mt-12 scroll-mt-8 border-t border-rule pt-8"
    >
      <h2 className="font-serif text-section-title font-semibold">
        Evidence &amp; sources
      </h2>
      <p className="mt-2 max-w-[48em] text-body-copy leading-relaxed text-muted">
        Sources are grouped by type. Open a group to see its records, ordered
        from newest to oldest; publication, observation, or access dates are
        shown when the source records them.
      </p>

      {publicSources.length === 0 ? (
        <p className="mt-5 border-y border-rule py-4 text-body-copy text-muted">
          No public source link has been attached to this profile yet.
        </p>
      ) : (
        <div id="profile-source-list" className="mt-6 border-t border-rule">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-rule bg-band px-4 py-3">
            <p className="font-serif text-card-title font-semibold">
              {publicSources.length}{" "}
              {publicSources.length === 1 ? "source" : "sources"}
            </p>
            <p className="text-small-copy text-muted">
              {groupedSources.length} source{" "}
              {groupedSources.length === 1 ? "type" : "types"} ·{" "}
              {dateRange(publicSources)} · {linkedCount} public{" "}
              {linkedCount === 1 ? "link" : "links"}
              {missingCount > 0 ? ` · ${missingCount} without links` : ""}
            </p>
          </div>

          {groupedSources.map(({ group, entries }) => {
            const meta = GROUP_META[group];
            return (
              <details
                key={group}
                open={entries.some((source) => source.reviewedPublicReference)}
                className="group border-b border-rule"
              >
                <summary className="grid cursor-pointer list-none gap-3 px-4 py-4 marker:content-none md:grid-cols-[minmax(0,1fr)_auto] md:items-center [&::-webkit-details-marker]:hidden">
                  <div>
                    <h3 className="font-serif text-card-title font-semibold">
                      {meta.label}
                    </h3>
                    <p className="mt-0.5 max-w-[52em] text-small-copy leading-relaxed text-muted">
                      {meta.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-small-copy text-muted md:justify-end">
                    <span>
                      {entries.length} {entries.length === 1 ? "source" : "sources"} ·{" "}
                      {dateRange(entries)}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-subsection-title leading-none transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </div>
                </summary>

                <ol className="border-t border-rule bg-background px-4 md:px-5">
                  {entries.map((source) => {
                    const domain = sourceDomain(source.url);
                    const citations = sourceCitations(source);
                    const showExcerpt =
                      !!source.excerpt && !isDraugasProfileSource(source);
                    return (
                      <li
                        key={source.id}
                        className="grid gap-2 border-b border-rule py-4 last:border-b-0 md:grid-cols-[8.5rem_minmax(0,1fr)] md:gap-5"
                      >
                        <p className="font-mono text-ui-label leading-relaxed text-muted">
                          {sourceDateLabel(source)}
                        </p>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            {source.url ? (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-serif text-card-title font-semibold leading-snug underline decoration-1 underline-offset-4 hover:text-accent"
                              >
                                {source.title} <span aria-hidden="true">↗</span>
                              </a>
                            ) : (
                              <p className="font-serif text-card-title font-semibold leading-snug">
                                {source.title}
                              </p>
                            )}
                            {source.badgeLabel && (
                              <span className="rounded-full border border-rule bg-band px-2 py-0.5 text-ui-label font-semibold tracking-[0.04em] text-foreground">
                                {source.badgeLabel}
                              </span>
                            )}
                          </div>

                          {(source.publisher || domain) && (
                            <p className="mt-1 text-small-copy text-muted">
                              {[source.publisher, domain]
                                .filter(Boolean)
                                .filter(
                                  (value, index, values) =>
                                    values.indexOf(value) === index,
                                )
                                .join(" · ")}
                            </p>
                          )}

                          {citations.map((citation) => (
                            <p
                              key={citation}
                              className="mt-1 text-small-copy leading-relaxed text-muted"
                            >
                              {citation}
                            </p>
                          ))}

                          {source.supplementalReason && (
                            <p className="mt-1 text-small-copy leading-relaxed text-muted">
                              <span className="font-medium text-foreground">
                                Supplemental reason:
                              </span>{" "}
                              {supplementalReasonLabel(source.supplementalReason)}
                            </p>
                          )}

                          {source.sourceTitleState &&
                            sourceTitleStateLabel(source.sourceTitleState) && (
                              <p className="mt-1 text-small-copy leading-relaxed text-muted">
                                {sourceTitleStateLabel(source.sourceTitleState)}
                              </p>
                            )}

                          {source.contexts.length > 0 && (
                            <p className="mt-2 text-small-copy leading-relaxed text-muted">
                              <span className="font-medium text-foreground">
                                Used for:
                              </span>{" "}
                              {source.contexts.join(" · ")}
                            </p>
                          )}

                          {showExcerpt && (
                            <blockquote className="mt-3 max-w-[48em] border-l-2 border-rule pl-3 font-serif text-body-copy leading-relaxed text-foreground">
                              “{source.excerpt}”
                            </blockquote>
                          )}

                          {!source.url && (
                            <p className="mt-2 text-small-copy font-medium text-amber-700 dark:text-amber-400">
                              Public link not recorded:{" "}
                              {source.missingLinkNote ??
                                "the source needs a stable public URL."}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
