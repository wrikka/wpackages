import React from "react";
import {
	ConfirmPrompt,
	DatePrompt,
	LoadingSpinner,
	MultiSelectPrompt,
	Note,
	NumberPrompt,
	RatingPrompt,
	SelectPrompt,
	SliderPrompt,
	TextPrompt,
	TimePrompt,
	TogglePrompt,
} from "../src/components";
import { prompt } from "../src/context";

async function main() {
	console.clear();

	await prompt(Note, { message: "Welcome to the @wrikka/prompt showcase!" });

	const name = await prompt(TextPrompt, { message: "What is your name?" }, "");

	const usePackage = await prompt(
		ConfirmPrompt,
		{ message: `Nice to meet you, ${name}! Are you enjoying this library?` },
		true,
	);

	if (!usePackage) {
		await prompt(Note, { message: "Oh, that's a shame. Goodbye!", type: "warning" });
		return;
	}

	await prompt(
		SelectPrompt,
		{
			message: "What is your favorite feature so far?",
			options: [
				{ value: "text", label: "Text Input" },
				{ value: "confirm", label: "Confirmation" },
				{ value: "select", label: "Select Menu" },
			],
		},
		"text",
	);

	await prompt(
		MultiSelectPrompt,
		{
			message: "Which features would you like to see improved? (Space to select, Enter to submit)",
			options: [
				{ value: "more-components", label: "More Components" },
				{ value: "theming", label: "Theming" },
				{ value: "performance", label: "Performance" },
			],
		},
		[],
	);

	await prompt(NumberPrompt, { message: "How old are you?", min: 18, max: 99 }, 25);

	await prompt(SliderPrompt, { message: "How satisfied are you?", max: 10 }, 5);

	await prompt(TogglePrompt, { message: "Enable notifications?" }, false);

	await prompt(RatingPrompt, { message: "Rate this project (out of 5 stars)" }, 3);

	await prompt(DatePrompt, { message: "Pick a release date for your project" }, new Date());

	await prompt(TimePrompt, { message: "Schedule a follow-up meeting" }, new Date());

	await prompt(LoadingSpinner, { message: "Saving your preferences..." });

	await prompt(Note, { message: "All done! Thank you for your feedback.", type: "success" });
}

main();
