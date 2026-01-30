import { homedir } from "node:os";
import { join } from "node:path";
import type { Config } from "../types";

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Config = {
	dotfilesDir: join(homedir(), ".dotfiles"),
	files: [],
	initialized: false,
	templateData: {},
	mode: "copy",
} as const;

/**
 * Default git configuration
 */
export const DEFAULT_GIT_CONFIG = {
	branch: "main",
	userName: "Dotfiles Manager",
	userEmail: "dotfiles@manager",
} as const;
