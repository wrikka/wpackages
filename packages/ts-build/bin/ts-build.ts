#!/usr/bin/env node

import { run } from '../src/app';

run(process.argv).catch((error) => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});
