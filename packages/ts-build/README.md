# @wpackages/ts-build

A modern, fast, and opinionated build tool for TypeScript and Rust (N-API) projects, powered by Bun.

## Features

- **Fast Bundling**: Leverages `Bun.build` for high-speed TypeScript bundling.
- **N-API Integration**: Seamlessly builds and bundles Rust-based N-API addons.
- **Zero-Config for N-API**: Automatically detects your Rust crate if `Cargo.toml` is present in the root, `native/`, or `rust/` directory.
- **Declarative Config**: Simple and powerful configuration file (`bunpack.config.ts`) for when you need to override the defaults.
- **Multi-format Output**: Supports ESM and CJS formats.
- **DTS Generation**: Automatically generates TypeScript declaration files.
- **Opinionated Presets**: Quick setup for libraries, apps, and CLIs.

## Comparison

`@wpackages/ts-build` offers a unique combination of TypeScript bundling and native N-API addon compilation. See a detailed feature comparison with other tools like `esbuild`, `swc`, and `tsup` in our [Comparison Document](./docs/comparison.md).

## Usage

1.  **Install**

    ```bash
    bun add -d @wpackages/ts-build
    ```

2.  **Configure**

    Create a `bunpack.config.ts` file in your project root for basic configuration:

    ```ts
    // bunpack.config.ts
    import { defineConfig } from "@wpackages/ts-build"

    export default defineConfig({
      entry: ["src/index.ts"],
      outDir: "dist",
      // ... other options
    })
    ```

    **For Rust N-API Projects:**

    If your project has a `Cargo.toml` file in the root, `native/`, or `rust/` directory, `@wpackages/ts-build` will **automatically detect and build it**—no extra configuration needed!

    If you need to customize the native build, you can add a `native` section to your config:

    ```ts
    // bunpack.config.ts
    export default defineConfig({
      entry: ["src/index.ts"],
      outDir: "dist",
      native: {
        napi: {
          // Overrides the auto-detected crate directory
          crateDir: "my-rust-app", 
          // Overrides the auto-detected output file name
          outFile: "my_custom_name",
          release: true,
        },
      },
    })
    ```

3.  **Build**

    Add a build script to your `package.json`:

    ```json
    {
      "scripts": {
        "build": "bunpack"
      }
    }
    ```

    And run it:

    ```bash
    bun run build
    ```
