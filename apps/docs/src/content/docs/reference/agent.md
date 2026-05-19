---
title: agent()
description: Reference for the agent factory.
---

```ts
import { agent } from '@polymatx/weave';
```

## Signature

```ts
agent(config: AgentConfig): Agent
```

### `AgentConfig`

| Field         | Type                              | Required | Default                    |
| ------------- | --------------------------------- | -------- | -------------------------- |
| `model`       | `LanguageModel` (Vercel AI SDK)   | yes      | —                          |
| `name`        | `string`                          | no       | `agent-<nanoid(6)>`        |
| `system`      | `string`                          | no       | —                          |
| `tools`       | `Record<string, Tool>`            | no       | `{}`                       |
| `maxSteps`    | `number`                          | no       | `5`                        |
| `temperature` | `number`                          | no       | provider default           |

### Returned `Agent`

- `run(input, options?)` → `Promise<AgentRunResult>`
- `stream(input, options?)` → `AgentStreamResult` ({ `textStream`, `finalResult` })
- `asNode(inputFrom, outputTo)` → graph node function
- `streamAsNode(inputFrom, outputTo)` → streaming graph node function

### `AgentRunResult`

```ts
{
  text: string;
  usage: { promptTokens, completionTokens, totalTokens };
  toolCalls: ToolCallRecord[];
  durationMs: number;
}
```
