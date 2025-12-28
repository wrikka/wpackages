import { usePrompt } from "@/context";
import { Box, Text, useInput } from "ink";
import { useState } from "react";

interface TimePromptProps {
	message: string;
}

export function TimePrompt({ message }: TimePromptProps) {
	const { submit } = usePrompt<Date>();
	const [time, setTime] = useState(new Date());
	const [activePart, setActivePart] = useState<"h" | "m" | "s">("h");

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

	return (
		<Box>
			<Text>{message}</Text>
			<Text color={activePart === "h" ? "cyan" : "gray"}>{format(time.getHours())}</Text>
			<Text>:</Text>
			<Text color={activePart === "m" ? "cyan" : "gray"}>{format(time.getMinutes())}</Text>
			<Text>:</Text>
			<Text color={activePart === "s" ? "cyan" : "gray"}>{format(time.getSeconds())}</Text>
		</Box>
	);
}
