export default defineEventHandler(async (event) => {
  const containers = [
    {
      id: 'a1b2c3d4e5f6',
      name: 'dev-postgres-db',
      image: 'postgres:15',
      status: 'running',
      ports: '5432:5432'
    },
    {
      id: 'f6e5d4c3b2a1',
      name: 'dev-redis-cache',
      image: 'redis:7',
      status: 'running',
      ports: '6379:6379'
    },
    {
      id: 'abcdef123456',
      name: 'admin-tool',
      image: 'pgadmin4',
      status: 'exited',
      ports: '8080:80'
    }
  ]

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 600))

  return containers
})
