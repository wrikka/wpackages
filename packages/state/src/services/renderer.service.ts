import { Context, Effect, Layer } from "effect";
import p from "picocolors";
import { BORDER_STYLES } from "../constant/border.const";
import type { Color } from "../constant/color.const";
import type { BoxProps, TextProps } from "../types/schema";
import type { VNode } from "../types/vnode";
import {
	type Layout,
	LayoutService,
	LayoutServiceLive,
} from "./layout.service";
import { Terminal } from "./terminal.service";

export interface Renderer {
	readonly render: (node: VNode) => Effect.Effect<void, never, Terminal>;
}

export const Renderer: Context.Tag<Renderer, Renderer> =
	Context.GenericTag<Renderer>("Renderer");

const isColor = (key: string): key is Color => key in p;

// Represents a single character cell on the screen
interface ScreenCell {
	char: string;
	style: (s: string) => string;
}

const drawLayoutToGrid = (layout: Layout, grid: ScreenCell[][]) => {
	const { x, y, width, height, node } = layout;
	const props = node.props as BoxProps | TextProps;

	// Draw border for Box
	if (node.type === "box" && "borderStyle" in props && props.borderStyle) {
		const borderStyle = props.borderStyle as keyof typeof BORDER_STYLES;
		const border = BORDER_STYLES[borderStyle];
		let style = (s: string) => s;
		if (
			"borderColor" in props &&
			props.borderColor &&
			isColor(props.borderColor)
		) {
			const color = props.borderColor as keyof typeof p;
			style = p[color] as (s: string) => string;
		}

		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				const row = grid[y + i];
				if (!row) continue;
				const xIndex = x + j;
				if (xIndex < 0 || xIndex >= row.length) continue;
				const isTop = i === 0;
				const isBottom = i === height - 1;
				const isLeft = j === 0;
				const isRight = j === width - 1;

				if (isTop && isLeft) row[xIndex] = { char: border.topLeft, style };
				else if (isTop && isRight)
					row[xIndex] = { char: border.topRight, style };
				else if (isBottom && isLeft)
					row[xIndex] = { char: border.bottomLeft, style };
				else if (isBottom && isRight)
					row[xIndex] = { char: border.bottomRight, style };
				else if (isTop) row[xIndex] = { char: border.horizontal, style };
				else if (isBottom) row[xIndex] = { char: border.horizontal, style };
				else if (isLeft) row[xIndex] = { char: border.vertical, style };
				else if (isRight) row[xIndex] = { char: border.vertical, style };
			}
		}
	}

	// Draw content for Text
	if (node.type === "text") {
		const content = (node.children ?? [])
			.filter((c) => typeof c === "string")
			.join("");
		let style = (s: string) => s;
		if ("color" in props && props.color && isColor(props.color)) {
			const color = props.color as keyof typeof p;
			style = p[color] as (s: string) => string;
		}
		if ("bold" in props && props.bold) style = (s: string) => p.bold(style(s));
		if ("italic" in props && props.italic)
			style = (s: string) => p.italic(style(s));

		for (let i = 0; i < content.length; i++) {
			const charX = x + i;
			const charY = y;
			const row = grid?.[charY];
			if (row && charX >= 0 && charX < row.length) {
				const ch = content[i];
				if (!ch) continue;
				row[charX] = { char: ch, style };
			}
		}
	}

	// Recursively draw children for box nodes
	if (node.type === "box") {
		layout.children.forEach((child) => {
			drawLayoutToGrid(child, grid);
		});
	}
};

export const RendererLive: Layer.Layer<Renderer, never, Terminal> =
	Layer.effect(
		Renderer,
		Effect.gen(function* (_) {
			const terminal = yield* _(Terminal);
			const layoutService = yield* _(LayoutService);

			const render = (node: VNode) =>
				Effect.gen(function* (_) {
					const { columns, rows } = yield* _(terminal.getSize);
					const layout = yield* _(
						layoutService.calculateLayout(node, columns, rows),
					);

					// Create a 2D grid
					const grid: ScreenCell[][] = Array.from({ length: rows }, () =>
						Array.from({ length: columns }, () => ({
							char: " ",
							style: (s) => s,
						})),
					);

					drawLayoutToGrid(layout, grid);

					// Convert grid to a single string
					const output = grid
						.map((row) => row.map((cell) => cell.style(cell.char)).join(""))
						.join("\n");

					yield* _(terminal.clear);
					yield* _(terminal.write(output));
				});

			return { render };
		}),
	).pipe(Layer.provide(LayoutServiceLive));
