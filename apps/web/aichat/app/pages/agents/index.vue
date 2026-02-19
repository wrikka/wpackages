<script setup lang="ts">

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const agentStore = useAgentStore()
const isCreateModalOpen = ref(false)
const newAgentName = ref('')
const newAgentDescription = ref('')
const newAgentSystemPrompt = ref('')

// Search, filter, sort
const searchQuery = ref('')
const sortBy = ref<'name' | 'date'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

const filteredAndSortedAgents = computed(() => {
  let agents = [...agentStore.agents]
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    agents = agents.filter(agent => 
      agent.name.toLowerCase().includes(query) ||
      (agent.description && agent.description.toLowerCase().includes(query))
    )
  }
  
  // Sort
  agents.sort((a, b) => {
    if (sortBy.value === 'name') {
      return sortOrder.value === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    } else if (sortBy.value === 'date') {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA
    }
    return 0
  })
  
  return agents
})

onMounted(() => {
  agentStore.fetchAgents()
})

async function createAgent() {
  if (!newAgentName.value.trim()) return
  await agentStore.createAgent({
    name: newAgentName.value,
    description: newAgentDescription.value,
    systemPrompt: newAgentSystemPrompt.value,
  })
  isCreateModalOpen.value = false
  newAgentName.value = ''
  newAgentDescription.value = ''
  newAgentSystemPrompt.value = ''
}

async function deleteAgent(id: string) {
  if (confirm('Are you sure you want to delete this agent?')) {
    await agentStore.deleteAgent(id)
  }
}

</script>

<template>

  <div class="p-4 md:p-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold">Agent Marketplace</h1>
      <button class="btn-primary" @click="isCreateModalOpen = true">Create New Agent</button>
    </div>

    <!-- Search, Filter, Sort Bar -->
    <div class="flex flex-col md:flex-row gap-4 mb-6">
      <div class="flex-1">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search agents..."
          class="input w-full"
        />
      </div>
      <div class="flex gap-2">
        <select v-model="sortBy" class="input">
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Date</option>
        </select>
        <button
          @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
          class="btn-secondary"
          title="Toggle sort order"
        >
          <span :class="sortOrder === 'asc' ? 'i-carbon-sort-ascending' : 'i-carbon-sort-descending'"></span>
        </button>
      </div>
    </div>

    <div v-if="agentStore.isLoading" class="text-center py-8">
      <p>Loading agents...</p>
    </div>

    <div v-else-if="filteredAndSortedAgents.length === 0" class="text-center py-8 text-gray-500">
      <p v-if="agentStore.agents.length === 0">No agents yet. Create your first agent to get started!</p>
      <p v-else>No agents match your search.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="agent in filteredAndSortedAgents"
        :key="agent.id"
        :to="`/agents/${agent.id}`"
        class="relative group"
      >
        <Card hover clickable class="p-4">
          <h2 class="font-bold text-lg">{{ agent.name }}</h2>
          <p class="text-sm text-gray-600 mt-2">{{ agent.description || 'No description' }}</p>
          <div class="mt-3 flex items-center gap-2">
            <span class="badge bg-primary-100 text-primary-800">Agent</span>
          </div>
          <button
            @click.prevent="deleteAgent(agent.id)"
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 btn-icon text-red-500 hover:text-red-700"
            title="Delete Agent"
          >
            <span class="i-carbon-trash-can"></span>
          </button>
        </Card>
      </NuxtLink>
    </div>

    <!-- Create Agent Modal -->
    <UModal v-model="isCreateModalOpen">
      <UCard>
        <template #header>
          <h2 class="text-lg font-bold">Create New Agent</h2>
        
</template>