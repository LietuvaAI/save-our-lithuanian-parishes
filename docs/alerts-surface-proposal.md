# Alerts surface — design options (proposal, not built)

> **Superseded 2026-08-06.** This is a historical design proposal, not an
> operating data contract. Current events are adjudicated in Brain, bound to
> canonical entity IDs and sources, built as a content-hashed projection, and
> imported mechanically by the site. `data/alerts.json` is retired and forbidden
> by the build.

**Historical context:** Parish Watch (culturenet-brain PR #388) produced `alerts.jsonl` for research review.

## Option A — "Happening now" strip + /now page (recommended)

- `data/alerts.json` snapshot (guardrail-compliant wording baked in at snapshot time).
- Homepage: the existing HAPPENING NOW box generalizes into a strip showing the red items (currently 3), each one line + date + link.
- New `/now` page: all 8 items grouped red/amber, each with what-changed, date observed, sources, and a link to its parish page — case-record profile for case-filed parishes, `/registry/[slug]` profile for registry-layer ones (Freeland, St. Ann of the Dunes). One footer link.
- Why recommended: this is the armory's "advocacy-in-time" job made visible — the site's strategy already says the armory is headline-adjacent. Small surface (one page + one strip), snapshot cadence matches the sweep cadence, and the case-filed/155 distinction is stated once on /now rather than woven through nav copy.

## Option B — per-parish alert banners only

- Same `data/alerts.json`, rendered only as a dated banner atop the affected parish's own profile page.
- Smallest footprint, no new page; but there is no aggregate "what is happening now" view, so the movement/intake job (the reason Parish Watch exists) stays invisible to a first-time visitor.
- Natural phase 2 *inside* Option A rather than an alternative.

## Option C — full /watch page (the 155-row watch table)

- Publish the whole watch list with alert levels and status_current.
- Most complete, but premature: it would publish 44 `unknown` rows and ~9 unreconciled duplicate-registry clusters, and it invites confusion with the locked case-filed figure. Defer until a few sweep cycles stabilize the list and the registry team reconciles the duplicates.

**Recommendation: A now, B folded in as its phase 2, C deferred.**
