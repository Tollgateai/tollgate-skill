# Tollgate Integration

When the user asks to integrate Tollgate, add LLM cost tracking, or set up gross-margin observability, follow these instructions.

Tollgate wraps your LLM provider client and tracks every API call — attributing cost to a customer and run, then joining it with revenue to show real-time gross margin per customer.

## Setup

Add to environment:
```
TOLLGATE_API_KEY=tg_live_your_key_here
```

Install:
```bash
npm install @tollgateai/sdk    # TypeScript
pip install tollgateai          # Python
```

## Wrap the provider (TypeScript)

Anthropic:
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { createTollgateClient, wrapAnthropic } from '@tollgateai/sdk';

const tollgate = createTollgateClient();
const anthropic = wrapAnthropic(new Anthropic(), tollgate, {
  customerId: 'cust_acme',
  runId: 'ticket_8842',
});
```

OpenAI:
```typescript
import OpenAI from 'openai';
import { createTollgateClient, wrapOpenAI } from '@tollgateai/sdk';

const tollgate = createTollgateClient();
const openai = wrapOpenAI(new OpenAI(), tollgate, { customerId: 'cust_acme', runId: 'ticket_8842' });
```

OpenAI-compatible (Groq, OpenRouter, vLLM, Together):
```typescript
const client = wrapOpenAI(
  new OpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY }),
  tollgate,
  { customerId: 'cust_acme', runId: 'ticket_8842', provider: 'openai_compatible' },
);
```

Google Gemini:
```typescript
import { GoogleGenAI } from '@google/genai';
import { createTollgateClient, wrapGemini } from '@tollgateai/sdk';
const gemini = wrapGemini(new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }), tollgate, { customerId: 'cust_acme', runId: 'ticket_8842' });
```

AWS Bedrock:
```typescript
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { createTollgateClient, wrapBedrock } from '@tollgateai/sdk';
const bedrock = wrapBedrock(new BedrockRuntimeClient({ region: 'us-east-1' }), tollgate, { customerId: 'cust_acme', runId: 'ticket_8842' });
```

## Wrap the provider (Python)

```python
from tollgate import create_tollgate_client, wrap_anthropic, wrap_openai

tollgate = create_tollgate_client()

import anthropic
client = wrap_anthropic(anthropic.Anthropic(), tollgate, customer_id="cust_acme", run_id="ticket_8842")

from openai import OpenAI
client = wrap_openai(OpenAI(), tollgate, customer_id="cust_acme", run_id="ticket_8842")
```

## OpenAI streaming

Add stream_options or token counts won't be captured:
```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  stream: true,
  stream_options: { include_usage: true },
});
```

## Close a multi-step run

```typescript
await tollgate.resolve({
  runId: 'ticket_8842',
  customerId: 'cust_acme',
  outcome: 'resolved',     // 'resolved' | 'escalated' | 'failed'
  revenueUnitCents: 50,
});
```

## Rules

- idempotencyKey must be unique per event — use runId#step_N pattern
- Never send prompt content (messages, content, input, output fields are rejected)
- reasoningTokens bills at output rate — pass separately
- cachedTokens bills at reduced rate — pass separately
- outcome only on the closing event of a run

## Direct REST API

```
POST https://app.tollgate.ai/api/track
Authorization: Bearer tg_live_…
Content-Type: application/json

{ "customerId": "cust_acme", "runId": "ticket_8842", "provider": "anthropic",
  "model": "claude-opus-4-8", "tokensIn": 1200, "tokensOut": 340,
  "idempotencyKey": "ticket_8842#step_1" }
```

Full docs: https://www.tollgateai.dev/docs
