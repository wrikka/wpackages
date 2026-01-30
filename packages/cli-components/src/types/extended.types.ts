/**
 * Extended Types
 * Additional prompt types from original types.ts
 */

/**
 * Prompt state
 */
export type PromptState = "initial" | "active" | "cancel" | "submit" | "error";

/**
 * Date prompt options
 */
export interface DatePromptOptions {
	readonly message: string;
	readonly min?: Date;
	readonly max?: Date;
	readonly format?: string;
	readonly initial?: Date;
}

/**
 * File prompt options
 */
export interface FilePromptOptions {
	readonly message: string;
	readonly directory?: string;
	readonly filter?: readonly string[];
	readonly multiple?: boolean;
	readonly initial?: string;
}

/**
 * Color prompt options
 */
export interface ColorPromptOptions {
	readonly message: string;
	readonly format?: "hex" | "rgb" | "hsl";
	readonly initial?: string;
}

/**
 * Slider prompt options
 */
export interface SliderPromptOptions {
	readonly message: string;
	readonly min: number;
	readonly max: number;
	readonly step?: number;
	readonly showValue?: boolean;
	readonly initial?: number;
}

/**
 * Rating prompt options
 */
export interface RatingPromptOptions {
	readonly message: string;
	readonly max?: number;
	readonly icon?: string;
	readonly emptyIcon?: string;
	readonly initial?: number;
}

/**
 * Tree node
 */
export interface TreeNode<T = string> {
	readonly value: T;
	readonly label: string;
	readonly description?: string;
	readonly children?: readonly TreeNode<T>[];
	readonly expanded?: boolean;
}

/**
 * Tree select options
 */
export interface TreeSelectPromptOptions<T = string> {
	readonly message: string;
	readonly nodes: readonly TreeNode<T>[];
	readonly multiple?: boolean;
	readonly initial?: T;
}

/**
 * Form field
 */
export interface FormField {
	readonly name: string;
	readonly type: "text" | "number" | "select" | "confirm" | "date";
	readonly message: string;
	readonly options?: unknown;
}

/**
 * Form prompt options
 */
export interface FormPromptOptions {
	readonly message: string;
	readonly fields: readonly FormField[];
}

/**
 * Wizard step
 */
export interface WizardStep {
	readonly name: string;
	readonly prompt: () => Promise<unknown>;
	readonly skip?: (results: unknown) => boolean | Promise<boolean>;
}

/**
 * Wizard options
 */
export interface WizardPromptOptions {
	readonly message: string;
	readonly steps: readonly WizardStep[];
}

/**
 * Spinner options
 */
export interface SpinnerOptions {
	readonly message: string;
	readonly type?: "dots" | "line" | "arc" | "arrow" | "pulse";
}

/**
 * Progress options
 */
export interface ProgressOptions {
	readonly message: string;
	readonly total: number;
	readonly showPercentage?: boolean;
}
