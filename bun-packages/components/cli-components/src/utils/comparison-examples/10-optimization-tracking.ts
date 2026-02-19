/**
 * Example 10: Real-world Optimization Tracking
 */
import { calculateSpeedup, formatRatio, percentageDifference } from "../comparison.utils";

interface BenchResult {
	name: string;
	averageTime: number;
	ops: number;
	stats: any;
	iterations: number;
	samples: number;
	totalTime: number;
	timestamps: number[];
}

console.log("\n=== Example 10: Optimization Tracking ===");

const optimizationStages = [
	{ stage: "Baseline (unoptimized)", time: 150.0 },
	{ stage: "Add caching", time: 95.5 },
	{ stage: "Algorithm improvement", time: 62.3 },
	{ stage: "Parallel processing", time: 28.7 },
];

console.log("Optimization Progress:\n");

const optimizationBaseline = optimizationStages[0];
if (optimizationBaseline) {
	for (const [index, stage] of optimizationStages.entries()) {
		const speedupVsBaseline = calculateSpeedup(
			{
				name: stage.stage,
				...stage,
				averageTime: stage.time,
				ops: 1,
				stats: {} as any,
				iterations: 1,
				samples: 1,
				totalTime: 1,
				timestamps: [],
			},
			{
				name: optimizationBaseline.stage,
				...optimizationBaseline,
				averageTime: optimizationBaseline.time,
				ops: 1,
				stats: {} as any,
				iterations: 1,
				samples: 1,
				totalTime: 1,
				timestamps: [],
			},
		);
		const ratioVsBaseline = formatRatio(stage.time / optimizationBaseline.time);
		const improvement = percentageDifference(
			stage.time,
			optimizationBaseline.time,
		);

		console.log(`${index + 1}. ${stage.stage}`);
		console.log(`   Time: ${stage.time} ms`);

		if (index > 0) {
			const previous = optimizationStages[index - 1];
			if (previous) {
				const stepImprovement = percentageDifference(stage.time, previous.time);
				console.log(`   Step improvement: ${stepImprovement}`);
			}
		}

		console.log(`   vs Baseline: ${ratioVsBaseline} (${improvement})`);
		console.log(`   Total speedup: ${speedupVsBaseline.toFixed(2)}x`);
		console.log();
	}
}

const lastStage = optimizationStages[optimizationStages.length - 1];
const firstStage = optimizationStages[0];

if (lastStage && firstStage) {
	const totalSpeedup = calculateSpeedup(
		{
			name: lastStage.stage,
			...lastStage,
			averageTime: lastStage.time,
			ops: 1,
			stats: {} as any,
			iterations: 1,
			samples: 1,
			totalTime: 1,
			timestamps: [],
		},
		{
			name: firstStage.stage,
			...firstStage,
			averageTime: firstStage.time,
			ops: 1,
			stats: {} as any,
			iterations: 1,
			samples: 1,
			totalTime: 1,
			timestamps: [],
		},
	);
	console.log(`🚀 Total optimization: ${totalSpeedup.toFixed(2)}x faster!`);
}
