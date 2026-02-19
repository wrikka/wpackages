import { createBaggage } from "../models/baggage";
import { getBaggage, getSpan, setBaggage, setSpan } from "../models/context";
import type { Context, TextMapGetter, TextMapPropagator, TextMapSetter } from "../types/tracing";

const TRACE_PARENT_HEADER = "traceparent";
const TRACE_PARENT_REGEX = /^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

export class W3cTraceContextPropagator implements TextMapPropagator {
	inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
		const span = getSpan(context);
		if (!span) return;

		const traceParent = `00-${span.traceId}-${span.spanId}-01`;
		setter.set(carrier, TRACE_PARENT_HEADER, traceParent);
	}

	extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
		const traceParent = getter.get(carrier, TRACE_PARENT_HEADER);
		if (typeof traceParent !== "string") return context;

		const match = traceParent.match(TRACE_PARENT_REGEX);
		if (!match) return context;

		const spanContext = { traceId: match[2], spanId: match[3] };
		// This is a remote context, so we create a non-recording span to carry it.
		const remoteSpan = { ...spanContext } as any;
		return setSpan(context, remoteSpan);
	}
}

const BAGGAGE_HEADER = "baggage";

export class W3cBaggagePropagator implements TextMapPropagator {
	inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
		const baggage = getBaggage(context);
		if (!baggage) return;

		const header = baggage.getAllEntries()
			.map(([key, entry]) => `${encodeURIComponent(key)}=${encodeURIComponent(entry.value)}`)
			.join(",");

		if (header) {
			setter.set(carrier, BAGGAGE_HEADER, header);
		}
	}

	extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
		const header = getter.get(carrier, BAGGAGE_HEADER);
		if (typeof header !== "string") return context;

		const baggage = header.split(",").reduce((bag, part) => {
			const [key, value] = part.split("=");
			if (key && value) {
				return bag.setEntry(decodeURIComponent(key.trim()), { value: decodeURIComponent(value.trim()) });
			}
			return bag;
		}, createBaggage());

		return setBaggage(context, baggage);
	}
}

export class CompositePropagator implements TextMapPropagator {
	private readonly _propagators: TextMapPropagator[];

	constructor(propagators: TextMapPropagator[] = []) {
		this._propagators = propagators;
	}

	inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
		for (const propagator of this._propagators) {
			propagator.inject(context, carrier, setter);
		}
	}

	extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
		return this._propagators.reduce((ctx, propagator) => propagator.extract(ctx, carrier, getter), context);
	}
}
