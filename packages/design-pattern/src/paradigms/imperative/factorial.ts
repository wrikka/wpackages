import { PatternMetadata } from "../../core/metadata";

export const metadata: PatternMetadata = {
	name: "Imperative Factorial",
	description: "Calculates factorial using a step-by-step, imperative approach.",
	tags: ["imperative", "loop", "factorial"],
};

export function factorial(n: number): number {
	if (n < 0) {
		throw new Error("Factorial is not defined for negative numbers.");
	}

	let result = 1;
	for (let i = 2; i <= n; i++) {
		result *= i;
	}
	return result;
}
