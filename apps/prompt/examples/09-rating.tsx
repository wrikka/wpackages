import React from 'react';
import { prompt, RatingPrompt } from '../src';

async function main() {
  const rating = await prompt(RatingPrompt, { message: 'Rate this library:' }, 3);
  console.log(`Your rating: ${rating}`);
}

main();
