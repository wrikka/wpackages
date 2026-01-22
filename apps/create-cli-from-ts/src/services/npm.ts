import { spinner } from "@clack/prompts";

export const useNpm = () => {
  const publishPackage = async (directory: string): Promise<void> => {
    const s = spinner();
    s.start("Publishing to npm...");

    try {
      await Bun.spawn(["npm", "publish"], { cwd: directory }).exited;
      s.stop("📦 Package published successfully");
    } catch (error) {
      s.stop("⚠️ Failed to publish package");
      console.error(error instanceof Error ? error.message : String(error));
    }
  };

  return { publishPackage };
};
