import Link from "next/link";
import type { ReactNode } from "react";

type CommonProps = {
  institutionCount: number;
  physicalSiteCount: number;
  view: ReactNode;
};

type InstitutionProps = CommonProps & {
  mode: "institutions";
  parishCount: number;
  missionCount: number;
  closedCount: number;
  currentWorshipPlaces: number;
  publicInstitutionCount: number;
};

type BuildingProps = CommonProps & {
  mode: "buildings";
  demolishedSiteCount: number;
  repurposedSiteCount: number;
  standingSiteCount: number;
  listedSiteCount: number;
  unestablishedSiteCount: number;
};

export default function OutcomeModeExplorer(
  props: InstitutionProps | BuildingProps,
) {
  const institutions = props.mode === "institutions";

  return (
    <>
      <h1 className="font-serif text-outcomes-title font-semibold">
        The State of Lithuanian Catholic Parishes in America
      </h1>

      {institutions ? (
        <p className="mt-2 max-w-[90ch] text-lead-copy">
          Of <strong>{props.institutionCount}</strong> Lithuanian Roman Catholic
          parishes and missions, <strong>{props.closedCount}</strong> have
          closed; Lithuanian worship continues at{" "}
          <strong>{props.currentWorshipPlaces}</strong>.
        </p>
      ) : (
        <p className="mt-2 max-w-[90ch] text-lead-copy">
          The record identifies <strong>{props.physicalSiteCount}</strong>{" "}
          physical worship sites: <strong>{props.standingSiteCount}</strong>{" "}
          standing, <strong>{props.demolishedSiteCount}</strong> demolished,{" "}
          <strong>{props.repurposedSiteCount}</strong> repurposed,{" "}
          <strong>{props.listedSiteCount}</strong> listed for sale or
          redevelopment, and <strong>{props.unestablishedSiteCount}</strong>{" "}
          whose present condition is not yet established.
        </p>
      )}

      <section className="mt-3 border-y border-rule py-3">
        <h2 className="font-serif text-compact-heading font-semibold">
          How to read this
        </h2>
        {institutions ? (
          <p className="mt-1 max-w-[90ch] text-body-copy leading-relaxed">
            Every line is one institution&mdash;one parish or mission, counted
            once&mdash;running from the decade it began to its institutional
            outcome today. This view follows {props.parishCount} U.S. Roman
            Catholic parishes and {props.missionCount} missions. Closed is one
            institutional outcome; optional filters inside its list describe
            the known condition of each institution&apos;s last-used church.
            Earlier churches and multiple sites are counted in the separate{" "}
            <Link
              href="/church-buildings-through-time"
              className="underline hover:text-accent"
            >
              church-building history
            </Link>
            . Other traditions, research-only records, and Canadian comparators
            are outside this population; all {props.publicInstitutionCount}{" "}
            published U.S. profiles are in the{" "}
            <Link href="/parishes" className="underline hover:text-accent">
              full directory
            </Link>
            .
          </p>
        ) : (
          <p className="mt-1 max-w-[90ch] text-body-copy leading-relaxed">
            Every row is one physical church or worship site. A parish or
            mission may have used several buildings, and one building may have
            served more than one congregation. Building conditions come only
            from documented site evidence; &ldquo;not yet established&rdquo; is
            a research gap, not an outcome. Open the separate Parishes &amp;
            missions view to follow each institution once.
          </p>
        )}
      </section>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-serif text-section-title font-semibold">
          {institutions ? "Institution by institution" : "Building by building"}
        </h2>
        <nav
          className="inline-flex overflow-hidden rounded-md border border-rule bg-background p-0.5 text-support-copy font-semibold"
          aria-label="Choose a Parish & Mission Status view"
        >
          <Link
            href="/where-every-parish-ended-up"
            aria-current={institutions ? "page" : undefined}
            className={`rounded px-3 py-1.5 transition-colors ${
              institutions
                ? "bg-foreground text-background"
                : "text-muted hover:bg-band hover:text-foreground"
            }`}
          >
            Parishes &amp; missions · {props.institutionCount}
          </Link>
          <Link
            href="/church-buildings-through-time"
            aria-current={!institutions ? "page" : undefined}
            className={`rounded px-3 py-1.5 transition-colors ${
              institutions
                ? "text-muted hover:bg-band hover:text-foreground"
                : "bg-foreground text-background"
            }`}
          >
            Church buildings · {props.physicalSiteCount}
          </Link>
        </nav>
      </div>

      <p className="mt-2 max-w-[90ch] text-support-copy leading-relaxed text-muted">
        {institutions ? (
          <>
            <strong className="font-semibold text-foreground">
              Institution view:
            </strong>{" "}
            each parish or mission is counted once. Closed remains one outcome;
            the condition of its last-used church is available as a secondary
            filter inside the Closed list.
          </>
        ) : (
          <>
            <strong className="font-semibold text-foreground">
              Buildings view:
            </strong>{" "}
            each physical worship site is counted separately, including earlier
            churches and replacement buildings used by the same institution.
          </>
        )}
      </p>

      <section className="mt-3">{props.view}</section>
    </>
  );
}
