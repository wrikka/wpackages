import dotenv from "dotenv";

dotenv.config();

type Env = {
	GITHUB_TOKEN?: string;
	OPENAI_API_KEY?: string;
};

const env = process.env as NodeJS.ProcessEnv & Env;

export const envConfig = {
	githubToken: env.GITHUB_TOKEN,
	openaiApiKey: env.OPENAI_API_KEY,
};
