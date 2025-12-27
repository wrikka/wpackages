/**
 * Pattern types - Pure functional patterns for fills and strokes
 */

/**
 * Pattern repetition modes
 */
export type PatternRepetition =
	| "repeat"
	| "repeat-x"
	| "repeat-y"
	| "no-repeat";

/**
 * Base pattern interface
 */
export interface PatternBase {
	readonly type: string;
	readonly repetition: PatternRepetition;
}

/**
 * Image pattern
 */
export interface ImagePattern extends PatternBase {
	readonly type: "image";
	readonly imageUrl: string;
	readonly width?: number;
	readonly height?: number;
	readonly opacity?: number;
}

/**
 * Dots pattern
 */
export interface DotsPattern extends PatternBase {
	readonly type: "dots";
	readonly dotRadius: number;
	readonly spacing: number;
	readonly color: string;
	readonly backgroundColor?: string;
}

/**
 * Lines pattern
 */
export interface LinesPattern extends PatternBase {
	readonly type: "lines";
	readonly lineWidth: number;
	readonly spacing: number;
	readonly angle: number; // in radians
	readonly color: string;
	readonly backgroundColor?: string;
}

/**
 * Grid pattern
 */
export interface GridPattern extends PatternBase {
	readonly type: "grid";
	readonly lineWidth: number;
	readonly cellSize: number;
	readonly color: string;
	readonly backgroundColor?: string;
}

/**
 * Crosshatch pattern
 */
export interface CrosshatchPattern extends PatternBase {
	readonly type: "crosshatch";
	readonly lineWidth: number;
	readonly spacing: number;
	readonly angle: number;
	readonly color: string;
	readonly backgroundColor?: string;
}

/**
 * Zigzag pattern
 */
export interface ZigzagPattern extends PatternBase {
	readonly type: "zigzag";
	readonly amplitude: number;
	readonly wavelength: number;
	readonly lineWidth: number;
	readonly color: string;
	readonly backgroundColor?: string;
}

/**
 * Checkerboard pattern
 */
export interface CheckerboardPattern extends PatternBase {
	readonly type: "checkerboard";
	readonly cellSize: number;
	readonly color1: string;
	readonly color2: string;
}

/**
 * Hex pattern (honeycomb)
 */
export interface HexPattern extends PatternBase {
	readonly type: "hex";
	readonly hexRadius: number;
	readonly lineWidth: number;
	readonly color: string;
	readonly backgroundColor?: string;
}

/**
 * Union type for all patterns
 */
export type Pattern =
	| ImagePattern
	| DotsPattern
	| LinesPattern
	| GridPattern
	| CrosshatchPattern
	| ZigzagPattern
	| CheckerboardPattern
	| HexPattern;

// ===== Factory Functions =====

/**
 * Create image pattern
 */
export const createImagePattern = (
	imageUrl: string,
	repetition: PatternRepetition = "repeat",
	options?: { width?: number; height?: number; opacity?: number },
): ImagePattern => ({
	imageUrl,
	repetition,
	type: "image",
	...(options?.width !== undefined && { width: options.width }),
	...(options?.height !== undefined && { height: options.height }),
	...(options?.opacity !== undefined && { opacity: options.opacity }),
});

/**
 * Create dots pattern
 */
export const createDotsPattern = (
	dotRadius: number,
	spacing: number,
	color: string,
	backgroundColor?: string,
	repetition: PatternRepetition = "repeat",
): DotsPattern => ({
	color,
	dotRadius,
	repetition,
	spacing,
	type: "dots",
	...(backgroundColor !== undefined && { backgroundColor }),
});

/**
 * Create lines pattern
 */
export const createLinesPattern = (
	lineWidth: number,
	spacing: number,
	angle: number,
	color: string,
	backgroundColor?: string,
	repetition: PatternRepetition = "repeat",
): LinesPattern => ({
	angle,
	color,
	lineWidth,
	repetition,
	spacing,
	type: "lines",
	...(backgroundColor !== undefined && { backgroundColor }),
});

/**
 * Create grid pattern
 */
export const createGridPattern = (
	cellSize: number,
	lineWidth: number,
	color: string,
	backgroundColor?: string,
	repetition: PatternRepetition = "repeat",
): GridPattern => ({
	cellSize,
	color,
	lineWidth,
	repetition,
	type: "grid",
	...(backgroundColor !== undefined && { backgroundColor }),
});

/**
 * Create crosshatch pattern
 */
export const createCrosshatchPattern = (
	lineWidth: number,
	spacing: number,
	angle: number,
	color: string,
	backgroundColor?: string,
	repetition: PatternRepetition = "repeat",
): CrosshatchPattern => ({
	angle,
	color,
	lineWidth,
	repetition,
	spacing,
	type: "crosshatch",
	...(backgroundColor !== undefined && { backgroundColor }),
});

/**
 * Create zigzag pattern
 */
export const createZigzagPattern = (
	amplitude: number,
	wavelength: number,
	lineWidth: number,
	color: string,
	backgroundColor?: string,
	repetition: PatternRepetition = "repeat",
): ZigzagPattern => ({
	amplitude,
	color,
	lineWidth,
	repetition,
	type: "zigzag",
	wavelength,
	...(backgroundColor !== undefined && { backgroundColor }),
});

/**
 * Create checkerboard pattern
 */
export const createCheckerboardPattern = (
	cellSize: number,
	color1: string,
	color2: string,
	repetition: PatternRepetition = "repeat",
): CheckerboardPattern => ({
	cellSize,
	color1,
	color2,
	repetition,
	type: "checkerboard",
});

/**
 * Create hex pattern
 */
export const createHexPattern = (
	hexRadius: number,
	lineWidth: number,
	color: string,
	backgroundColor?: string,
	repetition: PatternRepetition = "repeat",
): HexPattern => ({
	color,
	hexRadius,
	lineWidth,
	repetition,
	type: "hex",
	...(backgroundColor !== undefined && { backgroundColor }),
});

// ===== Pattern Rendering to Canvas =====

/**
 * Generate pattern canvas - side effect but returns CanvasPattern
 */
export const generatePatternCanvas = (
	pattern: Pattern,
	size: { width: number; height: number },
): HTMLCanvasElement => {
	const canvas = document.createElement("canvas");
	canvas.width = size.width;
	canvas.height = size.height;
	const ctx = canvas.getContext("2d");

	if (!ctx) throw new Error("Could not get 2d context");

	// Fill background if specified
	const bgColor = "backgroundColor" in pattern ? pattern.backgroundColor : undefined;
	if (bgColor) {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, size.width, size.height);
	}

	// Draw pattern based on type
	switch (pattern.type) {
		case "dots":
			drawDotsPattern(ctx, pattern, size);
			break;
		case "lines":
			drawLinesPattern(ctx, pattern, size);
			break;
		case "grid":
			drawGridPattern(ctx, pattern, size);
			break;
		case "crosshatch":
			drawCrosshatchPattern(ctx, pattern, size);
			break;
		case "zigzag":
			drawZigzagPattern(ctx, pattern, size);
			break;
		case "checkerboard":
			drawCheckerboardPattern(ctx, pattern, size);
			break;
		case "hex":
			drawHexPattern(ctx, pattern, size);
			break;
	}

	return canvas;
};

// ===== Pattern Drawing Functions =====

const drawDotsPattern = (
	ctx: CanvasRenderingContext2D,
	pattern: DotsPattern,
	size: { width: number; height: number },
) => {
	ctx.fillStyle = pattern.color;

	for (let x = pattern.dotRadius; x < size.width; x += pattern.spacing) {
		for (let y = pattern.dotRadius; y < size.height; y += pattern.spacing) {
			ctx.beginPath();
			ctx.arc(x, y, pattern.dotRadius, 0, Math.PI * 2);
			ctx.fill();
		}
	}
};

const drawLinesPattern = (
	ctx: CanvasRenderingContext2D,
	pattern: LinesPattern,
	size: { width: number; height: number },
) => {
	ctx.strokeStyle = pattern.color;
	ctx.lineWidth = pattern.lineWidth;

	ctx.save();
	ctx.translate(size.width / 2, size.height / 2);
	ctx.rotate(pattern.angle);
	ctx.translate(-size.width / 2, -size.height / 2);

	for (let x = 0; x < size.width * 2; x += pattern.spacing) {
		ctx.beginPath();
		ctx.moveTo(x, -size.height);
		ctx.lineTo(x, size.height * 2);
		ctx.stroke();
	}

	ctx.restore();
};

const drawGridPattern = (
	ctx: CanvasRenderingContext2D,
	pattern: GridPattern,
	size: { width: number; height: number },
) => {
	ctx.strokeStyle = pattern.color;
	ctx.lineWidth = pattern.lineWidth;

	// Vertical lines
	for (let x = 0; x <= size.width; x += pattern.cellSize) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, size.height);
		ctx.stroke();
	}

	// Horizontal lines
	for (let y = 0; y <= size.height; y += pattern.cellSize) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(size.width, y);
		ctx.stroke();
	}
};

const drawCrosshatchPattern = (
	ctx: CanvasRenderingContext2D,
	pattern: CrosshatchPattern,
	size: { width: number; height: number },
) => {
	ctx.strokeStyle = pattern.color;
	ctx.lineWidth = pattern.lineWidth;

	// Draw lines at angle
	drawLinesPattern(ctx, { ...pattern, type: "lines" }, size);

	// Draw perpendicular lines
	drawLinesPattern(
		ctx,
		{ ...pattern, angle: pattern.angle + Math.PI / 2, type: "lines" },
		size,
	);
};

const drawZigzagPattern = (
	ctx: CanvasRenderingContext2D,
	pattern: ZigzagPattern,
	size: { width: number; height: number },
) => {
	ctx.strokeStyle = pattern.color;
	ctx.lineWidth = pattern.lineWidth;

	ctx.beginPath();
	let y = size.height / 2;
	let direction = 1;

	for (let x = 0; x <= size.width; x += pattern.wavelength / 2) {
		ctx.lineTo(x, y);
		y += pattern.amplitude * direction;
		direction *= -1;
	}

	ctx.stroke();
};

const drawCheckerboardPattern = (
	ctx: CanvasRenderingContext2D,
	pattern: CheckerboardPattern,
	size: { width: number; height: number },
) => {
	let useColor1 = true;

	for (let x = 0; x < size.width; x += pattern.cellSize) {
		for (let y = 0; y < size.height; y += pattern.cellSize) {
			ctx.fillStyle = useColor1 ? pattern.color1 : pattern.color2;
			ctx.fillRect(x, y, pattern.cellSize, pattern.cellSize);
			useColor1 = !useColor1;
		}
		useColor1 = !useColor1;
	}
};

const drawHexPattern = (
	ctx: CanvasRenderingContext2D,
	pattern: HexPattern,
	size: { width: number; height: number },
) => {
	ctx.strokeStyle = pattern.color;
	ctx.lineWidth = pattern.lineWidth;

	const r = pattern.hexRadius;
	const h = r * Math.sqrt(3);

	for (let row = 0; row < size.height / h + 2; row++) {
		for (let col = 0; col < size.width / (r * 1.5) + 2; col++) {
			const x = col * r * 1.5;
			const y = row * h + (col % 2 === 1 ? h / 2 : 0);

			drawHexagon(ctx, x, y, r);
		}
	}
};

const drawHexagon = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	r: number,
) => {
	ctx.beginPath();
	for (let i = 0; i < 6; i++) {
		const angle = (Math.PI / 3) * i;
		const hx = x + r * Math.cos(angle);
		const hy = y + r * Math.sin(angle);
		if (i === 0) {
			ctx.moveTo(hx, hy);
		} else {
			ctx.lineTo(hx, hy);
		}
	}
	ctx.closePath();
	ctx.stroke();
};

/**
 * Apply pattern to context - side effect
 */
export const applyPatternToContext = (
	ctx: CanvasRenderingContext2D,
	pattern: Pattern,
): CanvasPattern | null => {
	if (pattern.type === "image") {
		const img = new Image();
		img.src = pattern.imageUrl;
		return ctx.createPattern(img, pattern.repetition);
	}

	// Generate pattern canvas
	const patternCanvas = generatePatternCanvas(pattern, {
		height: 100,
		width: 100,
	});
	return ctx.createPattern(patternCanvas, pattern.repetition);
};
