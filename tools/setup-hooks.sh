#!/usr/bin/env bash
# Install local git hooks from tools/git-hooks/ into .git/hooks/
#
# Run once per machine after cloning the repo. Idempotent — safe to re-run.
# Hooks live committed in tools/git-hooks/ (so they're shared across machines)
# and get copied into .git/hooks/ (which git uses but doesn't track).
#
# Per docs/systems/agent-guardrails.md, this script is the local enforcement
# layer for Tier 4 rules. Branch protection on main is the platform layer;
# this is the belt + suspenders.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(git -C "$SCRIPT_DIR/.." rev-parse --show-toplevel 2>/dev/null)" || {
    echo "ERROR: tools/setup-hooks.sh is not inside a git repo" >&2
    exit 1
}
cd "$REPO_ROOT"

if [ ! -d "tools/git-hooks" ]; then
    echo "ERROR: tools/git-hooks/ directory not found at $REPO_ROOT" >&2
    exit 1
fi

COMMON_GIT_DIR="$(git rev-parse --git-common-dir)"
case "$COMMON_GIT_DIR" in
    /*) ;;
    *) COMMON_GIT_DIR="$REPO_ROOT/$COMMON_GIT_DIR" ;;
esac
HOOKS_DIR="$COMMON_GIT_DIR/hooks"

mkdir -p "$HOOKS_DIR"

INSTALLED=0
for hook_src in tools/git-hooks/*; do
    # Skip if it's not a file
    [ -f "$hook_src" ] || continue

    name=$(basename "$hook_src")
    dest="$HOOKS_DIR/$name"

    # Backup existing hook if present and not ours
    if [ -f "$dest" ] && ! grep -q "tools/setup-hooks.sh" "$dest" 2>/dev/null; then
        backup="$dest.backup-$(date +%Y%m%d%H%M%S)"
        cp "$dest" "$backup"
        echo "  ⓘ  Backed up existing $dest → $backup"
    fi

    cp "$hook_src" "$dest"
    chmod +x "$dest"
    echo "  ✓ Installed: $dest"
    INSTALLED=$((INSTALLED + 1))
done

echo

# ---- Verify + set canonical git identity for this checkout ----
# Per CLAUDE.md "Git Identity": this checkout must commit as the canonical
# LietuvaAI identity. The pre-commit hook now enforces this on every commit;
# this step sets it proactively so the first commit doesn't get rejected.
CANONICAL_NAME="LietuvaAI"
CANONICAL_EMAIL="vilija@lietuva.ai"
ACTUAL_NAME=$(git config user.name 2>/dev/null || echo "")
ACTUAL_EMAIL=$(git config user.email 2>/dev/null || echo "")
if [ "$ACTUAL_EMAIL" != "$CANONICAL_EMAIL" ] || [ "$ACTUAL_NAME" != "$CANONICAL_NAME" ]; then
    echo "  ⓘ  Git identity in this checkout was: ${ACTUAL_NAME:-(unset)} <${ACTUAL_EMAIL:-(unset)}>"
    git config --local user.name "$CANONICAL_NAME"
    git config --local user.email "$CANONICAL_EMAIL"
    echo "  ✓ Set canonical git identity: $CANONICAL_NAME <$CANONICAL_EMAIL>"
else
    echo "  ✓ Git identity already canonical: $CANONICAL_NAME <$CANONICAL_EMAIL>"
fi

echo
if [ "$INSTALLED" -gt 0 ]; then
    echo "$INSTALLED hook(s) installed. They run automatically before each commit."
    echo "Git hooks dir: $HOOKS_DIR"
    echo
    echo "What they enforce (per docs/systems/agent-guardrails.md):"
    echo "  - Refuse commits to main / master directly       (Tier 4)"
    echo "  - Refuse agent commits from the shared checkout  (worktree-only writes)"
    echo "  - Refuse .env or .env.* files                    (Tier 4)"
    echo "  - Refuse macOS duplicates ('file 2.md')          (housekeeping)"
    echo "  - Refuse commits under non-canonical git identity (Vercel deploy gate)"
    echo "  - Warn on new files at workspace root            (File Discipline)"
    echo
    echo "Bypass for emergencies (rare): git commit --no-verify"
else
    echo "No hooks found in tools/git-hooks/. Nothing to install."
fi
