# Registry ingestion contract

This document defines the boundary between CultureNet research extraction and
the public Save Our Lithuanian Parishes registry. It is the required process
for Wolkovich Volumes 1 and 2, clergy profiles, additional books, newspapers,
directories, and future community submissions.

## Why this contract exists

The first unified registry was assembled while the identity model was still
developing. Source rows, place mentions, historical attempts, buildings, and
institutions sometimes arrived in the same shape. That created three recurring
errors:

1. Two source names for one parish became two public parish rows.
2. A short-lived organizing phase or research lead became a public institution.
3. Free text containing a year was interpreted as a founding or closure date.

Registry Revisions 5 through 8 repaired those joins. Future imports must not
write extraction output directly into the public registry.

## The CultureNet boundary

CultureNet Brain owns the evidence graph, entity-resolution workflow, reviewed
factual assertions, and projection builders. This site renders committed copies
of the generated publication and infographic projections; it does not own or
adjudicate their factual content.

That boundary includes identity, census membership, status, selected dates,
jurisdiction, institution-to-site relationships, building conditions, the
Sielovada directory transcription, current pastoral membership, and all public
counts. `data/canonical-*.json` and `data/sielovada-us-network.json` are generated
deployment caches imported with `npm run data:import-brain`. A verifier must
reject any local difference from the embedded Brain directory projection.

CultureNet should distinguish these objects before publication:

- **Source artifact:** a book, issue, page, image, directory entry, decree, or
  website snapshot.
- **Evidence assertion:** one source-backed claim with subject, predicate,
  value, date or date range, exact locator, and confidence.
- **Candidate entity:** a provisional institution, person, building, place,
  organization, event, or historical phase produced during extraction.
- **Canonical entity:** a reviewed identity with stable ID and aliases.
- **Relationship:** a dated edge such as priest-served-parish,
  parish-used-building, parish-merged-into-parish, community-founded-parish,
  or diocese-governed-parish.
- **Publication projection:** the subset of canonical entities and assertions
  approved for this site's registry, profiles, maps, and counts.

An extraction row is never a canonical entity merely because it contains a
name and city.

## Non-negotiable identity rules

1. One institution has one canonical registry row.
2. A church building is not the parish that used it.
3. A historical organizing attempt or phase is not a durable institution.
4. A mission, hosted Mass, parish, and congregation remain distinct types.
5. A priest is a person entity; an assignment is a dated relationship, not
   prose embedded in a parish row.
6. Every published fact retains an exact source locator and source URL when a
   public URL exists.
7. Conflicting readings remain separate assertions until adjudicated.
8. A number inside prose is not a lifecycle date without an explicit predicate.
9. Retired slugs remain aliases or redirects; evidence is never discarded.
10. Public counts include only approved `parish`, `misija`, and `congregation`
    entities in the stated geographic and denominational scope.
11. Publication scope and identity support are explicit fields, not inferred
    from names, cities, route counts, source-axis totals, or prose.
12. A distinct predecessor parish remains one historical institution even when
    its canonical or community life continues in a successor.
13. A newly constituted successor parish is a second institution. A rename or
    relocation of the same institution is not.
14. Institutions and physical sites have separate counts. A standing,
    demolished, sold, or repurposed church building never determines whether
    the parish institution is active.
15. Active-life counts include only the living parish, mission, or hosted-Mass
    community. Historical predecessors may be linked to it but do not become
    active through that relationship.

## Required import sequence

### 1. Extract

Qwen or another extraction model may produce over-inclusive candidate
assertions. It must preserve page numbers, quoted context within rights limits,
source-local names, and uncertainty. It must not choose canonical IDs.

### 2. Resolve candidates

Compare candidates against canonical names, aliases, city history, coordinates,
building addresses, dates, clergy assignments, predecessor/successor
relationships, and existing source lineage. Produce possible matches, not
automatic merges.

### 3. Adjudicate identity

A human-reviewed research packet decides whether each candidate is:

- the same institution;
- a predecessor, successor, merger, or relocation;
- a building or site associated with an institution;
- a historical phase or failed attempt;
- an unresolved lead; or
- a genuinely new canonical institution.

### 4. Verify the current record

For institutions that may still exist, complete a separate current/official
pass using parish, diocesan, denominational, legal, property, and reliable local
sources. Historical evidence alone does not establish current status.

### 5. Publish by revision

Site changes arrive through a replayable registry-revision script and report.
The revision must preserve sources and aliases, state every count delta, update
the release ledger and content hash, regenerate all derived data, and pass the
blocking source, identity, scope, and surface checks.

## Wolkovich and clergy import requirements

Volumes 1 and 2 and the clergy corpus should first enter CultureNet as
assertions and relationships:

- person identity and name variants;
- religious order and incardination when explicitly sourced;
- dated parish assignments and roles;
- parish organization, dedication, relocation, merger, and closure events;
- building construction, demolition, sale, and reuse events;
- schools, convents, cemeteries, societies, and community organizations as
  separate entities linked to the parish;
- exact volume and page locator for every assertion.

The site should then consume a reviewed projection. It should not receive a
flat dump of people, places, buildings, and events shaped as parish records.

## Release acceptance

A registry import is ready only when:

- every candidate is resolved, held as a lead, or explicitly excluded;
- every public profile has a linkable evidence ledger;
- source-depth labels are recalculated;
- duplicate and retired-slug guards pass;
- public and research-only scopes reconcile;
- every public census identity is classified as canonical case-filed,
  multi-source corroborated from qualifying located evidence, or single-source
  attested pending corroboration;
- the revision ledger records research, public U.S., and Roman Catholic parish
  totals;
- the 83 source rows, 82 locked identities, and campaign identity locks remain
  unchanged unless Vilija approves a dedicated identity revision; and
- the full data validation and production build pass.

Design work begins only after this contract is green. Presentation may change;
entity identity, source lineage, and published counts may not be reinterpreted
in the design layer.

## Design-facing count contract

Design and page code consume `data/site-figures.json`; they do not count routes,
profiles, search results, map points, or raw registry rows. The public scopes are:

- `publicUS.records`: all approved U.S. parish, mission, and congregation
  institutions in the current revision;
- `publicUS.romanCatholicParishes`: distinct historical U.S. Roman Catholic
  parish institutions only;
- `currentCatholicLife`: the separate current pastoral network reconciled to
  the Sielovada directory; and
- `history.parishes`: the Roman Catholic parish population used by the
  historical comparison; missions and other traditions remain outside that
  view.

`data/public-institution-ledger.json` is the inspectable enumeration behind the
public U.S. count. Internal research-profile totals never appear on public
surfaces. The design layer may label and visualize these values, but may not
combine populations or derive replacement counts.

## Profile and infographic projection

The canonical parish profile must present three linked records without
flattening them:

1. **Institution life:** organization/founding, canonical changes, merger or
   suppression, and current institutional status.
2. **Churches and sites:** every sourced physical church home or major parish
   site, with its own construction/acquisition, use, disposition, demolition,
   and reuse events.
3. **Continuity:** typed links showing where canonical life, congregation,
   worship, records, artifacts, or other inheritance continued.

The national history flow remains an institution-lifespan view. A present
building's dedication year must not replace its parish's founding year. Building
events appear as separate markers or in a separate building/site mode generated
from the same site projection. For example, Divine Providence may carry its
institutional lineage from 1908 while separately showing the 1949 Schaefer
church, its 1970 demolition, and the present Southfield church dedicated in
1973.

Clicking an institution line opens the parish profile. Clicking or selecting a
building marker opens that building/site record within the profile. Neither
interaction may synthesize dates or relationships from narrative prose at
render time.
