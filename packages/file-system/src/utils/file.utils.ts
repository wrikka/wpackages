import { getExtension, isExtensionInCategory } from "../components/extension";
import { COMMON_EXTENSIONS, DEFAULT_MIME_TYPE, MIME_TYPES } from "../constant/defaults.const";

// Check if text file
export const isTextFile = (filename: string): boolean => {
	const ext = getExtension(filename);
	return isExtensionInCategory(ext, COMMON_EXTENSIONS.text);
};

// Check if code file
export const isCodeFile = (filename: string): boolean => {
	const ext = getExtension(filename);
	return isExtensionInCategory(ext, COMMON_EXTENSIONS.code);
};

// Check if config file
export const isConfigFile = (filename: string): boolean => {
	const ext = getExtension(filename);
	return isExtensionInCategory(ext, COMMON_EXTENSIONS.config);
};

// Check if image file
export const isImageFile = (filename: string): boolean => {
	const ext = getExtension(filename);
	return isExtensionInCategory(ext, COMMON_EXTENSIONS.image);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
};

// Get mime type from extension
export const getMimeType = (filename: string): string => {
	const ext = getExtension(filename);
	return ext ? (MIME_TYPES[ext as keyof typeof MIME_TYPES] ?? DEFAULT_MIME_TYPE) : DEFAULT_MIME_TYPE;
};
