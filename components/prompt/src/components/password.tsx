import { usePrompt } from "@/context";
import { Box, Text, useInput } from "ink";

interface PasswordPromptProps {
	message: string;
}

export function PasswordPrompt({ message }: PasswordPromptProps) {
	const { value, setValue, submit, state } = usePrompt<string>();

	useInput((input, key) => {
		if (key.return) {
			submit(value);
		} else if (key.backspace) {
			setValue(value.slice(0, -1));
		} else {
			setValue(value + input);
		}
	});

	return (
		<Box>
			<Text>{message}</Text>
			{state === "submitted"
				? <Text color="cyan">{"*".repeat(value.length)}</Text>
				: <Text color="gray">{"*".repeat(value.length)}</Text>}
		</Box>
	);
}
