# The classification system — one page, the whole truth chain

*Written 2026-07-26, after the accuracy reckoning. This is the canon for how a
parish's state is recorded, resolved, displayed, and guarded. If a surface
disagrees with this document, the surface is wrong.*

## The dimensions

| Dimension | Values | Source of truth |
|---|---|---|
| Lifecycle (`status`) | closed · demolished · merged · suppressed · standing · undecided | canonical `parishes.csv` snapshot (locked core) |
| Who decided (`endingMode`) | diocese_closed · community_decided · standing · undecided | canonical snapshot (locked figures count these) |
| Lithuanian identity | active_parish · mass_continues · ethnically_transferred · lost · *(null = unverified)* | `parish-situation.json` overlay (site-owned, research-driven) |
| Building fate | standing · demolished · repurposed_religious · repurposed_secular · derelict · unknown | overlay |
| Pastoral status | own_priest · shared_priest · visiting_priest · not_applicable · unknown | overlay, reconciled to watch research |
| Watch layer | clergy arrangement, Lithuanian Mass + frequency, governance | `alerts.json` sustainabilityWatch (freshest, per-parish sourced) |
| Alerts | active campaign · watched · building at risk | `alerts.json` |

## The identity rubric (locked 2026-07-26)

- **active_parish** — regular (weekly or near-weekly) Lithuanian-language
  liturgy, or a formally Lithuanian personal parish with active Lithuanian
  community life.
- **mass_continues** — a Lithuanian Mass exists but monthly/occasional, or
  Lithuanian liturgical life survives inside a host or merged parish that is
  no longer Lithuanian-led. **Never counted as a standing Lithuanian parish
  in headline figures** — always stated as its own clause.
- **ethnically_transferred** — the church operates, but no Lithuanian Mass,
  clergy, or organized Lithuanian community life remains.
- **lost** — the parish and its Lithuanian life have ended.
- *null* — the record has not verified the identity. Displays as
  **Not yet verified**, never as Active.

## The resolver (lib/end-state.ts — every surface calls this one function)

Priority order: `undecided` ending → **Unresolved** (binding guardrail —
Maspeth and Elizabeth NJ can never render Closed) · standing+mass_continues →
Mass continues · standing+transferred → Transferred · **standing+lost →
Closed** (a closure after the locked snapshot shows the truth; the lifecycle
field waits for the relock — e.g. Hartford, Masses ended 2026-05-30) ·
**standing+no-identity → Not yet verified** ("standing" is a lifecycle fact,
not evidence of Lithuanian life) · standing → Active · then the loss ladder
(transferred → demolished → repurposed → lost/closed) · else Not yet
verified.

Loss sub-fates (closed / demolished / repurposed) share the maroon; labels
carry the detail. Mirrors of the resolver (`build-context-points.mjs`, the
Hearth dispatch renderer) must be kept in sync — they say so in comments.

## Layer precedence on display

Freshest first: **watch/alert research → case records → classifier-derived
pill → archival notes.** Profile pages order sections accordingly ("Where it
stands today" leads). Canonical years (locked core) are authoritative on
every surface; registry readings that differ appear only as conflicts on
research pages.

## The guards (all block `npm run data` / the build)

1. **Locked figures** — headline counts recomputed and compared to the
   locked set; drift fails the build.
2. **verify-geo** — every mapped point must fall inside its own state.
3. **verify-classifier-watch** — the classifier may never claim more
   Lithuanian life than the watch research supports.
4. **audit-classification.mjs** (report, not blocking) — full-corpus sweep
   of contradictions, unverified claims, stale text, and data gaps across
   all layers; run before any press-facing release.

## Standing corrections queue

- **Registry Revision 1 applied 2026-07-27:** the living registry now carries
  the following three identity corrections with quoted evidence. The frozen
  `parishes.csv` source rows remain Revision 2 provenance; public generated
  records take the selected Registry Revision 1 reading after locked-figure
  validation:
  1. Row 15 titular: **Šv. Petro → Nekalto Prasidėjimo**, Cambridge MA — the
     parish was real and distinct (founded 1909, closed 2004) but named
     Immaculate Conception from its 1910 founding article; "Šv. Petro" is a
     conflation with the Boston mother parish it split from.
  2. Row 6 city: **Chicago → Chicago Heights** (and drop the "Marquette
     Park/Brighton Park (probable)" note — a compiler guess) — no Lithuanian
     St. Casimir parish existed within Chicago city limits. Closure year
     1987 (GTL) vs 1989 (Wolkovich Vol 3 p. 147) stays a carried variance.
  3. Row 68 name: "Lietuvių bažnyčia (Kearny)" can take its proper name,
     **Sopulingosios Dievo Motinos / Our Lady of Sorrows** (founded 1914-15
     as the Kearny-Harrison parish; city "Kearny" stays correct).
- **Registry-unified reconciliation completed in Revision 1:** merged
  `st-casimir-chicago-heights-il` into `casimir-chicago-il`, and merged
  `our-lady-of-sorrows-kearny-nj`,
  `sorrows-kearny-nj`, `mary-kearny-nj`, plus the pre-1954 seat
  `lithuanian-church-harrison-nj`, into `parish-kearny-nj`. Redirects preserve
  the retired registry URLs.
- The 16 missing closure-year and 6 year-variance records were adjudicated in
  brain #449 and folded into Registry Revision 1. Spring Valley remains
  unresolved and Nanticoke remains pending diocesan confirmation by design.
- **Waterbury resolved for public presentation in Registry Revision 4:** the
  protected public campaign remains Roman Catholic St. Joseph
  (`sv-juozapo-waterbury-ct` / `joseph-waterbury-ct`). The false St. Casimir
  C83 row remains merged into that entity. Historical All Saints remains a
  separate, supported independent/national entity with its unresolved end
  labeled. The unnamed 1902 row (`lithuanian-church-waterbury-ct`) is excluded
  from public profiles and counts until name-level identity is established;
  its complete evidence survives in
  `data/candidates/waterbury-1902-unresolved-lead.json`.
- Upstream `gazetteer.csv` still carries that unnamed lead as `status=closed`
  with an empty closure year. The column feeds only geocoding here and does not
  override the Revision 4 research hold.

## Canonical identity register (2026-07-28)

`data/canonical-identity-locks.json` independently freezes the 82 unique U.S.
canonical identities represented by the 83 C83 source rows. The register locks
the entity join, canonical profile and registry routes, Lithuanian name, place,
institution/record type, denomination, and C83 lineage. The four public
campaign assignments are a stricter subset of the same register.

Research can update current status, building fate, pastoral conditions,
ownership changes, dates, sources, notes, and campaign actions without changing
identity. Any identity change requires a new hashed identity revision and
Vilija review. `scripts/verify-canonical-identities.mjs` checks the core record,
registry, and campaign layer against the independent register on every data
build.

Identity Revision 2 and Registry Revision 5 record the completed release audit:
all 83 frozen U.S. source rows have source-backed case files and resolve to 82
canonical identities. Four joins were corrected (Ansonia, Newark, Collinsville,
and Kansas City), and Westville's stale classifier pointer was repaired.
`scripts/verify-canonical-release.mjs` now enforces that full chain on every
data build. The audit ledger lives in
`data/candidates/canonical-identity-release-audit-2026-07-28.md`.

## Both directions of claim are guarded (2026-07-26)

A record must earn a **favorable** identity and an **ending** alike, and the
lifecycle field is not a licence for either. `audit-classification.mjs` first
checked favorable claims only when `canonical_status` was `standing`, and
terminal claims not at all; #82 closed the terminal gap, and the favorable
gate fell with `lithuanian-national-catholic-parish-waterbury-ct`, which held
`active_parish` under `canonical_status: unknown` on one medium-confidence
source that itself read `closed`. Two rules now apply to overlay-only records
regardless of lifecycle value: a favorable identity needs a watch entry or a
*verified* web survey, and a favorable identity may not contradict its own
source's `currentStatus` unless a watch entry or case record supersedes it
(layer precedence — the Boston and Rochester records carry stale web readings
their per-parish research has since corrected).

The **canonical** loop carried the same `standing` gate and it fell the same
day. Gating there was worse than redundant: `undecided` is a lifecycle value
the guardrails *require* for Maspeth and Elizabeth NJ, so the two records under
the most editorial protection were the two the block could never reach. Four
canonical records had been escaping it (Cleveland merged, Šv. Kazimiero
Philadelphia suppressed, Maspeth and Elizabeth undecided). Removing the gate
surfaced two live defects, both favorable overcounts invisible on every map
because other resolver rules already took priority:

- **Elizabeth NJ** read `active_parish` while its own case record said the
  parish was canonically merged into Polish St. Adalbert on 2009-07-01. The
  rubric's `active_parish` needs a *formally Lithuanian* parish; once absorbed
  into a non-Lithuanian host, surviving liturgy is `mass_continues`, which is
  never counted as a standing Lithuanian parish. Now `mass_continues` — and
  the 11:00 am Lithuanian Mass is aggregator-listed but unverified for 2026,
  which the situation text states. Still renders **Unresolved**: `undecided`
  is the resolver's first rule, so identity cannot make it read Closed.
- **Cleveland DMNP** read `active_parish` while its own situation text said
  "Closed Oct 18 2009 and merged with Sv. Jurgio." Šv. Jurgio, suppressed in
  that same merger, reads `lost`. The Lithuanian life in the building belongs
  to the successor record `sv-kazimiero-cleveland-oh`, which already claims
  `active_parish` — so one community was counted as two living parishes. Now
  `lost`; `building_fate` stays `repurposed_religious`, because the building
  genuinely is the successor's worship site. Building fate and identity answer
  different questions and a reused building is not a surviving parish.

Two further rules encode those findings. A record whose lifecycle status is in
`ENDED` may not claim `active_parish` (`mass_continues` is deliberately
permitted — it is the correct landing place for a suppressed parish whose
liturgy survives, as at Šv. Kazimiero, Philadelphia; and `undecided` is not an
ending, so the guardrail records stay exempt). And `active_parish` may not
stand against a case record reporting lost canonical independence. That second
rule encodes a convention the corpus already followed: of nine case records
reporting a loss of independence, eight were already downgraded to
`ethnically_transferred` or `lost` — Elizabeth was the lone outlier.

## Where fixed data does and does not propagate

Every chart, count, and map on the site is **computed at build time** from the
JSON in `data/`, so correcting a record is enough — nothing needs a separate
render pass. `/history` (`TimelineChart`, `ParishThreads`) takes `libParishes`
and `scopedParishes` as props and aggregates in `useMemo`; `lib/parishes.ts`
imports `parishes.json`, `figures.json`, and `parish-situation.json` directly.
`prebuild` runs `npm run data` ahead of every `next build`, and Vercel builds
on push, so a merged data fix ships correct figures with no extra step. There
are no pre-baked chart images in `public/`.

The one exception is `scripts/render-dispatch-map.mjs`, which writes a **static
map asset** for a Hearth dispatch. That file is a committed artifact, not a
build-time computation, so it does *not* follow a data fix — re-run it whenever
a record it depicts changes.

National Catholic records are historical witness only: `usRomanCatholic()`
and `ParishContextMap` both filter to `congregation_class === "roman_catholic"`,
so these congregations never enter Roman Catholic headline or diocese figures,
whatever their status. See binding guardrail 1 in `CLAUDE.md`.
