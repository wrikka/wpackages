import { Effect as FunctionalEffect } from "@wpackages/functional";
import type { Effect as EffectType } from "@wpackages/functional";

export interface CommandResult {
	readonly exitCode: number;
	readonly stdout: string;
	readonly stderr: string;
}

export interface Command {
	readonly run: (
		file: string,
		args?: ReadonlyArray<string>,
		options?: { readonly cwd?: string; readonly env?: Readonly<Record<string, string | undefined>> },
	) => EffectType<CommandResult, Error, never>;
}

export const Command = FunctionalEffect.tag<Command>();
