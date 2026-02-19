export type ProgressStyle = "bar" | "dots" | "spinner" | "percentage";

export interface ProgressOptions {
	message?: string;
	total: number;
	current?: number;
	style?: ProgressStyle;
	width?: number;
	showPercentage?: boolean;
	showETA?: boolean;
	showRemaining?: boolean;
}

export interface ProgressState {
	current: number;
	total: number;
	startTime: number | null;
	elapsed: number;
	eta: number | null;
}

export interface ProgressTheme {
	bar: {
		complete: string;
		incomplete: string;
		head?: string;
	};
	dots: {
		active: string;
		inactive: string;
	};
	colors: {
		complete: (s: string) => string;
		incomplete: (s: string) => string;
		message: (s: string) => string;
		percentage: (s: string) => string;
		eta: (s: string) => string;
	};
}
