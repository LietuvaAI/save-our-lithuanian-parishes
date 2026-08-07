"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

type Mode = "institutions" | "buildings";

export default function OutcomeModeExplorer({
  institutionCount,
  parishCount,
  missionCount,
  closedCount,
  currentWorshipPlaces,
  publicInstitutionCount,
  physicalSiteCount,
  demolishedSiteCount,
  repurposedSiteCount,
  standingSiteCount,
  listedSiteCount,
  unestablishedSiteCount,
  revision,
  generated,
  institutionView,
  buildingView,
}: {
  institutionCount: number;
  parishCount: number;
  missionCount: number;
  closedCount: number;
  currentWorshipPlaces: number;
  publicInstitutionCount: number;
  physicalSiteCount: number;
  demolishedSiteCount: number;
  repurposedSiteCount: number;
  standingSiteCount: number;
  listedSiteCount: number;
  unestablishedSiteCount: number;
  revision: string;
  generated: string;
  institutionView: ReactNode;
  buildingView: ReactNode;
}) {
  const [mode, setMode] = useState<Mode>("institutions");
  const institutions = mode === "institutions";

  return (
    <>
      <h1 className="font-serif text-[clamp(26px,3vw,34px)] font-semibold leading-[1.08]">
        The State of Lithuanian Catholic Parishes in America
      </h1>

      {institutions ? (
        <p className="mt-2 max-w-[90ch] text-[15px] leading-relaxed">
          Of <strong>{institutionCount}</strong> Lithuanian Roman Catholic
          parishes and missions, <strong>{closedCount}</strong> have closed;
          Lithuanian worship continues at <strong>{currentWorshipPlaces}</strong>.
        </p>
      ) : (
        <p className="mt-2 max-w-[90ch] text-[15px] leading-relaxed">
          The record identifies <strong>{physicalSiteCount}</strong> physical
          worship sites: <strong>{standingSiteCount}</strong> standing, {" "}
          <strong>{demolishedSiteCount}</strong> demolished, {" "}
          <strong>{repurposedSiteCount}</strong> repurposed, {" "}
          <strong>{listedSiteCount}</strong> listed for sale or redevelopment,
          and {" "}
          <strong>{unestablishedSiteCount}</strong> whose present condition is
          not yet established.
        </p>
      )}

      <section className="mt-3 border-y border-rule py-3">
        <h2 className="font-serif text-[16px] font-semibold">How to read this</h2>
        {institutions ? (
          <p className="mt-1 max-w-[90ch] text-[13.5px] leading-relaxed">
            Every line is one institution&mdash;one parish or mission, counted
            once&mdash;running from the decade it began to where it stands
            today. This view follows {parishCount} U.S. Roman Catholic parishes
            and {missionCount} missions. Closed institutions fan out by the
            known condition of the church they last used, but institution and
            building outcomes remain separate facts; earlier churches and
            multiple sites are counted in Buildings mode. Other traditions,
            research-only records, and Canadian comparators are outside this
            population; all {publicInstitutionCount} published U.S. profiles
            are in the {" "}
            <Link href="/parishes" className="underline hover:text-accent">
              full directory
            </Link>
            .
          </p>
        ) : (
          <p className="mt-1 max-w-[90ch] text-[13.5px] leading-relaxed">
            Every row is one physical church or worship site. A parish or
            mission may have used several buildings, and one building may have
            served more than one congregation. Building conditions come only
            from canonical site assertions; &ldquo;not yet established&rdquo; is
            a research gap, not an outcome. Switch to Parishes &amp; missions
            to follow each institution once.
          </p>
        )}
        <p className="mt-1.5 max-w-[90ch] text-[12.5px] leading-relaxed text-muted">
          Canonical projection {revision}, generated {generated}.
        </p>
      </section>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-serif text-section-title font-semibold">
          {institutions ? "Institution by institution" : "Building by building"}
        </h2>
        <div
          className="inline-flex overflow-hidden rounded-md border border-rule bg-background p-0.5 text-[13px] font-semibold"
          role="group"
          aria-label="Choose an outcomes view"
        >
          <button
            type="button"
            onClick={() => setMode("institutions")}
            aria-pressed={institutions}
            className={`rounded px-3 py-1.5 transition-colors ${
              institutions
                ? "bg-foreground text-background"
                : "text-muted hover:bg-band hover:text-foreground"
            }`}
          >
            Parishes &amp; missions · {institutionCount}
          </button>
          <button
            type="button"
            onClick={() => setMode("buildings")}
            aria-pressed={!institutions}
            className={`rounded px-3 py-1.5 transition-colors ${
              institutions
                ? "text-muted hover:bg-band hover:text-foreground"
                : "bg-foreground text-background"
            }`}
          >
            Church buildings · {physicalSiteCount}
          </button>
        </div>
      </div>

      <section className="mt-3">
        <div hidden={!institutions}>{institutionView}</div>
        <div hidden={institutions}>{buildingView}</div>
      </section>
    </>
  );
}
