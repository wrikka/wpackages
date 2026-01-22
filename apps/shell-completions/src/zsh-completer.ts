import { runCompleter } from "./index";

// This script will be called by the Zsh completion function.
// Zsh provides the command line arguments directly to the script.

// process.argv will be ['node', 'zsh-completer.js', 'git', 'ad']
const commandLine = process.argv.slice(2).join(" ");
const commandName = process.argv[2];

await runCompleter("zsh", commandLine, commandName);
