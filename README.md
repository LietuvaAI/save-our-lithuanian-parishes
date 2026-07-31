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
