import React from 'react';
import { prompt, PasswordPrompt } from '../src';

async function main() {
  const password = await prompt(PasswordPrompt, { message: 'Enter your password:' }, '');
  console.log('Password received.');
}

main();
