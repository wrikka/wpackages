import pc from "picocolors";
import readline from "readline";

export interface PromptOptions {
	message: string;
	validate?: (value: string) => string | undefined;
}

export async function textPrompt(options: PromptOptions): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		const ask = () => {
			rl.question(pc.blue(options.message + " "), (answer) => {
				if (options.validate) {
					const error = options.validate(answer);
					if (error) {
						console.log(pc.red(error));
						return ask();
					}
				}
				rl.close();
				resolve(answer);
			});
		};

		ask();
	});
}

export async function passwordPrompt(options: PromptOptions): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const stdin = process.stdin;
	const originalEcho = stdin.isTTY ? stdin.isRaw : false;

	if (stdin.isTTY) stdin.setRawMode(true);

	return new Promise((resolve) => {
		let password = "";

		const ask = () => {
			process.stdout.write(pc.blue(options.message + " "));

			stdin.on("data", (key) => {
				const str = key.toString();

				// Handle backspace
				if (str === "\b" || str === "\x7f") {
					if (password.length > 0) {
						password = password.slice(0, -1);
						process.stdout.write("\b \b");
					}
					return;
				}

				// Handle enter
				if (str === "\r" || str === "\n") {
					process.stdout.write("\n");
					stdin.removeAllListeners("data");

					if (options.validate) {
						const error = options.validate(password);
						if (error) {
							console.log(pc.red(error));
							password = "";
							return ask();
						}
					}

					if (stdin.isTTY) stdin.setRawMode(originalEcho);
					rl.close();
					resolve(password);
					return;
				}

				password += str;
				process.stdout.write("•");
			});
		};

		ask();
	});
}

export async function selectPrompt<T>(options: {
	message: string;
	options: { value: T; label: string }[];
}): Promise<T> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		console.log(pc.blue(options.message));
		options.options.forEach((opt, i) => {
			console.log(`${i + 1}. ${opt.label}`);
		});

		const ask = () => {
			rl.question(
				"Select an option (1-" + options.options.length + "): ",
				(answer) => {
					const selected = parseInt(answer) - 1;
					if (
						Number.isNaN(selected)
						|| selected < 0
						|| selected >= options.options.length
					) {
						console.log(
							pc.red(
								`Please enter a number between 1 and ${options.options.length}`,
							),
						);
						return ask();
					}
					rl.close();
					const selectedOption = options.options[selected];
					if (selectedOption) {
						resolve(selectedOption.value);
					}
				},
			);
		};

		ask();
	});
}
