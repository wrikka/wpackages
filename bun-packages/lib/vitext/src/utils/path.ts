import path from "node:path";

export const normalizePath = (p: string): string => {
	return path.normalize(p).replace(/\\/g, "/");
};

export const resolvePath = (root: string, relativePath: string): string => {
	return path.resolve(root, relativePath);
};

export const isAbsolute = (p: string): boolean => {
	return path.isAbsolute(p);
};
