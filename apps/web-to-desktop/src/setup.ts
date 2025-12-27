/**
 * Setup & Prerequisites Checker
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";
import { printBlank, printDim, printGreen, printInfo, printRed, printStatus, printWarning } from "./components";

const execAsync = promisify(exec);

/**
 * Check if command exists
 */
async function commandExists(cmd: string): Promise<boolean> {
	try {
		await execAsync(`${cmd} --version`);
		return true;
	} catch {
		return false;
	}
}

/**
 * Check Rust installation
 */
export async function checkRust(): Promise<boolean> {
	return await commandExists("rustc");
}

/**
 * Check Cargo installation
 */
export async function checkCargo(): Promise<boolean> {
	return await commandExists("cargo");
}

/**
 * Check Tauri CLI
 */
export async function checkTauriCLI(): Promise<boolean> {
	try {
		await execAsync("cargo tauri --version");
		return true;
	} catch {
		return false;
	}
}

/**
 * Check all prerequisites
 */
export async function checkPrerequisites(): Promise<{
	rust: boolean;
	cargo: boolean;
	tauriCli: boolean;
	allReady: boolean;
}> {
	const rust = await checkRust();
	const cargo = await checkCargo();
	const tauriCli = await checkTauriCLI();

	return {
		rust,
		cargo,
		tauriCli,
		allReady: rust && cargo && tauriCli,
	};
}

/**
 * Show setup instructions
 */
export function showSetupInstructions(): void {
	printBlank();
	printWarning("⚠️  Prerequisites Required");
	printBlank();
	console.log("To build desktop apps, you need:");
	printBlank();

	printInfo("1. Rust & Cargo");
	printDim("   Windows:");
	console.log("   Download from: https://rustup.rs/");
	console.log("   Run: rustup-init.exe");
	printBlank();
	printDim("   macOS/Linux:");
	console.log("   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh");
	printBlank();

	printInfo("2. Tauri CLI (after Rust installed)");
	console.log("   cargo install tauri-cli");
	printBlank();

	printInfo("3. System Dependencies");
	printDim("   Windows:");
	console.log("   - WebView2 (usually pre-installed on Windows 10/11)");
	printBlank();
	printDim("   macOS:");
	console.log("   - Xcode Command Line Tools");
	console.log("   xcode-select --install");
	printBlank();
	printDim("   Linux (Ubuntu/Debian):");
	console.log("   sudo apt update");
	console.log("   sudo apt install libwebkit2gtk-4.1-dev \\");
	console.log("     build-essential curl wget file \\");
	console.log("     libssl-dev libayatana-appindicator3-dev librsvg2-dev");
	printBlank();

	printWarning("After installation, restart your terminal and run again!");
	printBlank();
}

/**
 * Auto-install Tauri CLI
 */
export async function installTauriCLI(): Promise<boolean> {
	printInfo("📦 Installing Tauri CLI...");
	printDim("   This may take a few minutes...");

	try {
		const { stdout, stderr } = await execAsync("cargo install tauri-cli");
		if (stdout) printDim(stdout);
		if (stderr) printDim(stderr);

		printGreen("✓ Tauri CLI installed!");
		return true;
	} catch (error) {
		printRed("✗ Failed to install Tauri CLI");
		const message = error instanceof Error ? error.message : String(error);
		printDim(message);
		return false;
	}
}

/**
 * Interactive setup
 */
export async function interactiveSetup(): Promise<boolean> {
	printInfo("🔍 Checking prerequisites...");
	printBlank();

	const status = await checkPrerequisites();

	// Show status
	console.log("Status:");
	printStatus("Rust", status.rust);
	printStatus("Cargo", status.cargo);
	printStatus("Tauri CLI", status.tauriCli);
	printBlank();

	if (status.allReady) {
		printGreen("✓ All prerequisites installed!");
		return true;
	}

	// Show what's missing
	if (!status.rust || !status.cargo) {
		printRed("✗ Rust/Cargo not found");
		showSetupInstructions();
		return false;
	}

	if (!status.tauriCli) {
		printWarning("⚠️  Tauri CLI not found");
		printBlank();

		// Ask to install
		const readline = await import("node:readline");
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		const answer = await new Promise<string>((resolve) => {
			rl.question("Install Tauri CLI now? (Y/n): ", resolve);
		});
		rl.close();

		if (answer.toLowerCase() === "n") {
			printWarning("Skipped. Install manually:");
			console.log("  cargo install tauri-cli");
			return false;
		}

		return await installTauriCLI();
	}

	return false;
}
