# CLAUDE.md — save-our-lithuanian-parishes

> **Model-tier routing (always-on).** Which model each sub-task runs on: mechanical grind (git/files/scripts/bulk lookups/OCR/inventory/**bulk extraction fan-outs**) → Haiku via the **`ops` agent** (`.claude/agents/ops.md`, pinned to Haiku — use it here, not just in culturenet-brain); standard edits/drafting → Sonnet; judgment/synthesis/review → premium. In a Workflow, bulk fan-outs use `agentType: 'ops'` (or `model: 'haiku'` at minimum) — **never fan out `general-purpose`**. Narrate the tier when you route. Canon: `culturenet-brain/docs/systems/model-tier-routing-2026-07.md`.

Public advocacy site for SaveOurLithuanianParishes.org. This is a **product repo** in the LietuvaAI system — the master control stack lives in `culturenet-brain` (`DECISIONS.md`, `docs/systems/switchboard.md`, `docs/systems/agent-guardrails.md`, `docs/systems/agent-git-operating-model.md`). Read those for routing, tiers, and git lifecycle; this file holds only repo-local rules.

## Lane

- Build surface: Claude Code (laptop). Codex reviews repo-heavy/safety work. Cowork routes; it does not build here.
- Branch/PR flow only. Never push to `main`. Branch names: `<topic>-<YYYY-MM-DD>`.
- Git identity before any commit: `LietuvaAI` / `vilija@lietuva.ai` (repo-local config).
- Named files in `git add` — never `git add .`.
- No `.env*` files. The site is fully static; if a backend (submissions) is added later, that decision lands in a PR + culturenet-brain `DECISIONS.md` first.

## Launch legitimacy doctrine (Vilija, 2026-07-26)

**Solid first, stories forever.** Before any press moment: every record verified/adjudicated or explicitly labeled "still being researched" — nothing in between. Completion meter: `scripts/audit-classification.mjs` (CONTRADICTION and UNVERIFIED must be 0). Classification canon: `docs/CLASSIFICATION.md` — surfaces that disagree with it are wrong. A hosted Lithuanian Mass never counts as a standing Lithuanian parish in headline figures. Full doctrine + the adjudication campaign: `culturenet-brain/docs/strategy/solp-launch-legitimacy-2026-07-26.md`.

The public institution census is a separate launch-critical contract. `data/canonical-publication-projection.json`, generated in `culturenet-brain`, is the sole authority for U.S. institution identity, membership, type, class, canonical entity ID, and public route. `data/public-institution-ledger.json` is derived from that projection. A former site-owned identity-lock file was retired because it duplicated this authority; the build forbids its return. Never infer the count from research rows, route totals, or display-registry shape. Historical phases, leads, context, buildings, duplicate aliases, Canadian comparators, and other international institutions never enter the U.S. count.

## Data discipline (the credibility of the whole project)

- Every factual deployment artifact in `data/` is imported from `culturenet-brain` by `scripts/import-brain-projections.mjs` or generated from those imports. Never hand-edit an imported artifact in this repo.
- `scripts/build-data.mjs` validates every derived figure against the locked figure set and **fails the build on drift**. Expected figures change only to match a new upstream locked-figures revision.
- `data/parishes.json` and `data/figures.json` are generated — regenerate with `npm run data`, commit alongside the script that produced them.
- `data/canonical-publication-projection.json`, `data/canonical-infographic-projection.json`, and `data/canonical-current-events-projection.json` are checked-in Brain release artifacts. Update them only through the Brain builders and the import script.
- `data/registry-unified.json`, `data/parish-situation.json`, `data/parish-timelines.json`, `data/photos.json`, `data/parishes.csv`, case records, and the reversal database are Brain-owned public-display or evidence artifacts. The site imports them byte-for-byte and verifies their Brain manifest hashes. They are never an independent factual authority and may not override the canonical projections.
- New data enters under its own `corpusScope` tag; the `draugas-2008-2026` figures never silently mutate.

## Binding editorial guardrails (from the locked research — do not relax)

1. **Never advocate leaving Rome.** The National Catholic parishes are historical witness, not a recommendation.
2. **Maspeth is unresolved** — never render or phrase as a completed closure.
3. **Aušros Vartų sale price** stays soft ("tens of millions" overstates the archdiocese's $13M sale — say "sold to a developer"; the $18.4M flip was Extell's), no hard number in advocacy copy. Demolition year is RESOLVED: **April 2015** (Draugas 2015-04-30 pp. 1, 4; 2016-08-25 p. 5 — the June 2020 "demolition" item is a recycled 2015 reprint).
4. The PA **"31/29"** figure is an attributed Draugas statistic — never drawn as dataset marks.
5. **No invented numbers.** Blank fields stay blank.
6. **Never publish research-cohort totals as institution totals.** Public U.S. counts come only from the canonical publication projection; evidence-depth labels describe research maturity, not a separate census.
7. **Site framing (Vilija 2026-07-21): the site's mission is the RECORD, not the deed thesis.** The site documents every parish — what happened to it, where it stands now, and what communities can learn from each other: from those that were lost AND from those that fought and won. "Ownership decided endings" and "procedure in time wins" are two *lessons inside* the record, not the site's identity. Accordingly: site visuals (the homepage map) encode *present status* (open / under threat / lost / fate unestablished); the who-decided (`ending_mode`) encoding remains for the Draugas-article graphics, charts, profile marks, and popups, where it originated. Unresolved cases (Maspeth) render as *under threat*, never as closed. Scope: the U.S., with Canada as the comparator exception; Argentine and other international records stay research-only unless a separate view explicitly includes them.
8. **Public voice follows [`docs/VOICE.md`](docs/VOICE.md).** Lead with the parish, community, building, or event—not with the database or research workflow. State uncertainty directly and preserve every canonical distinction. Homepage cards must explain what happened and why the subject belongs on the site; an internal provenance caveat is never the card's main content. `npm run verify:reader-copy` blocks recurring process-first phrases.

## Hearth dispatch queue (Substack alignment)

The Brain-owned current-events source carries `hearthUrl` fields for campaigns and sustainability-watch entries. The site renders those links from `data/canonical-current-events-projection.json`. Add or change a dispatch URL in Brain, rebuild the projection, then import it here.

**Has a dispatch (all four active campaigns covered as of 2026-07-27):**
- Divine Providence, Southfield MI — dedicated post series + campaign anchor (hearthUrl = "The Numbers Behind Divine Providence" since 2026-08-07)
- Maspeth, Queens NY — "Still Open, Still Undecided" (2026-07-26; hearthUrl set)
- Hartford CT — "Fifteen Months: The Closing of Švč. Trejybės" (2026-07-27; hearthUrl set)
- Waterbury CT — "Closed, Not Ended: The Vatican Appeal" (2026-07-27; hearthUrl set) + "The Last Mass at Šv. Juozapo" (2026-08-08, the Aug 2 final Mass and formal closing of the building)
- South Boston MA — "The Boston Hill of Crosses" (hearthUrl set, sustainability watch)

Four posts were deliberately unpublished from the live blog on Vilija's decision: "The Parish That Won in Court Twice" and "How You Can Help Save America's Lithuanian Parishes" (2026-08-04); "How You Can Help Save Detroit's Divine Providence Lithuanian Parish" (2026-08-07); and the former pinned flagship "Further Down the Path: What Divine Providence Can See from Connecticut and Queens" (2026-08-07 — it compressed the three East Coast dispatches and the DP series instead of adding to them). Their archives are removed; do not re-archive or link them.

The blog's front door is **"Who Owns an Ethnic Parish?"** — pinned 2026-08-07 alongside Active Campaigns, and the one signed personal essay (Hearth voice register, rule 7).

**`content/dispatches/` is a mirror of the live blog, not an independent copy.** Regenerate it from `/api/v1/archive` + `/api/v1/posts/<slug>` rather than hand-editing; a live post is always the source of truth.

`scripts/verify-dispatch-mirror.mjs` enforces this. It runs offline in `npm run data` (frontmatter well-formed, filename/date/slug agree, no archive for a retired post, nothing links to one) and does the real comparison with `npm run verify:dispatch-mirror:live` — slug-set parity plus title, subtitle and normalized body text against the live posts. Retired posts are listed in `content/dispatches/retired.json`; unpublish a post, add it there, delete its archive. Run the `:live` check after any publishing session. Repair is always regeneration, never a hand-merge.

Why the guard exists: on 2026-08-08 a day of archive edits was reported merged but only part reached `main` — PR #162 carried 4 of its branch's 16 commits — and the archives sat wrong for a day before anyone noticed.

**Writing queue — under-threat campaigns:** none open; new dispatches follow events.

**No campaign yet (future, as events develop):**
- Girardville PA, Freeland PA, Bayonne NJ, Scranton PA (St. Michael), Elizabeth NJ, Beverly Shores IN.

## Sustainability watch (editorial concept, 2026-07-23)

Two tiers of living parishes: `/under-threat` (active diocesan action, clock ticking) and `/sustainability-watch` (survived or never threatened, but wounded — slow-burn erosion).

**Data model** (Brain current-events source → `canonical-current-events-projection.json → sustainabilityWatch[]`): each entry documents clergy (arrangement + detail), liturgy (lithuanianMass, frequency, detail), governance (standalone/collaborative/merged/mission), survivedThreats, financial signal, situation summary, sources. Clergy arrangement enum: `lithuanian_klebonas`, `collaborative_pastor`, `visiting_priest`, `no_lithuanian_clergy`, `unknown`.

**Research queue — parishes to add (need sourced clergy/liturgy/governance data):**
1. **St. Andrew (Šv. Andriejaus), Philadelphia PA** — only Lithuanian-language Sunday Mass in Pennsylvania; rectory sold ~2023-24 for $1.2M to fund operations.
2. **Nativity BVM (Švč. M. Marijos Gimimo), Chicago IL** — sole surviving Lithuanian parish in Chicago; chronic deficit covered by archdiocese as high-interest loan; building valued ~$20M, diocese-owned.
3. **Immaculate Conception, East St. Louis IL** — 11 of 13 Catholic churches in the city closed; this one survived; landmark-designated.
4. **St. Casimir (Šv. Kazimiero), Cleveland OH** — formed 2009 from merger; survived 2014 financial crisis via school lease.
5. **Holy Cross (Šv. Kryžiaus), Dayton OH** — debt-free, National Register of Historic Places, demonstrated vitality.

**Research method for new entries:** check parish website for current bulletin/Mass schedule; check diocesan directory for pastor name and parish status; check sielovada.lt (Lithuanian Conference of Bishops) for priest assignments in North America; direct outreach to Lithuanian Apostolate contacts where possible.

## Deploy

Vercel Git integration (LietuvaAI team): branch pushes do not build automatically; merge to `main` → production when deployable files changed. Use local builds/screenshots for PR verification. This main-only policy prevents duplicate preview + production spend.
