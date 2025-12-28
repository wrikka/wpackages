import type { Issue } from "../types";

export class ValidationError extends Error {
	public readonly issues: Issue[];

	constructor(issues: Issue[]) {
		super("Validation failed");
		this.name = "ValidationError";
		this.issues = issues;
	}
}
