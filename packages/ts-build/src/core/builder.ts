import type { BunpackConfig, Format, Target } from "../types";
import { commandExists } from "../utils/env";
import { BuildError } from "../error";

export async function buildBin(config: BunpackConfig) {
    if (!config.bin || !config.outDir) return;

    const path = await import("node:path");
    const fs = await import("node:fs/promises");

    const binOutDir = path.join(config.outDir, "bin");
    await fs.mkdir(binOutDir, { recursive: true });

    for (const [binName, entryFile] of Object.entries(config.bin)) {
        const entry = entryFile;

        const result = await Bun.build({
            entrypoints: [entry],
            outdir: binOutDir,
            target: "bun",
            format: "cjs",
            sourcemap: false,
            minify: false,
            external: config.external ?? [],
        });

        if (!result.success) {
            throw new BuildError({
                code: "BIN_BUILD_FAILED",
                step: "bin",
                message: `Bin build failed for ${binName}`,
                hint: `Check entry file '${entry}' and Bun.build logs.`,
                cause: new AggregateError(result.logs, `Bin build failed for ${binName}`),
            });
        }

        const builtFile = path.join(
            binOutDir,
            `${path.basename(entry).replace(/\.(ts|js|tsx|jsx)$/, "")}.js`,
        );
        const finalFile = path.join(binOutDir, `${binName}.js`);

        if (builtFile !== finalFile) {
            await fs.rename(builtFile, finalFile);
        }

        const content = await fs.readFile(finalFile, "utf8");
        if (!content.startsWith("#!/")) {
            await fs.writeFile(finalFile, `#!/usr/bin/env bun\n${content}`, "utf8");
        }
    }
}

export async function buildNative(config: BunpackConfig) {
    if (!commandExists('cargo')) {
        throw new BuildError({
            code: "CARGO_NOT_FOUND",
            step: "native",
            message: 'Cargo is not installed.',
            hint: 'Install Rust: https://www.rust-lang.org/tools/install',
        });
    }
    const napiConfig = config.native?.napi;
    if (!napiConfig || napiConfig.skip) return;

    console.log("Building native addons...");

    const crateDir = napiConfig.crateDir ?? "native";
    const args = ["cargo", "build"];

    if (napiConfig.release) {
        args.push("--release");
    }

    if (napiConfig.features && napiConfig.features.length > 0) {
        args.push("--features", napiConfig.features.join(","));
    }

    const proc = Bun.spawn(args, {
        cwd: crateDir,
        stdio: ["inherit", "inherit", "inherit"],
        env: { ...process.env, ...napiConfig.env },
    });

    const exitCode = await proc.exited;

    if (exitCode !== 0) {
        throw new BuildError({
            code: "NATIVE_BUILD_FAILED",
            step: "native",
            message: "Native build failed.",
            hint: `Run 'cargo build' in '${crateDir}' to see full errors.`,
        });
    }

    console.log("Successfully built native addons.");

    const { copyFile, mkdir } = await import("node:fs/promises");
    const path = await import("node:path");

    const outFile = napiConfig.outFile ?? config.name;
    if (!outFile) {
        throw new BuildError({
            code: "NATIVE_OUTFILE_MISSING",
            step: "native",
            message: "Could not determine native addon output file name.",
            hint: "Specify 'native.napi.outFile' or 'name' in your config.",
        });
    }

    const sourcePath = path.join(crateDir, 'target', napiConfig.release ? 'release' : 'debug', `${outFile}.node`);
    const destPath = path.join(config.outDir!, `${outFile}.node`);

    await mkdir(path.dirname(destPath), { recursive: true });
    await copyFile(sourcePath, destPath);

    console.log(`Copied native addon to ${destPath}`);
}

export async function buildTS(config: BunpackConfig) {
    console.log("Building TypeScript files...");

    if (!config.outDir) {
        throw new BuildError({
            code: "CONFIG_INVALID",
            step: "config",
            message: "Missing 'outDir' in config.",
            hint: "Set 'outDir' (e.g. '.output' or 'dist').",
        });
    }

    const entrypoints = config.entry as string[];
    if (!entrypoints || entrypoints.length === 0) {
        return;
    }

    const path = await import("node:path");

    const formats = Array.isArray(config.format) ? config.format : [config.format].filter((f): f is Format => f !== undefined);
    const targets = Array.isArray(config.target) ? config.target : [config.target].filter((t): t is Target => t !== undefined);
    const target = targets[0] ?? 'bun';

    for (const format of formats) {
        const result = await Bun.build({
            entrypoints,
            outdir: path.join(config.outDir, format),
            target,
            format,
            sourcemap: config.sourcemap ? 'external' : 'none',
            minify: config.minify ?? false,
            external: config.external ?? [],
            plugins: config.bunPlugins ?? [],
        });

        if (!result.success) {
            console.error("Build failed");
            for (const message of result.logs) {
                console.error(message);
            }
            throw new BuildError({
                code: "TS_BUILD_FAILED",
                step: "ts",
                message: `TypeScript build failed for format '${format}'.`,
                hint: "Check Bun.build logs above.",
                cause: new AggregateError(result.logs, "Build failed"),
            });
        }

        console.log(`Successfully built ${format} format.`)
    }
}

export async function emitDts(config: BunpackConfig) {
    if (!config.dts) return;

    if (!config.outDir) {
        throw new BuildError({
            code: "CONFIG_INVALID",
            step: "config",
            message: "Missing 'outDir' in config.",
            hint: "Set 'outDir' (e.g. '.output' or 'dist').",
        });
    }

    console.log("Emitting declaration files...");

    const path = await import("node:path");
    const typesOutDir = path.join(config.outDir, "types");

    const args = [
        'tsc',
        '--project',
        'tsconfig.json',
        '--declaration',
        '--emitDeclarationOnly',
        '--declarationDir',
        typesOutDir,
    ];

    const proc = Bun.spawn(args, { stdio: ['inherit', 'inherit', 'inherit'] });
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
        throw new BuildError({
            code: "DTS_FAILED",
            step: "dts",
            message: 'd.ts generation failed.',
            hint: "Ensure 'typescript' is installed and your tsconfig is valid.",
        });
    }

    console.log('Successfully emitted declaration files.');
}

export async function buildWasm(config: BunpackConfig) {
    if (!commandExists('wasm-pack')) {
        throw new BuildError({
            code: "WASM_PACK_NOT_FOUND",
            step: "wasm",
            message: 'wasm-pack is not installed.',
            hint: 'Install wasm-pack: https://rustwasm.github.io/wasm-pack/installer/',
        });
    }
    const wasmConfig = config.native?.wasm;
    if (!wasmConfig || wasmConfig.skip) return;

    console.log("Building WebAssembly package...");

    const crateDir = wasmConfig.crateDir ?? ".";
    const args = ["wasm-pack", "build", crateDir];

    if (wasmConfig.outDir) {
        args.push("--out-dir", wasmConfig.outDir);
    }

    if (wasmConfig.outName) {
        args.push("--out-name", wasmConfig.outName);
    }

    if (wasmConfig.target) {
        args.push("--target", wasmConfig.target);
    }

    if (wasmConfig.release) {
        args.push("--release");
    }

    if (wasmConfig.scope) {
        args.push("--scope", wasmConfig.scope);
    }

    const proc = Bun.spawn(args, {
        stdio: ["inherit", "inherit", "inherit"],
    });

    const exitCode = await proc.exited;

    if (exitCode !== 0) {
        throw new BuildError({
            code: "WASM_BUILD_FAILED",
            step: "wasm",
            message: "Wasm build failed.",
            hint: "Run 'wasm-pack build' manually to see full errors.",
        });
    }

    console.log("Successfully built WebAssembly package.");
}
