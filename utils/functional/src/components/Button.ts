import { AppTheme } from '../config';

interface ButtonProps {
  label: string;
  onClick: () => void; // Side effect is managed by the caller
}

export const Button = (props: ButtonProps): string => {
  // In a real scenario, this would render a UI component.
  // For this example, we'll just log the action.
  console.log(`Button '${props.label}' was rendered with primary color ${AppTheme.primaryColor}`);
  return `<button>${props.label}</button>`;
};
