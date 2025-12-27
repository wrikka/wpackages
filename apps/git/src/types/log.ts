import { z } from "zod";

export const GitLogEntrySchema = z.object({
	hash: z.string(),
	message: z.string(),
	author: z.string(),
	date: z.string(),
});

export type GitLogEntry = z.infer<typeof GitLogEntrySchema>;
