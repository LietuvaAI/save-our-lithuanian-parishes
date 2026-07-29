# Registry Revision 4 - Waterbury identity hold

**Applied:** 2026-07-28
**Before:** Registry Revision 3, 211 records
**After:** Registry Revision 4, 210 records
**Locked C83 impact:** none

## Decision

The unnamed `lithuanian-church-waterbury-ct` row is a research lead, not an adjudicated public entity. It has a provisional 1902 founding reading but no indexed newspaper mentions, institutional name, address, corroborating source, or evidence proving that it is distinct from Waterbury St. Joseph or historical All Saints.

Its complete registry record and classifier overlay are preserved in `data/candidates/waterbury-1902-unresolved-lead.json`. It no longer creates a public profile, map point, category count, or campaign association.

## Protected Waterbury identities

- **Public campaign:** St. Joseph Lithuanian Catholic Church remains `/parishes/sv-juozapo-waterbury-ct`, backed by registry row `joseph-waterbury-ct`.
- **Historical entity:** All Saints remains a separately supported historical independent/national church under `lithuanian-national-catholic-parish-waterbury-ct`.
- **Retired duplicate:** the false St. Casimir C83 row remains merged into St. Joseph and does not create another entity.

## Count impact

| Measure | Before | After |
|---|---:|---:|
| Registry records | 211 | 210 |
| Parish rows | 196 | 195 |
| Historical phase rows | 1 | 1 |
| Mission rows | 4 | 4 |
| Congregation rows | 10 | 10 |
| Locked C83 cases | 83 | 83 |

## Campaign protection

Every entry in `alerts.json → campaigns[]` now carries an explicit `identityLock`. The data build fails if a protected campaign profile is renamed, merged, redirected, relocated, moved to another registry row, assigned different C83 lineage, or reclassified as another institution or denomination. Current status remains updateable because campaigns must reflect documented events.
