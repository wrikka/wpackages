import { Box, Text } from "ink";
import React from "react";
import { usePrompt, useTheme } from "../../lib/context";
import { useInput } from "../../lib/hooks";
import { ConfirmPromptOptions, PromptDescriptor } from "../../types";

export const ConfirmPromptComponent: React.FC<ConfirmPromptOptions> = (
	{ message, positive = "Yes", negative = "No" },
) => {
	const { value, setValue, submit } = usePrompt<boolean>();
	const theme = useTheme();

	useInput((_input: string, key: any) => {
		if (key.return) {
			submit(value);
		} else if (key.leftArrow || key.rightArrow) {
			setValue(!value);
		}
	});

	const positiveLabel = `${value ? theme.symbols.radioOn : theme.symbols.radioOff} ${positive}`;
	const negativeLabel = `${!value ? theme.symbols.radioOn : theme.symbols.radioOff} ${negative}`;

	return (
		<Box>
			<Text>{theme.colors.message(message)}</Text>
			<Text>{value ? theme.colors.primary(positiveLabel) : theme.colors.secondary(positiveLabel)}</Text>
			<Text>{theme.colors.secondary(" / ")}</Text>
			<Text>{!value ? theme.colors.primary(negativeLabel) : theme.colors.secondary(negativeLabel)}</Text>
		</Box>
	);
};

export const confirm = (
	options: ConfirmPromptOptions,
): PromptDescriptor<boolean, ConfirmPromptOptions> => {
	return {
		Component: ConfirmPromptComponent,
		props: options,
		initialValue: options.initialValue ?? false,
	};
};
