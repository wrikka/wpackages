import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import { groupIconVitePlugin } from "vitepress-plugin-group-icons";


export default defineConfig ({
  plugins: [
    UnoCSS(),
    checker({
      overlay: {
        initialIsOpen : false,
      },
      typescript: true,
      vueTsc: true,
      oxlint : true
    }),
    AutoImport({
      imports: ["vue"],
      vueTemplate: true,
      dts: true
    }),
    groupIconVitePlugin({
      customIcon: {
        "tsconfig.json": "vscode-icons:file-type-typescript",
        "vite.config.ts": "vscode-icons:file-type-vite",
        ".env": "vscode-icons:file-type-dotenv",
        ".mdx": "vscode-icons:file-type-light-mdx",
        html: "vscode-icons:file-type-html",
        json: "vscode-icons:file-type-json2",
        jsx: "logos:react",
        css: "logos:css-3",
        js: "logos:javascript",
        javascript: "logos:javascript",
        md: "logos:markdown",
        pnpm: "logos:pnpm",
        npm: "logos:npm-icon",
        yarn: "logos:yarn",
        bun: "logos:bun",
        vue: "logos:vue",
        svelte: "logos:svelte-icon",
        angular: "logos:angular-icon",
        next: "logos:nextjs-icon",
        nuxt: "logos:nuxt-icon",
        toml: "logos:toml",
        rust: "logos:rust",
        go: "logos:go",
        python: "logos:python",
        php: "logos:php",
        deno: "vscode-icons:file-type-deno",
        vite: "logos:vitejs",
        powershell: "vscode-icons:file-type-powershell",
        "uno.config.ts": "logos:unocss",
        "turbo.json": "vscode-icons:file-type-turbo",
        "biome.json": "mdi:broom",
        vscode: "mdi:microsoft-visual-studio-code",
        vitest: "logos:vitest",
        tailwind: "logos:tailwindcss",
        terminal: "logos:terminal",
        git: "logos:git-icon",
        ".gitconfig": "logos:git-icon",
        ".dockerignore": "vscode-icons:file-type-docker",
        Dockerfile: "vscode-icons:file-type-docker",
        scoop: "mdi:scoop",
        brew: "logos:homebrew",
        tsx: "logos:react",
      },
    }),
  ],
});
