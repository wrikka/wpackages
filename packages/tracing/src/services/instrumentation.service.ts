import type * as httpType from "node:http";
import { createRequire } from "node:module";
import type { Request, Response as ExpressResponse, NextFunction } from 'express';
import type { Instrumentation, Tracer, TextMapGetter, TextMapSetter, TextMapPropagator } from "../types/tracing";
import { getActiveContext, withActiveContext } from "./context.service";
import { W3cTraceContextPropagator, W3cBaggagePropagator, CompositePropagator } from "./propagation.service";

const require = createRequire(import.meta.url);
const http = require("node:http") as typeof httpType;

const originalFetch = globalThis.fetch;

const defaultSetter: TextMapSetter<Headers> = {
	set(carrier, key, value) {
		carrier.set(key, value);
	},
};

export class FetchInstrumentation implements Instrumentation {
	readonly name = "@wpackages/instrumentation-fetch";
	private _tracer: Tracer | null = null;
	private _isEnabled = false;

	constructor(private readonly _propagator: TextMapPropagator = new W3cTraceContextPropagator()) {}

	enable(tracer: Tracer): void {
		if (this._isEnabled) return;
		this._isEnabled = true;
		this._tracer = tracer;

		const self = this;
		const wrapper = function (this: typeof globalThis, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
			return self._patchedFetch.call(this, input, init);
		};

		// Copy all properties from the original fetch to our wrapper
		Object.assign(wrapper, originalFetch);

		globalThis.fetch = wrapper as unknown as typeof fetch;
	}

	disable(): void {
		if (!this._isEnabled) return;
		this._isEnabled = false;
		this._tracer = null;
		globalThis.fetch = originalFetch;
	}

	private async _patchedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		if (!this._tracer) {
			return originalFetch(input, init);
		}

		const request = new Request(input, init);
		const url = new URL(request.url);
		const method = request.method.toUpperCase();

		return this._tracer.trace(`HTTP ${method}`, async (span) => {
			span.setAttribute("http.method", method);
			span.setAttribute("http.url", url.toString());

			// Inject trace context into headers
			const activeContext = getActiveContext();
			this._propagator.inject(activeContext, request.headers, defaultSetter);

			try {
				const response = await originalFetch(request);
				span.setAttribute("http.status_code", response.status);
				if (!response.ok) {
					span.setStatus("error");
				}
				return response;
			} catch (error) {
				span.setStatus("error");
				if (error instanceof Error) {
					span.setAttribute("error.message", error.message);
				}
				throw error;
			}
		});
	}
}

const originalHttpRequest = http.request;
const originalHttpGet = http.get;

/**
 * Instrumentation for the built-in Node.js http module.
 */
export class HttpInstrumentation implements Instrumentation {
	readonly name = "@wpackages/instrumentation-http";
	private _tracer: Tracer | null = null;
	private _isEnabled = false;
	private readonly _propagator: TextMapPropagator = new W3cTraceContextPropagator();

	enable(tracer: Tracer): void {
		if (this._isEnabled) return;
		this._isEnabled = true;
		this._tracer = tracer;
		(http.request as any) = this._patchRequest();
		(http.get as any) = this._patchGet();
	}

	disable(): void {
		if (!this._isEnabled) return;
		this._isEnabled = false;
		this._tracer = null;
		http.request = originalHttpRequest;
		http.get = originalHttpGet;
	}

	private _patchRequest() {
		const self = this;
		return function (this: any, ...args: any[]): httpType.ClientRequest {
			if (!self._tracer) {
				return (originalHttpRequest as any).apply(this, args as any);
			}

			const [options, callback] = self._normalizeArgs(args);
			const method = (options.method || 'GET').toUpperCase();
			const url = self._constructUrl(options);

			const span = self._tracer.startSpan(`HTTP ${method}`);
			span.setAttribute('http.method', method);
			span.setAttribute('http.url', url);

			const headers = options.headers || {};
			const activeContext = getActiveContext();
			self._propagator.inject(activeContext, headers, {
				set: (carrier, key, value) => {
					carrier[key] = value;
				},
			});
			options.headers = headers;

			const req = (originalHttpRequest as any).call(this, options, (res: httpType.IncomingMessage) => {
				res.on('end', () => {
					span.setAttribute('http.status_code', res.statusCode);
					if (res.statusCode && res.statusCode >= 400) {
						span.setStatus('error');
					}
					span.end();
				});
				if (callback) {
					callback(res);
				}
			});

			req.on('error', (error: Error) => {
				span.setStatus('error');
				span.setAttribute('error.message', error.message);
				span.end();
			});

			return req;
		};
	}

	private _patchGet() {
		const self = this;
		return function (this: any, ...args: any[]): httpType.ClientRequest {
			const req = self._patchRequest().apply(this, args as any);
			req.end();
			return req;
		};
	}

	private _normalizeArgs(args: any[]): [httpType.RequestOptions, ((res: httpType.IncomingMessage) => void) | undefined] {
		if (typeof args[0] === 'string' || args[0] instanceof URL) {
			const [url, options, callback] = args;
			return [{ ...new URL(url), ...options }, callback];
		}
		const [options, callback] = args;
		return [options, callback];
	}

	private _constructUrl(options: httpType.RequestOptions): string {
		const protocol = options.protocol || 'http:';
		const host = options.hostname || options.host || 'localhost';
		const port = options.port ? `:${options.port}` : '';
		const path = options.path || '/';
		return `${protocol}//${host}${port}${path}`;
	}
}

export class ExpressInstrumentation implements Instrumentation {
	readonly name = "@wpackages/instrumentation-express";
	private _tracer: Tracer | null = null;
	private _isEnabled = false;
	private readonly _propagator: TextMapPropagator = new CompositePropagator([
		new W3cTraceContextPropagator(),
		new W3cBaggagePropagator(),
	]);

	enable(tracer: Tracer): void {
		if (this._isEnabled) return;
		this._isEnabled = true;
		this._tracer = tracer;

		try {
			const express = require('express');
			const originalUse = express.application.use;
			const self = this;

			express.application.use = function (this: any, ...args: any[]) {
				if (typeof args[0] === 'function') {
					const middleware = self._createMiddleware(args[0]);
					return originalUse.call(this, middleware);
				}
				return originalUse.apply(this, args);
			};
		} catch (error) {
			// Express not installed
		}
	}

	disable(): void {
		// A real implementation would need to restore the original 'use' method.
		// This is simplified for now.
		this._isEnabled = false;
		this._tracer = null;
	}

	private _createMiddleware(middleware: Function) {
		const self = this;
		return function (this: any, req: Request, res: ExpressResponse, next: NextFunction) {
			if (!self._tracer) {
				return middleware.call(this, req, res, next);
			}

			const getter: TextMapGetter<Request['headers']> = {
				get: (carrier, key) => {
					const value = carrier[key];
					if (Array.isArray(value)) return value[0];
					return value;
				},
				keys: (carrier) => Object.keys(carrier),
			};

			const parentContext = self._propagator.extract(getActiveContext(), req.headers, getter);

			return withActiveContext(parentContext, () => {
				const spanName = `${req.method} ${req.path}`;
				self._tracer!.trace(spanName, (span) => {
					span.setAttribute('http.method', req.method);
					span.setAttribute('http.url', `${req.protocol}://${req.get('host')}${req.originalUrl}`);
					span.setAttribute('http.route', req.route?.path);

					res.on('finish', () => {
						span.setAttribute('http.status_code', res.statusCode);
						if (res.statusCode >= 500) {
							span.setStatus('error');
						}
						span.end();
					});

					return middleware.call(this, req, res, next);
				});
			});
		};
	}
}
