import React from "react";
import { MultiSelectPrompt, prompt } from "../src";

async function main() {
	const features = await prompt(
		MultiSelectPrompt,
		{
			message: "Select features to improve:",
			options: [
				{ value: "theming", label: "Theming" },
				{ value: "performance", label: "Performance" },
			],
		},
		[],
	);
	console.log(`You selected: ${features.join(", ")}`);
}

main();
