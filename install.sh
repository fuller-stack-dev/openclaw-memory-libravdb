#!/usr/bin/env bash
set -euo pipefail

PLUGIN_SPEC="@xdarkicex/openclaw-memory-libravdb"
FORMULA_SPEC="xDarkicex/openclaw-libravdb-memory/libravdbd"
FORMULA_NAME="libravdbd"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { printf "${CYAN}[install]${NC} %s\n" "$*"; }
ok()    { printf "${GREEN}[install]${NC} %s\n" "$*"; }
warn()  { printf "${YELLOW}[install]${NC} %s\n" "$*" >&2; }
die()   { printf "${RED}[install]${NC} %s\n" "$*" >&2; exit 1; }

require_command() {
  local cmd="$1"
  local help="$2"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    die "$cmd is required. $help"
  fi
}

require_command brew "Install Homebrew first: https://brew.sh"
require_command openclaw "Install the OpenClaw CLI first."

info "Installing ${FORMULA_NAME} from Homebrew..."
brew install "${FORMULA_SPEC}"

info "Starting the ${FORMULA_NAME} service..."
brew services start "${FORMULA_NAME}"

info "Installing the OpenClaw plugin and selecting its slots..."
openclaw plugins install "${PLUGIN_SPEC}"

if openclaw health >/dev/null 2>&1; then
  info "Restarting the OpenClaw gateway so the plugin loads immediately..."
  openclaw gateway restart
else
  warn "OpenClaw gateway is not currently running; skipping automatic restart."
fi

info "Verifying memory status..."
if openclaw memory status; then
  ok "LibraVDB Memory is installed and ready."
else
  warn "Verification did not pass yet."
  warn "If the gateway was not running, start or restart it, then rerun: openclaw memory status"
fi
