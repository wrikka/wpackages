import { spinner } from "@clack/prompts";

export const useAutoInstaller = () => {
  return async (packagesDir: string): Promise<void> => {
    const s = spinner();
    s.start("Installing dependencies...");

    try {
      await Bun.spawn(["bun", "install"], {
        cwd: packagesDir,
        stdio: ["ignore", "pipe", "pipe"],
      }).exited;
      s.stop("📦 Dependencies installed successfully");
    } catch (error) {
      s.stop("⚠️ Failed to install dependencies automatically");
      console.log("💡 Run: cd packages && bun install", error instanceof Error ? error.message : String(error));
    }
  };
};
