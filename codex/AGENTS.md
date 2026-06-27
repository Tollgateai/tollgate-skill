# Tollgate Integration

When asked to integrate Tollgate, add LLM cost tracking, or set up gross-margin observability, follow these instructions.

Tollgate tracks LLM provider costs per customer in real time and joins them with revenue config to show gross margin per customer, agent, and run.

## Setup

Set the API key (get it from Settings → API Keys on the Tollgate dashboard):

```
TOLLGATE_API_KEY=tg_live_your_key_here
```

Install the SDK:

```bash
npm install @tollgateai/sdk     # TypeScript / Node.js
pip install tollgateai           # Python
```

## Wrap the provider client

Find where the user creates their provider client. Replace the client with a wrapped version. The wrapper is transparent — it never changes the response shape or blocks on errors.

**Anthropic (TypeScript):**
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { createTollgateClient, wrapAnthropic } from '@tollgateai/sdk';

const tollgate = createTollgateClient();
const anthropic = wrapAnthropic(new Anthropic(), tollgate, {
  customerId: 'cust_acme',
  runId: 'ticket_8842',
});
```

**OpenAI (TypeScript):**
```typescript
import OpenAI from 'openai';
import { createTollgateClient, wrapOpenAI } from '@tollgateai/sdk';

const tollgate = createTollgateClient();
const openai = wrapOpenAI(new OpenAI(), tollgate, { customerId: 'cust_acme', runId: 'ticket_8842' });
```

**OpenAI-compatible (Groq, OpenRouter, vLLM, Together, Fireworks):**
```typescript
const client = wrapOpenAI(
  new OpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY }),
  tollgate,
  { customerId: 'cust_acme', runId: 'ticket_8842', provider: 'openai_compatible' },
);
```

**Google Gemini (TypeScript):**
```typescript
import { GoogleGenAI } from '@google/genai';
import { createTollgateClient, wrapGemini } from '@tollgateai/sdk';
const gemini = wrapGemini(new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }), tollgate, { customerId: 'cust_acme', runId: 'ticket_8842' });
```

**AWS Bedrock (TypeScript):**
```typescript
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { createTollgateClient, wrapBedrock } from '@tollgateai/sdk';
const bedrock = wrapBedrock(new BedrockRuntimeClient({ region: 'us-east-1' }), tollgate, { customerId: 'cust_acme', runId: 'ticket_8842' });
```

**Anthropic (Python):**
```python
import anthropic
from tollgate import create_tollgate_client, wrap_anthropic

tollgate = create_tollgate_client()
client = wrap_anthropic(anthropic.Anthropic(), tollgate, customer_id="cust_acme", run_id="ticket_8842")
```

**OpenAI (Python):**
```python
from openai import OpenAI
from tollgate import create_tollgate_client, wrap_openai

tollgate = create_tollgate_client()
client = wrap_openai(OpenAI(), tollgate, customer_id="cust_acme", run_id="ticket_8842")
```

## Streaming (OpenAI and OpenAI-compatible only)

Add `stream_options: { include_usage: true }` — otherwise Tollgate cannot see token counts during streaming.

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  stream: true,
  stream_options: { include_usage: true },
});
```

## Closing a multi-step run

When a run has multiple LLM calls, call `resolve()` after the final step:

```typescript
await tollgate.resolve({
  runId: 'ticket_8842',
  customerId: 'cust_acme',
  outcome: 'resolved',       // 'resolved' | 'escalated' | 'failed'
  revenueUnitCents: 50,      // $0.50 per resolved ticket
});
```

Use `escalated` or `failed` when the task did not complete successfully. Tollgate still tracks the cost but suppresses activity revenue, making the margin drag visible.

## Manual tracking (no wrapper available)

```typescript
await tollgate.track({
  customerId: 'cust_acme',
  runId: 'ticket_8842',
  provider: 'anthropic',
  model: 'claude-opus-4-8',
  tokensIn: 1200,
  tokensOut: 340,
  reasoningTokens: 0,
  cachedTokens: 0,
  idempotencyKey: `ticket_8842#step_1`,
  latencyMs: 820,
});
```

## Rules to follow

- `idempotencyKey` must be stable and unique per event. Use `runId#step_N`. Duplicates are safely dropped.
- Never include prompt content in any field. Fields like `messages`, `content`, `input`, `output` are rejected with HTTP 400.
- Pass `reasoningTokens` separately — they bill at the output token rate.
- Pass `cachedTokens` separately — they bill at a reduced rate.
- Set `outcome` only on the closing event of a run.

## Error codes

- 201: event stored
- 200 duplicate: already stored, ignore
- 400: validation error or prompt content detected
- 401: bad API key
- 402: quota reached
- 429: rate limited — check Retry-After header

Full docs: https://tollgate.ai/docs
