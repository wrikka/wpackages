import * as p from "@clack/prompts";
import type { Option } from "@clack/prompts";

export async function multiselect<T extends string | number | boolean>(
	options: {
		message: string;
		options: Option<T>[];
		initialValues?: T[];
		required?: boolean;
	},
): Promise<T[]> {
	const result = await p.multiselect({
		message: options.message,
		options: options.options,
		initialValues: options.initialValues,
		required: options.required,
	});

	if (p.isCancel(result)) {
		p.cancel("Operation cancelled.");
		return process.exit(0);
	}

	return result;
}
