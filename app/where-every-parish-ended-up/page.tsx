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
  title: "Lithuanian Churches Through Time",
  description:
    "Follow every documented Roman Catholic Lithuanian church from its building or parish baseline through its present condition.",
};

const DIVINE_PROVIDENCE_SLUG = "dievo-apvaizdos-southfield-mi";

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

    const divineProvidence = parish.slug === DIVINE_PROVIDENCE_SLUG;

    return {
      slug: parish.slug,
      name: parish.name,
      city: parish.city,
      state: parish.state,
      anchorYear: divineProvidence ? 1973 : parish.founded,
      anchorLabel: divineProvidence
        ? "Southfield church consecrated"
        : "parish baseline",
      endState: parish.endState,
      fateKey,
      href: parish.profileHref,
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs uppercase tracking-widest text-muted">
        A national view
      </p>
      <h1 className="mt-1 max-w-3xl font-serif text-3xl font-semibold leading-tight sm:text-4xl">
        Lithuanian churches through time
      </h1>
      <p className="mt-2 max-w-3xl text-lg leading-relaxed">
        Follow each Roman Catholic Lithuanian church community from its
        documented beginning to its present condition.
      </p>

      <section className="mt-5 border-y border-rule py-3">
        <p className="max-w-3xl font-serif text-lg leading-relaxed">
          Of {threads.length} parishes, {closed.length} are closed. Their
          buildings did not share one fate: {demolished} were demolished and{" "}
          {reused} passed into religious or secular reuse.
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Scope: {threads.length} U.S. Roman Catholic Lithuanian parishes ·
          record current to {generated}. Lines begin with a documented church
          date or, where that date is not yet established, the parish founding
          year. Divine Providence begins with its Southfield church,
          consecrated in 1973.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-xl font-semibold">
          From first home to present condition
        </h2>
        <div className="mt-3">
          <ParishThreads parishes={threads} />
        </div>
      </section>

      <p className="mt-8 border-t border-rule pt-4 text-xs leading-relaxed text-muted">
        Every line derives from the unified parish registry. Building
        baselines, present classifications, and outcomes remain linked to the
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
