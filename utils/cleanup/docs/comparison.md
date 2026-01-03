# Competitor Comparison: @wpackages/cleanup vs. npkill

This document compares the internal `@wpackages/cleanup` tool with `npkill`, a popular open-source alternative for cleaning up `node_modules` directories.

## Overview

| Feature             | @wpackages/cleanup (`computer-cleanup`)                                     | npkill                                                                    |
| ------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Primary Goal**    | Clean up various project artifacts (`node_modules`, `dist`, `.turbo`, etc.) | Specifically find and remove `node_modules` directories                   |
| **Interactivity**   | Asks which artifact types to clean up (pre-defined list).                   | Scans the filesystem, then presents an interactive list of found folders. |
| **Scope**           | Broader; cleans more than just `node_modules`.                              | Narrower; focused solely on `node_modules`.                               |
| **Discovery**       | Uses `glob` to find artifacts based on pre-configured patterns.             | Actively scans directories to find `node_modules` and calculates size.    |
| **User Experience** | Simple question-based prompt.                                               | More visual and interactive; shows paths and sizes before deletion.       |
| **Underlying Tech** | `@clack/prompts`, `glob`, `rimraf`                                          | Interactive CLI, likely using similar filesystem libraries.               |

## Analysis

### Strengths of @wpackages/cleanup

- **Broader Scope**: It's designed for the monorepo's needs, cleaning up not just `node_modules` but also build outputs (`dist`), cache (`.turbo`), and other common artifacts.
- **Simplicity**: The workflow is very straightforward: run the command, select categories, and confirm.
- **Configuration**: The patterns for cleanup are defined within the tool, ensuring consistency across the workspace.

### Strengths of npkill

- **Interactive Discovery**: Its key advantage is showing the user _what_ will be deleted _before_ it's deleted. Displaying the path and size of each `node_modules` folder allows for more informed and granular cleanup.
- **Safety**: By showing the list of found items, it reduces the risk of accidentally deleting something in an unexpected location.
- **Focus**: Its specialization on `node_modules` makes it very good at that one specific task.

## Opportunities for @wpackages/cleanup

Based on this comparison, `@wpackages/cleanup` could be significantly improved by adopting `npkill`'s interactive discovery model.

**Proposed Improvement**:

1. After the user selects which artifact types to clean (e.g., `node_modules`, `dist`), the tool should **first scan and list all matching files/directories** that will be deleted.
2. The user should then be presented with this list and asked for a final confirmation.

This would combine the broad scope of `computer-cleanup` with the safety and superior user experience of `npkill`'s interactive model.
