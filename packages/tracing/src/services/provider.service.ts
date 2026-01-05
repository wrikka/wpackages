import type { Instrumentation, Sampler, SpanProcessor, Tracer, TracerProviderConfig } from "../types/tracing";
import type { Resource } from "../models/resource";
import { ParentBasedSampler, TraceIdRatioBasedSampler } from "./sampler.service";
import { TracerImpl } from "./tracer.service";

export interface TracerProviderConfig {
	processor: SpanProcessor;
	instrumentations?: Instrumentation[];
}

export class TracerProvider {
	private readonly _resource: Resource;
	private readonly _processor: SpanProcessor;
	private readonly _instrumentations: Instrumentation[];
	private readonly _tracer: Tracer;
	private readonly _sampler: Sampler;

	constructor(config: TracerProviderConfig) {
		this._processor = config.processor;
		this._instrumentations = config.instrumentations ?? [];
		this._resource = config.resource ?? new Resource({});
		this._sampler = config.sampler ?? new ParentBasedSampler(new TraceIdRatioBasedSampler(1.0));
		this._tracer = new TracerImpl(this._processor, this._resource, this._sampler);

		// Enable all instrumentations
		for (const instrumentation of this._instrumentations) {
			instrumentation.enable(this._tracer);
		}
	}

	getTracer(_name: string, _version?: string): Tracer {
		return this._tracer;
	}

	async shutdown(): Promise<void> {
		// Disable all instrumentations before shutting down the processor
		for (const instrumentation of this._instrumentations) {
			instrumentation.disable();
		}
		await this._processor.shutdown();
	}
}
