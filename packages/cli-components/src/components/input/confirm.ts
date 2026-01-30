import { inputConfig } from "../../config/input.config";
import { CustomPrompt } from "./autocomplete";

export async function confirm({
	message,
	initialValue = inputConfig.confirm.initialValue,
}: {
	message: string;
	initialValue?: boolean;
}) {
	const prompt = new CustomPrompt();
	const result = await prompt.confirm({
		message,
		defaultValue: initialValue,
	});
	prompt.close();
	return result;
}
