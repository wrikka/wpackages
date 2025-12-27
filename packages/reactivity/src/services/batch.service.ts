import type { Effect } from "../types";

let isBatching = false;
const queue = new Set<Effect>();

export function batch(fn: () => void): void {
	const wasBatching = isBatching;
	isBatching = true;
	try {
		fn();
	} finally {
		if (!wasBatching) {
			isBatching = false;
			queue.forEach(effect => effect());
			queue.clear();
		}
	}
}

// For internal use
export function queueEffect(effect: Effect) {
	if (isBatching) {
		queue.add(effect);
	} else {
		effect();
	}
}
