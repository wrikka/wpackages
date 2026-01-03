import { Effect } from "effect";
import { runGitCommand } from "./runGitCommand";
import type { GitCommandError } from "../errors";

export const checkout = (
    path: string,
    branch: string,
    create?: boolean,
): Effect.Effect<void, GitCommandError> => {
    const command = `checkout ${create ? '-b' : ''} ${branch}`.trim();
    return runGitCommand(path, command).pipe(Effect.asVoid);
};
