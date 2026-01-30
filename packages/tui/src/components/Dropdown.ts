import { DROPDOWN_ARROW } from "../constant/widget.const";
import type { DropdownProps } from "../types/schema";
import { h } from "../types/vnode";

type DropdownComponentProps = DropdownProps;

export const Dropdown = (
	props: DropdownComponentProps,
): ReturnType<typeof h> => {
	const {
		items,
		placeholder = "Select...",
		isOpen = false,
		selectedIndex = -1,
		color = "white",
		...rest
	} = props;

	const selectedItem =
		selectedIndex >= 0 && selectedIndex < items.length
			? items[selectedIndex]
			: null;
	const displayText = selectedItem ?? placeholder;
	const arrow = isOpen ? DROPDOWN_ARROW.open : DROPDOWN_ARROW.closed;

	const children = [
		h(
			"box",
			{
				flexDirection: "row",
				borderStyle: "single",
				borderColor: color,
				padding: { left: 1, right: 1 },
			},
			h("text", { color }, `${displayText} ${arrow}`),
		),
	];

	if (isOpen) {
		const itemsList = items.map((item: string, index: number) => {
			const isSelected = index === selectedIndex;
			return h(
				"box",
				{ flexDirection: "row", padding: { left: 1 } },
				h(
					"text",
					{ color: isSelected ? "blue" : color, bold: isSelected },
					`${isSelected ? "► " : "  "}${item}`,
				),
			);
		});
		children.push(
			h(
				"box",
				{ flexDirection: "column", borderStyle: "single", borderColor: color },
				...itemsList,
			),
		);
	}

	return h("box", { ...rest, flexDirection: "column" }, ...children);
};
