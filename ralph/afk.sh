#!/bin/bash
set -eo pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

# Name of the pre-created sandbox to exec into (see ralph/sandbox-bootstrap.sh).
SANDBOX="${RALPH_SANDBOX:-ralph}"

# The repo is bind-mounted into the sandbox at the SAME path Git Bash reports
# for the host cwd (e.g. /c/Users/.../commerce-flow), so we can reuse it
# directly as the working directory inside the container.
REPO="$(pwd)"

# jq filter to extract streaming text from assistant messages
stream_text='select(.type == "assistant").message.content[]? | select(.type == "text").text // empty | gsub("\n"; "\r\n") | . + "\r\n\n"'

# jq filter to extract final result
final_result='select(.type == "result").result // empty'

# Context file written into the repo each iteration. Passing the ~47KB payload
# as a CLI argument blows past the Windows docker.exe argv limit ("Argument
# list too long"), so we hand the agent a tiny prompt that points at this file.
ctx="ralph/.afk-context.md"

cleanup() { rm -f "$tmpfile" "$ctx"; }
trap cleanup EXIT

for ((i=1; i<=$1; i++)); do
  tmpfile=$(mktemp)

  commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")
  issues=$(cat issues/*.md 2>/dev/null || echo "No issues found")
  prompt=$(cat ralph/prompt.md)

  {
    echo "Previous commits:"
    echo "$commits"
    echo
    echo "Issues:"
    echo "$issues"
    echo
    echo "$prompt"
  } > "$ctx"

  # exec (not run): `docker sandbox run` only renders agent output to a TTY, so
  # when stdout is a pipe we capture nothing. exec pipes stdout like docker exec.
  # --dangerously-skip-permissions is appropriate here because the sandbox IS
  # the isolation boundary; it lets the agent run its own feedback loops
  # (npm test / typecheck) and commit, which the gated default mode cannot.
  MSYS_NO_PATHCONV=1 docker sandbox exec "$SANDBOX" bash -lc \
    "cd '$REPO' && claude -p 'Read $ctx in full and follow its instructions exactly.' --dangerously-skip-permissions --verbose --output-format stream-json" \
  | grep --line-buffered '^{' \
  | tee "$tmpfile" \
  | jq --unbuffered -rj "$stream_text"

  result=$(jq -r "$final_result" "$tmpfile")

  if [[ "$result" == *"<promise>NO MORE TASKS</promise>"* ]]; then
    echo "Ralph complete after $i iterations."
    exit 0
  fi
done
