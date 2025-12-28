import { DEFAULT_LANG } from "../config/defaults.config";
import type { CliOptions, LangKey, OutputMode } from "../types/cli.type";

const toOutput = (raw: string | undefined): OutputMode => {
	if (!raw) return "text";
	if (raw === "json") return "json";
	if (raw === "text") return "text";
	throw new Error(`Unsupported --output: ${raw}`);
};

const toLang = (raw: string | undefined): LangKey => {
	if (!raw) return DEFAULT_LANG;
	if (raw === "ts" || raw === "typescript") return "typescript";
	if (raw === "tsx") return "tsx";
	if (raw === "js" || raw === "javascript") return "javascript";
	throw new Error(`Unsupported --lang: ${raw}`);
};

export const parseArgs = (argv: string[]): CliOptions => {
	let lang: CliOptions["lang"] = DEFAULT_LANG;
	let nodeType: string | undefined;
	const paths: string[] = [];
	let output: OutputMode = "text";
	let countOnly = false;
	let replace: string | undefined;
	let write = false;
	let check = false;

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (!arg) continue;

		if (arg === "--help" || arg === "-h") {
			throw new Error(
				[
					"code-search usage:",
					"  bun dev -- [paths...] --type <NodeType> [options]",
					"options:",
					"  --lang <ts|tsx|js>",
					"  --type <NodeType>",
					"  --output <text|json>",
					"  --count",
					"  --replace <text>",
					"  --check",
					"  --write",
				].join("\n"),
			);
		}

		if (arg === "--count") {
			countOnly = true;
			continue;
		}
		if (arg === "--check") {
			check = true;
			continue;
		}
		if (arg === "--write") {
			write = true;
			continue;
		}
		if (arg.startsWith("--lang=")) {
			lang = toLang(arg.split("=")[1]);
			continue;
		}
		if (arg === "--lang") {
			lang = toLang(argv[i + 1]);
			i++;
			continue;
		}
		if (arg.startsWith("--type=")) {
			nodeType = arg.slice("--type=".length);
			continue;
		}
		if (arg === "--type") {
			const next = argv[i + 1];
			if (!next) throw new Error("Missing value for --type");
			nodeType = next;
			i++;
			continue;
		}
		if (arg.startsWith("--output=")) {
			output = toOutput(arg.split("=")[1]);
			continue;
		}
		if (arg === "--output") {
			output = toOutput(argv[i + 1]);
			i++;
			continue;
		}
		if (arg.startsWith("--replace=")) {
			replace = arg.slice("--replace=".length);
			continue;
		}
		if (arg === "--replace") {
			const next = argv[i + 1];
			if (!next) throw new Error("Missing value for --replace");
			replace = next;
			i++;
			continue;
		}

		if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
		paths.push(arg);
	}

	if (!nodeType || nodeType.trim().length === 0) {
		throw new Error("Missing required --type");
	}

	return {
		paths: paths.length === 0 ? ["."] : paths,
		lang,
		nodeType,
		output,
		countOnly,
		replace,
		write,
		check,
	};
};
