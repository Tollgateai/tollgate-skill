# tollgate-skill

> AI coding tool instructions for integrating [Tollgate](https://www.tollgateai.dev) — real-time gross-margin observability for AI products.

Works with **Claude Code**, **Codex**, **Cursor**, **GitHub Copilot**, and **Windsurf**. One install, your AI coding assistant knows how to wire up Tollgate correctly.

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

### Quick install via npx

```bash
npx tollgate-skill --tool claude     # Claude Code  (~/.claude/skills/tollgate/)
npx tollgate-skill --tool codex      # Codex          (AGENTS.md)
npx tollgate-skill --tool cursor     # Cursor        (.cursor/rules/tollgate.mdc)
npx tollgate-skill --tool copilot    # GitHub Copilot (.github/copilot-instructions.md)
npx tollgate-skill --tool windsurf   # Windsurf      (.windsurf/rules/tollgate.md)
npx tollgate-skill --tool all        # All of the above
```

### Install via curl

### Claude Code

```bash
curl -fsSL https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main/install.sh | bash -s -- --tool claude
```

Installs to `~/.claude/skills/tollgate/SKILL.md`. Restart Claude Code, then type `/tollgate` to activate.

### Codex

```bash
curl -fsSL https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main/install.sh | bash -s -- --tool codex
```

Appends to (or creates) `AGENTS.md` in your project.

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

### All tools at once

```bash
curl -fsSL https://raw.githubusercontent.com/Tollgateai/tollgate-skill/main/install.sh | bash -s -- --tool all
```

---

## Manual install

| Tool | Copy this file to... |
|---|---|
| Claude Code | `~/.claude/skills/tollgate/SKILL.md` |
| Codex | `AGENTS.md` (project root) |
| Cursor | `.cursor/rules/tollgate.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Windsurf | `.windsurf/rules/tollgate.md` |

---

## What you'll need

- A Tollgate account — [sign up at tollgateai](https://www.tollgateai.dev)
- An API key from **Settings → API Keys** (prefix: `tg_live_…`)
- The Tollgate SDK: `npm install @tollgateai/sdk` or `pip install tollgateai`

---

## Repo structure

```
tollgate-skill/
  claude-code/
    SKILL.md          Claude Code skill (YAML frontmatter + full integration guide)
  codex/
    AGENTS.md         OpenAI Codex agent instructions
  cursor/
    tollgate.mdc      Cursor rule (.mdc format with glob config)
  copilot/
    copilot-instructions.md   GitHub Copilot workspace instructions
  windsurf/
    tollgate.md       Windsurf rule
  install.sh          One-liner installer for all tools
```

---

## Links

- [Tollgate Dashboard](https://www.tollgateai.dev/dashboard)
- [SDK — @tollgateai/sdk](https://www.npmjs.com/package/@tollgateai/sdk) · [source](https://github.com/Tollgateai/tollgate-sdk/tree/main/packages/tollgate-sdk-ts)
- [Python SDK — tollgateai](https://pypi.org/project/tollgateai/) · [source](https://github.com/Tollgateai/tollgate-sdk/tree/main/packages/tollgate-sdk-python)
- [Docs](https://www.tollgateai.dev/docs)