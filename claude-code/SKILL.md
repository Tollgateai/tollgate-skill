---
name: tollgate
description: Integrate Tollgate to track LLM costs per customer and monitor gross margin in real time. Use when the user wants to add Tollgate to their AI product.
version: 1.0.0
---

# Tollgate Integration Skill

Tollgate is a **real-time gross-margin observability** layer for AI products. It joins LLM provider costs with your revenue config to show per-customer, per-agent, per-run margins — so you know which customers are profitable and which are not.

> "Stripe/Orb tells you what to charge. Tollgate tells you if you're making money."

## When to use this skill

Trigger on phrases like:
- "integrate Tollgate", "add Tollgate tracking", "set up cost tracking"
- "track LLM costs per customer", "monitor gross margin"
- "instrument my AI agent with Tollgate"

---

## What Tollgate tracks

Each call to `POST /api/track` records one **usage event** — a single LLM call, tool call, or retrieval step — attributed to a customer and run. Tollgate:

1. Writes the raw event to DynamoDB (idempotent, ~1 ms hot path)
2. Looks up the provider rate card to compute cost in cents
3. Looks up the customer's plan to compute recognized revenue
4. Rolls up `costCents`, `revenueCents`, `marginCents`, `marginPct` per customer/day/run

The dashboard shows live per-customer gross margin, margin-leak flags, and trend charts.

---

## Quick start (3 steps)

### Step 1 — Get an API key

Generate a key in **Settings → API Keys** (prefix: `tg_live_…`). Set it as an environment variable:

```bash
TOLLGATE_API_KEY=tg_live_your_key_here
```

### Step 2 — Install the SDK

```bash
# TypeScript / Node.js
npm install @tollgateai/sdk
# or: pnpm add @tollgateai/sdk  |  yarn add @tollgateai/sdk

# Python
pip install tollgateai
```

### Step 3 — Wrap your provider client

Pick the snippet for your provider. Tollgate intercepts the response, extracts token counts, and fires `POST /api/track` in the background.

---

## Provider integration examples

### Anthropic (TypeScript)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { createTollgateClient, wrapAnthropic } from '@tollgateai/sdk';

const tollgate = createTollgateClient(); // reads TOLLGATE_API_KEY
const anthropic = wrapAnthropic(new Anthropic(), tollgate, {
  customerId: 'cust_acme',       // your external customer id — required
  runId: 'ticket_8842',          // your run/session id — recommended
  agentId: 'support-agent',      // optional: which agent within the run
});

// Use anthropic exactly as before — no changes needed below this line.
const msg = await anthropic.messages.create({
  model: 'claude-opus-4-8',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }],
});
```

### OpenAI (TypeScript)

```typescript
import OpenAI from 'openai';
import { createTollgateClient, wrapOpenAI } from '@tollgateai/sdk';

const tollgate = createTollgateClient();
const openai = wrapOpenAI(new OpenAI(), tollgate, {
  customerId: 'cust_acme',
  runId: 'ticket_8842',
});
```

### OpenAI-compatible gateways (Groq, OpenRouter, Vercel AI Gateway, vLLM, Together, Fireworks)

```typescript
import OpenAI from 'openai';
import { createTollgateClient, wrapOpenAI } from '@tollgateai/sdk';

const tollgate = createTollgateClient();
const groq = wrapOpenAI(
  new OpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY }),
  tollgate,
  { customerId: 'cust_acme', runId: 'ticket_8842', provider: 'openai_compatible' },
);
```

### Google Gemini (TypeScript)

```typescript
import { GoogleGenAI } from '@google/genai';
import { createTollgateClient, wrapGemini } from '@tollgateai/sdk';

const tollgate = createTollgateClient();
const gemini = wrapGemini(new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }), tollgate, {
  customerId: 'cust_acme',
  runId: 'ticket_8842',
});
```

### AWS Bedrock (TypeScript)

```typescript
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { createTollgateClient, wrapBedrock } from '@tollgateai/sdk';

const tollgate = createTollgateClient();
const bedrock = wrapBedrock(new BedrockRuntimeClient({ region: 'us-east-1' }), tollgate, {
  customerId: 'cust_acme',
  runId: 'ticket_8842',
});
```

### Anthropic (Python)

```python
import anthropic
from tollgate import create_tollgate_client, wrap_anthropic

tollgate = create_tollgate_client()  # reads TOLLGATE_API_KEY
client = wrap_anthropic(
    anthropic.Anthropic(), tollgate,
    customer_id="cust_acme",
    run_id="ticket_8842",
)
```

### OpenAI (Python)

```python
from openai import OpenAI
from tollgate import create_tollgate_client, wrap_openai

tollgate = create_tollgate_client()
client = wrap_openai(OpenAI(), tollgate, customer_id="cust_acme", run_id="ticket_8842")
```

---

## Streaming

The wrapper handles streaming automatically. **OpenAI / OpenAI-compatible only:** add `stream_options: { include_usage: true }` or token counts won't be captured.

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }],
  stream: true,
  stream_options: { include_usage: true }, // required for Tollgate
});
```

---

## Multi-step agents — closing a run

A **run** (`runId`) groups all LLM calls for one end-to-end task. Set `outcome` on the final step to close the run and gate outcome-priced revenue.

```typescript
await tollgate.resolve({
  runId: 'ticket_8842',
  customerId: 'cust_acme',
  outcome: 'resolved',       // 'resolved' | 'escalated' | 'failed'
  revenueUnitCents: 50,      // $0.50 per resolved ticket
});
```

- `resolved` — task done; outcome-priced revenue is recognized.
- `escalated` / `failed` — no activity revenue recognized, but all costs are tracked. Makes unprofitable runs visible.
- Omitting `outcome` on a single-call run treats it as `resolved`.

---

## Manual tracking (no wrapper)

```typescript
await tollgate.track({
  customerId: 'cust_acme',
  runId: 'ticket_8842',
  provider: 'anthropic',   // 'anthropic' | 'openai' | 'openai_compatible' | 'bedrock' | 'google'
  model: 'claude-opus-4-8',
  tokensIn: response.usage.input_tokens,
  tokensOut: response.usage.output_tokens,
  reasoningTokens: response.usage.cache_creation_input_tokens ?? 0,
  cachedTokens: response.usage.cache_read_input_tokens ?? 0,
  idempotencyKey: `${runId}#step_1`,  // stable, unique per event
  latencyMs: Date.now() - startTime,
});
```

### REST

```bash
curl -X POST https://app.tollgate.ai/api/track \
  -H "Authorization: Bearer tg_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_acme",
    "runId": "ticket_8842",
    "provider": "anthropic",
    "model": "claude-opus-4-8",
    "tokensIn": 1200,
    "tokensOut": 340,
    "idempotencyKey": "ticket_8842#step_1"
  }'
```

Response: `{ "status": "created", "eventId": "..." }` or `{ "status": "duplicate" }` (safe to ignore).

---

## Full field reference

| Field | Type | Required | Description |
|---|---|---|---|
| `customerId` | string | ✅ | Your external customer id. |
| `runId` | string | ✅ | Groups all LLM calls for one task/session. |
| `provider` | string | ✅ | `anthropic` `openai` `openai_compatible` `bedrock` `google` |
| `model` | string | ✅ | Model name as returned by provider. |
| `idempotencyKey` | string | ✅ | Unique per event — prevents double-counting on retries. Pattern: `runId#step_N`. |
| `agentId` | string | — | Which agent within the run. |
| `type` | string | — | `llm` (default) `tool` `retrieval` |
| `tokensIn` | int | — | Standard (non-cached) input tokens. |
| `tokensOut` | int | — | Output tokens. |
| `reasoningTokens` | int | — | Thinking/reasoning tokens — billed at output rate. |
| `cachedTokens` | int | — | Cache-read input tokens — billed at reduced rate. |
| `cacheWrite5mTokens` | int | — | Cache-write tokens, 5-min TTL. |
| `cacheWrite1hTokens` | int | — | Cache-write tokens, 1-hour TTL. |
| `toolCalls` | int | — | Number of tool calls. |
| `toolName` | string | — | Tool name for per-tool breakdown. |
| `audioTokensIn` | int | — | Audio input tokens (OpenAI Realtime). |
| `audioTokensOut` | int | — | Audio output tokens. |
| `imageTokensIn` | int | — | Image/vision input tokens. |
| `imageTokensOut` | int | — | Image generation output tokens. |
| `videoTokensIn` | int | — | Video input tokens (Gemini). |
| `webSearchRequests` | int | — | Web search calls (Anthropic/Gemini grounding). |
| `latencyMs` | int | — | Request latency in milliseconds. |
| `externalCostCents` | float | — | Cost of external tools used (image gen APIs, sandboxes). Added directly to cost. |
| `providerCostCents` | float | — | Exact cost from provider/gateway — skips rate-card lookup. |
| `outcome` | string | — | `resolved` `escalated` `failed` — set only on the closing event. |
| `revenueUnitCents` | int | — | Per-run revenue in cents. Overrides plan default. |
| `ts` | ISO string | — | Event timestamp. Defaults to server receive time. |

> **Privacy:** Never send prompt content. Fields like `prompt`, `messages`, `content`, `input`, `output` are rejected with HTTP 400.

---

## Error codes

| Status | Meaning |
|---|---|
| 201 created | Event ingested. |
| 200 duplicate | Same `idempotencyKey` already stored — ignore. |
| 400 | Validation error or prompt content detected. |
| 401 | Invalid or missing API key. |
| 402 | Monthly event quota reached. |
| 429 | Rate limit exceeded — check `Retry-After` header. |
| 500 | Internal error — event may not have been stored. |

---

## Integration checklist

- [ ] `TOLLGATE_API_KEY` set in environment (never commit it)
- [ ] Provider client wrapped (or `tollgate.track()` called after each LLM call)
- [ ] `customerId` matches real customer ids in your system
- [ ] `runId` consistently identifies one end-to-end task
- [ ] `idempotencyKey` is stable and unique per event
- [ ] `reasoningTokens` included for extended thinking models (Claude 3.7+, o1, o3)
- [ ] `cachedTokens` included if using prompt caching
- [ ] `outcome` set on the closing event for per_unit / hybrid plans
- [ ] No prompt content in any field

---

## Implementation approach

When helping a user integrate Tollgate:

1. Ask which provider(s) they use (Anthropic / OpenAI / Gemini / Bedrock / gateway).
2. Ask which language (TypeScript / Python / other).
3. Find where they create the provider client — show the 2-line wrap.
4. If they have multi-step agents, identify the final step and add `resolve()`.
5. If they use OpenAI streaming, add `stream_options: { include_usage: true }`.
6. Confirm `customerId` maps to real customer ids in their system.
7. Remind them to add `TOLLGATE_API_KEY` to `.env` and `.gitignore`.

The wrapper never modifies the response the user's code sees, never blocks on Tollgate errors, and always passes through to the original provider.
