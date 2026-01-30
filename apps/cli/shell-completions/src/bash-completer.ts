import { runCompleter } from "./index";

// This script will be called by the Bash completion function.
// It uses environment variables set by Bash's `complete` mechanism.

const commandLine = process.env.COMP_LINE || "";
const _commandName = process.env.COMP_WORDS ? process.env.COMP_WORDS.split(" ")[0] : "";

// The first two arguments are the command itself, so we need to adjust.
// Bash sends the whole line, but our parser expects it to start with the command.
// Let's adjust this later if needed.

// A simple way to get the command name is to look at the first word.
const words = commandLine.trim().split(/\s+/);
const cmd = words.length > 0 ? words[0] : "";

await runCompleter("bash", commandLine, cmd);
