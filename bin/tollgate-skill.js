#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const toolFlagIndex = args.indexOf('--tool');
const tool = toolFlagIndex !== -1 ? args[toolFlagIndex + 1] : (args[0] || '');

const ROOT = path.join(__dirname, '..');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function appendOrCreate(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const content = fs.readFileSync(src, 'utf8');
  if (fs.existsSync(dest)) {
    fs.appendFileSync(dest, '\n' + content);
    return 'appended to';
  }
  fs.writeFileSync(dest, content);
  return 'created at';
}

function installClaude() {
  const dest = path.join(os.homedir(), '.claude', 'skills', 'tollgate', 'SKILL.md');
  copyFile(path.join(ROOT, 'claude-code', 'SKILL.md'), dest);
  console.log(`Claude Code: skill installed at ${dest}`);
  console.log('  Restart Claude Code, then use /tollgate to activate.');
}

function installCursor() {
  const dest = path.join(process.cwd(), '.cursor', 'rules', 'tollgate.mdc');
  copyFile(path.join(ROOT, 'cursor', 'tollgate.mdc'), dest);
  console.log(`Cursor: rule installed at ${dest}`);
}

function installCopilot() {
  const dest = path.join(process.cwd(), '.github', 'copilot-instructions.md');
  const action = appendOrCreate(path.join(ROOT, 'copilot', 'copilot-instructions.md'), dest);
  console.log(`Copilot: instructions ${action} ${dest}`);
}

function installWindsurf() {
  const dest = path.join(process.cwd(), '.windsurf', 'rules', 'tollgate.md');
  copyFile(path.join(ROOT, 'windsurf', 'tollgate.md'), dest);
  console.log(`Windsurf: rule installed at ${dest}`);
}

function installCodex() {
  const dest = path.join(process.cwd(), 'AGENTS.md');
  const action = appendOrCreate(path.join(ROOT, 'codex', 'AGENTS.md'), dest);
  console.log(`Codex: AGENTS.md ${action} ${dest}`);
}

function usage() {
  console.log('Tollgate skill installer\n');
  console.log('Usage:');
  console.log('  npx tollgate-skill --tool claude     # Claude Code  (~/.claude/skills/tollgate/)');
  console.log('  npx tollgate-skill --tool codex      # Codex          (AGENTS.md)');
  console.log('  npx tollgate-skill --tool cursor     # Cursor        (.cursor/rules/tollgate.mdc)');
  console.log('  npx tollgate-skill --tool copilot    # GitHub Copilot (.github/copilot-instructions.md)');
  console.log('  npx tollgate-skill --tool windsurf   # Windsurf      (.windsurf/rules/tollgate.md)');
  console.log('  npx tollgate-skill --tool all        # All of the above');
  console.log('  npx tollgate-skill --all             # All of the above (shortcut)');
}

switch (tool) {
  case 'claude':   installClaude(); break;
  case 'cursor':   installCursor(); break;
  case 'copilot':  installCopilot(); break;
  case 'windsurf': installWindsurf(); break;
  case 'codex':    installCodex(); break;
  case 'all':
  case '--all':
    installClaude();
    installCodex();
    installCursor();
    installCopilot();
    installWindsurf();
    break;
  default:
    usage();
    console.log('\nDefaulting to Claude Code:');
    installClaude();
}
