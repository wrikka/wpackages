import fs from "fs/promises";
import { Box, Text } from "ink";
import path from "path";
import React, { useEffect, useState } from "react";
import { usePrompt, useTheme } from "../../lib/context";
import { useInput } from "../../lib/hooks";
import { FileSystemPromptOptions, PromptDescriptor } from "../../types";

export const FileSystemPromptComponent: React.FC<FileSystemPromptOptions> = ({ message, root = "." }) => {
	const { submit } = usePrompt<string>();
	const [currentPath, setCurrentPath] = useState(path.resolve(root));
	const [entries, setEntries] = useState<string[]>([]);
	const [activeIndex, setActiveIndex] = useState(0);
	const theme = useTheme();

	useEffect(() => {
		const readDir = async () => {
			try {
				const dirEntries = await fs.readdir(currentPath, { withFileTypes: true });
				const entryNames = dirEntries.map(entry => entry.isDirectory() ? `${entry.name}/` : entry.name);
				setEntries(["../", ...entryNames]);
				setActiveIndex(0);
			} catch (error) {
				// Handle error, e.g., permission denied
				setEntries(["../", error instanceof Error ? error.message : "Error reading directory"]);
			}
		};
		readDir().catch(() => {
		});
	}, [currentPath]);

	useInput((_input: string, key: any) => {
		if (key.return) {
			const selectedEntry = entries[activeIndex];
			if (!selectedEntry) return;

			const newPath = path.resolve(currentPath, selectedEntry);
			fs
				.stat(newPath)
				.then(stats => {
					if (stats.isDirectory()) {
						setCurrentPath(newPath);
					} else {
						submit(newPath);
					}
				})
				.catch(() => {
					setEntries(["../", "Error reading entry"]);
				});
		} else if (key.upArrow) {
			setActiveIndex(prev => (prev > 0 ? prev - 1 : entries.length - 1));
		} else if (key.downArrow) {
			setActiveIndex(prev => (prev < entries.length - 1 ? prev + 1 : 0));
		}
	});

	return (
		<Box flexDirection="column">
			<Text>{theme.colors.message(message)}</Text>
			<Text color="gray">Current: {currentPath}</Text>
			<Box flexDirection="column" marginTop={1}>
				{entries.map((entry, index) => {
					const isSelected = activeIndex === index;
					return (
						<Text key={`${entry}-${index}`} color={isSelected ? "cyan" : "white"}>
							{isSelected ? "❯ " : "  "}
							{entry}
						</Text>
					);
				})}
			</Box>
		</Box>
	);
};

export const filesystem = (options: FileSystemPromptOptions): PromptDescriptor<string, FileSystemPromptOptions> => {
	return {
		Component: FileSystemPromptComponent,
		props: options,
		initialValue: options.initialValue ?? process.cwd(),
	};
};
