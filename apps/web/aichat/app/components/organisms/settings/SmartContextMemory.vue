<script setup lang="ts">


interface Memory {
  id: string
  type: 'preference' | 'fact' | 'project' | 'contact'
  content: string
  timestamp: Date
}
const enabled = ref(false)
const showAddMemory = ref(false)
const categories = ref({
  preferences: true,
  facts: true,
  projects: true,
  contacts: false
})
const memoryTypes = [
  { label: 'Preference', value: 'preference' },
  { label: 'Fact', value: 'fact' },
  { label: 'Project', value: 'project' },
  { label: 'Contact', value: 'contact' }
]
const newMemory = ref({
  type: 'preference',
  content: ''
})
const recentMemories = ref<Memory[]>([
  { id: '1', type: 'preference', content: 'User prefers concise explanations with code examples', timestamp: new Date(Date.now() - 86400000) },
  { id: '2', type: 'fact', content: 'Working on React migration project', timestamp: new Date(Date.now() - 172800000) },
  { id: '3', type: 'project', content: 'Building AI dashboard with Vue.js', timestamp: new Date(Date.now() - 259200000) }
])
const getMemoryIcon = (type: string) => {
  const icons: Record<string, string> = {
    preference: 'i-heroicons-heart',
    fact: 'i-heroicons-light-bulb',
    project: 'i-heroicons-briefcase',
    contact: 'i-heroicons-user'
  }
  return icons[type] || 'i-heroicons-document'
}
const formatDate = (date: Date) => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - Date.now()) / 86400000),
    'day'
  )
}
const addMemory = () => {
  if (!newMemory.value.content.trim()) return
  recentMemories.value.unshift({
    id: Date.now().toString(),
    type: newMemory.value.type as Memory['type'],
    content: newMemory.value.content,
    timestamp: new Date()
  })
  newMemory.value.content = ''
  showAddMemory.value = false
}
const removeMemory = (id: string) => {
  recentMemories.value = recentMemories.value.filter(m => m.id !== id)
}
const clearAllMemories = () => {
  recentMemories.value = []
}

</script>

<template>

  <div class="context-memory-panel">
    <div class="panel-header">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-heroicons-brain" class="text-primary" />
        Smart Context Memory
      </h3>
      <UBadge v-if="enabled" color="green" size="sm">Active</UBadge>
    </div>

    <div class="panel-content space-y-4">
      <div class="memory-toggle flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <p class="font-medium">Enable Long-term Memory</p>
          <p class="text-sm text-gray-500">AI remembers context across sessions</p>
        </div>
        <UToggle v-model="enabled" />
      </div>

      <div v-if="enabled" class="memory-categories space-y-2">
        <p class="text-sm font-medium">Memory Categories</p>
        <div class="grid grid-cols-2 gap-2">
          <UCheckbox v-model="categories.preferences" label="Preferences" />
          <UCheckbox v-model="categories.facts" label="Facts" />
          <UCheckbox v-model="categories.projects" label="Projects" />
          <UCheckbox v-model="categories.contacts" label="Contacts" />
        </div>
      </div>

      <div v-if="enabled" class="memory-insights">
        <p class="text-sm font-medium mb-2">Recent Memories</p>
        <div class="space-y-2">
          <div
            v-for="memory in recentMemories"
            :key="memory.id"
            class="memory-item p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start gap-2"
          >
            <UIcon :name="getMemoryIcon(memory.type)" class="text-gray-400 mt-0.5" />
            <div class="flex-1 min-w-0">
              <p class="text-sm truncate">{{ memory.content }}</p>
              <p class="text-xs text-gray-500">{{ formatDate(memory.timestamp) }}</p>
            </div>
            <UButton
              size="xs"
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="removeMemory(memory.id)"
            />
          </div>
        </div>
      </div>

      <div v-if="enabled" class="memory-actions flex gap-2">
        <UButton size="sm" color="primary" variant="soft" icon="i-heroicons-plus" @click="showAddMemory = true">
          Add Memory
        </UButton>
        <UButton size="sm" color="gray" variant="soft" icon="i-heroicons-trash" @click="clearAllMemories">
          Clear All
        </UButton>
      </div>
    </div>

    <UModal v-model="showAddMemory">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Add Memory</h3>
        
</template>

<style scoped>

.context-memory-panel {
  @apply p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800;
}
.panel-header {
  @apply flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800;
}

</style>