import p from "picocolors";
import type { CliConfig, Command, Option } from "../types";

const INDENT = "  ";

const formatOptions = (options: ReadonlyArray<Option> = []) => {
	if (options.length === 0) return "";

	const optionLines = options.map(opt => {
		const shorthand = opt.shorthand ? `${p.cyan(`${opt.shorthand}`)},` : "";
		const name = p.green(`--${opt.name.replace(/^--/, "")}`);
		const description = p.dim(opt.description || "");
		const defaultValue = opt.defaultValue ? p.dim(`(default: ${opt.defaultValue})`) : "";
		return `${INDENT}${INDENT}${shorthand.padEnd(4)} ${name.padEnd(20)} ${description} ${defaultValue}`;
	});

	return `\n${INDENT}${p.bold("Options:")}\n${optionLines.join("\n")}`;
};

const formatCommand = (command: Command) => {
	const name = p.bold(p.yellow(command.name));
	const description = p.dim(command.description || "");
	const sub = command.subCommands ? p.dim("[...]") : "";
	return `${INDENT}${name.padEnd(20)} ${description} ${sub}`;
};

export const generateHelp = (config: CliConfig) => {
	const commandList = config.commands.map(formatCommand).join("\n");
	const commandDetails = config.commands
		.map(cmd => `\n${p.bold(p.yellow(cmd.name))}:${p.dim(cmd.description || "")}${formatOptions(cmd.options)}`)
		.join("\n");

	return `
${p.bold(p.magenta(config.name))} ${p.dim(`v${config.version}`)}

${p.bold("Usage:")}
${INDENT}$ ${p.cyan(config.name)} <command> [options]

${p.bold("Commands:")}
${commandList}

${p.bold("Command Details:")}
${commandDetails}
  `;
};
