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

CultureNet owns the evidence graph and entity-resolution workflow. This site
owns the reviewed publication projection.

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
