<script setup lang="ts">


interface SearchResult {
  id: string
  type: 'conversation' | 'message' | 'knowledge_base'
  title?: string
  content: string
  updatedAt: string
}
const isOpen = defineModel<boolean>('modelValue', { default: false })
const query = ref('')
const activeFilter = ref('All')
const results = ref<SearchResult[]>([])
const searching = ref(false)
const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    conversation: 'i-heroicons-chat-bubble-left-right',
    message: 'i-heroicons-chat-bubble-left',
    knowledge_base: 'i-heroicons-document-text',
  }
  return icons[type] || 'i-heroicons-document'
}
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    conversation: 'text-blue-500',
    message: 'text-green-500',
    knowledge_base: 'text-purple-500',
  }
  return colors[type] || 'text-gray-500'
}
const formatDate = (date: string) => new Date(date).toLocaleDateString()
const openResult = (result: SearchResult) => {
  const routes: Record<string, string> = {
    conversation: `/chat/${result.id}`,
    message: `/chat/${result.id}#message`,
    knowledge_base: `/knowledge/${result.id}`,
  }
  navigateTo(routes[result.type] || '/')
  isOpen.value = false
}
const debouncedSearch = useDebounceFn(async () => {
  if (!query.value.trim()) {
    results.value = []
    return
  }
  searching.value = true
  const type = activeFilter.value === 'All' ? undefined : activeFilter.value.toLowerCase()
  results.value = await $fetch<SearchResult[]>('/api/search', {
    query: { q: query.value, type },
  })
  searching.value = false
}, 300)
watch([query, activeFilter], debouncedSearch)
// Keyboard shortcut
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'k') {
      e.preventDefault()
      isOpen.value = true
    }
    if (e.key === 'Escape') {
      isOpen.value = false
    }
  }
  window.addEventListener('keydown', handleKeydown)
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
})

</script>

<template>

  <div class="global-search-modal">
    <UModal v-model="isOpen" :ui="{ width: 'max-w-3xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-magnifying-glass" class="text-xl text-gray-400" />
            <UInput
              v-model="query"
              placeholder="Search conversations, messages, knowledge bases..."
              class="flex-1"
              autofocus
            />
          </div>
        
</template>