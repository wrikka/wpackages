#!/usr/bin/env node
import { runWebApp } from "../app";

runWebApp().catch((error) => {
  console.error(error);
  process.exit(1);
});
