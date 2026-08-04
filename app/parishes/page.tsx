import type { Metadata } from "next";
import Link from "next/link";
import RegistryTable, { type RegistryRow } from "@/components/RegistryTable";
import siteFigures from "@/data/site-figures.json";
import { toScopedParish, usRegistryParishes } from "@/lib/registry-scope";
import { toGroup } from "@/lib/end-state";
import { resolveAlertStatus, resolveFate } from "@/lib/unified-status";

export const metadata: Metadata = {
  title: "All Parish Profiles",
  description:
    "A searchable directory of every published U.S. Lithuanian parish, mission, and congregation profile in the canonical public record.",
};

function buildRows(): RegistryRow[] {
  return usRegistryParishes().map((parish) => {
    const scoped = toScopedParish(parish);
    return {
      slug: scoped.slug,
      name: scoped.name,
      city: scoped.city,
      state: scoped.state,
      country: scoped.country,
      recordType: scoped.recordType,
      comparator: scoped.comparator,
      endState: scoped.endState,
      statusGroup: toGroup(scoped.endState),
      alert: resolveAlertStatus(scoped.alertKind, scoped.onWatch),
      fate: resolveFate(scoped.buildingFate),
      founded: scoped.founded == null ? null : String(scoped.founded),
      closed: scoped.closed == null ? null : String(scoped.closed),
      depth: scoped.recordDepth,
      congregationClass: scoped.congregationClass,
      ownership: scoped.ownership,
      diocese: scoped.diocese,
      profileHref: scoped.profileHref,
    };
  }).sort((a, b) =>
    a.name.localeCompare(b.name, "lt", { sensitivity: "base" }),
  );
}

export default function ParishProfilesPage() {
  const rows = buildRows();
  const total = siteFigures.publicUS.records;
  const romanCatholicParishes = siteFigures.publicUS.romanCatholicParishes;
  const romanCatholicMissions = siteFigures.publicUS.romanCatholicMissions;
  const otherCommunities =
    siteFigures.publicUS.nationalIndependentCatholicCommunities +
    siteFigures.publicUS.protestantCommunities;

  if (rows.length !== total || rows.some((row) => row.profileHref === null)) {
    throw new Error(
      "The parish profile directory does not match the canonical publication projection.",
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Profile directory
      </p>
      <h1 className="mt-1 font-serif text-3xl font-semibold sm:text-4xl">
        All Parish Profiles
      </h1>
      <div className="mt-3 max-w-3xl space-y-4 leading-relaxed">
        <p>
          Open any of the {total} published U.S. profiles: {romanCatholicParishes}{" "}
          Roman Catholic parishes, {romanCatholicMissions} Roman Catholic
          missions, and {otherCommunities} National Catholic, independent
          Catholic, or Protestant communities.
        </p>
        <p className="text-muted">
          This page is the alphabetical reference directory. To understand how
          the Roman Catholic parish and mission population changed over time,
          start with{" "}
          <Link
            href="/where-every-parish-ended-up"
            className="font-medium text-foreground underline underline-offset-4 hover:text-accent"
          >
            Where Parishes and Missions Ended Up
          </Link>
          .
        </p>
      </div>

      <div className="mt-8">
        <RegistryTable rows={rows} noun="profiles" />
      </div>

      <p className="mt-10 max-w-2xl border-t border-rule pt-5 text-sm leading-relaxed text-muted">
        Every directory row and profile route is generated from the canonical
        publication projection. The source hierarchy and citation rules are
        documented in{" "}
        <Link
          href="/about/sources-and-archives"
          className="font-medium text-foreground underline underline-offset-4 hover:text-accent"
        >
          Sources &amp; Archives
        </Link>
        .
      </p>
    </div>
  );
}
