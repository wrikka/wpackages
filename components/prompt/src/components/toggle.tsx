import { Box, Text, useInput } from "ink";
import React from "react";
import { usePrompt, useTheme } from "../context";
import { PromptDescriptor, TogglePromptOptions } from "../types";

export const TogglePromptComponent: React.FC<TogglePromptOptions> = ({ message, active = "On", inactive = "Off" }) => {
	const { value, setValue, submit } = usePrompt<boolean>();
	const theme = useTheme();

	useInput((input, key) => {
		if (key.return) {
			submit(value);
		} else if (key.leftArrow || key.rightArrow || input === " ") {
			setValue(!value);
		}
	});

	const activeText = `( ${active} )`;
	const inactiveText = `( ${inactive} )`;

	const toggle = value
		? `${theme.colors.primary(activeText)}${theme.colors.secondary("----")}`
		: `${theme.colors.secondary("----")}${theme.colors.primary(inactiveText)}`;

	return (
		<Box>
			<Text>{theme.colors.message(message)}</Text>
			<Text>{toggle}</Text>
		</Box>
	);
};

export const toggle = (
	options: TogglePromptOptions,
): PromptDescriptor<boolean, TogglePromptOptions> => {
	return {
		Component: TogglePromptComponent,
		props: options,
		initialValue: options.initialValue ?? false,
	};
};
