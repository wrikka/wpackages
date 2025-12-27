import type { HexColor, HSL, RGB, RGBA } from "../types";

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

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

export const rgbToHex = (rgb: RGB): HexColor => {
	const r = rgb.r.toString(16).padStart(2, "0");
	const g = rgb.g.toString(16).padStart(2, "0");
	const b = rgb.b.toString(16).padStart(2, "0");
	return `#${r}${g}${b}` as HexColor;
};

export const hexToRgb = (hex: HexColor): RGB => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result || !result[1] || !result[2] || !result[3]) {
		throw new Error(`Invalid hex color: ${hex}`);
	}
	return {
		b: parseInt(result[3]!, 16),
		g: parseInt(result[2]!, 16),
		r: parseInt(result[1]!, 16),
	};
};

export const rgbToHsl = (rgb: RGB): HSL => {
	const r = rgb.r / 255;
	const g = rgb.g / 255;
	const b = rgb.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}

	return { h: h * 360, l: l * 100, s: s * 100 };
};

export const hslToRgb = (hsl: HSL): RGB => {
	const h = hsl.h / 360;
	const s = hsl.s / 100;
	const l = hsl.l / 100;

	let r: number, g: number, b: number;

	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p: number, q: number, t: number): number => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return {
		b: Math.round(b * 255),
		g: Math.round(g * 255),
		r: Math.round(r * 255),
	};
};

export const withAlpha = (rgb: RGB, alpha: number): RGBA => ({
	...rgb,
	a: clamp(alpha, 0, 1),
});

export const blend = (a: RGB, b: RGB, t: number): RGB => ({
	b: Math.round(a.b + (b.b - a.b) * t),
	g: Math.round(a.g + (b.g - a.g) * t),
	r: Math.round(a.r + (b.r - a.r) * t),
});

export const lighten = (rgb: RGB, amount: number): RGB => {
	const hsl = rgbToHsl(rgb);
	return hslToRgb({ ...hsl, l: Math.min(100, hsl.l + amount) });
};

export const darken = (rgb: RGB, amount: number): RGB => {
	const hsl = rgbToHsl(rgb);
	return hslToRgb({ ...hsl, l: Math.max(0, hsl.l - amount) });
};
