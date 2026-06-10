#!/usr/bin/env bash
#
# run_tests.sh — Run all backend tests with coverage reporting.
#
# Usage:
#   ./tests/run_tests.sh          # runs all tests
#   ./tests/run_tests.sh -k auth  # runs only auth-related tests
#   ./tests/run_tests.sh -x       # stop on first failure
#
set -euo pipefail

cd "$(dirname "$0")/.."  # move to backend/ directory

# ── Colour helpers ─────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Colour

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Pontuara Backend — Test Suite${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# ── Check Python virtual environment ───────────────────────────────────────
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[!] No virtual environment found. Creating one...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# ── Ensure pytest is available ────────────────────────────────────────────
if ! command -v pytest &>/dev/null; then
    echo -e "${YELLOW}[!] pytest not found. Installing dependencies...${NC}"
    pip install -r requirements.txt
fi

# ── Run tests ─────────────────────────────────────────────────────────────
echo -e "${YELLOW}[*] Running all tests...${NC}"
echo ""

set +e  # allow pytest to fail so we can print the summary regardless
python -m pytest "$@" --cov=app --cov-report=term-missing --tb=short -v
EXIT_CODE=$?
set -e

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✔ All tests passed!${NC}"
else
    echo -e "${RED}✖ Some tests failed (exit code $EXIT_CODE)${NC}"
fi

exit $EXIT_CODE
