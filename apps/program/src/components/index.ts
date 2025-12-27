/**
 * Components for the program framework
 *
 * This directory contains pure functions for rendering and display components.
 * Components should be pure functions with no side effects.
 */

// Export component interfaces and functions
export interface Component<Props> {
	render: (props: Props) => string;
}

export interface ProgramComponentProps {
	title: string;
	version: string;
	description: string;
}

export const ProgramComponent: Component<ProgramComponentProps> = {
	render: (props) => {
		return `
${props.title} v${props.version}
${props.description}
`;
	},
};

export const ErrorComponent: Component<{ message: string }> = {
	render: (props) => {
		return `Error: ${props.message}`;
	},
};

export const SuccessComponent: Component<{ message: string }> = {
	render: (props) => {
		return `Success: ${props.message}`;
	},
};
