export type AnimationType = "fade" | "slide" | "scale" | "bounce" | "spin" | "pulse";

export interface AnimationConfig {
	type: AnimationType;
	duration?: number;
	easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
	delay?: number;
	repeat?: number;
	infinite?: boolean;
}

export interface AnimationState {
	playing: boolean;
	progress: number;
	currentFrame: number;
}

export interface AnimationOptions {
	enabled?: boolean;
	globalDuration?: number;
	reducedMotion?: boolean;
	customAnimations?: Record<string, AnimationConfig>;
}
