import * as fs from "node:fs";
import * as path from "node:path";

export type Template = {
	name: string;
	description: string;
	variables: Record<string, string>;
};

export type TemplateOptions = {
	variables?: Record<string, string>;
};

const TEMPLATES_DIR = ".env-templates";

export const createTemplate = (
	name: string,
	env: Record<string, string>,
	description = "",
): Template => ({
	name,
	description,
	variables: { ...env },
});

export const saveTemplate = (template: Template, directory = TEMPLATES_DIR): void => {
	const dir = path.resolve(process.cwd(), directory);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	const filePath = path.join(dir, `${template.name}.template.json`);
	fs.writeFileSync(filePath, JSON.stringify(template, null, 2), "utf8");
};

export const loadTemplate = (name: string, directory = TEMPLATES_DIR): Template | null => {
	const filePath = path.resolve(process.cwd(), directory, `${name}.template.json`);

	if (!fs.existsSync(filePath)) {
		return null;
	}

	const content = fs.readFileSync(filePath, "utf8");
	return JSON.parse(content) as Template;
};

export const listTemplates = (directory = TEMPLATES_DIR): Template[] => {
	const dir = path.resolve(process.cwd(), directory);

	if (!fs.existsSync(dir)) {
		return [];
	}

	const files = fs.readdirSync(dir).filter((file) => file.endsWith(".template.json"));

	return files.map((file) => {
		const filePath = path.join(dir, file);
		const content = fs.readFileSync(filePath, "utf8");
		return JSON.parse(content) as Template;
	});
};

export const deleteTemplate = (name: string, directory = TEMPLATES_DIR): boolean => {
	const filePath = path.resolve(process.cwd(), directory, `${name}.template.json`);

	if (!fs.existsSync(filePath)) {
		return false;
	}

	fs.unlinkSync(filePath);
	return true;
};

export const applyTemplate = (
	template: Template,
	options: TemplateOptions = {},
): Record<string, string> => {
	const { variables = {} } = options;
	const result: Record<string, string> = {};

	for (const [key, value] of Object.entries(template.variables)) {
		let appliedValue = value;

		for (const [varName, varValue] of Object.entries(variables)) {
			appliedValue = appliedValue.replace(new RegExp(`\\{\\{${varName}\\}\\}`, "g"), varValue);
		}

		result[key] = appliedValue;
	}

	return result;
};

export const mergeTemplates = (
	templates: Template[],
	name: string,
	description = "",
): Template => {
	const mergedVariables: Record<string, string> = {};

	for (const template of templates) {
		Object.assign(mergedVariables, template.variables);
	}

	return {
		name,
		description,
		variables: mergedVariables,
	};
};
