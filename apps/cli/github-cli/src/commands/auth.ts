import * as p from "@clack/prompts";
import { checkAuth, requireGitHubToken, requireOpenAIApiKey } from "../lib/auth";
import { printOutput } from "../lib/output";

export async function runAuthStatusCommand(): Promise<void> {
	const status = await checkAuth();
	printOutput(status, { output: "json" });
}

export async function runAuthStatusInteractive(): Promise<void> {
	const status = await checkAuth();
	
	console.log("Authentication Status:");
	console.log("");
	
	const githubStatus = status.github === "authenticated" ? "✓ Authenticated" : 
		status.github === "missing-token" ? "✗ Missing token" :
		status.github === "invalid-token" ? "✗ Invalid token" : "✗ Error";
	console.log(`GitHub: ${githubStatus}`);
	
	const openaiStatus = status.openai === "configured" ? "✓ Configured" :
		status.openai === "missing-key" ? "✗ Missing key" :
		status.openai === "invalid-key" ? "✗ Invalid key" : "✗ Error";
	console.log(`OpenAI:  ${openaiStatus}`);
	
	if (status.user) {
		console.log(`User:    ${status.user}`);
	}
	
	console.log("");
	console.log("Configure with:");
	console.log("  github-cli config set githubToken <token>");
	console.log("  github-cli config set openaiApiKey <key>");
}

export async function runAuthLoginCommand(service: "github" | "openai"): Promise<void> {
	if (service === "github") {
		const token = await p.text({
			message: "Enter GitHub personal access token:",
			validate: (value) => {
				if (!value.trim()) return "Token is required";
				return undefined;
			},
		});
		
		if (p.isCancel(token)) return;
		
		// Validate token format
		const tokenStr = String(token).trim();
		if (!tokenStr.startsWith("ghp_") && !tokenStr.startsWith("gho_") && !tokenStr.startsWith("ghu_")) {
			console.log("⚠️  Warning: Token doesn't start with expected prefix (ghp_, gho_, ghu_)");
		}
		
		// Save to global config
		const { setConfig } = await import("../lib/config");
		setConfig("githubToken", tokenStr, "global");
		console.log("✓ GitHub token saved to global config");
		
	} else if (service === "openai") {
		const key = await p.text({
			message: "Enter OpenAI API key:",
			validate: (value) => {
				if (!value.trim()) return "API key is required";
				return undefined;
			},
		});
		
		if (p.isCancel(key)) return;
		
		// Validate key format
		const keyStr = String(key).trim();
		if (!keyStr.startsWith("sk-")) {
			console.log("⚠️  Warning: API key doesn't start with 'sk-'");
		}
		
		// Save to global config
		const { setConfig } = await import("../lib/config");
		setConfig("openaiApiKey", keyStr, "global");
		console.log("✓ OpenAI API key saved to global config");
	}
}
