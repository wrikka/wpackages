import { prompt, usePrompt } from "@/context";
import { Box, Text, useInput } from "ink";
import { useState } from "react";

interface Option<T> {
	value: T;
	label: string;
	hint?: string;
}

export interface SelectPromptProps<T> {
	message: string;
	options: Option<T>[];
}

export function SelectPrompt<T>({ message, options }: SelectPromptProps<T>) {
	const { submit } = usePrompt<T>();
	const [activeIndex, setActiveIndex] = useState(0);

	useInput((_, key) => {
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
			<Text>{message}</Text>
			{options.map((option, index) => (
				<Box key={option.label}>
					<Text color={activeIndex === index ? "cyan" : "gray"}>
						{activeIndex === index ? "❯" : " "} {option.label}
					</Text>
					{option.hint && <Text color="gray">({option.hint})</Text>}
				</Box>
			))}
		</Box>
	);
}

export const select = <T,>(options: SelectPromptProps<T>) => {
	// The prompt function requires an initial value, even if the component doesn't use it.
	// We'll use the first option's value as a default.
	const initialValue = options.options[0]?.value ?? null;
	return prompt(SelectPrompt<T>, options, initialValue as T);
};
