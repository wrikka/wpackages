import pc from "picocolors";
import readline from "readline";

export function passwordPrompt(options: {
	message: string;
	validate?: (value: string) => string | undefined;
}): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(pc.blue(options.message + ": "), (answer) => {
			if (options.validate) {
				const error = options.validate(answer);
				if (error) {
					console.log(pc.red(error));
					rl.close();
					return passwordPrompt(options).then(resolve);
				}
			}
			rl.close();
			resolve(answer);
		});
	});
}

export function textPrompt(options: {
	message: string;
	validate?: (value: string) => string | undefined;
}): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(pc.blue(options.message + ": "), (answer) => {
			if (options.validate) {
				const error = options.validate(answer);
				if (error) {
					console.log(pc.red(error));
					rl.close();
					return textPrompt(options).then(resolve);
				}
			}
			rl.close();
			resolve(answer);
		});
	});
}

export function selectPrompt<T>(options: {
	message: string;
	choices: { name: string; value: T }[];
	validate?: (value: T) => string | undefined;
}): Promise<T> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		console.log(pc.blue(options.message + ":"));
		options.choices.forEach((choice, index) => {
			console.log(`${index + 1}. ${choice.name}`);
		});

		rl.question("Enter your choice (number): ", (answer) => {
			const choiceIndex = parseInt(answer) - 1;
			if (
				Number.isNaN(choiceIndex)
				|| choiceIndex < 0
				|| choiceIndex >= options.choices.length
			) {
				console.log(pc.red("Invalid choice"));
				rl.close();
				return selectPrompt(options).then(resolve);
			}

			const selectedChoice = options.choices[choiceIndex];
			if (!selectedChoice) {
				console.log(pc.red("Invalid choice"));
				rl.close();
				return selectPrompt(options).then(resolve);
			}
			const selected = selectedChoice.value;
			if (options.validate) {
				const error = options.validate(selected);
				if (error) {
					console.log(pc.red(error));
					rl.close();
					return selectPrompt(options).then(resolve);
				}
			}

			rl.close();
			resolve(selected);
		});
	});
}
