# Tollgate Integration Instructions

When asked to integrate Tollgate, track LLM costs per customer, or add gross-margin observability, follow these instructions.

## What Tollgate does

Tollgate wraps your LLM provider client and tracks every API call — tokens in, tokens out, reasoning tokens, latency — and attributes them to a customer and run. It joins cost (from provider rate cards) with revenue (from your plan config) to show real-time gross margin per customer in a dashboard.

## Required setup

Get an API key from the Tollgate dashboard (Settings → API Keys). Add it to the environment:

```
TOLLGATE_API_KEY=tg_live_your_key_here
```

Install:

```bash
npm install @tollgateai/sdk    # TypeScript
pip install tollgateai          # Python
```

## Wrap the provider client — TypeScript

**Anthropic:**
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { createTollgateClient, wrapAnthropic } from '@tollgateai/sdk';

const tollgate = createTollgateClient();
const anthropic = wrapAnthropic(new Anthropic(), tollgate, {
  customerId: 'cust_acme',  // your external customer id — required
  runId: 'ticket_8842',     // groups all LLM calls for one task
});
// Use anthropic normally — tracking is automatic.
```

**OpenAI:**
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

**Google Gemini:**
```typescript
import { GoogleGenAI } from '@google/genai';
import { createTollgateClient, wrapGemini } from '@tollgateai/sdk';
const gemini = wrapGemini(new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }), tollgate, { customerId: 'cust_acme', runId: 'ticket_8842' });
```

**AWS Bedrock:**
```typescript
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { createTollgateClient, wrapBedrock } from '@tollgateai/sdk';
const bedrock = wrapBedrock(new BedrockRuntimeClient({ region: 'us-east-1' }), tollgate, { customerId: 'cust_acme', runId: 'ticket_8842' });
```

## Wrap the provider client — Python

```python
from tollgate import create_tollgate_client, wrap_anthropic, wrap_openai

tollgate = create_tollgate_client()

# Anthropic
import anthropic
client = wrap_anthropic(anthropic.Anthropic(), tollgate, customer_id="cust_acme", run_id="ticket_8842")

# OpenAI
from openai import OpenAI
client = wrap_openai(OpenAI(), tollgate, customer_id="cust_acme", run_id="ticket_8842")
```

## OpenAI streaming — required flag

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  stream: true,
  stream_options: { include_usage: true }, // required — Tollgate won't see tokens without this
});
```

## Closing a multi-step run

After the final LLM call in a task, call resolve():

```typescript
await tollgate.resolve({
  runId: 'ticket_8842',
  customerId: 'cust_acme',
  outcome: 'resolved',     // 'resolved' | 'escalated' | 'failed'
  revenueUnitCents: 50,    // cents — $0.50 per resolved ticket
});
```

## Important rules

- `idempotencyKey` must be unique per event (pattern: `runId#step_N`). Duplicates are safely ignored.
- Never send prompt content. Fields like `messages`, `content`, `input`, `output` are rejected.
- `reasoningTokens` (thinking/extended-thinking) bills at output rate — always pass separately.
- `cachedTokens` bills at reduced rate — always pass separately.
- `outcome` goes only on the final event of a run.

## Direct API call (any language)

```
POST https://www.tollgateai.dev/api/track
Authorization: Bearer tg_live_…
Content-Type: application/json

{
  "customerId": "cust_acme",
  "runId": "ticket_8842",
  "provider": "anthropic",
  "model": "claude-opus-4-8",
  "tokensIn": 1200,
  "tokensOut": 340,
  "idempotencyKey": "ticket_8842#step_1"
}
```

Full reference: https://www.tollgateai.dev/docs
