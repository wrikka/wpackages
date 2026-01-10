import type { ModalProps } from "../types/schema";
import { h } from "../types/vnode";
import { MODAL_BORDERS } from "../constant/widget.const";

type ModalComponentProps = ModalProps;

export const Modal = (
	props: ModalComponentProps,
): ReturnType<typeof h> => {
	const {
		title = "Modal",
		isOpen = true,
		width = 50,
		height = 20,
		color: _color = "white",
		borderColor = "cyan",
		...rest
	} = props;

	if (!isOpen) {
		return h("box", {});
	}

	const titleText = ` ${title} `;
	const titleLength = titleText.length;
	const _horizontalBorder = MODAL_BORDERS.horizontal.repeat(Math.max(0, (typeof width === "number" ? width : 50) - titleLength - 4));

	return h(
		"box",
		{ ...rest, flexDirection: "column", width, height, borderStyle: "double", borderColor },
		h("text", { color: borderColor, bold: true }, `${MODAL_BORDERS.cornerTL}${MODAL_BORDERS.horizontal}${MODAL_BORDERS.cornerTR}`),
		h("text", { color: borderColor }, `${MODAL_BORDERS.vertical}${titleText}${MODAL_BORDERS.vertical}`),
		h("text", { color: borderColor }, `${MODAL_BORDERS.cornerBL}${MODAL_BORDERS.horizontal.repeat(Math.max(0, (typeof width === "number" ? width : 50) - 2))}${MODAL_BORDERS.cornerBR}`),
	);
};
