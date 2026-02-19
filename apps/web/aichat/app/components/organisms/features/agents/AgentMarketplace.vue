<script setup lang="ts">


interface Agent {
  id: string
  name: string
  description: string
  avatar: string
  creator: string
  rating: number
  reviews: number
  downloads: number
  tags: string[]
  category: string
}
const searchQuery = ref('')
const selectedCategory = ref('all')
const showAgentDetail = ref(false)
const selectedAgent = ref<Agent | null>(null)
const categories = [
  { label: 'All', value: 'all' },
  { label: 'Code', value: 'code' },
  { label: 'Writing', value: 'writing' },
  { label: 'Data', value: 'data' },
  { label: 'Research', value: 'research' }
]
const categoryList = [
  { label: 'Coding', value: 'code' },
  { label: 'Writing', value: 'writing' },
  { label: 'Analysis', value: 'data' },
  { label: 'Creative', value: 'creative' },
  { label: 'Business', value: 'business' }
]
const agents = ref<Agent[]>([
  { id: '1', name: 'Code Reviewer Pro', description: 'Expert code reviewer with focus on best practices and security', avatar: 'https://i.pravatar.cc/150?u=10', creator: 'DevTools Inc', rating: 4.8, reviews: 234, downloads: 1205, tags: ['code', 'review', 'security'], category: 'code' },
  { id: '2', name: 'Creative Writer', description: 'AI assistant for creative writing and storytelling', avatar: 'https://i.pravatar.cc/150?u=11', creator: 'StoryForge', rating: 4.6, reviews: 189, downloads: 892, tags: ['writing', 'creative'], category: 'writing' },
  { id: '3', name: 'Data Analyst', description: 'Analyze and visualize data with natural language', avatar: 'https://i.pravatar.cc/150?u=12', creator: 'DataWiz', rating: 4.9, reviews: 456, downloads: 2103, tags: ['data', 'analysis'], category: 'data' }
])
const trendingAgents = computed(() => agents.value.slice(0, 4))
const myAgents = ref<Agent[]>([
  { id: '4', name: 'My Custom Agent', description: 'My personal agent', avatar: 'https://i.pravatar.cc/150?u=1', creator: 'You', rating: 5.0, reviews: 12, downloads: 45, tags: ['custom'], category: 'custom' }
])
const viewAgent = (agent: Agent) => {
  selectedAgent.value = agent
  showAgentDetail.value = true
}
const createAgent = () => {
  // Navigate to agent creation
}
const editAgent = (agent: Agent) => {
  selectedAgent.value = agent
  showAgentDetail.value = true
}
const viewStats = (agent: Agent) => {
  // Show stats modal
}
const installAgent = (agent: Agent) => {
  // Install logic
  showAgentDetail.value = false
}

</script>

<template>

  <div class="marketplace-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-shopping-bag" class="text-primary" />
        AI Agent Marketplace
      </h3>
      <UBadge color="purple" size="sm">{{ agents.length }} Agents</UBadge>
    </div>

    <div class="panel-content space-y-4">
      <!-- Search & Filter -->
      <div class="search-filter flex gap-2">
        <UInput v-model="searchQuery" icon="i-heroicons-magnifying-glass" placeholder="Search agents..." class="flex-1" />
        <USelect v-model="selectedCategory" :options="categories" placeholder="Category" />
      </div>

      <!-- Trending Agents -->
      <div class="trending-section">
        <p class="text-sm font-medium mb-2">Trending Now</p>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="agent in trendingAgents"
            :key="agent.id"
            class="agent-card p-3 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            @click="viewAgent(agent)"
          >
            <div class="flex items-start gap-2">
              <UAvatar :src="agent.avatar" size="md" />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ agent.name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ agent.creator }}</p>
                <div class="flex items-center gap-1 mt-1">
                  <UIcon name="i-heroicons-star" class="text-yellow-500 w-3 h-3" />
                  <span class="text-xs">{{ agent.rating }}</span>
                  <span class="text-xs text-gray-400">({{ agent.downloads }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div class="categories-section">
        <p class="text-sm font-medium mb-2">Browse by Category</p>
        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="cat in categoryList"
            :key="cat.value"
            size="xs"
            :color="selectedCategory === cat.value ? 'primary' : 'gray'"
            variant="soft"
            @click="selectedCategory = cat.value"
          >
            {{ cat.label }}
          </UButton>
        </div>
      </div>

      <!-- My Agents -->
      <div class="my-agents">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-medium">My Published Agents</p>
          <UButton size="xs" color="primary" variant="soft" icon="i-heroicons-plus" @click="createAgent">
            Publish
          </UButton>
        </div>
        <div class="space-y-2">
          <div
            v-for="agent in myAgents"
            :key="agent.id"
            class="my-agent-item flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <UAvatar :src="agent.avatar" size="sm" />
              <div>
                <p class="font-medium text-sm">{{ agent.name }}</p>
                <p class="text-xs text-gray-500">{{ agent.downloads }} downloads</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-pencil" @click="editAgent(agent)" />
              <UButton size="xs" color="gray" variant="ghost" icon="i-heroicons-chart-bar" @click="viewStats(agent)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent Detail Modal -->
    <UModal v-model="showAgentDetail" :ui="{ width: 'lg' }">
      <UCard v-if="selectedAgent">
        <template #header>
          <div class="flex items-start gap-3">
            <UAvatar :src="selectedAgent.avatar" size="lg" />
            <div class="flex-1">
              <h3 class="text-lg font-semibold">{{ selectedAgent.name }}</h3>
              <p class="text-sm text-gray-500">by {{ selectedAgent.creator }}</p>
              <div class="flex items-center gap-2 mt-1">
                <UBadge v-for="tag in selectedAgent.tags" :key="tag" size="xs" color="gray">{{ tag }}</UBadge>
              </div>
            </div>
          </div>
        
</template>

<style scoped>

.marketplace-panel {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}

</style>