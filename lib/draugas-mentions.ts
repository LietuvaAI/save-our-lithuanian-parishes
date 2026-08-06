import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CanonicalParishProfile } from "@/lib/parish-profile";

export type DraugasMentionIssue = {
  id: string;
  date: string;
  file: string;
  pages: string[];
  indexedOccurrences: number;
  publicUrl: string;
};

export type DraugasMentionDecade = {
  decade: string;
  issues: DraugasMentionIssue[];
};

export type DraugasMentionSeries = {
  role: "primary" | "related_legacy_index";
  parishKey: string;
  indexedOccurrences: number;
  datedOccurrences: number;
  undatedOccurrences: number;
  datedIssueFiles: number;
  firstIssueDate: string | null;
  lastIssueDate: string | null;
  registrySummaryMatchesIndex: boolean;
  issues: DraugasMentionIssue[];
  decades: DraugasMentionDecade[];
};

export type DraugasProfileLedger = {
  publicProfile: string;
  registrySlug: string;
  culturenetEntityId: string;
  primary: DraugasMentionSeries;
  related: DraugasMentionSeries[];
};

type RawIssue = {
  id: string;
  date: string;
  file: string;
  pages: string[];
  indexed_occurrences: number;
  public_url: string;
};

type RawSeries = {
  role: "primary" | "related_legacy_index";
  parish_key: string;
  indexed_occurrences: number;
  dated_occurrences: number;
  undated_occurrences: number;
  dated_issue_files: number;
  first_issue_date: string | null;
  last_issue_date: string | null;
  registry_summary_matches_index: boolean;
  issues: RawIssue[];
};

type RawProfile = {
  public_profile: string;
  registry_slug: string;
  culturenet_entity_id: string;
  series: RawSeries[];
};

type RawProjection = {
  schema: string;
  profiles: RawProfile[];
};

const raw = JSON.parse(
  readFileSync(
    join(process.cwd(), "data", "canonical-draugas-mention-projection.json"),
    "utf8",
  ),
) as RawProjection;

if (raw.schema !== "culturenet-parish-draugas-mention-projection.v1") {
  throw new Error(`Unsupported canonical Draugas projection: ${raw.schema}`);
}

function materializeSeries(series: RawSeries): DraugasMentionSeries {
  const issues = series.issues.map((issue) => ({
    id: issue.id,
    date: issue.date,
    file: issue.file,
    pages: issue.pages,
    indexedOccurrences: issue.indexed_occurrences,
    publicUrl: issue.public_url,
  }));
  const grouped = new Map<string, DraugasMentionIssue[]>();
  for (const issue of [...issues].sort((a, b) => b.date.localeCompare(a.date))) {
    const decade = `${Math.floor(Number(issue.date.slice(0, 4)) / 10) * 10}s`;
    grouped.set(decade, [...(grouped.get(decade) ?? []), issue]);
  }
  return {
    role: series.role,
    parishKey: series.parish_key,
    indexedOccurrences: series.indexed_occurrences,
    datedOccurrences: series.dated_occurrences,
    undatedOccurrences: series.undated_occurrences,
    datedIssueFiles: series.dated_issue_files,
    firstIssueDate: series.first_issue_date,
    lastIssueDate: series.last_issue_date,
    registrySummaryMatchesIndex: series.registry_summary_matches_index,
    issues,
    decades: [...grouped.entries()].map(([decade, decadeIssues]) => ({
      decade,
      issues: decadeIssues,
    })),
  };
}

const byPublicProfile = new Map<string, DraugasProfileLedger>();
for (const profile of raw.profiles) {
  const series = profile.series.map(materializeSeries);
  const primary = series.find((candidate) => candidate.role === "primary");
  if (!primary) {
    throw new Error(`${profile.public_profile}: canonical Draugas primary series missing`);
  }
  byPublicProfile.set(profile.public_profile, {
    publicProfile: profile.public_profile,
    registrySlug: profile.registry_slug,
    culturenetEntityId: profile.culturenet_entity_id,
    primary,
    related: series.filter((candidate) => candidate.role !== "primary"),
  });
}

export function getDraugasProfileLedger(
  profile: CanonicalParishProfile,
): DraugasProfileLedger | null {
  return byPublicProfile.get(profile.href) ?? null;
}

export function selectDraugasSeries(
  ledger: DraugasProfileLedger,
  parishKey: string | undefined,
): DraugasMentionSeries {
  if (!parishKey) return ledger.primary;
  return (
    [ledger.primary, ...ledger.related].find(
      (series) => series.parishKey === parishKey,
    ) ?? ledger.primary
  );
}
