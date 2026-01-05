import { PropertyBasedTesting } from "./runner";
import type { PropertyOptions } from "./types";

let globalPropertyTesting: PropertyBasedTesting | undefined;

export function createPropertyTesting(options: Partial<PropertyOptions> = {}): PropertyBasedTesting {
	if (!globalPropertyTesting) {
		globalPropertyTesting = new PropertyBasedTesting(options);
	}
	return globalPropertyTesting;
}

export function getPropertyTesting(): PropertyBasedTesting {
	if (!globalPropertyTesting) {
		globalPropertyTesting = new PropertyBasedTesting();
	}
	return globalPropertyTesting;
}
