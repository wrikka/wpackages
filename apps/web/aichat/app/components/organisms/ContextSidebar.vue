<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface ContextSource {
  id: string
  title: string
  content: string
  type: 'document' | 'web' | 'knowledge' | 'code' | 'conversation'
  url?: string
  relevance: number
  timestamp: Date
}

interface ContextSidebarProps {
  isOpen?: boolean
  messageId?: string
  sources?: ContextSource[]
  isStreaming?: boolean
}

const props = withDefaults(defineProps<ContextSidebarProps>(), {
  isOpen: false,
  sources: () => [],
  isStreaming: false
})

const emit = defineEmits<{
  close: []
  'source-click': [source: ContextSource]
  'source-filter': [type: string]
}>()

// State
const activeTab = ref('sources')
const searchQuery = ref('')
const selectedSource = ref<ContextSource | null>(null)
const filterType = ref<string>('all')

// Computed
const filteredSources = computed(() => {
  let filtered = props.sources

  // Filter by type
  if (filterType.value !== 'all') {
    filtered = filtered.filter(source => source.type === filterType.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(source => 
      source.title.toLowerCase().includes(query) ||
      source.content.toLowerCase().includes(query)
    )
  }

  // Sort by relevance
  return filtered.sort((a, b) => b.relevance - a.relevance)
})

const sourceTypes = computed(() => [
  { value: 'all', label: 'All Sources', count: props.sources.length },
  { value: 'document', label: 'Documents', count: props.sources.filter(s => s.type === 'document').length },
  { value: 'web', label: 'Web', count: props.sources.filter(s => s.type === 'web').length },
  { value: 'knowledge', label: 'Knowledge Base', count: props.sources.filter(s => s.type === 'knowledge').length },
  { value: 'code', label: 'Code', count: props.sources.filter(s => s.type === 'code').length },
  { value: 'conversation', label: 'Conversations', count: props.sources.filter(s => s.type === 'conversation').length }
])

const contextSummary = computed(() => {
  const totalSources = props.sources.length
  const highRelevance = props.sources.filter(s => s.relevance > 0.8).length
  const recentSources = props.sources.filter(s => 
    new Date(s.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
  ).length

  return {
    total: totalSources,
    highRelevance,
    recent: recentSources
  }
})

// Methods
const getSourceIcon = (type: string) => {
  const icons = {
    document: 'i-heroicons-document-text',
    web: 'i-heroicons-globe-alt',
    knowledge: 'i-heroicons-academic-cap',
    code: 'i-heroicons-code-bracket',
    conversation: 'i-heroicons-chat-bubble-left-right'
  }
  return icons[type as keyof typeof icons] || 'i-heroicons-document'
}

const getSourceColor = (type: string) => {
  const colors = {
    document: 'blue',
    web: 'green',
    knowledge: 'purple',
    code: 'orange',
    conversation: 'pink'
  }
  return colors[type as keyof typeof colors] || 'gray'
}

const formatRelevance = (relevance: number) => {
  return Math.round(relevance * 100) + '%'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const handleSourceClick = (source: ContextSource) => {
  selectedSource.value = source
  emit('source-click', source)
}

const handleFilterChange = (type: string) => {
  filterType.value = type
  emit('source-filter', type)
}

const truncateContent = (content: string, maxLength: number = 150) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

// Watch for streaming state
watch(() => props.isStreaming, (isStreaming) => {
  if (isStreaming) {
    // Could add animation or loading state here
  }
})
</script>

<template>
  <div class="context-sidebar" :class="{ 'is-open': isOpen }">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-yellow-500" />
          Context & Sources
        </h3>
        <UButton 
          size="sm" 
          color="gray" 
          variant="ghost" 
          @click="emit('close')"
        >
          <UIcon name="i-heroicons-x-mark-20-solid" />
        </UButton>
      </div>

      <!-- Context Summary -->
      <div class="context-summary mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ contextSummary.total }}</div>
            <div class="text-xs text-gray-500">Sources</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ contextSummary.highRelevance }}</div>
            <div class="text-xs text-gray-500">High Relevance</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600">{{ contextSummary.recent }}</div>
            <div class="text-xs text-gray-500">Recent</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="sidebar-tabs">
      <div class="flex border-b">
        <button
          v-for="tab in ['sources', 'analysis']"
          :key="tab"
          class="px-4 py-2 text-sm font-medium capitalize transition-colors"
          :class="{
            'border-b-2 border-blue-500 text-blue-600': activeTab === tab,
            'text-gray-500 hover:text-gray-700': activeTab !== tab
          }"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="sidebar-content">
      <!-- Sources Tab -->
      <div v-if="activeTab === 'sources'" class="sources-tab">
        <!-- Search and Filter -->
        <div class="p-3 border-b space-y-3">
          <UInput
            v-model="searchQuery"
            placeholder="Search sources..."
            icon="i-heroicons-magnifying-glass"
            size="sm"
          />
          
          <div class="flex flex-wrap gap-1">
            <UButton
              v-for="type in sourceTypes"
              :key="type.value"
              :size="'2xs'"
              :color="filterType === type.value ? 'primary' : 'gray'"
              :variant="filterType === type.value ? 'solid' : 'soft'"
              @click="handleFilterChange(type.value)"
            >
              {{ type.label }} ({{ type.count }})
            </UButton>
          </div>
        </div>

        <!-- Sources List -->
        <div class="sources-list">
          <div v-if="filteredSources.length === 0" class="p-4 text-center text-gray-500">
            <UIcon name="i-heroicons-inbox" class="w-8 h-8 mx-auto mb-2 opacity-50" />
            No sources found
          </div>
          
          <div v-else class="space-y-2 p-3">
            <div
              v-for="source in filteredSources"
              :key="source.id"
              class="source-item p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              @click="handleSourceClick(source)"
            >
              <div class="flex items-start gap-3">
                <div class="source-icon flex-shrink-0">
                  <UIcon 
                    :name="getSourceIcon(source.type)" 
                    class="w-5 h-5"
                    :class="`text-${getSourceColor(source.type)}-500`"
                  />
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <h4 class="font-medium text-sm truncate">{{ source.title }}</h4>
                    <span class="text-xs text-gray-500">{{ formatRelevance(source.relevance) }}</span>
                  </div>
                  
                  <p class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {{ truncateContent(source.content) }}
                  </p>
                  
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500">
                      {{ formatDate(source.timestamp) }}
                    </span>
                    <UBadge size="2xs" :color="getSourceColor(source.type)" variant="soft">
                      {{ source.type }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analysis Tab -->
      <div v-if="activeTab === 'analysis'" class="analysis-tab p-4">
        <div class="space-y-4">
          <div class="analysis-section">
            <h4 class="font-medium mb-2 flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
              Source Distribution
            </h4>
            <div class="space-y-2">
              <div
                v-for="type in sourceTypes.slice(1)"
                :key="type.value"
                class="flex items-center justify-between"
              >
                <span class="text-sm">{{ type.label }}</span>
                <div class="flex items-center gap-2">
                  <div class="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full"
                      :class="`bg-${getSourceColor(type.value)}-500`"
                      :style="{ width: `${(type.count / contextSummary.total) * 100}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-500 w-8">{{ type.count }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="analysis-section">
            <h4 class="font-medium mb-2 flex items-center gap-2">
              <UIcon name="i-heroicons-clock" class="w-4 h-4" />
              Recency Analysis
            </h4>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ contextSummary.recent }} of {{ contextSummary.total }} sources are from the last 24 hours
            </div>
          </div>

          <div class="analysis-section">
            <h4 class="font-medium mb-2 flex items-center gap-2">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
              Quality Assessment
            </h4>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ contextSummary.highRelevance }} sources have high relevance (>80% match)
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Source Detail Modal -->
    <UModal v-model="selectedSource" :ui="{ width: 'sm' }">
      <div v-if="selectedSource" class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <UIcon 
            :name="getSourceIcon(selectedSource.type)" 
            class="w-6 h-6"
            :class="`text-${getSourceColor(selectedSource.type)}-500`"
          />
          <div>
            <h3 class="font-semibold">{{ selectedSource.title }}</h3>
            <UBadge size="2xs" :color="getSourceColor(selectedSource.type)" variant="soft">
              {{ selectedSource.type }}
            </UBadge>
          </div>
        </div>
        
        <div class="space-y-3">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ selectedSource.content }}
            </p>
          </div>
          
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>Relevance: {{ formatRelevance(selectedSource.relevance) }}</span>
            <span>{{ formatDate(selectedSource.timestamp) }}</span>
          </div>
          
          <div v-if="selectedSource.url" class="pt-2">
            <UButton 
              :to="selectedSource.url" 
              target="_blank" 
              size="sm" 
              color="primary" 
              variant="soft"
              class="w-full"
            >
              Open Source
            </UButton>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<style scoped>
.context-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 400px;
  background: white;
  border-left: 1px solid rgba(229, 231, 235, 1);
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
  z-index: 40;
  display: flex;
  flex-direction: column;
}

.dark .context-sidebar {
  background: rgba(17, 24, 39, 1);
  border-left-color: rgba(55, 65, 81, 1);
}

.context-sidebar.is-open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(229, 231, 235, 1);
  flex-shrink: 0;
}

.dark .sidebar-header {
  border-bottom-color: rgba(55, 65, 81, 1);
}

.sidebar-tabs {
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.sources-list {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

.source-item {
  transition: all 0.2s ease;
}

.source-item:hover {
  transform: translateX(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.analysis-section {
  padding: 1rem;
  border: 1px solid rgba(229, 231, 235, 1);
  border-radius: 0.5rem;
}

.dark .analysis-section {
  border-color: rgba(55, 65, 81, 1);
}

@media (max-width: 768px) {
  .context-sidebar {
    width: 100vw;
  }
}
</style>
