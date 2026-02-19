import { Box, Text } from "ink";
import React from "react";
import { usePrompt, useTheme } from "../../lib/context";
import { useInput } from "../../lib/hooks";
import { NumberPromptOptions, PromptDescriptor } from "../../types";

export const NumberPromptComponent: React.FC<NumberPromptOptions> = ({ message, min, max, step = 1 }) => {
	const { value, setValue, submit } = usePrompt<number>();
	const theme = useTheme();

	useInput((input: string, key: any) => {
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
			<Text>{theme.colors.message(message)}</Text>
			<Text>{theme.colors.primary(String(value))}</Text>
		</Box>
	);
};

export const number = (
	options: NumberPromptOptions,
): PromptDescriptor<number, NumberPromptOptions> => {
	return {
		Component: NumberPromptComponent,
		props: options,
		initialValue: options.initialValue ?? 0,
	};
};
