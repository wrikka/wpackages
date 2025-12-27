import { Effect } from "effect";
import { NotificationError } from "../types";

/**
 * Simple template engine for notification messages
 * Replaces {{variable}} with values from data object
 */
export const renderTemplate = (
	template: string,
	data: Record<string, unknown>,
): Effect.Effect<string, NotificationError> =>
	Effect.gen(function*() {
		try {
			let result = template;

			// Replace all {{variable}} with actual values
			for (const [key, value] of Object.entries(data)) {
				const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
				result = result.replace(regex, String(value));
			}

			// Check for unreplaced variables
			const unreplaced = result.match(/{{[^}]+}}/g);
			if (unreplaced) {
				return yield* Effect.fail(
					new NotificationError({
						reason: "TemplateNotFound",
						message: `Template has unreplaced variables: ${unreplaced.join(", ")}`,
					}),
				);
			}

			return yield* Effect.succeed(result);
		} catch (error) {
			return yield* Effect.fail(
				new NotificationError({
					reason: "Unknown",
					message: `Template rendering failed: ${error instanceof Error ? error.message : String(error)}`,
				}),
			);
		}
	});

/**
 * Validate template syntax
 */
export const validateTemplate = (
	template: string,
): Effect.Effect<boolean, NotificationError> =>
	Effect.gen(function*() {
		try {
			// Check for matching braces
			let braceCount = 0;
			for (const char of template) {
				if (char === "{") braceCount++;
				if (char === "}") braceCount--;
				if (braceCount < 0) {
					return yield* Effect.fail(
						new NotificationError({
							reason: "TemplateNotFound",
							message: "Template has unmatched closing braces",
						}),
					);
				}
			}

			if (braceCount !== 0) {
				return yield* Effect.fail(
					new NotificationError({
						reason: "TemplateNotFound",
						message: "Template has unmatched opening braces",
					}),
				);
			}

			return yield* Effect.succeed(true);
		} catch (error) {
			return yield* Effect.fail(
				new NotificationError({
					reason: "Unknown",
					message: `Template validation failed: ${error instanceof Error ? error.message : String(error)}`,
				}),
			);
		}
	});
