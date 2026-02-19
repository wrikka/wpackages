import type { ScrollbarProps } from "../types/schema";
import { h } from "../types/vnode";
import { SCROLLBAR_CHARS } from "../constant/widget.const";

type ScrollbarComponentProps = ScrollbarProps;

export const Scrollbar = (
	props: ScrollbarComponentProps,
): ReturnType<typeof h> => {
	const {
		position,
		total,
		visible,
		color = "cyan",
		backgroundColor: _backgroundColor = "gray",
		...rest
	} = props;

	const height = 10;
	const thumbSize = Math.min(
		Math.max(Math.floor((visible / total) * height), 1),
		height,
	);
	const thumbPosition = Math.min(
		Math.floor((position / (total - visible)) * (height - thumbSize)),
		height - thumbSize,
	);

	const scrollbar: string[] = [];

	for (let i = 0; i < height; i++) {
		if (i >= thumbPosition && i < thumbPosition + thumbSize) {
			scrollbar.push(SCROLLBAR_CHARS.thumb);
		} else {
			scrollbar.push(SCROLLBAR_CHARS.track);
		}
	}

	return h(
		"box",
		{
			...rest,
			flexDirection: "column",
			borderStyle: "single",
			borderColor: color,
		},
		h("text", { color }, scrollbar.join("")),
	);
};
