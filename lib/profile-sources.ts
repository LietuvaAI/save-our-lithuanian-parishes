import { draugasArchiveUrl, draugasCitationUrl } from "@/lib/parishes";

export type ProfileSourceGroup =
  | "newspaper"
  | "books"
  | "current"
  | "field"
  | "project"
  | "visual";

export type ProfileSource = {
  id: string;
  group: ProfileSourceGroup;
  title: string;
  citation?: string;
  additionalCitations: string[];
  url: string | null;
  contexts: string[];
  missingLinkNote?: string;
};

export type RegistryProfileSource = {
  axis?: string;
  work?: string;
  pages?: string;
  cites?: string;
  first_mention?: string;
  last_mention?: string;
  total_mentions?: number;
  sourceUrl?: string;
};

export type LinkedProfileSource = {
  url?: string | null;
  title?: string;
  publisher?: string;
  date?: string;
};

type SourceDraft = Omit<
  ProfileSource,
  "id" | "contexts" | "additionalCitations"
> & {
  contexts?: string[];
};

const BOOKS: Record<
  string,
  { title: string; citation: string; url: string }
> = {
  wolkovich: {
    title: "Lithuanian Religious Life in America, Vol. 3",
    citation:
      "William Wolkovich-Valkavičius, Lithuanian Religious Life in America, Vol. 3 (1998)",
    url: "https://archyvas.ziburioltmokykla.org/item/20260722_1784749031073",
  },
  "michelsonas-1961": {
    title: "Lietuvių Išeivija Amerikoje",
    citation:
      "Stasys Michelsonas, Lietuvių Išeivija Amerikoje (1868–1961), Keleivis, 1961",
    url: "https://archyvas.ziburioltmokykla.org/item/20260225_lietuviu_iseivija_amerikoje",
  },
  "lukas-2009": {
    title: "Lietuvių kultūrinis paveldas Amerikoje",
    citation:
      "Algis Lukas, Lietuvių kultūrinis paveldas Amerikoje, Lithuanian American Community, 2009",
    url: "https://archyvas.ziburioltmokykla.org/item/20260725_1785004329786",
  },
};

function isAbsoluteWebUrl(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\//i.test(url);
}

function draugasDates(cites: string | undefined): string[] {
  if (!cites) return [];
  return cites
    .split(";")
    .map((value) => value.trim())
    .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function draugasSource(
  date: string,
  context: string,
  title = `Draugas issue, ${date}`,
): SourceDraft {
  return {
    group: "newspaper",
    title,
    citation: `Draugas, ${date}`,
    url: draugasCitationUrl(date),
    contexts: [context],
  };
}

export function draugasProfileSources(
  citations: { date: string }[],
  context = "Canonical case-file citation",
): ProfileSource[] {
  return finalizeProfileSources(
    citations.map((citation) => draugasSource(citation.date, context)),
  );
}

export function registryProfileSources(
  sources: RegistryProfileSource[],
): ProfileSource[] {
  const drafts: SourceDraft[] = [];

  for (const source of sources) {
    const axis = source.axis ?? "unidentified-source";
    const book = BOOKS[axis];
    if (book) {
      drafts.push({
        group: "books",
        title: book.title,
        citation: source.pages
          ? `${book.citation}, ${source.pages}`
          : book.citation,
        url: book.url,
        contexts: ["Published parish history and institutional record"],
      });
      continue;
    }

    if (axis === "draugas-2008-2026") {
      for (const date of draugasDates(source.cites)) {
        drafts.push(draugasSource(date, "Modern Draugas case-file evidence"));
      }
      continue;
    }

    if (axis === "draugas-registry-1909-2007") {
      const mentionContext = source.total_mentions
        ? `Systematic archive sweep; ${source.total_mentions} issues mention this record`
        : "Systematic archive sweep";
      if (source.first_mention) {
        drafts.push(
          draugasSource(
            source.first_mention,
            `${mentionContext}; first recorded mention`,
            `Draugas first recorded mention, ${source.first_mention}`,
          ),
        );
      }
      if (
        source.last_mention &&
        source.last_mention !== source.first_mention
      ) {
        drafts.push(
          draugasSource(
            source.last_mention,
            `${mentionContext}; last recorded mention, not a closure date`,
            `Draugas last recorded mention, ${source.last_mention}`,
          ),
        );
      }
      if (!source.first_mention && !source.last_mention) {
        drafts.push({
          group: "newspaper",
          title: "Draugas systematic archive sweep, 1909–2007",
          citation: source.work,
          url: "https://www.draugas.org/archyvas-pdf/",
          contexts: [mentionContext],
        });
      }
      continue;
    }

    if (axis === "truelithuania") {
      drafts.push({
        group: "field",
        title: "Global True Lithuania field survey",
        citation: source.work,
        url: isAbsoluteWebUrl(source.sourceUrl) ? source.sourceUrl : null,
        contexts: ["Heritage field survey and present-use observations"],
        missingLinkNote: "The registry does not carry the survey URL.",
      });
      continue;
    }

    if (axis === "web-historical") {
      drafts.push({
        group: "current",
        title: "Diocesan and parish web survey",
        citation: source.work ?? "Automated web survey, 2026",
        url: isAbsoluteWebUrl(source.sourceUrl) ? source.sourceUrl : null,
        contexts: ["Current-status and ownership check"],
        missingLinkNote:
          "The underlying public page URL is not yet recorded in the registry.",
      });
      continue;
    }

    drafts.push({
      group: "field",
      title: source.work ?? axis,
      citation: source.pages,
      url: isAbsoluteWebUrl(source.sourceUrl) ? source.sourceUrl : null,
      contexts: ["Registry source"],
      missingLinkNote: "No public URL is recorded for this source.",
    });
  }

  return finalizeProfileSources(drafts);
}

export function linkedProfileSources(
  sources: LinkedProfileSource[],
  options: {
    group: ProfileSourceGroup;
    context: string;
    fallbackTitle: string;
  },
): ProfileSource[] {
  return finalizeProfileSources(
    sources.map((source) => ({
      group: options.group,
      title: source.title || source.publisher || options.fallbackTitle,
      citation: [source.publisher, source.date].filter(Boolean).join(", "),
      url: isAbsoluteWebUrl(source.url) ? source.url : null,
      contexts: [options.context],
      missingLinkNote: "The source record does not include a public URL.",
    })),
  );
}

export function photoProfileSource(photo: {
  archiveUrl?: string | null;
  evidenceUrl?: string | null;
  attribution?: string | null;
  license?: string | null;
} | null): ProfileSource[] {
  if (!photo?.archiveUrl && !photo?.evidenceUrl && !photo?.attribution) return [];
  return finalizeProfileSources([
    {
      group: "visual",
      title: "Profile image source",
      citation: [photo.attribution, photo.license].filter(Boolean).join(" · "),
      url: isAbsoluteWebUrl(photo.archiveUrl)
        ? photo.archiveUrl
        : isAbsoluteWebUrl(photo.evidenceUrl)
          ? photo.evidenceUrl
          : null,
      contexts: ["Profile photograph"],
      missingLinkNote: "The image attribution does not include an archive URL.",
    },
  ]);
}

export function projectProfileSource(
  url: string | null | undefined,
  title: string,
  context: string,
): ProfileSource[] {
  if (!url) return [];
  return finalizeProfileSources([
    {
      group: "project",
      title,
      url: isAbsoluteWebUrl(url) ? url : null,
      contexts: [context],
      missingLinkNote: "The publication link is not a valid public URL.",
    },
  ]);
}

export function finalizeProfileSources(
  groups: (ProfileSource | SourceDraft)[][] | (ProfileSource | SourceDraft)[],
): ProfileSource[] {
  const flat = Array.isArray(groups[0])
    ? (groups as (ProfileSource | SourceDraft)[][]).flat()
    : (groups as (ProfileSource | SourceDraft)[]);
  const merged = new Map<string, ProfileSource>();

  for (const [index, source] of flat.entries()) {
    const key = source.url
      ? source.group === "newspaper"
        ? `url:${source.url}:${source.citation ?? source.title}`
        : `url:${source.url}`
      : `missing:${source.group}:${source.title}:${source.citation ?? ""}`;
    const existing = merged.get(key);
    if (existing) {
      existing.contexts = [
        ...new Set([...existing.contexts, ...(source.contexts ?? [])]),
      ];
      if (!existing.citation && source.citation) {
        existing.citation = source.citation;
      } else if (
        source.citation &&
        source.citation !== existing.citation &&
        !existing.additionalCitations.includes(source.citation)
      ) {
        existing.additionalCitations.push(source.citation);
      }
      continue;
    }
    merged.set(key, {
      ...source,
      id: "id" in source ? source.id : `${source.group}-${index}`,
      additionalCitations:
        "additionalCitations" in source ? source.additionalCitations : [],
      contexts: [...new Set(source.contexts ?? [])],
    });
  }

  const groupOrder: ProfileSourceGroup[] = [
    "newspaper",
    "current",
    "visual",
    "books",
    "field",
    "project",
  ];

  return [...merged.values()]
    .sort((a, b) => {
      const groupDelta =
        groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group);
      if (groupDelta !== 0) return groupDelta;
      return a.title.localeCompare(b.title);
    })
    .map((source, index) => ({
      ...source,
      id: `${source.group}-${index}`,
    }));
}

export function draugasYearArchiveSource(
  date: string,
  context: string,
): ProfileSource[] {
  return finalizeProfileSources([
    {
      group: "newspaper",
      title: `Draugas ${date.slice(0, 4)} public archive`,
      citation: `Draugas archive, ${date.slice(0, 4)}`,
      url: draugasArchiveUrl(date),
      contexts: [context],
    },
  ]);
}
