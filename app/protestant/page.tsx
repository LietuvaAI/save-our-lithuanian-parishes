import type { Metadata } from "next";
import Link from "next/link";
import registry from "@/data/registry-unified.json";
import { EndStatePill } from "@/components/EndStatePill";
import {
  isPublicRecord,
  isUS,
  type RegParish,
} from "@/lib/registry-scope";
import { canonicalProfileHrefForRegistrySlug } from "@/lib/parish-profile";

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

const CONGS = (registry as { parishes: Rec[] }).parishes.filter(
  (p) =>
    p.congregation_class === "non_catholic_christian" &&
    isUS(p) &&
    isPublicRecord(p),
);
const sourcesOf = (c: Rec): RecSource[] => c.sources ?? [];
const isConfirmedActive = (c: Rec): boolean =>
  c.locked?.status === "standing" ||
  sourcesOf(c).some((s) => s.currentStatus === "standing");

const confirmed = CONGS.filter(isConfirmedActive);
const historical = CONGS.filter((c) => !isConfirmedActive(c));

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
  const active = isConfirmedActive(c);
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
          <EndStatePill value={active ? "active_parish" : "unverified"} />
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
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        The research record
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        Lithuanian Protestant and independent congregations
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        The majority of Lithuanian immigrants to the United States came from
        the predominantly Catholic regions of Lithuania. But the record also
        documents a smaller, distinct current: Lithuanian evangelical Lutheran
        congregations, Reformed and Baptist communities, and independent
        schismatic groups that did not follow either Rome or the{" "}
        <Link href="/national-catholic" className="underline hover:text-foreground">
          Polish National Catholic Church
        </Link>
        . These are part of the full geography of Lithuanian religious life in
        America — documented here as historical witness alongside the Catholic record.
      </p>

      {/* Active congregations */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          {confirmed.length} active congregations
        </h2>
        <p className="mt-1 text-sm text-muted">
          Current and case-file evidence identifies these as the standing
          Lithuanian Lutheran congregations in the United States.
        </p>
        <div className="mt-4 space-y-4">
          {confirmed.map((c) => (
            <CongCard key={c.slug} c={c} />
          ))}
        </div>
      </section>

      {/* Context box */}
      <section className="mt-8 rounded-lg border border-rule px-5 py-4 text-sm leading-relaxed space-y-2">
        <h2 className="font-serif text-base font-semibold">
          Lithuanian Lutheranism in America
        </h2>
        <p className="text-muted">
          The Lithuanian Lutheran tradition in America is rooted in the
          Prussian Lithuanian communities of the Klaipėda region, where
          Lutheranism had been the dominant faith since the Reformation.
          Immigrant communities in Illinois and Connecticut maintained their
          own congregations and Lithuanian-language worship, distinct from
          the largely Catholic Lithuanian-American mainstream. Two of the four
          confirmed congregations are in the Chicago area, reflecting the
          deep roots of Lithuanian community life there.
        </p>
        <p className="text-muted">
          Wolkovich-Valkavičius documented these congregations in{" "}
          <em>Lithuanian Religious Life in America</em> (Vol. 3, 1998) alongside
          the Catholic parishes, recognizing that the full record of Lithuanian
          religious life in America cannot be told without them. The{" "}
          <em>Draugas</em> archive, the Lithuanian Catholic daily, also
          occasionally noted their activities as part of Lithuanian community
          news.
        </p>
      </section>

      {/* Historical record */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          {historical.length} additional congregations — current status unverified
        </h2>
        <p className="mt-1 text-sm text-muted">
          These congregations are documented in historical sources, but their
          current operating status has not yet been confirmed. They are not
          classified as closed unless a source records a closure.
        </p>
        <div className="mt-4 space-y-4">
          {historical.map((c) => (
            <CongCard key={c.slug} c={c} />
          ))}
        </div>
      </section>

      {/* Data note */}
      <section className="mt-10 rounded-lg border border-rule px-4 py-3.5 text-sm text-muted leading-relaxed">
        <p>
          Every congregation retains its source ledger and current-status
          confidence. Historical attestation is not treated as proof that a
          congregation remains active. See{" "}
          <Link
            href="/about/sources-and-archives"
            className="underline hover:text-foreground"
          >
            Sources &amp; Archives
          </Link>
          {" "}for the evidence hierarchy. See a congregation missing?{" "}
          <Link href="/report" className="underline hover:text-foreground">
            Report it
          </Link>
          .
        </p>
      </section>

      <p className="mt-8 text-sm text-muted">
        <Link href="/" className="underline hover:text-foreground">
          ← Back to the map
        </Link>
        {" · "}
        <Link href="/national-catholic" className="underline hover:text-foreground">
          National Catholic parishes
        </Link>
        {" · "}
        <Link href="/record" className="underline hover:text-foreground">
          The full record
        </Link>
      </p>
    </article>
  );
}
