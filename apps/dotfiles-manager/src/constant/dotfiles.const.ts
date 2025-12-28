/**
 * Suggested dotfiles to manage
 */
export const SUGGESTED_DOTFILES = [
	".gitconfig",
	".bashrc",
	".zshrc",
	".vimrc",
	".tmux.conf",
	".npmrc",
] as const;

/**
 * Common dotfile options for selection
 */
export const DOTFILE_OPTIONS = [
	{ value: "~/.gitconfig", label: "Git Config" },
	{ value: "~/.bashrc", label: "Bash RC" },
	{ value: "~/.zshrc", label: "Zsh RC" },
	{ value: "~/.vimrc", label: "Vim RC" },
	{ value: "~/.tmux.conf", label: "Tmux Config" },
	{ value: "~/.npmrc", label: "NPM Config" },
	{ value: "custom", label: "Custom path..." },
] as const;
