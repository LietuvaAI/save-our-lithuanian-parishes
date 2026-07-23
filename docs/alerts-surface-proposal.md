# Alerts surface — design options (proposal, not built)

**Context:** Parish Watch (culturenet-brain PR #388) produces `alerts.jsonl` — currently 8 red/amber items, refreshed weekly (red) / biweekly (amber) / monthly (full sweep). The Hearth's dispatch queue consumes it directly (out of scope here). Question: how does the *site* surface these? Per data discipline, whatever is chosen lands as a snapshot by PR (`data/alerts.json`), never a live feed.

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
