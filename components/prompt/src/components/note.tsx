import { Box, Text } from "ink";
import React from "react";
import { usePrompt, useTheme } from "../context";
import { useInput } from "../hooks";
import { NotePromptOptions, PromptDescriptor } from "../types";

export const NoteComponent: React.FC<NotePromptOptions> = ({ title, message, type: noteType = "info" }) => {
	const { submit } = usePrompt<undefined>();
	const theme = useTheme();

	useInput((_, key) => {
		if (key.return) {
			submit(undefined);
		}
	});

	const typeSymbolMap = {
		info: theme.symbols.info,
		success: theme.symbols.check,
		warning: theme.symbols.warning,
		error: theme.symbols.cross,
	};

	const typeColorMap = {
		info: theme.colors.info,
		success: theme.colors.success,
		warning: theme.colors.warning,
		error: theme.colors.error,
	};

	const symbol = typeSymbolMap[noteType];
	const colorFn = typeColorMap[noteType];

	return (
		<Box borderStyle="round" borderColor={colorFn(" ")} paddingX={1} flexDirection="column">
			<Box>
				<Text>{colorFn(symbol)}</Text>
				{title && <Text bold>{title}</Text>}
			</Box>
			<Text>{message}</Text>
		</Box>
	);
};

export const note = (
	options: NotePromptOptions,
): PromptDescriptor<undefined, NotePromptOptions> => {
	return {
		Component: NoteComponent,
		props: options,
		initialValue: undefined,
	};
};
