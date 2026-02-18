#!/usr/bin/env bun

import { intro, outro, text, spinner, isCancel, select } from '@clack/prompts';
import pc from 'picocolors';
import { getConfig } from './src/utils/config';
import { getLLMProvider } from './src/llm/providers';
import { getStagedDiff, getCurrentBranch, commitWithMessage } from './src/utils/git';
import { formatCommitMessage } from './src/utils/commit';

// Main function
export async function main() {
  console.log(); // Newline
  intro(pc.inverse(' aicommit '));

  const config = getConfig();

  // Check if current branch is in branch ignore list
  const currentBranch = getCurrentBranch();
  if (config.branchIgnore && config.branchIgnore.includes(currentBranch)) {
    outro(pc.yellow(`Branch '${currentBranch}' is in ignore list. Skipping AI commit.`));
    process.exit(0);
  }

  const diff = getStagedDiff();
  const s = spinner();
  s.start('Generating commit message(s)...');

  try {
    const llmProvider = getLLMProvider(config.llmProvider);
    const messages: string[] = [];

    // Generate multiple suggestions
    for (let i = 0; i < config.generateCount; i++) {
      const message = await llmProvider.generateCommitMessage(diff, config);
      messages.push(message);
    }

    s.stop('Commit message(s) generated!');

    // Select commit message if multiple
    let selectedMessage = messages[0];
    if (config.generateCount > 1) {
      const choice = await select({
        message: 'Select a commit message:',
        options: messages.map((msg, idx) => ({
          label: msg,
          value: msg,
          hint: idx === 0 ? 'Recommended' : '',
        })),
      });

      if (isCancel(choice)) {
        outro(pc.yellow('Commit cancelled.'));
        process.exit(0);
      }

      if (choice) {
        selectedMessage = choice;
      }
    }

    // Format message with emoji and length limit
    const formattedMessage = formatCommitMessage(selectedMessage || '', config);

    // Allow user to edit
    const editedCommitMessage = await text({
      message: 'Press Enter to commit, or edit the message and press Enter.',
      placeholder: 'Commit message...',
      initialValue: formattedMessage,
      validate(value) {
        if (!value || value.length === 0) return 'Commit message cannot be empty!';
      },
    });

    if (isCancel(editedCommitMessage)) {
      outro(pc.yellow('Commit cancelled.'));
      process.exit(0);
    }

    commitWithMessage(editedCommitMessage);
    outro(pc.green('✔ Changes committed!'));
  } catch (error: any) {
    s.stop('Failed to generate commit message.', 1);
    outro(pc.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

main().catch(err => {
  outro(pc.red(`An unexpected error occurred: ${err.message}`));
  process.exit(1);
});