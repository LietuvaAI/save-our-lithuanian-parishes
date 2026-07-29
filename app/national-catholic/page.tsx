import type { Metadata } from "next";
import Link from "next/link";
import registry from "@/data/registry-unified.json";
import { EndStatePill } from "@/components/EndStatePill";
import { canonicalProfileHrefForRegistrySlug } from "@/lib/parish-profile";
import { toScopedParish, type RegParish } from "@/lib/registry-scope";
import type { EndState } from "@/lib/end-state";

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
  (parish) => parish.record_type !== "phase",
);
const PHASE_ENTRIES = NATIONAL_ENTRIES.filter(
  (parish) => parish.record_type === "phase",
);

function yearDisplay(variants?: YearVariant[]): string | null {
  if (!variants?.length) return null;
  const v = variants[0].value;
  const m = String(v).match(/\b(1[89]\d\d|20\d\d)\b/);
  return m ? m[1] : String(v);
}

function webStatus(sources?: RegistrySource[]): string | null {
  const ws = sources?.find((s) => s.axis === "web-historical");
  return ws?.currentStatus ?? null;
}

function statusForRecord(parish: Rec): EndState {
  const canonical = toScopedParish(parish as RegParish).endState;
  if (canonical !== "unverified") return canonical;

  const status = webStatus(parish.sources)?.toLowerCase() ?? "";
  if (status.includes("demolished")) return "demolished";
  if (status.includes("repurposed") || status.includes("sold")) {
    return "repurposed";
  }
  if (status.includes("closed") || status.includes("merged")) return "closed";
  return canonical;
}

// Group entries by state for display
const byState = new Map<string, Rec[]>();
for (const p of DURABLE_ENTRIES) {
  const st = p.state || "—";
  if (!byState.has(st)) byState.set(st, []);
  byState.get(st)!.push(p);
}
const states = [...byState.keys()].sort();

const standingCount = DURABLE_ENTRIES.filter((p) =>
  webStatus(p.sources)?.toLowerCase().startsWith("standing")
).length;

export default function NationalCatholicPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        The research record
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        Lithuanian National and independent Catholic parishes
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        In the early twentieth century, waves of Lithuanian immigrants —
        concentrated in the coal towns of Pennsylvania and the mill cities of
        New England — broke with their Roman Catholic dioceses. Their grievances
        were concrete: who held title to the church building, who controlled
        parish finances, whether the bishop or the congregation governed local
        affairs. Some joined the{" "}
        <strong>Polish National Catholic Church (PNCC)</strong>, founded in
        Scranton in 1897 by Bishop Francis Hodur, which offered congregational
        ownership of property and services in immigrant languages. Others formed
        short-lived independent parishes outside any larger body.
      </p>
      <p className="mt-3 text-muted leading-relaxed">
        The research record documents{" "}
        <strong>{DURABLE_ENTRIES.length} durable parish records</strong>{" "}
        across {states.length} states.{" "}
        {standingCount > 0 && (
          <>
            {standingCount === 1
              ? "One congregation is still standing"
              : `${standingCount} congregations are still standing`}{" "}
            — the others closed, were demolished, or still need present-status
            verification.{" "}
          </>
        )}
        These are documented here as historical record. They are part of the
        story of how Lithuanian communities navigated the American Catholic
        hierarchy — not a recommendation or an endorsement of separation from
        Rome.
      </p>

      {/* What the PNCC was */}
      <section className="mt-8 rounded-lg border border-rule px-5 py-5 text-sm leading-relaxed space-y-3">
        <h2 className="font-serif text-lg font-semibold">
          The Polish National Catholic Church
        </h2>
        <p className="text-muted">
          The PNCC was founded in 1897 when Bishop Hodur led a breakaway from
          the Diocese of Scranton over parish property rights. It retained
          Catholic sacramental practice and apostolic succession but placed
          ownership of church buildings in the congregation rather than the
          diocese, and introduced vernacular liturgy decades before Vatican II.
          Lithuanian immigrants in PNCC-affiliated parishes maintained their own
          ethnic identity within the broader Polish National Catholic structure.
        </p>
        <p className="text-muted">
          The PNCC remains a distinct, continuing denomination today. The
          Lithuanian-founded congregations documented here were separate
          national parishes organized by Lithuanian immigrants — built, funded,
          and governed by their own communities.
        </p>
      </section>

      {/* The parishes */}
      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          {DURABLE_ENTRIES.length} documented parishes
        </h2>
        <p className="mt-1 text-sm text-muted">
          Sorted by earliest documented founding. Each entry links to its full
          research record with sources cited.
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

      {PHASE_ENTRIES.length > 0 && (
        <section className="mt-10 border-t border-rule pt-8">
          <h2 className="font-serif text-2xl font-semibold">
            Historical phase evidence
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            These records document a real independent or national phase, but
            the evidence does not yet establish a durable standalone parish.
            They remain visible and sourced without being included in the
            parish count above.
          </p>
          <div className="mt-4 divide-y divide-rule border-y border-rule">
            {PHASE_ENTRIES.map((parish) => (
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
                  {parish.city}, {parish.state} · historical phase, not counted
                  as a durable parish
                </p>
                {parish.caveat && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {parish.caveat}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Data note */}
      <section className="mt-10 rounded-lg border border-rule px-4 py-3.5 text-sm text-muted leading-relaxed">
        <p>
          Every entry retains its source ledger and research-depth label.
          Entries supported by only one source remain visibly marked until
          corroborated. See{" "}
          <Link
            href="/about/sources-and-archives"
            className="underline hover:text-foreground"
          >
            Sources &amp; Archives
          </Link>
          {" "}for the evidence hierarchy and{" "}
          <Link href="/report" className="underline hover:text-foreground">
            report a correction
          </Link>
          .
        </p>
        <p className="mt-2">
          The map on the homepage marks National Catholic parishes as{" "}
          <span className="font-mono text-xs">◆</span> diamonds to distinguish
          them from Roman Catholic parishes, which appear as circles. On the map,
          filter to &ldquo;Lost&rdquo; and zoom into Pennsylvania and New England to see
          the full cluster.
        </p>
      </section>

      <p className="mt-8 text-sm text-muted">
        <Link href="/" className="underline hover:text-foreground">
          ← Back to the map
        </Link>
        {" · "}
        <Link href="/record" className="underline hover:text-foreground">
          The full record
        </Link>
        {" · "}
        <Link href="/about" className="underline hover:text-foreground">
          About the project
        </Link>
      </p>
    </article>
  );
}
