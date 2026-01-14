#!/usr/bin/env bash
set -euo pipefail

: "${AGENT_CMD:?AGENT_CMD must be set}"

$AGENT_CMD \
  @scripts/ralph/prompt.md \
  @prd.md \
  @prd.json \
  @progress.txt \
  @agents.md
