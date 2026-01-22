import { runCompleter } from "./index";

// This script will be called by the PowerShell completer function.
// It receives the command line content as arguments.

// process.argv will be something like: ['node', 'completer.js', 'git', 'ad']
const commandLine = process.argv.slice(2).join(" ");
const commandName = process.argv[2];

await runCompleter("powershell", commandLine, commandName);
