import { Box, Text, useInput } from "ink";
import React from "react";
import { usePrompt, useTheme } from "../../lib/context";
import { PromptDescriptor, SliderPromptOptions } from "../../types";

export const SliderPromptComponent: React.FC<SliderPromptOptions> = ({
	message,
	min = 0,
	max = 100,
	step = 1,
	barWidth = 20,
}) => {
	const { value, setValue, submit } = usePrompt<number>();
	const theme = useTheme();

	useInput((_, key) => {
		if (key.return) {
			submit(value);
		} else if (key.rightArrow) {
			const newValue = Math.min(value + step, max);
			setValue(newValue);
		} else if (key.leftArrow) {
			const newValue = Math.max(value - step, min);
			setValue(newValue);
		}
	});

	const percentage = ((value - min) / (max - min)) * 100;
	const filledWidth = Math.round((percentage / 100) * barWidth);
	const emptyWidth = barWidth - filledWidth;

	const filledBar = "█".repeat(filledWidth);
	const emptyBar = "─".repeat(emptyWidth);

	return (
		<Box>
			<Text>{theme.colors.message(message)}</Text>
			<Text>{theme.colors.secondary("[")}</Text>
			<Text>{theme.colors.primary(filledBar)}</Text>
			<Text>{theme.colors.secondary(emptyBar)}</Text>
			<Text>{theme.colors.secondary("]")}</Text>
			<Text>{theme.colors.primary(String(value))}</Text>
		</Box>
	);
};

export const slider = (
	options: SliderPromptOptions,
): PromptDescriptor<number, SliderPromptOptions> => {
	return {
		Component: SliderPromptComponent,
		props: options,
		initialValue: options.initialValue ?? options.min ?? 0,
	};
};
