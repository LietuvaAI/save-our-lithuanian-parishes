import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import registry from "@/data/registry-unified.json";

/* Research-record profile pages: every non-canonical parish in the unified
   registry gets a page built purely from cited source facts. No status
   verdicts are derived here — sources are quoted, conflicts are shown. */

type Rec = (typeof registry.parishes)[number] & Record<string, any>;

const researchRecords: Rec[] = (registry.parishes as Rec[]).filter(
  (p) => !p.c83_row
);

const CLASS_LABEL: Record<string, string> = {
  roman_catholic: "Roman Catholic parish",
  national_catholic_pncc:
    "Lithuanian National Catholic parish — documented as historical witness",
  independent_catholic:
    "Independent Catholic parish — documented as historical witness",
};

const AXIS_LABEL: Record<string, string> = {
  "draugas-registry-1909-2007": "Draugas archive, 1909–2007 (systematic sweep)",
  "draugas-jubilee-implied": "Draugas jubilee-implied dating",
  "michelsonas-1961":
    "Michelsonas, Lietuvių Išeivija Amerikoje (1868–1961), Keleivis, 1961",
  wolkovich:
    "Wolkovich-Valkavičius, Lithuanian Religious Life in America, Vol. 3 (1998)",
  "web-historical": "Contemporary web survey (2026)",
  truelithuania: "Global True Lithuania field survey",
};

export function generateStaticParams() {
  return researchRecords.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = researchRecords.find((r) => r.slug === slug);
  if (!p) return {};
  const name = p.names.lt || p.names.en || "Lithuanian parish";
  return {
    title: `${name} — ${p.city}, ${p.state}`,
    description: `Research record for ${name}, ${p.city}, ${p.state}: every documented fact with its source, from the unified registry of America's Lithuanian parishes.`,
  };
}

function YearList({ label, items }: { label: string; items: any[] }) {
  if (!items?.length) return null;
  const differ = new Set(items.map((v) => v.value)).size > 1;
  return (
    <div>
      <span className="font-medium">{label}:</span>{" "}
      {items.map((v, i) => (
        <span key={i}>
          {i > 0 && " · "}
          {v.value}{" "}
          <span className="text-muted text-sm">
            ({AXIS_LABEL[v.source] ? AXIS_LABEL[v.source].split(",")[0] : v.source}
            {v.cite ? `, ${v.cite}` : ""})
          </span>
        </span>
      ))}
      {differ && (
        <span className="ml-2 rounded border border-rule px-1.5 py-px text-xs text-muted">
          sources differ — all readings kept
        </span>
      )}
    </div>
  );
}

export default async function RegistryParishPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = researchRecords.find((r) => r.slug === slug);
  if (!p) notFound();
  const name = p.names.lt || p.names.en || "Lithuanian parish";
  const altName = p.names.lt && p.names.en ? p.names.en : null;
  const variants = (p.names.variants || []).filter(
    (v: string) => v && v !== name && v !== altName
  );
  const axes = [...new Set(p.sources.map((s: any) => s.axis))] as string[];

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        The research record
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        {name}
      </h1>
      <p className="mt-2 text-lg text-muted">
        {altName ? `${altName} · ` : ""}
        {p.city}
        {p.state ? `, ${p.state}` : ""}
        {p.country === "CA" ? " (Canada)" : ""}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium">
          {CLASS_LABEL[p.congregation_class] ?? p.congregation_class}
        </span>
        <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
          {p.record_depth === "multi-source"
            ? `multi-source — documented independently in ${axes.length} sources`
            : "single-source — documented in one source so far"}
        </span>
      </div>

      <div className="mt-6 space-y-2 leading-relaxed">
        <YearList label="Founded" items={p.years?.founded} />
        <YearList label="Closed" items={p.years?.closed} />
        {variants.length > 0 && (
          <div>
            <span className="font-medium">Also recorded as:</span>{" "}
            <span className="text-muted">{variants.join(" · ")}</span>
          </div>
        )}
      </div>

      {p.conflicts?.length > 0 && (
        <section className="mt-6 rounded-lg border border-rule px-4 py-3 text-sm">
          <p className="font-medium">Where the sources disagree</p>
          {p.conflicts.map((c: any, i: number) => (
            <div key={i} className="mt-2 text-muted">
              <span className="font-medium text-foreground">{c.field}:</span>{" "}
              {(c.variants || [])
                .map((v: any) => `${v.value} (${v.source}${v.cite ? `, ${v.cite}` : ""})`)
                .join(" · ")}
              {c.note && <div className="mt-1 italic">{c.note}</div>}
            </div>
          ))}
          <p className="mt-2 text-xs text-muted">
            Conflicts are data: we keep every reading with its citation rather
            than picking one.
          </p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">
          Documented in {axes.length} {axes.length === 1 ? "source" : "sources"}
        </h2>
        <div className="mt-3 space-y-3">
          {p.sources.map((s: any, i: number) => (
            <div key={i} className="rounded-lg border border-rule px-4 py-3 text-sm">
              <p className="font-medium">{AXIS_LABEL[s.axis] ?? s.axis}</p>
              <p className="mt-1 text-muted leading-relaxed">
                {s.axis === "draugas-registry-1909-2007" && (
                  <>
                    Attested {s.first_mention?.slice(0, 10)}
                    {s.last_mention ? ` through ${s.last_mention.slice(0, 10)}` : ""}
                    {s.total_mentions ? ` · ${s.total_mentions} corpus pages` : ""}
                    {s.parish_key ? ` · registry key ${s.parish_key}` : ""}
                  </>
                )}
                {(s.axis === "wolkovich" || s.axis === "michelsonas-1961") && (
                  <>
                    {s.pages ? `Cited at ${s.pages}. ` : ""}
                    {s.ethnic_status && !/^(none|unknown|unspecified)$/i.test(s.ethnic_status)
                      ? `Recorded status: ${s.ethnic_status}. `
                      : ""}
                    {s.diocese && !/^(none|unknown|unspecified)$/i.test(s.diocese)
                      ? `Diocese: ${s.diocese}. `
                      : ""}
                    In-copyright work — facts cited by page, text never
                    republished; find it through a library catalog.
                  </>
                )}
                {s.axis === "web-historical" && (
                  <>
                    {s.confidence ? `Survey confidence: ${s.confidence}. ` : ""}
                    {s.currentStatus ? `Surveyed status: ${s.currentStatus}. ` : ""}
                    {s.ownership ? `Surveyed ownership: ${s.ownership}.` : ""}
                  </>
                )}
                {s.axis === "truelithuania" && (
                  <>
                    {s.statusFlags ? `Survey flags: ${JSON.stringify(s.statusFlags)}. ` : ""}
                    {s.yearsMentioned ? `Years mentioned: ${s.yearsMentioned}. ` : ""}
                    {s.sourceUrl && (
                      <a
                        href={s.sourceUrl}
                        className="underline hover:text-accent"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        field-survey source
                      </a>
                    )}
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-rule px-4 py-3.5 text-sm text-muted">
        <p>
          <span className="font-medium text-foreground">
            This record is still climbing the ladder.
          </span>{" "}
          Every parish in the record will, in time, carry its own researched
          case file — the deep dives proceed parish by parish. If you know
          this parish — a history, a photograph, an anniversary book, a
          correction —{" "}
          <Link href="/report" className="underline hover:text-foreground">
            tell us
          </Link>
          . How this registry is built:{" "}
          <Link href="/about-the-data" className="underline hover:text-foreground">
            About the data
          </Link>
          .
        </p>
      </section>

      <p className="mt-8 text-sm text-muted">
        <Link href="/" className="underline hover:text-foreground">
          ← Back to the map
        </Link>{" "}
        ·{" "}
        <Link href="/registry" className="underline hover:text-foreground">
          all research-record parishes
        </Link>
      </p>
    </article>
  );
}
