# Design → Codex handoff: go-live (homepage + All Profiles + keep Outcomes)

**From:** design
**Ground commit:** SOLP `main` @ `5bfd748` (PR #160 outcome flow + PR #161 buildings-precedence merged)
**Goal:** ship the redesigned **homepage** and the reconceived **All Profiles** directory, with
**Parish & Mission Outcomes** and the rest of the site kept as-is. This is a presentation change:
no new data, counts, classifications, or routes. Nav architecture is preserved. Every figure
comes from the canonical projection.

> This document is the single go-live receipt and **supersedes** `handoff-codex-homepage-design.md`
> (homepage-only), which has been retired.

### Design-reference inventory (in this project)

| Reference file | Ships to | This tranche |
|---|---|---|
| `Homepage Directions.dc.html` (option **1a "The Atlas"**) | `app/page.tsx` | **YES** |
| `All Profiles v3.dc.html` (categorized directory; supersedes v2) | `app/parishes/page.tsx` | **YES** |
| `Where Every Parish Ended Up.dc.html` | `/where-every-parish-ended-up` | kept as-is (already live) |
| `Parish Profile v3.dc.html`, `Profile Variants.dc.html`, `Profile Cases.dc.html` | `/parishes/[slug]` | kept as-is (already live) |
| `Draugas Mentions.dc.html` | Draugas source route (Codex-owned) | kept as-is |

The `.dc.html` files are **layout/behavior references only**, never parish evidence. Build from
canon; lift spacing, type, color, and interaction from the reference. Both render offline with the
sibling `support.js`; the directory reads the sibling `data/all-profiles-155.json` **design fixture**
(do not ship — see the data mapping below).

---

## 1. Homepage — `app/page.tsx` (adopt 1a "The Atlas")

Order, top to bottom:
1. **Masthead frieze** — the church-illustration procession (existing `ChurchProcession`
   drawings) directly under the header, with the "first parish · St. George, Shenandoah · 1893
   church" caption.
2. **Title + intro** + the one-line "one record, three populations" index
   (155 institutions · 137 Roman Catholic (132 parishes + 5 missions) · 131 worship sites).
3. **The map, full-width**, as the first substantial interaction, with the legend/filter rail
   (community shapes + status key + marker notes). `ParishMap`, unchanged data.
4. **Parish & Mission Outcomes band** — the single filled-red primary CTA; the only primary
   path treatment on the page. Secondary doors beside it (The History, All Parish Profiles,
   Church Buildings Through Time, Lithuanian Catholic Life Today).
5. **Happening now → Active campaigns** (existing campaign cards + artwork).
6. **On the watch list** — its **own heading**, not a subsection of campaigns: two columns
   "Developments to monitor" and "Buildings at risk".
7. Editorial "communities built them" + **Židinys (The Hearth)** subscription block — preserved
   verbatim.

**Nav fidelity:** the header nav and its Explore / Guidance / About dropdowns render exactly the
items `app/layout.tsx` already defines (Explore's 9 pages, Guidance's 3, About's 3, plus the
Židinys external link). "The History" is also surfaced as the first secondary door in the
Outcomes band. No nav items added, removed, or relabeled — including the label
"Parish & Mission Outcomes" itself (a rename there is a content decision for research, not design).

**Removed:** the "The national record — four figures tell the scale of the loss" section
(`NationalRecordGraphic`). No stat strip replaces it.

## 2. All Profiles — `app/parishes/page.tsx` (categorized directory)

The v2 timeline is retired. Render all 155 institutions in the v3 directory:

- Two views: **By outcome** (default), in canonical outcomes-page order, and **A–Z**.
- Three columns on desktop, alphabetical within each group using Lithuanian collation.
- Each compact entry carries the status dot, name, place and short diocese, institution class
  and record type, mono founded–closed years, and a link to `public_profile`.
- Sticky controls: search, view toggle, State and Diocese filters, A–Z quick index, result count,
  and Clear all when filtering.
- The footer carries only the institution-versus-building scope note.

### Data mapping (build from canon, not the design fixture)

The design used `data/all-profiles-155.json`, generated from the canonical projection. **Do not
ship that fixture.** The component must read the projection directly. Directory fields come from
`canonical-infographic-projection.json → institution_history` (155 records):

| Directory field | Source |
|---|---|
| name | `canonical_name` (segment before first comma); `name` = Lithuanian, included in search |
| city / state | `city`, `state` |
| diocese | `jurisdiction.canonical_name` |
| founded / closed | `founded.year`, `closed.year` |
| status color | `status_group` (`active_parish`,`mass_continues`,`transferred`,`unresolved`,`closed`,`unverified`) |
| record type | `record_type` (`parish`/`misija`/`congregation`) |
| institution line | `institution_class` + `record_type` |
| profile href | `public_profile` |

Status colors are the existing `--es-*` variables; keep `#b3aca2` marker-fill only, never text.
Preserve the selectors named in the data contract; do not read raw `parishes.json`.

## 3. Everything else — keep as-is

Parish & Mission Outcomes (`/where-every-parish-ended-up`), the profile pages, Church Buildings
Through Time, and all Explore/Guidance/About routes are **unchanged** this tranche. Nav dropdowns
stay exactly as `app/layout.tsx` defines them.

---

## Verify against canon at your commit (please confirm before ship)

- The three population figures (155 / 137 (132+5) / 131) and the six `status_group` counts
  (98 closed · 24 transferred · 5 mass · 10 active · 5 unresolved · 13 unverified = 155).
- Campaign / watch-list counts on the homepage (4 organizing; watch list = developments +
  buildings at risk) — most likely to have drifted since this commit.
- St. George, Shenandoah as the earliest-foundation "first parish (1893 church)" caption.
- No retired alias, research lead, phase, or context record leaks into the public map, the index
  line, or the directory — design pulls only from the published projection; please spot-check.

## Out of scope / next tranche

- **Explore** section pages — we'll redesign those next, separately.
- Contrast/absent-state wording follows the project contract (`#78716c` secondary, `#7d1f1f`
  losses/gaps). Cleared-rights imagery only (`permission_granted`/`public_domain`/`open_license`/
  `own_work`); `pending_permission` renders nothing.

## Validation gate (design does not weaken these)

`npm run data` · `npx tsc --noEmit` · `npm run lint` · `npm run build`. The profile-layout
validator is authoritative. Any factual conflict surfaced during build comes back to research —
design will not adjudicate facts in code.
