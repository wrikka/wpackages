import { getCommitConfig } from "./config";

interface OpenAIResponse {
	choices: Array<{
		message: {
			content: string;
		};
	}>;
}

interface FileChange {
	file: string;
	status: string;
	additions: number;
	deletions: number;
}

function groupFilesByFeature(files: string[]): Record<string, string[]> {
	const groups: Record<string, string[]> = {};

	// จัดกลุ่มตาม folder structure
	files.forEach(file => {
		const parts = file.split("/");
		const feature = (parts.length > 1 ? parts[0] : "root") || "root";

		if (!groups[feature]) {
			groups[feature] = [];
		}
		groups[feature].push(file);
	});

	return groups;
}

function analyzeFileChanges(diff: string): FileChange[] {
	const files: FileChange[] = [];
	const fileRegex = /^\+\+\+ b\/(.+)$/gm;

	let match;
	while ((match = fileRegex.exec(diff)) !== null) {
		const filePath = match[1];

		// หา end ของ file diff
		const nextFileMatch = fileRegex.exec(diff.substring(match.index + 1));
		const fileEnd = nextFileMatch ? nextFileMatch.index + match.index + 1 : diff.length;

		const fileContent = diff.substring(match.index, fileEnd);

		// นับ additions (+) และ deletions (-)
		const additions = (fileContent.match(/^\+/gm) || []).length;
		const deletions = (fileContent.match(/^-/gm) || []).length;

		files.push({
			file: filePath || "",
			status: additions > 0 && deletions > 0 ? "modified" : additions > 0 ? "added" : "deleted",
			additions,
			deletions,
		});
	}

	return files;
}

export async function generateCommitMessageWithAI(diff: string): Promise<string> {
	const config = getCommitConfig();

	if (!config?.ai?.enabled) {
		throw new Error("AI is not enabled in config");
	}

	const apiKey = config.ai.apiKey || process.env["OPENAI_API_KEY"];

	if (!apiKey) {
		throw new Error("OpenAI API key is not configured. Set it in .wgit.json or OPENAI_API_KEY env variable");
	}

	const model = config.ai.model || "gpt-4o-mini";
	const types = config.types || ["feat", "fix", "docs", "style", "refactor", "test", "chore", "perf"];

	// ดึงข้อมูลไฟล์จาก diff
	const fileRegex = /^\+\+\+ b\/(.+)$/gm;
	const files: string[] = [];
	let match;

	while ((match = fileRegex.exec(diff)) !== null) {
		if (match[1]) {
			files.push(match[1]);
		}
	}

	// จัดกลุ่มไฟล์ตาม feature/folder
	groupFilesByFeature(files);
	analyzeFileChanges(diff);

	const systemPrompt =
		`You are an expert at writing clear, concise git commit messages following conventional commits format.

Format: <type>(<scope>): <description>

Available types: ${types.join(", ")}

Rules:
- Use present tense ("add feature" not "added feature")
- Keep description under 72 characters
- Don't use period at the end
- Scope should be the feature/folder name when multiple areas are affected
- Be specific about what changed
- If changes span multiple features, use the most significant one as scope

Examples:
- feat(auth): add OAuth2 login support
- fix(api): resolve null pointer in user endpoint
- docs: update installation guide
- refactor(parser): simplify token extraction logic`;

	const userPrompt = `Analyze this git diff and generate a conventional commit message:

\`\`\`diff
${diff}
\`\`\`

Generate ONLY the commit message, nothing else.`;

	try {
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model,
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userPrompt },
				],
				temperature: 0.7,
				max_tokens: 100,
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`OpenAI API error: ${response.status} - ${error}`);
		}

		const data = await response.json() as OpenAIResponse;
		const message = data.choices[0]?.message?.content?.trim();

		if (!message) {
			throw new Error("No response from OpenAI");
		}

		return message;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to generate AI commit message: ${error.message}`);
		}
		throw error;
	}
}
