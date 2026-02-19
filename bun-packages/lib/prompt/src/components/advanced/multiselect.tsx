import { Box, Text } from "ink";
import React, { useState } from "react";
import { usePrompt } from "../../lib/context";
import { useInput } from "../../lib/hooks";
import { MultiSelectPromptOptions, PromptDescriptor } from "../../types";

export const MultiSelectPromptComponent = <T,>({ message, options }: MultiSelectPromptOptions<T>) => {
	const { submit } = usePrompt<T[]>();
	const [activeIndex, setActiveIndex] = useState(0);
	const [selectedValues, setSelectedValues] = useState<T[]>([]);

	useInput((input: string, key: any) => {
		if (key.return) {
			submit(selectedValues);
		} else if (key.upArrow) {
			setActiveIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
		} else if (key.downArrow) {
			setActiveIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
		} else if (input === " ") {
			const currentOption = options[activeIndex];
			if (!currentOption) return;
			const currentValue = currentOption.value;
			const newSelectedValues = selectedValues.includes(currentValue)
				? selectedValues.filter(v => v !== currentValue)
				: [...selectedValues, currentValue];
			setSelectedValues(newSelectedValues);
		}
	});

	return (
		<Box flexDirection="column">
			<Text>{message}</Text>
			{options.map((option, index) => {
				const isSelected = selectedValues.includes(option.value);
				const isActive = activeIndex === index;
				return (
					<Box key={index}>
						<Text color={isActive ? "cyan" : "gray"}>
							{isActive ? "❯" : " "} {isSelected ? "◉" : "◯"} {option.label}
						</Text>
						{option.hint && <Text color="gray">({option.hint})</Text>}
					</Box>
				);
			})}
		</Box>
	);
};

export const multiselect = <T,>(
	options: MultiSelectPromptOptions<T>,
): PromptDescriptor<T[], MultiSelectPromptOptions<T>> => {
	return {
		Component: MultiSelectPromptComponent as React.FC<MultiSelectPromptOptions<T>>,
		props: options,
		initialValue: options.initialValue ?? [],
	};
};
