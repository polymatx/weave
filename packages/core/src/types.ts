import type { LanguageModel, Tool } from 'ai';

export const END = '__END__' as const;
export type END = typeof END;

export interface AgentConfig {
  name?: string;
  model: LanguageModel;
  system?: string;
  tools?: Record<string, Tool>;
  maxSteps?: number;
  temperature?: number;
}

export interface AgentRunOptions {
  signal?: AbortSignal;
  onToken?: (token: string) => void;
}

export interface AgentRunResult {
  text: string;
  usage: TokenUsage;
  toolCalls: ToolCallRecord[];
  durationMs: number;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ToolCallRecord {
  toolName: string;
  args: unknown;
  result: unknown;
  durationMs: number;
}

export type NodeFn<S> = (state: S, ctx: NodeContext) => Promise<Partial<S>> | Partial<S>;

export interface NodeContext {
  runId: string;
  nodeName: string;
  signal?: AbortSignal;
  emit: (event: TraceEvent) => void;
}

export type EdgeTarget<S> = string | END | ((state: S) => string | END | Promise<string | END>);

export interface GraphRunOptions<S> {
  initialState: S;
  signal?: AbortSignal;
  runId?: string;
  budgetUsd?: number;
  onEvent?: (event: TraceEvent) => void;
  resumeFromCheckpoint?: boolean;
}

export interface GraphRunResult<S> {
  runId: string;
  state: S;
  steps: number;
  durationMs: number;
  events: TraceEvent[];
}

export interface AgentStreamResult {
  textStream: AsyncIterable<string>;
  finalResult: Promise<AgentRunResult>;
}

export type TraceEvent =
  | { type: 'run.start'; runId: string; t: number; initialState: unknown }
  | { type: 'token.delta'; runId: string; t: number; node: string; delta: string }
  | { type: 'run.end'; runId: string; t: number; finalState: unknown; durationMs: number }
  | { type: 'run.error'; runId: string; t: number; error: string }
  | { type: 'node.start'; runId: string; t: number; node: string; state: unknown }
  | {
      type: 'node.end';
      runId: string;
      t: number;
      node: string;
      patch: unknown;
      durationMs: number;
    }
  | {
      type: 'agent.call';
      runId: string;
      t: number;
      node: string;
      model: string;
      usage: TokenUsage;
      costUsd: number;
      durationMs: number;
    }
  | {
      type: 'tool.call';
      runId: string;
      t: number;
      node: string;
      tool: string;
      args: unknown;
      result: unknown;
      durationMs: number;
    };
