import { createUnimport } from "unimport";
import { promises as fs } from "fs";
import path from "path";

async function generateAutoImports() {
  console.log("🔥 Generating auto-imports...");

  const { toExports } = createUnimport({
    presets: [
      {
        from: "@effect/schema/Schema",
        imports: ["Schema"],
      },
    ],
    imports: [],
    dirs: ["src/utils/**/*.ts", "src/services/**/*.ts"],
  });

  const dtsContent = await toExports();
  const outputPath = path.resolve(process.cwd(), "src", "generated", "auto-imports.d.ts");

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, dtsContent);

  console.log(`✅ Auto-imports d.ts generated at ${path.relative(process.cwd(), outputPath)}`);
}

generateAutoImports().catch((err) => {
  console.error("Error generating auto-imports:", err);
  process.exit(1);
});
