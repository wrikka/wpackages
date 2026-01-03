import { PromptProvider, useTheme } from "@/context";
import { GroupProvider, useGroup } from "@/context/group-context";
import { renderer } from "@/services";
import { Box, Text } from "ink";
import React from "react";

const GroupComponent: React.FC = () => {
	const { steps, submitStep, intro, outro, results } = useGroup();
	const theme = useTheme();
	const activeStep = steps.find(step => step.state === "active");

	const isComplete = results !== null;

	return (
		<Box flexDirection="column">
			{intro && !isComplete && <Text>{theme.symbols.info} {intro}</Text>}

			{steps.map(step => {
				if (step.state === "submitted") {
					return (
						<Text key={step.key}>
							{theme.symbols.check} {step.key}: {theme.colors.secondary(String(step.value))}
						</Text>
					);
				}
				return null;
			})}

			{activeStep && (
				<PromptProvider
					key={activeStep.key}
					initialValue={activeStep.descriptor.initialValue}
					onSubmit={(value) => {
						submitStep(activeStep.key, value);
					}}
					onCancel={() => {
						submitStep(activeStep.key, Symbol.for("cancel"));
					}}
				>
					<activeStep.descriptor.Component {...activeStep.descriptor.props} />
				</PromptProvider>
			)}

			{outro && isComplete && <Text>{outro}</Text>}
		</Box>
	);
};

import { PromptDescriptor } from "../types";

interface GroupOptions<T extends Record<string, PromptDescriptor<any, any>>> {
	prompts: T;
	intro?: string;
	outro?: string;
}

export function group<T extends Record<string, PromptDescriptor<any, any>>>(
	options: GroupOptions<T>,
): Promise<{ [K in keyof T]: T[K] extends PromptDescriptor<infer V, any> ? V : never } | symbol> {
	const { prompts, intro, outro } = options;

	return new Promise(resolve => {
		const onComplete = (results: Record<string, any>) => {
			renderer.unmount();
			resolve(results as any);
		};

		renderer.render(
			<GroupProvider prompts={prompts} onComplete={onComplete} intro={intro} outro={outro}>
				<GroupComponent />
			</GroupProvider>,
		);
	});
}
