# Handoff: The Living Network — "Lithuanian Catholic Life Today" page redesign

Target: `saveourlithuanianparishes.org/lithuanian-catholic-life-today` (Next.js site).

## Overview

A full redesign of the "Lithuanian Catholic life today" page as **"The living network."** One page tells the current-state story: a hero map of the 14 places where Lithuanian worship still gathers (over the 9 states that hold them), a stat panel, then every community as a card — active parishes and missions, hosted Masses, the rest of the Sielovada listing, and parishes tracked outside the listing — with campaign/watch situations attached to each community's own card, never duplicated into a separate list.

## About the design files

The files in this bundle are **design references created in HTML** (a prototype with JSON data files). They show intended look and behavior — they are not production code. Recreate this design in the site's existing Next.js/React environment using its established components, data selectors, and patterns. All data shown is drawn from the canonical projections; keep it that way in the implementation (see Data contract). (The prototype HTML runs inside the design tool's runtime; treat it as a readable reference for markup, styles, and logic rather than a standalone page.)

## Fidelity

**High-fidelity.** Colors, type, spacing, and copy are final unless noted. Recreate closely, mapping to the site's existing token system where it already matches.

## Data contract (IMPORTANT)

Everything on the page derives from canonical sources — no hand-entered facts:

- `current_pastoral_network` in the canonical infographic projection: the 20-entry Sielovada directory (`networkClass`: `active_parish` ·6, `active_mission` ·2, `mass_continues` ·6, `no_lithuanian_liturgy` ·4, `directory_conflict` ·1 (Hartford), `religious_house` ·1 (Kennebunkport)), plus the 14 `members`, ministry lines, clergy names, official sites.
- Alerts/campaign records: 4 campaigns (kind `active`: Divine Providence, Hartford, Waterbury, Maspeth), 4 developments to monitor (kind `watch`), 2 buildings at risk (kind `building`), each with `whatChanged`, `parishLink`, `hearthUrl`, `actionUrl`/`actionLabel`.
- `sustainabilityWatch` records: per-parish clergy arrangement, Lithuanian-Mass cadence, and `dateObserved` (the "Checked YYYY-MM-DD" stamps).
- Shared geo layer (`context-points.json`, pre-projected geoAlbersUsa 975×610) for map coordinates; `map.json` for state shapes.
- Line drawings only where the photo registry shows cleared rights (`permission_granted`, `public_domain`, `open_license`, `own_work`). `pending_permission` renders nothing. A community without a cleared drawing shows the plain cream frame — never a stock image.
- Known data notes for Codex: (1) four new line drawings pending — Rochester (St. George at Our Lady of Lourdes), Washington (Epiphany), New Philadelphia (Holy Cross), Scranton (Holy Rosary); wire them onto those cards when they land in the registry. (2) The Cleveland "Closed by the Diocese, Reopened by Rome" dispatch (Polish St. Casimir story) was removed from the Hearth and Brain; it must not render anywhere; drop the stale `cleveland-st-casimir-watch` dispatch on the next refresh. (3) The Washington point sits at the DC shape center (828, 267.5 in the 975×610 frame) so the state hit-test shades DC, not Maryland.

## Page structure (top to bottom)

1. **Header block**
   - Eyebrow: `LITHUANIAN CATHOLIC LIFE TODAY · CHECKED 2026-08-03` — 11px, uppercase, letter-spacing 0.09em, weight 600, #78716c.
   - H1 "The living network" — Source Serif 4, weight 600, clamp(27px, 3.3vw, 36px), line-height 1.16, letter-spacing −0.015em, #1c1917.
   - Dek (Source Serif 4, 19px/1.4, #57534e, max 66ch): "Of the 137 Lithuanian Catholic parishes and missions ever founded in America, worship still gathers regularly in **14 places** across 9 states — 6 parishes, 2 missions, and 6 Lithuanian Masses hosted inside other parishes." (Bold figure in #1c1917.)

2. **Map + stat panel** — wrapping flex row (map `flex: 1.6 1 420px`, stats `flex: 1 1 280px`, gap 30–34px), top border 1px #1c1917, so it stacks on phones.
   - Map heading: "The 14 worship places on the map" (Source Serif 4, 18px, 600). Caption (12.5px/1.55, #57534e): "Green and gold dots are the 14 places with current Lithuanian worship; the shaded states are the 9 they stand in. Hover a dot to name it."
   - **SVG map**, viewBox `40 120 900 270` over the shared 975×610 frame. States fill #faf7f1, stroke #e7e2d9 (0.7px). The 9 states containing a member point fill **#f1e8d3**, stroke #dccfae (derive membership by point-in-polygon against the state shapes, or a precomputed state list — do not hand-pick).
   - **Dots** (r=7; hover r=8.5 + 1.6px #1c1917 ring): active parish = solid #2d6a4f (1px #fffdf9 stroke); mission = hollow (#fffdf9 fill, 2px #2d6a4f stroke); hosted Mass = #d5c28b fill, 1px #8a7a4e stroke. Native `<title>` tooltip AND a live readout line under the map (12.5px, #57534e, `aria-live=polite`): **English name first, Lithuanian in parentheses** — "St. Peter Lithuanian Parish (Bostono Šv. Petro lietuvių parapija) — Boston, MA. {ministry line}". Clicking a dot smooth-scrolls to that community's card (cards carry `id={slug}`, `scroll-margin-top: 20px`).
   - **Chicago inset**: dashed rect around the Chicago cluster (x606 y200 w52 h44), dashed leader line, inset box at (712, 266) 140×118 (#fffdf9 fill, 0.8px #78716c stroke), cluster dots redrawn at ~2.55× scale with the same styles/behavior. Right-aligned caption under the map: "Inset: the Chicago area, enlarged" (10.5px #78716c).
   - **Stat panel**: big figure 14 (Source Serif 4, 46px, 700) + "places still gather for regular Lithuanian worship" (13px #57534e), bottom border #e7e5e4; then a 2-col grid of four stats (26px serif figures with 12px labels), each with its map swatch: 6 Lithuanian parishes (solid green circle), 2 Lithuanian missions (hollow green), 6 hosted Lithuanian Masses (gold), 9 states coast to coast (dashed grey circle).
   - Definition note (12px/1.6 #78716c): "“Lithuanian parish” and “Lithuanian mission” mean a community listed on [Sielovada](https://sielovada.org/siaures-amerika/) — the Lithuanian Bishops' Conference directory of Lithuanian pastoral care abroad — with verified current Lithuanian ministry. A parish can remain open without being part of this network." Then: "Source: Sielovada: North America · About the data" (links).

3. **Section: "Active Lithuanian parishes and missions"** — count "6 parishes + 2 missions". Intro: "These 6 parishes and 2 missions are Lithuanian-led and hold regular Lithuanian worship. Missions use a hollow map mark."
4. **Section: "Lithuanian Masses hosted by other parishes"** — count 6. Intro: "In these places the Lithuanian parish itself is gone, but a Lithuanian Mass continues inside a parish that is no longer Lithuanian-led — never counted as an active Lithuanian parish."
5. **Section: "Listed by Sielovada, without regular Lithuanian worship"** — count 6. Intro explains Sielovada lists 20 U.S. entries; the 14 above account for 14; these are the other six: one religious house, one contested closure, four with no verified regular Lithuanian Mass — "stated absences, kept as visible as the network itself."
6. **Section: "Also being tracked"** — count 5. Intro: these parishes are off the Sielovada listing because their Lithuanian parish life has already ended; Sielovada lists only communities with current pastoral care; the project tracks them anyway (one closure appeal, planning-area consolidations, buildings on the market or facing demolition).
7. **Footer line** (12px #78716c, top border #e7e5e4): "Every community name links to its full profile where one exists. Map positions come from the project's shared geographic layer; Washington is placed at city level. Network checked 2026-08-03 against Sielovada: North America, the Lithuanian Bishops' Conference directory. Data revision 2026-08-03."

### Section header pattern (all four sections)
Flex row, baseline-aligned: H2 (Source Serif 4, 20px, 600) + count (14px, 600, #78716c, tabular-nums); 1px #1c1917 bottom border; intro paragraph 13px/1.55 #57534e, max 76ch.

## The card (one pattern for every community)

Grid: `repeat(auto-fill, minmax(196px, 1fr))`, gap 20px 18px, margin-top 18px.

Anatomy, top to bottom:
1. **Drawing frame** — aspect-ratio 3/2, background #faf7f1, 1px #efece6 border; the parish line drawing letterboxed (`object-fit: contain`, multiply blend so the cream shows through). No cleared drawing → empty frame. Image links to the profile.
2. **Type tag** — 11px uppercase, 0.06em, weight 700. "Lithuanian parish" / "Lithuanian mission" = #2d6a4f; "Hosted Lithuanian Mass" = #8a7a4e; "On the Sielovada listing" = #78716c; "Religious house" = #2d6a4f; tracked-card tags live in the situation box instead (see below).
3. **Name** — English name, Source Serif 4, 16.5px, 600, links to profile (hover #7d1f1f). No profile → plain text.
4. **Lithuanian name** — 12px italic #78716c.
5. **Place** — 12.5px #78716c: "City, ST" (+ " · est. YYYY" on parish/mission cards).
6. **Ministry line** — 12.5px/1.5 #57534e, verbatim from the directory.
7. **Clergy (kunigai) line** — parishes/missions and hosted cards. From the Sielovada directory when named ("Kun. Jaunius Kelpšas, pastor", #57534e); otherwise the canonical arrangement ("Shared pastor (not Lithuanian-speaking), assigned by the diocese"), or the stated absence ("No Lithuanian-speaking kunigas listed on Sielovada") in #78716c. Absences must stay as legible as facts.
8. **Checked stamp** — "Checked 2026-07-23" (11px #78716c, tabular-nums) where a canonical `dateObserved` exists (8 profiled communities).
9. **Situation flag** (only when the community has one) — one shared pattern, a tinted box (padding 8px 10px) with an uppercase 10.5px tag + up to two sentences (12px/1.55 #57534e) + links:
   - **Active campaign** — box #f8efef, tag #7d1f1f, links "What's happening" (Hearth dispatch) and the action link with arrow ("Review Planning Area 8 →", "Support Hartford's legal fund →", "Support Waterbury's appeal →", "Sign the Maspeth petition →"), 12px 600.
   - **Development to monitor** — box #f1efeb, tag #78716c.
   - **Building at risk** — box #f5edda, tag #7d1f1f.
   Card text is truncated to the first 1–2 sentences of the canonical `whatChanged`; the full account stays on the profile/dispatch.

### "Also being tracked" card variant
Same card; adds an italic 12px #78716c "why it's not listed" line under the place — e.g. Waterbury "Merged into Our Lady of Mount Carmel in 2024; no Lithuanian pastoral care remains to list." — and the situation box carries the kind tag inside it (no tag above the name).

### Where each situation renders
A situation attaches to the community's own card wherever that card lives (Divine Providence under parishes; Beverly Shores under hosted Masses; Hartford, Maspeth, Scranton St. Michael under the Sielovada listing). Only parishes with **no card anywhere on the page** (Waterbury, Girardville, Freeland, Elizabeth, Bayonne) appear in "Also being tracked." Nothing is listed twice.

## Interactions & behavior

- Map dot hover → enlarge dot + ink ring + readout line updates (aria-live).
- Map dot click → smooth scroll to the community's card anchor.
- All name/image links → parish profile routes; campaign links → Hearth posts and external action URLs.
- Responsive: hero flex wraps (map above stats on phones); card grids reflow via auto-fill; no fixed heights.

## Design tokens

- Background #fffdf9 · panel/frame cream #faf7f1 · ink #1c1917 · body secondary #57534e · muted/absence #78716c · hairlines #efece6 / #e7e5e4 · section rule #1c1917.
- Accents: parish/mission green #2d6a4f · hosted gold #d5c28b (stroke #8a7a4e) · loss/campaign red #7d1f1f · state shading #f1e8d3 (stroke #dccfae).
- Boxes: campaign #f8efef · monitor #f1efeb · building #f5edda.
- Type: Source Serif 4 (600/700) for display + names; system UI stack for everything else. Uppercase micro-labels 10.5–11px, 0.06–0.09em tracking. Tabular numerals on counts/dates.
- #b3aca2 is map-marker fill only, never text. Absence text #78716c; losses #7d1f1f.

## Assets

- Parish line drawings served from `/images/parishes/*-line-drawing.png` (rights-cleared registry entries only). Southfield uses `southfield-divine-providence-current-line-drawing.png` (the non-"current" registry path 404s).
- No other imagery. No icons, no emoji.

## Files in this bundle

- `Lithuanian Catholic Life Today v2.dc.html` — the full prototype (markup + logic in one file; reference only).
- `today-network.json` — the 20 Sielovada entries joined with profile links, coordinates, founded years.
- `watch-list.json` — the 10 alert situations with campaign links.
- `pastoral-conditions.json` — clergy arrangement / Mass cadence / checked dates for the 8 profiled communities.
- `line-drawings.json` — slug → cleared drawing map.
- Geo layers (`context-points.json`, `map.json`) already live in this repo's `data/` — regenerate all derived JSON from live canonical data in production rather than shipping these snapshots.
