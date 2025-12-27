export interface RGB {
	readonly r: number;
	readonly g: number;
	readonly b: number;
}

export interface RGBA extends RGB {
	readonly a: number;
}

export interface HSL {
	readonly h: number;
	readonly s: number;
	readonly l: number;
}

export type HexColor = string & { readonly __brand: "HexColor" };

export type Color = RGB | RGBA | HSL | HexColor;

// ===== Helper Functions =====
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

// ===== Factory Functions =====
export const createRGB = (r: number, g: number, b: number): RGB => ({
	b: Math.round(clamp(b, 0, 255)),
	g: Math.round(clamp(g, 0, 255)),
	r: Math.round(clamp(r, 0, 255)),
});

export const createRGBA = (
	r: number,
	g: number,
	b: number,
	a: number,
): RGBA => ({
	...createRGB(r, g, b),
	a: clamp(a, 0, 1),
});

export const createHSL = (h: number, s: number, l: number): HSL => ({
	h: clamp(h, 0, 360),
	l: clamp(l, 0, 100),
	s: clamp(s, 0, 100),
});

export const createHexColor = (hex: string): HexColor => {
	const cleaned = hex.startsWith("#") ? hex : `#${hex}`;
	if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(cleaned)) {
		throw new Error(`Invalid hex color: ${hex}`);
	}
	return cleaned as HexColor;
};
