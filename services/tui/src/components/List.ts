import type { ListProps } from "../types/schema";
import { h } from "../types/vnode";

type ListComponentProps = ListProps;

export const List = (props: ListComponentProps): ReturnType<typeof h> => {
	const {
		items,
		selectedIndex = 0,
		showScrollbar: _showScrollbar = false,
		color = "white",
		selectedColor = "blue",
		...rest
	} = props;

	const children = items.map((item, index) => {
		const isSelected = index === selectedIndex;
		const prefix = isSelected ? "► " : "  ";
		return h(
			"box",
			{ flexDirection: "row", padding: { left: 1 } },
			h(
				"text",
				{ color: isSelected ? selectedColor : color, bold: isSelected },
				`${prefix}${item}`,
			),
		);
	});

	return h("box", { ...rest, flexDirection: "column" }, ...children);
};
