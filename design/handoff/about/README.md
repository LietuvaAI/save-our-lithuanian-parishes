# About page — design handoff

Reference prototype: `About the Project v4.dc.html` (design project "Design feedback request").
Built against main; canonical figures read from `data/canonical-infographic-projection.json`,
`data/photos.json`, `data/alerts.json`, `line-drawings.json`, and the live
`/church-buildings-through-time` page.

Canonical review amendment (2026-08-22): the rulings in §§3, 7, 8, and 9 below supersede
stale figures and asset-gap notes in the original prototype. The supplied copy remains the
editorial source, but canonical counts, institution classes, status language, and building
dates must use these amended rulings rather than reproducing a contradicted number verbatim.

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

Owner-supplied, **verbatim except for the canonical corrections stated below**, with em-dashes
and curly apostrophes otherwise preserved as written. Do not re-order or otherwise reword the
copy. Paragraph order:

1. "Across more than a century… documents **131 Roman Catholic parishes and six missions** in the United States." → link the count to `/parishes`. This is the current 137-institution Roman Catholic census; do not restore the superseded 132 + 5 split.
2. "The first great wave of Lithuanian immigrants arrived during the late nineteenth and early twentieth centuries…"
3. "After the Second World War, Lithuanians displaced by war and Soviet occupation…" → link "Southfield, Michigan" to `/parishes/dievo-apvaizdos-southfield-mi`
4. "The two waves arrived under different circumstances…"
5. "The Lithuanian idea of *malda ir tauta*—prayer and nation—expresses this understanding…" → set inside the dark panel
6. "No parish stood alone…"
7. "Most of that structure is now gone." → display line, must not wrap
8. Replace the superseded "only eight remain active as Lithuanian parishes" / "ninety formal closures" wording with: **"Of the 137 Roman Catholic institutions documented here, six parishes and two missions remain active Lithuanian institutions. Lithuanian worship also continues in six hosted communities, for fourteen regular worship places in all. Ninety-one of the 137 historical institutions are classified as closed."** → link the living-network sentence to `/lithuanian-catholic-life-today` and the closed-institution sentence to `/where-every-parish-ended-up`. Do not call all 91 "formal closures" unless a separate canonical assertion supports that narrower claim.
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
| Southfield line drawing | `southfield-divine-providence-current-line-drawing.png` | `permission_granted` in `data/photos.json` | ready; the earlier missing-entry note is resolved |
| Jonynas stained-glass window, Divine Providence | supplied by the project owner; photo credited to V. Jurgutienė | **rights pending** unless the photographer is the project owner or has granted reuse | add only after written permission or own-work confirmation; retain the photographer credit |
| Our Lady of Vilnius demolition, 2015 | supplied by the project owner; photographer/source not yet named | **rights pending** | hold until the creator/source and reuse permission are documented |
| Holy Trinity Newark demolition | supplied by the project owner; credited only as "Old Newark" | **rights and date pending** | hold until the source, reuse permission, and caption chronology are established |
| Prayer book *Maldų Knyga su Kalendoriumi* | Žiburio Archive item `20260314_1773506785799` | archive reports public domain; local asset not included in the handoff ZIP | verify the item-level rights statement, then store a governed local copy rather than hot-linking |
| Sigita Jurgutis at the light box | `archyvas.ziburioltmokykla.org/images/IMG_7452.jpeg` | archive-hosted image; local asset not included in the handoff ZIP | hold until reuse permission and the appropriate subject/photographer credit are documented; then store a governed local copy |
| St. George demolition frames | `pbase.com/dbperez/demolition` | **"Do not copy or reproduce without written permission"** | linked only, never embedded, until written permission exists |

The handoff ZIP contains three binary image assets: the Jonynas window, the Manhattan
demolition interior, and the Newark demolition photograph. It does not contain the prayer-book
cover or the Sigita Jurgutis photograph. All captions and asset records must keep "no image
exists" and "image held, rights pending" as distinct states.

## 8. Canonical rulings and remaining rights holds

1. **Sixteen and 26 are both correct, but they count different units.** Publish both only with
   explicit unit labels: **"Among the 91 closed institutions, the last-used church is documented
   as demolished in 16 cases."** Separately: **"Across all 134 documented physical worship
   sites—including earlier and replacement churches—26 are documented as demolished."** The
   first is an institution-level terminal-site measure; the second is a physical-site census.
   Never present 16 as the total number of demolished church buildings.
2. **Eight and fourteen are both correct, but they describe different populations.** Eight is
   the active Lithuanian-led institutional group: six parishes and two missions. Fourteen is the
   living pastoral network: those eight institutions plus six hosted-Mass communities. Use the
   adjudicated paragraph in §3 and preserve Washington Epiphany as a network-only hosted-Mass
   community rather than forcing it into the 137 historical-institution census.
3. **Newark Holy Trinity requires two-building language.** A 1981 fire damaged the original
   church; repairs were not permitted, worship moved to the basement of the parish's 1963 hall,
   and the original church was later demolished. The exact demolition year remains unresolved.
   The Lithuanian institution ended through a selected 2002 merger into Holy Trinity–Epiphany;
   the 1963 terminal worship site still stands. Do not caption the supplied photograph
   "demolished in 1981," do not describe 1981 as the parish's closure, and do not treat the
   earlier demolished church as the institution's standing terminal site. Image credit and
   reuse rights remain held.
4. **The Pbase St. George gallery is Shenandoah, but its upload date is not a demolition date.**
   The gallery itself identifies St. George in Shenandoah, Pennsylvania. Canon continues to use
   2009 for the demolition unless stronger evidence changes it. Link the gallery as supporting
   documentation only; never embed its frames without written permission from the photographer.
5. **The four line-drawing gap is resolved.** Governed entries and image files now exist for
   Rochester, Washington Epiphany, New Philadelphia Holy Cross, and Scranton Holy Rosary. Do
   not regenerate or re-import them from this handoff.

## 9. Canonical facts rendered

- St. George, Shenandoah: parish closed **2006**, church demolished **2009**
  (`cn:institution:st-george-shenandoah-pa`, `rel:lineage-1:shenandoah-building-demolished-2009`).
- Our Lady of Vilnius, Manhattan: worship access ended **26 February 2007**, church demolished
  **April 2015** (`rel:successor-2:manhattan-demolished`).
- Holy Trinity, Newark: original church damaged by fire in **1981** and demolished afterward,
  exact demolition year unresolved; Lithuanian institution merged in **2002**; the successor's
  1963 parish-hall worship site stands.
- Divine Providence, Southfield: **under threat** — Planning Area 8 of the Archdiocese of
  Detroit 2025–2027 restructuring, no final decisions announced
  (`data/alerts.json` → `divine-providence-2026-07`, level red).

Current count contract for this handoff: **155** published U.S. institutions of all classes;
**137** Roman Catholic institutions (**131 parishes + 6 missions**); **91** of those 137
classified as closed; and **134** physical worship sites. The page must derive these figures
from the canonical projection and must not hard-code them as an independent snapshot.

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
