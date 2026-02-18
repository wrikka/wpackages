#!/usr/bin/env bun

import { getConfig } from '../utils/config';
import { getLLMProvider } from '../llm/providers';
import { runCommand } from '../utils/git';
import pc from 'picocolors';

async function main() {
  const commitMsgFile = process.argv[2];
  const source = process.argv[3];

  // Only run if source is empty (user didn't provide a message)
  if (source && source !== 'message') {
    process.exit(0);
  }

  if (!commitMsgFile) {
    console.error('Error: Commit message file path not provided');
    process.exit(1);
  }

  try {
    const config = getConfig();
    const diff = runCommand('git diff --staged');

    if (!diff) {
      process.exit(0);
    }

    console.log(pc.cyan('Generating commit message...'));

    const llmProvider = getLLMProvider(config.llmProvider);
    const message = await llmProvider.generateCommitMessage(diff, config);

    // Write message to commit message file
    const fs = await import('node:fs');
    fs.writeFileSync(commitMsgFile, message);

    console.log(pc.green('✔ Commit message generated!'));
  } catch (error: any) {
    console.error(pc.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

main();
