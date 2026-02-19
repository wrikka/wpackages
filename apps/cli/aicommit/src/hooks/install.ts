#!/usr/bin/env bun

import { existsSync } from 'node:fs';
import { join } from 'node:path';

const HOOK_FILE = '.git/hooks/prepare-commit-msg';
const HOOK_SCRIPT = `#!/bin/sh
bun ${join(process.cwd(), 'src/hooks/prepare-commit-msg.ts')} "$@"
`;

export async function installHook() {
  try {
    if (existsSync(HOOK_FILE)) {
      console.log('Git hook already exists. Skipping installation.');
      return;
    }

    const fs = await import('node:fs');
    fs.writeFileSync(HOOK_FILE, HOOK_SCRIPT, { mode: 0o755 });

    console.log('Git hook installed successfully!');
    console.log('The hook will automatically generate commit messages when you run `git commit`.');
  } catch (error: any) {
    console.error('Error installing git hook:', error.message);
    process.exit(1);
  }
}

export async function uninstallHook() {
  try {
    const fs = await import('node:fs');
    if (existsSync(HOOK_FILE)) {
      fs.unlinkSync(HOOK_FILE);
      console.log('Git hook uninstalled successfully!');
    } else {
      console.log('Git hook not found. Skipping uninstallation.');
    }
  } catch (error: any) {
    console.error('Error uninstalling git hook:', error.message);
    process.exit(1);
  }
}

// CLI interface
const command = process.argv[2];

if (command === 'install') {
  installHook();
} else if (command === 'uninstall') {
  uninstallHook();
} else {
  console.log('Usage: bun run src/hooks/install.ts [install|uninstall]');
  process.exit(1);
}
