import type { TabsProps } from "../types/schema";
import { h } from "../types/vnode";

type TabsComponentProps = TabsProps;

export const Tabs = (
	props: TabsComponentProps,
): ReturnType<typeof h> => {
	const {
		tabs,
		selectedIndex = 0,
		color = "white",
		selectedColor = "blue",
		...rest
	} = props;

	const tabElements = tabs.map((tab, index) => {
		const isSelected = index === selectedIndex;
		const prefix = index > 0 ? " │ " : "";
		const suffix = index < tabs.length - 1 ? "" : " ";
		return h(
			"text",
			{ color: isSelected ? selectedColor : color, bold: isSelected },
			`${prefix}${tab}${suffix}`,
		);
	});

	return h("box", { ...rest, flexDirection: "row", borderStyle: "single", padding: { left: 1, right: 1 } }, ...tabElements);
};
