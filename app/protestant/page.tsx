import type { Metadata } from "next";
import Link from "next/link";
import contextPointsData from "@/data/context-points.json";
import registry from "@/data/registry-unified.json";
import { EndStatePill } from "@/components/EndStatePill";
import RecordLensMap, {
  type RecordLensPoint,
} from "@/components/RecordLensMap";
import {
  isPublicRecord,
  isUS,
  toScopedParish,
  type RegParish,
} from "@/lib/registry-scope";
import { canonicalProfileHrefForRegistrySlug } from "@/lib/parish-profile";
import type { EndState, EndStateGroup } from "@/lib/end-state";
import {
  recordMarkColor,
  recordMarkShape,
} from "@/lib/record-mark";

export const metadata: Metadata = {
  title: "Lithuanian Protestant and independent congregations",
  description:
    "The Lithuanian Protestant and independent congregations documented in the research record — Lutheran, Reformed, Baptist, and independent communities that were part of the full geography of Lithuanian religious life in America. Historical witness.",
};

type RecSource = {
  axis?: string;
  sourceUrl?: string;
  ethnic_status?: string;
  currentStatus?: string;
};
type Rec = Omit<RegParish, "names" | "sources" | "locked"> & {
  names: RegParish["names"] & { variants?: string[] };
  sources?: RecSource[];
  locked?: RegParish["locked"] & { status?: string };
  city_history?: string[];
  name_variants?: string[];
};
type ContextPoint = {
  slug: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
  group: EndStateGroup;
  congregationClass: string | null;
  href: string | null;
};

const CONGS = (registry as { parishes: Rec[] }).parishes.filter(
  (p) =>
    p.congregation_class === "non_catholic_christian" &&
    isUS(p) &&
    isPublicRecord(p),
);
const sourcesOf = (c: Rec): RecSource[] => c.sources ?? [];
const statusForCongregation = (c: Rec): EndState =>
  toScopedParish(c as RegParish).endState;
const activeCongregations = CONGS.filter(
  (congregation) => statusForCongregation(congregation) === "active_parish",
);
const transferredCongregations = CONGS.filter(
  (congregation) => statusForCongregation(congregation) === "transferred",
);
const unverifiedCongregations = CONGS.filter(
  (congregation) => statusForCongregation(congregation) === "unverified",
);
const congregationHrefs = new Set(
  CONGS.map(
    (congregation) =>
      canonicalProfileHrefForRegistrySlug(congregation.slug) ??
      `/parishes/${congregation.slug}`,
  ),
);
const protestantMapPoints = (contextPointsData.points as ContextPoint[])
  .filter((point) => point.href && congregationHrefs.has(point.href))
  .map(
    (point): RecordLensPoint => ({
      ...point,
      color: recordMarkColor(point.group),
      shape: recordMarkShape(point.congregationClass),
      detail:
        point.group === "active_parish"
          ? "active Lithuanian parish"
          : point.group === "transferred"
            ? "congregation continues; Lithuanian identity ended"
            : "current Lithuanian status being verified",
    }),
  );

function sourceLabel(axis: string): string {
  const LABELS: Record<string, string> = {
    "draugas-registry-1909-2007": "Draugas archive (1909–2007)",
    "draugas-2008-2026": "Draugas archive (2008–2026)",
    wolkovich: "Wolkovich-Valkavičius (1998)",
    "michelsonas-1961": "Michelsonas (1961)",
    truelithuania: "Global True Lithuania field survey",
    "web-historical": "Current and web research",
  };
  return LABELS[axis] ?? axis;
}

function CongCard({ c }: { c: Rec }) {
  const axes = [...new Set(sourcesOf(c).map((s) => s.axis).filter(Boolean))] as string[];
  const status = statusForCongregation(c);
  const name = c.names?.lt || c.names?.en || c.name_variants?.[0] || c.slug;
  const currentCity = c.city ?? c.city_history?.[0] ?? "";
  const isChicagoArea =
    !currentCity.startsWith("Chicago") &&
    c.city_history?.some((location) => location.startsWith("Chicago"));
  const city = isChicagoArea ? `Chicago area · ${currentCity}` : currentCity;
  const locationNote = c.record_depth !== "case-filed" && c.city_history?.length
    ? `Earlier locations: ${c.city_history.join(" · ")}`
    : null;
  const tl = sourcesOf(c).find((s) => s.axis === "truelithuania");
  const nameVariants = (c.name_variants ?? c.names?.variants ?? []).filter(
    (v: string) => v !== name
  );
  const profileHref =
    canonicalProfileHrefForRegistrySlug(c.slug) ?? `/parishes/${c.slug}`;
  return (
    <div className="rounded-lg border border-rule px-4 py-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Link
          href={profileHref}
          className="font-serif text-base font-semibold hover:underline"
        >
          {name}
        </Link>
        <div className="flex items-center gap-2">
          <EndStatePill value={status} />
          <span className="text-sm text-muted">
            {city}, {c.state}
          </span>
        </div>
      </div>

      {nameVariants.length > 0 && (
        <p className="mt-1 text-xs text-muted">
          Also: {nameVariants.join(" · ")}
        </p>
      )}

      {locationNote && (
        <p className="mt-0.5 text-xs text-muted italic">{locationNote}</p>
      )}

      <p className="mt-2 text-xs text-muted">
        Sources:{" "}
        {axes.map((a, i) => (
          <span key={a}>
            {i > 0 && " · "}
            {sourceLabel(a)}
          </span>
        ))}
      </p>

      {tl?.sourceUrl && (
        <p className="mt-1 text-xs">
          <a
            href={tl.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Global True Lithuania field survey →
          </a>
        </p>
      )}

      <p className="mt-2 text-xs">
        <Link
          href={profileHref}
          className="underline hover:text-foreground"
        >
          Full research record →
        </Link>
      </p>
    </div>
  );
}

export default function ProtestantPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase text-muted">
        Tradition view
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        Lithuanian Protestant and independent congregations
      </h1>
      <p className="mt-4 max-w-3xl font-serif text-xl leading-relaxed sm:text-2xl">
        Where did Lithuanian Protestant congregations take root, and what
        remains alive?
      </p>

      <section className="mt-10 border-y border-rule py-8">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
          <RecordLensMap
            points={protestantMapPoints}
            ariaLabel={`${CONGS.length} Lithuanian Protestant parish and congregation records in the United States`}
            legend={[
              {
                label: `Active Lithuanian parish · ${activeCongregations.length}`,
                color: recordMarkColor("active_parish"),
                shape: "square",
              },
              {
                label: `Lives on, another community · ${transferredCongregations.length}`,
                color: recordMarkColor("transferred"),
                shape: "square",
              },
              {
                label: `Being verified · ${unverifiedCongregations.length}`,
                color: recordMarkColor("unverified"),
                shape: "square",
              },
            ]}
          />
          <div>
            <p className="font-serif text-6xl font-semibold leading-none">
              {activeCongregations.length}
            </p>
            <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight">
              Lithuanian Protestant parish remains active
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              Tėviškės Parish in Darien, Illinois, is the congregation whose
              present Lithuanian parish life remains active.
            </p>
          </div>
        </div>
        <p className="mt-5 border-t border-rule pt-3 text-xs leading-relaxed text-muted">
          Scope: {CONGS.length} public U.S. Protestant parish and congregation
          records · Registry Revision {registry.registryRevision.version},{" "}
          {registry.registryRevision.date}
          {" · "}
          <Link href="/about-the-data" className="underline hover:text-accent">
            About the data
          </Link>
        </p>
      </section>

      <section className="mt-10 max-w-3xl border-l-4 border-rule py-1 pl-4 text-sm leading-relaxed">
        <h2 className="font-serif text-lg font-semibold">
          Lithuanian Lutheranism in America
        </h2>
        <p className="mt-2 text-muted">
          The tradition grew from Prussian Lithuanian communities of the
          Klaipėda region. Congregations in Illinois and Connecticut maintained
          their own governance and Lithuanian worship alongside the much larger
          Catholic diaspora.
        </p>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-serif text-2xl font-semibold">
          Active Lithuanian parish · {activeCongregations.length}
        </h2>
        <div className="mt-4 space-y-4">
          {activeCongregations.map((c) => (
            <CongCard key={c.slug} c={c} />
          ))}
        </div>
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="font-serif text-2xl font-semibold">
          Lives on, another community · {transferredCongregations.length}
        </h2>
        <p className="mt-1 text-sm text-muted">
          The institution continues, but current Lithuanian identity or worship
          does not.
        </p>
        <div className="mt-4 space-y-4">
          {transferredCongregations.map((c) => (
            <CongCard key={c.slug} c={c} />
          ))}
        </div>
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="font-serif text-2xl font-semibold">
          Being verified · {unverifiedCongregations.length}
        </h2>
        <p className="mt-1 text-sm text-muted">
          These congregations are documented in historical sources, but their
          current operating status has not yet been confirmed. They are not
          classified as closed unless a source records a closure.
        </p>
        <div className="mt-4 space-y-4">
          {unverifiedCongregations.map((c) => (
            <CongCard key={c.slug} c={c} />
          ))}
        </div>
      </section>

    </article>
  );
}
