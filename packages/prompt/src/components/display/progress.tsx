import { Box, Text } from "ink";
import React, { useEffect, useState } from "react";
import { useTheme } from "../../lib/context";
import type { ProgressOptions, ProgressState } from "../../types/progress";

export const ProgressComponent: React.FC<ProgressOptions> = ({
	message,
	total,
	current: initialCurrent = 0,
	style = "bar",
	width = 40,
	showPercentage = true,
	showETA = true,
	showRemaining = false,
}) => {
	const theme = useTheme();
	const [state, setState] = useState<ProgressState>({
		current: initialCurrent,
		total,
		startTime: null,
		elapsed: 0,
		eta: null,
	});

	useEffect(() => {
		setState((prev) => {
			const now = Date.now();
			const startTime = prev.startTime ?? now;
			const elapsed = now - startTime;
			const progress = initialCurrent / total;
			const eta = progress > 0 ? (elapsed / progress) * (1 - progress) : null;

			return {
				...prev,
				current: initialCurrent,
				total,
				startTime,
				elapsed,
				eta,
			};
		});
	}, [initialCurrent, total]);

	const progress = state.current / state.total;
	const percentage = Math.round(progress * 100);

	const formatTime = (ms: number): string => {
		const seconds = Math.floor(ms / 1000);
		if (seconds < 60) return `${seconds}s`;
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}m ${remainingSeconds}s`;
	};

	const renderBar = () => {
		const filled = Math.round(width * progress);
		const empty = width - filled;
		const bar = theme.colors.complete("█".repeat(filled))
			+ theme.colors.incomplete("░".repeat(empty));
		return bar;
	};

	const renderDots = () => {
		const totalDots = 10;
		const filled = Math.round(totalDots * progress);
		const dots = theme.colors.complete("●".repeat(filled))
			+ theme.colors.inactive("○".repeat(totalDots - filled));
		return dots;
	};

	const renderSpinner = () => {
		const chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
		const index = Math.floor((Date.now() / 100) % chars.length);
		return theme.colors.complete(chars[index]);
	};

	const renderProgress = () => {
		switch (style) {
			case "bar":
				return renderBar();
			case "dots":
				return renderDots();
			case "spinner":
				return renderSpinner();
			case "percentage":
				return theme.colors.percentage(`${percentage}%`);
			default:
				return renderBar();
		}
	};

	return (
		<Box flexDirection="column">
			{message && (
				<Text>
					{theme.colors.message(message)}
				</Text>
			)}
			<Box>
				<Text>{renderProgress()}</Text>
				{showPercentage && (
					<Text>
						{" "}
						{theme.colors.percentage(`${percentage}%`)}
					</Text>
				)}
				{showRemaining && (
					<Text>
						{" "}
						{theme.colors.eta(`${state.current}/${state.total}`)}
					</Text>
				)}
			</Box>
			{showETA && state.eta !== null && progress > 0 && progress < 1 && (
				<Text>
					{theme.colors.eta(`ETA: ${formatTime(state.eta)}`)}
				</Text>
			)}
		</Box>
	);
};

export const progress = (
	options: ProgressOptions,
): ProgressOptions => options;
