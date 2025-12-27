export const SERVER_DEFAULTS = {
	port: 3000,
	hostname: "localhost",
} as const;

export const SERVER_MESSAGES = {
	htmlRunning: (hostname: string, port: number) => `\n🚀 HTML server running at http://${hostname}:${port}`,
	markdownRunning: (hostname: string, port: number) => `\n🚀 Markdown server running at http://${hostname}:${port}`,
	tsRunning: () => `\n🚀 TypeScript preview server running at http://localhost:3000`,
	fileInfo: (filename: string) => `📂 File: ${filename}\n`,
} as const;

export const FILE_EXTENSIONS = {
	html: ".html",
	markdown: [".md", ".markdown"],
	typescript: ".ts",
} as const;

export const ERROR_MESSAGES = {
	invalidHtml: "Please provide a .html file",
	invalidMarkdown: "Please provide a .md file",
	invalidTs: "Please provide a .ts file",
	invalidUrl: "Please provide a valid URL",
	fileOpenError: (filepath: string, error: string) => `Error opening ${filepath}: ${error}`,
	unsupportedFileType: (filepath: string, fileType: string) => `Unsupported file type for ${filepath}: .${fileType}`,
} as const;
