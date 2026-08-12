# Design reference bundle — go-live tranche

Self-contained copies of the approved design references so they can be inspected and rendered
directly, alongside `../handoff-codex-go-live.md`.

## Files

- `Homepage Directions.dc.html` — homepage directions; **option 1a "The Atlas" is the approved
  homepage** (1b is kept for reference only).
- `All Profiles v3.dc.html` — the approved categorized All Profiles directory. It supersedes v2.
- `All Profiles v2.dc.html` — retired timeline reference, retained for history only.
- `support.js` — the Design Component runtime the reference files load (committed separately in
  this project; not required to read the source).
- `data/all-profiles-155.json` — the fixture the All Profiles references read. **Design fixture
  only — do not ship.** The production component must read `institution_history` from the
  canonical projection per the field-mapping table in the handoff.

## How to view

Each `.dc.html` opens directly in a browser (double-click, or serve the folder and open the
file). They render live from inline styles; no build step. To read structure instead of
rendering, open the file — the template markup is between `<x-dc>` and `</x-dc>`, and the logic
class is in the `<script data-dc-script>` block at the bottom.

## Reminder

These are **layout/behavior references only**, never parish evidence. Build the production pages
from canonical data; lift spacing, type, color, and interaction from the reference.
