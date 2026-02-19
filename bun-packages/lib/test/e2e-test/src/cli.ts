import pc from "picocolors";
import { runTests } from "./runner";

function printHelp(): void {
  console.log("e2e <command>\n\nCommands:\n  test   Run E2E tests\n  ui     Run E2E tests with browser UI\n");
}

async function main(): Promise<void> {
  const [, , command] = process.argv;

  if (!command || command === "-h" || command === "--help") {
    printHelp();
    process.exit(0);
  }

  if (command === "test") {
    const code = await runTests();
    process.exit(code);
  }

  if (command === "ui") {
    process.env.E2E_HEADLESS = "0";
    const code = await runTests();
    process.exit(code);
  }

  console.error(pc.red(`Unknown command: ${command}`));
  printHelp();
  process.exit(1);
}

await main();
