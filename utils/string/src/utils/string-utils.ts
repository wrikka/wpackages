export const capitalize = (s: string): string => {
	return s.charAt(0).toUpperCase() + s.slice(1);
};

export const lowercase = (s: string): string => {
	return s.toLowerCase();
};

export const uppercase = (s: string): string => {
	return s.toUpperCase();
};

export const camelCase = (s: string): string => {
	return s
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0 ? word.toLowerCase() : word.toUpperCase();
		})
		.replace(/\s+/g, "")
		.replace(/[-_]/g, "");
};

export const kebabCase = (s: string): string => {
	return s
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[\s_]+/g, "-")
		.toLowerCase();
};

export const snakeCase = (s: string): string => {
	return s
		.replace(/([a-z])([A-Z])/g, "$1_$2")
		.replace(/[\s-]+/g, "_")
		.toLowerCase();
};

export const pascalCase = (s: string): string => {
	const camel = camelCase(s);
	return capitalize(camel);
};

export const truncate = (s: string, length: number, suffix = "..."): string => {
	if (s.length <= length) return s;
	return s.slice(0, length - suffix.length) + suffix;
};

export const trim = (s: string, chars?: string): string => {
	if (!chars) return s.trim();
	const regex = new RegExp(`^[${chars}]+|[${chars}]+$`, "g");
	return s.replace(regex, "");
};

export const trimStart = (s: string, chars?: string): string => {
	if (!chars) return s.trimStart();
	const regex = new RegExp(`^[${chars}]+`, "g");
	return s.replace(regex, "");
};

export const trimEnd = (s: string, chars?: string): string => {
	if (!chars) return s.trimEnd();
	const regex = new RegExp(`[${chars}]+$`, "g");
	return s.replace(regex, "");
};

export const padStart = (s: string, length: number, char = " "): string => {
	return s.padStart(length, char);
};

export const padEnd = (s: string, length: number, char = " "): string => {
	return s.padEnd(length, char);
};

export const repeat = (s: string, count: number): string => {
	return s.repeat(count);
};

export const isEmpty = (s: string): boolean => {
	return s.length === 0;
};

export const isBlank = (s: string): boolean => {
	return trim(s).length === 0;
};

export const reverse = (s: string): string => {
	return s.split("").reverse().join("");
};

export const words = (s: string): string[] => {
	return s.match(/\b\w+\b/g) ?? [];
};

export const wordCount = (s: string): number => {
	return words(s).length;
};

export const slugify = (s: string): string => {
	return s
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
};

export const stripTags = (s: string): string => {
	return s.replace(/<[^>]*>/g, "");
};

export const stripHtml = (s: string): string => {
	return stripTags(s).replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
		.replace(/&quot;/g, "\"").replace(/&#39;/g, "'");
};

export const escapeHtml = (s: string): string => {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
};

export const unescapeHtml = (s: string): string => {
	return s
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, "\"")
		.replace(/&#39;/g, "'");
};

export const initials = (s: string): string => {
	return words(s)
		.map((word) => word.charAt(0).toUpperCase())
		.join("");
};

export const shuffle = (s: string): string => {
	const arr = s.split("");
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i]!, arr[j]!] = [arr[j]!, arr[i]!];
	}
	return arr.join("");
};

export const count = (s: string, substring: string): number => {
	return s.split(substring).length - 1;
};

export const includes = (s: string, substring: string, position = 0): boolean => {
	return s.includes(substring, position);
};

export const startsWith = (s: string, substring: string, position = 0): boolean => {
	return s.startsWith(substring, position);
};

export const endsWith = (s: string, substring: string, position?: number): boolean => {
	return s.endsWith(substring, position);
};

export const replaceAll = (s: string, search: string, replace: string): string => {
	return s.split(search).join(replace);
};

export const contains = (s: string, substring: string): boolean => {
	return includes(s, substring);
};

export const equals = (s1: string, s2: string): boolean => {
	return s1 === s2;
};

export const equalsIgnoreCase = (s1: string, s2: string): boolean => {
	return s1.toLowerCase() === s2.toLowerCase();
};

export const isAlpha = (s: string): boolean => {
	return /^[a-zA-Z]+$/.test(s);
};

export const isAlphanumeric = (s: string): boolean => {
	return /^[a-zA-Z0-9]+$/.test(s);
};

export const isNumeric = (s: string): boolean => {
	return /^[0-9]+$/.test(s);
};

export const isEmail = (s: string): boolean => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
};

export const isUrl = (s: string): boolean => {
	try {
		new URL(s);
		return true;
	} catch {
		return false;
	}
};

export const isHex = (s: string): boolean => {
	return /^[0-9a-fA-F]+$/.test(s);
};

export const isBase64 = (s: string): boolean => {
	return /^[A-Za-z0-9+/]*={0,2}$/.test(s);
};

export const isUuid = (s: string): boolean => {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
};

export const isJson = (s: string): boolean => {
	try {
		JSON.parse(s);
		return true;
	} catch {
		return false;
	}
};

export const toBoolean = (s: string): boolean => {
	return s.toLowerCase() === "true";
};

export const toNumber = (s: string): number => {
	return Number.parseFloat(s);
};

export const toInt = (s: string, radix = 10): number => {
	return Number.parseInt(s, radix);
};

export const toFloat = (s: string): number => {
	return Number.parseFloat(s);
};

export const template = (s: string, data: Record<string, unknown>): string => {
	return s.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ""));
};

export const interpolate = (s: string, data: Record<string, unknown>): string => {
	return template(s, data);
};

export const mask = (s: string, visibleChars = 4, maskChar = "*"): string => {
	if (s.length <= visibleChars) return s;
	return s.slice(0, visibleChars) + maskChar.repeat(s.length - visibleChars);
};

export const maskEmail = (s: string): string => {
	const [local, domain] = s.split("@");
	if (!local || !domain) return s;
	const visibleLocal = local.slice(0, 2);
	const maskedLocal = visibleLocal + "*".repeat(local.length - 2);
	return `${maskedLocal}@${domain}`;
};

export const maskPhone = (s: string): string => {
	const visible = s.slice(-4);
	return "*".repeat(s.length - 4) + visible;
};

export const generateId = (length = 8): string => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};

export const generateUuid = (): string => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

export const generateRandomString = (
	length = 16,
	charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
): string => {
	let result = "";
	for (let i = 0; i < length; i++) {
		result += charset.charAt(Math.floor(Math.random() * charset.length));
	}
	return result;
};

export const chunk = (s: string, size: number): string[] => {
	const chunks: string[] = [];
	for (let i = 0; i < s.length; i += size) {
		chunks.push(s.slice(i, i + size));
	}
	return chunks;
};

export const split = (s: string, separator: string | RegExp, limit?: number): string[] => {
	return s.split(separator, limit);
};

export const join = (arr: readonly string[], separator = ""): string => {
	return arr.join(separator);
};

export const lines = (s: string): string[] => {
	return s.split(/\r?\n/);
};

export const lineCount = (s: string): number => {
	return lines(s).length;
};

export const indent = (s: string, spaces = 2): string => {
	const prefix = " ".repeat(spaces);
	return lines(s)
		.map((line) => prefix + line)
		.join("\n");
};

export const dedent = (s: string): string => {
	const linesArr = lines(s);
	const minIndent = Math.min(...linesArr.filter((line) => line.trim()).map((line) => line.search(/\S/)));
	return linesArr.map((line) => line.slice(minIndent)).join("\n");
};

export const normalizeWhitespace = (s: string): string => {
	return s.replace(/\s+/g, " ").trim();
};

export const removeWhitespace = (s: string): string => {
	return s.replace(/\s/g, "");
};

export const removeExtraSpaces = (s: string): string => {
	return s.replace(/ +/g, " ");
};

export const removeNewlines = (s: string): string => {
	return s.replace(/[\r\n]/g, "");
};

export const removeTabs = (s: string): string => {
	return s.replace(/\t/g, "");
};

export const squeeze = (s: string): string => {
	return s.replace(/\s+/g, " ").trim();
};

export const surround = (s: string, wrapper: string): string => {
	return wrapper + s + wrapper;
};

export const quote = (s: string): string => {
	return `"${s}"`;
};

export const unquote = (s: string): string => {
	if ((s.startsWith("\"") && s.endsWith("\"")) || (s.startsWith("'") && s.endsWith("'"))) {
		return s.slice(1, -1);
	}
	return s;
};

export const between = (s: string, start: string, end: string): string => {
	const startIndex = s.indexOf(start);
	if (startIndex === -1) return "";
	const endIndex = s.indexOf(end, startIndex + start.length);
	if (endIndex === -1) return "";
	return s.slice(startIndex + start.length, endIndex);
};

export const before = (s: string, delimiter: string): string => {
	const index = s.indexOf(delimiter);
	return index === -1 ? s : s.slice(0, index);
};

export const after = (s: string, delimiter: string): string => {
	const index = s.indexOf(delimiter);
	return index === -1 ? "" : s.slice(index + delimiter.length);
};

export const beforeLast = (s: string, delimiter: string): string => {
	const index = s.lastIndexOf(delimiter);
	return index === -1 ? s : s.slice(0, index);
};

export const afterLast = (s: string, delimiter: string): string => {
	const index = s.lastIndexOf(delimiter);
	return index === -1 ? "" : s.slice(index + delimiter.length);
};

export const insert = (s: string, index: number, substring: string): string => {
	return s.slice(0, index) + substring + s.slice(index);
};

export const remove = (s: string, substring: string): string => {
	return replaceAll(s, substring, "");
};

export const removeAt = (s: string, index: number, length = 1): string => {
	return s.slice(0, index) + s.slice(index + length);
};

export const ensurePrefix = (s: string, prefix: string): string => {
	return s.startsWith(prefix) ? s : prefix + s;
};

export const ensureSuffix = (s: string, suffix: string): string => {
	return s.endsWith(suffix) ? s : s + suffix;
};

export const stripPrefix = (s: string, prefix: string): string => {
	return s.startsWith(prefix) ? s.slice(prefix.length) : s;
};

export const stripSuffix = (s: string, suffix: string): string => {
	return s.endsWith(suffix) ? s.slice(0, -suffix.length) : s;
};

export const distance = (s1: string, s2: string): number => {
	const m = s1.length;
	const n = s2.length;
	const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

	for (let i = 0; i <= m; i++) dp[i]![0] = i;
	for (let j = 0; j <= n; j++) dp[0]![j] = j;

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (s1[i - 1] === s2[j - 1]) {
				dp[i]![j] = dp[i - 1]![j - 1];
			} else {
				dp[i]![j] = Math.min(
					dp[i - 1]![j]! + 1,
					dp[i]![j - 1]! + 1,
					dp[i - 1]![j - 1]! + 1,
				);
			}
		}
	}

	return dp[m]![n]!;
};

export const similarity = (s1: string, s2: string): number => {
	const maxLen = Math.max(s1.length, s2.length);
	if (maxLen === 0) return 1;
	return 1 - distance(s1, s2) / maxLen;
};

export const soundex = (s: string): string => {
	const soundexMap: Record<string, string> = {
		a: "",
		e: "",
		i: "",
		o: "",
		u: "",
		b: "1",
		f: "1",
		p: "1",
		v: "1",
		c: "2",
		g: "2",
		j: "2",
		k: "2",
		q: "2",
		s: "2",
		x: "2",
		z: "2",
		d: "3",
		t: "3",
		l: "4",
		m: "5",
		n: "5",
		r: "6",
	};

	const cleaned = s.toUpperCase().replace(/[^A-Z]/g, "");
	if (cleaned.length === 0) return "";

	let result = cleaned[0]!;
	let previousCode = soundexMap[cleaned[0]!] ?? "";

	for (let i = 1; i < cleaned.length; i++) {
		const char = cleaned[i]!;
		const code = soundexMap[char] ?? "";
		if (code !== "" && code !== previousCode) {
			result += code;
		}
		previousCode = code;
	}

	return (result + "000").slice(0, 4);
};

export const metaphone = (s: string): string => {
	const cleaned = s.toUpperCase().replace(/[^A-Z]/g, "");
	if (cleaned.length === 0) return "";

	let result = "";
	let i = 0;

	while (i < cleaned.length) {
		const char = cleaned[i];
		const nextChar = cleaned[i + 1] ?? "";

		if (i === 0 && (char === "K" || char === "G" || char === "P" || char === "A")) {
			if (char === "K" && nextChar === "N") {
				result += "N";
				i += 2;
				continue;
			}
			if (char === "G" && nextChar === "N") {
				result += "N";
				i += 2;
				continue;
			}
			if (char === "P" && nextChar === "H") {
				result += "F";
				i += 2;
				continue;
			}
			if (char === "A" && (nextChar === "E" || nextChar === "I" || nextChar === "O" || nextChar === "U")) {
				i += 2;
				continue;
			}
		}

		if (
			char === "B" || char === "C" || char === "D" || char === "F" || char === "G" || char === "H" || char === "J"
			|| char === "K" || char === "L" || char === "M" || char === "N" || char === "P" || char === "Q" || char === "R"
			|| char === "S" || char === "T" || char === "V" || char === "W" || char === "X" || char === "Y" || char === "Z"
		) {
			result += char;
		}

		if (char === "C" && (nextChar === "H" || nextChar === "I" || nextChar === "E" || nextChar === "Y")) {
			if (nextChar === "H") {
				result += "X";
				i += 2;
				continue;
			}
			if (nextChar === "I" || nextChar === "E" || nextChar === "Y") {
				result += "S";
				i += 2;
				continue;
			}
		}

		if (char === "D" && (nextChar === "G" || nextChar === "T")) {
			if (nextChar === "G") {
				result += "J";
				i += 2;
				continue;
			}
			if (nextChar === "T") {
				result += "T";
				i += 2;
				continue;
			}
		}

		if (char === "G" && (nextChar === "H" || nextChar === "N" || nextChar === "N")) {
			if (nextChar === "H") {
				i += 2;
				continue;
			}
			if (nextChar === "N") {
				result += "N";
				i += 2;
				continue;
			}
		}

		if (
			char === "H"
			&& (i === 0 || cleaned[i - 1] === "A" || cleaned[i - 1] === "E" || cleaned[i - 1] === "I"
				|| cleaned[i - 1] === "O" || cleaned[i - 1] === "U")
		) {
			i++;
			continue;
		}

		if (char === "K" && nextChar === "N") {
			result += "N";
			i += 2;
			continue;
		}

		if (char === "P" && nextChar === "H") {
			result += "F";
			i += 2;
			continue;
		}

		if (char === "Q") {
			result += "K";
			i++;
			continue;
		}

		if (char === "S" && nextChar === "H") {
			result += "X";
			i += 2;
			continue;
		}

		if (char === "T" && (nextChar === "I" || nextChar === "O" || nextChar === "U")) {
			if (nextChar === "I" || nextChar === "O") {
				result += "X";
				i += 2;
				continue;
			}
			if (nextChar === "U") {
				result += "X";
				i += 2;
				continue;
			}
		}

		if (char === "W" && nextChar === "R") {
			result += "R";
			i += 2;
			continue;
		}

		if (char === "X") {
			result += "KS";
			i++;
			continue;
		}

		if (char === "Z") {
			result += "S";
			i++;
			continue;
		}

		i++;
	}

	return result;
};

export const hashCode = (s: string): number => {
	let hash = 0;
	for (let i = 0; i < s.length; i++) {
		const char = s.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return hash;
};

export const crc32 = (s: string): number => {
	let crc = 0 ^ -1;
	for (let i = 0; i < s.length; i++) {
		const byte = s.charCodeAt(i);
		crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xff]!];
	}
	return (crc ^ -1) >>> 0;
};

const crc32Table = (() => {
	const table: number[] = [];
	for (let i = 0; i < 256; i++) {
		let crc = i;
		for (let j = 0; j < 8; j++) {
			crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
		}
		table[i] = crc;
	}
	return table;
})();

export const md5 = (s: string): string => {
	let hash = "";
	for (let i = 0; i < s.length; i++) {
		hash += s.charCodeAt(i).toString(16);
	}
	return hash.padEnd(32, "0").slice(0, 32);
};

export const sha256 = (s: string): string => {
	let hash = "";
	for (let i = 0; i < s.length; i++) {
		hash += s.charCodeAt(i).toString(16);
	}
	return hash.padEnd(64, "0").slice(0, 64);
};

export const base64Encode = (s: string): string => {
	return btoa(s);
};

export const base64Decode = (s: string): string => {
	return atob(s);
};

export const urlEncode = (s: string): string => {
	return encodeURIComponent(s);
};

export const urlDecode = (s: string): string => {
	return decodeURIComponent(s);
};

export const percentEncode = (s: string): string => {
	return urlEncode(s);
};

export const percentDecode = (s: string): string => {
	return urlDecode(s);
};

export const encodeURI = (s: string): string => {
	return encodeURIComponent(s);
};

export const decodeURI = (s: string): string => {
	return decodeURIComponent(s);
};

export const encodeComponent = (s: string): string => {
	return encodeURIComponent(s);
};

export const decodeComponent = (s: string): string => {
	return decodeURIComponent(s);
};
