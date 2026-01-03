import { Box, Text } from "ink";
import React from "react";
import { usePrompt, useTheme } from "../context";
import { useInput } from "../hooks";
import { PasswordPromptOptions, PromptDescriptor } from "../types";

export const PasswordPromptComponent: React.FC<PasswordPromptOptions> = ({ message }) => {
	const { value, setValue, submit, state } = usePrompt<string>();
	const theme = useTheme();

	useInput((input, key) => {
		if (key.return) {
			submit(value);
		} else if (key.backspace) {
			setValue(value.slice(0, -1));
		} else {
			setValue(value + input);
		}
	});

	const maskedValue = "*".repeat(value.length);

	return (
		<Box>
			<Text>{theme.colors.message(message)}</Text>
			{state === "submitted"
				? <Text>{theme.colors.primary(maskedValue)}</Text>
				: <Text>{theme.colors.secondary(maskedValue)}</Text>}
		</Box>
	);
};

export const password = (
	options: PasswordPromptOptions,
): PromptDescriptor<string, PasswordPromptOptions> => {
	return {
		Component: PasswordPromptComponent,
		props: options,
		initialValue: options.initialValue ?? "",
	};
};
