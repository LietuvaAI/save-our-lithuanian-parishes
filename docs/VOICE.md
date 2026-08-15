# Site voice register

**Register:** neutral public history

**Applies to:** reader-facing website copy, including homepage cards, maps,
profiles, directories, timelines, labels, metadata, and calls to action

**Does not replace:** canonical data, evidence ledgers, or the distinct authored
voice of signed essays and Židinys dispatches

## Core rule

Say what happened, what is known now, and why it matters. Do not narrate the
internal research process when the reader came for the history itself.

The voice is calm, precise, humane, and direct. It may acknowledge uncertainty,
but it does so by naming the uncertain fact—not by describing databases,
projections, adjudication queues, or research tasks.

## Reader-facing order

For a parish, mission, congregation, building, campaign, or current alert:

1. Name the subject and its present state.
2. State the event or historical fact in ordinary language.
3. Add the Lithuanian connection or other context needed to understand why the
   subject belongs on this site.
4. State any material uncertainty narrowly and plainly.
5. Link the profile and sources.

A caveat alone is not useful homepage content. A homepage card must first tell
the visitor what happened and why the entry matters.

## Preferred phrasing

| Avoid | Use |
|---|---|
| “The research record holds a single-source entry…” | “One historical source documents…” |
| “The record does not yet establish the building's condition.” | “The building's present condition has not yet been established.” |
| “The identity check is an open research task.” | “Whether these were the same institution remains unconfirmed.” |
| “Attested in the research record.” | “Documented in historical sources.” |
| “Open the full research record.” | “Open the parish profile.” |
| “Registry Revision 25” on a public card | Omit it; place revision detail on the data or methodology page. |

Use “one historical source” or a similar evidence qualifier only when the
source limitation materially affects how confidently the statement can be
read. Do not turn internal provenance terminology into the subject of the
sentence.

## Accuracy and uncertainty

- Preserve `not established`, `unresolved`, and other canonical distinctions.
- Never convert an absence of evidence into a negative factual claim.
- Never imply that all churches are gone when a view describes only a subset.
- Keep institutions, worship sites, and buildings distinct.
- A successor relationship is not a rename, and a building outcome is not an
  institution outcome.
- Current-event cards must identify the direction of a merger or consolidation
  correctly and describe the resulting community's present state.
- Reader-friendly language never authorizes changing canonical counts,
  classifications, or protected campaign facts.

## Cut, don't restyle — and let sources carry the text

Vilija's rule (2026-08-15), for The Hearth and this site, everything except her
signed essays: the record speaks on its own. Facts, sources, links —
administrative prose. No color, no editorial verdicts, no reader instruction
("read together, and…"), no rhetorical setups ("One might think…"), no
metaphor carrying an argument, no closing flourish.

Two practices follow, and both are measured, not stylistic preference:

1. **Delete framing rather than rewriting it.** Re-voicing machine prose in a
   plainer style produces different machine prose. Deleting the framing
   sentence outright and letting the dated fact stand is what changes a text.
2. **Prefer the source's own words to a summary.** The strongest paragraphs
   are quotation, date, figure, and named source. When a status or summary
   paragraph is needed, build it from the documents themselves — the
   bulletin's printed assurances, the bishop's letter, the council member's
   statement — rather than paraphrase.

Measured effect (Pangram 4.0, 2026-08-15): dispatches edited by deletion moved
from 88% to 50% machine-attributed, and two others to 29% and 28%; a page left
in plain administrative summary but not rebuilt from sources stayed at 93%.
Plain tone alone changes nothing; provenance density does.

## Where process language belongs

Research methods, source depth, canonical projections, registry revisions, and
adjudication may be discussed on About the Data, Sources and Archives,
methodology, provenance, and legal pages, where the process is itself the
subject. Even there, explain technical terms before relying on them.

Signed essays, archival quotations, and Židinys dispatches retain their own
authored voices. Do not mechanically normalize quoted or intentionally
first-person material.

## Enforcement

`npm run verify:reader-copy` checks the principal public source files for
process-first phrases that should not return. The guard is part of `npm run
data`; expand it when a new recurring phrase is found. Human review remains
necessary for sentences that are technically allowed but still foreground the
project's machinery instead of the subject.
