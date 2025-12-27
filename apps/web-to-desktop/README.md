# web-to-desktop

A powerful CLI tool to convert any website into a lightweight, cross-platform desktop application using Tauri.

## Features

- **Interactive CLI**: An easy-to-use wizard guides you through the process.
- **Powered by Tauri**: Creates fast, secure, and resource-efficient desktop apps.
- **Customizable**: Configure window size, resizability, menu bar, and more.
- **Auto-Build**: Optionally build the desktop application immediately after generation.

## Usage

To start the interactive setup, run the following command:

```bash
bun wtd
```

This will launch a wizard that asks for:

1.  The website URL.
2.  The name of your application.
3.  Window dimensions (width and height).
4.  Other options like whether the window should be resizable.

After providing the details, the tool will scaffold a new Tauri project, configure it, and optionally build the final desktop application for you.

## Development

- **Run in dev mode**: `bun dev`
- **Run tests**: `bun test`
- **Build the CLI**: `bun build`
