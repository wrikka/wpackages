import { Box, Text, useInput } from "ink";
import React, { useEffect, useState } from "react";
import { usePrompt, useTheme } from "../../lib/context";
import { AutocompletePromptOptions, Option, PromptDescriptor } from "../../types";

export const AutocompletePromptComponent = <T,>(
	{ message, options, placeholder = "" }: AutocompletePromptOptions<T>,
) => {
	const { submit } = usePrompt<T>();
	const [inputValue, setInputValue] = useState("");
	const [filteredOptions, setFilteredOptions] = useState(options);
	const [activeIndex, setActiveIndex] = useState(0);
	const theme = useTheme();

	useEffect(() => {
		const newFilteredOptions = options.filter((option: Option<T>) =>
			option.label.toLowerCase().includes(inputValue.toLowerCase())
		);
		setFilteredOptions(newFilteredOptions);
		setActiveIndex(0); // Reset index when filter changes
	}, [inputValue, options]);

	useInput((input, key) => {
		if (key.return) {
			if (filteredOptions.length > 0) {
				if (filteredOptions[activeIndex]) {
					submit(filteredOptions[activeIndex].value);
				}
			}
		} else if (key.upArrow) {
			setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
		} else if (key.downArrow) {
			setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
		} else if (key.backspace) {
			setInputValue(prev => prev.slice(0, -1));
		} else {
			// Ignore special keys like arrows
			if (key.upArrow || key.downArrow || key.leftArrow || key.rightArrow) return;
			setInputValue(prev => prev + input);
		}
	});

	return (
		<Box flexDirection="column">
			<Box>
				<Text>{theme.colors.primary("?")}</Text>
				<Text>{theme.colors.message(message)}</Text>
			</Box>

			<Box marginTop={1}>
				<Text>{theme.colors.primary(theme.symbols.pointer)}</Text>
				<Text>{inputValue || theme.colors.placeholder(placeholder)}</Text>
			</Box>

			<Box flexDirection="column" marginTop={1}>
				{filteredOptions.slice(0, 5).map((option: Option<T>, index: number) => {
					const isSelected = activeIndex === index;
					const radio = isSelected ? theme.symbols.radioOn : theme.symbols.radioOff;
					const label = `${radio} ${option.label}`;
					const coloredLabel = isSelected ? theme.colors.primary(label) : theme.colors.secondary(label);

					return (
						<Box key={index}>
							<Text>{coloredLabel}</Text>
							{option.hint && isSelected && <Text>{theme.colors.secondary(`- ${option.hint}`)}</Text>}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};

export const autocomplete = <T,>(
	options: AutocompletePromptOptions<T>,
): PromptDescriptor<T, AutocompletePromptOptions<T>> => {
	const initialValue = options.initialValue ?? options.options[0]?.value ?? null;
	return {
		Component: AutocompletePromptComponent as React.FC<AutocompletePromptOptions<T>>,
		props: options,
		initialValue: initialValue as T,
	};
};
