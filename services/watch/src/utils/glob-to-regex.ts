/**
 * Convert glob pattern to RegExp
 * Shared utility for pattern matching
 */
const escapeRegex = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const globToRegex = (pattern: string): RegExp => {
	let regexStr = "^";
	let i = 0;

	while (i < pattern.length) {
		const char = pattern[i];

		if (!char) break;

		if (char === "*") {
			if (pattern[i + 1] === "*") {
				// Handle ** pattern
				if (pattern[i + 2] === "/") {
					// **/ means match any directory path (including zero directories)
					regexStr += "(?:.*/)?";
					i += 3;
				} else {
					// ** without trailing slash means match anything
					regexStr += ".*";
					i += 2;
				}
			} else {
				regexStr += "[^/]*";
				i += 1;
			}
		} else if (char === "?") {
			regexStr += "[^/]";
			i += 1;
		} else if (char === "/") {
			regexStr += "\\/";
			i += 1;
		} else if (char === "[") {
			// Character class
			const endBracket = pattern.indexOf("]", i);
			if (endBracket !== -1) {
				regexStr += pattern.substring(i, endBracket + 1);
				i = endBracket + 1;
			} else {
				regexStr += "\\[";
				i += 1;
			}
		} else if (char === "{") {
			// Brace expansion
			const endBrace = pattern.indexOf("}", i);
			if (endBrace !== -1) {
				const choices = pattern.substring(i + 1, endBrace).split(",");
				regexStr += "(?:" + choices.map((choice) => escapeRegex(choice)).join("|") + ")";
				i = endBrace + 1;
			} else {
				regexStr += "\\{";
				i += 1;
			}
		} else {
			// Regular character
			regexStr += escapeRegex(char);
			i += 1;
		}
	}

	regexStr += "$";
	return new RegExp(regexStr);
};
