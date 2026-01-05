import { Resource } from "./models/resource";
import { SimpleSpanProcessor } from "./services/processor.service";
import { InMemorySpanExporter } from "./services/exporter.service";
import { ParentBasedSampler, TraceIdRatioBasedSampler } from "./services/sampler.service";
import { TracerImpl as TracerImplBase } from "./services/tracer.service";
import type { Span } from "./types/tracing";
export { NOOP_TRACER } from "./services/tracer.service";

const exporter = new InMemorySpanExporter();

export function getFinishedSpans(): Span[] {
	return exporter.getFinishedSpans();
}

export async function ingestSpans(spans: Span[]): Promise<void> {
	await exporter.export(spans);
}

export function resetFinishedSpans(): void {
	exporter.reset();
}

export const finishedSpans = getFinishedSpans();

const processor = new SimpleSpanProcessor(exporter);
const resource = new Resource({});
const sampler = new ParentBasedSampler(new TraceIdRatioBasedSampler(1.0));

export class TracerImpl extends TracerImplBase {
	constructor() {
		super(processor, resource, sampler);
	}
}
