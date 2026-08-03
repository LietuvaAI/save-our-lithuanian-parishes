# Public institution count audit

**Audit date:** 2026-08-03
**Registry revision:** 24
**Canonical authority:** CultureNet canonical-public-census-2026-08-03-continuation-authority

## Press-safe claim

The current documented record contains **155 distinct U.S. Lithuanian religious institutions**: 144 parishes, 5 missions, and 6 congregations.

Of these, 134 are supported by a completed two-pass case file or multiple source families. 21 are attested in one located published source and remain explicitly labeled for corroboration. This evidence-depth distinction does not change the institution count.

## Scope

The count includes canonical U.S. institutions only. Buildings and sites, successor entities, duplicate aliases, historical organizing attempts, hosted worship communities, leads, context records, and international comparators are preserved as linked research context and excluded from the institution total.

## Machine contract

`data/canonical-publication-projection.json` is the sole identity and census input. `data/public-institution-ledger.json` lists every included institution, its canonical entity ID and public route, and its site and CultureNet source links. The build fails on count drift, duplicate identifiers or routes, missing display joins, or absent public source locators.
