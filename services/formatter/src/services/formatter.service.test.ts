import { describe, it, expect, vi } from "vitest";
import { format } from "./formatter.service";
import { spawn } from "node:child_process";
import { PassThrough } from "node:stream";

const createMockChild = (exitCode = 0) => {
  const stdout = new PassThrough();
  const stderr = new PassThrough();

  const child = {
    stdout,
    stderr,
    on: vi.fn((event: string, cb: (code: number) => void) => {
      if (event === "close") cb(exitCode);
      return child;
    }),
  };

  return child;
};

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

describe("formatter service", () => {
  it("should call dprint via bunx with the correct paths", async () => {
    vi.mocked(spawn).mockReturnValue(
      createMockChild() as unknown as ReturnType<typeof spawn>,
    );

    await format(["src", "test"], { engine: "dprint" });

    expect(spawn).toHaveBeenCalledWith(
      "bunx",
      ["dprint", "fmt", "src", "test"],
      expect.objectContaining({ stdio: ["ignore", "pipe", "pipe"] }),
    );
  });

  it("should call dprint with --check when check=true", async () => {
    vi.mocked(spawn).mockReturnValue(
      createMockChild() as unknown as ReturnType<typeof spawn>,
    );

    await format(["src"], { engine: "dprint", check: true });

    expect(spawn).toHaveBeenCalledWith(
      "bunx",
      ["dprint", "fmt", "--check", "src"],
      expect.any(Object),
    );
  });

  it("should call biome format with --write by default", async () => {
    vi.mocked(spawn).mockReturnValue(
      createMockChild() as unknown as ReturnType<typeof spawn>,
    );

    await format(["src"], { engine: "biome" });

    expect(spawn).toHaveBeenCalledWith(
      "bunx",
      ["biome", "format", "--write", "src"],
      expect.any(Object),
    );
  });

  it("should pass config path to dprint", async () => {
    vi.mocked(spawn).mockReturnValue(
      createMockChild() as unknown as ReturnType<typeof spawn>,
    );

    await format(["src"], { engine: "dprint", configPath: "./dprint.json" });

    expect(spawn).toHaveBeenCalledWith(
      "bunx",
      ["dprint", "fmt", "--config", expect.stringContaining("dprint.json"), "src"],
      expect.any(Object),
    );
  });
});
