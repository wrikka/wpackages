import { Box, Text } from "ink";
import React, { useState } from "react";
import { usePrompt, useTheme } from "../../lib/context";
import { useInput } from "../../lib/hooks";
import { PromptDescriptor, TablePromptOptions, TableRow } from "../../types";

const getColumnWidths = (headers: string[], rows: TableRow<any>[]) => {
	const widths = headers.map(h => h.length);
	rows.forEach(row => {
		Object.values(row.data).forEach((value, i) => {
			const len = String(value).length;
			const current = widths[i] ?? 0;
			if (len > current) {
				widths[i] = len;
			}
		});
	});
	return widths;
};

export const TablePromptComponent = <T,>({ message, headers, rows }: TablePromptOptions<T>) => {
	const { submit } = usePrompt<T>();
	const [activeIndex, setActiveIndex] = useState(0);
	const theme = useTheme();
	const columnWidths = getColumnWidths(headers, rows);

	useInput((_input: string, key: any) => {
		if (key.return) {
			if (rows[activeIndex]) {
				submit(rows[activeIndex].value);
			}
		} else if (key.upArrow) {
			setActiveIndex(prev => (prev > 0 ? prev - 1 : rows.length - 1));
		} else if (key.downArrow) {
			setActiveIndex(prev => (prev < rows.length - 1 ? prev + 1 : 0));
		}
	});

	const renderRow = (rowData: (string | number)[], isHeader = false, isSelected = false) => {
		const style = isHeader ? theme.colors.primary : (isSelected ? theme.colors.primary : theme.colors.secondary);
		return (
			<Box>
				{rowData.map((cell, i) => {
					const width = (columnWidths[i] ?? 0) + 2;
					return <Text key={i}>{style(String(cell).padEnd(width))}</Text>;
				})}
			</Box>
		);
	};

	return (
		<Box flexDirection="column">
			<Text>{theme.colors.message(message)}</Text>
			<Box flexDirection="column" marginTop={1}>
				{renderRow(headers, true)}
				{rows.map((row, index) => {
					const isSelected = activeIndex === index;
					const rowData = headers.map(h => row.data[h] ?? "");
					return (
						<Box key={index}>
							<Text>{isSelected ? theme.symbols.pointer : "  "}</Text>
							{renderRow(rowData, false, isSelected)}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
};

export const table = <T,>(options: TablePromptOptions<T>): PromptDescriptor<T, TablePromptOptions<T>> => {
	return {
		Component: TablePromptComponent as React.FC<TablePromptOptions<T>>,
		props: options,
		initialValue: (options.initialValue ?? options.rows[0]?.value ?? null) as T,
	};
};
