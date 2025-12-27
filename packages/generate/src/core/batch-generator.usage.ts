import { generateBatch, generateBatchParallel } from "./batch-generator";

/**
 * Example 1: Generate multiple files in batch
 */
export const example1 = async () => {
	const files = [
		{
			path: "./src/services/user.service.ts",
			content: "export const userService = () => {}",
		},
		{
			path: "./src/services/auth.service.ts",
			content: "export const authService = () => {}",
		},
		{
			path: "./src/services/api.service.ts",
			content: "export const apiService = () => {}",
		},
	];

	const result = await generateBatch(files, {
		outputDir: "./src",
		overwrite: true,
		variables: { name: "service" },
	});

	console.log(`Generated ${result.files.length} files`);
};

/**
 * Example 2: Generate files with parallel execution
 */
export const example2 = async () => {
	const files = Array.from({ length: 20 }, (_, i) => ({
		path: `./src/components/Component${i}.tsx`,
		content: `export const Component${i} = () => <div>Component ${i}</div>`,
	}));

	const result = await generateBatchParallel(files, {
		outputDir: "./src",
		overwrite: true,
	}, 5); // 5 concurrent files

	console.log(`Generated ${result.files.length} files in ${result.duration}ms`);
};

/**
 * Example 3: Batch generation with error handling
 */
export const example3 = async () => {
	const files = [
		{
			path: "./src/utils/helper1.ts",
			content: "export const helper1 = () => {}",
		},
		{
			path: "./src/utils/helper2.ts",
			content: "export const helper2 = () => {}",
		},
	];

	const result = await generateBatch(files, {
		outputDir: "./src",
		dryRun: true, // Test without writing
	});

	if (result.errors.length > 0) {
		console.error("Errors:", result.errors);
	} else {
		console.log("All files generated successfully");
	}
};
