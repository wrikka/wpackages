import { Box, Text } from "ink";
import React, { useState } from "react";
import { usePrompt, useTheme } from "../../lib/context";
import { useInput } from "../../lib/hooks";
import { PromptDescriptor, SelectPromptOptions } from "../../types";

export const SelectPromptComponent = <T,>({ message, options }: SelectPromptOptions<T>) => {
	const { submit } = usePrompt<T>();
	const [activeIndex, setActiveIndex] = useState(0);
	const theme = useTheme();

	useInput((_input: string, key: any) => {
		if (key.return) {
			if (options[activeIndex]) {
				submit(options[activeIndex].value);
			}
		} else if (key.upArrow) {
			setActiveIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
		} else if (key.downArrow) {
			setActiveIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
		}
	});

	return (
		<Box flexDirection="column">
			<Text>{theme.colors.message(message)}</Text>
			{options.map((option, index) => {
				const isSelected = activeIndex === index;
				const pointer = isSelected ? theme.symbols.pointer : " ";
				const label = `${pointer} ${option.label}`;
				const coloredLabel = isSelected ? theme.colors.primary(label) : theme.colors.secondary(label);

				return (
					<Box key={index}>
						<Text>{coloredLabel}</Text>
						{option.hint && <Text>{theme.colors.secondary(`(${option.hint})`)}</Text>}
					</Box>
				);
			})}
		</Box>
	);
};

export const select = <T,>(
	options: SelectPromptOptions<T>,
): PromptDescriptor<T, SelectPromptOptions<T>> => {
	const initialValue = options.initialValue ?? options.options[0]?.value ?? null;
	return {
		Component: SelectPromptComponent as React.FC<SelectPromptOptions<T>>,
		props: options,
		initialValue: initialValue as T,
	};
};
