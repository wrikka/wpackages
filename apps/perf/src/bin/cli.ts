#!/usr/bin/env node
import { runPerfApp } from "../app";

runPerfApp().catch((error) => {
  console.error(error);
  process.exit(1);
});
