# Canonical identity release audit

**Audit date:** 2026-07-28

**Identity revision:** 2

**Registry revision:** 5
**Scope:** all 82 unique U.S. C83 identities, covering all 83 frozen source rows

## Release finding

The full source-row, case-file, registry, public-profile, and campaign cross-check found **four identity exceptions**. All four were adjudicated against the evidence already in the repository and corrected in Registry Revision 5:

1. **Ansonia:** the generic C83 row is St. Anthony / Šv. Antano. It is now joined to the 14-mention Draugas registry record and exact site record.
2. **Newark:** the generic C83 row is Holy Trinity / Švč. Trejybės. The original church was demolished, but the parish continued, merged with Epiphany, and remains in another ethnic community.
3. **Collinsville:** the generic Lutheran row is Jerusalem Lutheran Church / Jeruzalės liuteronų parapija, an active LCMS congregation rather than a denominationally independent church.
4. **Kansas City:** St. Casimir was in Kansas City, Kansas, not Missouri. Four shells were one entity; the public record now uses Kansas, the correct archdiocese, and the documented demolished-building outcome.

The other **78 identities matched their case-file and registry joins without an identity change**. Waterbury remains the sole intentional source-row collapse: rows 32 and 76 are one St. Joseph identity, while historical All Saints remains separate and the unresolved 1902 lead remains outside the public registry.

The audit also repaired one stale classifier pointer: Westville Holy Cross was already correctly identified, but its public overlay still pointed to a retired generic registry row and displayed a Roman Catholic diocese. The overlay now points to the independent Holy Cross record and carries no diocese.

## What this freezes

Identity Revision 2 locks the 82 entity joins, canonical names, public profile associations, places, institutional class, denomination, and C83 lineage. Current status, ownership, dates, building use, and narrative can still change when new evidence warrants it; those are evidence revisions, not identity revisions.

The legacy public URL `/parishes/sv-kazimiero-kansas-city-mo` remains stable so existing links do not break. The page, maps, state grouping, registry, and source ledger now identify the parish as Kansas City, Kansas.

## Count reconciliation

| Measure | Result |
|---|---:|
| Frozen U.S. source rows | 83 |
| Unique canonical U.S. identities | 82 |
| Public campaign assignments protected | 4 |
| Registry records before R5 | 210 |
| Registry records after R5 | 205 |
| Duplicate registry shells removed | 5 |
| Identity exceptions remaining | 0 |

## Complete 82-identity ledger

The confidence label is the existing current case-file confidence. It is not a downgrade of the identity join: a parish may have a settled identity while its present building use or exact dates remain only probable.

| C83 row(s) | Canonical identity | Place | Registry record | Case confidence | Audit outcome |
|---:|---|---|---|---|---|
| 1 | Šv. Kazimiero | Gary, IN | `casimir-gary-in` | probable | Confirmed |
| 2 | Šv. Onos | Spring Valley, IL | `ann-spring-valley-il` | probable | Confirmed |
| 3 | Šv. Jurgio | Chicago, IL | `george-chicago-il` | probable | Confirmed |
| 4 | Šv. Mykolo | Chicago, IL | `michael-chicago-north-side-il` | probable | Confirmed |
| 5 | Aušros Vartų | Chicago, IL | `gateofdawn-chicago-il` | probable | Confirmed |
| 6 | Šv. Kazimiero | Chicago Heights, IL | `casimir-chicago-il` | probable | Confirmed |
| 7 | Šv. Juozapo | South Chicago, IL | `joseph-south-chicago-il` | probable | Confirmed |
| 8 | Dievo Apvaizdos | Chicago, IL | `providence-chicago-il` | verified | Confirmed |
| 9 | Šv. Kryžiaus | Chicago, IL | `holycross-chicago-il` | verified | Confirmed |
| 10 | Šv. Konstantino | Oglesby, IL | `parish-oglesby-il` | probable | Confirmed |
| 11 | Šv. Pranciškaus | East Chicago, IN | `francis-east-chicago-in` | thin | Confirmed |
| 12 | Šv. Kazimiero | Sioux City, IA | `casimir-sioux-city-ia` | verified | Confirmed |
| 13 | Šv. Kazimiero | Kansas City, KS | `st-casimir-kansas-city-ks` | probable | Corrected in R5 |
| 14 | Šv. Kazimiero | Brockton, MA | `casimir-brockton-ma` | probable | Confirmed |
| 15 | Nekalto Prasidėjimo | Cambridge, MA | `peter-cambridge-ma` | verified | Confirmed |
| 16 | Šv. Pranciškaus | Lawrence, MA | `francis-lawrence-ma` | verified | Confirmed |
| 17 | Šv. Jurgio | Haverhill, MA | `george-haverhill-ma` | verified | Confirmed |
| 18 | Šv. Jurgio | Norwood, MA | `george-norwood-ma` | verified | Confirmed |
| 19 | Šv. Kazimiero | Worcester, MA | `casimir-worcester-ma` | verified | Confirmed |
| 20 | Aušros Vartų | Worcester, MA | `gateofdawn-worcester-ma` | verified | Confirmed |
| 21 | Aušros Vartų | Manhattan, NY | `gateofdawn-manhattan-ny` | verified | Confirmed |
| 22 | Šv. Jurgio | Rochester, NY | `george-rochester-ny` | verified | Confirmed |
| 23 | Šv. Jurgio | Brooklyn, NY | `george-brooklyn-ny` | verified | Confirmed |
| 24 | Šv. Jurgio | Niagara Falls, NY | `george-niagara-falls-ny` | probable | Confirmed |
| 25 | Šv. Kazimiero | Amsterdam, NY | `casimir-amsterdam-ny` | probable | Confirmed |
| 26 | Šv. Mykolo | Bayonne, NJ | `michael-bayonne-nj` | verified | Confirmed |
| 27 | Švč. Trejybės | Newark, NJ | `holy-trinity-newark-nj` | probable | Corrected in R5 |
| 28 | Šv. Kazimiero | Paterson, NJ | `casimir-paterson-nj` | probable | Confirmed |
| 29 | Šv. Andriejaus | New Britain, CT | `andrew-new-britain-ct` | probable | Confirmed |
| 30 | Šv. Kazimiero | New Haven, CT | `casimir-new-haven-ct` | verified | Confirmed |
| 31 | Šv. Antano | Ansonia, CT | `st-anthony-ansonia-ct` | probable | Corrected in R5 |
| 32, 76 | Šv. Juozapo | Waterbury, CT | `joseph-waterbury-ct` | thin | Confirmed; intentional merge |
| 33 | Šv. Kazimiero | Nashua, NH | `casimir-nashua-nh` | verified | Confirmed |
| 34 | Šv. Antano | Detroit, MI | `anthony-detroit-mi` | probable | Confirmed |
| 35 | Šv. Petro | Detroit, MI | `peter-detroit-mi` | probable | Confirmed |
| 36 | Šv. Antano | Omaha, NE | `anthony-omaha-ne` | probable | Confirmed |
| 37 | Šv. Jurgio | Cleveland, OH | `george-cleveland-oh` | verified | Confirmed |
| 38 | Dievo Motinos Nuolatinės Pagalbos | Cleveland, OH | `motherofgod-cleveland-oh` | verified | Confirmed |
| 39 | Šv. Jurgio | Shenandoah, PA | `george-shenandoah-pa` | verified | Confirmed |
| 40 | Šv. Kazimiero | Pittston, PA | `casimir-pittston-pa` | probable | Confirmed |
| 41 | Švč. Trejybės | Wilkes-Barre, PA | `trinity-wilkes-barre-pa` | probable | Confirmed |
| 42 | Šv. Marijos Apreiškimo | Kingston, PA | `annunciation-kingston-pa` | probable | Confirmed |
| 43 | Šv. Vincento Pauliečio | Esplen, PA | `paul-esplen-pa` | probable | Confirmed |
| 44 | Šv. Kazimiero | Pittsburgh, PA | `casimir-pittsburgh-pa` | verified | Confirmed |
| 45 | Šv. Juozapo | Scranton, PA | `joseph-scranton-pa` | verified | Confirmed |
| 46 | Šv. Mykolo | Scranton, PA | `michael-scranton-pa` | verified | Confirmed |
| 47 | Šv. Jono | Coaldale, PA | `john-coaldale-pa` | probable | Confirmed |
| 48 | Nekaltojo Prasidėjimo-Aušros Vartų | Archbald, PA | `gateofdawn-archbald-pa` | verified | Confirmed |
| 49 | Šv. Kryžiaus | Mount Carmel, PA | `holycross-mount-carmel-pa` | probable | Confirmed |
| 50 | Šiluvos Dievo Motinos | Maizeville, PA | `motherofgod-maizeville-pa` | probable | Confirmed |
| 51 | Šv. Vincento de Paul | Girardville, PA | `paul-girardville-pa` | verified | Confirmed |
| 52 | Šv. Juozapo | Nanticoke, PA | `joseph-nanticoke-pa` | probable | Confirmed |
| 53 | Šv. Kazimiero | Providence, RI | `casimir-providence-ri` | verified | Confirmed |
| 54 | Šv. Andriejaus | Philadelphia, PA | `andrew-philadelphia-pa` | verified | Confirmed |
| 55 | Šv. Kazimiero | Philadelphia, PA | `casimir-philadelphia-pa` | verified | Confirmed |
| 56 | Šv. Jurgio | Philadelphia, PA | `george-philadelphia-pa` | verified | Confirmed |
| 57 | Šv. Petro | Boston, MA | `peter-boston-ma` | verified | Confirmed |
| 58 | Šv. Kryžiaus | Dayton, OH | `holycross-dayton-oh` | verified | Confirmed |
| 59 | Šv. Kazimiero | Cleveland, OH | `casimir-cleveland-oh` | verified | Confirmed |
| 60 | Švč. Mergelės Marijos Gimimo | Chicago, IL | `nativity-chicago-il` | reported | Confirmed |
| 61 | Švč. M. Marijos Nekalto Prasidėjimo | Chicago, IL | `immaculate-chicago-il` | verified | Confirmed |
| 62 | Šv. Antano | Cicero, IL | `anthony-cicero-il` | probable | Confirmed |
| 63 | Dievo Apvaizdos | Southfield, MI | `providence-southfield-mi` | verified | Confirmed |
| 64 | Pal. Jurgio Matulaičio Misija | Lemont, IL | `george-lemont-il` | verified | Confirmed |
| 65 | Švč. M. Marijos Apreiškimo | Brooklyn, NY | `annunciation-brooklyn-ny` | verified | Confirmed |
| 66 | Kristaus Atsimainymo | Maspeth, NY | `transfiguration-maspeth-ny` | verified | Confirmed |
| 67 | Šv. Petro ir Povilo | Elizabeth, NJ | `paul-elizabeth-nj` | reported | Confirmed |
| 68 | Sopulingosios Dievo Motinos | Kearny, NJ | `parish-kearny-nj` | verified | Confirmed |
| 69 | Šv. Jurgio | Bridgeport, CT | `george-bridgeport-ct` | probable | Confirmed |
| 70 | Švč. Trejybės | Hartford, CT | `trinity-hartford-ct` | verified | Confirmed |
| 71 | Šv. Onos | Luzerne, PA | `ann-luzerne-pa` | verified | Confirmed |
| 72 | Šv. M. Marijos Apsireiškimo | Frackville, PA | `mary-frackville-pa` | probable | Confirmed |
| 73 | Šv. Kazimiero | Los Angeles, CA | `casimir-los-angeles-ca` | verified | Confirmed |
| 74 | Šv. Petro ir Povilo | Grand Rapids, MI | `paul-grand-rapids-mi` | verified | Confirmed |
| 75 | Nekaltojo Prasidėjimo | East St. Louis, IL | `immaculate-east-st-louis-il` | probable | Confirmed |
| 77 | Šv. Alfonso | Baltimore, MD | `st-alphonsus-baltimore-md` | verified | Confirmed |
| 78 | Dievo Apvaizdos | Scranton, PA | `providence-scranton-pa` | reported | Confirmed |
| 79 | Saldžiausios Jėzaus Širdies | Lawrence, MA | `jesus-lawrence-ma` | probable | Confirmed |
| 80 | Šv. Marijos Tautinė Katalikų Parapija | Philadelphia, PA | `mary-philadelphia-pa` | probable | Confirmed |
| 81 | Šv. Kryžiaus | Westville, IL | `holy-cross-westville-il` | probable | Confirmed |
| 82 | Lietuvių Evangelikų Liuteronų Tėviškės Parapija | Darien, IL | `angels-darien-il` | verified | Confirmed |
| 83 | Jeruzalės liuteronų parapija | Collinsville, IL | `parish-collinsville-il` | verified | Corrected in R5 |

## Evidence used for the four corrections

- **Ansonia:** `data/case-records/lietuviu-baznycia-unnamed-ansonia-ct.json`; Draugas registry record `st-anthony-ansonia-ct`; Global True Lithuania; Historic Buildings of Connecticut; current Abundant Life institutional site.
- **Newark:** `data/case-records/lietuviu-baznycia-unnamed-newark-nj.json`; Draugas registry record `holy-trinity-newark-nj`; Archdiocese of Newark directory; Global True Lithuania; Newark church-history sources.
- **Collinsville:** `data/case-records/lithuanian-lutheran-church-collinsville-il.json`; official LCMS locator; Draugas/web historical record; current institutional evidence.
- **Kansas City:** `data/case-records/sv-kazimiero-kansas-city-mo.json`; Wolkovich, *Lithuanian Religious Life in America*, Vol. 3, pp. 160-162; Draugas registry record `st-casimir-kansas-city-ks`; Kansas City and Wyandotte County sources.

## Release boundary

This audit establishes that the public profiles represent the right 82 institutions. It does **not** claim that every lifecycle date or present-use detail is equally final. Those uncertainties remain visible in the case files and source ledgers and can be improved without silently changing parish identity.
