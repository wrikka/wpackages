# styling

## Introduction

`@wpackages/styling` เป็นไลบรารีสำหรับ generate CSS จาก utility classes โดยใช้ Tailwind CSS v4 พร้อมระบบเสริม เช่น shortcuts, custom rules, icons และ disk cache

## Features

- ⚡️ **Generate CSS**: สร้าง CSS จากชุด class ที่กำหนดได้โดยตรงผ่าน `generateCss`
- 🧩 **Shortcuts**: ขยาย alias class (เช่น `btn` -> `p-4 bg-blue-500`)
- 🧠 **Custom rules**: สร้าง utility แบบ dynamic ด้วย regex + handler
- 🖼️ **Icons**: รองรับ `icon-[prefix--name]` ด้วย Iconify JSON
- 💾 **Disk cache**: cache ผลลัพธ์ CSS ลงดิสก์เพื่อลดเวลา build
- 🧱 **Plugin pipeline**: มี hook สำหรับ transform classes/css

## Goal

- 🎯 **ใช้เป็น Vite plugin ได้ทันที** ผ่าน `packages/styling/src/index.ts`
- 🧰 **ให้ API ใช้ง่าย** สำหรับ generate CSS จาก class set หรือ scan จาก content

## Design Principles

- 🧩 **Single Responsibility**: แยก generator logic เป็นโมดูลย่อยใน `src/services/generator/*`
- ✅ **Type-safe**: ใช้ TypeScript types สำหรับ options/rules
- 🚫 *_No _-ignore__: ไม่พึ่ง `@vite-ignore`/`@ts-expect-error` เพื่อให้ผ่านการตรวจคุณภาพ

## Installation

```bash
bun install
```

## Usage

- รัน verify (lint + typecheck + test)

```bash
bun run verify
```

- สั่ง build library

```bash
bun run build
```

## Examples

```ts
import { generateCss } from "@wpackages/styling";

const css = await generateCss(new Set(["p-4", "bg-blue-500"]), {
	cache: { enabled: false },
});
```

```ts
import { generateCssFromContent } from "@wpackages/styling";

const css = await generateCssFromContent({
	root: process.cwd(),
	content: ["src/**/*.{ts,tsx,js,jsx,html}"],
});
```

## License

MIT
