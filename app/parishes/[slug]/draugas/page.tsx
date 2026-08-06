import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getDraugasProfileLedger,
  selectDraugasSeries,
  type DraugasMentionIssue,
} from "@/lib/draugas-mentions";
import { getCanonicalParishProfile } from "@/lib/parish-profile";

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
  const references = `${issue.indexedOccurrences} indexed ${
    issue.indexedOccurrences === 1 ? "reference" : "references"
  }`;
  const pages = issue.pages.length > 0 ? ` · p. ${issue.pages.join(", ")}` : "";
  return `${references}${pages}`;
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
  searchParams: Promise<{ series?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const profile = getCanonicalParishProfile(slug);
  if (!profile) notFound();
  const ledger = getDraugasProfileLedger(profile);
  if (!ledger) notFound();
  const series = selectDraugasSeries(ledger, query.series);
  const isPrimary = series.parishKey === ledger.primary.parishKey;
  const name = profileName(slug);
  const location = [profile.registry.city, profile.registry.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <Link
        href={profile.href}
        className="text-sm text-muted underline underline-offset-2 hover:text-foreground"
      >
        Back to {name}
      </Link>

      <header className="mt-8 max-w-3xl border-b border-rule pb-8">
        <p className="font-mono text-xs uppercase text-muted">
          Newspaper evidence ledger
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold sm:text-5xl">
          {name} in <em>Draugas</em>
        </h1>
        <p className="mt-2 text-base text-muted">{location}</p>
        <p className="mt-6 max-w-2xl font-serif text-xl leading-relaxed">
          This page opens the dated <em>Draugas</em> issues in which the parish
          appears and preserves the page locators recorded by the archive index.
        </p>
      </header>

      {!isPrimary && (
        <div className="mt-7 border border-rule bg-band px-5 py-4 text-sm leading-relaxed">
          This is a related legacy index once filed under a separate or variant
          identity. Its references are preserved here, but they are not added to
          the primary parish total.
        </div>
      )}

      <section className="grid gap-6 border-b border-rule py-7 sm:grid-cols-3">
        <div>
          <p className="font-mono text-xs uppercase text-muted">
            Indexed references
          </p>
          <p className="mt-1 font-serif text-3xl font-semibold">
            {series.indexedOccurrences.toLocaleString("en-US")}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase text-muted">
            Dated issue files
          </p>
          <p className="mt-1 font-serif text-3xl font-semibold">
            {series.datedIssueFiles.toLocaleString("en-US")}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase text-muted">Span</p>
          <p className="mt-2 text-sm leading-relaxed">
            {formatDate(series.firstIssueDate)} to {formatDate(series.lastIssueDate)}
          </p>
        </div>
      </section>

      <p className="max-w-3xl border-b border-rule py-6 text-sm leading-relaxed text-muted">
        These are indexed reference occurrences, not a claim that every match is
        a separate article. Repeated references inside one issue are grouped on
        that issue’s row. Each link opens the exact public PDF; the cited page
        number shows where the indexed reference was found.
      </p>

      {ledger.related.length > 0 && (
        <nav className="mt-8 border-y border-rule py-4" aria-label="Draugas indexes">
          <p className="font-mono text-xs uppercase text-muted">Indexed series</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link
              href={`${profile.href}/draugas`}
              className={isPrimary ? "font-semibold underline underline-offset-4" : "text-muted underline underline-offset-4"}
            >
              Primary parish record · {ledger.primary.indexedOccurrences}
            </Link>
            {ledger.related.map((related) => (
              <Link
                key={related.parishKey}
                href={`${profile.href}/draugas?series=${encodeURIComponent(related.parishKey)}`}
                className={related.parishKey === series.parishKey ? "font-semibold underline underline-offset-4" : "text-muted underline underline-offset-4"}
              >
                Related legacy index · {related.indexedOccurrences}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <div className="mt-10">
        {series.decades.map((group) => (
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
                    <a
                      href={issue.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline underline-offset-2 hover:text-accent"
                    >
                      Open Draugas issue
                    </a>
                    <p className="mt-1 text-sm text-muted">
                      {issueDescription(issue)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {series.undatedOccurrences > 0 && (
        <section className="mt-10 border-y border-rule py-6">
          <h2 className="font-serif text-2xl font-semibold">Undated references</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {series.undatedOccurrences.toLocaleString("en-US")} indexed
            references do not carry an issue date and therefore cannot be
            placed in the dated list above.
          </p>
        </section>
      )}
    </div>
  );
}
