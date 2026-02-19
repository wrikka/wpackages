/**
 * Benchmarking macro for performance testing at build time.
 *
 * @param name - Benchmark name
 * @param fn - Function to benchmark
 * @param options - Benchmark options
 * @returns Benchmark result
 * @throws Error if benchmark fails
 *
 * @example
 * // const result = benchmark("sort", () => {
 * //   // code to benchmark
 * // })
 */
export const benchmark = Bun.macro((
	name: string,
	fn: () => void,
	options: BenchmarkOptions = {},
) => {
	try {
		const iterations = options.iterations || 1000;
		const warmupIterations = options.warmupIterations || 100;

		for (let i = 0; i < warmupIterations; i++) {
			fn();
		}

		const start = performance.now();
		for (let i = 0; i < iterations; i++) {
			fn();
		}
		const end = performance.now();

		const totalTime = end - start;
		const avgTime = totalTime / iterations;
		const opsPerSecond = 1000 / avgTime;

		const result = {
			name,
			iterations,
			totalTime: totalTime.toFixed(4),
			avgTime: avgTime.toFixed(6),
			opsPerSecond: opsPerSecond.toFixed(2),
		};

		if (options.log !== false) {
			console.log(`Benchmark: ${name}`);
			console.log(`  Iterations: ${iterations}`);
			console.log(`  Total time: ${result.totalTime}ms`);
			console.log(`  Avg time: ${result.avgTime}ms`);
			console.log(`  Ops/sec: ${result.opsPerSecond}`);
		}

		return JSON.stringify(result);
	} catch (error) {
		throw new Error(
			"Failed to run benchmark: " + (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * Benchmark options.
 */
interface BenchmarkOptions {
	iterations?: number;
	warmupIterations?: number;
	log?: boolean;
}

/**
 * Compare multiple benchmarks.
 *
 * @param benchmarks - Array of benchmark definitions
 * @returns Comparison results
 *
 * @example
 * // const results = compareBenchmarks([
 * //   { name: "method1", fn: () => method1() },
 * //   { name: "method2", fn: () => method2() }
 * // ])
 */
export const compareBenchmarks = Bun.macro((
	benchmarks: Array<{ name: string; fn: () => void }>,
) => {
	const results: Array<{ name: string; avgTime: number }> = [];

	for (const { name, fn } of benchmarks) {
		const iterations = 1000;
		const warmupIterations = 100;

		for (let i = 0; i < warmupIterations; i++) {
			fn();
		}

		const start = performance.now();
		for (let i = 0; i < iterations; i++) {
			fn();
		}
		const end = performance.now();

		const avgTime = (end - start) / iterations;
		results.push({ name, avgTime });
	}

	results.sort((a, b) => a.avgTime - b.avgTime);

	const fastest = results[0];
	if (!fastest) {
		return JSON.stringify({ fastest: null, results: [] });
	}

	const comparison = results.map((r) => ({
		...r,
		relative: (r.avgTime / fastest.avgTime).toFixed(2) + "x",
	}));

	return JSON.stringify({
		fastest: fastest.name,
		results: comparison,
	});
});
