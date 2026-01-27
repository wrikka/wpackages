import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "fs";
import { basename, dirname, extname, join } from "path";
import type { LogRecord } from "../logger";
import type { RotationConfig, RotationState } from "./rotation-config";

const DEFAULT_CONFIG: Required<RotationConfig> = {
	maxBytes: 10 * 1024 * 1024,
	datePattern: "YYYY-MM-DD",
	maxFiles: 10,
	compress: true,
	strategy: "both",
};

export class FileSinkImpl {
	private filePath: string;
	private config: Required<RotationConfig>;
	private state: RotationState;
	private stateFilePath: string;

	constructor(filePath: string, config: RotationConfig = {}) {
		this.filePath = filePath;
		this.config = { ...DEFAULT_CONFIG, ...config } as Required<RotationConfig>;
		this.stateFilePath = `${filePath}.state`;
		this.state = this.loadState();
		this.ensureDirectoryExists();
	}

	write(record: LogRecord): void {
		const logLine = `${JSON.stringify(record)}\n`;
		const logSize = Buffer.byteLength(logLine, "utf8");

		this.checkRotation();
		this.writeLog(logLine);
		this.state.currentSize += logSize;
		this.saveState();
	}

	private ensureDirectoryExists(): void {
		const dir = dirname(this.filePath);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
	}

	private checkRotation(): void {
		const currentDate = this.getCurrentDate();
		const shouldRotateBySize = this.state.currentSize >= this.config.maxBytes;
		const shouldRotateByDate = this.state.currentDate !== currentDate;

		if (shouldRotateBySize || shouldRotateByDate) {
			this.rotateFile(currentDate);
		}
	}

	private rotateFile(currentDate: string): void {
		const timestamp = Date.now();
		const ext = extname(this.filePath);
		const baseName = basename(this.filePath, ext);
		const rotatedPath = join(dirname(this.filePath), `${baseName}-${timestamp}${ext}`);

		if (existsSync(this.filePath)) {
			this.renameFile(this.filePath, rotatedPath);
		}

		if (this.config.compress) {
			this.compressFile(rotatedPath);
		}

		this.state.rotatedFiles.push({
			path: rotatedPath,
			size: this.state.currentSize,
			compressed: this.config.compress,
			createdAt: timestamp,
		});

		this.cleanupOldFiles();
		this.state.currentSize = 0;
		this.state.currentDate = currentDate;
	}

	private renameFile(oldPath: string, newPath: string): void {
		const content = readFileSync(oldPath);
		writeFileSync(newPath, content);
		unlinkSync(oldPath);
	}

	private compressFile(filePath: string): void {
		if (!existsSync(filePath)) {
			return;
		}
		const compressedPath = `${filePath}.gz`;
		const content = readFileSync(filePath);
		const compressed = this.gzipCompress(content);
		writeFileSync(compressedPath, compressed);
		unlinkSync(filePath);
	}

	private gzipCompress(data: Buffer): Buffer {
		return data;
	}

	private cleanupOldFiles(): void {
		if (this.state.rotatedFiles.length > this.config.maxFiles) {
			const filesToDelete = this.state.rotatedFiles.slice(0, this.state.rotatedFiles.length - this.config.maxFiles);

			for (const file of filesToDelete) {
				const filePath = file.compressed ? `${file.path}.gz` : file.path;
				if (existsSync(filePath)) {
					unlinkSync(filePath);
				}
			}

			this.state.rotatedFiles = this.state.rotatedFiles.slice(-this.config.maxFiles);
		}
	}

	private writeLog(logLine: string): void {
		appendFileSync(this.filePath, logLine, { encoding: "utf8" });
	}

	private getCurrentDate(): string {
		const now = new Date();
		const pattern = this.config.datePattern;

		return pattern
			.replace("YYYY", String(now.getFullYear()))
			.replace("MM", String(now.getMonth() + 1).padStart(2, "0"))
			.replace("DD", String(now.getDate()).padStart(2, "0"))
			.replace("HH", String(now.getHours()).padStart(2, "0"))
			.replace("mm", String(now.getMinutes()).padStart(2, "0"))
			.replace("ss", String(now.getSeconds()).padStart(2, "0"));
	}

	private loadState(): RotationState {
		if (existsSync(this.stateFilePath)) {
			try {
				const content = readFileSync(this.stateFilePath, "utf8");
				return JSON.parse(content);
			} catch {
				return this.createInitialState();
			}
		}
		return this.createInitialState();
	}

	private createInitialState(): RotationState {
		const currentSize = existsSync(this.filePath) ? statSync(this.filePath).size : 0;
		return {
			currentSize,
			currentDate: this.getCurrentDate(),
			rotatedFiles: [],
		};
	}

	private saveState(): void {
		writeFileSync(this.stateFilePath, JSON.stringify(this.state), "utf8");
	}

	getState(): Readonly<RotationState> {
		return this.state;
	}
}

export function createFileSink(filePath: string, config?: RotationConfig): (record: LogRecord) => void {
	const sink = new FileSinkImpl(filePath, config);
	return (record) => sink.write(record);
}

export function createRotatingFileSink(filePath: string, config?: RotationConfig): (record: LogRecord) => void {
	const sink = new FileSinkImpl(filePath, config);
	return (record) => sink.write(record);
}
