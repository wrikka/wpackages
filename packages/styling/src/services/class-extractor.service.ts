// A simple regex to capture class attributes
const CLASS_REGEX = /class(?:Name)?="([^"]+)"/g;

export function extractClasses(code: string): Set<string> {
	const classes = new Set<string>();
	const matches = code.matchAll(CLASS_REGEX);
	for (const match of matches) {
		if (match[1]) {
			match[1].split(/\s+/).forEach(cls => classes.add(cls));
		}
	}
	return classes;
}
