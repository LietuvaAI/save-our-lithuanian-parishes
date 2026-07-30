import type {
  ProfileSource,
  ProfileSourceGroup,
} from "@/lib/profile-sources";

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
}: {
  sources: ProfileSource[];
}) {
  const linkedCount = sources.filter((source) => source.url).length;
  const missingCount = sources.length - linkedCount;

  return (
    <section className="mt-12 border-t border-rule pt-8">
      <h2 className="font-serif text-2xl font-semibold">Evidence &amp; sources</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        The links below are the public evidence ledger for this profile. Full
        URLs are printed so the record remains traceable outside this site as
        well as clickable here.
      </p>
      <p className="mt-2 text-xs text-muted">
        {linkedCount} linked {linkedCount === 1 ? "source" : "sources"}
        {missingCount > 0
          ? ` · ${missingCount} reference${missingCount === 1 ? "" : "s"} still missing a public link`
          : " · every listed reference has a public link"}
      </p>

      {sources.length === 0 ? (
        <p className="mt-5 border-y border-rule py-4 text-sm text-muted">
          No public source link has been attached to this profile yet.
        </p>
      ) : (
        SOURCE_SECTIONS.map((section) => {
          const sectionSources = section.groups.flatMap((group) =>
            sources.filter((source) => source.group === group),
          );
          if (sectionSources.length === 0) return null;
          return (
            <div key={section.id} className="mt-8">
              <h3 className="font-serif text-xl font-semibold">
                {section.label}
              </h3>
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
                    <h4 className="text-xs uppercase tracking-wide text-muted">
                      {GROUP_LABEL[group]}
                    </h4>
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
                              className="mt-2 block break-all font-mono text-xs leading-relaxed underline hover:text-accent"
                            >
                              {source.url}
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
            </div>
          );
        })
      )}
    </section>
  );
}
