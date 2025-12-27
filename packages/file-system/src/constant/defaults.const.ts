import type { FileEncoding } from "../types/fs";

export const DEFAULT_ENCODING: FileEncoding = "utf8";
export const DEFAULT_PERMISSIONS = 0o666; // rw-rw-rw-
export const DEFAULT_DIR_PERMISSIONS = 0o777; // rwxrwxrwx

export const COMMON_EXTENSIONS = {
	code: [".ts", ".js", ".tsx", ".jsx", ".json"],
	config: [".json", ".yaml", ".yml", ".toml", ".ini"],
	document: [".pdf", ".doc", ".docx"],
	image: [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"],
	text: [".txt", ".md", ".csv"],
} as const;

export const MIME_TYPES = {
	".css": "text/css",
	".gif": "image/gif",
	".html": "text/html",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".js": "application/javascript",
	".json": "application/json",
	".md": "text/markdown",
	".pdf": "application/pdf",
	".png": "image/png",
	".svg": "image/svg+xml",
	".ts": "application/typescript",
	".txt": "text/plain",
	".webp": "image/webp",
	".yaml": "application/yaml",
	".yml": "application/yaml",
} as const;

export const DEFAULT_MIME_TYPE = "application/octet-stream";
