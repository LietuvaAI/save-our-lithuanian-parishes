import type { Metadata } from "next";
import Link from "next/link";
import db from "@/data/reversal-database.json";

export const metadata: Metadata = {
  title: "Where Rome Said No — parish closure reversals",
  description:
    "A verified database of U.S. Catholic parish-closure reversals: 26 documented cases across three diocesan waves where the Church's own law reopened churches or kept them open.",
};

type Case = (typeof db.database)[number];

const OUTCOME_LABEL: Record<string, string> = {
  decree_invalidated: "Decree declared invalid",
  decree_revoked: "Decree revoked",
  relegation_overturned: "Relegation overturned — church stays open",
  closure_cancelled_predecree: "Closure cancelled before decree",
  merger_reversed: "Merger reversed",
  remained_open_after_action: "Remained open after organized action",
  other: "Reversal (see detail)",
};

function waveOf(c: Case): string {
  const d = (c.diocese || "").toLowerCase();
  if (d.includes("allentown")) return "allentown";
  if (d.includes("cleveland")) return "cleveland";
  if (d.includes("buffalo")) return "buffalo";
  if (d.includes("boston")) return "boston";
  return "other";
}

const WAVES: { key: string; title: string; blurb: string }[] = [
  {
    key: "allentown",
    title: "Diocese of Allentown — 2011",
    blurb:
      "A line of Congregation for the Clergy rulings ordered relegated coal-region churches to remain open for worship — Slovenian, Slovak, Irish, Italian, and Lithuanian communities among them.",
  },
  {
    key: "cleveland",
    title: "Diocese of Cleveland — 2012",
    blurb:
      "The anchor case of the whole phenomenon: of 14 parishes that appealed their closures, 12 were reopened after Rome found the decrees procedurally and substantively invalid. Most remain open today.",
  },
  {
    key: "buffalo",
    title: "Diocese of Buffalo — 2025",
    blurb:
      "The most recent wave — decrees revoked in November and December 2025. This is a living remedy, not history.",
  },
  {
    key: "boston",
    title: "Archdiocese of Boston — individual reversals",
    blurb:
      "Individual wins from the 2004 reconfiguration era — including one parish whose closure was reversed twice.",
  },
  { key: "other", title: "Other dioceses", blurb: "" },
];

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "verified" | "pending" | "outcome";
}) {
  const style =
    tone === "verified"
      ? "border-foreground/50 text-foreground"
      : tone === "pending"
        ? "border-rule text-muted"
        : "border-rule text-foreground";
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {children}
    </span>
  );
}

function CaseCard({ c }: { c: Case }) {
  const verified = c.verificationStatus === "verified_unanimous";
  const minersville = c.city?.toLowerCase().includes("minersville");
  return (
    <details className="rounded-lg border border-rule px-4 py-3">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-serif font-semibold">{c.parish}</span>
          <span className="text-muted text-sm">
            {c.city}
            {c.state ? `, ${c.state}` : ""}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Badge tone="outcome">
            {OUTCOME_LABEL[c.outcomeType] ?? c.outcomeType}
            {c.outcomeDate ? ` · ${c.outcomeDate}` : ""}
          </Badge>
          {verified ? (
            <Badge tone="verified">verified — unanimous panel</Badge>
          ) : (
            <Badge tone="pending">case filed — verification pending</Badge>
          )}
        </div>
        {c.ethnicIdentity && !/none|unknown/i.test(c.ethnicIdentity) && (
          <p className="mt-1.5 text-sm text-muted">
            {c.ethnicIdentity.split(".")[0].slice(0, 160)}
          </p>
        )}
        <p className="mt-1 text-xs text-muted underline">Open the case file</p>
      </summary>
      <div className="mt-3 space-y-2.5 text-sm border-t border-rule pt-3">
        {minersville && (
          <p className="rounded-md border border-rule px-3 py-2 text-muted">
            <strong>Reconciliation note:</strong> a separate, widely-circulated
            story about this parish (a civil &ldquo;court battle&rdquo;) did not
            survive verification; the canonical reversal recorded here is a
            different, documented event. The two accounts are still being
            reconciled from primary sources.
          </p>
        )}
        <p>{c.outcomeDetail}</p>
        {c.closureContext && (
          <p>
            <span className="font-medium">Closure context:</span>{" "}
            {c.closureContext}
          </p>
        )}
        {c.communityResponse && (
          <p>
            <span className="font-medium">Community response:</span>{" "}
            {c.communityResponse}
          </p>
        )}
        {c.appealRoute && (
          <p>
            <span className="font-medium">Appeal route:</span> {c.appealRoute}
          </p>
        )}
        {c.protocolNumbers && !/none|not reported/i.test(c.protocolNumbers) && (
          <p>
            <span className="font-medium">Decree:</span> {c.protocolNumbers}
          </p>
        )}
        {c.status2026Note && (
          <p>
            <span className="font-medium">Today:</span> {c.status2026Note}
          </p>
        )}
        {c.sources?.length > 0 && (
          <p className="text-xs text-muted break-words">
            <span className="font-medium">Sources:</span>{" "}
            {c.sources.join(" · ")}
          </p>
        )}
      </div>
    </details>
  );
}

export default function ReversalsPage() {
  const grouped = new Map<string, Case[]>();
  for (const c of db.database) {
    const w = waveOf(c);
    if (!grouped.has(w)) grouped.set(w, []);
    grouped.get(w)!.push(c);
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        The precedent record
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        Where Rome said no
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        Across the United States, parish closures have been reversed —{" "}
        <strong className="text-foreground">
          {db.stats.reversals} documented cases
        </strong>{" "}
        in three diocesan waves, from Allentown in 2011 to Buffalo in
        late 2025.
        Not by protest alone, and never by leaving the Church — by the
        Church&rsquo;s own law, applied in time. This page is the evidence.
      </p>

      <div className="mt-6 rounded-lg border border-rule px-4 py-3 text-sm text-muted">
        <p>
          <span className="font-medium text-foreground">
            How this database was verified:
          </span>{" "}
          every case was researched from contemporary sources, then challenged
          by independent adversarial review — {db.stats.verification_votes_cast}{" "}
          verification votes were cast and{" "}
          <span className="font-medium text-foreground">
            not one produced a refutation
          </span>
          . Cases whose full verification panel has not yet completed are
          labeled <em>case filed — verification pending</em>; we publish the
          distinction rather than flatten it. Two candidate cases that turned
          out <em>not</em> to be reversals are listed at the bottom — keeping
          our misses visible is part of the record&rsquo;s credibility.{" "}
          {db.stats.leads_not_investigated} further leads await research.
        </p>
      </div>

      <p className="mt-6 text-sm text-muted">
        In the Lithuanian record itself,{" "}
        <Link href="/record" className="underline hover:text-foreground">
          no parish of the 83
        </Link>{" "}
        was saved by an appeal filed after the decree — the lesson of these
        precedents is that the window is <em>before and during</em>, not after.
        If your parish is facing this now,{" "}
        <Link href="/start-here" className="underline hover:text-foreground">
          start here
        </Link>
        .
      </p>

      {WAVES.map((w) => {
        const cases = grouped.get(w.key) ?? [];
        if (cases.length === 0) return null;
        return (
          <section key={w.key} className="mt-10">
            <h2 className="font-serif text-2xl font-semibold">{w.title}</h2>
            {w.blurb && <p className="mt-1.5 text-muted text-sm">{w.blurb}</p>}
            <div className="mt-4 space-y-3">
              {cases.map((c) => (
                <CaseCard key={`${c.parish}-${c.city}`} c={c} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          Investigated and excluded
        </h2>
        <p className="mt-1.5 text-muted text-sm">
          These candidates were researched and found <em>not</em> to be
          reversals. We show them because a precedent list you can trust must
          also show its exclusions.
        </p>
        <div className="mt-4 space-y-3">
          {db.excludedAsNonReversals.map((c) => (
            <div
              key={`${c.parish}-${c.city}`}
              className="rounded-lg border border-rule px-4 py-3 text-sm"
            >
              <div className="font-serif font-semibold">
                {c.parish}{" "}
                <span className="font-sans font-normal text-muted">
                  — {c.city}
                  {c.state ? `, ${c.state}` : ""}
                </span>
              </div>
              <p className="mt-1.5 text-muted">{c.exclusionReason}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-10 text-sm text-muted border-t border-rule pt-4">
        Compiled {db.generated} from the parish-preservation research record;
        every case cites its sources above. This page summarizes public
        documents and reporting and is not canonical or legal advice. See also:{" "}
        <Link href="/what-canon-law-says" className="underline hover:text-foreground">
          what canon law actually says
        </Link>{" "}
        ·{" "}
        <Link href="/start-here" className="underline hover:text-foreground">
          facing a closure? Start here
        </Link>
        .
      </p>
    </article>
  );
}
