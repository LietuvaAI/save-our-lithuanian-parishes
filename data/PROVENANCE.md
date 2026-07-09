# Data Provenance

## parishes.csv

- **Canonical source:** `LietuvaAI/culturenet-brain` → `docs/research/draugas/parishes.csv`
- **Snapshot taken:** 2026-07-08, from `main` (last upstream change to the file: commit `b2804c2`, 2026-05-26)
- **Locked figure set:** `docs/research/draugas/Draugas-Infographic-Locked-Figures.md` (locked 2026-05-23, scope 83), same folder. Every headline figure this site displays is re-derived from the CSV at build time and validated against that locked set by `scripts/build-data.mjs`. **The build fails if any figure drifts.**
- **Corpus:** the *Draugas* born-digital archive, 2 January 2008 – 21 May 2026 — 2,768 issues searched (2 of 2,770 corrupt). Source line: „Šaltinis: „Draugo" archyvas, 2008–2026 m."
- **Scope:** 86 rows = 83 distinct U.S. Lithuanian parishes + 3 Canadian comparators (states QC/ON; excluded from all U.S. figures).
- **Corpus scope tag:** `draugas-2008-2026`. Future dataset expansions (historical parishes pre-2008, community-reported records) enter under their own scope tags and never alter the figures of this scope.

## Update protocol

Never hand-edit `data/parishes.csv` in this repo. If the upstream canonical CSV changes (e.g., Maspeth resolves), re-snapshot it here in a PR, update this file's snapshot line, and update the expected figures in `scripts/build-data.mjs` **only** to match a new upstream locked-figures revision.

## Binding data cautions (from the locked figure set)

- **Maspeth is NOT closed.** Closure letter Feb 2025, reversed to limited-basis opening Sept 2025; `undecided` as of March 2026 — never render as a completed closure.
- **Manhattan Aušros Vartų** sale price is a soft composite — "tens of millions", never a hard number. Demolition year unresolved (2015 vs 2020).
- The Pennsylvania **"31 parishes / 29 Roman Catholic, all closed"** figure is a statistic *stated in Draugas* (2017-12-28; 2024-01-20), not enumerated dataset rows — cite as attributed, never draw 31 marks.
- **No invented numbers.** Blank CSV fields are blank because the research does not support a figure.
- **83 documented / 58 case-filed in depth** — copy must not call all 83 full case histories.
