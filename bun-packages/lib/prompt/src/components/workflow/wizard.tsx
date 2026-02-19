import { Box, Text } from "ink";
import React, { createContext, useContext, useState } from "react";
import { useTheme } from "../../lib/context";
import { prompt } from "../../lib/context/prompt-context";
import type { WizardContext, WizardOptions, WizardState, WizardStep } from "../../types/wizard";

const WizardContextValue = createContext<WizardContext | null>(null);

export const useWizard = (): WizardContext => {
	const context = useContext(WizardContextValue);
	if (!context) {
		throw new Error("useWizard must be used within WizardProvider");
	}
	return context;
};

interface WizardProviderProps {
	children: React.ReactNode;
	steps: WizardStep[];
	onComplete: (values: Record<string, unknown>) => void;
	onCancel: () => void;
	allowBack: boolean;
	allowCancel: boolean;
}

const WizardProvider: React.FC<WizardProviderProps> = ({
	children,
	steps,
	onComplete: _onComplete,
	onCancel: _onCancel,
	allowBack: _allowBack,
	allowCancel: _allowCancel,
}) => {
	const [currentStep, setCurrentStep] = useState(0);
	const [values, _setValues] = useState<Record<string, unknown>>({});

	const context: WizardContext = {
		values,
		currentStep,
		totalSteps: steps.length,
		isFirst: currentStep === 0,
		isLast: currentStep === steps.length - 1,
		goTo: (stepIndex: number) => setCurrentStep(stepIndex),
		back: () => setCurrentStep((prev) => Math.max(0, prev - 1)),
		next: () => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1)),
		cancel: _onCancel,
	};

	return (
		<WizardContextValue.Provider value={context}>
			{children}
		</WizardContextValue.Provider>
	);
};

export const WizardComponent: React.FC<WizardOptions> = ({
	steps,
	title,
	description,
	allowBack = true,
	allowCancel = true,
	onComplete,
	onCancel,
}) => {
	const theme = useTheme();
	const [state, setState] = useState<WizardState>({
		currentStep: 0,
		values: {},
		status: "active",
	});

	const currentStepData = steps[state.currentStep];

	const handleCancel = async () => {
		setState((prev) => ({ ...prev, status: "cancelled" }));
		if (onCancel) {
			await onCancel();
		}
	};

	if (state.status === "completed") {
		return (
			<Box>
				<Text>{theme.colors.primary("✓ Completed!")}</Text>
			</Box>
		);
	}

	if (state.status === "cancelled") {
		return (
			<Box>
				<Text>{theme.colors.secondary("✗ Cancelled")}</Text>
			</Box>
		);
	}

	return (
		<WizardProvider
			steps={steps}
			onComplete={onComplete ?? (() => {})}
			onCancel={handleCancel}
			allowBack={allowBack}
			allowCancel={allowCancel}
		>
			<Box flexDirection="column">
				{title && (
					<Text bold>
						{theme.colors.message(title)}
					</Text>
				)}
				{description && (
					<Text dimColor>
						{description}
					</Text>
				)}
				<Box marginTop={1}>
					<Text>
						{theme.colors.dim(`Step ${state.currentStep + 1} of ${steps.length}`)}
					</Text>
				</Box>
				<Box marginTop={1}>
					{React.createElement(currentStepData!.descriptor.Component, {
						...currentStepData!.descriptor.props,
					})}
				</Box>
				{allowBack && state.currentStep > 0 && (
					<Box marginTop={1}>
						<Text dimColor>
							← Back
						</Text>
					</Box>
				)}
			</Box>
		</WizardProvider>
	);
};

export const wizardComponent = (options: WizardOptions): WizardOptions => options;

export const runWizard = async (
	options: WizardOptions,
): Promise<Record<string, unknown> | null> => {
	if (!process.stdin.isTTY) {
		return null;
	}

	return new Promise((resolve) => {
		const handleComplete = (values: Record<string, unknown>) => {
			resolve(values);
		};

		const handleCancel = () => {
			resolve(null);
		};

		prompt(
			{
				Component: WizardComponent,
				props: {
					...options,
					onComplete: handleComplete,
					onCancel: handleCancel,
				},
				initialValue: null,
			},
			{},
		);
	});
};
