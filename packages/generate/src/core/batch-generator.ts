import type { GenerateResult, GeneratorOptions } from "../types";
import { generateFiles, mergeGeneratorOptions } from "./generator";

/**
 * Batch generation request
 */
export interface BatchGenerationRequest {
	path: string;
	content: string;
	shouldOverwrite?: boolean;
}

/**
 * Generate multiple files in batch
 */
export const generateBatch = async (
	files: BatchGenerationRequest[],
	options?: GeneratorOptions,
): Promise<GenerateResult> => {
	const mergedOptions = mergeGeneratorOptions(options);
	return generateFiles(files, mergedOptions);
};

/**
 * Generate files with parallel execution
 */
export const generateBatchParallel = async (
	files: BatchGenerationRequest[],
	options?: GeneratorOptions,
	concurrency: number = 5,
): Promise<GenerateResult> => {
	const mergedOptions = mergeGeneratorOptions(options);

	// Split files into chunks
	const chunks: BatchGenerationRequest[][] = [];
	for (let i = 0; i < files.length; i += concurrency) {
		chunks.push(files.slice(i, i + concurrency));
	}

	// Process chunks sequentially, but files within chunk in parallel
	const allResults: GenerateResult[] = [];

	for (const chunk of chunks) {
		const results = await Promise.all(
			chunk.map(file =>
				generateFiles([file], mergedOptions),
			),
		);
		allResults.push(...results);
	}

	// Merge all results
	const mergedResult: GenerateResult = {
		files: allResults.flatMap(r => r.files),
		errors: allResults.flatMap(r => r.errors),
		duration: allResults.reduce((sum, r) => sum + r.duration, 0),
	};

	return mergedResult;
};
