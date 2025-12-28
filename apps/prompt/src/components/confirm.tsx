import { usePrompt } from "@/context";
import { Box, Text, useInput } from "ink";

interface ConfirmPromptProps {
	message: string;
	positive?: string;
	negative?: string;
}

export function ConfirmPrompt({ message, positive = "Yes", negative = "No" }: ConfirmPromptProps) {
	const { value, setValue, submit } = usePrompt<boolean>();

	useInput((_, key) => {
		if (key.return) {
			submit(value);
		} else if (key.leftArrow || key.rightArrow) {
			setValue(!value);
		}
	});

	return (
		<Box>
			<Text>{message}</Text>
			<Text color={value ? "cyan" : "gray"}>{positive}</Text>
			<Text>/</Text>
			<Text color={!value ? "cyan" : "gray"}>{negative}</Text>
		</Box>
	);
}
