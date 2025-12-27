# formatter

A simple yet powerful code formatter for your projects, powered by `dprint`.

## Usage

To format all files in your project, run the following command in your project's root directory:

```bash
bun wformat
```

You can also specify paths to format:

```bash
bun wformat src/ test/
```

## How It Works

The tool uses `dprint` to format your files. It will automatically find and use your project's `dprint.json` configuration file.
