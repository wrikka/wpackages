export interface OtlpExporterConfig {
	/** OTLP endpoint URL (e.g., http://localhost:4318/v1/traces) */
	url: string;
	/** Headers to include in requests */
	headers?: Record<string, string>;
	/** Timeout in milliseconds for requests */
	timeout?: number;
	/** Maximum number of retries for failed requests */
	maxRetries?: number;
	/** Initial retry delay in milliseconds */
	retryDelay?: number;
	/** Compression type */
	compression?: "gzip" | "none";
	/** Batch size for export */
	batchSize?: number;
}

export interface OtlpResource {
	attributes: Record<string, string | number | boolean>;
}

export interface OtlpKeyValue {
	key: string;
	value: OtlpAnyValue;
}

export interface OtlpAnyValue {
	stringValue?: string;
	intValue?: string;
	doubleValue?: number;
	boolValue?: boolean;
	arrayValue?: OtlpArrayValue;
	kvlistValue?: OtlpKeyValueList;
	bytesValue?: string;
}

export interface OtlpArrayValue {
	values: OtlpAnyValue[];
}

export interface OtlpKeyValueList {
	values: OtlpKeyValue[];
}

export interface OtlpSpan {
	traceId: string;
	spanId: string;
	parentSpanId?: string;
	name: string;
	kind: OtlpSpanKind;
	startTimeUnixNano: string;
	endTimeUnixNano: string;
	attributes?: OtlpKeyValue[];
	events?: OtlpSpanEvent[];
	links?: OtlpSpanLink[];
	status?: OtlpStatus;
	resource?: OtlpResource;
	instrumentationLibrary?: OtlpInstrumentationLibrary;
}

export type OtlpSpanKind =
	| "SPAN_KIND_UNSPECIFIED"
	| "SPAN_KIND_INTERNAL"
	| "SPAN_KIND_SERVER"
	| "SPAN_KIND_CLIENT"
	| "SPAN_KIND_PRODUCER"
	| "SPAN_KIND_CONSUMER";

export interface OtlpSpanEvent {
	timeUnixNano: string;
	name: string;
	attributes?: OtlpKeyValue[];
}

export interface OtlpSpanLink {
	traceId: string;
	spanId: string;
	attributes?: OtlpKeyValue[];
}

export interface OtlpStatus {
	code: OtlpStatusCode;
	message?: string;
}

export type OtlpStatusCode = "UNSET" | "OK" | "ERROR";

export interface OtlpInstrumentationLibrary {
	name: string;
	version?: string;
}

export interface OtlpExportSpansRequest {
	resourceSpans: OtlpResourceSpans[];
}

export interface OtlpResourceSpans {
	resource: OtlpResource;
	instrumentationLibrarySpans: OtlpInstrumentationLibrarySpans[];
}

export interface OtlpInstrumentationLibrarySpans {
	instrumentationLibrary: OtlpInstrumentationLibrary;
	spans: OtlpSpan[];
}

export interface OtlpMetric {
	name: string;
	description?: string;
	unit?: string;
	data: OtlpMetricData;
}

export interface OtlpMetricData {
	gauge?: OtlpGauge;
	sum?: OtlpSum;
	histogram?: OtlpHistogram;
	exponentialHistogram?: OtlpExponentialHistogram;
}

export interface OtlpGauge {
	dataPoints: OtlpNumberDataPoint[];
}

export interface OtlpSum {
	dataPoints: OtlpNumberDataPoint[];
	isMonotonic: boolean;
	aggregationTemporality: OtlpAggregationTemporality;
}

export interface OtlpHistogram {
	dataPoints: OtlpHistogramDataPoint[];
	aggregationTemporality: OtlpAggregationTemporality;
}

export interface OtlpExponentialHistogram {
	dataPoints: OtlpExponentialHistogramDataPoint[];
	aggregationTemporality: OtlpAggregationTemporality;
}

export interface OtlpNumberDataPoint {
	attributes?: OtlpKeyValue[];
	startTimeUnixNano: string;
	timeUnixNano: string;
	asDouble?: number;
	asInt?: string;
	exemplars?: OtlpExemplar[];
}

export interface OtlpHistogramDataPoint {
	attributes?: OtlpKeyValue[];
	startTimeUnixNano: string;
	timeUnixNano: string;
	count: string;
	sum?: number;
	bucketOptions?: OtlpBucketOptions;
	explicitBounds?: number[];
	bucketCounts: string[];
	exemplars?: OtlpExemplar[];
	min?: number;
	max?: number;
}

export interface OtlpExponentialHistogramDataPoint {
	attributes?: OtlpKeyValue[];
	startTimeUnixNano: string;
	timeUnixNano: string;
	count: string;
	sum?: number;
	scale: number;
	zeroCount: string;
	positive: OtlpExponentialHistogramDataPointBuckets;
	negative?: OtlpExponentialHistogramDataPointBuckets;
	flags: number;
	exemplars?: OtlpExemplar[];
	min?: number;
	max?: number;
}

export interface OtlpExponentialHistogramDataPointBuckets {
	offset: number;
	bucketCounts: string[];
}

export interface OtlpBucketOptions {
	boundaries?: number[];
	explicit?: OtlpExplicitBucketOptions;
	exponential?: OtlpExponentialBucketOptions;
}

export interface OtlpExplicitBucketOptions {
	boundaries: number[];
}

export interface OtlpExponentialBucketOptions {
	scale: number;
	growthFactor: number;
}

export interface OtlpExemplar {
	filteredAttributes?: OtlpKeyValue[];
	timeUnixNano: string;
	asDouble?: number;
	asInt?: string;
	spanId: string;
	traceId: string;
}

export type OtlpAggregationTemporality =
	| "AGGREGATION_TEMPORALITY_UNSPECIFIED"
	| "AGGREGATION_TEMPORALITY_DELTA"
	| "AGGREGATION_TEMPORALITY_CUMULATIVE";

export interface OtlpExportMetricsServiceRequest {
	resourceMetrics: OtlpResourceMetrics[];
}

export interface OtlpResourceMetrics {
	resource: OtlpResource;
	scopeMetrics: OtlpScopeMetrics[];
}

export interface OtlpScopeMetrics {
	scope: OtlpInstrumentationLibrary;
	metrics: OtlpMetric[];
}

export interface OtlpLogRecord {
	timeUnixNano: string;
	severityNumber?: number;
	severityText?: string;
	body?: OtlpAnyValue;
	attributes?: OtlpKeyValue[];
	traceId?: string;
	spanId?: string;
	flags?: number;
	resource?: OtlpResource;
	instrumentationLibrary?: OtlpInstrumentationLibrary;
}

export interface OtlpExportLogsServiceRequest {
	resourceLogs: OtlpResourceLogs[];
}

export interface OtlpResourceLogs {
	resource: OtlpResource;
	scopeLogs: OtlpScopeLogs[];
}

export interface OtlpScopeLogs {
	scope: OtlpInstrumentationLibrary;
	logRecords: OtlpLogRecord[];
}
