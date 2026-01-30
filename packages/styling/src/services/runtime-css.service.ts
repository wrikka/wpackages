import type { UserOptions } from "../types/options";
import { generateCss } from "./generator.service";

export interface RuntimeCssOptions extends UserOptions {
	readonly inject?: boolean;
	readonly container?: HTMLElement | string;
}

let styleElement: HTMLStyleElement | null = null;

export function injectCss(css: string, container: HTMLElement | string = "head"): void {
	let target: HTMLElement;

	if (typeof container === "string") {
		if (container === "head") {
			target = document.head;
		} else if (container === "body") {
			target = document.body;
		} else {
			const el = document.querySelector(container);
			if (!el) {
				throw new Error(`Container "${container}" not found`);
			}
			target = el as HTMLElement;
		}
	} else {
		target = container;
	}

	if (!styleElement) {
		styleElement = document.createElement("style");
		styleElement.setAttribute("data-styling", "runtime");
		target.appendChild(styleElement);
	}

	if (styleElement.textContent !== css) {
		styleElement.textContent = css;
	}
}

export function removeCss(): void {
	if (styleElement) {
		styleElement.remove();
		styleElement = null;
	}
}

export async function generateAndInjectCss(
	classes: Set<string>,
	options: RuntimeCssOptions = {},
): Promise<string> {
	const css = await generateCss(classes, options);

	if (options.inject !== false) {
		injectCss(css, options.container);
	}

	return css;
}

export function getInjectedCss(): string | null {
	return styleElement?.textContent ?? null;
}

export function hasInjectedCss(): boolean {
	return styleElement !== null;
}
