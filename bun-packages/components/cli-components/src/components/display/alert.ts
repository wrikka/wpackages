import { SYMBOLS } from "../../constant/symbol.const";
import { Text } from "./text";

export type AlertVariant = "info" | "warning" | "error" | "success";

export interface AlertProps {
	readonly message: string;
	readonly type?: AlertVariant;
	readonly title?: string;
}

type TextColor = "blue" | "yellow" | "red" | "green";

const ALERT_SYMBOL: Record<AlertVariant, string> = {
	info: SYMBOLS.info,
	warning: SYMBOLS.warning,
	error: SYMBOLS.error,
	success: SYMBOLS.success,
};

const ALERT_COLOR: Record<AlertVariant, TextColor> = {
	info: "blue",
	warning: "yellow",
	error: "red",
	success: "green",
};

export const Alert = (props: AlertProps): string => {
	const { message, type = "info", title } = props;
	const symbol = ALERT_SYMBOL[type];
	const color = ALERT_COLOR[type];

	const lines: string[] = [];
	if (title) {
		lines.push(Text({ children: `${symbol} ${title}`, color }));
	}
	lines.push(Text({ children: message, color }));
	return lines.join("\n");
};
