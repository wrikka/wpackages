import { confirm, group, select, text } from "../index";

async function main() {
	const results = await group({
		prompts: {
			name: text({ message: "What is your name?" }),
			shouldContinue: confirm({ message: "Do you want to continue?" }),
			framework: select({
				message: "Pick a framework",
				options: [
					{ value: "next", label: "Next.js" },
					{ value: "astro", label: "Astro" },
					{ value: "svelte", label: "SvelteKit" },
				],
			}),
		},
		intro: "Let’s answer a few questions",
		outro: "All done!",
	});

	console.log(results);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
