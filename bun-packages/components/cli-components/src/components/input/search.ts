import { AutocompletePrompt } from "./autocomplete";

export async function search<T>({
	message,
	options,
}: {
	message: string;
	options: { value: T; label: string }[];
}): Promise<T> {
	const selected = await AutocompletePrompt({
		message,
		choices: options.map((opt) => opt.label),
	});

	const found = options.find(
		(opt) =>
			opt.label === (selected as { render: () => string }).render?.()
			|| selected,
	);
	if (!found) {
		throw new Error("Option not found");
	}
	return found.value;
}

export { AutocompletePrompt as searchPrompt } from "./autocomplete";
