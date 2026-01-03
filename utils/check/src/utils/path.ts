import os from "node:os";
import path from "node:path";

const isWindows = process.platform === "win32";

const normalizeForCompare = (value: string): string => {
	const resolved = path.resolve(value);
	return isWindows ? resolved.toLowerCase() : resolved;
};

const isSubPath = (candidate: string, parent: string): boolean => {
	const c = normalizeForCompare(candidate);
	const p = normalizeForCompare(parent);

	if (c === p) return true;
	const sep = isWindows ? "\\" : "/";
	return c.startsWith(`${p}${sep}`);
};

const toPosixPath = (value: string): string => {
	return value.replaceAll("\\", "/");
};

const expandHome = (value: string): string => {
	if (value === "~") return os.homedir();
	if (value.startsWith("~/") || value.startsWith("~\\")) {
		return path.join(os.homedir(), value.slice(2));
	}
	return value;
};

export const formatPathForDisplay = (value: string): string => {
	const normalized = path.resolve(expandHome(value));
	const home = os.homedir();

	if (isSubPath(normalized, home)) {
		const rel = path.relative(home, normalized);
		return `~/${toPosixPath(rel)}`;
	}

	const cwd = process.cwd();
	if (isSubPath(normalized, cwd)) {
		const rel = path.relative(cwd, normalized);
		return toPosixPath(rel);
	}

	return toPosixPath(normalized);
};
