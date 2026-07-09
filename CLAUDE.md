# CLAUDE.md — save-our-lithuanian-parishes

Public advocacy site for SaveOurLithuanianParishes.org. This is a **product repo** in the LietuvaAI system — the master control stack lives in `culturenet-brain` (`DECISIONS.md`, `docs/systems/switchboard.md`, `docs/systems/agent-guardrails.md`, `docs/systems/agent-git-operating-model.md`). Read those for routing, tiers, and git lifecycle; this file holds only repo-local rules.

## Lane

- Build surface: Claude Code (laptop). Codex reviews repo-heavy/safety work. Cowork routes; it does not build here.
- Branch/PR flow only. Never push to `main`. Branch names: `<topic>-<YYYY-MM-DD>`.
- Git identity before any commit: `LietuvaAI` / `vilija@lietuva.ai` (repo-local config).
- Named files in `git add` — never `git add .`.
- No `.env*` files. The site is fully static; if a backend (submissions) is added later, that decision lands in a PR + culturenet-brain `DECISIONS.md` first.

## Data discipline (the credibility of the whole project)

- `data/parishes.csv` is a **snapshot** of the canonical dataset in `culturenet-brain/docs/research/draugas/parishes.csv`. Never hand-edit it here — re-snapshot by PR and update `data/PROVENANCE.md`.
- `scripts/build-data.mjs` validates every derived figure against the locked figure set and **fails the build on drift**. Expected figures change only to match a new upstream locked-figures revision.
- `data/parishes.json` and `data/figures.json` are generated — regenerate with `npm run data`, commit alongside the script that produced them.
- New data enters under its own `corpusScope` tag; the `draugas-2008-2026` figures never silently mutate.

## Binding editorial guardrails (from the locked research — do not relax)

1. **Never advocate leaving Rome.** The National Catholic parishes are historical witness, not a recommendation.
2. **Maspeth is unresolved** — never render or phrase as a completed closure.
3. **Aušros Vartų sale price** stays soft ("tens of millions"), no hard number; demolition year unresolved.
4. The PA **"31/29"** figure is an attributed Draugas statistic — never drawn as dataset marks.
5. **No invented numbers.** Blank fields stay blank.
6. **83 documented / 58 case-filed in depth** — copy must respect the distinction.
7. Visuals encode `ending_mode` (who decided), not closed-vs-standing.

## Deploy

Vercel Git integration (LietuvaAI team): branch push → preview URL; merge to `main` → production. Same model as ziburio-archive.
