#!/usr/bin/env bun

import { DataFetcher } from '../services'
import { FetchAdapter } from '../adapters'

const fetcher = new DataFetcher(new FetchAdapter())

const commands: Record<string, () => Promise<void>> = {
  async clear() {
    fetcher.clearCache()
    console.log('✅ Cache cleared')
  },

  async stats() {
    const size = fetcher.getCacheSize()
    const cleaned = fetcher.cleanupCache()
    console.log(`📊 Cache Statistics:`)
    console.log(`   Size: ${size} entries`)
    console.log(`   Cleaned: ${cleaned} expired entries`)
  },

  async test() {
    try {
      const result = await fetcher.query({
        queryKey: ['test'],
        queryFn: async () => {
          await new Promise(resolve => setTimeout(resolve, 1000))
          return { message: 'Hello from cache!', timestamp: Date.now() }
        },
        staleTime: 5000
      })

      console.log('✅ Test query result:', result.data)
    } catch (error) {
      console.error('❌ Test query failed:', error)
    }
  }
}

const command = process.argv[2]

if (!command) {
  console.log(`
Usage: bun run data-fetching <command>

Commands:
  clear     - Clear cache
  stats     - Show cache statistics  
  test      - Run test query
`)
  process.exit(1)
}

if (command in commands) {
  commands[command]!()
} else {
  console.error(`Unknown command: ${command}`)
  process.exit(1)
}
