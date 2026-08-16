# Parish profile — locked design spec

Reference implementation: `Parish Profile v3.dc.html` (Divine Providence, Southfield MI).
Locked 2026-07-31; revised 2026-08-01 for the canonical projection (Brain #463, site #138). Applies to `app/parishes/[slug]/page.tsx` and every component it renders.

This document exists so the profile design stops drifting. If a change is needed, change
this file first, then the code.

---

## 1. The problem it solves

The previous profile had no type scale (six competing heading sizes), no consistent section
structure (each section invented its own container), a rule or border on almost every element,
and the same fact stated three times. This spec replaces all of that with four rules.

---

## 2. Type scale — five steps, no others

| Step | Value | Used for |
|---|---|---|
| Title | `600 31px/1.1` Source Serif 4, `-0.02em` | the parish name (`h1`), once per page |
| Subhead | `600 20px/1.2` Source Serif 4 | overlay/modal titles only |
| Lead | `400 16.5px/1.6` Source Serif 4 | the opening paragraph (the dek) |
| Narrative | `400 15.5px/1.66` Source Serif 4 | all history and status prose |
| Data | `400 14.5px/1.45` Geist | field values, chronology headlines (600 weight) |
| Fine | `400 13.5px/1.55` Geist | chronology detail, source lines, secondary notes |
| Label | `500 10.5px/1.5` Geist Mono, uppercase, `.15em` (rail) / `.09em` (field) | every label |

Section headings are **Label**, not serif. The rail label is what carries structure —
that is the device that replaces the removed boxes. Never set a section heading in serif.

## 3. Colour — four values, from `app/globals.css`

- `#1c1917` ink — all primary text
- `#78716c` muted (`--muted`, LIGHT mode) — every label, every secondary line
- `#7d1f1f` accent (`--accent`) — loss, threat, primary action
- `#f0ece3` / `#e7e5e4` hairlines; `#f3eee2` (`--band`) for the one tinted block

**Never `#a8a29e` or `#c4bdb3` in light mode.** `#a8a29e` is the DARK-mode `--muted`; both
fail contrast on `#fffdf9` (2.5:1 and 1.8:1). This regressed twice — check it.

## 4. Structure — one section pattern, no exceptions

```
grid-template-columns: 158px minmax(0,1fr); gap: 0 40px;
border-top: 1px solid #e7e5e4; margin-top: 32px; padding-top: 26px;
```

Left cell: the rail label (plus an optional two-line mono note — record date, source count,
"most recent first"). Right cell: the content. Every section is identical in structure
regardless of what it contains. **One hairline per section, at its top. No card borders, no
rounded boxes, no `border-l-2` accents, no `divide-y`.**

Two blocks are deliberately different, and only these two:
- the alert band — `#f7ece9` fill, `3px` left border in `#7d1f1f`, no other border
- the report CTA — `#f3eee2` fill, no border

## 5. Section order

1. **Identity block** (2-col: `272px` visuals / narrative). Left: line art, then diocese map.
   Right: name, alt name + place, status strip, four-field row, dek, alert band, then
   **"The community and its place"** — the narrative overview, under a mono field label,
   running long enough to finish level with the map.
2. **Chronology** — newest first; institution and building events in one story, each marked.
3. **Worship sites** — one row per building. `118px` range / content, outcome stated per site.
4. **Related records** — typed relationships, each linked to its own profile.
5. **Where it stands today** — only what is unresolved, plus "what the record cannot yet establish".
6. **Evidence** — grouped ledger.
7. Report CTA.

There is no separate "At a glance" section and no separate "The history" section. Both were
absorbed into the identity block. There is no "pastoral conditions" panel: current pastoral
facts are either a universal field, the alert band, or "Where it stands today".

## 6. Say each thing once

- **Status** is stated once: the coloured dot + label in the status strip. Not also a pill,
  a fact row, and a prose sentence.
- The status strip carries: status · founding · diocese. Nothing else.
- The four-field row carries only fields that are **true for every institution**:
  Institution, Existed, Current church, Lithuanian Mass.
  "Current church" carries the **building's own dedication year** plus the site count, linked to
  §Worship sites — a reader must be able to see, in the identity block, that the standing church
  is younger than the parish. It is safe here only because the label names its unit; a bare
  "Church building" field silently blends a building fact into an institution row. Ownership and
  per-site outcomes stay in Worship sites.
  No Jurisdiction/Planning Area (diocesan restructuring vocabulary is not universal and
  changes under the record).
- "Where it stands today" does not restate that the parish is open. It states what is unresolved.

## 6b. Institutions, buildings, and continuations are three different things

The single hardest rule on the page, and the one the old design broke silently.

- A **parish institution** has a founding and an ending. That is what "Existed" and the status
  strip carry, and what the History view counts (132).
- A **worship site** has a dedication, replacement, demolition, sale, or reuse. Those are
  building events (131 sites site-wide) and never appear as a founding or ending date.
- A street address also belongs to the **worship site**, not to the parish institution. The
  profile may summarize only its Brain-selected terminal site's address. Every site row must
  retain Brain's certainty label: established address, recorded location, reported but
  unresolved address, or address not established. The site never maintains a second address
  lookup or upgrades a recorded location to an established fact.
- A **continuation** is a typed relationship (51 site-wide), not a merge of records.

Design consequences:
- In the status strip, the founding year is the **institution's** — never a root parish's,
  never a building's. Divine Providence reads "Founded 1949", not "Roots to 1908".
- In the chronology, every building event carries a mono `Worship site` tag above its
  headline. An untagged row is an institutional event. This is the visual guarantee that no
  building date is read as a parish date.
- A predecessor is never absorbed into the survivor's headline. Šv. Antano (1920–2013) keeps its
  own profile and appears as a Related record with its relationship named.
- Where no relationship is documented, the institution does **not** appear in Related records.
  Name it in prose under the list instead ("the record documents no continuity relationship") —
  proximity is not lineage. Related records lists typed edges only.

### Relationship labels — the only permitted vocabulary

Labels are directional: which side of the edge this profile is on decides the wording.

| `continuity_edges` type | This profile is source | This profile is target |
|---|---|---|
| `congregation/canonical-life-continued-in` (9) | Continues in | Continues here |
| `institution-merged-into-institution` (39) | Merged into | Merged in |
| `institution-originated-from-institution` (1) | Originated from | Origin of |
| `institution-succeeded-by-institution` (1) | Succeeded by | Successor to |
| `institution-renamed-as-same-entity` (1) | — | — |

No other label may be rendered. `Predecessor` and `Same community` are retired: neither is a
type in the data. Never humanize an unrecognised type into a label — an unknown type is a data
bug and must render nothing.

`institution-renamed-as-same-entity` is a self-edge (Divine Providence). It is excluded from
Related records entirely; a rename belongs in the chronology as an identity event.

### Linking an endpoint

An endpoint's internal entity slug is not a route. Resolve `entity_id` to
`institution_history[].public_profile` and link only that. Of 98 unique endpoints, 89 internal
slugs are not public routes: 45 have a public profile under a different slug, and 44 are
successor or context institutions deliberately outside the public registry.

An endpoint with no public profile renders as **plain dark text, not a link** — same row, same
dates, with a mono qualifier naming what it is (`Congregation record · no public profile`,
`Successor institution · outside the public registry`). A relationship the record holds is never
hidden because its other end has no page, and never pointed at a 404.

Reference cases: St. Peter South Boston carries a **linked** `Continues here`; Frackville carries
an **unlinked** `Continues in`. Divine Providence carries neither — its edges are `Originated
from` Šv. Jurgio (linked), `Merged in` Šv. Antano (linked), and a suppressed same-entity rename.

### Building outcome — semantic precedence, not array order

A site's outcome is the current condition, chosen by dated semantic precedence, never the last
entry in `condition_relationships`. Demolition wins outright; a specific current reuse outranks
generic standing; compatible current conditions are shown together. St. Anthony Detroit carries
`building-listed-for-sale`, then same-date `building-repurposed` and `building-standing` — the
tail reads "Building standing" and hides the repurposing. It must read `Repurposed, standing`.

### Survived review, then closed

Seven institutions carry `core.survivedReviewThenClosed` (New Britain St. Andrew, Waterbury
St. Joseph, Detroit St. Anthony, Omaha St. Anthony, Philadelphia St. Casimir, Philadelphia
St. George, Maspeth Transfiguration). It renders as a red mono line at the end of the history
paragraph on the institution's own profile, and on the row of any Related record that carries
it — never as its own card or panel. A closure that came after the parish already survived one
review is the most consequential fact on those seven pages; dropping it is a regression.

### Outside the U.S. projection

The three Canadian comparator profiles are not in the U.S. infographic projection and therefore
have no institution dates, worship sites, or relationships. Those sections are omitted and the
absence is stated once ("Institution dates, worship sites, and relationships are projected for
U.S. institutions only") — never rendered as empty sections or as a silent null.

## 6c. Public unit vocabulary

Never blend these, and never display a count without its unit:

| Count | Unit |
|---|---|
| 154 | public U.S. institutions |
| 132 | U.S. Roman Catholic parish institutions |
| 88 | closed Roman Catholic parish institutions |
| 55 / 3 | dated parish endings since 1990 / since 2020 |
| 131 | physical worship sites |
| 51 | public continuity relationships |
| 15 | Pennsylvania Coal Region parish institutions |
| 4 / 18 | missions / national, independent, or Protestant institutions |
| 3 | Canadian comparators, outside every U.S. total |

192 is an internal research-record count and never appears publicly. 56-since-1990 and
5-since-2020 are retired errors (they mixed parish endings with later building events).

## 7. Chronology

Newest first. Row: `104px` mono date / content, `gap: 0 22px`. The date column is the same
width in chronology, Worship sites, and Related records, so every content edge on the page
lines up. Date cells are `white-space: nowrap` with `font-variant-numeric: tabular-nums` and
`padding-top: 2px` to sit on the headline's baseline. Two-date ranges are set nowrap too — the
104px column is sized to hold the longest one, so no date ever wraps.

**Date colour is a predicate, not a judgement call:**
```
isLoss(event.endState) || event.kind === 'threat'  →  #7d1f1f
otherwise                                          →  #78716c
```
Red therefore covers closure, demolition, transfer away from the community, and a documented
threat of any of those. The rail states the rule to the reader: "Red marks a loss or a threat of one."

## 8. Evidence ledger

Grouped, `#78716c` group labels, newest first **within each group**. Group order:

1. **Archival record** — scanned books (`archyvas.ziburioltmokykla.org`), with the rights note
   for in-copyright works: "citation and fair-use extract only".
2. **Newspaper record** — Draugas issue PDFs from `data/draugas-links.json`, newest first;
   `status: "gated"` renders as "subscriber access". Then the 1909–2007 registry line with
   mention count and first/last mention.
3. **Field survey** — True Lithuania and similar.
4. **Current record** — case-record and alert sources, newest first.

Numbering runs continuously `01…nn` across groups. The rail shows the count and confidence.

## 8b. Draugas sources page

Reference implementation: `Draugas Mentions.dc.html`.

A registry line that states a mention count without reaching the mentions is a dead end. So:

- **More than 10 registry mentions** → the parish gets its own `/parishes/<slug>/draugas` page,
  and the ledger's registry line becomes the link to it ("Draugas registry, 1909–2007 — all 211
  mentions").
- **10 or fewer** → the issues are listed inline in the Newspaper record group. No extra page.

The page carries, in order: a plain-language gloss of what *Draugas* is (it cannot assume the
reader knows), the scope line (count, span, first and last mention), then issues grouped by
decade, newest decade first, on the same `104px` date column as the profile.

**Three states, counted separately and never merged:**

| State | Renders as |
|---|---|
| Linked | ink title, href to the issue PDF, access noted (open / subscriber) |
| Dated, not yet linked | muted title, "Registry entry · issue page not yet linked" |
| Undated | not listed; counted in a "Not listed" block that says why |

Every one of those figures is **derived from the data at render time** — never a hand-typed
`resolved` field. Both regressions caught in review were a typed count drifting from the rows
on the page. The "Not listed" block exists because a count with nothing behind it reads as a
bug; it states that the index gives a total and its first and last date but not a date per
mention.

## 9. Diocese map

Data and geometry are unchanged from `components/ParishContextMap.tsx` (the v6 construction
spec: 1.5:1 frame, 0.35 bbox pad, cell fanning, open rings for living worship, dashed halo on
the subject). Only the chrome changes:

- In the identity block it renders **borderless** on paper, with an "Expand ↗" affordance.
- The filter button row is removed from the inline version.
- Clicking opens an overlay: large map + a hoverable, linked list of every marker in frame,
  grouped this-diocese-first, with a live readout line and the full legend.
- Hovering a marker or a row highlights both. Selecting either opens that parish profile.
- The caption must explain the faded markers: they are recorded Lithuanian parishes in
  neighbouring dioceses. Without that line the count and the visible dots appear to disagree.

## 10. Line art

Renders on paper with `mix-blend-mode: multiply` and **no band or border behind it** —
the band fought the drawing's own white ground.

## 10b. Research narration is not content

Failed searches, inaccessible websites, and descriptions of the research process never appear
on a profile. They belong to the research record and About the Data. The profile states what
the record establishes, and separately what it cannot yet establish.

## 11. Provenance obligations

The design foregrounds "Verified", so the copy has to earn it.

- Never assert a fact the record does not carry. Where the record conflicts, **show the
  conflict** — `registry-unified.json → conflicts` and `years` are content, not noise.
  Contradictions are **preserved visibly and flagged for Codex** — never resolved in
  presentation code. Example: Divine Providence is founded 1949 canonically; the 1946 jubilee
  implication and the 1949-vs-1965 Šv. Jurgio conflict are stated in "what the record cannot
  yet establish", not smoothed away.
- Root/successor relationships must be stated, not collapsed. Šv. Jurgio Detroit is its own
  record, 1908–1965. Writing "Divine Providence was founded 1908 as Šv. Jurgio" contradicts
  both the map and the Related records block on the same screen.
- Mass schedule, current use, and threat language all come from `data/case-records/*.json`.
  Wrong values there surface as wrong values here — fix the record, not the page.

---

## Data sources (canonical, post-#463/#138)

`data/canonical-infographic-projection.json` · `data/site-figures.json` ·
`lib/infographic-projection.ts` · the canonical parish-profile view model.
Presentation reads these. It does not recompute populations, re-derive regional scopes,
or hard-code totals.

## Coverage as of 2026-08-12

Denominators from the canonical `counts` block, not recomputed: 155 `public_us_institutions`,
132 `roman_catholic_parish_institutions` (the 3 Canadian comparators are separate and outside
this total; 192 is the internal research count and never public). Imagery counted by the
cleared-rights rule only — `pending_permission` renders nothing (§Imagery in CLAUDE.md):

- Over all 155 public institutions: line art 38 · photo but no line art 8 · image held, rights pending 4 · no imagery at all 105

Imagery is the largest presentation gap: 105 of 155 profiles render nothing, so the no-image
rail is the default layout, not the exception. "No image exists" (105) and "image held, rights
pending" (4) are distinct states with distinct wording and must not be merged.

**Flag for Codex:** §6c above lists `154 | public U.S. institutions`, but the canonical
`counts.public_us_institutions` is now **155**. One of them is stale — reconcile in canon and
update §6c to match; do not let presentation pick a number.

Gap list, regenerated from canonical source: `line-art-gap.json`.
