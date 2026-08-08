# WIP — save-our-lithuanian-parishes Work-In-Progress Ledger

_Operating ledger for open work in this repo. Refresh from live GitHub state before deleting any branch, closing any PR, or treating any work as merged._

> **Created:** 2026-07-30 by Claude Code — first ledger this repo has had. State surveyed from live `gh pr list`, `git for-each-ref`, `git worktree list`, and per-branch content comparison against `origin/main` at `24d6fe9` (PR #124).
> Active repo root: `/Users/horse/dev/save-our-lithuanian-parishes`.
> Sibling ledger: `~/dev/writing/WIP.md`.

---

## ⚠️ At Risk Right Now — Read This First

Two bodies of work exist **only on this laptop**. They are not on GitHub, not in any pull request, and not on `main`. A disk failure or a careless `git worktree remove` loses them.

### 1. `codex/home-campaign-line-art-2026-07-30` — 11 committed line drawings + 6 more uncommitted

- **Where:** `/Users/horse/Documents/Codex/2026-07-23/research-lane-2026-07-23/worktrees/solp-campaign-line-art`
- **Committed but never pushed** — 3 commits, no remote branch, no PR:
  - `95ef6e8` Add church drawings to active campaigns — Hartford Holy Trinity, Maspeth Transfiguration, Waterbury St. Joseph line drawings + `app/page.tsx` rework
  - `463182a` Correct Divine Providence restructuring wording (`data/alerts.json`)
  - `257d56a` Unify the homepage church procession — 8 further line drawings (Chicago Holy Cross, Chicago St. George, Lawrence Sacred Heart, Manhattan Our Lady of Vilnius, Mount Carmel Holy Cross, Pittsburgh St. Casimir, Shenandoah St. George, Wilkes-Barre Holy Trinity) plus re-renders of Hartford, Maspeth, and Waterbury, and a `components/ChurchProcession.tsx` rewrite
- **Uncommitted on top of that** — modified `app/parishes/[slug]/page.tsx`, `data/photos.json`, `lib/photos.ts`; untracked `data/candidates/lukas-line-drawing-manifest-2026-07-30.json` and five more line drawings (Boston St. Peter, Brooklyn Annunciation, Dayton Holy Cross, Grand Rapids Sts. Peter & Paul, Maizeville Our Lady of Šiluva)
- **Verified against `main`:** only `southfield-divine-providence-line-drawing.png` exists on `main`. **Every one of these 16 drawings is unique to this laptop.**
- **Why it happened:** the branch tracks `origin/main` directly rather than a remote of its own, so `git status` inside the worktree reports "ahead 3" against main and never complains about a missing upstream.
- **Decision needed from Vilija:** these are commissioned artwork. Push the branch and open a PR so the work is backed up, even if the design is not final. A held PR preserves it; a laptop does not. Also confirm the drawings are cleared under the image-rights gate (`docs/` image-rights policy, PR #84) before they can ship to the site.

### 2. `agent/add-ziburio-foundation-documents` — Žiburio Foundation governance drafts

- **Where:** `/Users/horse/Documents/Codex/2026-07-23/is-t/work/save-pr-worktree` (worktree is clean; the commit is the exposure)
- **One commit `bf18c5b`**, never pushed, no remote branch, no PR: `docs/ziburio-foundation/` — draft bylaws (255 lines, plus .docx and .pdf), a board invitation letter (117 lines, plus .docx and .pdf), and a README. **388 lines of new text.**
- **Verified against `main`:** `docs/ziburio-foundation/` does not exist on `main`. Nothing here is backed up.
- **Decision needed from Vilija:** these are foundation governance documents and it is not obvious they belong in the public advocacy site repo at all — the site is a static public surface, and its `docs/` directory ships alongside it. Two questions: (a) should they be preserved by pushing the branch and opening a held PR here, or (b) do they belong in `culturenet-brain` instead? Either way they need to leave this laptop. Answer (b) is likely correct, but the move is hers to make.

**Third-tier, minor:** `/Users/horse/dev/solp-elip-wt` has an uncommitted edit to `data/candidates/classification-audit-2026-07-26.md` on the merged `elip-sources-2026-07-27` branch. Small, but it is a real edit to an audit record — check whether it is worth keeping before that worktree is removed.

---

## Operating Rules

1. **This ledger is not a deletion authority.** Nothing in it authorizes deleting a branch, closing a PR, or removing a worktree. It records state; Vilija decides.
2. **Verify merge status by content, never by name.** This repo squash-merges. `git rev-list --count origin/main..<branch>` returning a non-zero number does **not** mean the branch has unique work — a squash-merged branch always looks "ahead." The real tests: is the branch tip identical to the head SHA of a merged PR (`gh pr list --json headRefName,headRefOid`), or is the branch an ancestor of `origin/main`? Only when both fail does a content diff matter, and even then most surviving lines are superseded older versions of text now on `main`.
3. **A branch with no PR is the dangerous category.** Every branch with a merged PR is backed up on GitHub by definition. A branch with no PR exists on one disk. Survey for those first.
4. **Commits require a linked worktree.** The `pre-commit` hook refuses commits from the primary checkout at `/Users/horse/dev/save-our-lithuanian-parishes`. Use `git worktree add`, and set `LietuvaAI` / `vilija@lietuva.ai` inside the new worktree before the first commit. (The hook also blocks commits to `main`, `.env*` files, macOS `* 2.md` duplicates, and non-canonical git identities.)
5. **Codex worktrees live outside the repo.** They sit under `/Users/horse/Documents/Codex/2026-07-23/`, not under `/Users/horse/dev/`. They will not show up in a casual look at the repo directory — only `git worktree list` finds them. Check it before assuming the repo state is what you see.
6. **Close-out.** Any session that pushes a branch updates this file: the work merged, or it is parked with a one-line reason and a next action, or it is explicitly held. A pushed branch with no PR is incomplete work.

How to read: **at risk** = exists on one disk only; **active** = live work in flight; **held** = do not delete without a preservation decision; **merged leftover** = fully represented on `main`, safe to delete whenever Vilija says so.

---

## Open Pull Requests

**None.** Every PR this repo has ever opened is closed or merged. The most recent, PR #124 (*Add sourced parish life timelines*), merged into `main` at `24d6fe9`.

This is not as reassuring as it sounds: the Codex research lane is running hot — twenty-one PRs (#104–#124) merged between 2026-07-27 and 2026-07-30 — and the work now in flight (the campaign line art) has not reached a PR at all. See **At Risk** above.

---

## Active Work In Flight

| Branch | Worktree | State | Next action |
|---|---|---|---|
| `codex/home-campaign-line-art-2026-07-30` | `Documents/Codex/…/solp-campaign-line-art` | **3 commits unpushed + 6 uncommitted files.** Not on GitHub. | Push, open a held PR. See At Risk §1. |
| `agent/add-ziburio-foundation-documents` | `Documents/Codex/…/is-t/work/save-pr-worktree` | **1 commit unpushed.** Not on GitHub. Worktree clean. | Decide the destination repo, then push or move. See At Risk §2. |

Nothing else in this repo is in flight. Every other branch is a leftover.

---

## Live Worktrees

Fourteen worktrees are attached to this repo. Nine sit under `/Users/horse/Documents/Codex/2026-07-23/` and are invisible from the repo directory.

| Worktree | Branch | Clean? |
|---|---|---|
| `/Users/horse/dev/save-our-lithuanian-parishes` (primary) | `fix-record-count-consistency-2026-07-28` | untracked `scripts/analyze-us-year-coverage.js` |
| `/Users/horse/dev/solp-ledger-wt` | `ledger-refresh-2026-07-30` | this ledger |
| `/Users/horse/dev/solp-adjudication-89-wt` | `record-identity-adjudication-2026-07-27` | clean |
| `/Users/horse/dev/solp-elip-wt` | `elip-sources-2026-07-27` | **modified** `data/candidates/classification-audit-2026-07-26.md` |
| `…/.claude/worktrees/quizzical-benz-a61efc` | detached at `345cd5b` | clean |
| `…/.claude/worktrees/upbeat-panini-181d64` | detached at `bce8a74` | clean |
| `Documents/Codex/…/is-t/work/save-pr-worktree` | `agent/add-ziburio-foundation-documents` | clean — but the **commit** is unpushed |
| `Documents/Codex/…/worktrees/solp-campaign-line-art` | `codex/home-campaign-line-art-2026-07-30` | **DIRTY — 3 modified, 6 untracked** |
| `Documents/Codex/…/worktrees/solp-elip-r2-integration` | `codex/elip-r2-integration-2026-07-28` | clean |
| `Documents/Codex/…/worktrees/solp-home-map-layout` | `codex/home-map-layout-2026-07-28` | clean |
| `Documents/Codex/…/worktrees/solp-parish-canon-tranche1` | `codex/parish-flow-building-lineage-2026-07-30` | clean |
| `Documents/Codex/…/worktrees/solp-profile-life-timeline` | `codex/profile-life-timeline-2026-07-30` | clean |
| `Documents/Codex/…/worktrees/solp-profile-story` | `codex/source-ledger-evidence-order-2026-07-28` | **two macOS duplicates**: `components/ProfileSourceLedger 2.tsx`, `lib/profile-sources 2.ts` |
| `Documents/Codex/…/worktrees/solp-record-consistency` | `codex/fix-record-count-consistency-2026-07-28` | clean |
| `Documents/Codex/…/worktrees/solp-research-method` | `codex/about-data-research-method-2026-07-28` | clean |

Two notes. The `solp-profile-story` duplicates are filesystem artifacts, not work — the `pre-commit` hook refuses to stage that pattern, and they can be deleted outright. And the sibling directory `Documents/Codex/…/worktrees/brain-parish-two-pass` belongs to `culturenet-brain`, not this repo; it is listed here only so a future survey does not mistake it for a stray parishes worktree.

---

## Remote Branches — All Merged Leftovers

Twenty-five topic branches sit on `origin` alongside `main`. **Every one of them was verified 2026-07-30 by matching the branch tip SHA against the head SHA of its pull request.** In all twenty-five cases the tip is identical to a PR that GitHub reports as MERGED. None carries unique work; all are safe to delete on Vilija's word.

| Branch | PR | Ahead / behind `main` | Verdict |
|---|---|---|---|
| `codex/profile-life-timeline-2026-07-30` | #124 | 1 / 1 | tip = PR head, merged |
| `codex/parish-flow-building-lineage-2026-07-30` | #123 | 1 / 2 | tip = PR head, merged |
| `codex/history-timeline-presentation-2026-07-30` | #122 | 1 / 3 | tip = PR head, merged |
| `codex/parish-flow-view-2026-07-30` | #121 | 1 / 4 | tip = PR head, merged |
| `codex/history-first-parish-first-2026-07-30` | #120 | 1 / 5 | tip = PR head, merged |
| `codex/remove-graphic-download-controls-2026-07-30` | #119 | 1 / 6 | tip = PR head, merged |
| `codex/home-architectural-procession-2026-07-30` | #118 | 1 / 7 | tip = PR head, merged |
| `codex/map-key-chevron-2026-07-29` | #117 | 1 / 8 | tip = PR head, merged |
| `codex/home-map-verification-status-2026-07-29` | #116 | 1 / 9 | tip = PR head, merged |
| `codex/about-opening-passage-2026-07-29` | #115 | 1 / 10 | tip = PR head, merged |
| `codex/torch-only-home-intro-2026-07-29` | #114 | 1 / 11 | tip = PR head, merged |
| `codex/shorten-home-intro-2026-07-29` | #113 | 1 / 12 | tip = PR head, merged |
| `codex/simplify-current-views-2026-07-29` | #112 | 1 / 13 | tip = PR head, merged |
| `codex/sielovada-network-2026-07-29` | #111 | 3 / 14 | tip = PR head, merged |
| `codex/unified-parish-profile-2026-07-28` | #110 | 2 / 16 | tip = PR head, merged |
| `codex/about-data-research-method-2026-07-28` | #109 | 2 / 17 | tip = PR head, merged |
| `codex/home-map-layout-2026-07-28` | #108 | 32 / 18 | tip = PR head, merged — the "ahead 32" is squash-merge arithmetic, not unique work |
| `codex/source-ledger-evidence-order-2026-07-28` | #107 | 1 / 19 | tip = PR head, merged |
| `codex/profile-story-source-ledger-2026-07-28` | #106 | 1 / 20 | tip = PR head, merged |
| `codex/fix-record-count-consistency-2026-07-28` | #105 | 1 / 21 | tip = PR head, merged |
| `codex/elip-registry-r2-2026-07-27` | #104 | 7 / 15 | tip = PR head, merged |
| `codex/solp-registry-revision1-site-2026-07-27` | #97 | 2 / 26 | tip = PR head, merged |
| `elip-sources-2026-07-27` | #100 | 1 / 26 | tip = PR head, merged |
| `record-identity-adjudication-2026-07-27` | #92 | 1 / 33 | tip = PR head, merged |
| `audit-canonical-gate-2026-07-27` | #87 | 1 / 36 | tip = PR head, merged |

**There is no remote branch without a pull request.** The dangerous branches in this repo are all local-only — see At Risk.

---

## Local-Only Branches — Adjudicated

Every local branch not covered above, with the evidence for its verdict.

### Fully merged, zero unique content — safe to delete

| Branch | Evidence |
|---|---|
| `claude/quizzical-benz-a61efc` | **Ancestor of `origin/main`** (`git merge-base --is-ancestor` succeeds). Zero commits not on main. Its subject references PR #81 (*Scanned-era Draugas links*), and #81 is merged. **Leftover, not unique work.** |
| `claude/upbeat-panini-181d64` | **Ancestor of `origin/main`.** Zero commits not on main. Subject references PR #83 (*Hartford dispatch wiring*), merged. **Leftover, not unique work.** Its `.claude/worktrees/upbeat-panini-181d64` checkout can go with it. |
| `codex/parish-canon-tranche1-site-2026-07-28` | **Ancestor of `origin/main`.** Reads "behind 15" because it tracks `origin/main` directly; that is the whole story. Its subject references PR #110, merged. |
| `fix-record-count-consistency-2026-07-28` | **Ancestor of `origin/main`.** A duplicate of the `codex/`-prefixed branch of the same name, with no upstream. This is the branch the primary checkout currently sits on. |
| `codex/elip-r2-integration-2026-07-28` | Reads **ahead 7, behind 15**, which looks like abandoned work. It is not: the tip `af44aed` is byte-identical to the head of PR #104, merged. Spot-checked at the blob level — `scripts/verify-canonical-identities.mjs` and `scripts/verify-canonical-release.mjs` have the **same object hash** on `main` as on the branch. Fully merged. |
| `waterbury-unverified-2026-07-26` | Upstream **gone**. Tip `df183a1` = head of PR #82, merged (squash commit on `main`). |
| `waterbury-lncc-verification-2026-07-26` | Upstream **gone**. Ancestor of `resolve-86`, which merged as PR #86 (squash commit `7f804d2` on `main`). |
| `resolve-86` | Upstream **gone**. Tip `345cd5b` = head of PR #86, merged. Reads "ahead 3" purely from the squash. |
| Every `codex/*` local branch with a remote | Tracks a remote branch listed in the table above; same verdict as its remote. |

**On the three Waterbury branches specifically.** A line-level diff against `main` shows seven lines of `docs/CLASSIFICATION.md` prose that are *not* on `main` — enough to look like unique work. They are not. Those lines are the 2026-07-26 open-question text ("Waterbury needs a name-level reconciliation…"), and `main` has since **answered the question**: Registry Revision 4 resolved Waterbury for public presentation, excluded the unnamed 1902 row from public counts, and moved it to `data/candidates/waterbury-1902-unresolved-lead.json`. The missing lines are a superseded older version of text that has been rewritten, exactly the pattern rule 2 warns about. Sixty-three of the seventy added lines match `main` verbatim.

### Behind `main` — housekeeping

| Branch | State | Action |
|---|---|---|
| `main` (local) | **behind `origin/main` by 21 commits** | `git -C /Users/horse/dev/save-our-lithuanian-parishes fetch && git checkout main && git pull`. Harmless, but any session that branches from local `main` without fetching starts 21 commits in the past. |

---

## Held for Decision

| Item | Why held | Decision Vilija needs to make |
|---|---|---|
| `codex/home-campaign-line-art-2026-07-30` | 16 line drawings that exist on one laptop. | Push and open a held PR to back the artwork up, regardless of whether the design is final. Then: are these drawings cleared under the image-rights gate? |
| `agent/add-ziburio-foundation-documents` | Foundation bylaws and a board invitation letter, on one laptop, in a public site repo. | Which repo owns these — here, or `culturenet-brain`? Then push or move. |
| `docs/ziburio-foundation/` placement | This repo is a public static site; its `docs/` ships alongside it. | Confirm that draft governance documents are meant to be publishable before any PR lands them here. |
| The 25 merged remote branches | Nothing is lost by keeping them; nothing is lost by deleting them. | A single bulk-delete approval would take the branch list from 26 to 1. Purely cosmetic — no urgency. |
| `solp-elip-wt` uncommitted audit edit | An unreviewed edit to a classification-audit record. | Keep it (commit on a fresh branch) or discard it, before that worktree is removed. |

---

## Convention Notes

- **Where this file lives.** `CLAUDE.md` names no ledger location and `docs/` holds no status document, so this ledger was placed at repo root as `WIP.md`, mirroring the sibling `~/dev/writing/WIP.md`. The `pre-commit` hook warns (does not refuse) on new root files outside its allowlist; if this file is kept, add `WIP\.md` to `ALLOWED_ROOT_PATTERN` in `tools/git-hooks/pre-commit` and re-run `tools/setup-hooks.sh`.
- **Branch naming.** `CLAUDE.md` specifies `<topic>-<YYYY-MM-DD>`. The `codex/` prefix used across the research lane, the `claude/` prefix on two session branches, and `agent/add-ziburio-foundation-documents` (no date at all) all depart from it. Not worth correcting retroactively; worth holding new work to.
- **The tracking gap that caused At Risk §1.** `codex/home-campaign-line-art-2026-07-30` and `codex/parish-canon-tranche1-site-2026-07-28` both track `origin/main` rather than a remote of their own. A branch in that configuration never reports "no upstream," so nothing signals that it has never been pushed. When creating a branch for new work, push it early — `git push -u origin <branch>` — even before the work is finished.
