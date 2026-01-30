import { Box, Text, useInput } from "ink";
import React, { useState } from "react";
import { usePrompt, useTheme } from "../../lib/context";
import { PromptDescriptor, TimePromptOptions } from "../../types";

export const TimePromptComponent: React.FC<TimePromptOptions> = ({ message }) => {
	const { value: time, setValue: setTime, submit } = usePrompt<Date>();
	const [activePart, setActivePart] = useState<"h" | "m" | "s">("h");
	const theme = useTheme();

	useInput((_, key) => {
		if (key.return) {
			submit(time);
		} else {
			const newTime = new Date(time);
			if (key.leftArrow) {
				setActivePart(p => (p === "h" ? "s" : p === "m" ? "h" : "m"));
			} else if (key.rightArrow) {
				setActivePart(p => (p === "h" ? "m" : p === "m" ? "s" : "h"));
			} else if (key.upArrow) {
				if (activePart === "h") newTime.setHours(newTime.getHours() + 1);
				if (activePart === "m") newTime.setMinutes(newTime.getMinutes() + 1);
				if (activePart === "s") newTime.setSeconds(newTime.getSeconds() + 1);
			} else if (key.downArrow) {
				if (activePart === "h") newTime.setHours(newTime.getHours() - 1);
				if (activePart === "m") newTime.setMinutes(newTime.getMinutes() - 1);
				if (activePart === "s") newTime.setSeconds(newTime.getSeconds() - 1);
			}
			setTime(newTime);
		}
	});

	const format = (num: number) => num.toString().padStart(2, "0");

	const h = format(time.getHours());
	const m = format(time.getMinutes());
	const s = format(time.getSeconds());

	return (
		<Box>
			<Text>{theme.colors.message(message)}</Text>
			<Text>{activePart === "h" ? theme.colors.primary(h) : theme.colors.secondary(h)}</Text>
			<Text>{theme.colors.secondary(":")}</Text>
			<Text>{activePart === "m" ? theme.colors.primary(m) : theme.colors.secondary(m)}</Text>
			<Text>{theme.colors.secondary(":")}</Text>
			<Text>{activePart === "s" ? theme.colors.primary(s) : theme.colors.secondary(s)}</Text>
		</Box>
	);
};

export const time = (
	options: TimePromptOptions,
): PromptDescriptor<Date, TimePromptOptions> => {
	return {
		Component: TimePromptComponent,
		props: options,
		initialValue: options.initialValue ?? new Date(),
	};
};
