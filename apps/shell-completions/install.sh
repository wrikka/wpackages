#!/bin/bash

# This script installs the shell completions for wpackages CLIs.

# --- Bash Setup ---
BASH_COMPLETER_SCRIPT_PATH="$(pwd)/dist/bash-completer.js"
_wpackages_bash_completions() {
  COMPREPLY=($(bun "$BASH_COMPLETER_SCRIPT_PATH" "${COMP_WORDS[@]}" "$COMP_CWORD"))
}
complete -F _wpackages_bash_completions git

# --- Zsh Setup ---
ZSH_COMPLETER_SCRIPT_PATH="$(pwd)/dist/zsh-completer.js"
_wpackages_zsh_completions() {
  # Zsh passes arguments directly
  reply=($(bun "$ZSH_COMPLETER_SCRIPT_PATH" "$@"))
}
compctl -K _wpackages_zsh_completions git

# --- Fish Setup ---
FISH_COMPLETER_SCRIPT_PATH="$(pwd)/dist/fish-completer.js"
FISH_COMPLETIONS_DIR="${HOME}/.config/fish/completions"
COMMAND_NAME="git" # This should be dynamic later

# Create completions directory if it doesn't exist
mkdir -p "$FISH_COMPLETIONS_DIR"

# Write the completion script for fish
echo "complete -c $COMMAND_NAME -f -a '(bun \"$FISH_COMPLETER_SCRIPT_PATH\" (commandline -cp))'" > "$FISH_COMPLETIONS_DIR/$COMMAND_NAME.fish"



# --- Installation Instructions ---
CURRENT_SHELL=$(basename "$SHELL")

if [ "$CURRENT_SHELL" = "bash" ]; then
  echo "Bash completion script installed."
  echo "Please add the following line to your ~/.bashrc or ~/.bash_profile:"
  echo "source $(pwd)/install.sh"
elif [ "$CURRENT_SHELL" = "zsh" ]; then
  echo "Zsh completion script installed."
  echo "Please add the following lines to your ~/.zshrc:"
  echo "fpath=(~/.zsh/completions $fpath)"
  echo "autoload -U compinit && compinit"
  echo "source $(pwd)/install.sh"
elif [ "$CURRENT_SHELL" = "fish" ]; then
  echo "Fish completion script installed to $FISH_COMPLETIONS_DIR/git.fish"
  echo "Please restart your shell for changes to take effect."
else
  echo "Could not detect your shell. Please configure manually."
fi
