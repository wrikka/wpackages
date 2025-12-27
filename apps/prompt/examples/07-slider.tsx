import React from 'react';
import { prompt, SliderPrompt } from '../src';

async function main() {
  const value = await prompt(SliderPrompt, { message: 'Select a value:' }, 50);
  console.log(`Value: ${value}`);
}

main();
