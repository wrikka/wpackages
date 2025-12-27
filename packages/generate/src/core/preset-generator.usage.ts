import { generateFromPreset, PRESETS } from "./preset-generator";

/**
 * Example 1: Generate React component from preset
 */
export const example1 = async () => {
	const result = await generateFromPreset(PRESETS.REACT_COMPONENT, {
		outputDir: "./src/components",
		variables: {
			name: "Button",
			description: "Reusable button component",
		},
	});

	console.log(`Generated ${result.files.length} files`);
	result.files.forEach(file => console.log(`- ${file.path}`));
};

/**
 * Example 2: Generate Vue component from preset
 */
export const example2 = async () => {
	const result = await generateFromPreset(PRESETS.VUE_COMPONENT, {
		outputDir: "./src/components",
		variables: {
			name: "Card",
			description: "Card component",
		},
	});

	console.log("Generated Vue component:", result.files.length, "files");
};

/**
 * Example 3: Generate full module from preset
 */
export const example3 = async () => {
	const result = await generateFromPreset(PRESETS.FULL_MODULE, {
		outputDir: "./src",
		variables: {
			name: "auth",
			description: "Authentication module",
		},
	});

	console.log("Generated module structure:");
	result.files.forEach(file => console.log(`- ${file.path}`));
};

/**
 * Example 4: Generate service layer from preset
 */
export const example4 = async () => {
	const result = await generateFromPreset(PRESETS.SERVICE_LAYER, {
		outputDir: "./src/services",
		variables: {
			name: "UserService",
			description: "User management service",
		},
	});

	console.log("Generated service layer:");
	result.files.forEach(file => console.log(`- ${file.path}`));
};

/**
 * Example 5: Custom preset
 */
export const example5 = async () => {
	const customPreset = {
		name: "Custom API Endpoint",
		description: "Generate API endpoint with handler and test",
		files: [
			{
				type: "code" as const,
				name: "handler",
				options: { outputDir: "./src/api" },
			},
			{
				type: "test" as const,
				name: "handler",
				options: { outputDir: "./src/api" },
			},
		],
	};

	const result = await generateFromPreset(customPreset, {
		outputDir: './src/api',
		variables: { name: 'getUser' }
	});

	console.log("Generated custom preset:", result.files.length, "files");
};
