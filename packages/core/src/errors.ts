export class WeaveError extends Error {
  public override readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'WeaveError';
    this.cause = cause;
  }
}

export class NodeNotFoundError extends WeaveError {
  constructor(nodeName: string) {
    super(`Node "${nodeName}" not found in graph`);
    this.name = 'NodeNotFoundError';
  }
}

export class GraphCompileError extends WeaveError {
  constructor(message: string) {
    super(`Graph compile failed: ${message}`);
    this.name = 'GraphCompileError';
  }
}

export class BudgetExceededError extends WeaveError {
  constructor(spent: number, limit: number) {
    super(`Run budget exceeded: spent $${spent.toFixed(4)} > limit $${limit.toFixed(4)}`);
    this.name = 'BudgetExceededError';
  }
}
