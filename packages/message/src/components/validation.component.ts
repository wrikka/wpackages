import { Effect } from "effect";
import { NotificationError } from "../types";

/**
 * Validation Component - Pure functions for content validation and sanitization
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone number validation regex (basic international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Validate email address
 */
export const validateEmail = (
	email: string,
): Effect.Effect<boolean, NotificationError> =>
	Effect.try({
		try: () => {
			if (!EMAIL_REGEX.test(email)) {
				throw new NotificationError({
					reason: "InvalidRecipient",
					message: `Invalid email address: ${email}`,
				});
			}
			return true;
		},
		catch: (error) =>
			new NotificationError({
				reason: "Unknown",
				message: `Email validation failed: ${error instanceof Error ? error.message : String(error)}`,
			}),
	});

/**
 * Validate phone number
 */
export const validatePhoneNumber = (
	phone: string,
): Effect.Effect<boolean, NotificationError> =>
	Effect.try({
		try: () => {
			if (!PHONE_REGEX.test(phone)) {
				throw new NotificationError({
					reason: "InvalidRecipient",
					message: `Invalid phone number: ${phone}`,
				});
			}
			return true;
		},
		catch: (error) =>
			new NotificationError({
				reason: "Unknown",
				message: `Phone number validation failed: ${error instanceof Error ? error.message : String(error)}`,
			}),
	});

/**
 * Sanitize notification content (remove potential XSS, script tags, etc.)
 */
export const sanitizeContent = (content: string): string => {
	return content
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
		.replace(/javascript:/gi, "")
		.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
};
