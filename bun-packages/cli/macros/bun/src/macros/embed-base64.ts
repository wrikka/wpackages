import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Embed file contents as base64 string at build time.
 * Useful for embedding images, fonts, or binary files.
 *
 * @param filePath - Relative path to the file to embed
 * @returns The file content as a base64 data URI
 * @throws Error if the file cannot be read
 *
 * @example
 * const logo = embedBase64("./logo.png");
 * // "data:image/png;base64,iVBORw0KGgo..."
 */
export const embedBase64 = Bun.macro((filePath: string) => {
	const absolutePath = resolve(import.meta.dir, "..", filePath);
	try {
		const content = readFileSync(absolutePath);
		const base64 = content.toString("base64");

		const ext = absolutePath.split(".").pop();
		const mimeTypes: Record<string, string> = {
			png: "image/png",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			gif: "image/gif",
			svg: "image/svg+xml",
			webp: "image/webp",
			woff: "font/woff",
			woff2: "font/woff2",
			ttf: "font/ttf",
			eot: "application/vnd.ms-fontobject",
			json: "application/json",
			txt: "text/plain",
			html: "text/html",
			css: "text/css",
			js: "application/javascript",
		};
		const mimeType = mimeTypes[ext || ""] || "application/octet-stream";

		return JSON.stringify(`data:${mimeType};base64,${base64}`);
	} catch (error) {
		throw new Error(
			"Failed to read file at \"" + absolutePath + "\": " + (error instanceof Error ? error.message : String(error)),
		);
	}
});
