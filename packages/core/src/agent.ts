import { generateText, type LanguageModel, type Tool } from 'ai';
import { nanoid } from 'nanoid';
import { estimateCostUsd } from './cost.js';
import type {
  AgentConfig,
  AgentRunOptions,
  AgentRunResult,
  NodeContext,
  ToolCallRecord,
} from './types.js';

export interface Agent {
  readonly name: string;
  readonly model: LanguageModel;
  run(input: string, options?: AgentRunOptions): Promise<AgentRunResult>;
  asNode<S extends object>(
    inputFrom: (state: S) => string,
    outputTo: (result: AgentRunResult, state: S) => Partial<S>,
  ): (state: S, ctx: NodeContext) => Promise<Partial<S>>;
}

export function agent(config: AgentConfig): Agent {
  const name = config.name ?? `agent-${nanoid(6)}`;
  const tools: Record<string, Tool> = config.tools ?? {};

  async function run(input: string, options: AgentRunOptions = {}): Promise<AgentRunResult> {
    const start = Date.now();
    const toolCalls: ToolCallRecord[] = [];

    const result = await generateText({
      model: config.model,
      ...(config.system !== undefined && { system: config.system }),
      prompt: input,
      ...(Object.keys(tools).length > 0 && { tools }),
      maxSteps: config.maxSteps ?? 5,
      ...(config.temperature !== undefined && { temperature: config.temperature }),
      ...(options.signal !== undefined && { abortSignal: options.signal }),
      onStepFinish: (step) => {
        const stepCalls = (step.toolCalls ?? []) as Array<{
          toolCallId: string;
          toolName: string;
          args: unknown;
        }>;
        const stepResults = (step.toolResults ?? []) as Array<{
          toolCallId: string;
          result: unknown;
        }>;
        for (const call of stepCalls) {
          const tr = stepResults.find((r) => r.toolCallId === call.toolCallId);
          toolCalls.push({
            toolName: call.toolName,
            args: call.args,
            result: tr?.result,
            durationMs: 0,
          });
        }
      },
    });

    const usage = {
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
    };

    return {
      text: result.text,
      usage,
      toolCalls,
      durationMs: Date.now() - start,
    };
  }

  function asNode<S extends object>(
    inputFrom: (state: S) => string,
    outputTo: (result: AgentRunResult, state: S) => Partial<S>,
  ) {
    return async (state: S, ctx: NodeContext): Promise<Partial<S>> => {
      const input = inputFrom(state);
      const result = await run(input, ctx.signal ? { signal: ctx.signal } : {});

      ctx.emit({
        type: 'agent.call',
        runId: ctx.runId,
        t: Date.now(),
        node: ctx.nodeName,
        model: modelId(config.model),
        usage: result.usage,
        costUsd: estimateCostUsd(modelId(config.model), result.usage),
        durationMs: result.durationMs,
      });

      for (const tc of result.toolCalls) {
        ctx.emit({
          type: 'tool.call',
          runId: ctx.runId,
          t: Date.now(),
          node: ctx.nodeName,
          tool: tc.toolName,
          args: tc.args,
          result: tc.result,
          durationMs: tc.durationMs,
        });
      }

      return outputTo(result, state);
    };
  }

  return { name, model: config.model, run, asNode };
}

function modelId(model: LanguageModel): string {
  if (typeof model === 'string') return model;
  return (model as { modelId?: string }).modelId ?? 'unknown';
}
