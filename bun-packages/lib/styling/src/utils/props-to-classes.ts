import type { TypeSafeUtilityProps } from "../types/utility-props";

function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[\s_]+/g, "-")
		.toLowerCase();
}

function formatUtilityValue(key: string, value: string | number | boolean | undefined | null): string | null {
	if (value === undefined || value === null || value === false) {
		return null;
	}

	if (value === true) {
		return key;
	}

	if (typeof value === "number") {
		return `${key}-${value}`;
	}

	return `${key}-${value}`;
}

export function propsToClasses(props: TypeSafeUtilityProps): string[] {
	const classes: string[] = [];

	for (const [key, value] of Object.entries(props)) {
		if (value === undefined || value === null) continue;

		const kebabKey = toKebabCase(key);
		const formatted = formatUtilityValue(kebabKey, value);

		if (formatted) {
			classes.push(formatted);
		}
	}

	return classes;
}

export function styledPropsToClasses(
	props: Record<string, string | number | boolean | undefined | null>,
): string[] {
	const classes: string[] = [];

	for (const [key, value] of Object.entries(props)) {
		if (value === undefined || value === null || value === false) continue;

		if (key === "className" || key === "class") {
			if (typeof value === "string") {
				classes.push(value);
			}
			continue;
		}

		const kebabKey = toKebabCase(key);
		const formatted = formatUtilityValue(kebabKey, value);

		if (formatted) {
			classes.push(formatted);
		}
	}

	return classes;
}

export function mergeClasses(...classLists: (string | string[] | undefined | null)[]): string {
	const classes = new Set<string>();

	for (const list of classLists) {
		if (!list) continue;

		if (typeof list === "string") {
			for (const cls of list.split(/\s+/).filter(Boolean)) {
				classes.add(cls);
			}
		} else if (Array.isArray(list)) {
			for (const cls of list) {
				for (const c of cls.split(/\s+/).filter(Boolean)) {
					classes.add(c);
				}
			}
		}
	}

	return [...classes].join(" ");
}
