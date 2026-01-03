import pc from "picocolors";
import { SPINNER_INTERVAL, SYMBOLS } from "../constant/symbol.const";
import * as Output from "./output.service";

/**
 * Loading spinner service (side effect wrapper)
 */
export const loading = (message: string) => {
	let i = 0;

	const interval = setInterval(() => {
		Output.write(`\r${pc.blue(SYMBOLS.spinner[i])} ${message}`);
		i = (i + 1) % SYMBOLS.spinner.length;
	}, SPINNER_INTERVAL);

	return {
		stop: () => {
			clearInterval(interval);
			Output.clearLine(message.length + 3);
		},
	};
};
