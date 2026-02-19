import type { Context, Span } from "../types/tracing";
import type { Baggage } from "./baggage";

class ContextImpl implements Context {
	private readonly _values: Map<symbol, unknown>;

	constructor(values?: Map<symbol, unknown>) {
		this._values = values ? new Map(values) : new Map();
	}

	getValue(key: symbol): unknown {
		return this._values.get(key);
	}

	setValue(key: symbol, value: unknown): Context {
		const newValues = new Map(this._values);
		newValues.set(key, value);
		return new ContextImpl(newValues);
	}

	deleteValue(key: symbol): Context {
		const newValues = new Map(this._values);
		newValues.delete(key);
		return new ContextImpl(newValues);
	}
}

export const ROOT_CONTEXT: Context = new ContextImpl();

const ACTIVE_SPAN_KEY = Symbol.for("wpackages.tracing.active_span");
const ACTIVE_BAGGAGE_KEY = Symbol.for("wpackages.tracing.active_baggage");

export function getSpan(context: Context): Span | undefined {
	return context.getValue(ACTIVE_SPAN_KEY) as Span | undefined;
}

export function setSpan(context: Context, span: Span): Context {
	return context.setValue(ACTIVE_SPAN_KEY, span);
}

export function getBaggage(context: Context): Baggage | undefined {
	return context.getValue(ACTIVE_BAGGAGE_KEY) as Baggage | undefined;
}

export function setBaggage(context: Context, baggage: Baggage): Context {
	return context.setValue(ACTIVE_BAGGAGE_KEY, baggage);
}
