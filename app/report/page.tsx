import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Report from your parish",
  description:
    "Tell us what is happening at your parish — restructuring letters, listening sessions, sales, closures, and signs of life.",
};

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">
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
        <div className="rounded-lg border border-rule p-5">
          <p className="font-medium">The submission form is coming soon.</p>
          <p className="mt-1 text-sm text-muted">
            We are building a proper intake with review before publication.
            Until it is live, follow the project on GitHub —{" "}
            <a
              href="https://github.com/LietuvaAI/save-our-lithuanian-parishes"
              className="underline hover:text-foreground"
            >
              LietuvaAI/save-our-lithuanian-parishes
            </a>{" "}
            — where every update to the record is public.
          </p>
        </div>
      </div>
    </div>
  );
}
