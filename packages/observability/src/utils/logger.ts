export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMeta = Readonly<Record<string, unknown>>;

export type LogRecord = Readonly<{
	level: LogLevel;
	message: string;
	timestamp: number;
	meta?: LogMeta;
}>;

export type LogSink = (record: LogRecord) => void;

export type LogFormatter<TOutput = unknown> = (record: LogRecord) => TOutput;

export type LoggerOptions = Readonly<{
	minLevel?: LogLevel;
	baseMeta?: LogMeta;
	sink: LogSink;
}>;

const logLevelOrder: Readonly<Record<LogLevel, number>> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
};

const shouldLog = (minLevel: LogLevel | undefined, level: LogLevel): boolean => {
	if (!minLevel) {
		return true;
	}
	return logLevelOrder[level] >= logLevelOrder[minLevel];
};

const mergeMeta = (base: LogMeta | undefined, next: LogMeta | undefined): LogMeta | undefined => {
	if (!base && !next) {
		return undefined;
	}
	return { ...base, ...next };
};

export type Logger = {
	log: (level: LogLevel, message: string, meta?: LogMeta) => void;
	debug: (message: string, meta?: LogMeta) => void;
	info: (message: string, meta?: LogMeta) => void;
	warn: (message: string, meta?: LogMeta) => void;
	error: (message: string, meta?: LogMeta) => void;
	child: (meta: LogMeta) => Logger;
};

export const createLogger = (options: LoggerOptions): Logger => {
	const log = (level: LogLevel, message: string, meta?: LogMeta) => {
		if (!shouldLog(options.minLevel, level)) {
			return;
		}
		const mergedMeta = mergeMeta(options.baseMeta, meta);
		const record: LogRecord = {
			level,
			message,
			timestamp: Date.now(),
			...(mergedMeta ? { meta: mergedMeta } : {}),
		};
		options.sink(record);
	};

	const child = (meta: LogMeta): Logger => {
		const mergedMeta = mergeMeta(options.baseMeta, meta);
		return createLogger({
			...options,
			...(mergedMeta ? { baseMeta: mergedMeta } : {}),
		});
	};

	return {
		log,
		debug: (message, meta) => log("debug", message, meta),
		info: (message, meta) => log("info", message, meta),
		warn: (message, meta) => log("warn", message, meta),
		error: (message, meta) => log("error", message, meta),
		child,
	};
};

export type ConsoleLoggerOptions = Readonly<{
	minLevel?: LogLevel;
	baseMeta?: LogMeta;
	formatter?: LogFormatter;
}>;

export const defaultConsoleFormatter: LogFormatter = (record) => {
	const payload = record.meta ? { message: record.message, ...record.meta } : { message: record.message };
	return payload;
};

export const createConsoleLogger = (options: ConsoleLoggerOptions = {}): Logger =>
	createLogger({
		...(options.minLevel ? { minLevel: options.minLevel } : {}),
		...(options.baseMeta ? { baseMeta: options.baseMeta } : {}),
		sink: (record) => {
			const formatter = options.formatter ?? defaultConsoleFormatter;
			const payload = formatter(record);
			switch (record.level) {
				case "debug":
					console.debug(payload);
					return;
				case "info":
					console.info(payload);
					return;
				case "warn":
					console.warn(payload);
					return;
				case "error":
					console.error(payload);
					return;
			}
		},
	});
