# US Roman Catholic diocese boundary data — source survey (2026-07-25)

Scope: find openly usable GIS polygon boundaries for the ~176 Latin Rite dioceses of the United States, for use on a static Next.js site with d3-geo (`geoConicEqualArea`, lower 48). Northeast + Midwest accuracy matters most (dioceses referenced by the parish registry: NY, NJ, PA, CT, MA, MI, IL, OH, WI, IN, etc.).

Verified by fetching pages/repos and, where possible, peeking at raw file bytes via range requests and the GitHub API (`gh api`) — no large files fully downloaded, per instructions.

---

## Candidate 1 — kburchfiel/us_diocese_mapper (GitHub) — RECOMMENDED (primary)

- **URL:** https://github.com/kburchfiel/us_diocese_mapper
- **Format:** GeoJSON (EPSG:4269 / NAD83) + companion CSV with WKT geometry. County-level granularity — each feature is one US county/county-equivalent tagged with its `Diocese` and `Province`. Not pre-dissolved to diocese-level polygons; dissolving is a one-line `mapshaper -dissolve2 Diocese` or `turf.dissolve` / GeoPandas `dissolve()` step (the author's own notebook does exactly this to build the interactive map, via GeoPandas).
- **Relevant files (root of repo, default branch `master`):**
  - `county_shapes.geojson`, `county_shapes.csv` — raw county polygons, sourced from **US Census Bureau TIGER/Line 2021** (`tl_2021_us_county.shp`, confirmed via the project's own methodology notebook: "I downloaded county shapefiles from the US Census bureau here: https://www.census.gov/cgi-bin/geo/shapefiles/index.php?year=2021&layergroup=Counties...").
  - `counties_by_diocese.csv` — the crosswalk: 3,146 county rows × columns `STATEFP, COUNTYFP, GEOID, NAME, State_Name, State_Code, county_state, Diocese, Diocese_Detail, Province_Detail, Province, geometry(WKT)`.
  - `counties_by_diocese.geojson`, `diocese_boundaries.geojson` (908,940 bytes / ~888 KB), `diocese_boundaries_revised.geojson` (1,158,115 bytes / ~1.1 MB), `province_boundaries.geojson`, `province_boundaries_revised.geojson` — same join, packaged as GeoJSON (still county granularity; verified by range-request peek at both files — features are individual counties, e.g. `"NAME": "Saratoga", ... "Diocese": "Albany"`).
- **Coverage verified (downloaded and parsed `counties_by_diocese.csv` directly):**
  - **3,146 county rows → 176 unique dioceses → 33 unique provinces.** 176 matches the target ~176 Latin dioceses exactly.
  - Includes Alaska and Hawaii; **excludes** Puerto Rico, Guam, N. Mariana Islands, American Samoa (confirmed via the notebook's `regions_not_in_us_episcopal_conference` exclusion list).
  - Spot-checked against known diocese lists for every Northeast/Midwest state in the parish registry — all correct:
    - NY (8): Albany, Brooklyn, Buffalo, New York, Ogdensburg, Rochester, Rockville Centre, Syracuse
    - NJ (5): Camden, Metuchen, Newark, Paterson, Trenton
    - PA (8): Allentown, Altoona-Johnstown, Erie, Greensburg, Harrisburg, Philadelphia, Pittsburgh, Scranton
    - CT (3): Bridgeport, Hartford, Norwich
    - MA (4): Boston, Fall River, Springfield in Massachusetts, Worcester
    - MI (7): Detroit, Gaylord, Grand Rapids, Kalamazoo, Lansing, Marquette, Saginaw
    - IL (6): Belleville, Chicago, Joliet, Peoria, Rockford, Springfield in Illinois
    - OH (6): Cincinnati, Cleveland, Columbus, Steubenville, Toledo, Youngstown
    - WI (5): Green Bay, La Crosse, Madison, Milwaukee, Superior
    - IN (5): Evansville, Fort Wayne-South Bend, Gary, Indianapolis, Lafayette in Indiana
- **License — quoted verbatim from `license.md` at repo root:**
  > "Code released under the MIT License
  >
  > (The county_shapes.csv, county_shapes.geojson, state_fips_codes.csv, and counties_by_diocese.csv files are released into in the public domain.)
  >
  > The tileless maps (with a gray background) are released under the Creative Commons Attribution 4.0 license (CC-BY 4.0); I believe the ones with the Stamen Toner background may need to be released under a more restrictive license since they display OpenStreetMap data in the background, but I'm not sure."
  - GitHub's own license detector reports `"license": {"key": "other", "spdx_id": "NOASSERTION"}` for the repo as a whole (because the blanket repo license is ambiguous), but the file-level statement above is unambiguous for the four named files, and the underlying TIGER geometry is separately public domain by operation of US law (17 U.S.C. §105 — US federal government works are not subject to copyright).
  - Note the explicit PD grant names `counties_by_diocese.csv` and `county_shapes.geojson`, but not the convenience files `counties_by_diocese.geojson` / `diocese_boundaries*.geojson` / `province_boundaries*.geojson` by name. Functionally these are a mechanical join of two PD sources (PD TIGER geometry + PD diocese labels) with no separable creative content, so they carry the same effective status — but **the safest, unambiguous path is to treat `county_shapes.geojson` + `counties_by_diocese.csv` as the canonical PD inputs and do the diocese dissolve ourselves**, rather than redistributing the pre-built convenience files under an assumed license.
- **Diocese-assignment provenance (methodology, quoted from the author's notebook):** "I relied mostly on Wikipedia for this information, although I also referenced diocesan websites where needed... I also relied on the following listing of U.S. dioceses: https://en.wikipedia.org/wiki/List_of_Catholic_dioceses_in_the_United_States" — i.e. an independent amateur compilation, not the (paid) Official Catholic Directory. Spot-checks above found it accurate for every NE/Midwest diocese checked, but it is not an official/authoritative source and individual county assignments should be spot-checked against diocesan websites before any county-boundary claim is used in copy (only the polygon outline is needed for the map, so this mostly matters for edge counties).
- **Redistributable as derived TopoJSON in an MIT-code / open-data repo?** **YES**, via the PD path (regenerate diocese polygons ourselves from `county_shapes.geojson` + `counties_by_diocese.csv`, both explicitly public domain, geometry itself US-government PD). No CC BY-NC or share-alike encumbrance at all — public domain is strictly more permissive than CC BY-NC. Attribution to the repo is good practice but not legally required.
- **Action needed:** a small one-time build step (`mapshaper` dissolve by `Diocese`, or Turf.js/GeoPandas dissolve) converts the county-level PD polygons into diocese-level polygons, then `topojson-server`/`mapshaper -o format=topojson` produces the final TopoJSON for the site.

---

## Candidate 2 — Gavin Rehkemper's "Catholic Dioceses of the USA" map/data — SECONDARY (verification only, not redistribution)

- **URL:** https://gavinr.com/catholic-dioceses-of-the-usa-map-updated/ (interactive map: https://maps.gavinr.com/usa-catholic-dioceses/; GeoJSON product listing: https://catholicmaps.gumroad.com/l/usa-catholic-dioceses-geojson)
- **Format:** Interactive ArcGIS-based web map; a GeoJSON version is listed for sale on Gumroad (price/terms not disclosed on the public listing page as fetched).
- **Coverage:** All US counties mapped to diocese, plus ecclesiastical province grouping; updated June 2023 to add the Las Vegas province — appears comprehensive for the same ~176-diocese universe.
- **Provenance (quoted):** "I used the diocese websites as sources for where their territory begins and ends when I could. Many dioceses, however, did not have this information readily available, so in those cases I fell back to using the Wikipedia data for the diocese." Built on "a publicly available map of the counties of the United States" (i.e., also Census-derived).
- **License:** **None stated.** The blog page carries only "© 2026 Gavin Rehkemper" with no Creative Commons or open-data license, and the GeoJSON is sold as a commercial Gumroad product with no visible redistribution terms.
- **Redistributable as derived TopoJSON?** **NO** — no license grant found; treat as a paid, all-rights-reserved product. Useful only as an **independent visual cross-check** for the Candidate 1 dissolve (same underlying methodology — diocese websites + Wikipedia — compiled independently, so agreement between the two is a reasonable accuracy signal), not as a redistribution source.

---

## Other sources checked (ruled out or not applicable)

| Source | What it is | Verdict |
|---|---|---|
| **GoodLands Catholic GeoHub** (`catholic-geo-hub-cgisc.hub.arcgis.com`, good-lands.org) | ArcGIS Hub site; "the only place in the world where Catholics can see the boundary of every Catholic diocese in the world," built with Esri from Vatican Annuario Pontificio data digitized by Catholic-Hierarchy.org. World Administrative Units metadata quotes verbatim: *"Data Protected Under Creative Commons Attribution-NoDerivatives 4.0 International. Users can share your application if they give credit to you, but they cannot make any additions, transformations or changes to the dataset."* Access constraint: "License required." | **Ruled out.** CC BY-**ND** explicitly forbids "transformations" — converting to TopoJSON is exactly that. Cannot legally be used to produce a derived file for redistribution, regardless of attribution. |
| **USCCB Diocesan Map** (usccb.org/diocesanmap), built by Stamen | The current *official* interactive map, built by Stamen Design on top of CARA's print map + the (paid) Official Catholic Directory, plus reference to the same "unofficial" GitHub diocese-mapper efforts found above. Described by Stamen as "the first official and freely accessible interactive map." | **No download/export offered**, no license stated on the USCCB page. Authoritative-looking but not extractable — good for visual QA of Candidate 1's dissolve, not usable as a data source. |
| **CARA (Georgetown)** map of dioceses | Print map published annually in the Official Catholic Directory; CARA page describes the map, sells no open data. | Not downloadable/open. |
| **Lincoln Mullen's `demographics-religion` repo** (github.com/lmullen/demographics-religion, `catholics-dioceses/` folder) | CSV files of diocese **seats** (points) with erection/establishment dates for US, Canada, Mexico — historical point data, not boundary polygons. | **MIT licensed** (confirmed via repo LICENSE file) — genuinely open, but wrong geometry type for this task (points, not polygons). Good complementary source if the site ever wants diocese-founding-year markers, not for boundaries. |
| **Wikimedia Commons SVG maps** (`File:US Roman Catholic dioceses map.svg`, per-province SVGs like `Ecclesiastical Province of Philadelphia.svg`) | Vector province/diocese maps, CC BY-SA 3.0. | Static SVG cartography, not machine-readable polygon/coordinate data — would require manual re-tracing/georeferencing to extract usable geometry, which isn't worth it given Candidate 1 exists. Noted per task instructions but not pursued further. |
| **data.world / Kaggle / Zenodo / Harvard Dataverse** | Searched for "catholic diocese boundaries." Found only a generic "Catholic_Church_by_country" Kaggle dataset (country-level, not US diocese polygons) and unrelated boundary datasets (Chicago city limits, NUTS1 Europe). | **Nothing relevant found** on any of the four platforms. |
| **ARDA / SCRIP (System for Catholic Research, Information and Planning)**, thearda.com | Historical diocesan-level dataset, six decades **1940–1990**, merging diocesan data with US Census county characteristics. This is the closest thing to an "academic replication crosswalk," but it is (a) historical only (ends in 1990, diocese boundaries have since changed — e.g. Bridgeport, Metuchen, and several Midwest dioceses were erected or resized after that date), and (b) distributed as tabular statistical data via ARDA's archive interface, not GIS polygons; access/redistribution terms require registration and were not fully resolved by page fetch. | **Not used** — outdated for current boundaries; would need its own county dissolve exercise using modern boundaries anyway, which Candidate 1 already provides for the present day. Flagged here only because the task asked for this fallback thread explicitly. |
| **HIFLD / OpenStreetMap** `boundary=religious_administration` | HIFLD Open Data is a general federal boundary aggregator; searches turned up no Catholic diocese layer there. OSM has a formal tag for religious administration boundaries but per an OSM forum thread ("Religious administration boundaries in the United States"), US Catholic diocese boundaries are **not systematically mapped in OSM** — sparse/inconsistent coverage. | Not usable as a complete national source today. |

---

## Confirmed background fact

**US Latin dioceses are (with rare exceptions) exact unions of whole civil counties.** This is confirmed by every source surveyed — the kburchfiel dataset assigns each of the 3,146 US counties to exactly one of 176 dioceses with no split counties observed in the Northeast/Midwest spot-checks; Gavin Rehkemper's independent write-up describes the same construction method ("mapped each U.S. county to its corresponding diocese"); and the historical ARDA/SCRIP series is explicitly built the same way ("Diocesan information... merged with U.S. Census data describing... the counties that make up each diocese").

---

## Recommendation

**Primary (build the map from this):** kburchfiel/us_diocese_mapper's `county_shapes.geojson` (US Census TIGER 2021 county polygons, public domain) joined to `counties_by_diocese.csv` (county→diocese crosswalk, 176 dioceses, explicitly released to the public domain by the author) — dissolve counties by `Diocese` in a build script (mapshaper/Turf/GeoPandas) and emit TopoJSON. This is simultaneously the "ready GeoJSON" answer and the "diocese→county crosswalk" fallback the task asked for, because the source data literally is a crosswalk with geometry attached. License: public domain (data) — strictly more permissive than the CC BY-NC ceiling in the task brief; MIT-licensed build code sits comfortably on top. Verified accurate for every Northeast/Midwest diocese checked; not an official/authoritative compilation (built from Wikipedia + diocesan websites), so treat as "best available open data," not gospel — worth a light manual QA pass on ambiguous county lines before shipping.

**Secondary (cross-check only, do not redistribute):** Gavin Rehkemper's independently-compiled map/GeoJSON (same county-to-diocese method, different author) as a second opinion when eyeballing the dissolved Northeast/Midwest boundaries — plus the official-but-closed USCCB/Stamen interactive map for a third visual sanity check. Neither is redistributable (no license / paid product respectively).

**Explicitly ruled out for redistribution:** GoodLands/Catholic GeoHub — the only "official Vatican-derived" dataset found — is CC BY-**ND**, which bars exactly the transformation (GeoJSON→TopoJSON) this project needs.
