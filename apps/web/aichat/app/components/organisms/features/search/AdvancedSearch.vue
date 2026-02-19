<script setup lang="ts">

import type { SearchFilters, SearchResult } from '~/shared/types/search'

const props = defineProps<{
  results: SearchResult[]
  isSearching: boolean
}>()
const emit = defineEmits<{
  search: [query: string, filters: SearchFilters]
  selectResult: [result: SearchResult]
  clear: []
}>()
const query = ref('')
const showFilters = ref(false)
const filters = ref<SearchFilters>({
  dateRange: undefined,
  models: [],
  messageType: 'both',
})
const dateRanges = [
  { label: 'Today', days: 1 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last year', days: 365 },
]
function executeSearch() {
  emit('search', query.value, filters.value)
}
function setDateRange(days: number) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  filters.value.dateRange = { from, to }
  executeSearch()
}

</script>

<template>

  <div class="advanced-search">
    <div class="search-input-wrapper flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
      <span class="i-carbon-search text-gray-500"></span>
      <input
        v-model="query"
        type="text"
        placeholder="Search conversations..."
        class="flex-1 bg-transparent outline-none"
        @keyup.enter="executeSearch"
      >
      <button
        class="btn-icon"
        :class="showFilters ? 'text-primary-500' : ''"
        @click="showFilters = !showFilters"
      >
        <span class="i-carbon-filter"></span>
      </button>
      <button
        v-if="query"
        class="btn-icon"
        @click="query = ''; emit('clear')"
      >
        <span class="i-carbon-close"></span>
      </button>
    </div>
    
    <div v-if="showFilters" class="search-filters p-3 border-b border-gray-200 dark:border-gray-700 space-y-3">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="range in dateRanges"
          :key="range.days"
          class="btn-secondary text-xs"
          @click="setDateRange(range.days)"
        >
          {{ range.label }}
        </button>
      </div>
      
      <div class="flex gap-4">
        <label class="flex items-center gap-2 text-sm">
          <input v-model="filters.messageType" type="radio" value="user">
          <span>User only</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="filters.messageType" type="radio" value="assistant">
          <span>Assistant only</span>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="filters.messageType" type="radio" value="both">
          <span>Both</span>
        </label>
      </div>
    </div>
    
    <div v-if="isSearching" class="p-4 text-center">
      <div class="animate-spin i-carbon-rotate-clockwise w-6 h-6 mx-auto"></div>
    </div>
    
    <div v-else-if="results.length > 0" class="search-results max-h-96 overflow-y-auto">
      <div
        v-for="result in results"
        :key="result.id"
        class="search-result p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800"
        @click="emit('selectResult', result)"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="badge text-xs" :class="result.type === 'session' ? 'bg-blue-100' : 'bg-green-100'">
            {{ result.type }}
          </span>
          <span class="text-xs text-gray-500">{{ new Date(result.createdAt).toLocaleDateString() }}</span>
        </div>
        <p class="text-sm font-medium mb-1">{{ result.title || 'Untitled' }}</p>
        <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2" v-html="result.highlightedContent"></p>
      </div>
    </div>
    
    <div v-else-if="query && !isSearching" class="p-4 text-center text-gray-500">
      No results found
    </div>
  </div>

</template>