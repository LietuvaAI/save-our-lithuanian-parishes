# Handoff: Homepage refresh + site-wide design language

Target: `saveourlithuanianparishes.org/` (Next.js site). Companion to PR #218 (Living Network page).

## Scope — what changed and what didn't

**The census map and its right-hand key/filters are UNCHANGED.** The prototype shows a dashed placeholder where the existing map component stays exactly as it is in production. This refresh covers everything around it:

1. **Header (site-wide)** — single-row masthead: wordmark "SAVE OUR LITHUANIAN PARISHES" in Source Serif 4, 13px, weight 500, letter-spacing 0.09em, uppercase, ink #1c1917; nav right-aligned in the same engraved serif caps (10.5px, weight 500, 0.08em tracking, nowrap — must never wrap to two lines or show a scrollbar at desktop widths; wrap gracefully on mobile). Židinys ↗ in green #2d6a4f, weight 600. The masthead's bottom rule is the **Lithuanian tricolor**: 3px, `linear-gradient(to right, #f5b500 33.4%, #00694d 33.4%, #00694d 66.7%, #a72c2c 66.7%)` via border-image — it replaces the old black rule, sitting above the church drawings.
2. **Hero** — strip of 12 parish line drawings in one row (`repeat(12, minmax(0,1fr))`, gap 8px, square tiles, `background-size: contain` on cream #faf7f1 with 1px #efece6 border — every church must read whole, never cropped). Below it, centered: Lithuanian eyebrow "AMERIKOS LIETUVIŲ PARAPIJOS" (11.5px serif caps, 0.22em, #78716c) and H1 "AMERICA'S LITHUANIAN PARISHES" (Source Serif 4, 600, clamp(24px,2.8vw,31px), 0.12em tracking, uppercase); centered intro paragraph 14.5px/1.6 #57534e ending with "About the project →".
3. **Stat band** — four open tiles on ONE row (no boxes, no red): `repeat(4, minmax(0,1fr))`, thin #e7e5e4 top rule; each tile: ink serif figure 26px + small grey cta "Browse → / Outcomes → / Buildings → / Network →" on the same baseline, label 11.5px grey below. Tiles: 155 communities · 137 RC parishes & missions · 131 church buildings · 14 places of Lithuanian worship today. (The campaigns tile was removed — the section below covers it.)
4. **"Parishes at a crossroads"** (replaces the Living Network + Active campaigns + watch-list sections) — tracked-caps serif H2 over an ink rule; intro: "Four parishes face decisions about their future right now, and six more situations are being tracked — planned consolidations, churches on the market, buildings facing demolition. Each entry says what changed, when, and how to help." Then a 3-column grid of all 10 alert situations (campaigns → developments → buildings, alpha within kind): full-width 3:2 line drawing on top (empty cream frame when no cleared drawing exists — keeps titles aligned), serif name linking to the profile, place · diocese, then the situation in its tinted flag box (campaign #f8efef with red tag #7d1f1f; development-to-monitor #f1efeb with grey tag #78716c; building-at-risk #f5edda with red tag), text capped at two sentences (abbreviation-safe truncation — never cut after St./Sts./Kun. etc.), links: Profile · What's happening (Hearth) · action ("Support Waterbury's appeal →" etc.).
5. **Židinys band** — no box: thin rule, label + serif heading, the exact copy: "Židinys (The Hearth) follows the history — and the unfinished story — of America’s Lithuanian parishes. It publishes new findings from the archives, accounts of what happened to individual parishes, and updates from communities working to protect what remains. Subscribe to receive each article by email." Green subscribe button.
6. **Footer (site-wide)** — small and left-aligned: tracked serif-caps wordmark 12px, one-line description with About links, hairline, attribution line, legal line. No link columns, no repeat of the header nav.

## Site-wide propagation (IMPORTANT)

The new header, footer, and type treatment are not homepage-only. **Roll them through every page of the site**: the engraved serif-caps nav/wordmark, the tricolor masthead rule, the compact left-aligned footer, Source Serif 4 for display/headings with the system-UI stack for body, links in green #2d6a4f (red #7d1f1f is reserved for losses, campaigns, and at-risk flags — never for ordinary links). The Living Network page (PR #218) should pick up the same header/footer and link color when implemented.

## Also required in this pass

- **Add the missing parish line drawings** to the photo registry and `/images/parishes/`: Rochester (St. George community at Our Lady of Lourdes), Washington (Epiphany Catholic Church), New Philadelphia (Holy Cross), Scranton (Holy Rosary). The Living Network cards and any drawing strips pick them up automatically once cleared registry entries exist.
- **Correct map projection for Washington, DC**: the shared geo layer places the Epiphany point at the Washington diocese centroid (830.9, 271.4 in the geoAlbersUsa 975×610 frame), which falls inside Maryland's shape — state-level logic then miscounts DC as MD. Pin the point inside the District's own shape (≈ 828, 267.5) in the canonical layer so every consumer inherits the fix.

## Design tokens (unchanged from the site)

Paper #fffdf9 · cream #faf7f1 · ink #1c1917 · secondary #57534e · muted #78716c · hairlines #efece6/#e7e5e4 · green (links/active) #2d6a4f · red (loss/risk) #7d1f1f · flag boxes #f8efef/#f1efeb/#f5edda · tricolor #f5b500/#00694d/#a72c2c. Source Serif 4 (400–700) + system UI stack; tabular numerals on figures.

## Files

- `prototype.dc.html` — the working reference (markup + logic; runs in the design tool's runtime). Data files `watch-list.json` / `line-drawings.json` are in `design/handoff/living-network/` from PR #218 — same derivations, regenerate from canonical data in production.
