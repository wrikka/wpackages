import pc from "picocolors";
import { textPrompt } from "./prompt";

export async function text(options: {
	message: string;
	placeholder?: string;
	validate?: (value: string) => string | undefined;
}): Promise<string> {
	if (options.placeholder) {
		options.message = `${options.message} ${pc.dim(options.placeholder)}`;
	}

	const promptOptions: {
		message: string;
		validate?: (value: string) => string | undefined;
	} = {
		message: options.message,
	};

	if (options.validate) {
		promptOptions.validate = (value: string) => options.validate?.(value) || undefined;
	}

	return textPrompt(promptOptions);
}
