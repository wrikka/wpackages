import React from 'react';
import { prompt, ConfirmPrompt } from '../src';

async function main() {
  const confirmed = await prompt(ConfirmPrompt, { message: 'Do you want to continue?' }, true);
  console.log(`Confirmed: ${confirmed}`);
}

main();
