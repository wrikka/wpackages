import type { Context, Sampler, SamplingResult, SpanContext } from "../types/tracing";
import { SamplingDecision } from "../types/tracing";

/**
 * A sampler that samples a given fraction of traces based on the trace ID.
 */
export class TraceIdRatioBasedSampler implements Sampler {
  private readonly _ratio: number;
  private readonly _upperBound: number;

  constructor(ratio = 0) {
    this._ratio = ratio;
    this._upperBound = Math.floor(ratio * 0xffffffff);
  }

  shouldSample(_context: Context, traceId: string): SamplingResult {
    if (this._ratio <= 0) {
      return { decision: SamplingDecision.NOT_RECORD };
    }
    if (this._ratio >= 1) {
      return { decision: SamplingDecision.RECORD_AND_SAMPLE };
    }

    const traceIdNumber = parseInt(traceId.substring(0, 8), 16);
    if (traceIdNumber < this._upperBound) {
      return { decision: SamplingDecision.RECORD_AND_SAMPLE };
    }
    return { decision: SamplingDecision.NOT_RECORD };
  }
}

/**
 * A sampler that respects the parent span's sampling decision, otherwise delegates to a root sampler.
 */
export class ParentBasedSampler implements Sampler {
  private readonly _root: Sampler;

  constructor(root: Sampler) {
    this._root = root;
  }

  shouldSample(context: Context, traceId: string, spanName: string, parentContext?: SpanContext): SamplingResult {
    // This is a simplified check. A real implementation would check the trace flags.
    if (parentContext) {
      return { decision: SamplingDecision.RECORD_AND_SAMPLE };
    }
    return this._root.shouldSample(context, traceId, spanName, parentContext);
  }
}
