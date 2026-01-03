import { textPrompt } from "./input";

export async function multiselect<T>(options: {
	message: string;
	options: { value: T; label: string; group?: string }[];
	maxSelected?: number;
}): Promise<T[]> {
	// TODO: Implement multiselect functionality
	console.log(options.message);
	options.options.forEach((opt, i) => {
		console.log(`${i + 1}. ${opt.label}`);
	});

	const result = await textPrompt({
		message: "Enter selected numbers (comma separated):",
		validate: (value) => {
			const selected = value.split(",").map((num) => parseInt(num.trim()));

			if (selected.some(Number.isNaN)) {
				return "Please enter valid numbers";
			}

			if (options.maxSelected && selected.length > options.maxSelected) {
				return `You can select at most ${options.maxSelected} items`;
			}

			if (selected.some((num) => num < 1 || num > options.options.length)) {
				return `Please enter numbers between 1 and ${options.options.length}`;
			}
		},
	});

	const selectedIndices = result
		.split(",")
		.map((num) => parseInt(num.trim()) - 1);
	return selectedIndices
		.map((i) => options.options[i]?.value)
		.filter((v): v is T => v !== undefined);
}
