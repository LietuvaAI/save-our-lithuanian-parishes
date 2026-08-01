import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDraugasMentionRecord,
  hasDraugasMentionPage,
  type DraugasMentionDecade,
  type DraugasMentionIssue,
} from "@/lib/draugas-mentions";
import { getCanonicalParishProfile } from "@/lib/parish-profile";

const MAX_INLINE_ISSUES = 200;
const ISSUES_PER_PAGE = 200;

function profileName(slug: string) {
  const profile = getCanonicalParishProfile(slug);
  if (!profile) return null;
  return (
    profile.core?.nameLt ||
    profile.registry.names.lt ||
    profile.registry.names.en ||
    profile.registry.slug
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not established";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function issueDescription(issue: DraugasMentionIssue) {
  const references = `${issue.hitOccurrences} indexed ${
    issue.hitOccurrences === 1 ? "reference" : "references"
  }`;
  const pages = issue.pages.length > 0 ? ` · pp. ${issue.pages.join(", ")}` : "";
  return `${references}${pages}`;
}

function scopedDecades(
  decades: DraugasMentionDecade[],
  requestedDecade: string | undefined,
  requestedPage: string | undefined,
) {
  const totalIssues = decades.reduce(
    (total, group) => total + group.issues.length,
    0,
  );
  if (totalIssues <= MAX_INLINE_ISSUES) {
    return {
      visibleDecades: decades,
      selectedDecade: null,
      page: 1,
      pageCount: 1,
    };
  }

  const selected =
    decades.find((group) => group.decade === requestedDecade) ?? decades[0];
  const pageCount = Math.max(
    1,
    Math.ceil(selected.issues.length / ISSUES_PER_PAGE),
  );
  const parsedPage = Number.parseInt(requestedPage ?? "1", 10);
  const page = Number.isFinite(parsedPage)
    ? Math.min(Math.max(parsedPage, 1), pageCount)
    : 1;
  const start = (page - 1) * ISSUES_PER_PAGE;

  return {
    visibleDecades: [
      {
        decade: selected.decade,
        issues: selected.issues.slice(start, start + ISSUES_PER_PAGE),
      },
    ],
    selectedDecade: selected.decade,
    page,
    pageCount,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = profileName(slug);
  return name ? { title: `${name} in Draugas` } : {};
}

export default async function DraugasMentionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ decade?: string; page?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const profile = getCanonicalParishProfile(slug);
  if (!profile) notFound();
  const record = getDraugasMentionRecord(profile);
  if (!hasDraugasMentionPage(record) || !record) notFound();

  const name = profileName(slug);
  const location = [profile.registry.city, profile.registry.state]
    .filter(Boolean)
    .join(", ");
  const { visibleDecades, selectedDecade, page, pageCount } = scopedDecades(
    record.decades,
    query.decade,
    query.page,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Link
        href={profile.href}
        className="text-sm text-muted underline underline-offset-2 hover:text-foreground"
      >
        Back to {name}
      </Link>

      <header className="mt-8 max-w-3xl border-b border-rule pb-8">
        <p className="font-mono text-xs uppercase text-muted">Newspaper record</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
          {name} in <em>Draugas</em>
        </h1>
        <p className="mt-2 text-base text-muted">{location}</p>
        <p className="mt-6 max-w-2xl font-serif text-xl leading-relaxed">
          <em>Draugas</em> (“The Friend”) is the Lithuanian-American newspaper
          founded in 1909 and published in Chicago. Its archive preserves the
          public record of parish worship, jubilees, clergy, community life,
          disputes, and closures across generations.
        </p>
      </header>

      <section className="grid gap-6 border-b border-rule py-7 sm:grid-cols-3">
        <div>
          <p className="font-mono text-xs uppercase text-muted">Indexed references</p>
          <p className="mt-1 font-serif text-3xl font-semibold">
            {record.totalHitOccurrences.toLocaleString("en-US")}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase text-muted">Dated issue files</p>
          <p className="mt-1 font-serif text-3xl font-semibold">
            {record.uniqueDatedIssueCount.toLocaleString("en-US")}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase text-muted">Span</p>
          <p className="mt-2 text-sm leading-relaxed">
            {formatDate(record.firstIssueDate)} to {formatDate(record.lastIssueDate)}
          </p>
        </div>
      </section>

      <p className="max-w-3xl border-b border-rule py-6 text-sm leading-relaxed text-muted">
        The archive index attributes {record.totalHitOccurrences.toLocaleString("en-US")} references
        to this parish across {record.uniqueDatedIssueCount.toLocaleString("en-US")} dated issue
        files. Repeated references inside one issue are counted together below.
        Exact issue links appear only after they have been verified against the
        public online <em>Draugas</em> archive.
      </p>

      {selectedDecade && (
        <nav
          aria-label="Draugas decades"
          className="mt-10 border-y border-rule py-4"
        >
          <p className="font-mono text-xs uppercase text-muted">Browse by decade</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {record.decades.map((group) => (
              <Link
                key={group.decade}
                href={`${profile.href}/draugas?decade=${group.decade}`}
                className={
                  group.decade === selectedDecade
                    ? "font-semibold text-foreground underline underline-offset-4"
                    : "text-muted underline underline-offset-4 hover:text-foreground"
                }
              >
                {group.decade} · {group.issues.length.toLocaleString("en-US")}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <div className={selectedDecade ? "mt-8" : "mt-10"}>
        {visibleDecades.map((group) => (
          <section key={group.decade} className="mt-10 first:mt-0">
            <h2 className="border-b border-rule pb-3 font-serif text-2xl font-semibold">
              {group.decade}
            </h2>
            <ol>
              {group.issues.map((issue) => (
                <li
                  key={issue.id}
                  className="grid gap-2 border-b border-rule py-4 sm:grid-cols-[104px_1fr] sm:gap-6"
                >
                  <time className="font-mono text-xs text-muted" dateTime={issue.date}>
                    {formatDate(issue.date)}
                  </time>
                  <div>
                    {issue.url ? (
                      <a
                        href={issue.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline underline-offset-2 hover:text-accent"
                      >
                        Open Draugas issue
                      </a>
                    ) : (
                      <p className="font-medium text-muted">Draugas issue</p>
                    )}
                    <p className="mt-1 text-sm text-muted">
                      {issueDescription(issue)}
                      {issue.url
                        ? ` · ${issue.access === "subscriber" ? "subscriber access" : "open access"}`
                        : " · issue page not yet linked"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {selectedDecade && pageCount > 1 && (
        <nav
          aria-label={`${selectedDecade} issue pages`}
          className="mt-8 flex items-center justify-between border-y border-rule py-4 text-sm"
        >
          {page > 1 ? (
            <Link
              href={`${profile.href}/draugas?decade=${selectedDecade}&page=${page - 1}`}
              className="underline underline-offset-2"
            >
              Previous issues
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link
              href={`${profile.href}/draugas?decade=${selectedDecade}&page=${page + 1}`}
              className="underline underline-offset-2"
            >
              More issues
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      {record.undatedHitOccurrences > 0 && (
        <section className="mt-10 border-y border-rule py-6">
          <h2 className="font-serif text-2xl font-semibold">Not listed</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {record.undatedHitOccurrences.toLocaleString("en-US")} indexed
            references do not carry an issue date and therefore cannot be
            placed in the dated list above.
          </p>
        </section>
      )}
    </div>
  );
}
