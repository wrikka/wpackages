export function mapTypeToString(type: string): string {
	// Simple type mapping - could be enhanced
	const typeMap: Record<string, string> = {
		TSStringKeyword: "string",
		TSNumberKeyword: "number",
		TSBooleanKeyword: "boolean",
		TSVoidKeyword: "void",
		TSAnyKeyword: "any",
		TSUnknownKeyword: "unknown",
		TSNullKeyword: "null",
		TSUndefinedKeyword: "undefined",
		TSObjectKeyword: "object",
		TSSymbolKeyword: "symbol",
		TSBigIntKeyword: "bigint",
	};

	return typeMap[type] || type || "any";
}
