import { loadSpec } from "./engine";
import { parse } from "./parser";

// This script will be called by the PowerShell completer function.
// It receives the command line content as arguments.

// process.argv will be something like: ['node', 'completer.js', 'git', 'ad']
const commandLine = process.argv.slice(2).join(" ");
const commandName = process.argv[2];

if (!commandName) {
	process.exit(0);
}

const spec = loadSpec(commandName);

if (spec) {
	const suggestions = parse(commandLine, spec);

	// Output suggestions for PowerShell to consume.
	// We will use CompletionResult format later.
	suggestions.forEach((s) => {
		const name = Array.isArray(s.name) ? s.name[0] : s.name;
		console.log(name);
	});
}
