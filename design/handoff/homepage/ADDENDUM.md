# Addendum: status pills, diocese links, and layout finals

Final decisions layered onto the base README after review:

## "Parishes at a crossroads" cards (4-column grid)

- Grid is `repeat(4, minmax(0, 1fr))`, gap 24px — the four **Active campaign** cards always form the top row (sort: campaigns → developments to monitor → buildings at risk, alphabetical within kind).
- **Place line** carries the diocese as a live link right after the location: `Southfield, Michigan · <a>Archdiocese of Detroit ↗</a>` — linking to the official diocesan site (aod.org, archdioceseofhartford.org, dioceseofbrooklyn.org, allentowndiocese.org, dioceseofscranton.org, rcan.org, dcgary.org). In production, read these from the canonical diocese records rather than a static map.
- **Status pill** below the place line, FILLED with the site's canonical `--es-*` status colours from `app/globals.css` — the same values the census map markers use:
  - Active Lithuanian parish — `#2d6a4f`, cream text
  - Lithuanian Mass continues — `#74a892`, ink text
  - Continues in another form — `#d5c28b`, ink text
  - Closed — `#7d1f1f`, cream text
  - Unresolved — `#151515`, cream text
  - Being verified — hollow, `#78716c` border/text
  Pill: border-radius 999px, padding 3px 10px, 10.5px/600, 0.03em. Status derives from the canonical registry status for the parish (same field the map uses) — never hand-set per card.
- Card text is capped at two sentences with abbreviation-safe truncation (never cut after St./Sts./Kun./Švč. etc.); full accounts stay on profiles/dispatches.
- Cards without a cleared line drawing show the empty cream 3:2 frame so all titles align.

## Nav (correction)

The nav set matches the live site exactly: All Profiles · Outcomes · The Rise and the Loss · Guidance ▾ · About ▾ · Židinys ↗ (the earlier draft's "Life Today" item was stale — do not add it).

## Data in this folder

`watch-list.json` here supersedes the copy in `design/handoff/living-network/` — same 10 canonical alert situations plus `status`/`statusLabel` (from the registry status of each parish) and `dioceseUrl` (official diocesan site). Regenerate from canonical data in production.
