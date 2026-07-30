import type { Metadata } from "next";
import Link from "next/link";
import RegistryTable, { type RegistryRow } from "@/components/RegistryTable";
import { toScopedParish, usRegistryParishes } from "@/lib/registry-scope";
import { toGroup } from "@/lib/end-state";
import { resolveAlertStatus, resolveFate } from "@/lib/unified-status";

export const metadata: Metadata = {
  title: "The Record",
  description:
    "Every documented Lithuanian parish, mission, and congregation in the U.S. public record, with current status and source depth from the unified registry.",
};

function buildRows(): RegistryRow[] {
  return usRegistryParishes().map((p) => {
    const scoped = toScopedParish(p);
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
  });
}

export default function RecordPage() {
  const rows = buildRows();
  const total = rows.length;
  const romanCatholicParishes = rows.filter(
    (row) =>
      row.congregationClass === "roman_catholic" &&
      row.recordType === "parish",
  ).length;
  const romanCatholicMissions = rows.filter(
    (row) =>
      row.congregationClass === "roman_catholic" &&
      row.recordType === "misija",
  ).length;
  const nationalIndependent = rows.filter(
    (row) =>
      row.congregationClass === "national_catholic_pncc" ||
      row.congregationClass === "independent_catholic",
  ).length;
  const protestant = rows.filter(
    (row) => row.congregationClass === "non_catholic_christian",
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-3xl font-semibold">The Record</h1>
      <div className="mt-3 space-y-4 leading-relaxed max-w-3xl">
        <p>
          {total} records of Lithuanian parish life across the United States:{" "}
          {romanCatholicParishes} Roman Catholic parishes,{" "}
          {romanCatholicMissions} Roman Catholic missions,{" "}
          {nationalIndependent} National or independent Catholic communities,
          and {protestant} Protestant communities.
        </p>
        <p className="text-muted">
          The record extends backward through the archives toward the first
          parishes of the 1880s and forward through{" "}
          <Link href="/report" className="underline hover:text-accent">
            reports from parish communities
          </Link>{" "}
          today.
        </p>
      </div>

      <div className="mt-8">
        <RegistryTable rows={rows} />
      </div>

      <p className="mt-10 max-w-2xl border-t border-rule pt-5 text-sm leading-relaxed text-muted">
        The newspapers, books, official records, current reporting, source
        hierarchy, and citation rules behind every entry are documented in{" "}
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
