import type { BuildStep } from "./types";

export interface BuildErrorInput {
    code: string;
    step: BuildStep;
    message: string;
    hint?: string;
    cause?: unknown;
}

export class BuildError extends Error {
    public readonly code: string;
    public readonly step: BuildStep;
    public readonly hint: string | undefined;
    public override readonly cause: unknown;

    constructor(options: {
        code: string;
        step: BuildStep;
        message: string;
        hint?: string;
        cause?: unknown;
    }) {
        super(options.message, { cause: options.cause });
        this.code = options.code;
        this.step = options.step;
        this.hint = options.hint;
        this.cause = options.cause;
    }
}
