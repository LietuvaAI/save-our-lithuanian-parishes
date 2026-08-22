import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Report from your parish",
  description:
    "Tell us what is happening at your parish — restructuring letters, listening sessions, sales, closures, and signs of life.",
};

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-page-title font-semibold">
        What is happening at your parish?
      </h1>
      <div className="mt-4 max-w-2xl space-y-4 leading-relaxed">
        <p>
          This record grows in two directions: backward through the archives,
          and forward through people like you. If your parish has received a
          restructuring letter, been named in a diocesan planning process,
          scheduled a listening session, been listed for sale — or if it is
          alive and growing — we want to document it.
        </p>
        <p className="text-muted">
          What helps most: the parish name and city, what happened, when, and
          any document you can point to (a letter, a bulletin, a news item).
          Community reports are reviewed before anything is published, and are
          always marked as community-reported — distinct from the
          archive-verified record.
        </p>
        <p>
          And if a closure process is already moving at your parish — of any
          heritage —{" "}
          <Link
            href="/start-here"
            className="font-medium underline hover:text-accent"
          >
            start here
          </Link>{" "}
          first: the canonical deadlines run in days, and the documents you
          save now are the case you can make later.
        </p>
        <div className="rounded-lg border border-rule p-5">
          <p className="font-serif text-subsection-title font-semibold">
            Send a report or correction
          </p>
          <p className="mt-2 text-body-copy text-muted">
            Email the parish name and place, what happened, the date, and any
            supporting document or link. Photographs and scans are welcome;
            please say whether you took or own them. We review every submission
            before adding it to the public record.
          </p>
          <a
            href="mailto:info@saveourlithuanianparishes.org?subject=Parish%20report%20or%20correction"
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-foreground px-5 py-2 text-body-copy font-semibold hover:bg-foreground hover:text-background"
          >
            Email the project →
          </a>
          <p className="mt-3 text-small-copy text-muted">
            info@saveourlithuanianparishes.org
          </p>
        </div>
      </div>
    </div>
  );
}
