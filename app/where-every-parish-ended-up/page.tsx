import type { Metadata } from "next";
import Link from "next/link";
import ParishThreads, {
  type FateKey,
  type ThreadParish,
} from "@/components/ParishThreads";
import registryData from "@/data/registry-unified.json";
import { scopedParishes } from "@/lib/registry-scope";
import { toGroup } from "@/lib/end-state";

export const metadata: Metadata = {
  title: "Where Every Parish Ended Up",
  description:
    "Follow every documented Roman Catholic Lithuanian parish from its founding decade to its present status and, for closed parishes, the fate of its church building.",
};

const DIVINE_PROVIDENCE_SLUG = "dievo-apvaizdos-southfield-mi";
const DIVINE_PROVIDENCE_HISTORY =
  "https://blog.saveourlithuanianparishes.org/p/in-writing-the-1968-letter-that-made";

function buildThreads(): ThreadParish[] {
  return scopedParishes().map((parish) => {
    let fateKey: FateKey | null = null;

    if (parish.endState === "demolished") fateKey = "demolished";
    else if (parish.endState === "repurposed") {
      fateKey =
        parish.buildingFate === "repurposed_secular"
          ? "secular"
          : "religious";
    } else if (parish.endState === "closed") {
      if (parish.buildingFate === "standing") fateKey = "standing";
      else if (parish.buildingFate === "derelict") fateKey = "derelict";
      else fateKey = "unrecorded";
    }

    const divineProvidence =
      parish.slug === DIVINE_PROVIDENCE_SLUG
        ? {
            contextNote:
              "Its institutional lineage begins in 1908 as St. George in Detroit. The present Southfield church was consecrated September 8, 1973.",
            contextHref: DIVINE_PROVIDENCE_HISTORY,
            contextLinkLabel: "Read the parish history",
          }
        : {};

    return {
      slug: parish.slug,
      name: parish.name,
      city: parish.city,
      state: parish.state,
      founded: parish.founded,
      closed: parish.closed,
      endState: parish.endState,
      fateKey,
      href: parish.profileHref,
      ...divineProvidence,
    };
  });
}

export default function ParishOutcomeFlowPage() {
  const threads = buildThreads();
  const closed = threads.filter(
    (parish) => toGroup(parish.endState) === "closed",
  );
  const demolished = closed.filter(
    (parish) => parish.fateKey === "demolished",
  ).length;
  const reused = closed.filter(
    (parish) =>
      parish.fateKey === "religious" || parish.fateKey === "secular",
  ).length;
  const generated = new Date(
    `${registryData.generated}T00:00:00Z`,
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        A full-record flow
      </p>
      <h1 className="mt-1 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Where did every Lithuanian parish end up?
      </h1>
      <p className="mt-3 max-w-3xl text-lg leading-relaxed">
        Follow each Roman Catholic Lithuanian parish from its founding decade
        to its present condition. Closed parishes continue into a final
        branch showing what became of the church building.
      </p>

      <section className="mt-8 border-y border-rule py-5">
        <p className="max-w-3xl font-serif text-xl leading-relaxed">
          Of {threads.length} parishes, {closed.length} are closed. Their
          buildings did not share one fate: {demolished} were demolished and{" "}
          {reused} passed into religious or secular reuse.
        </p>
        <p className="mt-2 text-sm text-muted">
          Scope: {threads.length} U.S. Roman Catholic Lithuanian parishes ·
          institutional founding decade to present status · registry generated{" "}
          {generated}.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">
          One line, one parish
        </h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted">
          Select a line to keep that parish&rsquo;s name, dates, outcome, and
          profile link visible. Select a decade or outcome band to inspect all
          parishes inside it.
        </p>
        <div className="mt-6">
          <ParishThreads parishes={threads} />
        </div>
      </section>

      <section className="mt-10 border-t border-rule pt-6">
        <h2 className="font-serif text-xl font-semibold">
          A parish date is not always a building date
        </h2>
        <p className="mt-2 max-w-3xl leading-relaxed">
          The left-hand decades mark institutional beginnings. Divine
          Providence therefore begins with its 1908 St. George lineage in
          Detroit, while its present Southfield church belongs to a later
          chapter: it was consecrated on September 8, 1973. Select the Divine
          Providence line to see both dates together.
        </p>
        <p className="mt-3 text-sm">
          <a
            href={DIVINE_PROVIDENCE_HISTORY}
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline hover:text-accent"
          >
            Read the sourced Divine Providence history
          </a>
          {" · "}
          <Link
            href={`/parishes/${DIVINE_PROVIDENCE_SLUG}`}
            className="font-semibold underline hover:text-accent"
          >
            Open its canonical profile
          </Link>
        </p>
      </section>

      <p className="mt-8 border-t border-rule pt-4 text-xs leading-relaxed text-muted">
        Every line derives from the unified parish registry. Founding dates,
        present classifications, and building outcomes remain linked to the
        canonical parish profiles.{" "}
        <Link
          href="/about-the-data"
          className="underline hover:text-foreground"
        >
          About the data
        </Link>
        .
      </p>
    </div>
  );
}
