import { Effect } from "effect";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { GitCommandError } from "../../errors";

const execAsync = promisify(exec);

export const runGitCommand = (
	path: string,
	command: string,
): Effect.Effect<string, GitCommandError> =>
	Effect.tryPromise({
		try: () => execAsync(`git ${command}`, { cwd: path }),
		catch: (cause) => new GitCommandError({ cause }),
	}).pipe(Effect.map(({ stdout }) => stdout.trim()));
