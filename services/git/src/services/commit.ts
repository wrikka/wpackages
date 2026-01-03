import { Effect } from "effect";
import { GitCommandError } from "../errors";
import { runGitCommand } from "./runGitCommand";

export const commit = (
    path: string,
    message: string,
    body?: string,
): Effect.Effect<string, GitCommandError> => {
    const sanitizedMessage = message.replace(/'/g, "'\\''");
    let commitCmd = `commit -m '${sanitizedMessage}'`;

    if (body) {
        const sanitizedBody = body.replace(/'/g, "'\\''");
        commitCmd += ` -m '${sanitizedBody}'`;
    }

    return runGitCommand(path, commitCmd).pipe(
        Effect.flatMap(() => runGitCommand(path, 'rev-parse HEAD')),
    );
};
