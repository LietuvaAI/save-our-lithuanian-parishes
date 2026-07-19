import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Facing a parish closure? Start here",
  description:
    "A plain-language guide for parishioners facing a closure or merger: the deadlines, the seven reasons that don't count under canon law, the procedural rights that have reversed closures, and the precedents.",
};

const SEVEN_REASONS = [
  "A general diocesan plan to reduce the number of churches",
  "That the church is “no longer needed”",
  "That the parish has been suppressed",
  "That the number of parishioners has decreased",
  "That closure “will not harm the good of souls”",
  "A desire to promote parish unity",
  "A potential future cause that has not yet happened",
];

export default function StartHerePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs uppercase tracking-widest text-muted">
        The parishioner&rsquo;s guide
      </p>
      <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-semibold leading-tight">
        Facing a closure? Start here.
      </h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        A restructuring letter. A &ldquo;listening session.&rdquo; A merger
        notice. If this is arriving at your parish — any parish, of any
        heritage — the Church&rsquo;s own law gives you standing, rights, and
        precedent. This page is the short version of everything our research
        verified. It is not legal or canonical advice; it is the map that gets
        you to the right help in time.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          1. The clock is the first fact
        </h2>
        <p className="mt-2 leading-relaxed">
          Canonical challenges run on deadlines measured in{" "}
          <strong>days from a decree&rsquo;s publication — not months</strong>.
          A community that waits for certainty has usually already lost its
          standing. The exact deadlines depend on the decree and how it was
          communicated, which is why the single most important early step is to{" "}
          <strong>engage a canon lawyer immediately</strong> — before the
          decree if you can, the week it arrives if you cannot. Ask your
          parish&rsquo;s friends-of network, a neighboring parish that fought,
          or national Catholic advocacy groups for referrals.
        </p>
        <p className="mt-2 leading-relaxed">
          And know the difference between the acts: merging a{" "}
          <em>parish</em>, closing a <em>church building</em>, and{" "}
          <em>selling</em> that building are three separate legal acts, each
          requiring its own written decree — and each challengeable on its own
          terms. Ask, in writing, for every decree and its stated reasons.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          2. The seven reasons that don&rsquo;t count
        </h2>
        <p className="mt-2 leading-relaxed">
          To permanently close a church, canon 1222 §2 requires a{" "}
          <em>grave cause</em>. The Vatican&rsquo;s own 2013 procedural
          guidelines state that established Church jurisprudence rejects these
          reasons, in themselves, as insufficient:
        </p>
        <ol className="mt-3 list-decimal pl-6 space-y-1.5">
          {SEVEN_REASONS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
        <p className="mt-3 leading-relaxed">
          Read that list against your parish&rsquo;s letter. If the stated
          cause is on it, say so — in your petition to the bishop, and if
          needed, to Rome. (Gravity can arise from a combination of causes, and
          temporary closure is permitted without this process — the shield is
          against <em>permanent</em> closure done casually.)
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          3. The procedural questions that decide appeals
        </h2>
        <p className="mt-2 leading-relaxed">
          Reversals are won on procedure, not sentiment. Three questions to put
          in writing from day one:
        </p>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>
            <strong>Was the Presbyteral Council genuinely consulted about
            *your* parish?</strong>{" "}
            Consultation — lawfully convoked, fully informed, on each
            individual parish — is required for the <em>validity</em> of the
            decree. Skipped or generic consultation has voided closures.
          </li>
          <li>
            <strong>Are the reasons specific to your parish?</strong> A
            diocese-wide plan is not, by itself, a lawful reason to modify{" "}
            <em>your</em> parish. The motivating cause must be{" "}
            <em>ad rem</em> — about this parish, this church.
          </li>
          <li>
            <strong>Where do the goods go?</strong> When parishes merge, the
            Church&rsquo;s jurisprudence is that the temporal goods — property,
            funds, patrimony — <em>follow the people</em>, and donor intent
            binds (canons 121–123). Ask, in writing, where the patrimony your
            families gave will go. And financial need can support a closure
            only where other reasonable funding was considered and found
            inadequate — ask for that showing too.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          4. It has worked — 26 times
        </h2>
        <p className="mt-2 leading-relaxed">
          Rome has reversed U.S. parish closures in three diocesan waves —
          Allentown 2011, Cleveland 2012 (12 of 14 appealing parishes
          reopened), Buffalo 2025 — and in individual cases besides. The
          pattern in the wins: <strong>presence and procedure together</strong>
          . Cleveland&rsquo;s parishioners prayed outside their locked church
          for 139 consecutive Sundays <em>and</em> filed a precise canonical
          appeal in time. Neither alone reopened that church; together they
          did.
        </p>
        <p className="mt-3">
          <Link
            href="/reversals"
            className="font-medium underline hover:text-foreground"
          >
            Read all 26 precedents, with decree numbers and sources →
          </Link>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold">
          5. Document everything, starting today
        </h2>
        <p className="mt-2 leading-relaxed">
          Whatever happens next, the record you keep now is the case you can
          make later — and it is how communities that came before you made the
          record this site is built on. Save every letter and bulletin notice.
          Note every meeting, with dates. Photograph what your families built.
          If your parish is Lithuanian,{" "}
          <Link href="/report" className="underline hover:text-foreground">
            report it to us
          </Link>{" "}
          while it is happening — we review before anything is published.
        </p>
      </section>

      <section className="mt-10 rounded-lg border border-rule px-4 py-3.5 text-sm text-muted">
        <p>
          <span className="font-medium text-foreground">
            Why we publish this.
          </span>{" "}
          Our own record shows the harder lesson: among the 83 Lithuanian
          parishes we document, no appeal filed <em>after</em> the decree ever
          reversed a closure — and ownership decided every ending. Standing up
          for a parish inside the Church&rsquo;s own law is not standing
          against the Church. It is asking the Church to follow it. See{" "}
          <Link
            href="/what-canon-law-says"
            className="underline hover:text-foreground"
          >
            what canon law actually says
          </Link>{" "}
          about who a parish belongs to, and the fuller argument on{" "}
          <a
            href="https://blog.saveourlithuanianparishes.org"
            className="underline hover:text-foreground"
          >
            the blog
          </a>
          .
        </p>
      </section>
    </article>
  );
}
