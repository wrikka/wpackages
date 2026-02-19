import type { PromptDescriptor } from "./prompt-descriptor";

export interface WizardStep<T = unknown> {
	id: string;
	name: string;
	descriptor: PromptDescriptor<T, any>;
	skip?: (context: WizardContext) => boolean;
	onComplete?: (value: T, context: WizardContext) => void | Promise<void>;
	onBack?: (context: WizardContext) => void | Promise<void>;
}

export interface WizardContext {
	values: Record<string, unknown>;
	currentStep: number;
	totalSteps: number;
	isFirst: boolean;
	isLast: boolean;
	goTo: (stepIndex: number) => void;
	back: () => void;
	next: () => void;
	cancel: () => void;
}

export interface WizardOptions {
	steps: WizardStep[];
	title?: string;
	description?: string;
	allowBack?: boolean;
	allowCancel?: boolean;
	onComplete?: (values: Record<string, unknown>) => void | Promise<void>;
	onCancel?: () => void | Promise<void>;
}

export interface WizardState {
	currentStep: number;
	values: Record<string, unknown>;
	status: "idle" | "active" | "submitting" | "completed" | "cancelled";
}
