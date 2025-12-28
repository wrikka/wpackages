import { Text } from "./text";

export interface AlertProps {
	message: string;
	type?: "info" | "warning" | "error" | "success";
	title?: string;
}

export const Alert = (props: AlertProps): string => {
	const { message, type = "info", title } = props;
	
	const typeSymbols = {
		info: "ℹ️",
		warning: "⚠️", 
		error: "❌",
		success: "✅"
	};
	
	const colors = {
		info: "blue",
		warning: "yellow",
		error: "red", 
		success: "green"
	} as const;
	
	const symbol = typeSymbols[type];
	const color = colors[type];
	
	const lines = [];
	
	if (title) {
		lines.push(`${symbol} ${Text({ children: title, color })}`);
	}
	
	lines.push(Text({ children: message, color }));
	
	return lines.join("\n");
};
