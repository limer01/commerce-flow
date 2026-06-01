#!/bin/bash
# This script gathers local repo context and sends it to the `claude` AI
# assistant. It is intended to be run from the repository root. In relation
# to the rest of the repo:
# - It reads any markdown files under `issues/` to include open/recorded
#   issues.
# - It extracts the last 5 git commits (hash, date, and message) to provide
#   recent change context.
# - It loads `ralph/prompt.md` which contains the instruction/prompt for the
#   assistant.
# - Finally it invokes `claude` with `--permission-mode acceptEdits` and a
#   combined payload. The assistant can then propose edits or suggestions
#   based on the repository state and the prompt.
#
# Typical use: feedback, automated suggestions, or patch proposals driven
# by the content of the repo and the human-authored prompt in
# ralph/prompt.md.

issues=$(cat issues/*.md 2>/dev/null || echo "No issues found")
commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")
prompt=$(cat ralph/prompt.md)

payload=$(cat <<EOF
Previous commits:
$commits

Issues:
$issues

$prompt
EOF
)

printf '%s\n' "$payload" | claude -p --permission-mode acceptEdits
