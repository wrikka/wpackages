# @wpackages/devserver - Next Idea Features

## สถานะปัจจุบัน (Current Status)

**เวอร์ชัน**: 0.0.1
**Test Coverage**: 16.06% (3/3 tests passed)
**Build Status**: ✅ สำเร็จ (34.12 kB minified)
**Lint Status**: ✅ 0 warnings, 0 errors

## งานที่ทำเสร็จแล้ว (Completed Work)

### Phase 1: /make-real Workflow
- ✅ เพิ่ม WebSocket clients tracking (`getClientCount()`)
- ✅ Implement disk cache clearing สำหรับ transform cache และ metadata cache
- ✅ Implement module graph visualization ใน devtools
- ✅ แก้ TypeScript types สำหรับ WebSocket
- ✅ เชื่อมต่อ moduleGraph เข้ากับ devtools WebSocket handler
- ✅ แก้ lint warnings (floating promises)
- ✅ Verify ผ่านทุกขั้นตอน (lint, test, build)

### TODO Comments ที่แก้แล้ว
- ✅ `dev-server.service.ts:109` - Module graph stats exposed
- ✅ `dev-server.service.ts:112` - WebSocket clients tracking implemented
- ✅ `cache.service.ts:90` - Disk cache clearing implemented
- ✅ `cache.service.ts:146` - Disk cache clearing implemented
- ✅ `components/devtools-ws.ts:36` - Module graph visualization implemented

## ฟีเจอร์ที่ต้องพัฒนาต่อ (Features to Develop)

### 🔴 Critical Features (ต้องทำก่อน)

#### 1. Error Overlay
- **ความสำคัญ**: สูง
- **สถานะ**: 🚧 ยังไม่มี
- **TODO**: `client/hmr-client.ts:44`
- **รายละเอียด**:
  - Browser overlay สำหรับแสดง runtime errors
  - ต้อง implement error UI และจัดการ error messages
  - รองรับ stack trace และ source maps

#### 2. Partial HMR
- **ความสำคัญ**: สูง
- **สถานะ**: 🚧 ยังเป็น full-reload
- **รายละเอียด**:
  - Module-level hot updates แทน full page reload
  - ต้อง implement HMR boundary detection
  - รองรับ CSS-only updates
  - รองรับ framework-specific HMR (React Fast Refresh, Vue HMR)

#### 3. Dependency Pre-bundling
- **ความสำคัญ**: สูง
- **สถานะ**: 🚧 ยังไม่มี
- **รายละเอียด**:
  - ใช้ esbuild หรือ swc pre-bundle node_modules
  - เพิ่ม startup time performance
  - Cache pre-bundled dependencies
  - รองรับ commonjs to esm conversion

#### 4. Test Coverage > 80%
- **ความสำคัญ**: สูง
- **สถานะ**: 16.06% (ต่ำมาก)
- **รายละเอียด**:
  - เพิ่ม tests สำหรับ cache.service.ts
  - เพิ่ม tests สำหรับ module-graph.service.ts
  - เพิ่ม tests สำหรับ resolver.service.ts
  - เพิ่ม tests สำหรับ websocket.service.ts
  - เพิ่ม tests สำหรับ watcher.service.ts
  - เพิ่ม integration tests

### 🟠 Performance Improvements

#### 5. Incremental Build
- **ความสำคัญ**: สูง
- **รายละเอียด**:
  - Reuse cache ข้าม server restarts
  - Persist cache ไปยัง disk
  - Smart cache invalidation

#### 6. Parallel Transform
- **ความสำคัญ**: สูง
- **รายละเอียด**:
  - Worker threads สำหรับ transforms
  - Parallel processing สำหรับ multiple files

#### 7. Benchmarks Suite
- **ความสำคัญ**: สูง
- **รายละเอียด**:
  - เปรียบเทียบกับ Vite/Rsbuild จริงๆ
  - Benchmark: cold start, HMR latency, memory usage
  - Benchmark: monorepo scale performance

### 🟡 Developer Experience

#### 8. SSR Dev Mode
- **ความสำคัญ**: กลาง
- **รายละเอียด**:
  - Server-side rendering development
  - รองรับ Next.js/Nuxt-style SSR

#### 9. Source Map Support
- **ความสำคัญ**: กลาง
- **รายละเอียด**:
  - Generate source maps
  - Debugging ที่ดีขึ้น

#### 10. Devtools UI
- **ความสำคัญ**: กลาง
- **รายละเอียด**:
  - Web UI สำหรับ inspect module graph
  - Visualize dependencies
  - Performance profiling UI

#### 11. Virtual Modules
- **ความสำคัญ**: กลาง
- **รายละเอียด**:
  - `virtual:` module support
  - Plugin-defined virtual modules

### 🟢 Advanced Features

#### 12. Module Federation
- **ความสำคัญ**: ต่ำ
- **รายละเอียด**:
  - Support micro-frontends
  - Remote module loading

#### 13. Remote Dev Server
- **ความสำคัญ**: ต่ำ
- **รายละเอียด**:
  - Collaborative debugging
  - Remote preview

#### 14. Performance Profiling
- **ความสำคัญ**: ต่ำ
- **รายละเอียด**:
  - Deep profiling integration
  - `@wpackages/tracing` support

### 🟡 Ecosystem & Integrations

#### 15. Framework Presets
- **ความสำคัญ**: กลาง
- **รายละเอียด**:
  - React preset
  - Vue preset
  - Svelte preset

#### 16. Vite Compatibility Layer
- **ความสำคัญ**: กลาง
- **รายละเอียด**:
  - Use Vite plugins
  - Drop-in replacement สำหรับ Vite

#### 17. CLI Tool
- **ความสำคัญ**: กลาง
- **รายละเอียด**:
  - `wdev` command
  - CLI interface

## Unique Selling Points (จุดขายที่แตกต่าง)

### มีอยู่แล้ว (Existing)
- ✅ Native Monorepo Support (`@workspace/package`)
- ✅ Performance Monitoring (built-in + recommendations)
- ✅ Type-safe Plugin API

### ต้องพัฒนา (To Develop)
- 🔴 Zero-config for Monorepos - ไม่ต้อง config สำหรับ monorepos
- 🟠 Monorepo Intelligence - Auto-detect workspace packages
- 🟠 Smart Watching - Ignore patterns อัจฉริยะ
- 🟢 AI-powered Optimization Tips - Performance recommendations ที่ฉลาดขึ้น

## Roadmap แนะนำ (Suggested Roadmap)

### Phase 1: Foundation (Week 1-2)
1. Error Overlay
2. Test Coverage > 50%
3. Fix remaining TypeScript errors

### Phase 2: Performance (Week 3-4)
1. Dependency Pre-bundling
2. Incremental Build
3. Benchmarks Suite

### Phase 3: HMR (Week 5-6)
1. Partial HMR
2. CSS-only updates
3. Framework-specific HMR

### Phase 4: DX (Week 7-8)
1. Devtools UI
2. Source Map Support
3. Virtual Modules

### Phase 5: Ecosystem (Week 9-10)
1. Framework Presets
2. Vite Compatibility Layer
3. CLI Tool

### Phase 6: Advanced (Week 11-12)
1. SSR Dev Mode
2. Module Federation
3. Performance Profiling

## ข้อมูลเพิ่มเติม

### Comparison Summary
- **Vite**: ยังไม่ดีกว่าใน HMR performance, ecosystem
- **Rsbuild**: ยังไม่ดีกว่าใน pre-bundling, maturity
- **Rspack**: ยังไม่ดีกว่าใน Rust performance, incremental HMR
- **Webpack**: ดีกว่าใน startup time, memory usage

### Potential Advantages
- Monorepo-first design (native `@workspace/package` support)
- Built-in performance monitoring
- Type-safe plugin API
- Lightweight architecture

### สิ่งที่ต้องปรับปรุงเพื่อ Competitive
- HMR precision (module-level vs full-reload)
- Dependency pre-bundling
- Ecosystem (community plugins)
- Test coverage (17% -> 80%+)
- Maturity (v0.0.1 -> v1.0.0)