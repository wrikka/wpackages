export interface PlaygroundTemplate {
	name: string;
	description: string;
	framework: string;
	url: string;
}

export interface PlaygroundConfig {
	templates: PlaygroundTemplate[];
	defaultTemplate?: string;
}

/**
 * Generate StackBlitz URL for preview package
 */
export function generateStackBlitzUrl(
	packageName: string,
	version: string,
	template: PlaygroundTemplate,
): string {
	const encodedPackage = encodeURIComponent(`${packageName}@${version}`);

	return `https://stackblitz.com/fork/github/${template.url}?file=src/App.tsx&terminal=dev&install=${encodedPackage}`;
}

/**
 * Generate CodeSandbox URL
 */
export function generateCodeSandboxUrl(
	template: string,
): string {
	return `https://codesandbox.io/s/${template}?fontsize=14&hidenavigation=1&theme=dark&module=/src/App.tsx`;
}

/**
 * Generate StackBlitz project configuration
 */
export function generateStackBlitzConfig(
	packageName: string,
	version: string,
	framework: "react" | "vue" | "svelte" | "vanilla",
): {
	title: string;
	description: string;
	template: string;
	dependencies: Record<string, string>;
	files: Record<string, string>;
} {
	const dependencies: Record<string, string> = {
		[packageName]: version,
	};

	// packageName and version are used in the return statement
	let template = "node";
	let files: Record<string, string> = {};

	switch (framework) {
		case "react":
			template = "create-react-app";
			dependencies["react"] = "^18.2.0";
			dependencies["react-dom"] = "^18.2.0";
			files = {
				"src/App.tsx": `import React from 'react';
import { } from '${packageName}';

export default function App() {
  return (
    <div>
      <h1>Testing ${packageName}</h1>
      {/* Add your code here */}
    </div>
  );
}`,
				"src/index.tsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);`,
			};
			break;

		case "vue":
			template = "vue";
			dependencies["vue"] = "^3.3.0";
			files = {
				"src/App.vue": `<script setup lang="ts">
import {} from '${packageName}';
</script>

<template>
  <div>
    <h1>Testing ${packageName}</h1>
    <!-- Add your code here -->
  </div>
</template>`,
				"src/main.ts": `import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');`,
			};
			break;

		case "svelte":
			template = "svelte";
			dependencies["svelte"] = "^4.0.0";
			files = {
				"src/App.svelte": `<script lang="ts">
  import {} from '${packageName}';
</script>

<main>
  <h1>Testing ${packageName}</h1>
  <!-- Add your code here -->
</main>`,
			};
			break;

		case "vanilla":
		default:
			files = {
				"index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Testing ${packageName}</title>
</head>
<body>
  <div id="app">
    <h1>Testing ${packageName}</h1>
  </div>
  <script type="module" src="/main.js"></script>
</body>
</html>`,
				"main.js": `import {} from '${packageName}';

console.log('Testing ${packageName}');
// Add your code here
`,
			};
	}

	return {
		title: `Testing ${packageName}`,
		description: `Preview playground for ${packageName}@${version}`,
		template,
		dependencies,
		files,
	};
}

/**
 * Default playground templates
 */
export const DEFAULT_TEMPLATES: PlaygroundTemplate[] = [
	{
		name: "React + TypeScript",
		description: "React with TypeScript and Vite",
		framework: "react",
		url: "stackblitz/vite-react-ts-starter",
	},
	{
		name: "Vue 3 + TypeScript",
		description: "Vue 3 with TypeScript and Vite",
		framework: "vue",
		url: "stackblitz/vite-vue-ts-starter",
	},
	{
		name: "Svelte + TypeScript",
		description: "Svelte with TypeScript and Vite",
		framework: "svelte",
		url: "stackblitz/vite-svelte-ts-starter",
	},
	{
		name: "Vanilla TypeScript",
		description: "Plain TypeScript with Vite",
		framework: "vanilla",
		url: "stackblitz/vite-ts-starter",
	},
];
