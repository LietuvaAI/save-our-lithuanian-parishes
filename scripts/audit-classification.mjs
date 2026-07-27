// Full-corpus classification audit — every parish, every layer, every claim
// cross-checked. Born 2026-07-26 ("can't go to the press if the data is
// wrong or displayed wrong" — Vilija). Complements the blocking guards
// (verify-geo, verify-classifier-watch, locked figures) with a wider,
// report-producing sweep of contradictions and unverified claims.
//
// Layers checked against each other:
//   registry-unified.json (years, diocese)  ·  parishes.json (canonical
//   classifiers)  ·  parish-situation.json (overlay)  ·  alerts.json
//   (watch + alerts)  ·  case-records/*.json (present-day research)
//
// Output: data/candidates/classification-audit-<date>.md, findings grouped:
//   CONTRADICTION   — two layers disagree on a fact; must be reconciled
//   UNVERIFIED      — a favorable claim (active/mass) with no supporting
//                     research layer; belongs in the verification queue
//   STALE-TEXT      — prose contradicting the classifier (incl. upstream
//                     CSV notes that need the canonical re-snapshot)
//   DATA-GAP        — missing fields research could fill
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const read = (p) =>
  JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url), "utf8"));
const registry = read("registry-unified.json").parishes;
const lib = read("parishes.json");
const sit = read("parish-situation.json").parishes;
const alerts = read("alerts.json");

const watchBySlug = new Map(
  (alerts.sustainabilityWatch ?? []).map((e) => [e.parishLink.split("/").pop(), e]),
);
const caseDir = new URL("../data/case-records/", import.meta.url);
const caseRecords = new Map();
for (const f of readdirSync(caseDir)) {
  if (f.endsWith(".json"))
    caseRecords.set(f.replace(/\.json$/, ""), JSON.parse(readFileSync(new URL(f, caseDir), "utf8")));
}

const findings = { CONTRADICTION: [], "YEAR-VARIANCE": [], UNVERIFIED: [], "STALE-TEXT": [], "DATA-GAP": [] };
const add = (sev, slug, msg) => findings[sev].push(`- **${slug}** — ${msg}`);

const NEG_MASS = /no (current )?lithuanian(-language)? mass|no lithuanian liturg/i;
const NEG_CLERGY = /no lithuanian(-speaking)? clergy/i;
const ALIVE_CLAIMS = /still officially lithuanian|active lithuanian parish|lithuanian mass continues/i;
// A parish that lost canonical independence cannot be "active_parish" under the
// rubric: that prong needs a *formally Lithuanian* personal parish, and once the
// parish is absorbed into a non-Lithuanian host the surviving liturgy is
// "mass_continues" — which is never counted as a standing Lithuanian parish in
// headline figures. Nine case records report a loss of independence; eight had
// already been downgraded to ethnically_transferred or lost, so this encodes a
// convention the corpus already follows rather than inventing one.
const LOST_INDEPENDENCE =
  /no longer an independent parish|no longer a separate parish|canonically merged|was merged (with|into)/i;
const ENDED = new Set(["closed", "demolished", "repurposed", "merged", "suppressed"]);

const asYear = (v) => {
  const m = (v ?? "").toString().match(/\b(1[89]\d{2}|20[0-2]\d)\b/);
  return m ? parseInt(m[1]) : null;
};

for (const p of lib) {
  if (p.mergedInto) continue;
  const slug = p.slug;
  const watch = watchBySlug.get(slug);
  const cr = caseRecords.get(slug);
  const id = p.lithuanianIdentity;
  const standing = p.status === "standing";

  // 1. Lifecycle contradictions
  if (standing && p.yearClosed)
    add("CONTRADICTION", slug, `status "standing" but yearClosed=${p.yearClosed}`);
  // 1b. A parish whose lifecycle already ended cannot be an active parish.
  // mass_continues is deliberately allowed — it is the rubric's landing place
  // for a suppressed or merged parish whose Lithuanian liturgy survives (Šv.
  // Kazimiero, Philadelphia). `undecided` is not an ending, so the Maspeth and
  // Elizabeth guardrail records are untouched. Found via Cleveland: DMNP was
  // suppressed in the same Oct 2009 merger as Šv. Jurgio, which reads "lost",
  // yet DMNP read "active_parish" — so the one community now worshipping there
  // was claimed as a living Lithuanian parish twice, once under the parish that
  // ended and once under its successor sv-kazimiero-cleveland-oh.
  if (ENDED.has(p.status) && id === "active_parish")
    add(
      "CONTRADICTION",
      slug,
      `identity "active_parish" but lifecycle status "${p.status}"${p.yearClosed ? ` (${p.yearClosed})` : ""} — the parish ended; use mass_continues if Lithuanian liturgy survives, lost if not`,
    );
  if (!standing && p.status !== "undecided" && !p.yearClosed)
    add("DATA-GAP", slug, `status "${p.status}" with no closure year recorded`);

  // 2. Favorable identity vs research layers. Not gated on `standing`: the
  // claim needs evidence whatever the lifecycle field says, and gating here
  // blinded the check to the two records that most need it — Maspeth and
  // Elizabeth NJ sit at `undecided` permanently by binding guardrail, so
  // while the gate stood neither could ever reach these checks. Four
  // canonical records escaped the block (Cleveland merged, Šv. Kazimiero
  // Philadelphia suppressed, Maspeth and Elizabeth undecided). Mirror of the
  // overlay-side gate removed below and of the terminal gap closed in #82.
  if (id === "active_parish" || id === "mass_continues") {
    if (watch) {
      if (watch.liturgy?.lithuanianMass === false)
        add("CONTRADICTION", slug, `identity "${id}" but watch research: no Lithuanian Mass`);
      if (id === "active_parish" && watch.liturgy?.frequency && !["weekly", "unknown"].includes(watch.liturgy.frequency))
        add("CONTRADICTION", slug, `identity "active_parish" but watch frequency "${watch.liturgy.frequency}" — rubric says mass_continues`);
    } else if (!cr && p.pastoralStatus === "unknown") {
      add("UNVERIFIED", slug, `claims "${id}" with no watch entry, no case record, pastoral unknown`);
    }
    if (cr) {
      const txt = `${cr.summary ?? ""}`;
      if (NEG_MASS.test(txt) || NEG_CLERGY.test(txt))
        add("CONTRADICTION", slug, `identity "${id}" but case record: "${(txt.match(NEG_MASS) ?? txt.match(NEG_CLERGY))[0]}…"`);
      // 2b. The rubric's own boundary between the two favorable values. Only
      // active_parish is checked: mass_continues is the correct landing place
      // for a merged parish, so flagging it would fight the rubric. Found via
      // sv-petro-ir-povilo-elizabeth-nj, which read "active_parish" while its
      // case record said the parish was canonically merged into Polish St.
      // Adalbert in 2009 — two fields disagreeing with no check between them.
      if (id === "active_parish" && LOST_INDEPENDENCE.test(txt))
        add(
          "CONTRADICTION",
          slug,
          `identity "active_parish" but case record reports lost canonical independence ("${txt.match(LOST_INDEPENDENCE)[0]}") — rubric says mass_continues`,
        );
    }
    if (watch) {
      const wt = `${watch.situation ?? ""} ${watch.clergy?.detail ?? ""} ${watch.liturgy?.detail ?? ""}`;
      if (id === "active_parish" && NEG_CLERGY.test(wt) && NEG_MASS.test(wt))
        add("CONTRADICTION", slug, `identity "active_parish" but watch prose reports no LT Mass and no LT clergy`);
    }
  }

  // 3. Transferred/lost with contradicting favorable prose (stale notes)
  if ((id === "ethnically_transferred" || id === "lost") && ALIVE_CLAIMS.test(p.notes ?? ""))
    add("STALE-TEXT", slug, `identity "${id}" but canonical notes claim: "${(p.notes.match(ALIVE_CLAIMS))[0]}…" (upstream CSV fix)`);

  // 4. Situation text vs identity
  const s = sit[slug];
  if (s && (id === "active_parish" || id === "mass_continues") && NEG_MASS.test(s.situation ?? ""))
    add("CONTRADICTION", slug, `identity "${id}" but situation text: no Lithuanian Mass`);

  // 5. Registry closure year vs lib
  const reg = registry.find(
    (r) =>
      r.c83_row != null &&
      lib.find((candidate) => candidate.c83Rows?.includes(r.c83_row))?.slug ===
        slug,
  );
  if (reg) {
    const regClosed = asYear(reg.locked?.year_closed) ?? asYear(reg.years?.closed?.[0]?.value);
    if (regClosed && p.yearClosed && regClosed !== p.yearClosed)
      add("YEAR-VARIANCE", slug, `source-block reading ${regClosed} vs selected public reading ${p.yearClosed} — surfaces show the Registry Revision 1 selection; variance stays as a conflict on the research page`);
    if (regClosed && standing && p.status !== "undecided")
      add("YEAR-VARIANCE", slug, `standing parish carries a registry closure reading (${regClosed}) — likely a predecessor/building event; surfaces ignore it`);
  }

  // 6. Watch present but pastoral unknown (fillable)
  if (watch && p.pastoralStatus === "unknown" && watch.clergy?.arrangement && watch.clergy.arrangement !== "unknown")
    add("DATA-GAP", slug, `pastoral_status unknown but watch records "${watch.clergy.arrangement}"`);
}

// Overlay-only (registry) parishes claiming life
for (const [key, s] of Object.entries(sit)) {
  if (lib.some((p) => p.slug === key)) continue;
  const id = s.lithuanian_identity;
  const reg = registry.find((r) => r.slug === (s.registry_slug ?? key));
  // 7. Favorable identity on no research. The claim itself is what needs
  // evidence, whatever the lifecycle field happens to say — so this must not
  // be gated on canonical_status. It was, and a record claiming
  // "active_parish" under canonical_status "unknown" walked straight through:
  // lithuanian-national-catholic-parish-waterbury-ct, a Lithuanian National
  // Catholic congregation founded 1902 and short-lived, sat in active_parish
  // off one medium-confidence source (found 2026-07-26). The favorable mirror
  // of the terminal-claim gap closed in #82.
  if (id === "active_parish" || id === "mass_continues") {
    const w = watchBySlug.get(key);
    const verifiedWeb = (reg?.sources ?? []).some(
      (src) => src.axis === "web-historical" && src.confidence === "verified",
    );
    if (!w && !verifiedWeb)
      add("UNVERIFIED", key, `overlay claims "${id}" with no watch entry and no verified web survey`);

    // 7b. The same record also contradicted its own evidence: the one source
    // it rests on recorded currentStatus "closed" while the overlay read
    // active_parish. A watch entry or case record legitimately supersedes an
    // older survey (layer precedence: watch/case beat classifier), so those
    // are exempt — Šv. Petro, Boston and Šv. Jurgio, Rochester both carry
    // stale web readings their per-parish research has since corrected.
    const ENDED_SRC = new Set(["closed", "demolished", "repurposed", "merged", "suppressed"]);
    if (!w && !caseRecords.has(key)) {
      const contra = (reg?.sources ?? []).find((src) =>
        ENDED_SRC.has((src.currentStatus ?? "").toLowerCase()),
      );
      if (contra)
        add(
          "CONTRADICTION",
          key,
          `overlay claims "${id}" but its own ${contra.axis} source records currentStatus "${contra.currentStatus}", with no watch entry or case record to supersede it`,
        );
    }
  }

  // 8. Overlay-only parishes asserting an ENDING on inference alone — the
  // mirror of the check above. A terminal claim needs evidence exactly as a
  // favorable one does, and it is the costlier error: an unearned ending is
  // counted in every closed aggregate on the site. The unnamed 1902
  // Waterbury church sat in closed/lost off a single Draugas row with zero
  // indexed mentions and no closure year, while its own profile read
  // "status not yet verified" (found 2026-07-26). An ending must rest on a
  // closure year or on a source outside the Draugas registry axis.
  if (id === "lost" || id === "ethnically_transferred" || ENDED.has(s.canonical_status)) {
    const hasClosureYear = (reg?.years?.closed ?? []).some((y) => asYear(y.value));
    const corroborating = (reg?.sources ?? []).filter(
      (src) => src.axis !== "draugas-registry-1909-2007",
    );
    if (!hasClosureYear && !corroborating.length)
      add(
        "CONTRADICTION",
        key,
        `overlay asserts an ending (status "${s.canonical_status}", identity "${id}") with no closure year and no source outside the Draugas registry axis — must read unverified`,
      );
  }
}

const date = process.argv[2] ?? "2026-07-26";
const lines = [`# Classification audit — ${date}`, "", `Corpus: ${lib.length} canonical + ${Object.keys(sit).length} overlay entries; ${watchBySlug.size} watch entries; ${caseRecords.size} case records.`, ""];
let total = 0;
for (const [sev, list] of Object.entries(findings)) {
  lines.push(`## ${sev} (${list.length})`, "");
  lines.push(...(list.length ? list : ["- none"]), "");
  total += list.length;
}
writeFileSync(new URL(`../data/candidates/classification-audit-${date}.md`, import.meta.url), lines.join("\n") + "\n");
console.log(`Audit: ${total} findings — CONTRADICTION ${findings.CONTRADICTION.length}, UNVERIFIED ${findings.UNVERIFIED.length}, STALE-TEXT ${findings["STALE-TEXT"].length}, DATA-GAP ${findings["DATA-GAP"].length}`);
console.log(`Report: data/candidates/classification-audit-${date}.md`);
