import { Effect } from "effect";
import { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const diffStat = (
	path: string,
	from?: string,
	to?: string,
): Effect.Effect<string, GitCommandError> => {
	let cmd = "diff --stat";
	if (from && to) {
		cmd += ` ${from}...${to}`;
	} else if (from) {
		cmd += ` ${from}`;
	}
	return runGitCommand(path, cmd);
};

export const clean = (
	path: string,
	force?: boolean,
	directories?: boolean,
): Effect.Effect<void, GitCommandError> => {
	let cmd = "clean";
	if (force) {
		cmd += " -f";
	}
	if (directories) {
		cmd += " -d";
	}
	return runGitCommand(path, cmd).pipe(Effect.as(void 0));
};
