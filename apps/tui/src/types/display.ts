/**
 * Display Component Props
 * UI component property types
 */

export interface BoxProps {
	/** Title of the box */
	title?: string;
	/** Border style (default: true) */
	border?: boolean | "single" | "double" | "round" | "bold" | "dashed";
	/** Padding in number or object format */
	padding?:
		| number
		| {
			top: number;
			right: number;
			bottom: number;
			left: number;
		};
	/** Content of the box */
	children?: string | string[];
	/** Width of the box */
	width?: number | "auto" | "full";
	/** Accessibility attributes */
	ariaLabel?: string;
	tabIndex?: number;
	role?: string;
}

export interface CodeBlockProps {
	/** Code content */
	code: string;
	/** Programming language for syntax highlighting */
	language?: string;
	/** Show line numbers (default: false) */
	showLineNumbers?: boolean;
	/** Lines to highlight (array of line numbers) */
	highlightLines?: number[];
	/** Custom style configuration */
	style?: StyleConfig;
}

export interface ProgressProps {
	value: number;
	max?: number;
	showPercentage?: boolean;
	labelPosition?: "left" | "right" | "top" | "bottom";
	animated?: boolean;
}

export interface SpinnerProps {
	size?: "sm" | "md" | "lg" | number;
	color?: string;
	speed?: "slow" | "normal" | "fast";
}

export interface TableProps<T> {
	data: T[];
	columns: {
		key: string;
		header: string;
		width?: number;
		render?: (item: T) => string;
		sortable?: boolean;
	}[];
	pagination?: {
		pageSize: number;
		currentPage: number;
	};
}

export interface DividerProps {
	orientation?: "horizontal" | "vertical";
	thickness?: number;
}

export interface StatusProps {
	type:
		| "info"
		| "success"
		| "warning"
		| "error"
		| "loading"
		| "question"
		| "star";
	message: string;
}

export interface TextProps {
	children: string;
	color?: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	align?: "left" | "center" | "right";
	wrap?: boolean;
}

export type StyleConfig = {
	color?: string;
	bgColor?: string;
	borderColor?: string;
	textAlign?: "left" | "center" | "right";
	fontWeight?: "normal" | "bold" | "bolder" | "lighter" | number;
};

export function isProgressProps(props: unknown): props is ProgressProps {
	return (
		typeof props === "object"
		&& props !== null
		&& "value" in props
		&& typeof (props as ProgressProps).value === "number"
	);
}
