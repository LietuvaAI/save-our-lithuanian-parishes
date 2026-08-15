import { draugasArchiveUrl, draugasCitationUrl } from "@/lib/parishes";
import type { PublicationSourceArtifact } from "@/lib/publication-projection";

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
  publisher?: string;
  date?: string;
  citation?: string;
  additionalCitations: string[];
  url: string | null;
  contexts: string[];
  excerpt?: string;
  missingLinkNote?: string;
};

export type RegistryProfileSource = {
  axis?: string;
  kind?: string;
  work?: string;
  publisher?: string;
  accessed?: string;
  pages?: string;
  cites?: string;
  note?: string;
  first_mention?: string;
  last_mention?: string;
  total_mentions?: number;
  sourceUrl?: string;
  excerpt?: string;
  supports?: string;
};

export type LinkedProfileSource = {
  url?: string | null;
  title?: string;
  publisher?: string;
  date?: string;
  page?: string;
  excerpt?: string;
  supports?: string;
};

type SourceDraft = Omit<
  ProfileSource,
  "id" | "contexts" | "additionalCitations"
> & {
  contexts?: string[];
};

const BOOKS: Record<
  string,
  { title: string; citation: string; date: string; url: string }
> = {
  wolkovich: {
    title: "Lithuanian Religious Life in America, Vol. 3",
    citation:
      "William Wolkovich-Valkavičius, Lithuanian Religious Life in America, Vol. 3 (1998)",
    date: "1998",
    url: "https://archyvas.ziburioltmokykla.org/item/20260722_1784749031073",
  },
  "michelsonas-1961": {
    title: "Lietuvių Išeivija Amerikoje",
    citation:
      "Stasys Michelsonas, Lietuvių Išeivija Amerikoje (1868–1961), Keleivis, 1961",
    date: "1961",
    url: "https://archyvas.ziburioltmokykla.org/item/20260225_lietuviu_iseivija_amerikoje",
  },
  "lukas-2009": {
    title: "Lietuvių kultūrinis paveldas Amerikoje",
    citation:
      "Algis Lukas, Lietuvių kultūrinis paveldas Amerikoje, Lithuanian American Community, 2009",
    date: "2009",
    url: "https://archyvas.ziburioltmokykla.org/item/20260725_1785004329786",
  },
};

function firstRecordedDate(...values: (string | null | undefined)[]) {
  for (const value of values) {
    const match = value?.match(/\b(18|19|20)\d{2}(?:-\d{2}(?:-\d{2})?)?\b/);
    if (match) return match[0];
  }
  return undefined;
}

function isAbsoluteWebUrl(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\//i.test(url);
}

function canonicalArtifactGroup(
  artifactType: string,
): ProfileSourceGroup {
  if (/newspaper|periodical|news|report/.test(artifactType)) {
    return "newspaper";
  }
  if (/archive|book|history|historical|scholarly|compendium/.test(artifactType)) {
    return "books";
  }
  if (/field|specialist/.test(artifactType)) return "field";
  if (/official|municipal|public_web/.test(artifactType)) return "current";
  return "project";
}

export function canonicalArtifactProfileSources(
  artifacts: PublicationSourceArtifact[],
): ProfileSource[] {
  return finalizeProfileSources(
    artifacts.flatMap((artifact): SourceDraft[] => {
      const url = artifact.rights?.public_url;
      if (!isAbsoluteWebUrl(url)) return [];
      const citation = artifact.locator?.page;
      return [
        {
          group: canonicalArtifactGroup(artifact.artifact_type),
          title: artifact.title,
          date: firstRecordedDate(
            artifact.locator?.exact_label,
            artifact.id,
          ),
          citation: citation || undefined,
          url,
          contexts: ["Canonical CultureNet evidence"],
        },
      ];
    }),
  );
}

type DraugasCitation = {
  date: string;
  detail?: string;
};

function draugasCitations(cites: string | undefined): DraugasCitation[] {
  if (!cites) return [];
  return cites
    .split(";")
    .map((value) => value.trim())
    .flatMap((value): DraugasCitation[] => {
      const match = value.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(.+))?$/);
      if (!match) return [];
      const detail = match[2]?.trim();
      return [{ date: match[1], ...(detail ? { detail } : {}) }];
    });
}

function draugasSource(
  date: string,
  context: string,
  title = `Draugas issue, ${date}`,
  detail?: string,
  sourceUrl?: string,
  excerpt?: string,
): SourceDraft {
  const issueUrlBase =
    isAbsoluteWebUrl(sourceUrl) && sourceUrl.includes(date)
      ? sourceUrl
      : draugasCitationUrl(date);
  const page = detail?.match(/\bp(?:p)?\.\s*(\d+)\b/i)?.[1];
  const issueUrl = page
    ? `${issueUrlBase.split("#")[0]}#page=${page}`
    : issueUrlBase;
  return {
    group: "newspaper",
    title,
    publisher: "Draugas",
    date,
    citation: `Draugas, ${date}${detail ? `, ${detail}` : ""}`,
    url: issueUrl,
    contexts: [context],
    excerpt,
  };
}

function sourceLabel(axis: string): string {
  const labels: Record<string, string> = {
    "draugas-news": "Draugas News",
    "lithuanian-genealogy": "Lithuanian Global Genealogical Society",
  };
  return (
    labels[axis] ??
    axis
      .split("-")
      .map((word, index) =>
        index > 0 && word === "of"
          ? word
          : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ")
  );
}

function sourceCitation(
  source: RegistryProfileSource,
  publisher?: string,
): string | undefined {
  const pages = source.pages
    ? `${source.pages.match(/^p(?:p)?\./i) ? "" : "p. "}${source.pages}`
    : null;
  const parts = [
    publisher,
    pages,
    source.cites,
    source.accessed ? `accessed ${source.accessed}` : null,
  ].filter(
    (value): value is string => !!value,
  );
  return parts.length > 0 ? parts.join(" · ") : undefined;
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
        date: book.date,
        citation: source.pages
          ? `${book.citation}, ${source.pages}`
          : book.citation,
        url: book.url,
        contexts: ["Published parish history and institutional record"],
      });
      continue;
    }

    if (axis === "draugas-2008-2026") {
      for (const citation of draugasCitations(source.cites)) {
        drafts.push(
          draugasSource(
            citation.date,
            source.supports ?? "Modern Draugas case-file evidence",
            source.work,
            citation.detail,
            source.sourceUrl,
            source.excerpt,
          ),
        );
      }
      continue;
    }

    if (axis === "draugas-registry-1909-2007") {
      // The historical registry series is a machine-attributed navigation
      // index, not an entity-reviewed source ledger. Keep it in Brain for
      // research, but do not publish its totals or candidate issue links on
      // parish profiles. Individually reviewed case-file citations continue
      // to enter through draugasProfileSources above.
      continue;
    }

    if (
      axis.startsWith("diocese-") ||
      axis.startsWith("archdiocese-") ||
      axis.startsWith("pncc-") ||
      source.kind?.startsWith("diocesan-") ||
      source.kind?.includes("official-") ||
      source.kind?.includes("current-institutional")
    ) {
      const publisher = source.publisher ?? sourceLabel(axis);
      const context = source.kind?.includes("denominational")
        ? "Official denominational directory"
        : source.kind?.includes("current-institutional")
          ? "Current institutional record"
          : "Official diocesan record";
      drafts.push({
        group: "current",
        title: source.work ?? publisher,
        publisher,
        date: source.accessed
          ? `Accessed ${source.accessed}`
          : firstRecordedDate(source.cites),
        citation: sourceCitation(source, publisher),
        url: isAbsoluteWebUrl(source.sourceUrl) ? source.sourceUrl : null,
        contexts: [context],
        missingLinkNote:
          "The registry does not carry the official record URL.",
      });
      continue;
    }

    if (axis === "truelithuania") {
      drafts.push({
        group: "field",
        title: "Global True Lithuania field survey",
        publisher: "Global True Lithuania",
        date: source.accessed ? `Accessed ${source.accessed}` : undefined,
        citation: source.work,
        url: isAbsoluteWebUrl(source.sourceUrl) ? source.sourceUrl : null,
        contexts: ["Heritage field survey and present-use observations"],
        missingLinkNote: "The registry does not carry the survey URL.",
      });
      continue;
    }

    if (axis === "web-historical") {
      // Early extraction passes created web-candidate placeholders before a
      // public page URL was captured. They remain in the research registry as
      // provenance, but a URL-less candidate is not a publishable source.
      if (!isAbsoluteWebUrl(source.sourceUrl)) continue;
      drafts.push({
        group: "current",
        title: "Diocesan and parish web survey",
        date: firstRecordedDate(source.work, source.accessed),
        citation: source.work ?? "Automated web survey, 2026",
        url: source.sourceUrl,
        contexts: ["Current-status and ownership check"],
      });
      continue;
    }

    drafts.push({
      group: "field",
      title: source.work ?? sourceLabel(axis),
      publisher: source.publisher,
      date: source.accessed
        ? `Accessed ${source.accessed}`
        : firstRecordedDate(source.cites),
      citation: sourceCitation(source),
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
    sources.map((source) => {
      const isDraugas =
        source.publisher?.toLowerCase() === "draugas" ||
        /draugas\.org/i.test(source.url ?? "");
      const page = source.page?.match(/\bp(?:p)?\.\s*(\d+)\b/i)?.[1];
      const sourceUrl = isAbsoluteWebUrl(source.url) ? source.url : null;
      return {
        group: isDraugas ? "newspaper" : options.group,
        title: source.title || source.publisher || options.fallbackTitle,
        publisher: source.publisher,
        date: source.date,
        citation: [source.publisher, source.date, source.page]
          .filter(Boolean)
          .join(", "),
        url:
          isDraugas && sourceUrl && page
            ? `${sourceUrl.split("#")[0]}#page=${page}`
            : sourceUrl,
        contexts: [source.supports ?? options.context],
        excerpt: source.excerpt,
        missingLinkNote: "The source record does not include a public URL.",
      };
    }),
  );
}

export function photoProfileSource(photo: {
  src?: string | null;
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
          : photo.src?.startsWith("/")
            ? `https://saveourlithuanianparishes.org${photo.src}`
            : null,
      contexts: ["Profile photograph"],
      missingLinkNote:
        "The image attribution does not include an archive or published-file URL.",
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
  const allSources = Array.isArray(groups[0])
    ? (groups as (ProfileSource | SourceDraft)[][]).flat()
    : (groups as (ProfileSource | SourceDraft)[]);
  const flat = allSources.filter((source) => {
    const isGenericDraugasIssue =
      source.group === "newspaper" &&
      source.publisher === "Draugas" &&
      /^Draugas issue, /.test(source.title);
    if (!isGenericDraugasIssue || !source.date) return true;
    return !allSources.some(
      (candidate) =>
        candidate !== source &&
        candidate.group === "newspaper" &&
        candidate.publisher === "Draugas" &&
        candidate.date === source.date &&
        !/^Draugas issue, /.test(candidate.title),
    );
  });
  const merged = new Map<string, ProfileSource>();

  for (const [index, source] of flat.entries()) {
    const normalizedUrl = source.url?.replace(/^http:\/\//i, "https://");
    const key = source.url
      ? source.group === "newspaper"
        ? `url:${normalizedUrl}:${source.citation ?? source.title}`
        : `url:${normalizedUrl}`
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
      if (!existing.publisher && source.publisher) {
        existing.publisher = source.publisher;
      }
      if (!existing.date && source.date) {
        existing.date = source.date;
      }
      if (!existing.excerpt && source.excerpt) {
        existing.excerpt = source.excerpt;
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
