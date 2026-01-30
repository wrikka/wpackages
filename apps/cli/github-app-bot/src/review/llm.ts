import type { AppEnv } from "../config/env";

export const summarizeWithLlm = async (
	args: { readonly env: AppEnv; readonly input: string },
): Promise<string | null> => {
	const baseUrl = args.env.llmBaseUrl;
	const apiKey = args.env.llmApiKey;
	const model = args.env.llmModel;
	if (!baseUrl || !apiKey || !model) return null;

	const url = new URL("/chat/completions", baseUrl);
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			messages: [
				{ role: "system", content: "Summarize dependency/version changes for a code reviewer. Keep it concise." },
				{ role: "user", content: args.input },
			],
			temperature: 0.2,
		}),
	});

	if (!res.ok) return null;
	const json = (await res.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};
	const content = json.choices?.[0]?.message?.content;
	return content && content.trim().length > 0 ? content.trim() : null;
};
