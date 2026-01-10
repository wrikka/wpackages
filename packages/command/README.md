# @wpackages/command

## Introduction

@wpackages/command เป็น package ที่ให้ types และ services สำหรับจัดการ shell commands ใน wshell โดยใช้ Effect-ts และ @effect/schema ในการจัดการ data structures และ side effects อย่าง type-safe

## Features

- 🎯 **Command Type** - Schema-based class สำหรับจัดการ command และ arguments
- 📦 **ShellValue Type** - Type ที่รองรับ output หลายรูปแบบ (string, array, void)
- 🔍 **CommandService** - Service สำหรับ lookup และ list commands ด้วย Effect
- 🏗️ **Effect-based** - ใช้ Effect-ts สำหรับจัดการ side effects อย่าง pure functional
- 📝 **Schema Validation** - ใช้ @effect/schema สำหรับ runtime type checking

## Goal

- 🎯 สร้าง abstraction สำหรับ shell commands ที่ type-safe
- 🔄 รองรับ built-in commands ผ่าน CommandService
- 🧩 ทำให้ง่ายต่อการทดสอบและ mock commands
- 📐 ให้โครงสร้างที่ชัดเจนสำหรับการจัดการ commands

## Design Principles

- ✨ **Type Safety** - ใช้ TypeScript และ Schema สำหรับ compile-time และ runtime type checking
- 🎭 **Effect-based** - ใช้ Effect-ts สำหรับจัดการ side effects อย่าง pure functional
- 🔧 **Extensibility** - ออกแบบให้ง่ายต่อการเพิ่ม built-in commands
- 🧪 **Testability** - ออกแบบให้ง่ายต่อการทดสอบและ mock
- 📦 **Minimal Dependencies** - ใช้ dependencies น้อยแต่มีประสิทธิภาพ

## Installation

<details>
<summary>ติดตั้งผ่าน Bun</summary>

```bash
bun add @wpackages/command
```

</details>

<details>
<summary>ติดตั้งผ่าน npm</summary>

```bash
npm install @wpackages/command
```

</details>

<details>
<summary>ติดตั้งผ่าน yarn</summary>

```bash
yarn add @wpackages/command
```

</details>

## Usage

### สร้าง Command

```typescript
import { Command } from "@wpackages/command";

const cmd = Command.make({
  name: "ls",
  args: ["-la"],
});
```

### ใช้ CommandService

```typescript
import { CommandService, CommandServiceLive } from "@wpackages/command";
import { Effect } from "effect";

const program = Effect.gen(function* () {
  const service = yield* CommandService;
  const commands = yield* service.list();
  console.log("Available commands:", commands);
});

const runnable = program.pipe(
  Effect.provide(CommandServiceLive)
);
```

## Examples

### ตัวอย่างการ lookup command

```typescript
import { Command, CommandService, CommandServiceLive } from "@wpackages/command";
import { Effect } from "effect";

const lookupExample = Effect.gen(function* () {
  const service = yield* CommandService;
  const cmd = Command.make({ name: "ls", args: ["-la"] });
  const result = yield* service.lookup(cmd);
  return result;
});

Effect.runPromise(lookupExample.pipe(
  Effect.provide(CommandServiceLive)
));
```

### ตัวอย่างการ list commands

```typescript
import { CommandService, CommandServiceLive } from "@wpackages/command";
import { Effect } from "effect";

const listExample = Effect.gen(function* () {
  const service = yield* CommandService;
  const commands = yield* service.list();
  return commands;
});

Effect.runPromise(listExample.pipe(
  Effect.provide(CommandServiceLive)
));
```

## License

MIT License
