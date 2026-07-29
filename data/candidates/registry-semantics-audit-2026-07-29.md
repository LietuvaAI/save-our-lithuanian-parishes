# Registry semantics and public-scope audit

**Audit date:** 2026-07-29

**Registry revision:** 6

## Result

This audit checked all Registry Revision 5 rows for institutional identity, source-to-entity lineage, record type, congregation class, diocesan governance, public count eligibility, and route preservation.

- Registry rows after lossless consolidation: **197**
- Public U.S. records (parishes, missions, and congregations): **168**
- U.S. Roman Catholic parish records: **142**
- Historical phases withheld from public counts: **6**
- Unresolved research leads withheld from public counts: **7**
- Context-only records withheld from public counts: **2**
- Frozen C83 source rows: **83**
- Locked canonical C83 identities: **82**

## Confirmed same-entity consolidations

1. Lawrence Sacred Heart: `jesus-lawrence-ma` absorbs `lawrence-lawrence-ma` and `parish-lawrence-ma`.
2. Scranton St. Joseph: `joseph-scranton-pa` absorbs `holyname-scranton-pa`.
3. Scranton Providence of God: `providence-scranton-pa` absorbs `parish-scranton-pa`.
4. Pittsburgh Ascension: `ascension-pittsburgh-pa` absorbs `ascension-pittsburgh-pa-2` and `parish-pittsburgh-pa`.
5. Maizeville Our Lady of Siluva: `motherofgod-maizeville-pa` absorbs `louis-maizeville-pa` and `parish-maizeville-pa`.
6. Worcester St. Casimir: `casimir-worcester-ma` absorbs `parish-worcester-ma-2`.

All retired slugs remain aliases. No canonical C83 slug or campaign identity changed.

## Cross-entity source repairs

- Wolkovich p.223 now belongs to the independent Town of Lake St. Peter record, not Roman Catholic Ss. Peter and Paul in West Pullman.
- Michelsonas p.130's failed Athol National Catholic attempt is a separate historical phase, not part of Roman Catholic St. Francis.
- Michelsonas pp.425 and 427 now support Toronto St. John, not Chicago's Raymond Baptist context record.
- Michelsonas p.427's Resurrection reference now supports Toronto Resurrection; the unidentified 1929 Toronto archive seed remains a research lead.

## Scope rule

Only records typed `parish`, `misija`, or `congregation` may appear in the public Record and registry map. Homepage, History, and By Diocese Roman Catholic figures additionally require `record_type: parish` and `congregation_class: roman_catholic`.

`phase`, `lead`, and `context` records remain fully preserved, source-linked, and directly routable for research. They cannot inflate public institutional counts.

## Governance normalization

Waterbury St. Joseph now uses the current `Archdiocese of Hartford` governance label. Historical source transcriptions may still say `Diocese of Hartford`, but that older wording cannot create a second present-day jurisdiction bucket.

## Sources used for identity adjudication

- Global True Lithuania, Lawrence and Lowell: https://global.truelithuania.com/lawrence-and-lowell-massachusetts-1682/
- Global True Lithuania, Pittsburgh: https://global.truelithuania.com/pittsburgh-pennsylvania-1133/
- Global True Lithuania, Shenandoah and southern coal region: https://global.truelithuania.com/lt/shenandoah-and-southern-coal-region-pennsylvania-1111/
- Global True Lithuania, Scranton and northern coal region: https://global.truelithuania.com/northern-coal-region-scranton-1614/
- Diocese of Scranton consolidated-parishes table: https://www.dioceseofscranton.org/wp-content/uploads/2021/03/Consolidated-Parishes-3-24-21.pdf
- Lithuanian National Catholic Church history: https://www.lktb.org/home/about
- Worcester Lithuanian history: https://old.lituanus.org/1980_2/80_2_06.htm

The underlying Wolkovich and Michelsonas page citations remain attached directly to the affected registry rows.
