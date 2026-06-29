#!/usr/bin/env bash
# Tollgate skill installer
# Usage: curl -fsSL https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main/install.sh | sh
# Or: bash install.sh [--tool claude|cursor|copilot|windsurf|codex|all]

set -e

REPO_URL="https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main"
TOOL="${1:-}"

# Parse --tool flag
if [ "$1" = "--tool" ]; then
  TOOL="$2"
fi

install_claude_code() {
  SKILL_DIR="${HOME}/.claude/skills/tollgate"
  mkdir -p "$SKILL_DIR"
  curl -fsSL "${REPO_URL}/claude-code/SKILL.md" -o "${SKILL_DIR}/SKILL.md"
  echo "Claude Code: skill installed at ${SKILL_DIR}/SKILL.md"
  echo "  Restart Claude Code, then use /tollgate to activate the skill."
}

install_cursor() {
  mkdir -p ".cursor/rules"
  curl -fsSL "${REPO_URL}/cursor/tollgate.mdc" -o ".cursor/rules/tollgate.mdc"
  echo "Cursor: rule installed at .cursor/rules/tollgate.mdc"
}

install_copilot() {
  mkdir -p ".github"
  if [ -f ".github/copilot-instructions.md" ]; then
    echo "" >> ".github/copilot-instructions.md"
    curl -fsSL "${REPO_URL}/copilot/copilot-instructions.md" >> ".github/copilot-instructions.md"
    echo "Copilot: appended to .github/copilot-instructions.md"
  else
    curl -fsSL "${REPO_URL}/copilot/copilot-instructions.md" -o ".github/copilot-instructions.md"
    echo "Copilot: instructions created at .github/copilot-instructions.md"
  fi
}

install_windsurf() {
  mkdir -p ".windsurf/rules"
  curl -fsSL "${REPO_URL}/windsurf/tollgate.md" -o ".windsurf/rules/tollgate.md"
  echo "Windsurf: rule installed at .windsurf/rules/tollgate.md"
}

install_codex() {
  if [ -f "AGENTS.md" ]; then
    echo "" >> "AGENTS.md"
    curl -fsSL "${REPO_URL}/codex/AGENTS.md" >> "AGENTS.md"
    echo "Codex: appended to AGENTS.md"
  else
    curl -fsSL "${REPO_URL}/codex/AGENTS.md" -o "AGENTS.md"
    echo "Codex: AGENTS.md created"
  fi
}

case "$TOOL" in
  claude)   install_claude_code ;;
  cursor)   install_cursor ;;
  copilot)  install_copilot ;;
  windsurf) install_windsurf ;;
  codex)    install_codex ;;
  all)
    install_claude_code
    install_codex
    install_cursor
    install_copilot
    install_windsurf
    ;;
  *)
    echo "Tollgate skill installer"
    echo ""
    echo "Usage:"
    echo "  bash install.sh --tool claude     # Claude Code (~/.claude/skills/tollgate/)"
    echo "  bash install.sh --tool codex      # Codex (AGENTS.md)"
    echo "  bash install.sh --tool cursor     # Cursor (.cursor/rules/tollgate.mdc)"
    echo "  bash install.sh --tool copilot    # GitHub Copilot (.github/copilot-instructions.md)"
    echo "  bash install.sh --tool windsurf   # Windsurf (.windsurf/rules/tollgate.md)"
    echo "  bash install.sh --tool all        # All of the above"
    echo ""
    echo "Or install for Claude Code (most common):"
    install_claude_code
    ;;
esac
