import { z } from "zod";

export const GitStatusSchema = z.object({
	file: z.string(),
	status: z.string(),
	statusCode: z.string(),
});

export type GitStatus = z.infer<typeof GitStatusSchema>;

// Alias for backward compatibility
export type FileStatus = GitStatus;
