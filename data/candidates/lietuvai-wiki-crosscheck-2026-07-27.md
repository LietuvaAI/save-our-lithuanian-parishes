# Cross-check: our registry vs lietuvai.lt wiki "JAV lietuvių katalikų bažnyčios" (2026-07-27)

Source: https://lietuvai.lt/wiki/JAV_lietuvi%C5%B3_katalik%C5%B3_ba%C5%BEny%C4%8Dios
(fetched via the wiki's public MediaWiki API; the rendered site sits behind an
anti-bot gate). The wiki lists 142 churches with per-state sections, active/closed
groupings, addresses, and often day-precise closure dates. Parsed entries:
lietuvai-wiki-entries-2026-07-27.json (142/142, matches section headers exactly);
matches: lietuvai-wiki-matches-2026-07-27.json (133 pairs).

## 1. On the wiki, not in our registry — THREE real parish leads

- **Camden, NJ — Šv. Jurgio (St. George), est. 1912, listed ACTIVE** — no Camden
  record exists in our registry at all. Strongest lead of the sweep.
- **Hanover, PA — Šv. Juozapo filija, est. 1892** — a filial church (Luzerne
  County anthracite belt); predates much of our PA coverage.
- **Plano, IL — Šv. Marijos, est. 1906, closed** — no Plano record in the registry.

Six other wiki-only entries are religious-house chapels (Kennebunkport Franciscan
monastery, Putnam sisters, Marianapolis Marians, DC Šiluva chapel, St. Petersburg FL
Franciscans, Chicago Sisters of St. Casimir motherhouse) — outside our parish scope
by design; a possible future "religious houses" layer.

## 2. In our registry, not on the wiki — expected depth difference

58 of our US RC records have no wiki entry. Most are by-scope (proposed parishes,
unnamed single-source rows, colonies, schismatic/independent congregations,
known duplicate rows queued for batch-4 merges). The wiki at 142 entries is
substantially shallower than our 220-record registry; several canonical parishes
(Oglesby, Kansas City ×2, Brooklyn Šv. Jurgio, Esplen, Archbald, McAdoo,
Wilkes-Barre Šv. Pranciškaus) are simply absent there. No action for us; possibly
a courtesy contribution to them someday.

## 3. Status: net agreement, two items of note

After discarding matcher noise (verified by hand), the wiki agrees with our
classification on the surviving parishes — including Nativity BVM and Brighton
Park as active. Remaining:
- **Bayonne Šv. Mykolo — RESEARCH LEAD:** wiki lists it ACTIVE; our canonical row
  says diocese_closed (no year). Our own under-threat future list also implies a
  living parish. Internal + external tension — needs a current-status check.
- Rochester (wiki "closed 2010" vs our "standing"): definitional — the wiki tracks
  the sold church building (2010), our R2 record tracks the parish community,
  adjudicated standing. The 2010 building date is a useful capture.
- Elizabeth (wiki "active" vs our "unresolved"): consistent — ours is the finer
  classification.

## 4. Years: ~59 differences, two classes

Most founded-year differences are definitional (congregation organized vs parish
erected vs church built — e.g. Boston is listed by the wiki itself as 1895/1904).
The valuable subset is **day-precise closure dates we lack or contradict**, direct
input for the 16 closure-year gaps and 6 variances (Batch 1/4):
- Minersville Šv. Pranciškaus: **closed 2011-06-26** (ours read "2020" from web
  sources; our founded reading 1950 is also clearly wrong vs wiki 1895/1913)
- Scranton Šv. Juozapo: **closed 2011-06-05** (ours 2009)
- Wilkes-Barre Švč. Trejybės: **closed 2010-05-30** (ours 2015 — likely conflates
  closure with the 2015 demolition)
- Pittston Šv. Kazimiero: **closed 2010-08-29** (ours 2008)
- New Haven Šv. Kazimiero: closed 2005 (ours 2001)
- Rochester Šv. Jurgio: building closed 2010

The wiki also has per-parish pages (e.g. Hartford_Holy_Trinity_Church) with
addresses, Mass schedules, and contacts — a candidate source for the
sustainability-watch research method list.

## Disposition

Wiki dates are ATTRIBUTED SECONDARY readings — nothing here changes a record
directly; every item flows through adjudication (closure dates likely trace to
diocesan announcements and should be primary-source-confirmed). Feed: the three
parish leads + Bayonne status check → research lane; the closure dates → the
Batch 1/4 closure-year work; lietuvai.lt wiki → add to the research-method
source list.
