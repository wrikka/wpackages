import { createContext, PropsWithChildren, useContext, useState } from "react";
import { cancelResult, isCancel, okResult, PromptDescriptor, type PromptResult } from "../../types";

export type GroupStepState = "pending" | "active" | "submitted";

interface GroupStep {
	key: string;
	state: GroupStepState;
	value: PromptResult<any> | undefined;
	descriptor: PromptDescriptor<any, any>;
}

interface GroupContextValue {
	steps: GroupStep[];
	activeStepKey: string | null;
	submitStep: (key: string, value: PromptResult<any>) => unknown;
	intro?: string | undefined;
	outro?: string | undefined;
	results: PromptResult<Record<string, any>> | null;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function useGroup() {
	const context = useContext(GroupContext);
	if (!context) {
		throw new Error("useGroup must be used within a GroupProvider");
	}
	return context;
}

export function GroupProvider(
	{ children, prompts, onComplete, intro, outro }: PropsWithChildren<
		{
			prompts: Record<string, PromptDescriptor<any, any>>;
			onComplete: (results: PromptResult<Record<string, any>>) => unknown;
			intro?: string | undefined;
			outro?: string | undefined;
		}
	>,
) {
	const initialSteps: GroupStep[] = Object.entries(prompts).map(([key, descriptor]) => ({
		key,
		state: "pending",
		value: undefined,
		descriptor,
	}));
	const firstStep = initialSteps[0];
	if (firstStep) {
		firstStep.state = "active";
	}

	const [steps, setSteps] = useState<GroupStep[]>(initialSteps);
	const [results, setResults] = useState<PromptResult<Record<string, any>> | null>(null);
	const activeStepKey = steps.find(s => s.state === "active")?.key ?? null;

	const submitStep = (key: string, value: PromptResult<any>): unknown => {
		setSteps(prevSteps => {
			const newSteps = [...prevSteps];
			const currentStepIndex = newSteps.findIndex(step => step.key === key);

			if (currentStepIndex !== -1) {
				const currentStep = newSteps[currentStepIndex];
				if (!currentStep) return newSteps;

				currentStep.state = "submitted";
				currentStep.value = value;

				if (isCancel(value)) {
					const cancel = cancelResult;
					setResults(cancel);
					onComplete(cancel);
					return newSteps;
				}

				const nextStepIndex = currentStepIndex + 1;
				if (nextStepIndex < newSteps.length) {
					const nextStep = newSteps[nextStepIndex];
					if (nextStep) {
						nextStep.state = "active";
					}
				} else {
					// All steps are done
					const collected = newSteps.reduce((acc, step) => {
						const stepValue = step.value;
						if (!stepValue || isCancel(stepValue)) return acc;
						acc[step.key] = stepValue.value;
						return acc;
					}, {} as Record<string, any>);
					const ok = okResult(collected);
					setResults(ok);
					onComplete(ok);
				}
			}
			return newSteps;
		});
		return undefined;
	};

	return (
		<GroupContext.Provider value={{ steps, activeStepKey, submitStep, intro, outro, results }}>
			{children}
		</GroupContext.Provider>
	);
}
