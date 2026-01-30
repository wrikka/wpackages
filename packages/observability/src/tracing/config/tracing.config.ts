import {
	BatchSpanProcessor,
	ConsoleSpanExporter,
	ExpressInstrumentation,
	FetchInstrumentation,
	HttpInstrumentation,
	TracerProvider,
} from "../index";
import type {
	BatchSpanProcessorConfig,
	Instrumentation,
	Resource,
	Sampler,
	SpanProcessor,
	TracerProviderConfig,
} from "../types/tracing";
import { detectDefaultResource } from "../utils/resource.util";
import { registerGracefulShutdown } from "../utils/shutdown.util";

export interface TracingConfig {
	/** The span processor to use. Defaults to BatchSpanProcessor. */
	processor?: SpanProcessor;
	/** A list of instrumentations to apply. Defaults to [new FetchInstrumentation()]. */
	instrumentations?: Instrumentation[];
	/** Configuration for the default BatchSpanProcessor. */
	batchProcessorConfig?: BatchSpanProcessorConfig;
	/** A Resource instance to be merged with the default detected resource. */
	resource?: Resource;
	/** The sampler to use. Defaults to ParentBasedSampler with a 100% ratio. */
	sampler?: Sampler;
}

/**
 * Initializes and starts the tracing system with a simplified configuration.
 * This is the recommended way to get started.
 * @param config The configuration for the tracing system.
 * @returns An initialized TracerProvider instance.
 */
export async function init(config: TracingConfig = {}): Promise<TracerProvider> {
	const defaultInstrumentations: Instrumentation[] = [];
	if (typeof window === "undefined") {
		// Running in Node.js
		defaultInstrumentations.push(new HttpInstrumentation());
		defaultInstrumentations.push(new FetchInstrumentation());
		defaultInstrumentations.push(new ExpressInstrumentation());
	} else {
		// Running in Browser
		defaultInstrumentations.push(new FetchInstrumentation());
	}

	const instrumentations = config.instrumentations ?? defaultInstrumentations;

	const processor = config.processor ?? new BatchSpanProcessor(
		new ConsoleSpanExporter(),
		config.batchProcessorConfig,
	);

	const detectedResource = await detectDefaultResource();
	const resource = config.resource ? detectedResource.merge(config.resource) : detectedResource;

	const providerConfig: TracerProviderConfig = {
		processor,
		instrumentations,
		resource,
	};

	if (config.sampler) {
		providerConfig.sampler = config.sampler;
	}

	const provider = new TracerProvider(providerConfig);

	if (typeof process !== "undefined") {
		registerGracefulShutdown(provider);
	}

	// In a real-world Node.js app, you would register a shutdown hook:
	// process.on('SIGTERM', () => {
	//   provider.shutdown().then(() => console.log('Tracing terminated'));
	// });

	return provider;
}
