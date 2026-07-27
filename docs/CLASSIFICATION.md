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
  1902 entry) and only the first is established as distinct.
