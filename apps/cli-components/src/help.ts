/**
 * CLI Help Generator
 * Uses pure components for rendering
 */

import { generateCommandHelp, generateProgramHelp } from "./components";
import type { ProgramDef } from "./types/index";

/**
 * Show help (side effect wrapper around pure components)
 */
export const showHelp = (program: ProgramDef, commandName?: string): void => {
	const helpText = commandName
		? generateCommandHelp(program, commandName)
		: generateProgramHelp(program);

	if (helpText) {
		console.log(helpText);
	}
};
