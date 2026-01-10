import type { CanvasProps } from "../types/schema";
import { h } from "../types/vnode";

type CanvasComponentProps = CanvasProps;

export const Canvas = (
	props: CanvasComponentProps,
): ReturnType<typeof h> => {
	const {
		width,
		height,
		onDraw,
		...rest
	} = props;

	const grid: string[][] = Array.from({ length: height }, () => Array(width).fill(" "));

	const ctx = {
		width,
		height,
		clear: () => {
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					grid[y][x] = " ";
				}
			}
		},
		drawPixel: (x: number, y: number, char: string) => {
			if (x >= 0 && x < width && y >= 0 && y < height) {
				grid[y][x] = char;
			}
		},
		drawLine: (x1: number, y1: number, x2: number, y2: number, char: string) => {
			const dx = Math.abs(x2 - x1);
			const dy = Math.abs(y2 - y1);
			const sx = x1 < x2 ? 1 : -1;
			const sy = y1 < y2 ? 1 : -1;
			let err = dx - dy;

			let x = x1;
			let y = y1;

			while (true) {
				if (x >= 0 && x < width && y >= 0 && y < height) {
					grid[y][x] = char;
				}

				if (x === x2 && y === y2) break;

				const e2 = 2 * err;
				if (e2 > -dy) {
					err -= dy;
					x += sx;
				}
				if (e2 < dx) {
					err += dx;
					y += sy;
				}
			}
		},
		drawRect: (x: number, y: number, w: number, h: number, char: string) => {
			for (let i = 0; i < w; i++) {
				grid[y][x + i] = char;
				grid[y + h - 1][x + i] = char;
			}
			for (let i = 0; i < h; i++) {
				grid[y + i][x] = char;
				grid[y + i][x + w - 1] = char;
			}
		},
		drawText: (x: number, y: number, text: string) => {
			for (let i = 0; i < text.length; i++) {
				if (x + i >= 0 && x + i < width && y >= 0 && y < height) {
					grid[y][x + i] = text[i];
				}
			}
		},
	};

	if (onDraw) {
		onDraw(ctx);
	}

	const rows = grid.map((row) => row.join(""));

	return h(
		"box",
		{ ...rest, flexDirection: "column", borderStyle: "single" },
		...rows.map((row) => h("text", {}, row)),
	);
};
