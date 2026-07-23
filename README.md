# Save Our Lithuanian Parishes

**SaveOurLithuanianParishes.org** — the record of America's Lithuanian parishes: who built them, who closed them, and what decides which ones survive.

Eighteen years of the *Draugas* archive (2008–2026, 2,768 issues searched) case-filed 83 U.S. Lithuanian parishes so far — the first dataset, not a ceiling. 55 were closed, merged away, suppressed, or demolished by diocesan decision — and all 55 were diocese-owned. Zero community-owned parishes were ever closed by an outside authority. This site publishes that record, openly and verifiably, and grows it: backward through the archives toward 1900, and forward through community reports.

## The data

- `data/parishes.csv` — snapshot of the canonical research dataset (see [data/PROVENANCE.md](data/PROVENANCE.md) for source, scope, and binding cautions).
- `scripts/build-data.mjs` — derives `data/parishes.json` + `data/figures.json` and **validates every figure against the locked research figure set. The build fails if any figure drifts.** Runs automatically before `next build`.
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
