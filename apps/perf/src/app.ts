import * as p from "@clack/prompts";
import pc from "picocolors";

export const runPerfApp = async () => {
  p.intro(pc.cyan("✨ Welcome to perf"));

  // More logic will be added here

  p.outro(pc.green("Performance check complete! ✨"));
};
