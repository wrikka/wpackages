import { autocomplete, prompt } from "../src";

async function main() {
	const favoriteFruit = await prompt(
		autocomplete({
			message: "What is your favorite fruit?",
			placeholder: "Search for a fruit...",
			options: [
				{ value: "apple", label: "Apple", hint: "Keeps the doctor away" },
				{ value: "banana", label: "Banana", hint: "Rich in potassium" },
				{ value: "orange", label: "Orange", hint: "A great source of Vitamin C" },
				{ value: "mango", label: "Mango", hint: "The king of fruits" },
				{ value: "grape", label: "Grape", hint: "Small and sweet" },
				{ value: "strawberry", label: "Strawberry", hint: "A summer favorite" },
			],
		}),
	);

	if (favoriteFruit) {
		console.log(`Great choice! ${String(favoriteFruit)} is delicious.`);
	} else {
		console.log("No selection made.");
	}
}

void main().catch(console.error);
