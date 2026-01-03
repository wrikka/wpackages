import { Data } from "@wpackages/functional";

export class CommandError extends Data.TaggedError("CommandError")<{ 
    readonly exitCode: number;
    readonly stderr: string;
}> {}
