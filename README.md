# Save Our Lithuanian Parishes

**SaveOurLithuanianParishes.org** — the record of America's Lithuanian parishes: who built them, who closed them, and what decides which ones survive.

The site publishes a unified record of Lithuanian parish life in the United
States, grounded in the *Draugas* archive and extended through published parish
histories, current institutional sources, and community reports. The original
case-filed corpus remains a protected historical layer; the public registry
continues to grow without treating that first corpus as the total universe.

## The data

- `data/parishes.csv` — snapshot of the canonical research dataset (see [data/PROVENANCE.md](data/PROVENANCE.md) for source, scope, and binding cautions).
- `scripts/build-data.mjs` — derives `data/parishes.json` + `data/figures.json` and **validates every figure against the locked research figure set. The build fails if any figure drifts.** Runs automatically before `next build`.
- `scripts/build-site-figures.mjs` — derives `data/site-figures.json`, the public count contract for the full registry, U.S. institutional record, Roman Catholic parish history, current Sielovada network, and canonical corpus. It blocks publication when those scopes stop reconciling.
- `data/public-institution-ledger.json` — enumerates every identity behind the public U.S. institution claim, with evidence tier, source locator, and the reconciliation to excluded research records.
- `docs/REGISTRY-INGESTION-CONTRACT.md` — defines how CultureNet evidence assertions become reviewed institutions, relationships, and publication revisions. Raw extraction output never writes directly into the public registry.
- `scripts/verify-public-source-integrity.mjs` — blocks public profiles without a linkable evidence ledger and blocks stale source-depth labels.
- Never hand-edit the CSV here; re-snapshot from the canonical source by PR.

## Development

```bash
npm install
npm run data   # regenerate + validate data files
npm run dev    # http://localhost:3000
```

## Deployment

Deployed on Vercel via Git integration: pushes to a branch get a preview URL; merges to `main` deploy production. All changes land through branch + PR.

## Provenance

Research: the *Draugas* parish-survival corpus (LietuvaAI / Lietuva.AI — Skaitmeniniai knygnešiai). Related published work: „Kam priklauso parapija?" (*Draugas*, 2026).
