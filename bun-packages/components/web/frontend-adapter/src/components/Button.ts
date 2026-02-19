interface ButtonProps {
	label: string;
	onClick: () => void;
}

export const Button = (props: ButtonProps): string => {
	return `<button>${props.label}</button>`;
};
