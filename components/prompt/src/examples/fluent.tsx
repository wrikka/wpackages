import { ask } from "../fluent";
import { wizard } from "../fluent/wizard";
import { confirm, select } from "../index";
import { isCancel } from "../types";

async function main() {
	const nameResult = await ask()
		.text({ message: "What is your name?", placeholder: "Type here..." })
		.run();

	if (isCancel(nameResult)) {
		process.exit(0);
	}

	const confirmResult = await ask()
		.confirm({ message: `Continue, ${nameResult.value}?` })
		.run();

	if (isCancel(confirmResult)) {
		process.exit(0);
	}

	console.log({ name: nameResult.value, shouldContinue: confirmResult.value });

	const wizardResult = await wizard()
		.intro("Let’s answer a few questions")
		.step("shouldContinue", confirm({ message: "Do you want to continue?" }))
		.step(
			"framework",
			select({
				message: "Pick a framework",
				options: [
					{ value: "next", label: "Next.js" },
					{ value: "astro", label: "Astro" },
					{ value: "svelte", label: "SvelteKit" },
				],
			}),
		)
		.outro("All done!")
		.run();

	if (isCancel(wizardResult)) {
		process.exit(0);
	}

	console.log(wizardResult.value);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
