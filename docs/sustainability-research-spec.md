# Sustainability watch research spec

Research engine handoff — produced 2026-07-23. Spec for populating the
sustainability watch data model and enriching parish profiles for all
standing Lithuanian parishes in the US.

## Context

The site now has two live-parish views:

- `/under-threat` — active diocesan actions, clocks, campaigns (10 entries)
- `/sustainability-watch` — parishes that survived or were never directly
  threatened but face slow-burn sustainability challenges (1 entry: South
  Boston)

The sustainability-watch page will expand into a **dashboard of all
standing Lithuanian parishes**, organized by health tier, with clergy,
liturgy, governance, and financial data for each. This research spec
defines what to collect and where to find it.

## Goal

For every standing Lithuanian parish in the US (approximately 15-20
parishes from the registry), establish and source:

1. **Clergy** — who is the pastor/administrator? Is the priest
   Lithuanian-speaking? What is the arrangement?
2. **Lithuanian Mass** — does it happen? What schedule? Weekly, monthly,
   occasional, none?
3. **Governance** — standalone parish, in a collaborative, post-merger
   entity, chapel/mission status?
4. **Financial signals** — if visible (rectory sales, chronic deficits,
   fundraising, debt-free status)
5. **Community activity** — signs of vitality or decline (bulletins,
   events, language classes, cultural programming)
6. **Parish photo** — at least one exterior photo of the church building
   for the profile page, with attribution

## Data model (output format)

Each researched parish produces a `sustainabilityWatch` entry in
`data/alerts.json` with the following fields:

```json
{
  "id": "slug-watch",
  "entity": "Parish name (Lithuanian name)",
  "place": "City, State",
  "diocese": "Diocese name",
  "parishLink": "/parishes/slug or /registry/slug",
  "hearthUrl": null,
  "dateObserved": "YYYY-MM-DD",
  "clergy": {
    "arrangement": "enum — see below",
    "detail": "Free text: pastor name, how Lithuanian ministry is
               organized, any requests for clergy, etc."
  },
  "liturgy": {
    "lithuanianMass": true,
    "frequency": "weekly | monthly | occasional | none | unknown",
    "detail": "Free text: day/time, language breakdown, seasonal notes"
  },
  "governance": "standalone | collaborative | merged | chapel | mission | unknown",
  "governanceDetail": "Free text: which collaborative, when merged, etc.",
  "survivedThreats": "Free text or null: past closures/mergers survived",
  "financial": "Free text or null: rectory sale, deficit, debt-free, etc.",
  "situation": "One paragraph summary of current sustainability picture",
  "photo": {
    "url": "URL of photo (hosted or external)",
    "alt": "Description for accessibility",
    "attribution": "Photographer or source (e.g. 'Sielovada.org', 'Parish Facebook')",
    "license": "CC-BY, fair use, parish permission, etc."
  },
  "sources": [
    {
      "title": "Source title",
      "publisher": "Publisher",
      "url": "URL"
    }
  ]
}
```

### Clergy arrangement enum

| Value | Meaning |
|---|---|
| `lithuanian_klebonas` | Lithuanian-speaking priest serves as dedicated pastor |
| `collaborative_pastor` | Pastor shared via collaborative, not Lithuanian-speaking; Lithuanian ministry maintained through lay leadership or visiting priests |
| `visiting_priest` | No resident Lithuanian-speaking clergy; Lithuanian Mass served by visiting priest |
| `no_lithuanian_clergy` | No Lithuanian-speaking clergy available at all |
| `unknown` | Not yet established by research |

## Sources to crawl

### 1. Sielovada.org — Lithuanian Foreign Pastoral Care Centre

**Primary source for clergy assignments and current Lithuanian parish
life in America. This site must be crawled comprehensively, not just
the directory page.**

- **North America directory**: https://sielovada.org/siaures-amerika/
  - Lists Lithuanian chaplains and parish priests serving in the US and
    Canada
  - Extract: priest name, parish assignment, contact info
  - Cross-reference every name against our parish list

- **Full site crawl**: Spider sielovada.org for all articles, news
  items, and dispatches mentioning US Lithuanian parishes. The site
  publishes detailed reporting on Lithuanian liturgical life in America
  — clergy changes, Mass schedule updates, merger impacts, parish
  visits, community events. This content is in Lithuanian; extract and
  translate key facts.
  - Start from the homepage and archive/category pages
  - Search for each parish name (Lithuanian and English) across the site
  - Search for each US city with a standing Lithuanian parish
  - Extract: which priest serves where, Mass schedules, governance
    changes, community activity, photos with attribution

- **Example of what sielovada articles contain** (already found):
  - Beverly Shores: https://sielovada.org/pokalbis-apie-lietuvisku-pamaldu-ateiti-kopu-sv-onos-baznycioje/
    - Contains: Fr. Gediminas Keršys (Chicago) serving monthly Lithuanian
      Mass; July 2026 merger with St. Patrick's (Chesterton); Archbishop
      Virbalas commentary; photos of the church
  - This level of detail exists for other parishes on the site — it
    needs to be found and extracted systematically

- **Contact**: virbalas@sielovada.org (Archbishop Lionginas Virbalas,
  delegate for Lithuanian pastoral care abroad, succeeding the late
  Prelate Edmundas Putrimas who died November 2022)

### 2. Parish websites

Scout results (2026-07-23):

| Parish | Website | Status |
|---|---|---|
| Nativity BVM, Chicago | chicagonativitybvm.org | LIVE — bulletins, Mass schedule, pastor info |
| St. Casimir, Cleveland | stcasimir.com | LIVE — bulletins current through Jul 2026 |
| St. Andrew, Philadelphia | saintandrewlithuanianparish.org | LIVE — Mass schedule, limited bulletins |
| Holy Cross, Dayton | sgfp.org/holy-cross | LIMITED — minimal content |
| Immaculate Conception, E. St. Louis | None | Chapel — uses St. Augustine of Hippo office |
| St. Peter, South Boston | stpeterlithuanianparish.org | LIVE — monthly bulletins through Jul 2026 |

For each live website: extract current Mass schedule, pastor name,
bulletin dates, community events, any photos of the church.

### 3. Diocesan directories

Each diocese publishes online parish listings with assigned pastor:

| Parish | Diocese | Directory URL |
|---|---|---|
| St. Andrew | Archdiocese of Philadelphia | archphila.org/parish/st-andrew-philadelphia/ |
| Nativity BVM | Archdiocese of Chicago | archchicago.org (403 — try alternative) |
| Immaculate Conception | Diocese of Belleville | diobelle.org/directory/parishes/immaculate-conception-chapel-east-st-louis |
| St. Casimir | Diocese of Cleveland | dioceseofcleveland.org/directories/parish-directory/st-casimir |
| Holy Cross | Archdiocese of Cincinnati | catholicaoc.org (403 — try alternative) |

### 4. Facebook pages

| Parish | Facebook | Activity |
|---|---|---|
| Nativity BVM, Chicago | facebook.com/p/Nativity-BVM-Lietuviu-Kataliku-Baznycia-Cikagoje-100068020522201/ | Active |
| St. Casimir, Cleveland | facebook.com/CasimirCleveland/ | Very active — language classes, scouts, dance groups |
| Holy Cross, Dayton | facebook.com/profile.php?id=338344432877213 | Exists, minimal |
| St. Andrew, Philadelphia | Not found | — |
| Immaculate Conception, E. St. Louis | Community group only | — |

Check for: recent posts (last 3 months), event announcements, photos
of the church building, community activity indicators.

### 5. Lithuanian Bishops' Conference

- **LVK website**: lvk.lcn.lt
- **Foreign pastoral care page**: lvk.lcn.lt/p_strukturos/uzs_sielovada/
- **Katalikai.lt**: Lithuanian Catholic portal — may have news about
  Lithuanian parishes in America

### 6. USCCB ethnic Catholic organization directory

- **Catholic Organizations**:
  https://www.usccb.org/committees/pastoral-care-migrants-refugees-travelers/catholic-organizations
- Use as a source-intelligence map, not as parish-level current data by
  itself. The USCCB Pastoral Care of Migrants, Refugees, & Travelers page
  lists national and ethnic Catholic organizations by community, including
  "Lithuanian Catholic Parishes" under European Catholics.
- For Lithuanian work, this is a provenance breadcrumb for Litua's
  Lithuanian church directory:
  https://www.litua.com/lt/zinynas/baznycios
- For later comparative or allied-community research, check the same USCCB
  page for Hungarian, Croatian, Francophone, Irish, Italian, Polish,
  Slovenian, Ukrainian, African, Caribbean, Brazilian, and other Catholic
  organization links.
- Do not assume each linked organization is current or complete. Treat this
  as a discovery index, then verify with current parish, diocesan,
  chaplaincy, organization, and bulletin sources.

## Priority parishes (research order)

### Tier 1 — immediate (active scouts returned data, ready to populate)

1. **Nativity BVM (Švč. M. Marijos Gimimo), Chicago IL**
   - Scout findings: Rev. Jaunius Kelpšas (Lithuanian klebonas), weekly
     Lithuanian Mass, active website + YouTube + Facebook
   - Key question: chronic deficit, high-interest diocesan loan — is
     this still the financial situation? What is the building ownership?
   - Photo: chicagonativitybvm.org or Facebook

2. **St. Casimir (Šv. Kazimiero), Cleveland OH**
   - Scout findings: Andrew Morkunas (Lithuanian administrator), weekly
     Lithuanian Mass + daily Mass, very active website + Facebook
   - Key question: post-2009-merger stability, school lease arrangement
     from 2014 crisis — is it still in effect?
   - Photo: stcasimir.com or Facebook

3. **St. Andrew (Šv. Andriejaus), Philadelphia PA**
   - Scout findings: Rev. Gerald Dennis Gill (parochial administrator,
     not Lithuanian-speaking), Sunday 11 AM Lithuanian Mass
   - Key question: rectory sold ~2023-24 for $1.2M — confirm details
     and what it means for financial sustainability. Only Lithuanian Mass
     in Pennsylvania.
   - Photo: saintandrewlithuanianparish.org or DiscoverMass

### Tier 2 — needs deeper research

4. **Holy Cross (Šv. Kryžiaus), Dayton OH**
   - Scout findings: Fr. Eric Bowman (administrator, likely not
     Lithuanian), Sunday 10:30 AM Lithuanian Mass, minimal web presence
   - Key question: who actually celebrates the Lithuanian Mass? Is there
     a visiting Lithuanian priest? National Register status should
     protect the building but what about the liturgical life?
   - Photo: Wikipedia commons or Catholic Telegraph article

5. **Immaculate Conception, East St. Louis IL**
   - Scout findings: chapel since 2014 under St. Augustine of Hippo,
     shared Franciscan priest (Rev. Carroll Mizicko, OFM), no
     Lithuanian-speaking clergy, Sunday 11 AM only
   - Key question: is there ANY Lithuanian liturgical element remaining?
     The Jonynas stained glass makes the building heritage-significant.
     Is the landmark designation active and protective?
   - Photo: the Jonynas stained glass would be the defining image

### Tier 3 — parishes not yet scouted (from registry, status=standing)

These parishes were identified by the registry exploration but not yet
scouted. Research each to determine if they belong on sustainability
watch:

- **St. Anthony (Šv. Antano), Cicero IL** — ethnic transfer to Mexican
  community 2011; Lithuanian Masses continued through at least Dec 2019
- **St. George (Šv. Jurgio), Bridgeport CT** — majority Spanish-speaking
  but Lithuanian Masses still held; interior very Lithuanian
- **Immaculate Conception (Švč. M. Marijos Nekalto Prasidejimo),
  Brighton Park, Chicago IL** — merged 2019 with Five Holy Martyrs;
  Lithuanian Mass continues
- **St. Ann (Šv. Onos), Luzerne PA** — sole Lithuanian church remaining
  under Catholic ownership in northern PA cluster
- **Annunciation BVM, Frackville PA** — hosts Lithuanian museum since
  1982; coal region
- **St. George (Šv. Jurgio), Rochester NY** — sold own buildings,
  moved to rented space, monthly Mass only
- **Blessed Jurgis Matulaitis Mission, Lemont IL** — mission inside
  community-owned Lithuanian World Center; unique ownership model

## Photo collection requirements

For each parish, collect at least one church exterior photo suitable
for the parish profile page:

- **Minimum**: one clear exterior shot of the main facade
- **Preferred**: exterior + interior (altar/nave) + any distinctive
  Lithuanian architectural elements (folk art windows, wayside crosses,
  Lithuanian inscriptions)
- **Attribution**: record photographer/source and license for each image
- **Sources to check**: parish website, parish Facebook, sielovada.org
  articles, Wikimedia Commons, Global True Lithuania
  (truelithuania.com), diocesan websites
- **Format**: store attribution in the `photo` field of each
  sustainability watch entry; actual image files in `public/images/parishes/`

## Output

The research engine should produce:

1. **Updated `data/alerts.json`** with populated `sustainabilityWatch[]`
   entries for each researched parish
2. **Photo files** in `public/images/parishes/{slug}.jpg` with
   attribution recorded in the JSON
3. **Research notes** documenting what was found and what remains
   unresolved, in the standard culturenet-brain research format
4. **Sielovada clergy cross-reference** — a table mapping every
   Lithuanian priest named on sielovada.org/siaures-amerika/ to our
   parish list, identifying which of our parishes have Lithuanian clergy
   and which do not

## Execution order

1. Crawl sielovada.org/siaures-amerika/ — get the clergy list first,
   since it answers the most important question for every parish at once
2. Tier 1 parishes (Chicago, Cleveland, Philadelphia) — populate from
   combined scout data + sielovada cross-reference + parish website deep read
3. Tier 2 parishes (Dayton, East St. Louis) — deeper research needed
4. Tier 3 parishes — scout each, then research as warranted
5. Photo collection — can run in parallel with steps 2-4
