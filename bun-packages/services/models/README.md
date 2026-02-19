# @wai/ai-providers

## Overview

`@wai/ai-providers` รวม provider adapters สำหรับเชื่อมต่อโมเดล/บริการภายนอก (เช่น OpenAI/Anthropic/Google) และ export interface/type ที่เกี่ยวข้อง เพื่อให้ `@wai/ai-sdk` และแพ็กเกจอื่นเรียกใช้งานได้แบบสม่ำเสมอ

## Comparison with Competitors

| Feature | @wai/ai-providers | Vercel AI SDK | LangChain | Mastra | OpenRouter |
|---------|------------------|--------------|-----------|--------|------------|
| **OpenAI Support** | ✅ Full implementation with streaming & retry | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Anthropic Support** | ✅ Full implementation with streaming & retry | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Google Support** | ✅ Full implementation with streaming & retry | ✅ Yes | ✅ Yes | ⚠️ Limited | ❌ No |
| **Groq Support** | ✅ Full implementation with streaming & retry | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Ollama Support** | ✅ Full implementation with streaming & retry | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Azure OpenAI** | ✅ Full implementation with streaming & retry | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **AWS Bedrock** | ✅ Full implementation with streaming & retry | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Streaming (SSE)** | ✅ Full SSE parsing with AbortSignal | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Retry Logic** | ✅ Built-in exponential backoff | ⚠️ Manual | ⚠️ Limited | ⚠️ Limited | ❌ No |
| **Abort Support** | ✅ Full AbortSignal integration | ✅ Yes | ⚠️ Limited | ⚠️ Limited | ❌ No |
| **Type Safety** | ✅ Full TypeScript with strict types | ✅ TypeScript | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial |
| **Zero Dependencies** | ✅ Only depends on @wai/ai-core | ❌ Depends on AI SDK | ❌ Heavy deps | ❌ Heavy deps | ❌ Depends on OpenAI |
| **Bundle Size** | 🟢 Tiny (only ai-core) | 🟡 Medium | 🔴 Large | 🔴 Large | 🟡 Medium |
| **Bun Native** | ✅ Optimized for Bun runtime | ⚠️ Node.js focus | ❌ Node.js only | ❌ Node.js only | ⚠️ Node.js focus |

### Why @wai/ai-providers?

- **Minimal & Fast**: ไม่มี external dependencies นอกจาก ai-core ทำให้ bundle size เล็กและเร็ว
- **Full Type Safety**: Strict TypeScript พร้อม proper type inference
- **Built-in Utilities**: Retry, cancellation, streaming พร้อมใช้งานทันที
- **Bun Native**: ปรับแต่งสำหรับ Bun runtime ทำให้เร็วและมีประสิทธิภาพ
- **Extensible**: ออกแบบมาให้เพิ่ม provider ใหม่ได้ง่าย

### Current Status

- ✅ **OpenAI**: สมบูรณ์ (generateText, streamText, embed, retry, abort)
- ✅ **Anthropic**: สมบูรณ์ (generateText, streamText, retry, abort)
- ✅ **Google**: สมบูรณ์ (generateText, streamText, embed, retry, abort)
- ✅ **Groq**: สมบูรณ์ (generateText, streamText, retry, abort)
- ✅ **Ollama**: สมบูรณ์ (generateText, streamText, embed, retry, abort)
- ✅ **Azure OpenAI**: สมบูรณ์ (generateText, streamText, embed, retry, abort)
- ✅ **AWS Bedrock**: สมบูรณ์ (generateText, streamText, embed, retry, abort)

### Recommendations

- **ใช้ @wai/ai-providers ถ้า**: ต้องการ provider layer ที่เล็ก, เร็ว, และ type-safe สำหรับระบบ AI ของคุณ
- **ใช้ Vercel AI SDK ถ้า**: ต้องการ integration กับ Vercel ecosystem และ Next.js
- **ใช้ LangChain ถ้า**: ต้องการ complex chains และ agents พร้อม integrations มากมาย
- **ใช้ Mastra ถ้า**: ต้องการ enterprise features และ managed services
- **ใช้ OpenRouter ถ้า**: ต้องการ unified API สำหรับหลาย models แต่จำกัดเฉพาะ OpenAI-compatible APIs

## Installation

```bash
bun install
```

## Exports

ไฟล์หลัก: `src/index.ts`

- Types: `src/types/provider.ts`
- Providers: `src/providers/*`

## Scripts

- **watch**: `bun --watch verify`
- **prepare**: `lefthook install`

- **dev**: `bun run src/index.ts`
- **build**: `bun build src/index.ts --outdir ./dist --target bun`
- **lint**: `oxlint --fix --type-aware && tsc --noEmit`
- **typecheck**: `tsc --noEmit`
- **test**: `vitest run`
- **verify**: `bun run lint && bun run typecheck && bun run test && bun run build`

## Project Structure

- `src/types/` types/interface สำหรับ provider
- `src/providers/` implementation ราย provider

## Verify

```bash
bun run verify
```
