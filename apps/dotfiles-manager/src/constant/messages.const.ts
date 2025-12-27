import pc from "picocolors";

/**
 * UI Messages and prompts
 */
export const MESSAGES = {
	// Titles
	TITLE_MAIN: pc.bgCyan(pc.black(" ⚙️  Dotfiles Manager ")),
	TITLE_INIT: pc.bgCyan(pc.black(" 🚀 Initialize Dotfiles Manager ")),
	TITLE_ADD: pc.bgCyan(pc.black(" 📁 Add Dotfile ")),
	TITLE_REMOVE: pc.bgCyan(pc.black(" 🗑️  Remove Dotfile ")),
	TITLE_OPEN: pc.bgCyan(pc.black(" 📖 Open Managed Dotfiles ")),
	TITLE_SYNC_LOCAL: pc.bgCyan(pc.black(" 📥 Sync to Local ")),
	TITLE_SYNC_REMOTE: pc.bgCyan(pc.black(" 📤 Sync to Remote ")),

	// Prompts
	PROMPT_DOTFILES_DIR: "📂 Where to store your dotfiles?",
	PROMPT_GIT_URL: "🔗 Git remote URL? (optional)",
	PROMPT_SELECT_FILE_ADD: "📄 Select file to add:",
	PROMPT_CUSTOM_PATH: "📄 Enter custom file path:",
	PROMPT_CONFIRM_ADD: (path: string) => `Do you want to add ${pc.cyan(path)} to your dotfiles?`,
	PROMPT_SELECT_FILES_REMOVE: "🗑️  Select files to remove from management",
	PROMPT_CONFIRM_REMOVE: (count: number) =>
		`⚠️  Remove ${count} file${count > 1 ? "s" : ""} from dotfiles management?`,
	PROMPT_SELECT_FILE_OPEN: "📄 Select a file to open:",
	PROMPT_SELECT_EDITOR: "🧑‍💻 Select your preferred editor for opening files:",
	PROMPT_SYNC_REMOTE: (url: string) => `Sync files to ${pc.cyan(url)}?`,
	PROMPT_MAIN_MENU: "✨ What would you like to do?",

	// Success messages
	SUCCESS_INIT: "✅ Initialized successfully!",
	SUCCESS_ADD: "✅ Successfully added dotfile",
	SUCCESS_REMOVE: (count: number) =>
		`✅ Successfully removed ${count} file${count > 1 ? "s" : ""}`,
	SUCCESS_OPEN: (path: string) => `✅ Opened ${pc.cyan(path)}`,
	SUCCESS_SYNC_LOCAL: "✅ Sync to local completed",
	SUCCESS_SYNC_REMOTE: "✅ Successfully synced to remote repository",

	// Error messages
	ERROR_FILE_NOT_FOUND: (path: string) => pc.red(`❌ File not found: ${path}`),
	ERROR_NO_FILES: "⚠️  No files to sync",
	ERROR_NO_FILES_MANAGED: "⚠️  No files managed yet",
	ERROR_NO_REMOTE: pc.red("❌ No remote URL configured"),
	ERROR_OPEN_FAILED: pc.red("❌ Failed to open file"),
	ERROR_SYNC_FAILED: pc.red("❌ Sync to remote failed"),

	// Info messages
	INFO_NO_FILES_ADDED: "No files were added.",
	INFO_EDITOR_SAVED: (editor: string) => `Editor preference saved to ${pc.cyan(editor)}`,
	INFO_TOTAL_FILES: (count: number) => `📊 Total managed files: ${count}`,
	INFO_REMAINING_FILES: (count: number) =>
		`📊 Remaining files: ${pc.cyan(String(count))}`,
} as const;
