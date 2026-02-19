import type { CliOptions, OutputFormat } from "../types/cli";

export const parseArgs = (argv: string[]): CliOptions => {
	let environment: string | undefined;
	const paths: string[] = [];
	let expand = true;
	let override = false;
	let output: OutputFormat = "json";
	let schema: string | undefined;
	let validate = false;
	let generateExample = false;
	let exampleOutput: string | undefined;
	let encrypt: string | undefined;
	let decrypt: string | undefined;
	let audit = false;
	let diff: string | undefined;
	let merge: string | undefined;
	let template: string | undefined;
	let templateList = false;
	let templateSave: string | undefined;
	let templateDelete: string | undefined;
	let generateTypes: string | undefined;
	let completion: "bash" | "zsh" | "fish" | "powershell" | undefined;
	let migrate: "up" | "down" | "status" | undefined;
	let migrateTarget: string | undefined;
	let lock = false;
	let lockCheck = false;
	let web = false;

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === undefined) continue;
		if (arg === "--help" || arg === "-h") {
			throw new Error(
				[
					"env-manager usage:",
					"  bun dev -- [paths...] [options]",
					"options:",
					"  --env <name>              NODE_ENV override",
					"  --no-expand               disable variable expansion",
					"  --override                write values into process.env",
					"  --output <json|dotenv>    output format",
					"  --schema <path>           path to schema file (JSON)",
					"  --validate                validate env variables against schema",
					"  --generate-example        generate .env.example file",
					"  --example-output <path>   output path for .env.example",
					"  --encrypt <key>           encrypt a value",
					"  --decrypt <value>         decrypt a value",
					"  --audit                   run security audit",
					"  --diff <file>             compare with another env file",
					"  --merge <file>            merge with another env file",
					"  --template <name>         apply a template",
					"  --template-list           list available templates",
					"  --template-save <name>    save current env as template",
					"  --template-delete <name>  delete a template",
					"  --generate-types <path>   generate TypeScript types",
					"  --completion <shell>      generate shell completions",
					"  --migrate <up|down|status> run migrations",
					"  --migrate-target <ver>    target migration version",
					"  --lock                    create/update lock file",
					"  --lock-check              verify lock file",
					"  --web                     start web UI",
				].join("\n"),
			);
		}

		if (arg.startsWith("--env=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--env requires a value");
			environment = value;
			continue;
		}
		if (arg === "--env") {
			const value = argv[i + 1];
			if (!value) throw new Error("--env requires a value");
			environment = value;
			i++;
			continue;
		}
		if (arg === "--no-expand") {
			expand = false;
			continue;
		}
		if (arg === "--override") {
			override = true;
			continue;
		}
		if (arg.startsWith("--output=")) {
			const value = arg.split("=")[1];
			if (value === "json" || value === "dotenv") output = value;
			else throw new Error(`Invalid --output: ${value ?? ""}`);
			continue;
		}
		if (arg === "--output") {
			const value = argv[i + 1];
			if (value === "json" || value === "dotenv") output = value;
			else throw new Error(`Invalid --output: ${value ?? ""}`);
			i++;
			continue;
		}
		if (arg.startsWith("--schema=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--schema requires a value");
			schema = value;
			continue;
		}
		if (arg === "--schema") {
			const value = argv[i + 1];
			if (!value) throw new Error("--schema requires a value");
			schema = value;
			i++;
			continue;
		}
		if (arg === "--validate") {
			validate = true;
			continue;
		}
		if (arg === "--generate-example") {
			generateExample = true;
			continue;
		}
		if (arg.startsWith("--example-output=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--example-output requires a value");
			exampleOutput = value;
			continue;
		}
		if (arg === "--example-output") {
			const value = argv[i + 1];
			if (!value) throw new Error("--example-output requires a value");
			exampleOutput = value;
			i++;
			continue;
		}
		if (arg.startsWith("--encrypt=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--encrypt requires a value");
			encrypt = value;
			continue;
		}
		if (arg === "--encrypt") {
			const value = argv[i + 1];
			if (!value) throw new Error("--encrypt requires a value");
			encrypt = value;
			i++;
			continue;
		}
		if (arg.startsWith("--decrypt=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--decrypt requires a value");
			decrypt = value;
			continue;
		}
		if (arg === "--decrypt") {
			const value = argv[i + 1];
			if (!value) throw new Error("--decrypt requires a value");
			decrypt = value;
			i++;
			continue;
		}
		if (arg === "--audit") {
			audit = true;
			continue;
		}
		if (arg.startsWith("--diff=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--diff requires a value");
			diff = value;
			continue;
		}
		if (arg === "--diff") {
			const value = argv[i + 1];
			if (!value) throw new Error("--diff requires a value");
			diff = value;
			i++;
			continue;
		}
		if (arg.startsWith("--merge=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--merge requires a value");
			merge = value;
			continue;
		}
		if (arg === "--merge") {
			const value = argv[i + 1];
			if (!value) throw new Error("--merge requires a value");
			merge = value;
			i++;
			continue;
		}
		if (arg.startsWith("--template=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--template requires a value");
			template = value;
			continue;
		}
		if (arg === "--template") {
			const value = argv[i + 1];
			if (!value) throw new Error("--template requires a value");
			template = value;
			i++;
			continue;
		}
		if (arg === "--template-list") {
			templateList = true;
			continue;
		}
		if (arg.startsWith("--template-save=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--template-save requires a value");
			templateSave = value;
			continue;
		}
		if (arg === "--template-save") {
			const value = argv[i + 1];
			if (!value) throw new Error("--template-save requires a value");
			templateSave = value;
			i++;
			continue;
		}
		if (arg.startsWith("--template-delete=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--template-delete requires a value");
			templateDelete = value;
			continue;
		}
		if (arg === "--template-delete") {
			const value = argv[i + 1];
			if (!value) throw new Error("--template-delete requires a value");
			templateDelete = value;
			i++;
			continue;
		}
		if (arg.startsWith("--generate-types=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--generate-types requires a value");
			generateTypes = value;
			continue;
		}
		if (arg === "--generate-types") {
			const value = argv[i + 1];
			if (!value) throw new Error("--generate-types requires a value");
			generateTypes = value;
			i++;
			continue;
		}
		if (arg.startsWith("--completion=")) {
			const value = arg.split("=")[1];
			if (value === "bash" || value === "zsh" || value === "fish" || value === "powershell") {
				completion = value;
			} else {
				throw new Error(`Invalid --completion: ${value ?? ""}`);
			}
			continue;
		}
		if (arg === "--completion") {
			const value = argv[i + 1];
			if (value === "bash" || value === "zsh" || value === "fish" || value === "powershell") {
				completion = value;
			} else {
				throw new Error(`Invalid --completion: ${value ?? ""}`);
			}
			i++;
			continue;
		}
		if (arg.startsWith("--migrate=")) {
			const value = arg.split("=")[1];
			if (value === "up" || value === "down" || value === "status") {
				migrate = value;
			} else {
				throw new Error(`Invalid --migrate: ${value ?? ""}`);
			}
			continue;
		}
		if (arg === "--migrate") {
			const value = argv[i + 1];
			if (value === "up" || value === "down" || value === "status") {
				migrate = value;
			} else {
				throw new Error(`Invalid --migrate: ${value ?? ""}`);
			}
			i++;
			continue;
		}
		if (arg.startsWith("--migrate-target=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--migrate-target requires a value");
			migrateTarget = value;
			continue;
		}
		if (arg === "--migrate-target") {
			const value = argv[i + 1];
			if (!value) throw new Error("--migrate-target requires a value");
			migrateTarget = value;
			i++;
			continue;
		}
		if (arg === "--lock") {
			lock = true;
			continue;
		}
		if (arg === "--lock-check") {
			lockCheck = true;
			continue;
		}
		if (arg === "--web") {
			web = true;
			continue;
		}
		if (arg.startsWith("--")) {
			throw new Error(`Unknown option: ${arg}`);
		}
		paths.push(arg);
	}

	return {
		paths: paths.length === 0 ? ["."] : paths,
		...(environment !== undefined ? { environment } : {}),
		expand,
		override,
		output,
		...(schema !== undefined ? { schema } : {}),
		validate,
		generateExample,
		...(exampleOutput !== undefined ? { exampleOutput } : {}),
		...(encrypt !== undefined ? { encrypt } : {}),
		...(decrypt !== undefined ? { decrypt } : {}),
		audit,
		...(diff !== undefined ? { diff } : {}),
		...(merge !== undefined ? { merge } : {}),
		...(template !== undefined ? { template } : {}),
		templateList,
		...(templateSave !== undefined ? { templateSave } : {}),
		...(templateDelete !== undefined ? { templateDelete } : {}),
		...(generateTypes !== undefined ? { generateTypes } : {}),
		...(completion !== undefined ? { completion } : {}),
		...(migrate !== undefined ? { migrate } : {}),
		...(migrateTarget !== undefined ? { migrateTarget } : {}),
		lock,
		lockCheck,
		web,
	};
};
