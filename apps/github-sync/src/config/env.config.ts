import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
	githubToken: process.env.GITHUB_TOKEN,
	openaiApiKey: process.env.OPENAI_API_KEY,
};
