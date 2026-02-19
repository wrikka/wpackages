import { selectPrompt } from "./input";

export async function select<T>(options: {
	message: string;
	options: { value: T; label: string; group?: string }[];
	initialValue?: T;
}): Promise<T> {
	const formattedOptions = options.options.map((opt) => ({
		name: opt.group ? `${opt.group} > ${opt.label}` : opt.label,
		value: opt.value,
	}));

	return selectPrompt({
		message: options.message,
		choices: formattedOptions,
	});
}
