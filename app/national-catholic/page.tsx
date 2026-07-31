import type { Metadata } from "next";
import Link from "next/link";
import contextPointsData from "@/data/context-points.json";
import registry from "@/data/registry-unified.json";
import { EndStatePill } from "@/components/EndStatePill";
import RecordLensMap, {
  type RecordLensPoint,
} from "@/components/RecordLensMap";
import { canonicalProfileHrefForRegistrySlug } from "@/lib/parish-profile";
import { toScopedParish, type RegParish } from "@/lib/registry-scope";
import type { EndState, EndStateGroup } from "@/lib/end-state";
import {
  recordMarkColor,
  recordMarkShape,
} from "@/lib/record-mark";

export const metadata: Metadata = {
  title: "Lithuanian National and independent Catholic parishes",
  description:
    "The Lithuanian National Catholic parishes documented in the research record — communities that separated from Rome in the early 1900s, mostly in Pennsylvania and the Northeast, joining the Polish National Catholic Church. Documented as historical witness.",
};

type YearVariant = {
  value?: string;
};

type RegistrySource = {
  axis?: string;
  currentStatus?: string | null;
  ethnic_status?: string | null;
};

type Rec = Omit<RegParish, "sources" | "years"> & {
  record_type?: string;
  sources?: RegistrySource[];
  years?: {
    founded?: YearVariant[];
    closed?: YearVariant[];
  };
  caveat?: string | null;
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

const NATIONAL_ENTRIES = (registry.parishes as Rec[])
  .filter(
    (p) =>
      p.congregation_class === "national_catholic_pncc" ||
      p.congregation_class === "independent_catholic",
  )
  .sort((a, b) => {
    const ya = Number(String(a.years?.founded?.[0]?.value ?? "9999").match(/\d{4}/)?.[0] ?? 9999);
    const yb = Number(String(b.years?.founded?.[0]?.value ?? "9999").match(/\d{4}/)?.[0] ?? 9999);
    return ya - yb;
  });
const DURABLE_ENTRIES = NATIONAL_ENTRIES.filter(
  (parish) => parish.record_type === "parish",
);
const SUPPORTING_ENTRIES = NATIONAL_ENTRIES.filter(
  (parish) => parish.record_type !== "parish",
);

function yearDisplay(variants?: YearVariant[]): string | null {
  if (!variants?.length) return null;
  const v = variants[0].value;
  const m = String(v).match(/\b(1[89]\d\d|20\d\d)\b/);
  return m ? m[1] : String(v);
}

function statusForRecord(parish: Rec): EndState {
  const href =
    canonicalProfileHrefForRegistrySlug(parish.slug) ??
    `/parishes/${parish.slug}`;
  return (
    canonicalStatusByHref.get(href) ??
    toScopedParish(parish as RegParish).endState
  );
}

// Group entries by state for display
const byState = new Map<string, Rec[]>();
for (const p of DURABLE_ENTRIES) {
  const st = p.state || "—";
  if (!byState.has(st)) byState.set(st, []);
  byState.get(st)!.push(p);
}
const states = [...byState.keys()].sort();

const durableHrefs = new Set(
  DURABLE_ENTRIES.map(
    (parish) =>
      canonicalProfileHrefForRegistrySlug(parish.slug) ??
      `/parishes/${parish.slug}`,
  ),
);
const contextPoints = contextPointsData.points as ContextPoint[];
const canonicalStatusByHref = new Map(
  contextPoints
    .filter((point) => point.href)
    .map((point) => [point.href!, point.group as EndState]),
);
const nationalMapPoints = contextPoints
  .filter((point) => point.href && durableHrefs.has(point.href))
  .map(
    (point): RecordLensPoint => ({
      ...point,
      color: recordMarkColor(point.group),
      shape: recordMarkShape(point.congregationClass),
      detail:
        point.group === "transferred"
          ? "institution operating; Lithuanian liturgy ended"
          : point.group === "closed"
            ? "closed"
            : "present status being verified",
    }),
  );
const closedMapCount = nationalMapPoints.filter(
  (point) => point.color === recordMarkColor("closed"),
).length;
const operatingMapCount = nationalMapPoints.filter(
  (point) => point.color === recordMarkColor("transferred"),
).length;
const unverifiedMapCount =
  nationalMapPoints.length - closedMapCount - operatingMapCount;

export default function NationalCatholicPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase text-muted">
        Tradition view
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        Lithuanian National and independent Catholic parishes
      </h1>
      <p className="mt-4 max-w-3xl font-serif text-xl leading-relaxed sm:text-2xl">
        What happened to the Lithuanian communities that left Roman Catholic
        diocesan control?
      </p>

      <section className="mt-10 border-y border-rule py-8">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.7fr)]">
          <RecordLensMap
            points={nationalMapPoints}
            ariaLabel={`${DURABLE_ENTRIES.length} Lithuanian National and independent Catholic parish records across ${states.length} states`}
            legend={[
              {
                label: `Closed · ${closedMapCount}`,
                color: recordMarkColor("closed"),
                shape: "diamond",
              },
              {
                label: `Institution operating; Lithuanian liturgy ended · ${operatingMapCount}`,
                color: recordMarkColor("transferred"),
                shape: "diamond",
              },
              {
                label: `Being verified · ${unverifiedMapCount}`,
                color: recordMarkColor("unverified"),
                shape: "diamond",
              },
            ]}
          />
          <div>
            <p className="font-serif text-6xl font-semibold leading-none">
              {DURABLE_ENTRIES.length}
            </p>
            <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight">
              parishes established in {states.length} states
            </h2>
            <p className="mt-3 leading-relaxed text-muted">
              Providence of God in Scranton is the one institution documented
              as still operating. Its services are now in English; no current
              Lithuanian-language liturgy is documented.
            </p>
          </div>
        </div>
        <p className="mt-5 border-t border-rule pt-3 text-xs leading-relaxed text-muted">
          Scope: {DURABLE_ENTRIES.length} National or independent Catholic
          parish institutions across {states.length} states · Registry Revision{" "}
          {registry.registryRevision.version},{" "}
          {registry.registryRevision.date}
          {" · "}
          <Link href="/about-the-data" className="underline hover:text-accent">
            About the data
          </Link>
        </p>
      </section>

      <section className="mt-10 max-w-3xl border-l-4 border-rule py-1 pl-4 text-sm leading-relaxed">
        <h2 className="font-serif text-lg font-semibold">
          Why these parishes formed
        </h2>
        <p className="mt-2 text-muted">
          Beginning in the early twentieth century, communities in Pennsylvania,
          New England, and Illinois formed independent parishes or joined the
          Polish National Catholic Church. The PNCC retained Catholic
          sacramental practice while placing church property in congregational
          hands and using immigrant languages in worship.
        </p>
      </section>

      {/* The parishes */}
      <section className="mt-12 max-w-3xl">
        <h2 className="font-serif text-2xl font-semibold">
          {DURABLE_ENTRIES.length} documented parishes
        </h2>
        <p className="mt-1 text-sm text-muted">
          Each entry opens its canonical profile and full source record.
        </p>

        <div className="mt-5 space-y-10">
          {states.map((st) => (
            <div key={st}>
              <h3 className="font-serif text-lg font-semibold border-b border-rule pb-1.5">
                {st}
              </h3>
              <div className="mt-3 space-y-4">
                {byState.get(st)!.map((p) => {
                  const founded = yearDisplay(p.years?.founded);
                  const closed = yearDisplay(p.years?.closed);
                  const name = p.names.lt || p.names.en || p.slug;
                  const altName = p.names.lt && p.names.en ? p.names.en : null;
                  const wk = p.sources?.find((s) => s.axis === "wolkovich");
                  return (
                    <div key={p.slug} className="rounded-lg border border-rule px-4 py-3.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <div>
                          <Link
                            href={
                              canonicalProfileHrefForRegistrySlug(p.slug) ??
                              `/parishes/${p.slug}`
                            }
                            className="font-serif text-base font-semibold hover:underline"
                          >
                            {name}
                          </Link>
                          {altName && (
                            <span className="ml-2 text-sm text-muted">{altName}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <EndStatePill value={statusForRecord(p)} />
                          <span className="text-sm text-muted">{p.city}</span>
                        </div>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted">
                        {founded && <span>Founded {founded}</span>}
                        {closed && <span>Closed {closed}</span>}
                        {!founded && !closed && (
                          <span className="italic">Dates not yet established</span>
                        )}
                      </div>

                      {wk?.ethnic_status &&
                        !/^(none|unknown)$/i.test(wk.ethnic_status) && (
                          <p className="mt-2 text-xs text-muted leading-relaxed italic">
                            Wolkovich: &ldquo;{wk.ethnic_status}&rdquo;
                          </p>
                        )}

                      {p.caveat && (
                        <p className="mt-2 text-xs text-muted leading-relaxed border-t border-rule pt-2">
                          Note: {p.caveat}
                        </p>
                      )}

                      <div className="mt-2">
                        <Link
                          href={
                            canonicalProfileHrefForRegistrySlug(p.slug) ??
                            `/parishes/${p.slug}`
                          }
                          className="text-xs underline hover:text-foreground"
                        >
                          Full research record →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {SUPPORTING_ENTRIES.length > 0 && (
        <section className="mt-10 max-w-3xl border-t border-rule pt-8">
          <h2 className="font-serif text-2xl font-semibold">
            Related attempts and independent phases
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            These records document a real independent or national
            congregation, attempt, or phase, but the evidence does not
            establish a durable standalone parish. They remain visible and
            sourced without being included in the parish count above.
          </p>
          <div className="mt-4 divide-y divide-rule border-y border-rule">
            {SUPPORTING_ENTRIES.map((parish) => {
              const evidenceKind =
                parish.record_type === "congregation"
                  ? "historical congregation"
                  : parish.record_type === "lead"
                    ? "research lead"
                    : "historical phase";
              return (
                <article key={parish.slug} className="py-4">
                  <Link
                    href={
                      canonicalProfileHrefForRegistrySlug(parish.slug) ??
                      `/parishes/${parish.slug}`
                    }
                    className="font-serif text-base font-semibold hover:underline"
                  >
                    {parish.names.lt || parish.names.en || parish.slug}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {parish.city}, {parish.state} · {evidenceKind}, not counted
                    as a durable parish
                  </p>
                  {parish.caveat && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {parish.caveat}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

    </article>
  );
}
