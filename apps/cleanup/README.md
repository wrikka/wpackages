# cleanup

A simple and interactive CLI tool to clean up common project artifacts like `node_modules`, `dist` folders, and more.

## Usage

To use the cleanup tool, run the following command in your project's root directory:

```bash
bun wcleanup
```

This will launch an interactive prompt where you can select the items you want to clean up.

### Options

You can choose to clean up any of the following:

- `node_modules`
- `dist`
- `coverage`
- `.turbo`
- `bun.lockb`

## How It Works

The tool uses `glob` to find all matching files and directories within your project and then uses `rimraf` to delete them safely.
