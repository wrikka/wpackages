import { usePrompt } from "@/context";
import { Box, Text, useInput } from "ink";

interface NumberPromptProps {
	message: string;
	min?: number;
	max?: number;
	step?: number;
}

export function NumberPrompt({ message, min, max, step = 1 }: NumberPromptProps) {
	const { value, setValue, submit } = usePrompt<number>();

	useInput((input, key) => {
		if (key.return) {
			submit(value);
		} else if (key.upArrow) {
			const newValue = value + step;
			if (max === undefined || newValue <= max) {
				setValue(newValue);
			}
		} else if (key.downArrow) {
			const newValue = value - step;
			if (min === undefined || newValue >= min) {
				setValue(newValue);
			}
		} else if (key.backspace) {
			const strValue = String(value);
			setValue(Number(strValue.slice(0, -1)) || 0);
		} else if (/\d/.test(input)) {
			const newValue = Number(String(value) + input);
			if (max === undefined || newValue <= max) {
				setValue(newValue);
			}
		}
	});

	return (
		<Box>
			<Text>{message}</Text>
			<Text color="cyan">{value}</Text>
		</Box>
	);
}
