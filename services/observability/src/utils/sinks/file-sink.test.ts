import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { LogRecord } from "../logger";
import { FileSinkImpl } from "./file-sink";

describe("FileSink", () => {
	let sink: (record: LogRecord) => void;
	let sinkImpl: FileSinkImpl;
	let testFilePath: string;

	beforeEach(() => {
		testFilePath = join(process.cwd(), "test-logs", "test.log");
		sinkImpl = new FileSinkImpl(testFilePath, {
			maxBytes: 1024,
			maxFiles: 3,
			compress: false,
			strategy: "size",
		});
		sink = (record: LogRecord) => sinkImpl.write(record);
	});

	afterEach(() => {
		if (existsSync(testFilePath)) {
			unlinkSync(testFilePath);
		}
		const statePath = `${testFilePath}.state`;
		if (existsSync(statePath)) {
			unlinkSync(statePath);
		}
	});

	it("should create file sink", () => {
		expect(sink).toBeDefined();
	});

	it("should write log to file", () => {
		const record: LogRecord = {
			level: "info",
			message: "test message",
			timestamp: Date.now(),
			meta: { key: "value" },
		};

		sink(record);

		expect(existsSync(testFilePath)).toBe(true);
	});

	it("should rotate file when size exceeds maxBytes", () => {
		const largeMessage = "x".repeat(600);
		const record: LogRecord = {
			level: "info",
			message: largeMessage,
			timestamp: Date.now(),
		};

		sink(record);
		sink(record);
		sink(record);

		const state = sinkImpl.getState();
		expect(state.rotatedFiles.length).toBeGreaterThan(0);
	});

	it("should cleanup old files when exceeding maxFiles", () => {
		const largeMessage = "x".repeat(600);
		const record: LogRecord = {
			level: "info",
			message: largeMessage,
			timestamp: Date.now(),
		};

		for (let i = 0; i < 10; i++) {
			sink(record);
		}

		const state = sinkImpl.getState();
		expect(state.rotatedFiles.length).toBeLessThanOrEqual(3);
	});

	it("should persist state between instances", () => {
		const record: LogRecord = {
			level: "info",
			message: "test message",
			timestamp: Date.now(),
		};

		sink(record);

		const newSinkImpl = new FileSinkImpl(testFilePath, {
			maxBytes: 1024,
			maxFiles: 3,
			compress: false,
			strategy: "size",
		});

		const state = newSinkImpl.getState();
		expect(state.currentSize).toBeGreaterThan(0);
	});

	it("should create directory if not exists", () => {
		const nestedPath = join(process.cwd(), "test-logs", "nested", "test.log");
		const nestedSinkImpl = new FileSinkImpl(nestedPath);
		const nestedSink = (record: LogRecord) => nestedSinkImpl.write(record);

		const record: LogRecord = {
			level: "info",
			message: "test",
			timestamp: Date.now(),
		};

		nestedSink(record);

		expect(existsSync(nestedPath)).toBe(true);

		if (existsSync(nestedPath)) {
			unlinkSync(nestedPath);
		}
	});

	it("should handle rotation by date", () => {
		const dateSinkImpl = new FileSinkImpl(testFilePath, {
			maxBytes: 1024 * 1024,
			maxFiles: 3,
			compress: false,
			strategy: "date",
			datePattern: "YYYY-MM-DD",
		});
		const dateSink = (record: LogRecord) => dateSinkImpl.write(record);

		const record: LogRecord = {
			level: "info",
			message: "test",
			timestamp: Date.now(),
		};

		dateSink(record);

		const state = dateSinkImpl.getState();
		expect(state.currentDate).toBeDefined();
	});

	it("should use default config when not provided", () => {
		const defaultSinkImpl = new FileSinkImpl(testFilePath);
		const defaultSink = (record: LogRecord) => defaultSinkImpl.write(record);

		const record: LogRecord = {
			level: "info",
			message: "test",
			timestamp: Date.now(),
		};

		defaultSink(record);

		expect(existsSync(testFilePath)).toBe(true);
	});
});
