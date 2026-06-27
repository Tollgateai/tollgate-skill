# tollgate-skill

> AI coding tool instructions for integrating [Tollgate](https://tollgate.ai) — real-time gross-margin observability for AI products.

Works with **Claude Code**, **Cursor**, **GitHub Copilot**, **Windsurf**, and **Codex**. One install, your AI coding assistant knows how to wire up Tollgate correctly.

---

## What this does

Once installed, your AI coding assistant can:
- Wrap any LLM provider client (Anthropic, OpenAI, Gemini, Bedrock, OpenRouter…) with Tollgate tracking in 2 lines
- Set `idempotencyKey`, `reasoningTokens`, `cachedTokens` correctly
- Handle multi-step agents and run outcomes
- Configure streaming correctly for each provider
- Keep prompt content out of the tracking payload

---

## Install

### Claude Code

```bash
curl -fsSL https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main/install.sh | bash -s -- --tool claude
```

Installs to `~/.claude/skills/tollgate/SKILL.md`. Restart Claude Code, then type `/tollgate` to activate.

### Cursor

```bash
curl -fsSL https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main/install.sh | bash -s -- --tool cursor
```

Installs to `.cursor/rules/tollgate.mdc` in your project. Cursor picks it up automatically when relevant.

### GitHub Copilot

```bash
curl -fsSL https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main/install.sh | bash -s -- --tool copilot
```

Appends to (or creates) `.github/copilot-instructions.md` in your project.

### Windsurf

```bash
curl -fsSL https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main/install.sh | bash -s -- --tool windsurf
```

Installs to `.windsurf/rules/tollgate.md` in your project.

### Codex

```bash
curl -fsSL https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main/install.sh | bash -s -- --tool codex
```

Appends to (or creates) `AGENTS.md` in your project.

### All tools at once

```bash
curl -fsSL https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main/install.sh | bash -s -- --tool all
```

---

## Manual install

| Tool | Copy this file to... |
|---|---|
| Claude Code | `~/.claude/skills/tollgate/SKILL.md` |
| Cursor | `.cursor/rules/tollgate.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Windsurf | `.windsurf/rules/tollgate.md` |
| Codex | `AGENTS.md` (project root) |

---

## What you'll need

- A Tollgate account — [sign up at tollgate.ai](https://tollgate.ai)
- An API key from **Settings → API Keys** (prefix: `tg_live_…`)
- The Tollgate SDK: `npm install @tollgateai/sdk` or `pip install tollgateai`

---

## Repo structure

```
tollgate-skill/
  claude-code/
    SKILL.md          Claude Code skill (YAML frontmatter + full integration guide)
  cursor/
    tollgate.mdc      Cursor rule (.mdc format with glob config)
  copilot/
    copilot-instructions.md   GitHub Copilot workspace instructions
  windsurf/
    tollgate.md       Windsurf rule
  codex/
    AGENTS.md         OpenAI Codex agent instructions
  install.sh          One-liner installer for all tools
```

---

## Links

- [Tollgate Dashboard](https://app.tollgate.ai)
- [SDK — @tollgateai/sdk](https://github.com/Tollgateai/sdk)
- [Docs](https://tollgate.ai/docs)
- [Main repo](https://github.com/Tollgateai/tollgate)
