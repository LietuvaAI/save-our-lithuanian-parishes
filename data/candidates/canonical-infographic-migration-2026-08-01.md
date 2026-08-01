# Canonical infographic migration

**Date:** 2026-08-01
**Brain authority:** docs/research/parish-canon/infographic-projection.json
**Brain revision:** canonical-infographic-units-2026-08-01

## Public units

The site now treats these as separate populations:

| View | Unit | Population | Included in the public U.S. institution count? |
|---|---|---:|---|
| The Record | Distinct U.S. parish, mission, or congregation institution | 154 | Yes |
| The History | Distinct U.S. Roman Catholic parish institution | 132 | Yes, as a subset |
| Church Buildings Through Time | Accepted physical church, chapel, shrine, or worship site | 131 | No |
| Where Parish Life Continued | Accepted typed relationship between institutions or same-entity phases | 51 | No |
| Pennsylvania Coal Region | Roman Catholic parish institutions in the bounded regional comparison | 15 | Already included in the 154 |
| Canadian Comparators | Canadian Lithuanian parish comparator | 3 | No |

## Corrected institutional history

The Roman Catholic parish-history population remains **132**, with **88** closed. Institution dates now come from the CultureNet projection rather than the site's generated map layer.

- **55** closed parish institutions have a dated end in 1990 or later.
- **3** closed parish institutions have a dated end in 2020 or later.
- The prior **56 / 5** figures mixed parish end dates with later church-building or worship-site events.
- Brooklyn St. George ended as an independent parish in 1986; its church complex was demolished later.
- New Britain St. Andrew ended as a parish in 2017; a later 2021 event belonged to the worship site.
- Girardville St. Vincent merged in 2015; the former worship site closed in 2026.

Other canonical date repairs now reach every aggregate view, including New Haven St. Casimir (2002), East Chicago St. Francis (1987), Archbald (2001), Mount Carmel Holy Cross (1995), Coaldale St. John (2008), Waterbury St. Joseph (2024), Bayonne St. Michael (2009), and Detroit St. George (1965).

## Detroit identity and site separation

- St. George, Detroit is a distinct institution, 1908-1965, with its own profile.
- Divine Providence is a distinct institution beginning in 1949.
- The Schaefer Road Divine Providence worship site begins in 1949 and was demolished in 1970.
- The Southfield Divine Providence worship site begins in 1973.
- St. Anthony is a distinct institution, 1920-2013; its former building remains a separate standing, repurposed site.
- Typed continuity relationships connect St. George and St. Anthony to Divine Providence without collapsing their identities or buildings.

## Site integration

- Homepage national figures, The History, and By Diocese now read the canonical institution projection.
- Church Buildings Through Time now reads physical worship-site records and contains no Divine Providence exception.
- Where Parish Life Continued reads typed canonical continuity relationships.
- Pennsylvania Coal Region and Canadian Comparators now read explicit Brain-owned projections instead of filtering the legacy parish file.
- site-figures.json records both canonical projection hashes.
- The build blocks legacy aggregate imports, unit mixing, duplicate routes, unclassified sites, Canadian leakage into U.S. totals, and Detroit lifecycle regression.

## Remaining evidence depth

Identity and public census membership are settled for all 154 public U.S. institutions. Lifecycle depth is still uneven:

- 66 founding dates come directly from canonical graph lifecycle facts.
- 7 come from reviewed case snapshots.
- 65 retain an explicit Registry Revision 10 compatibility fallback.
- 16 public institutions have no established founding year.

Those fallback labels remain internal provenance. They are not silently represented as fully adjudicated CultureNet lifecycle facts.
