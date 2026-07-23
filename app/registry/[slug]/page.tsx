import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import registry from "@/data/registry-unified.json";
import {
  draugasCitationUrl,
  draugasArchiveUrl,
  getSituationByRegistrySlug,
  type Ownership,
} from "@/lib/parishes";
import { ClassifierGrid } from "@/components/ClassifierGrid";

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

const RECORD_TYPE_LABEL: Record<string, string> = {
  parish: "Lithuanian parish (parapija)",
  misija: "Lithuanian mission (misija)",
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

// Patterns that indicate a community attended a non-Lithuanian parish, rather
// than being an independent Lithuanian national parish.
const SETTLEMENT_PATTERNS = [
  /not a distinct Lithuanian parish/i,
  /\bno parish\b/i,
  /\bsecular\b/i,
  /territorial parish attended by/i,
  /memorial chapel/i,
  /no distinct parish/i,
];

type CommunityKind = "settlement" | "parish";

function communityKind(sources: any[]): CommunityKind {
  for (const s of sources) {
    if (s.ethnic_status && SETTLEMENT_PATTERNS.some((p) => p.test(s.ethnic_status))) {
      return "settlement";
    }
  }
  return "parish";
}

function isYearValue(v: string) {
  return /^\d{4}(-\d{2}(-\d{2})?)?$/.test(String(v).trim());
}

function sourceShortName(axis: string) {
  return AXIS_LABEL[axis]?.split(",")[0] ?? axis;
}

function YearList({ label, items }: { label: string; items: any[] }) {
  if (!items?.length) return null;
  const yearItems = items.filter((v) => isYearValue(v.value));
  const noteItems = items.filter((v) => !isYearValue(v.value));
  const differ = new Set(yearItems.map((v) => v.value)).size > 1;
  return (
    <div className="space-y-1.5">
      {yearItems.length > 0 && (
        <div>
          <span className="font-medium">{label}:</span>{" "}
          {yearItems.map((v, i) => (
            <span key={i}>
              {i > 0 && " · "}
              {v.value}{" "}
              <span className="text-muted text-sm">
                ({sourceShortName(v.source)}
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
      )}
      {noteItems.map((v, i) => (
        <p key={`note-${i}`} className="text-sm leading-relaxed text-muted">
          {v.value}{" "}
          <span className="text-xs">
            — {sourceShortName(v.source)}
            {v.cite ? `, ${v.cite}` : ""}
          </span>
        </p>
      ))}
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
  // Primary print sources first, then newspaper archive, then secondary/web.
  const SOURCE_ORDER: Record<string, number> = {
    "wolkovich": 0,
    "michelsonas-1961": 1,
    "draugas-registry-1909-2007": 2,
    "draugas-2008-2026": 3,
    "draugas-jubilee-implied": 4,
    "web-historical": 5,
    "truelithuania": 6,
  };
  const sortedSources = [...p.sources].sort(
    (a: any, b: any) => (SOURCE_ORDER[a.axis] ?? 99) - (SOURCE_ORDER[b.axis] ?? 99)
  );
  const axes = [...new Set(sortedSources.map((s: any) => s.axis))] as string[];
  const kind = communityKind(p.sources);
  const situation = getSituationByRegistrySlug(slug);
  // Infer ownership from web-historical source if available
  const webSource = p.sources.find((s: any) => s.axis === "web-historical") as any;
  const ownership: Ownership | null =
    webSource?.ownership === "diocese_rc"
      ? "diocese_rc"
      : p.congregation_class === "national_catholic_pncc"
        ? "national_catholic"
        : null;

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
          {RECORD_TYPE_LABEL[p.record_type] ?? CLASS_LABEL[p.congregation_class] ?? p.congregation_class}
        </span>
        {p.record_type === "misija" && (
          <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
            canonical mission — dependent on a mother parish or diocese
          </span>
        )}
        {kind === "settlement" ? (
          <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
            Lithuanian community — not a distinct national parish
          </span>
        ) : p.congregation_class === "national_catholic_pncc" ? (
          <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
            separated from Rome — documented as historical witness
          </span>
        ) : p.congregation_class === "independent_catholic" ? (
          <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
            independent / schismatic — documented as historical witness
          </span>
        ) : p.record_type !== "misija" ? (
          <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
            Lithuanian ethnic parish
          </span>
        ) : null}
        <span className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-medium text-muted">
          {p.record_depth === "multi-source"
            ? `multi-source — documented independently in ${axes.length} sources`
            : "single-source — documented in one source so far"}
        </span>
      </div>

      {situation && (
        <>
          <p className="mt-5 text-lg leading-relaxed">{situation.situation}</p>
          <div className="mt-5">
            <ClassifierGrid
              situation={situation}
              ownership={ownership ?? "diocese_rc"}
              coalRegion={false}
            />
          </div>
        </>
      )}

      {p.caveat && (
        <div className="mt-4 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-muted leading-relaxed">
          <span className="font-medium text-foreground">Data note: </span>
          {p.caveat}
        </div>
      )}

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

      {kind === "settlement" && (
        <section className="mt-8 rounded-lg border border-rule px-4 py-4 text-sm leading-relaxed">
          <p className="font-medium text-foreground">Why this community is in the record</p>
          <p className="mt-2 text-muted">
            This entry documents a Lithuanian community that worshipped together
            — attending Mass, holding devotions, or maintaining a chapel — but
            was not organized as a distinct Lithuanian national parish of its
            own.{" "}
            <a
              href="https://archyvas.ziburioltmokykla.org/item/20260722_1784749031073"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Wolkovich-Valkavičius
            </a>{" "}
            recorded communities like this alongside canonical parishes because
            they represent the full lived geography of Lithuanian religious life
            in America: settlements, farm colonies, territorial parishes with
            Lithuanian attendees, and civic chapters with a sacramental dimension.
          </p>
          <p className="mt-2 text-muted">
            The map shows it as an unestablished-fate cross (
            <span className="font-mono">+</span>) rather than a filled dot.
            The research record preserves the source&#8217;s own characterization
            verbatim — quoted below.
          </p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">
          Documented in {axes.length} {axes.length === 1 ? "source" : "sources"}
        </h2>
        <div className="mt-3 space-y-3">
          {sortedSources.map((s: any, i: number) => (
            <div key={i} className="rounded-lg border border-rule px-4 py-3 text-sm">
              <p className="font-medium">{AXIS_LABEL[s.axis] ?? s.axis}</p>
              <p className="mt-1 text-muted leading-relaxed">
                {s.axis === "draugas-registry-1909-2007" && (
                  <span className="block space-y-1">
                    <span className="block">
                      First mentioned:{" "}
                      {s.first_mention ? (
                        <a
                          href={draugasCitationUrl(s.first_mention)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-accent"
                        >
                          {s.first_mention.slice(0, 10)}
                        </a>
                      ) : "not recorded"}
                      {s.last_mention && s.last_mention !== s.first_mention && (
                        <>
                          {" · "}Last mentioned:{" "}
                          <a
                            href={draugasCitationUrl(s.last_mention)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-accent"
                          >
                            {s.last_mention.slice(0, 10)}
                          </a>
                        </>
                      )}
                      {s.total_mentions ? ` · ${s.total_mentions} issues` : ""}
                    </span>
                    <span className="block text-xs italic">
                      Links open the <em>Draugas</em> issue PDF (2008–2021) or the{" "}
                      <a
                        href={s.first_mention ? draugasArchiveUrl(s.first_mention) : "https://www.draugas.org"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-accent"
                      >
                        year archive
                      </a>{" "}
                      (pre-2008 and post-2021). Last mention is not a closure date —
                      it marks when <em>Draugas</em> last reported on this parish.
                    </span>
                  </span>
                )}
                {(s.axis === "wolkovich" || s.axis === "michelsonas-1961") && (
                  <span className="block space-y-2">
                    {s.ethnic_status && !/^(none|unknown|unspecified)$/i.test(s.ethnic_status) && (
                      <span className="block italic leading-relaxed">
                        &ldquo;{s.ethnic_status}&rdquo;
                      </span>
                    )}
                    {/* Narrative founding notes from this source */}
                    {(p.years?.founded || [])
                      .filter((f: any) => f.source === s.axis && !isYearValue(f.value))
                      .map((f: any, fi: number) => (
                        <span key={fi} className="block leading-relaxed">
                          {f.value}
                        </span>
                      ))}
                    {s.diocese && !/^(none|unknown|unspecified)$/i.test(s.diocese) && (
                      <span className="block text-xs">Diocese: {s.diocese}.</span>
                    )}
                    {s.school && (
                      <span className="block text-xs">School: {s.school}.</span>
                    )}
                    {s.convent && (
                      <span className="block text-xs">Convent: {s.convent}.</span>
                    )}
                    {s.cemetery && (
                      <span className="block text-xs">Cemetery: {s.cemetery}.</span>
                    )}
                    {s.axis === "michelsonas-1961" && s.lens && (
                      <span className="block text-xs text-muted italic">
                        Note: {s.lens}
                      </span>
                    )}
                    <span className="block text-xs">
                      {s.axis === "wolkovich" ? (
                        <>
                          <a
                            href="https://archyvas.ziburioltmokykla.org/item/20260722_1784749031073"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-accent"
                          >
                            Wolkovich-Valkavičius, <em>Lithuanian Religious Life in America</em>, Vol. 3 (1998)
                          </a>
                          {s.pages ? `, ${s.pages}` : ""}
                        </>
                      ) : (
                        <>
                          <a
                            href="https://archyvas.ziburioltmokykla.org/item/20260225_lietuviu_iseivija_amerikoje"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-accent"
                          >
                            Michelsonas, <em>Lietuvių Išeivija Amerikoje</em> (1868–1961), Keleivis, 1961
                          </a>
                          {s.pages ? `, ${s.pages}` : ""}
                        </>
                      )}
                    </span>
                  </span>
                )}
                {s.axis === "web-historical" && (
                  <span className="block space-y-1">
                    <span className="block">
                      {s.currentStatus && !/^(none|unknown|unspecified)$/i.test(s.currentStatus) && (
                        <>Status as surveyed: <strong>{s.currentStatus}</strong>. </>
                      )}
                      {s.ownership && !/^(none|unknown|unspecified)$/i.test(s.ownership) && (
                        <>Ownership: {s.ownership === "diocese_rc" ? "Roman Catholic diocese" : s.ownership}.</>
                      )}
                    </span>
                    {s.sourceUrl ? (
                      <span className="block text-xs">
                        <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
                          Source →
                        </a>
                      </span>
                    ) : null}
                    <span className="block text-xs italic text-muted">
                      Automated web survey of diocesan directories and parish websites (2026).
                      Confidence: {s.confidence ?? "unspecified"}.
                      This source is lower-priority than <em>Draugas</em>, Wolkovich, or Michelsonas —
                      treat with caution and verify against primary sources.
                    </span>
                  </span>
                )}
                {s.axis === "truelithuania" && (
                  <span className="block space-y-1">
                    {s.yearsMentioned?.length > 0 && (
                      <span className="block">
                        Years mentioned: {(s.yearsMentioned as number[]).join(", ")}.
                      </span>
                    )}
                    {s.sourceUrl && (
                      <span className="block text-xs">
                        <a
                          href={s.sourceUrl}
                          className="underline hover:text-accent"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Global True Lithuania field survey →
                        </a>
                      </span>
                    )}
                    <span className="block text-xs italic text-muted">
                      Field survey data. Years mentioned are years the site appeared in the survey corpus —
                      not founding or closure dates. Use Draugas and print sources for verified dates.
                    </span>
                  </span>
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
