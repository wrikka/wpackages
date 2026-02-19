import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // You can specify test files here, but we will run usage examples instead
    include: ['src/**/*.usage.ts'],
  },
})
