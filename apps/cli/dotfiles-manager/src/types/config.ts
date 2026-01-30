import { z } from "zod";

export const fileMapSchema = z.object({
	source: z.string().describe("Source file path"),
	target: z.string().describe("Target file path in dotfiles directory"),
});

export type FileMapping = z.infer<typeof fileMapSchema>;

export const gitRemoteSchema = z.object({
	url: z.string().url().optional().describe("Git remote URL"),
	branch: z.string().default("main").describe("Git branch name"),
});

export type GitRemote = z.infer<typeof gitRemoteSchema>;

export const configSchema = z.object({
	$schema: z.string().url().optional().describe("JSON Schema URL"),
	dotfilesDir: z.string().describe("Directory to store dotfiles"),
	files: z.array(fileMapSchema).default([]).describe("Managed files"),
	remote: gitRemoteSchema.optional().describe("Git remote configuration"),
	editor: z.string().optional().describe("Editor to use for opening files"),
	initialized: z.boolean().default(false).describe("Whether initialized"),
	templateData: z.record(z.string(), z.any()).optional().describe("Data for template rendering"),
	mode: z.enum(["copy", "symlink"]).default("copy").describe("Sync mode: copy or symlink"),
	scripts: z.object({
		before: z.array(z.string()).optional().describe("Commands to run before sync"),
		after: z.array(z.string()).optional().describe("Commands to run after sync"),
	}).optional().describe("Custom scripts"),
});

export type Config = z.infer<typeof configSchema>;
