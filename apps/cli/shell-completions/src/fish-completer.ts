import { runCompleter } from "./index";

// This script will be called by the Fish completion function.
// Fish provides the full command line as arguments.

// process.argv will be ['node', 'fish-completer.js', 'git', 'ad']
const commandLine = process.argv.slice(2).join(" ");
const commandName = process.argv[2];

await runCompleter("fish", commandLine, commandName);
