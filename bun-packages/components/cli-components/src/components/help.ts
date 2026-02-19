import type { OptionDef, ProgramDef } from "../types";
import { padEnd } from "../utils";
import { Text } from "./display/text";

/**
 * Color utilities using components
 */
const colors = {
	bright: (s: string) => Text({ bold: true, children: s }),
	cyan: (s: string) => Text({ children: s, color: "cyan" }),
	dim: (s: string) => Text({ children: s, color: "gray" }),
};

/**
 * Generate program help text
 */
export const generateProgramHelp = (program: ProgramDef): string => {
	const sections: string[] = [];

	// Header with program name and version
	sections.push(`${program.name} v${program.version}`);
	sections.push(program.description || "CLI Application");

	// Usage section
	const usage = [
		colors.bright("Usage:"),
		`  ${colors.cyan(program.name)} ${colors.dim("[command]")} ${colors.dim("[options]")}`,
	].join("\n");
	sections.push(usage);

	// Commands section
	if (program.commands && program.commands.length > 0) {
		const commandLines: string[] = [colors.bright("Commands:")];
		const maxLen = Math.max(...program.commands.map((c) => c.name.length));

		for (const cmd of program.commands) {
			const name = padEnd(cmd.name, maxLen + 2);
			commandLines.push(`  ${colors.cyan(name)}${colors.dim(cmd.description)}`);
		}
		sections.push(commandLines.join("\n"));
	}

	// Options section
	if (program.options && Object.keys(program.options).length > 0) {
		sections.push(colors.bright("Options:"));
		sections.push(generateOptions(program.options));
	}

	return sections.join("\n\n");
};

/**
 * Generate command help text with beautiful Box component
 */
export const generateCommandHelp = (
	program: ProgramDef,
	commandName: string,
): string | null => {
	const cmd = program.commands?.find((c) => c.name === commandName);
	if (!cmd) return null;

	const sections: string[] = [];

	// Header with command name
	sections.push(`${program.name} ${cmd.name}`);
	if (cmd.description) {
		sections.push(cmd.description);
	}

	// Build usage string
	let usage = `${program.name} ${cmd.name}`;
	if (cmd.options && Object.keys(cmd.options).length > 0) {
		usage += " [options]";
	}
	if (cmd.arguments) {
		for (const arg of cmd.arguments) {
			if (arg.required) {
				usage += ` <${arg.name}>`;
			} else if (arg.variadic) {
				usage += ` [${arg.name}...]`;
			} else {
				usage += ` [${arg.name}]`;
			}
		}
	}

	// Usage section
	const usageSection = [
		colors.bright("Usage:"),
		`  ${colors.cyan(usage)}`,
	].join("\n");
	sections.push(usageSection);

	// Options section
	if (cmd.options && Object.keys(cmd.options).length > 0) {
		sections.push(colors.bright("Options:"));
		sections.push(generateOptions(cmd.options));
	}

	// Examples section
	if (cmd.examples && cmd.examples.length > 0) {
		const exampleLines = [colors.bright("Examples:")];
		for (const example of cmd.examples) {
			exampleLines.push(`  ${colors.dim("$")} ${colors.cyan(example)}`);
		}
		sections.push(exampleLines.join("\n"));
	}

	return sections.join("\n\n");
};

/**
 * Generate options text
 */
export const generateOptions = (options: Record<string, OptionDef>): string => {
	const lines: string[] = [];
	const maxLen = Math.max(...Object.values(options).map((o) => o.flags.length));

	for (const opt of Object.values(options)) {
		const flags = padEnd(opt.flags, maxLen + 2);
		let desc = opt.description;

		if (opt.default !== undefined) {
			desc += colors.dim(` (default: ${opt.default})`);
		}

		lines.push(`  ${colors.cyan(flags)}${desc}`);
	}

	return lines.join("\n");
};
