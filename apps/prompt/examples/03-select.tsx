import React from 'react';
import { prompt, SelectPrompt } from '../src';

async function main() {
  const feature = await prompt(
    SelectPrompt,
    {
      message: 'Select your favorite feature:',
      options: [
        { value: 'text', label: 'Text Input' },
        { value: 'confirm', label: 'Confirmation' },
      ],
    },
    'text'
  );
  console.log(`You selected: ${feature}`);
}

main();
