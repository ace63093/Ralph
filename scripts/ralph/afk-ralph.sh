#!/usr/bin/env bash
set -euo pipefail

: "${AGENT_CMD:?AGENT_CMD must be set}"

iterations=${1:-10}

for ((i=1; i<=iterations; i++)); do
  echo "Iteration $i"
  output=$($AGENT_CMD \
    @scripts/ralph/prompt.md \
    @prd.md \
    @prd.json \
    @progress.txt \
    @agents.md)

  echo "$output"
  if echo "$output" | rg -q "<promise>NCENTRAL_DASHBOARD_COMPLETE</promise>"; then
    echo "Completion promise detected. Stopping."
    exit 0
  fi

done
