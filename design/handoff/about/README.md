# About page — design handoff

Reference prototype: `About the Project v4.dc.html` (design project "Design feedback request").
Built against main; canonical figures read from `data/canonical-infographic-projection.json`,
`data/photos.json`, `data/alerts.json`, `line-drawings.json`, and the live
`/church-buildings-through-time` page.

---

## 1. Scope

Rebuild `/about` from the copy and layout below.

**Explicitly out of scope — do not take from the prototype:**

- **Top navigation / masthead.** The live header has been updated since this prototype was
  built; keep the shipped header exactly as it is. The prototype's header is stale.
- Footer is also unchanged — keep the live one.

## 2. Page structure

| Order | Block | Notes |
|---|---|---|
| 1 | Hero | Eyebrow "About · Apie projektą", H1 "About Save Our Lithuanian Parishes", one-line lede |
| 2 | Church-drawing strip | 10 line drawings, one row, each labelled + linked to its parish profile |
| 3 | **Why this project exists** | Long-form narrative, owner-supplied copy (§3) |
| 4 | — *The network* | Sub-heading inside §3 (design apparatus, not owner copy) |
| 5 | Wave diptych | First-wave / second-wave drawings with canonical status notes |
| 6 | *Malda ir tauta* panel | Dark panel, Jonynas window + passage + Draugas link |
| 7 | Display line | "Most of that structure is now gone." (owner copy, set large, one line) |
| 8 | Church-buildings flow | Cream panel, alluvial miniature, links to `/church-buildings-through-time` |
| 9 | — *The dismantling* | Sub-heading; two-column text + image rail |
| 10 | — *For the Record* | Owner-supplied copy (§4), prayer-book float |
| 11 | **How the research is done** | Owner-supplied copy (§5) + Sigita photo + internship CTAs |
| 12 | **In the tradition of the book carriers** | Dark band, unchanged from current design |

Section headings are plain serif at `clamp(30px, 3.6vw, 44px)` with a 1px rule under them.
Roman numerals were removed — do not reintroduce them.

## 3. Copy — "Why this project exists"

Owner-supplied, **verbatim, em-dashes and curly apostrophes as written**. Do not reword,
re-order, or re-punctuate. Paragraph order:

1. "Across more than a century… documents **132 Roman Catholic parishes and five missions** in the United States." → link the count to `/parishes`
2. "The first great wave of Lithuanian immigrants arrived during the late nineteenth and early twentieth centuries…"
3. "After the Second World War, Lithuanians displaced by war and Soviet occupation…" → link "Southfield, Michigan" to `/parishes/dievo-apvaizdos-southfield-mi`
4. "The two waves arrived under different circumstances…"
5. "The Lithuanian idea of *malda ir tauta*—prayer and nation—expresses this understanding…" → set inside the dark panel
6. "No parish stood alone…"
7. "Most of that structure is now gone." → display line, must not wrap
8. "Of the 137 parishes and missions documented here, only eight remain active…" → link "eight remain active as Lithuanian parishes" to `/lithuanian-catholic-life-today`, "ninety formal closures" to `/where-every-parish-ended-up`
9. "Many of these parishes did not disappear because their communities abandoned them…" → link "organized committees, raised money for repairs, petitioned bishops, appealed through canon law, sought Vatican review, held vigils, and went to court" to `/history`; "closed the parishes anyway" to `/where-every-parish-ended-up`
10. "A Lithuanian national parish was not the same as an ordinary neighborhood parish…"
11. "Yet dioceses and archdioceses often evaluated these parishes as local congregations…"
12. "Lithuanian immigrants built and financed this network within the American Catholic Church…"
13. "The loss is not only architectural…"

Three sub-headings are **design apparatus, not owner copy**: "The network", "The dismantling",
"For the Record". Keep or drop them as an editorial call, but they are the only added words.

## 4. Copy — "For the Record"

Owner-supplied, verbatim, four paragraphs:

1. "Save Our Lithuanian Parishes seeks to reconstruct the history of the Lithuanian Catholic diaspora and its continuing relationship with Lithuania… but the parish is the point of entry, not the final subject." → "parish by parish" → `/parishes`
2. "The Lithuanian diaspora was never a self-contained American world…"
3. "The project seeks to make those relationships visible. It will identify the priests who served each parish…"
4. "The dismantling of the parish network is part of this history, but it is not the whole of it. The project is an effort to understand how a diaspora created a Lithuanian religious and communal world in the United States, how that world remained connected to Lithuania, and what those connections made possible across generations."

Two earlier paragraphs were cut by the owner and must not be restored: the periodisation
paragraph ("It will also study how these connections changed over time…") and the separate
closing paragraph beginning "This is not simply a list of churches…", whose second half was
folded into paragraph 4 above.

## 5. Copy — "How the research is done"

1. "Save Our Lithuanian Parishes is researched and produced through **Lietuva.ai**…" → link to `https://lietuva.ai`
2. "The work follows the principle set out by Pope Leo XIV in *Magnifica Humanitas*: artificial intelligence must serve humanity, not take its place…"
3. "The research is also conducted in coordination with **Skaitmeniniai Knygnešiai** student archive program—\"Digital Book Carriers.\" Its high school researchers are graduates of Žiburio Lithuanian Heritage School, located in **Divine Providence Lithuanian Church**." → archive link `https://archyvas.ziburioltmokykla.org`; parish link `/parishes/dievo-apvaizdos-southfield-mi`
4. "Save Our Lithuanian Parishes is the first major public record being built through this approach…"

**Žiburio Foundation must not be named on this page yet** (owner instruction). Earlier copy
saying "the student archive program of the Žiburio Foundation" was removed for that reason.

CTAs kept: "Explore the internship" → `https://archyvas.ziburioltmokykla.org/internship`;
"Visit the public archive" → `https://archyvas.ziburioltmokykla.org`; press line linking the
*Draugas* article.

## 6. Church-buildings flow miniature

Cream panel (`#faf7f1`, 1px `#e4dfd6`), heading "Church buildings through time", then an
alluvial: one left bar (all sites) fanning into five condition bands.

Counts taken from the live `/church-buildings-through-time` page — **134 sites: 48 standing,
35 repurposed, 26 demolished, 2 listed for sale or redevelopment, 23 condition not
established**. Build these from `condition_resolution_contract.precedence` rather than
hard-coding, and keep the "condition not established" band visually distinct (dashed stroke,
`#ded9d1`) with the wording "a research gap, not an outcome".

Colours: standing `#2d6a4f`, repurposed `#78716c`, demolished `#7d1f1f`, for sale `#8a6a12`,
not established `#ded9d1`. Links to `/church-buildings-through-time`.

The panel carries an explicit disambiguation line, because the page states two different
demolition counts: *"A different measure from the paragraph above: this counts every
documented worship site — earlier and replacement churches included — not the final church
site of each institution."* See §8.

## 7. Imagery

| Image | Source | Rights | Action |
|---|---|---|---|
| 10 hero line drawings | `public/images/parishes/*-line-drawing.png` | `open_license` in `data/photos.json` | ready |
| Southfield line drawing | `southfield-divine-providence-current-line-drawing.png` | **no `photos.json` entry** (inventory only) | needs a rights entry before it renders |
| Jonynas stained-glass window, Divine Providence | owner-supplied photo, V. Jurgutienė | owner-supplied | add to `photos.json` with the photographer credit; cropped copy in the design project |
| Our Lady of Vilnius demolition, 2015 | owner-supplied | owner-supplied | needs a rights entry |
| Holy Trinity Newark demolition | owner-supplied, credited "Old Newark" | unclear | confirm credit + rights |
| Prayer book *Maldų Knyga su Kalendoriumi* | Žiburio Archive item `20260314_1773506785799` | Public domain (per archive) | currently hot-linked to supabase; take a local copy |
| Sigita Jurgutis at the light box | `archyvas.ziburioltmokykla.org/images/IMG_7452.jpeg` | archive's own image | take a local copy; caption "Sigita Jurgutis, student archivist" |
| St. George demolition frames | `pbase.com/dbperez/demolition` | **"Do not copy or reproduce without written permission"** | linked only, never embedded, until written permission exists |

All captions must keep "no image exists" and "image held, rights pending" as distinct states.

## 8. Returned to research — do not resolve in design code

1. **Demolition count stated three ways.** Owner copy says "At least sixteen of their final
   church sites have been demolished"; the owner asked for "25 churches"; the live buildings
   page reports **26** demolished of 134 sites. The prototype prints the owner's paragraph
   verbatim and labels the flow as a different measure. Canon should rule on which number the
   page publishes and whether the two measures need separate wording.
2. **Fourteen vs eight.** "Eight remain active as Lithuanian parishes" (owner copy) sits
   alongside the existing site line "the fourteen places that still keep regular Lithuanian
   worship". Likely two different measures; needs one adjudicated statement.
3. **Newark Holy Trinity demolition year.** Canon: `demolished_year: 1981` for "Former Holy
   Trinity church, Newark"; parish `closed: 2002`; the only other Newark Holy Trinity building
   is recorded standing. The owner believes the photograph shows a demolition around 2020 but
   asked to keep 1981 for now. Either the 1981 entry or the photo's identification is wrong.
4. **St. George demolition date.** The pbase gallery frames are dated 21 Jan 2010 (upload
   date per the owner); canon has Shenandoah St. George demolished 2009. The gallery does not
   name a city, so it may be a different St. George.
5. **Four line drawings still missing** from `photos.json` / `/images/parishes/` (carried
   over from the homepage handoff): Rochester, Washington, New Philadelphia, Scranton.

## 9. Canonical facts rendered

- St. George, Shenandoah: parish closed **2006**, church demolished **2009**
  (`cn:institution:st-george-shenandoah-pa`, `rel:lineage-1:shenandoah-building-demolished-2009`).
- Our Lady of Vilnius, Manhattan: worship access ended **26 February 2007**, church demolished
  **April 2015** (`rel:successor-2:manhattan-demolished`).
- Holy Trinity, Newark: church demolished **1981**, parish closed **2002**.
- Divine Providence, Southfield: **under threat** — Planning Area 8 of the Archdiocese of
  Detroit 2025–2027 restructuring, no final decisions announced
  (`data/alerts.json` → `divine-providence-2026-07`, level red).

Losses and threat notes render in `#7d1f1f`; secondary and absent-state text in `#78716c`;
`#b3aca2` is not used for text anywhere.

## 10. Type and layout tokens

- One typeface: **Source Serif 4** (400/500/600/700 + italic). IBM Plex Mono was removed from
  this page at the owner's request — do not reintroduce a second family here.
- Body 19px / 1.62, measure 780px. Captions 11.5–13.5px. Section headings
  `clamp(30px, 3.6vw, 44px)`; in-narrative headings `clamp(26px, 3vw, 36px)`.
- Backgrounds: page `#fffdf9`, panels `#faf7f1`, dark panel `#1c1917` with `#e7e2d8` text and
  `#d5c28b` accents. Rules `#e4dfd6` (hairline) and `#1c1917` (section).
- Images sit in floats with `clear: both` boundaries so text closes around them; the earlier
  two-column flex versions left large voids.

## 11. Validation gate

`npm run data` · `npx tsc --noEmit` · `npm run lint` · `npm run build`. The profile-layout
validator is authoritative — do not weaken its assertions to make this page pass.
