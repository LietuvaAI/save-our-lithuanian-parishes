import type { Metadata } from "next";
import Link from "next/link";
import congregationsData from "@/data/non-catholic-congregations.json";

export const metadata: Metadata = {
  title: "Lithuanian Protestant and independent congregations",
  description:
    "The Lithuanian Protestant and independent congregations documented in the research record — Lutheran, Reformed, Baptist, and independent communities that were part of the full geography of Lithuanian religious life in America. Historical witness.",
};

type Cong = (typeof congregationsData.congregations)[number] & Record<string, any>;
const CONGS = congregationsData.congregations as Cong[];

// Congregations with TrueLithuania field survey geo have confirmed present-day addresses
const confirmed = CONGS.filter((c) =>
  c.sources.some((s: any) => s.axis === "truelithuania")
);
const historical = CONGS.filter(
  (c) => !c.sources.some((s: any) => s.axis === "truelithuania")
);

function sourceLabel(axis: string): string {
  const LABELS: Record<string, string> = {
    "draugas-registry-1909-2007": "Draugas archive (1909–2007)",
    wolkovich: "Wolkovich-Valkavičius (1998)",
    "michelsonas-1961": "Michelsonas (1961)",
    truelithuania: "Global True Lithuania field survey",
  };
  return LABELS[axis] ?? axis;
}

function CongCard({ c }: { c: Cong }) {
  const axes = [...new Set(c.sources.map((s: any) => s.axis))] as string[];
  const hasField = axes.includes("truelithuania");
  const city = c.city_history?.[0] ?? c.city ?? "";
  const locationNote =
    c.city_history && c.city_history.length > 1
      ? `Now ${c.city} (formerly ${c.city_history.slice(1).join(", ")})`
      : null;
  const tl = c.sources.find((s: any) => s.axis === "truelithuania") as any;
  return (
    <div className="rounded-lg border border-rule px-4 py-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-serif text-base font-semibold">{c.name}</span>
        <div className="flex items-center gap-2">
          {hasField && (
            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
              Confirmed active
            </span>
          )}
          <span className="text-sm text-muted">
            {city}, {c.state}
          </span>
        </div>
      </div>

      {c.name_variants?.filter((v: string) => v !== c.name).length > 0 && (
        <p className="mt-1 text-xs text-muted">
          Also: {c.name_variants.filter((v: string) => v !== c.name).join(" · ")}
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
          {confirmed.length} congregations with confirmed present addresses
        </h2>
        <p className="mt-1 text-sm text-muted">
          These congregations were documented at their current addresses by the
          Global True Lithuania field survey and are corroborated by the{" "}
          <em>Draugas</em> archive or Wolkovich. They are the four standing
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
          the largely Catholic Lithuanian-American mainstream. Three of the
          four confirmed congregations are in the Chicago area, reflecting the
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
          {historical.length} additional congregations — historical record only
        </h2>
        <p className="mt-1 text-sm text-muted">
          Documented in one or two sources; no contemporary field survey
          confirmation. These include Reformed, Baptist, and independent
          communities recorded by Wolkovich and Michelsonas.
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
          <span className="font-medium text-foreground">Sources and method.</span>{" "}
          These entries draw from Wolkovich-Valkavičius,{" "}
          <em>Lithuanian Religious Life in America</em>, Vol. 3 (1998);
          Michelsonas, <em>Lietuvių Išeivija Amerikoje</em> (1961); the
          systematic sweep of the <em>Draugas</em> archive since 1909; and
          the Global True Lithuania field survey. All {CONGS.length} congregations
          appear on the homepage map as distinct marks — hover any mark for
          its record. See a congregation missing?{" "}
          <Link href="/report" className="underline hover:text-foreground">
            Report it
          </Link>
          . Method:{" "}
          <Link href="/about-the-data" className="underline hover:text-foreground">
            About the data
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
        <Link href="/registry" className="underline hover:text-foreground">
          Full research record
        </Link>
      </p>
    </article>
  );
}
