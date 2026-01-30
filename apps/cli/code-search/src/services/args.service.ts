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

const showHelp = () => {
	const helpText = [
		"code-search usage:",
		"  bun dev -- [paths...] --type <NodeType> [options]",
		"options:",
		"  --lang <ts|tsx|js>",
		"  --pattern <pattern>, -p <pattern>",
		"  --rule <rule_id>",
		"  --type <NodeType>",
		"  --output <text|json>",
		"  --count",
		"  --replace <text>",
		"  --check",
		"  --write",
		"  --help, -h",
	].join("\n");
	console.log(helpText);
	process.exit(0);
};

export const parseArgs = (argv: string[]): CliOptions => {
	const options: Partial<CliOptions> & { paths: string[] } = {
		paths: [],
		lang: DEFAULT_LANG,
		output: "text",
		countOnly: false,
		write: false,
		check: false,
	};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (!arg) continue;

		if (arg === "--help" || arg === "-h") {
			showHelp();
		}

		if (arg.startsWith("--")) {
			const [key, value] = arg.includes("=")
				? arg.slice(2).split("=", 2)
				: [arg.slice(2), argv[i + 1]];

			switch (key) {
				case "lang":
					options.lang = toLang(value);
					if (!arg.includes("=")) i++;
					break;
				case "type":
					options.nodeType = value;
					if (!arg.includes("=")) i++;
					break;
				case "pattern":
					options.pattern = value;
					if (!arg.includes("=")) i++;
					break;
				case "rule":
					options.rule = value;
					if (!arg.includes("=")) i++;
					break;
				case "output":
					options.output = toOutput(value);
					if (!arg.includes("=")) i++;
					break;
				case "replace":
					options.replace = value;
					if (!arg.includes("=")) i++;
					break;
				case "count":
					options.countOnly = true;
					break;
				case "check":
					options.check = true;
					break;
				case "write":
					options.write = true;
					break;
				default:
					throw new Error(`Unknown option: ${arg}`);
			}
		} else if (arg === "-p") {
			const next = argv[i + 1];
			if (!next) throw new Error("Missing value for --pattern");
			options.pattern = next;
			i++;
		} else {
			options.paths.push(arg);
		}
	}

	if (!options.nodeType && !options.pattern && !options.rule) {
		throw new Error("Missing required --type, --pattern, or --rule");
	}

	if (options.paths.length === 0) {
		options.paths.push(".");
	}

	return options as CliOptions;
};
