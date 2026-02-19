import { Box, Text } from "ink";
import picocolors from "picocolors";
import React from "react";
import { usePrompt, useTheme } from "../../lib/context";
import { useInput } from "../../lib/hooks";
import { PromptDescriptor, TextPromptOptions } from "../../types";

export const TextPromptComponent: React.FC<TextPromptOptions> = ({ message, placeholder }) => {
	const { value, setValue, state, submit } = usePrompt<string>();
	const theme = useTheme();

	useInput((input: string, key: any) => {
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
		inputText = theme.colors.placeholder(placeholder);
	} else {
		inputText = theme.colors.value(value);
	}

	return (
		<Box>
			<Text>{theme.colors.message(message)}</Text>
			{state === "active" && <Text>{inputText}{picocolors.inverse(theme.colors.value("_"))}</Text>}
			{state === "submitted" && <Text>{theme.colors.value(value)}</Text>}
		</Box>
	);
};

export const text = (options: TextPromptOptions): PromptDescriptor<string, TextPromptOptions> => {
	return {
		Component: TextPromptComponent,
		props: options,
		initialValue: options.initialValue ?? "",
	};
};
