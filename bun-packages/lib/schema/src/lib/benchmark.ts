/**
 * Performance benchmarks for @wpackages/schema
 * Target: Faster than Zod v3, competitive with Valibot
 */

import { string, number, boolean } from "./minimal-factory";

// Test data
const testData = {
	string: "hello world",
	number: 42,
	boolean: true,
	invalid: "invalid",
};

// Benchmark schemas
const stringSchema = string();
const numberSchema = number();
const booleanSchema = boolean();

/**
 * Simple benchmark function
 */
export function benchmark(iterations = 1000000) {
	console.log(`\n🚀 @wpackages/schema Performance Benchmark`);
	console.log(`Iterations: ${iterations.toLocaleString()}\n`);

	// Warm up
	for (let i = 0; i < 1000; i++) {
		stringSchema.safeParse(testData.string);
		numberSchema.safeParse(testData.number);
		booleanSchema.safeParse(testData.boolean);
	}

	// Benchmark string validation
	const stringStart = performance.now();
	for (let i = 0; i < iterations; i++) {
		stringSchema.safeParse(testData.string);
	}
	const stringEnd = performance.now();

	// Benchmark number validation
	const numberStart = performance.now();
	for (let i = 0; i < iterations; i++) {
		numberSchema.safeParse(testData.number);
	}
	const numberEnd = performance.now();

	// Benchmark boolean validation
	const booleanStart = performance.now();
	for (let i = 0; i < iterations; i++) {
		booleanSchema.safeParse(testData.boolean);
	}
	const booleanEnd = performance.now();

	// Results
	const stringTime = stringEnd - stringStart;
	const numberTime = numberEnd - numberStart;
	const booleanTime = booleanEnd - booleanStart;

	console.log("📊 Results:");
	console.log(`String:  ${stringTime.toFixed(2)}ms (${(iterations / stringTime * 1000).toFixed(0)} ops/sec)`);
	console.log(`Number:  ${numberTime.toFixed(2)}ms (${(iterations / numberTime * 1000).toFixed(0)} ops/sec)`);
	console.log(`Boolean: ${booleanTime.toFixed(2)}ms (${(iterations / booleanTime * 1000).toFixed(0)} ops/sec)`);

	const totalTime = stringTime + numberTime + booleanTime;
	const avgTime = totalTime / 3;
	console.log(`\n⚡ Average: ${avgTime.toFixed(2)}ms (${(iterations / avgTime * 1000).toFixed(0)} ops/sec)`);
	console.log(`📦 Bundle target: < 3KB`);
	console.log(`🎯 Performance target: > 2x faster than Zod v3`);

	return {
		string: stringTime,
		number: numberTime,
		boolean: booleanTime,
		average: avgTime,
		opsPerSecond: Math.round(iterations / avgTime * 1000),
	};
}

/**
 * Compare with competitors (placeholder for real benchmarks)
 */
export function compareWithCompetitors() {
	console.log("\n🏆 Competitive Analysis:");
	console.log("vs Zod v3:      ~2x faster (target)");
	console.log("vs Valibot:      ~1.2x faster (target)");
	console.log("vs AJV:          ~0.8x speed (acceptable)");
	console.log("vs Joi:           ~1.5x faster (target)");
}

/**
 * Run full benchmark suite
 */
export function runBenchmarkSuite() {
	const results = benchmark();
	compareWithCompetitors();
	return results;
}
