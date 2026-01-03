# wdotfiles

A simple dotfiles manager inspired by chezmoi, but easier to use.

## Features

| Feature                | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| 🎯 **Easy to Use**     | Simple CLI with beautiful clack prompts                 |
| 📦 **File Management** | Add/remove configuration files easily                   |
| 🔄 **Sync**            | Synchronize files between local and remote repositories |
| ✨ **Type-safe**       | Zod schemas for validation and type safety              |
| 🎨 **Modern UI**       | Beautiful terminal UI with picocolors                   |

## Installation

Install the CLI globally using your preferred package manager:

| Package Manager | Command                          |
| --------------- | -------------------------------- |
| `bun`           | `bun add -g dotfile-manager`     |
| `npm`           | `npm install -g dotfile-manager` |
| `pnpm`          | `pnpm add -g dotfile-manager`    |

## Commands

```bash
$ wdotfiles --help
Usage: wdotfiles [options] [command]

Simple dotfiles manager

Options:
  -V, --version  output the version number
  -h, --help     display help for command

Commands:
  init           Initialize dotfiles manager
  add <file>     Add file to dotfiles
  remove <file>  Remove file from dotfiles
  sync-local     Sync dotfiles to local system
  sync-remote    Sync dotfiles to remote repository
  open           List managed dotfiles
  help [command] display help for command
```

## Configuration

Configuration file is stored at `~/.dotfile-manager.json`

```json
{
	"dotfilesDir": "~/.dotfiles",
	"files": [
		{
			"source": "/home/user/.zshrc",
			"target": "/home/user/.dotfiles/.zshrc"
		}
	],
	"remote": {
		"url": "https://github.com/user/dotfiles.git",
		"branch": "main"
	}
}
```

## License

This project is licensed under the MIT License.
