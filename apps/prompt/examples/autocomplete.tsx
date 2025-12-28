import pc from "picocolors";
import React from "react";
import { AutocompletePrompt } from "../src/components";
import { prompt } from "../src/context";

const frameworks = [
	{ value: "next", label: "Next.js", hint: "React framework" },
	{ value: "astro", label: "Astro", hint: "Content-focused" },
	{ value: "svelte", label: "SvelteKit", hint: "Compile-time framework" },
	{ value: "remix", label: "Remix", hint: "Full stack framework" },
	{ value: "nuxt", label: "Nuxt", hint: "Vue framework" },
];

async function main() {
	console.clear();
	console.log(pc.cyan("Autocomplete Prompt Example"));

	const framework = await prompt(
		AutocompletePrompt,
		{
			message: "Search for a framework",
			options: frameworks,
			placeholder: "Type to search...",
		},
		"",
	);

	if (typeof framework === "symbol") {
		console.log(pc.yellow("Prompt cancelled."));
		return;
	}

	console.log(pc.green(`You selected: ${framework}`));
}

main();
