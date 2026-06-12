#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-4173}"
printf "Starting Link Hub on http://localhost:%s\n" "$PORT"
python3 -m http.server "$PORT"
