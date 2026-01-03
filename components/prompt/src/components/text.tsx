import { prompt, usePrompt } from "@/context";
import { useInput } from "@/hooks";
import { theme } from "@/services";
import { TextPromptOptions } from "@/types";
import { Box, Text } from "ink";
import React from "react";

const TextPromptComponent: React.FC<TextPromptOptions> = ({ message, placeholder }) => {
	const { value, setValue, state, submit } = usePrompt<string>();

	useInput((input, key) => {
		if (key.return) {
			submit(value);
			return;
		}
		if (key.backspace || key.delete) {
			setValue(value.slice(0, -1));
			return;
		}
		if (input) {
			setValue(value + input);
		}
	});

	let inputText = value;
	if (state === "active" && !value && placeholder) {
		inputText = theme.placeholder(placeholder);
	} else {
		inputText = theme.value(value);
	}

	return (
		<Box>
			<Text>{theme.message(message)}</Text>
			{state === "active" && <Text>{inputText}{theme.cursor(theme.value("_"))}</Text>}
			{state === "submitted" && <Text>{theme.value(value)}</Text>}
		</Box>
	);
};

export const text = (options: TextPromptOptions) => {
	return prompt(TextPromptComponent, options, options.initialValue ?? "");
};
