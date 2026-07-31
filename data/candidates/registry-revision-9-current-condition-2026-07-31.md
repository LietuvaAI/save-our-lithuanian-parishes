# Registry Revision 9: current-condition reconciliation

**Audit date:** 2026-07-31

**Registry revision:** 9

## Result

This revision reconciles the public classifier overlay with the newer deep case records. It keeps parish lifecycle, Lithuanian identity, physical building fate, and current building use as separate facts.

- Research registry records: **192**
- Public U.S. institutions: **159**
- U.S. Roman Catholic parish institutions: **134**
- Deep case records projected: **83**
- Building-fate or situation corrections: **25**
- Public identity additions or deletions: **0**

## Corrections

1. `ausros-vartu-chicago-il` — present building fate or situation text corrected from `data/case-records/ausros-vartu-chicago-il.json`.
2. `dievo-apvaizdos-chicago-il` — present building fate or situation text corrected from `data/case-records/dievo-apvaizdos-chicago-il.json`.
3. `saldziausios-jezaus-sirdies-lawrence-ma` — present building fate or situation text corrected from `data/case-records/saldziausios-jezaus-sirdies-lawrence-ma.json`.
4. `siluvos-dievo-motinos-maizeville-pa` — present building fate or situation text corrected from `data/case-records/siluvos-dievo-motinos-maizeville-pa.json`.
5. `sv-andriejaus-new-britain-ct` — present building fate or situation text corrected from `data/case-records/sv-andriejaus-new-britain-ct.json`.
6. `sv-antano-detroit-mi` — present building fate or situation text corrected from `data/case-records/sv-antano-detroit-mi.json`.
7. `sv-antano-omaha-ne` — present building fate or situation text corrected from `data/case-records/sv-antano-omaha-ne.json`.
8. `sv-juozapo-south-chicago-il` — present building fate or situation text corrected from `data/case-records/sv-juozapo-south-chicago-il.json`.
9. `sv-juozapo-waterbury-ct` — present building fate or situation text corrected from `data/case-records/sv-juozapo-waterbury-ct.json`.
10. `sv-jurgio-cleveland-oh` — present building fate or situation text corrected from `data/case-records/sv-jurgio-cleveland-oh.json`.
11. `sv-jurgio-philadelphia-pa` — present building fate or situation text corrected from `data/case-records/sv-jurgio-philadelphia-pa.json`.
12. `sv-jurgio-rochester-ny` — present building fate or situation text corrected from `data/case-records/sv-jurgio-rochester-ny.json`.
13. `sv-kazimiero-amsterdam-ny` — present building fate or situation text corrected from `data/case-records/sv-kazimiero-amsterdam-ny.json`.
14. `sv-kazimiero-brockton-ma` — present building fate or situation text corrected from `data/case-records/sv-kazimiero-brockton-ma.json`.
15. `sv-kazimiero-gary-in` — present building fate or situation text corrected from `data/case-records/sv-kazimiero-gary-in.json`.
16. `sv-kazimiero-pittston-pa` — present building fate or situation text corrected from `data/case-records/sv-kazimiero-pittston-pa.json`.
17. `sv-konstantino-oglesby-il` — present building fate or situation text corrected from `data/case-records/sv-konstantino-oglesby-il.json`.
18. `sv-kryziaus-mount-carmel-pa` — present building fate or situation text corrected from `data/case-records/sv-kryziaus-mount-carmel-pa.json`.
19. `sv-mykolo-bayonne-nj` — present building fate or situation text corrected from `data/case-records/sv-mykolo-bayonne-nj.json`.
20. `sv-mykolo-scranton-pa` — present building fate or situation text corrected from `data/case-records/sv-mykolo-scranton-pa.json`.
21. `sv-onos-spring-valley-il` — present building fate or situation text corrected from `data/case-records/sv-onos-spring-valley-il.json`.
22. `sv-petro-detroit-mi` — present building fate or situation text corrected from `data/case-records/sv-petro-detroit-mi.json`.
23. `sv-pranciskaus-lawrence-ma` — present building fate or situation text corrected from `data/case-records/sv-pranciskaus-lawrence-ma.json`.
24. `sv-vincento-de-paul-girardville-pa` — present building fate or situation text corrected from `data/case-records/sv-vincento-de-paul-girardville-pa.json`.
25. `unnamed-lithuanian-parish-baltimore-md` — present building fate or situation text corrected from `data/case-records/unnamed-lithuanian-parish-baltimore-md.json`.

All 83 deep case files now govern the public `current_use`
field and carry an explicit `current_record_path` and as-of date. The profile
continues to read the full case summary, chronology, gaps, and source ledger
directly from that case file.

## Lifecycle adjudication

Philadelphia St. George now publishes the Archdiocese of Philadelphia's official 1902-2019 parish lifecycle. The prior 1920 founding and 2016 merger readings remain visible as source conflicts. The church building remains an active worship site of St. John Paul II Parish; that building continuity does not make the former Lithuanian parish active.

## Guard

`scripts/verify-case-overlay-parity.mjs` blocks publication when a deep case file establishes a standing, converted, demolished, or for-sale building but the public overlay regresses to `unknown`, or when obvious present-use classifications conflict.
