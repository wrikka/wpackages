import type { TableProps } from "../types/schema";
import { h } from "../types/vnode";

type TableComponentProps = TableProps;

export const Table = (
	props: TableComponentProps,
): ReturnType<typeof h> => {
	const {
		headers,
		rows,
		selectedIndex = -1,
		showBorders = true,
		showScrollbar: _showScrollbar = false,
		headerColor = "cyan",
		selectedColor = "blue",
		...rest
	} = props;

	const headerRow = h(
		"box",
		{ flexDirection: "row", borderStyle: showBorders ? "single" : undefined, borderColor: headerColor },
		...headers.map((header) =>
			h("text", { color: headerColor, bold: true }, ` ${header} `),
		),
	);

	const dataRows = rows.map((row, rowIndex) => {
		const isSelected = rowIndex === selectedIndex;
		return h(
			"box",
			{ flexDirection: "row", borderStyle: showBorders ? "single" : undefined, borderColor: isSelected ? selectedColor : undefined },
			...row.map((cell) =>
				h("text", { color: isSelected ? selectedColor : "white", bold: isSelected }, ` ${cell} `),
			),
		);
	});

	return h("box", { ...rest, flexDirection: "column" }, headerRow, ...dataRows);
};
