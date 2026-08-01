import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CanonicalParishProfile } from "@/lib/parish-profile";

export const DRAUGAS_MENTION_PAGE_THRESHOLD = 10;

type RawIssue = {
  date: string;
  file: string;
  pages: string[];
  hit_occurrences: number;
  attribution_grades: Record<string, number>;
};

type RawParishMentionRecord = {
  parish_key: string;
  registry_hit_occurrences: number;
  dated_hit_occurrences: number;
  undated_hit_occurrences: number;
  unique_dated_issues: number;
  first_issue_date: string | null;
  last_issue_date: string | null;
  issues: RawIssue[];
};

type RawMentionIndex = {
  schema_version: string;
  parishes: RawParishMentionRecord[];
};

type DraugasLinkEntry = {
  status: "verified" | "gated" | "unresolved";
  url?: string;
};

type DraugasLinkCache = {
  results: Record<string, DraugasLinkEntry>;
};

export type DraugasIssueAccess = "open" | "subscriber";

export type DraugasMentionIssue = {
  id: string;
  date: string;
  file: string;
  pages: string[];
  hitOccurrences: number;
  url: string | null;
  access: DraugasIssueAccess | null;
};

export type DraugasMentionDecade = {
  decade: string;
  issues: DraugasMentionIssue[];
};

export type DraugasMentionRecord = {
  parishKey: string;
  totalHitOccurrences: number;
  datedHitOccurrences: number;
  undatedHitOccurrences: number;
  uniqueDatedIssueCount: number;
  linkedIssueCount: number;
  unlinkedIssueCount: number;
  firstIssueDate: string | null;
  lastIssueDate: string | null;
  issues: DraugasMentionIssue[];
  decades: DraugasMentionDecade[];
};

function readJson<T>(filename: string): T {
  return JSON.parse(
    readFileSync(join(process.cwd(), "data", filename), "utf8"),
  ) as T;
}

const rawIndex = readJson<RawMentionIndex>("draugas-mention-index.json");
if (rawIndex.schema_version !== "draugas-parish-mention-index-v1") {
  throw new Error(
    `Unsupported Draugas mention index: ${rawIndex.schema_version}`,
  );
}

const rawByParishKey = new Map(
  rawIndex.parishes.map((record) => [record.parish_key, record]),
);
const linkCache = readJson<DraugasLinkCache>("draugas-links.json").results;

function exactVerifiedLink(
  issue: RawIssue,
): { url: string; access: DraugasIssueAccess } | null {
  const link = linkCache[issue.date];
  if (!link?.url || !["verified", "gated"].includes(link.status)) return null;

  let linkedFilename: string;
  try {
    linkedFilename = decodeURIComponent(new URL(link.url).pathname.split("/").at(-1) ?? "");
  } catch {
    return null;
  }
  if (linkedFilename !== issue.file) return null;

  return {
    url: link.url,
    access: link.status === "gated" ? "subscriber" : "open",
  };
}

function materializeRecord(raw: RawParishMentionRecord): DraugasMentionRecord {
  const issues: DraugasMentionIssue[] = raw.issues.map((issue) => {
    const link = exactVerifiedLink(issue);
    return {
      id: `${issue.date}:${issue.file}`,
      date: issue.date,
      file: issue.file,
      pages: issue.pages,
      hitOccurrences: issue.hit_occurrences,
      url: link?.url ?? null,
      access: link?.access ?? null,
    };
  });

  const datedHitOccurrences = issues.reduce(
    (total, issue) => total + issue.hitOccurrences,
    0,
  );
  const totalHitOccurrences = datedHitOccurrences + raw.undated_hit_occurrences;
  if (
    datedHitOccurrences !== raw.dated_hit_occurrences ||
    totalHitOccurrences !== raw.registry_hit_occurrences ||
    issues.length !== raw.unique_dated_issues
  ) {
    throw new Error(`${raw.parish_key}: Draugas mention-index count drift`);
  }

  const groups = new Map<string, DraugasMentionIssue[]>();
  for (const issue of [...issues].sort((a, b) => b.date.localeCompare(a.date))) {
    const decade = `${Math.floor(Number(issue.date.slice(0, 4)) / 10) * 10}s`;
    groups.set(decade, [...(groups.get(decade) ?? []), issue]);
  }

  const linkedIssueCount = issues.filter((issue) => issue.url).length;
  return {
    parishKey: raw.parish_key,
    totalHitOccurrences,
    datedHitOccurrences,
    undatedHitOccurrences: raw.undated_hit_occurrences,
    uniqueDatedIssueCount: issues.length,
    linkedIssueCount,
    unlinkedIssueCount: issues.length - linkedIssueCount,
    firstIssueDate: issues.at(0)?.date ?? null,
    lastIssueDate: issues.at(-1)?.date ?? null,
    issues,
    decades: [...groups.entries()].map(([decade, decadeIssues]) => ({
      decade,
      issues: decadeIssues,
    })),
  };
}

function mentionParishKey(profile: CanonicalParishProfile): string | null {
  const source = profile.registry.sources?.find(
    (candidate) => candidate.axis === "draugas-registry-1909-2007",
  );
  return source?.parish_key ?? null;
}

export function getDraugasMentionRecord(
  profile: CanonicalParishProfile,
): DraugasMentionRecord | null {
  const parishKey = mentionParishKey(profile);
  if (!parishKey) return null;
  const raw = rawByParishKey.get(parishKey);
  return raw ? materializeRecord(raw) : null;
}

export function hasDraugasMentionPage(
  record: Pick<DraugasMentionRecord, "totalHitOccurrences"> | null,
): boolean {
  return (
    record !== null &&
    record.totalHitOccurrences > DRAUGAS_MENTION_PAGE_THRESHOLD
  );
}
