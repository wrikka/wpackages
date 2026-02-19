import { RADIO_SYMBOLS } from "../constant/widget.const";
import type { RadioProps } from "../types/schema";
import { h } from "../types/vnode";

type RadioComponentProps = RadioProps;

export const Radio = (props: RadioComponentProps): ReturnType<typeof h> => {
	const { options, selectedIndex = 0, color = "green", ...rest } = props;

	const children = options.map((option: string, index: number) => {
		const isSelected = index === selectedIndex;
		const symbol = isSelected
			? RADIO_SYMBOLS.selected
			: RADIO_SYMBOLS.unselected;
		return h(
			"box",
			{ flexDirection: "row", alignItems: "center" },
			h("text", { color, bold: isSelected }, `${symbol} ${option}`),
		);
	});

	return h("box", { ...rest, flexDirection: "column" }, ...children);
};
