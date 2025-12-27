/**
 * Animation types - Pure functional animations
 */

export type EasingFunction = (t: number) => number;

/**
 * Animation state
 */
export interface Animation {
	readonly id: string;
	readonly targetShapeId: string;
	readonly property: string;
	readonly startValue: number | string;
	readonly endValue: number | string;
	readonly duration: number; // milliseconds
	readonly startTime: number; // timestamp
	readonly easing: EasingFunction;
	readonly loop: boolean;
	readonly yoyo: boolean; // reverse back
	readonly delay: number;
	readonly onComplete?: () => void;
}

/**
 * Animation frame data
 */
export interface AnimationFrame {
	readonly timestamp: number;
	readonly progress: number; // 0-1
	readonly value: number | string;
	readonly isComplete: boolean;
}

/**
 * Easing functions - all pure
 */
export const Easing = {
	// Back
	easeInBack: (t: number): number => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return c3 * t * t * t - c1 * t * t;
	},

	// Bounce
	easeInBounce: (t: number): number => 1 - Easing.easeOutBounce(1 - t),

	// Circular
	easeInCirc: (t: number): number => 1 - Math.sqrt(1 - t * t),

	// Cubic
	easeInCubic: (t: number): number => t * t * t,

	// Elastic
	easeInElastic: (t: number): number => {
		const c4 = (2 * Math.PI) / 3;
		return t === 0
			? 0
			: t === 1
			? 1
			: -(2 ** (10 * t - 10)) * Math.sin((t * 10 - 10.75) * c4);
	},

	// Exponential
	easeInExpo: (t: number): number => (t === 0 ? 0 : 2 ** (10 * t - 10)),
	easeInOutBack: (t: number): number => {
		const c1 = 1.70158;
		const c2 = c1 * 1.525;
		return t < 0.5
			? ((2 * t) ** 2 * ((c2 + 1) * 2 * t - c2)) / 2
			: ((2 * t - 2) ** 2 * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
	},
	easeInOutBounce: (t: number): number =>
		t < 0.5
			? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2
			: (1 + Easing.easeOutBounce(2 * t - 1)) / 2,
	easeInOutCirc: (t: number): number =>
		t < 0.5
			? (1 - Math.sqrt(1 - 4 * t * t)) / 2
			: (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2,
	easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
	easeInOutElastic: (t: number): number => {
		const c5 = (2 * Math.PI) / 4.5;
		return t === 0
			? 0
			: t === 1
			? 1
			: t < 0.5
			? -(2 ** (20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
			: (2 ** (-20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
	},
	easeInOutExpo: (t: number): number =>
		t === 0
			? 0
			: t === 1
			? 1
			: t < 0.5
			? 2 ** (20 * t - 10) / 2
			: (2 - 2 ** (-20 * t + 10)) / 2,
	easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
	easeInOutQuart: (t: number): number => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
	easeInOutQuint: (t: number): number => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
	easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,

	// Quadratic
	easeInQuad: (t: number): number => t * t,

	// Quartic
	easeInQuart: (t: number): number => t * t * t * t,

	// Quintic
	easeInQuint: (t: number): number => t * t * t * t * t,

	// Sine
	easeInSine: (t: number): number => 1 - Math.cos((t * Math.PI) / 2),
	easeOutBack: (t: number): number => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
	},
	easeOutBounce: (t: number): number => {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (t < 1 / d1) {
			return n1 * t * t;
		} else if (t < 2 / d1) {
			return n1 * (t -= 1.5 / d1) * t + 0.75;
		} else if (t < 2.5 / d1) {
			return n1 * (t -= 2.25 / d1) * t + 0.9375;
		} else {
			return n1 * (t -= 2.625 / d1) * t + 0.984375;
		}
	},
	easeOutCirc: (t: number): number => Math.sqrt(1 - (t - 1) * (t - 1)),
	easeOutCubic: (t: number): number => --t * t * t + 1,
	easeOutElastic: (t: number): number => {
		const c4 = (2 * Math.PI) / 3;
		return t === 0
			? 0
			: t === 1
			? 1
			: 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
	},
	easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - 2 ** (-10 * t)),
	easeOutQuad: (t: number): number => t * (2 - t),
	easeOutQuart: (t: number): number => 1 - --t * t * t * t,
	easeOutQuint: (t: number): number => 1 + --t * t * t * t * t,
	easeOutSine: (t: number): number => Math.sin((t * Math.PI) / 2),
	// Linear
	linear: (t: number): number => t,
} as const;

/**
 * Create animation - pure function
 */
export const createAnimation = (config: {
	id: string;
	targetShapeId: string;
	property: string;
	startValue: number | string;
	endValue: number | string;
	duration: number;
	easing?: EasingFunction;
	loop?: boolean;
	yoyo?: boolean;
	delay?: number;
	onComplete?: () => void;
}): Animation => ({
	delay: config.delay || 0,
	duration: config.duration,
	easing: config.easing || Easing.linear,
	endValue: config.endValue,
	id: config.id,
	loop: config.loop || false,
	...(config.onComplete && { onComplete: config.onComplete }),
	property: config.property,
	startTime: Date.now(),
	startValue: config.startValue,
	targetShapeId: config.targetShapeId,
	yoyo: config.yoyo || false,
});

/**
 * Calculate animation frame - pure function
 */
export const calculateAnimationFrame = (
	animation: Animation,
	currentTime: number,
): AnimationFrame => {
	const elapsed = currentTime - animation.startTime - animation.delay;

	if (elapsed < 0) {
		return {
			isComplete: false,
			progress: 0,
			timestamp: currentTime,
			value: animation.startValue,
		};
	}

	let progress = Math.min(elapsed / animation.duration, 1);

	if (animation.loop && progress >= 1) {
		progress = (elapsed % animation.duration) / animation.duration;
	}

	if (animation.yoyo && progress >= 1) {
		const cycles = Math.floor(elapsed / animation.duration);
		if (cycles % 2 === 1) {
			progress = 1 - (elapsed % animation.duration) / animation.duration;
		}
	}

	const easedProgress = animation.easing(progress);
	const isComplete = !animation.loop && progress >= 1;

	// Interpolate value
	const value = interpolateValue(
		animation.startValue,
		animation.endValue,
		easedProgress,
	);

	return {
		isComplete,
		progress: easedProgress,
		timestamp: currentTime,
		value,
	};
};

/**
 * Interpolate between values - pure function
 */
const interpolateValue = (
	start: number | string,
	end: number | string,
	progress: number,
): number | string => {
	if (typeof start === "number" && typeof end === "number") {
		return start + (end - start) * progress;
	}

	// For strings, assume they are colors in hex format
	if (typeof start === "string" && typeof end === "string") {
		return interpolateColor(start, end, progress);
	}

	return start;
};

/**
 * Interpolate between colors - pure function
 */
const interpolateColor = (
	start: string,
	end: string,
	progress: number,
): string => {
	const startRgb = hexToRgb(start);
	const endRgb = hexToRgb(end);

	if (!startRgb || !endRgb) return start;

	const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * progress);
	const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * progress);
	const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * progress);

	return rgbToHex(r, g, b);
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result && result[1] && result[2] && result[3]
		? {
			b: Number.parseInt(result[3]!, 16),
			g: Number.parseInt(result[2]!, 16),
			r: Number.parseInt(result[1]!, 16),
		}
		: null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
