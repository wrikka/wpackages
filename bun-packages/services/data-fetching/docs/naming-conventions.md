# กฎการตั้งชื่อไฟล์สำหรับ @wpackages/data-fetching

## 1. Suffix สำหรับแต่ละประเภทไฟล์

### Core Layers
- **Types**: `.type.ts` (สำหรับ type definitions และ interfaces)
- **Constants**: `.const.ts` (สำหรับค่าคงที่)
- **Utils**: `.util.ts` (สำหรับ utility functions)
- **Lib**: `.lib.ts` (สำหรับ core library functions)

### Data Access Layer
- **Repositories**: `.repository.ts` (สำหรับ repository implementations)
- **Adapters**: `.adapter.ts` (สำหรับ adapter implementations)
- **Services**: `.service.ts` (สำหรับ business logic services)

### Application Layer
- **Components**: `.component.ts` (สำหรับ UI components)
- **Controllers**: `.controller.ts` (สำหรับ controllers)
- **CLI**: `.cli.ts` (สำหรับ CLI tools)
- **Web**: `.web.ts` (สำหรับ web-specific code)

### Configuration & Error Handling
- **Config**: `.config.ts` (สำหรับ configuration)
- **Error**: `.error.ts` (สำหรับ error definitions)
- **Test**: `.test.ts` (สำหรับ unit tests)
- **Tool**: `.tool.ts` (สำหรับ development tools)

## 2. กฎการตั้งชื่อ

### การตั้งชื่อไฟล์
- ใช้ **lowercase** และ **kebab-case** เสมอ
- ชื่อต้องสื่อถึง functionality ที่ชัดเจน
- หลีกเลี่ยงการย่อคำที่ไม่จำเป็น

### ตัวอย่างการตั้งชื่อที่ถูกต้อง
- `user-auth.service.ts`
- `http-client.adapter.ts`
- `memory-cache.repository.ts`
- `string-manipulation.util.ts`
- `data-fetcher.config.ts`
- `api-error.error.ts`

### ตัวอย่างการตั้งชื่อที่ไม่ถูกต้อง
- `userService.ts` (ควรเป็น `user.service.ts`)
- `HTTPAdapter.ts` (ควรเป็น `http-client.adapter.ts`)
- `utils.ts` (ควรเป็น `string-manipulation.util.ts`)
- `config.ts` (ควรเป็น `data-fetcher.config.ts`)

## 3. โครงสร้างโฟลเดอร์และการตั้งชื่อ

### การจัดระเบียบไฟล์ในแต่ละโฟลเดอร์
```
src/
├── types/
│   ├── index.ts
│   ├── data-fetcher.type.ts
│   ├── cache.type.ts
│   └── http.type.ts
├── constants/
│   ├── index.ts
│   ├── api-endpoints.const.ts
│   └── cache-defaults.const.ts
├── utils/
│   ├── index.ts
│   ├── cache-key.util.ts
│   └── retry.util.ts
├── repositories/
│   ├── index.ts
│   ├── interfaces.ts
│   ├── implementations/
│   │   ├── index.ts
│   │   ├── memory-repository.ts
│   │   ├── http-repository.ts
│   │   └── cache-repository.ts
│   └── utils.ts
├── adapters/
│   ├── index.ts
│   ├── http-client.adapter.ts
│   └── cache.adapter.ts
├── services/
│   ├── index.ts
│   ├── data-fetcher.service.ts
│   └── cache.service.ts
└── error/
    ├── index.ts
    ├── api-error.error.ts
    └── cache-error.error.ts
```

## 4. กฎการ Import

### ลำดับการ Import
1. External libraries (Node.js built-ins, npm packages)
2. Internal modules (จาก packages อื่นใน monorepo)
3. Local modules (จากโปรเจกต์ปัจจุบัน) - เรียงตาม hierarchy
4. Relative imports

### ทิศทางการ Import (Dependency Direction)
```
types ← constants ← utils ← lib ← integrations
services ← repositories ← adapters ← app/cli/web
```

- **error** สามารถ import จากทุก layer
- **config** สามารถ import จาก types เท่านั้น
- **tests** สามารถ import จากทุก layer

## 5. Index Files (Barrel Exports)

ทุกโฟลเดอร์ต้องมี `index.ts` สำหรับ barrel exports:
- Export เฉพาะที่จำเป็น
- เรียงลำดับตาม hierarchy
- ใช้ `export *` สำหรับ sub-folders
- ใช้ `export` สำหรับ specific exports

## 6. การตั้งชื่อใน Code

### Interfaces
- ใช้ PascalCase
- ขึ้นต้นด้วยคำนำหน้าที่เหมาะสม (I, Repository, Service, etc.)
- ตัวอย่าง: `IDataFetcher`, `CacheRepository`, `UserService`

### Types
- ใช้ PascalCase
- สื่อถึงความหมายของ type
- ตัวอย่าง: `QueryResult`, `CacheEntry`, `RequestConfig`

### Functions
- ใช้ camelCase
- ขึ้นต้นด้วย verb
- ตัวอย่าง: `fetchData()`, `createCacheEntry()`, `isExpired()`

### Variables
- ใช้ camelCase
- สื่อถึงความหมายชัดเจน
- ตัวอย่าง: `cacheManager`, `httpClient`, `retryConfig`

### Constants
- ใช้ UPPER_SNAKE_CASE
- ตัวอย่าง: `DEFAULT_CACHE_TTL`, `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`
