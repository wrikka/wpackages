export type PathParts = Readonly<{
	pathname?: string;
	search?: string;
	hash?: string;
}>;

/**
 * Creates a URL path from its component parts.
 *
 * @param {PathParts} parts The parts of the path.
 * @returns {string} The complete URL path.
 */
export function createPath({ pathname = "/", search = "", hash = "" }: PathParts): string {
	let path = pathname;

	if (search && search !== "?") {
		path += search.charAt(0) === "?" ? search : `?${search}`;
	}

	if (hash && hash !== "#") {
		path += hash.charAt(0) === "#" ? hash : `#${hash}`;
	}

	return path;
}

export type ParsedPath = Readonly<{
	pathname: string;
	search: string;
	hash: string;
}>;

/**
 * Parses a URL path into its component parts.
 *
 * @param {string} path The URL path to parse.
 * @returns {ParsedPath} The parsed parts of the path.
 */
export function parsePath(path: string): ParsedPath {
	try {
		const url = new URL(path, "http://localhost");
		return {
			pathname: url.pathname,
			search: url.search,
			hash: url.hash,
		};
	} catch (e) {
		console.warn(`Failed to parse path: "${path}"`, e);
		// Fallback for invalid paths
		return {
			pathname: path,
			search: "",
			hash: "",
		};
	}
}
