import { DataFetcherWebServer } from '../services'
import { FetchAdapter } from '../adapters'

const fetcher = new DataFetcherWebServer(new FetchAdapter({
  baseURL: 'https://api.example.com'
}))

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/api/data') {
      try {
        const result = await fetcher.query({
          queryKey: ['api-data'],
          queryFn: async () => {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts/1')
            return response.json()
          },
          staleTime: 60000
        })

        return new Response(JSON.stringify(result.data), {
          headers: { 'Content-Type': 'application/json' }
        })
      } catch {
        return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }

    if (url.pathname === '/stats') {
      const stats = {
        cacheSize: fetcher.getCacheSize(),
        cleaned: fetcher.cleanupCache()
      }

      return new Response(JSON.stringify(stats), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Data Fetching Service API', {
      headers: { 'Content-Type': 'text/plain' }
    })
  }
})

console.log(`🚀 Server running on http://localhost:${server.port}`)
