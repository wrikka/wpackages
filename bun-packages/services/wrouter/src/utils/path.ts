import { posix, sep } from "node:path";

export const toPosixPath = (p: string): string => p.split(sep).join(posix.sep);
