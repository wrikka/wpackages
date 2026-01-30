import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

export type LockFile = {
	version: string;
	timestamp: number;
	hash: string;
	env: Record<string, string>;
	metadata?: {
		environment?: string;
		paths?: string[];
		[metaKey: string]: unknown;
	};
};

const LOCK_FILE_NAME = ".env.lock";
const LOCK_VERSION = "1.0.0";

export const computeEnvHash = (env: Record<string, string>): string => {
	const sortedKeys = Object.keys(env).sort();
	const content = sortedKeys.map((key) => `${key}=${env[key]}`).join("\n");
	return crypto.createHash("sha256").update(content).digest("hex");
};

export const createLockFile = (
	env: Record<string, string>,
	metadata?: LockFile["metadata"],
): LockFile => {
	return {
		version: LOCK_VERSION,
		timestamp: Date.now(),
		hash: computeEnvHash(env),
		env: { ...env },
		metadata,
	};
};

export const saveLockFile = (lockFile: LockFile, directory = "."): void => {
	const filePath = path.resolve(process.cwd(), directory, LOCK_FILE_NAME);
	fs.writeFileSync(filePath, JSON.stringify(lockFile, null, 2), "utf8");
};

export const loadLockFile = (directory = "."): LockFile | null => {
	const filePath = path.resolve(process.cwd(), directory, LOCK_FILE_NAME);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const content = fs.readFileSync(filePath, "utf8");
	return JSON.parse(content) as LockFile;
};

export const verifyLockFile = (
	env: Record<string, string>,
	lockFile: LockFile,
): { valid: boolean; currentHash: string; lockHash: string } => {
	const currentHash = computeEnvHash(env);
	return {
		valid: currentHash === lockFile.hash,
		currentHash,
		lockHash: lockFile.hash,
	};
};

export const updateLockFile = (
	env: Record<string, string>,
	directory = ".",
	metadata?: LockFile["metadata"],
): LockFile => {
	const lockFile = createLockFile(env, metadata);
	saveLockFile(lockFile, directory);
	return lockFile;
};

export const checkLockFile = (
	env: Record<string, string>,
	directory = ".",
): { locked: boolean; valid: boolean; lockFile?: LockFile } => {
	const lockFile = loadLockFile(directory);

	if (!lockFile) {
		return { locked: false, valid: false };
	}

	const verification = verifyLockFile(env, lockFile);

	return {
		locked: true,
		valid: verification.valid,
		lockFile,
	};
};

export const getLockFileStatus = (directory = "."): {
	exists: boolean;
	version?: string;
	timestamp?: number;
	age?: number;
} => {
	const lockFile = loadLockFile(directory);

	if (!lockFile) {
		return { exists: false };
	}

	return {
		exists: true,
		version: lockFile.version,
		timestamp: lockFile.timestamp,
		age: Date.now() - lockFile.timestamp,
	};
};
