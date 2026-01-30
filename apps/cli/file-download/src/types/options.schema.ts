import { z } from "zod";

export const UrlOptionsSchema = z.object({
	url: z.string().url(),
	output: z.string(),
});

export const GithubOptionsSchema = z.object({
	url: z.string().url(),
	output: z.string(),
});

export const JsonOptionsSchema = z.object({
	url: z.string().url(),
	output: z.string(),
});
