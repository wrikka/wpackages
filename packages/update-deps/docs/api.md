# API Documentation

## OrchestratorService

The main service that coordinates the entire update process.

### `run(): Promise<void>`

This is the main entry point of the application. It performs the following steps:

1. Scans for all `package.json` files in the current directory.
2. Checks for outdated dependencies in each package.
3. Fetches vulnerability and changelog information for outdated packages.
4. Prompts the user to select which packages to update.
5. Updates the selected `package.json` files.
6. Runs the package manager's install command.
7. Runs the test script (if available).
8. If any step fails, it rolls back all changes to the `package.json` files.

## Other Services

- **`DependencyService`**: Responsible for finding outdated dependencies using `npm-check-updates`.
- **`InfoService`**: Fetches additional information about packages, such as changelogs and vulnerability data.
- **`PackageService`**: Handles reading and parsing `package.json` files.
- **`ProcessService`**: A wrapper around `execa` to run external commands.
- **`ScanService`**: Finds all `package.json` files within a given directory.
- **`UiService`**: Manages all user interface interactions, including displaying messages and handling user selections via `prompts`.
- **`UpdateService`**: Manages the process of updating `package.json` files, running install/test commands, and rolling back changes if an error occurs.
