import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { useEffect } from "react";
import { usePrompt, useTheme } from "../context";
import { PromptDescriptor, SpinnerPromptOptions } from "../types";

export const SpinnerComponent = <T,>({ message, type = "dots", action }: SpinnerPromptOptions<T>) => {
	const { submit } = usePrompt<T>();
	const theme = useTheme();

	useEffect(() => {
		let isCancelled = false;
		(async () => {
			try {
				const result = await action();
				if (!isCancelled) {
					submit(result);
				}
			} catch {
				if (!isCancelled) {
					submit(undefined as any);
				}
			}
		})();

		return () => {
			isCancelled = true;
		};
	}, [action, submit]);

	return (
		<Box>
			<Text color={theme.colors.primary(" ")}>
				<Spinner type={type} />
			</Text>
			<Box marginLeft={1}>
				<Text>{theme.colors.message(message)}</Text>
			</Box>
		</Box>
	);
};

export const spinner = <T,>(
	options: SpinnerPromptOptions<T>,
): PromptDescriptor<T, SpinnerPromptOptions<T>> => {
	return {
		Component: SpinnerComponent,
		props: options,
		initialValue: undefined as any, // The value will come from the async action
	};
};
