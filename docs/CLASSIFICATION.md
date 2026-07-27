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

- Upstream `parishes.csv` (brain lane, next snapshot): stale notes lines
  contradicting reconciled identities (East St. Louis "still officially
  Lithuanian"); Waterbury St. Casimir existence question; Hartford lifecycle
  once the locked figures are re-locked (issue #17).
- Closure years missing for ~16 pre-2008 closures (research queue; pages
  show "Not established" honestly).
- Upstream `gazetteer.csv` (Draugas lane, config-as-truth): the unnamed 1902
  Waterbury church (`lithuanian-church-waterbury-ct`) carries `status=closed`
  with an empty closure year — the likeliest origin of the ending this repo's
  overlay inferred and then counted, corrected 2026-07-26. The column feeds
  only geocoding here; fix it at the source on the next gazetteer revision.
- Waterbury needs a name-level reconciliation: three Roman Catholic records
  sit on the same city centroid (Šv. Juozapo, Šv. Kazimiero, and this unnamed
  1902 entry) and only the first is established as distinct. New input from the
  2026-07-26 national-catholic verification: the Lithuanian National Catholic
  congregation in Waterbury was founded in **1902**, the same year as the
  unnamed Draugas entry, so the two records may be one congregation seen from
  either side of the schism. Draugas coded its entry `roman_catholic`, which
  argues against the identity but does not settle it. Resolve name-level before
  either record is counted anywhere.

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
