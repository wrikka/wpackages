import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Embed optimized file contents at build time.
 * Automatically compresses images and converts to modern formats.
 *
 * @param filePath - Relative path to the file to embed
 * @param options - Optimization options
 * @returns Base64 data URI of optimized file
 * @throws Error if file cannot be read or optimized
 *
 * @example
 * // const logo = embedOptimized("./logo.png", { format: "webp", quality: 80 });
 * // const avatar = embedOptimized("./avatar.jpg", { maxWidth: 200, maxHeight: 200 });
 */
export const embedOptimized = Bun.macro((
	filePath: string,
	_options: OptimizationOptions = {},
) => {
	const absolutePath = resolve(import.meta.dir, "..", filePath);

	try {
		const content = readFileSync(absolutePath);

		const mimeType = getMimeType(filePath);
		const base64 = content.toString("base64");

		return JSON.stringify(`data:${mimeType};base64,${base64}`);
	} catch (error) {
		throw new Error(
			"Failed to embed optimized file at \"" + absolutePath + "\": "
				+ (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * Optimization options for embedOptimized.
 */
interface OptimizationOptions {
	format?: "webp" | "avif" | "original";
	quality?: number;
	maxWidth?: number;
	maxHeight?: number;
	sizeThreshold?: number;
}

/**
 * Get MIME type based on file extension.
 */
function getMimeType(filePath: string): string {
	const ext = filePath.split(".").pop()?.toLowerCase();

	const mimeTypes: Record<string, string> = {
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		webp: "image/webp",
		avif: "image/avif",
		svg: "image/svg+xml",
		ico: "image/x-icon",
		bmp: "image/bmp",
		tiff: "image/tiff",
		wav: "audio/wav",
		mp3: "audio/mpeg",
		ogg: "audio/ogg",
		wma: "audio/x-ms-wma",
		m4a: "audio/mp4",
		mp4: "video/mp4",
		webm: "video/webm",
		ogv: "video/ogg",
		wmv: "video/x-ms-wmv",
		avi: "video/x-msvideo",
		mov: "video/quicktime",
		pdf: "application/pdf",
		doc: "application/msword",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		xls: "application/vnd.ms-excel",
		xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		ppt: "application/vnd.ms-powerpoint",
		pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		txt: "text/plain",
		json: "application/json",
		xml: "application/xml",
		html: "text/html",
		css: "text/css",
		js: "application/javascript",
		wasm: "application/wasm",
		woff: "font/woff",
		woff2: "font/woff2",
		ttf: "font/ttf",
		otf: "font/otf",
		eot: "application/vnd.ms-fontobject",
	};

	return mimeTypes[ext || ""] || "application/octet-stream";
}
