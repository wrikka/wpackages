import { Box, Text, useInput } from "ink";
import picocolors from "picocolors";
import React from "react";
import { usePrompt, useTheme } from "../context";
import { DatePromptOptions, PromptDescriptor } from "../types";

const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getDay = (year: number, month: number, day: number) => new Date(year, month, day).getDay();

export const DatePromptComponent: React.FC<DatePromptOptions> = ({ message }) => {
	const { value: currentDate, setValue: setCurrentDate, submit } = usePrompt<Date>();
	const theme = useTheme();

	useInput((_, key) => {
		if (key.return) {
			submit(currentDate);
		} else {
			const newDate = new Date(currentDate);
			if (key.leftArrow) newDate.setDate(newDate.getDate() - 1);
			if (key.rightArrow) newDate.setDate(newDate.getDate() + 1);
			if (key.upArrow) newDate.setDate(newDate.getDate() - 7);
			if (key.downArrow) newDate.setDate(newDate.getDate() + 7);
			setCurrentDate(newDate);
		}
	});

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const day = currentDate.getDate();

	const monthDays = daysInMonth(year, month);
	const firstDay = getDay(year, month, 1);

	const calendar = [];
	let week = Array(7).fill("  ");

	for (let i = 1; i <= monthDays; i++) {
		const dayIndex = (firstDay + i - 1) % 7;
		week[dayIndex] = i < 10 ? ` ${i}` : `${i}`;
		if (dayIndex === 6 || i === monthDays) {
			calendar.push(week);
			week = Array(7).fill("  ");
		}
	}

	return (
		<Box flexDirection="column">
			<Text>{theme.colors.message(message)}</Text>
			<Text>{theme.colors.primary(currentDate.toDateString())}</Text>
			<Box flexDirection="column" marginTop={1}>
				<Box>
					<Text>{theme.colors.secondary("Su Mo Tu We Th Fr Sa")}</Text>
				</Box>
				{calendar.map((week, weekIndex) => (
					<Box key={weekIndex}>
						{week.map((d, dayIndex) => {
							const isSelected = Number(d) === day;
							const coloredDay = isSelected ? picocolors.inverse(theme.colors.primary(d)) : theme.colors.secondary(d);
							return (
								<Text key={dayIndex}>
									{coloredDay}
									{" "}
								</Text>
							);
						})}
					</Box>
				))}
			</Box>
		</Box>
	);
};

export const date = (
	options: DatePromptOptions,
): PromptDescriptor<Date, DatePromptOptions> => {
	return {
		Component: DatePromptComponent,
		props: options,
		initialValue: options.initialValue ?? new Date(),
	};
};
