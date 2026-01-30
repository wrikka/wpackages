import { generateCode, generateComponent } from "../src";

// 1. Generate a React component with a test file
await generateComponent("UserProfile", {
	outputDir: "./tmp/components",
	framework: "react",
	withTest: true,
	variables: {
		name: "UserProfile",
		description: "A component to display a user profile.",
	},
});

// 2. Generate a service file from a custom template
const serviceTemplate = `
import { Effect } from 'effect';

// {{ description }}
export class {{ pascal name }} extends Context.Tag('{{ pascal name }}')<{{ pascal name }}, {}> {}`;

await generateCode("UserService", serviceTemplate, {
	outputDir: "./tmp/services",
	variables: {
		name: "UserService",
		description: "Service for managing users.",
	},
});

console.log("✅ Examples generated successfully!");
