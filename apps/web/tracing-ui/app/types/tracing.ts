export interface Span {
  spanId: string;
  traceId: string;
  name: string;
  startTime: number;
  endTime?: number;
  resource?: {
    attributes?: Record<string, string>;
  };
  parentSpanId?: string;
  status?: {
    code: number;
    description?: string;
  };
  attributes?: Record<string, any>;
  events?: Array<{
    name: string;
    timestamp: number;
    attributes?: Record<string, any>;
  }>;
  links?: Array<{
    traceId: string;
    spanId: string;
    attributes?: Record<string, any>;
  }>;
}

export interface Trace {
  traceId: string;
  spans: Span[];
}

export interface TracesResponse {
  traces: Trace[];
  total: number;
}
