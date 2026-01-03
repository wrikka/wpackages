/**
 * Data format constants
 */

/**
 * Supported data formats
 */
export const DATA_FORMATS = {
	CSV: "csv",
	FORM_DATA: "form-data",
	JSON: "json",
	XML: "xml",
	YAML: "yaml",
} as const;

/**
 * Common date formats
 */
export const DATE_FORMATS = {
	ISO_8601: "YYYY-MM-DDTHH:mm:ss.sssZ",
	RFC_2822: "ddd, DD MMM YYYY HH:mm:ss ZZ",
	UNIX_TIMESTAMP: "X",
	UNIX_TIMESTAMP_MS: "x",
} as const;

/**
 * Encoding types
 */
export const ENCODINGS = {
	ASCII: "ascii",
	BASE64: "base64",
	HEX: "hex",
	UTF8: "utf-8",
} as const;
