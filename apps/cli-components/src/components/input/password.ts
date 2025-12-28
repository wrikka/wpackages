import pc from "picocolors";
import { passwordPrompt } from "./prompt";

export async function password(options: {
	message: string;
	minLength?: number;
	confirm?: boolean;
	strengthMeter?: boolean;
}): Promise<string> {
	let password = "";

	if (options.strengthMeter) {
		const showStrength = (pwd: string): string => {
			const strength = Math.min(10, pwd.length * 2);
			const filled = "█".repeat(strength);
			const empty = "░".repeat(10 - strength);
			return strength < 4
				? pc.red(filled + empty)
				: strength < 7
				? pc.yellow(filled + empty)
				: pc.green(filled + empty);
		};

		password = await passwordPrompt({
			message: `${options.message} ${options.strengthMeter ? showStrength("") : ""}`,
			validate: (value: string): string | undefined => {
				if (options.minLength && value.length < options.minLength) {
					return `Password must be at least ${options.minLength} characters`;
				}
			},
		});

		if (options.confirm) {
			const confirmPwd = await passwordPrompt({
				message: "Confirm password",
				validate: (value: string): string | undefined => {
					if (value !== password) {
						return "Passwords do not match";
					}
				},
			});
			if (confirmPwd !== password) {
				throw new Error("Passwords do not match");
			}
		}
	} else {
		password = await passwordPrompt({
			message: options.message,
		});
	}

	return password;
}
