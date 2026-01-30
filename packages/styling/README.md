# styling

## Introduction

`@wpackages/styling` เป็นไลบรารีสำหรับ generate CSS จาก utility classes โดยใช้ Tailwind CSS v4 พร้อมระบบเสริม เช่น shortcuts, custom rules, icons, css variables, theme presets และ disk cache

## Features

### Core Features
- ⚡️ **Generate CSS**: สร้าง CSS จากชุด class ที่กำหนดได้โดยตรงผ่าน `generateCss`
- 🧩 **Shortcuts**: ขยาย alias class (เช่น `btn` -> `p-4 bg-blue-500`)
- 🧠 **Custom rules**: สร้าง utility แบบ dynamic ด้วย regex + handler
- 🖼️ **Icons**: รองรับ `icon-[prefix--name]` ด้วย Iconify JSON
- 💾 **Disk cache**: cache ผลลัพธ์ CSS ลงดิสก์เพื่อลดเวลา build
- 🧱 **Plugin pipeline**: มี hook สำหรับ transform classes/css

### Advanced Features
- 🎨 **Attributify Mode**: รองรับ `<div flex text-center>` เหมือน UnoCSS
- 🔒 **Type-safe Props**: สร้าง type-safe utility props สำหรับ React/Vue/Svelte เหมือน Panda CSS
- 🎛️ **CSS Variable System**: รองรับ CSS variables แบบ dynamic
- 🎭 **Theme Presets Marketplace**: รองรับ external theme presets
- ⚡ **Atomic CSS Optimization**: ลด CSS size ด้วย deduplication
- 🔄 **Runtime HMR Improvements**: เพิ่ม performance สำหรับ hot reload
- 🎨 **CSS-in-JS Hybrid Mode**: รองรับ runtime CSS generation
- 🔍 **Visual Debug Mode**: แสดง class boundaries และ CSS source
- 📦 **Component Extractor**: แยก component classes ออกเป็น CSS แยก
- 🚀 **Critical CSS Extraction**: สร้าง critical CSS สำหรับ above-the-fold

## Goal

- 🎯 **ใช้เป็น Vite plugin ได้ทันที** ผ่าน `stylingPlugin`
- 🧰 **ให้ API ใช้ง่าย** สำหรับ generate CSS จาก class set หรือ scan จาก content
- 🎨 **รองรับทุก framework** React, Vue, Svelte ด้วย type-safe props

## Design Principles

- 🧩 **Single Responsibility**: แยก generator logic เป็นโมดูลย่อยใน `src/services/generator/*`
- ✅ **Type-safe**: ใช้ TypeScript types สำหรับ options/rules
- 🚫 **No -ignore**: ไม่พึ่ง `@vite-ignore`/`@ts-expect-error` เพื่อให้ผ่านการตรวจคุณภาพ

## Installation

```bash
bun install
```

## Usage

### Basic Usage

```ts
import { generateCss } from "@wpackages/styling";

const css = await generateCss(new Set(["p-4", "bg-blue-500"]), {
	cache: { enabled: false },
});
```

### Generate CSS from Content

```ts
import { generateCssFromContent } from "@wpackages/styling";

const css = await generateCssFromContent({
	root: process.cwd(),
	content: ["src/**/*.{ts,tsx,js,jsx,html}"],
});
```

### Vite Plugin

```ts
import { defineConfig } from "vite";
import { stylingPlugin } from "@wpackages/styling";

export default defineConfig({
	plugins: [
		stylingPlugin({
			mode: ["class", "attributify"],
			icons: ["mdi"],
			cssVariables: {
				prefix: "--app",
				variables: {
					primary: "#3b82f6",
				},
			},
		}),
	],
});
```

### CSS Variables

```ts
import { generateCssVariables, resolveCssVariable } from "@wpackages/styling";

const cssVars = generateCssVariables({
	prefix: "--app",
	variables: {
		primary: "#3b82f6",
	},
});

const color = resolveCssVariable("primary");
```

### CSS Optimization

```ts
import { optimizeCss } from "@wpackages/styling";

const optimized = optimizeCss(css, {
	deduplicate: true,
	mergeMediaQueries: true,
	sortSelectors: true,
});

console.log(`Reduced by ${optimized.stats.reductionPercent}%`);
```

### Runtime CSS Injection

```ts
import { generateAndInjectCss } from "@wpackages/styling";

await generateAndInjectCss(new Set(["p-4", "bg-blue-500"]), {
	inject: true,
	container: "head",
});
```

### Debug Mode

```ts
import { enableDebug, toggleDebug } from "@wpackages/styling";

enableDebug({
	showClassNames: true,
	highlightElements: true,
	showCssSource: true,
});

toggleDebug();
```

### Critical CSS Extraction

```ts
import { extractCriticalCss, generateCriticalCssInline } from "@wpackages/styling";

const { critical, nonCritical, stats } = extractCriticalCss(html, fullCss, {
	includeFonts: true,
	includeKeyframes: true,
	minify: true,
});

const inlineHtml = generateCriticalCssInline(critical, nonCritical, "/styles.css");
```

### React Components

```tsx
import { Box, Button, Card, styled } from "@wpackages/styling/react";

const CustomButton = styled({
	baseClasses: ["px-4", "py-2", "rounded", "bg-blue-500", "text-white"],
	variants: {
		size: {
			sm: ["text-sm", "px-2", "py-1"],
			lg: ["text-lg", "px-6", "py-3"],
		},
	},
});

export default function App() {
	return (
		<Box flex gap-4>
			<Button>Click me</Button>
			<Card p-4 shadow>
				<p>Hello World</p>
			</Card>
		</Box>
	);
}
```

### Vue Composable

```vue
<script setup>
import { useStyled } from "@wpackages/styling/vue";

const { class: styledClasses } = useStyled({
	baseClasses: ["p-4", "bg-blue-500"],
});
</script>

<template>
	<div :class="styledClasses">Hello World</div>
</template>
```

### Svelte Action

```svelte
<script>
	import { styled } from "@wpackages/styling/svelte";

	let div;
</script>

<div use:styled={{ baseClasses: ["p-4", "bg-blue-500"] }} bind:this={div}>
	Hello World
</div>
```

## Development

### Verify Code Quality

```bash
bun run verify
```

### Build Library

```bash
bun run build
```

### Run Tests

```bash
bun run test
bun run test:coverage
```

## License

MIT
