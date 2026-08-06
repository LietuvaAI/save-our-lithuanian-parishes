import type {
  ProfileSource,
  ProfileSourceGroup,
} from "@/lib/profile-sources";
import Link from "next/link";

const GROUP_LABEL: Record<ProfileSourceGroup, string> = {
  newspaper: "Newspaper evidence",
  books: "Books and archive volumes",
  current: "Current institutional sources",
  field: "Field surveys and research sources",
  project: "Related project publications",
  visual: "Image and object records",
};

const SOURCE_SECTIONS: {
  id: string;
  label: string;
  description: string;
  groups: ProfileSourceGroup[];
}[] = [
  {
    id: "direct",
    label: "Contemporary and institutional evidence",
    description:
      "Dated reporting, current institutional records, and documentary image or object records. A contemporary report is not treated as the legal record of a formal act.",
    groups: ["newspaper", "current", "visual"],
  },
  {
    id: "secondary",
    label: "Secondary sources",
    description:
      "Published histories, archive volumes, field surveys, heritage inventories, and research syntheses.",
    groups: ["books", "field"],
  },
  {
    id: "project",
    label: "Project publications",
    description:
      "Related Save Our Lithuanian Parishes and Židinys publications, kept separate from independent evidence.",
    groups: ["project"],
  },
];

export function ProfileSourceLedger({
  sources,
  draugasLedger,
}: {
  sources: ProfileSource[];
  draugasLedger?: {
    href: string;
    indexedOccurrences: number;
    datedIssueFiles: number;
    firstIssueDate: string | null;
    lastIssueDate: string | null;
  } | null;
}) {
  const linkedCount = sources.filter((source) => source.url).length;
  const missingCount = sources.length - linkedCount;

  return (
    <section
      id="evidence-sources"
      className="mt-12 scroll-mt-8 border-t border-rule pt-8"
    >
      <h2 className="font-serif text-2xl font-semibold">Evidence &amp; sources</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Each entry in the source list identifies the evidence, explains what it
        supports, and provides a direct public link when one is available. The
        complete URL is printed for traceability.
      </p>

      {draugasLedger && (
        <div className="mt-6 max-w-2xl border-y border-rule bg-band px-5 py-5">
          <p className="font-mono text-xs uppercase text-muted">
            Draugas, 1909–2007
          </p>
          <h3 className="mt-2 font-serif text-xl font-semibold">
            {draugasLedger.indexedOccurrences.toLocaleString("en-US")} indexed
            references in {draugasLedger.datedIssueFiles.toLocaleString("en-US")} dated
            issue files
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Browse every dated issue file and its recorded page locator. The
            count is a reference-occurrence total, not a count of distinct
            articles.
          </p>
          <Link
            href={draugasLedger.href}
            className="mt-3 inline-block text-sm font-medium underline underline-offset-3 hover:text-accent"
          >
            Open the complete Draugas ledger →
          </Link>
        </div>
      )}

      {sources.length === 0 ? (
        <p className="mt-5 border-y border-rule py-4 text-sm text-muted">
          No public source link has been attached to this profile yet.
        </p>
      ) : (
        <div id="profile-source-list" className="mt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-y border-rule py-3">
            <h3 className="font-serif text-lg font-semibold">Source list</h3>
            <p className="text-xs text-muted">
              {sources.length} {sources.length === 1 ? "entry" : "entries"} ·{" "}
              {linkedCount} direct public{" "}
              {linkedCount === 1 ? "link" : "links"}
              {missingCount > 0
                ? ` · ${missingCount} missing`
                : " · all entries linked"}
            </p>
          </div>

          {SOURCE_SECTIONS.map((section) => {
            const sectionSources = section.groups.flatMap((group) =>
              sources.filter((source) => source.group === group),
            );
            if (sectionSources.length === 0) return null;
            return (
              <section key={section.id} className="mt-7">
                <h4 className="font-serif text-xl font-semibold">
                  {section.label}
                </h4>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
                  {section.description}
                </p>
                {section.groups.map((group) => {
                  const groupSources = sectionSources.filter(
                    (source) => source.group === group,
                  );
                  if (groupSources.length === 0) return null;
                  return (
                    <div key={group} className="mt-5">
                      <h5 className="text-xs uppercase tracking-wide text-muted">
                        {GROUP_LABEL[group]}
                      </h5>
                      <ol className="mt-2 divide-y divide-rule border-y border-rule">
                        {groupSources.map((source) => (
                          <li key={source.id} className="py-3.5">
                            <p className="font-medium">{source.title}</p>
                            {[source.citation, ...source.additionalCitations]
                              .filter(
                                (citation): citation is string => !!citation,
                              )
                              .map((citation) => (
                                <p
                                  key={citation}
                                  className="mt-0.5 text-sm leading-relaxed text-muted"
                                >
                                  {citation}
                                </p>
                              ))}
                            {source.contexts.length > 0 && (
                              <p className="mt-1 text-xs leading-relaxed text-muted">
                                Supports: {source.contexts.join(" · ")}
                              </p>
                            )}
                            {source.url ? (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 block break-all text-xs leading-relaxed underline decoration-1 underline-offset-2 hover:text-accent"
                              >
                                <span className="mr-1 font-semibold">
                                  Open public source:
                                </span>
                                <span className="font-mono">{source.url}</span>
                              </a>
                            ) : (
                              <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                                Public link missing:{" "}
                                {source.missingLinkNote ??
                                  "the source record needs a stable public URL."}
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
