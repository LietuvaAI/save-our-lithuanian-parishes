# Clergy Extraction Spec — Wolkovich Vols. 1, 2, 3 + Michelsonas

> **Handoff to the research engine.** This document specifies how clergy
> (priests, pastors, religious) associated with Lithuanian parishes should be
> extracted from primary scholarly sources and structured to fit the parish
> registry on saveourlithuanianparishes.org.

**Status:** Specification ready; extraction blocked on Vol. 1 & 2 OCR.
Vol. 3 biographies (~90 pp.) can proceed immediately.

---

## Sources

| Source | Axis ID | Clergy data location | OCR status |
|--------|---------|----------------------|------------|
| Wolkovich, *Lithuanian Religious Life in America*, Vol. 3 (1998) | `wolkovich` | Per-parish pastor lists + ~90 pp. biographical appendix | Done (T9) |
| Wolkovich, *Lithuanian Religious Life in America*, Vol. 1 (1991) | `wolkovich-vol1` | Per-parish pastor lists + biographical appendix (Eastern US) | Queued for photography |
| Wolkovich, *Lithuanian Religious Life in America*, Vol. 2 (1998) | `wolkovich-vol2` | Per-parish pastor lists + biographical appendix (Pennsylvania) | Queued for photography |
| Michelsonas, *Lietuvių Išeivija Amerikoje* (1868–1961) | `michelsonas-1961` | Veikėjai section, pp. 351–412 | Done (T9) |

All sources are in-copyright. Only structured facts and page-cited quotes
(<25 words) may enter the repository.

---

## Entity model

Clergy are **Actor** entities in Sacred Core Schema v1. Each extracted priest
produces one Actor record, regardless of how many parishes they served.

### Actor fields (clergy subset)

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `clergy_slug` | yes | string | Slugified from canonical Lithuanian name: `kun-juozapas-zilinskas` |
| `name_display` | yes | string | Full display name with title: `Kun. Juozapas Žilinskas` |
| `name_lt` | yes | string | Lithuanian name without title: `Juozapas Žilinskas` |
| `alternate_names` | yes | string[] | Anglicized forms, abbreviations, OCR variants: `["Rev. Joseph Zilinskas", "J. Žilinskas"]` |
| `title` | yes | enum | `kunigas` \| `precentor` \| `vikaras` \| `monsignor` \| `bishop` \| `religious_sister` \| `other` |
| `birth_year` | no | number \| null | |
| `death_year` | no | number \| null | |
| `ordination_year` | no | number \| null | |
| `origin` | no | string \| null | Place of origin if stated (Lithuanian parish/town) |
| `biographical_note` | no | string \| null | One-sentence summary (<25 words per source, page-cited) |
| `parishes_served` | yes | array | See below |
| `sources` | yes | array | Provenance entries per source that documents this person |

### `parishes_served` array entries

Each entry links a clergy member to a parish with a role and date range.

```json
{
  "parish_slug": "casimir-gary-in",
  "role": "pastor",
  "year_start": 1912,
  "year_end": 1935,
  "note": null,
  "source_axis": "wolkovich",
  "source_pages": "p.75"
}
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `parish_slug` | yes | string | Registry slug (e.g., `casimir-gary-in`) |
| `role` | yes | enum | `pastor` \| `administrator` \| `vicar` \| `founder` \| `visiting_priest` \| `organist` \| `school_principal` \| `other` |
| `year_start` | no | number \| null | First year of service if stated |
| `year_end` | no | number \| null | Last year of service if stated |
| `note` | no | string \| null | Source-specific context (<25 words) |
| `source_axis` | yes | string | Which source documents this association |
| `source_pages` | yes | string | Page citation |

### `sources` array entries

```json
{
  "axis": "wolkovich",
  "pages": "p.350-351",
  "tier": 2,
  "section": "biographical_appendix"
}
```

`section` is one of: `parish_entry` (pastor listed in the parish's own entry),
`biographical_appendix` (standalone biography in the appendix section),
`veikėjai` (Michelsonas activist section).

---

## Extraction procedure

### Pass 1 — Parish-entry pastors (per-parish, all volumes)

Every Wolkovich parish entry lists pastors with service years. Extract these
as `parishes_served` associations. The priest may not yet have a standalone
biography — create a minimal Actor record with just `name_display`,
`name_lt`, `alternate_names`, and the `parishes_served` entry.

**Example** (Vol. 3, p. 75, St. Casimir Gary IN):
> "Pastors: Rev. A. Skrypka 1911–12; Rev. V. Slavynas 1913; Rev. J. Žilinskas
> 1913–35 ..."

This produces:
- Actor `kun-a-skrypka` with `parishes_served: [{ parish_slug: "casimir-gary-in", role: "pastor", year_start: 1911, year_end: 1912 }]`
- Actor `kun-v-slavynas` with same pattern
- etc.

### Pass 2 — Biographical appendix (Vol. 3 first, then Vols. 1 & 2)

Each biography produces a richer Actor record with `birth_year`,
`death_year`, `ordination_year`, `origin`, `biographical_note`. Merge with
any existing minimal record from Pass 1 by matching on canonical Lithuanian
name.

### Pass 3 — Michelsonas veikėjai (pp. 351–412)

The Michelsonas activist section covers secular and religious leaders. Extract
only those identified as clergy (kunigas, precentor, etc.) with their parish
associations. Flag secular activists for future Entity Engine processing but
do not include them in this clergy extraction.

### Deduplication

Clergy served multiple parishes and appear in multiple volumes. The canonical
identity is the Lithuanian name with diacritics (`Juozapas Žilinskas`, not
`Joseph Zilinskas`). Deduplication keys:

1. Exact Lithuanian name match
2. If ambiguous: name + ordination year + diocese
3. If still ambiguous: flag for human review, do not merge

Maintain an `ambiguous_matches` output file listing all flagged cases.

---

## Output files

The extraction should produce these files in culturenet-brain:

```
docs/research/clergy-extraction/
├── clergy.csv              # One row per clergy member (Actor fields)
├── clergy-parishes.csv     # One row per clergy-parish association
├── ambiguous-matches.csv   # Flagged dedup cases for human review
├── progress.md             # Extraction ledger (per-volume status, page ranges done)
└── WEBSITE-HANDOFF.md      # Handoff notes for website integration
```

### clergy.csv columns

```
clergy_slug, name_display, name_lt, alternate_names, title,
birth_year, death_year, ordination_year, origin,
biographical_note, source_axes, source_pages
```

### clergy-parishes.csv columns

```
clergy_slug, parish_slug, role, year_start, year_end,
note, source_axis, source_pages
```

---

## Registry integration

Once extracted, the website repo integrates clergy data via the build
pipeline, following the same pattern as parish-situation.json.

### New file: `data/clergy.json`

```json
{
  "generated": "2026-XX-XX",
  "clergy": [
    {
      "clergy_slug": "kun-juozapas-zilinskas",
      "name_display": "Kun. Juozapas Žilinskas",
      "name_lt": "Juozapas Žilinskas",
      "alternate_names": ["Rev. Joseph Zilinskas"],
      "title": "kunigas",
      "birth_year": 1870,
      "death_year": 1945,
      "ordination_year": 1895,
      "parishes_served": [
        {
          "parish_slug": "casimir-gary-in",
          "role": "pastor",
          "year_start": 1912,
          "year_end": 1935,
          "source_axis": "wolkovich",
          "source_pages": "p.75"
        }
      ]
    }
  ]
}
```

### Build pipeline change (`scripts/build-data.mjs`)

The build script should:

1. Load `data/clergy.json`
2. Build a reverse index: `parish_slug → clergy[]`
3. Merge a `clergy` array into each parish in `parishes.json`
4. Each parish's `clergy` entry is a compact summary:

```json
{
  "clergy_slug": "kun-juozapas-zilinskas",
  "name_display": "Kun. Juozapas Žilinskas",
  "role": "pastor",
  "years": "1912–1935"
}
```

### Profile page rendering

The canonical profile page (`app/parishes/[slug]/page.tsx`) should render a
"Clergy" section showing:

- Name (linked to a future clergy profile page if one exists)
- Role and years of service
- Source citation

The section should appear between "Scholarly sources" and "The present
record", since it's historical data from the same scholarly sources.

A future clergy index page (`/clergy`) and individual clergy profile pages
(`/clergy/[slug]`) can be built once the data exists, showing all parishes a
priest served across their career.

---

## Discipline

1. **Copyright.** No full-text reproduction. Facts + page-cited quotes <25
   words only. Pastor lists are factual (name + years) and safe to extract.
2. **Confidence.** Score every field 0.0–1.0. OCR-suspect names get
   confidence <0.7 and are flagged in `ambiguous-matches.csv`.
3. **Lithuanian canonical.** The Lithuanian name with diacritics is always
   canonical. Anglicized forms are aliases. Never strip diacritics from the
   canonical name.
4. **No invention.** If a date is not stated, it stays null. "Active by 1915"
   is a note, not a `year_start` of 1915.
5. **Source segregation.** Each source axis gets its own `source_axis` tag on
   every association. If Wolkovich says "pastor 1912–35" and Michelsonas says
   "pastor 1911–35", keep both readings with their citations — do not merge
   conflicting dates.
6. **Scope.** This extraction covers clergy associated with Lithuanian
   parishes in North America. Do not extract non-Lithuanian clergy unless they
   served a Lithuanian parish. Do not extract secular activists from
   Michelsonas (defer to Entity Engine).

---

## Execution order

1. **Now:** Extract Vol. 3 biographical appendix (~90 pp.) + Vol. 3
   parish-entry pastor lists. This is unblocked — OCR exists on T9.
2. **When OCR'd:** Vol. 2 (Pennsylvania) — highest priority because it covers
   the coal-region parishes where clergy history is richest.
3. **When OCR'd:** Vol. 1 (Eastern US) — completes the trilogy.
4. **Parallel:** Michelsonas veikėjai pp. 351–412 — can run alongside any
   volume since it's already OCR'd.
5. **After extraction:** Website integration PR in save-our-lithuanian-parishes
   with `data/clergy.json`, build-script changes, and profile-page rendering.
